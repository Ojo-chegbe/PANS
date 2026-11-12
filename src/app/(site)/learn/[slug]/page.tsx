import Link from "next/link";
import { notFound } from "next/navigation";
import { getCMS, getSession, bySlug, mediaURL } from "@/lib/payload";
import { Body, PageIntro } from "@/components/Content";
import { ActionButton } from "@/components/ActionForm";
import { externalURL } from "@/lib/security";
import { CourseVideo } from "@/components/CourseVideo";
export const metadata = {
  title: "Your learning",
  robots: { index: false, follow: false },
};
export default async function Learn({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const user = await getSession();
  const payload = await getCMS();
  const course = await bySlug("courses", slug);
  if (!course) notFound();
  const outline = await payload.find({
    collection: "lessons",
    where: {
      and: [
        { course: { equals: course.id } },
        { _status: { equals: "published" } },
        { reviewStatus: { equals: "approved" } },
      ],
    },
    sort: "position",
    limit: 300,
    depth: 0,
    overrideAccess: true,
    select: {
      id: true,
      title: true,
      module: true,
      preview: true,
      position: true,
    },
  });
  const selected =
    outline.docs.find((x) => String(x.id) === query.lesson) || outline.docs[0];
  const granted = user
    ? await payload.count({
        collection: "entitlements",
        where: {
          and: [
            { owner: { equals: user.id } },
            { course: { equals: course.id } },
            { active: { equals: true } },
          ],
        },
        overrideAccess: true,
      })
    : { totalDocs: 0 };
  let lesson: any = null;
  if (selected && (selected.preview || granted.totalDocs))
    lesson = await payload.findByID({
      collection: "lessons",
      id: selected.id,
      overrideAccess: false,
      user: user || undefined,
      depth: 1,
    });
  const progress = user
    ? await payload.find({
        collection: "progress",
        where: {
          and: [
            { owner: { equals: user.id } },
            { course: { equals: course.id } },
          ],
        },
        limit: 500,
        depth: 0,
        overrideAccess: false,
        user,
      })
    : { docs: [] };
  const completed = new Set(
    progress.docs.map((x: any) =>
      String(typeof x.lesson === "object" ? x.lesson.id : x.lesson),
    ),
  );
  const currentIndex = outline.docs.findIndex((x) => x.id === selected?.id);
  const next = outline.docs[currentIndex + 1];
  const products = await payload.find({
    collection: "products",
    where: { course: { equals: course.id } },
    limit: 1,
    overrideAccess: false,
  });
  return (
    <div className="wrap page-shell">
      <Link className="back-link" href="/account/courses">
        Your courses
      </Link>
      <div className="learning-layout">
        <aside>
          <p className="section-tag">{course.title}</p>
          {granted.totalDocs > 0 && (
            <p className="form-note">
              {completed.size} of {outline.totalDocs} lessons complete
            </p>
          )}
          <nav className="lesson-nav" aria-label="Course lessons">
            {outline.docs.map((item) => (
              <Link
                key={item.id}
                href={"/learn/" + slug + "?lesson=" + item.id}
                aria-current={item.id === selected?.id ? "page" : undefined}
              >
                {item.title}
                <small>
                  {completed.has(String(item.id))
                    ? "Completed"
                    : item.preview
                      ? "Preview"
                      : item.module || "Lesson"}
                </small>
              </Link>
            ))}
          </nav>
        </aside>
        <article className="lesson-content">
          {lesson ? (
            <>
              <span className="section-tag">
                {lesson.module || course.title}
              </span>
              <h1>{lesson.title}</h1>
              {lesson.videoFile && (
                <CourseVideo source={mediaURL(lesson.videoFile)} refreshable />
              )}
              {!lesson.videoFile && externalURL(lesson.videoURL) && (
                <CourseVideo
                  source={externalURL(lesson.videoURL)!}
                  refreshable={false}
                />
              )}
              <Body data={lesson.content} />
              {lesson.attachments?.length > 0 && (
                <section className="detail-section">
                  <h2>Lesson resources</h2>
                  {lesson.attachments.map((item: any) => (
                    <p key={item.id}>
                      <a className="quiet-link" href={item.file?.url} download>
                        {item.file?.label || "Download attachment"}
                      </a>
                    </p>
                  ))}
                </section>
              )}
              <div className="lesson-actions">
                {granted.totalDocs > 0 ? (
                  completed.has(String(lesson.id)) ? (
                    <span className="inline-status">Lesson complete</span>
                  ) : (
                    <ActionButton
                      action="complete-lesson"
                      data={{ lesson: lesson.id }}
                      className="btn-primary"
                    >
                      Mark as complete
                    </ActionButton>
                  )
                ) : (
                  <span className="form-note">
                    Enrol to save your progress.
                  </span>
                )}
                {next && (
                  <Link
                    className="quiet-link"
                    href={"/learn/" + slug + "?lesson=" + next.id}
                  >
                    Next lesson
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <PageIntro
                title={selected?.title || course.title}
                description={
                  outline.docs.length
                    ? "Enrol in this course to access the lessons and save your progress."
                    : "The course content is being prepared."
                }
              />
              {!user ? (
                <Link
                  className="btn-primary"
                  href={"/sign-in?next=" + encodeURIComponent("/learn/" + slug)}
                >
                  Sign in to continue
                </Link>
              ) : course.isFree ? (
                <ActionButton
                  action="enroll"
                  data={{ course: course.id }}
                  className="btn-primary"
                >
                  Enrol for free
                </ActionButton>
              ) : products.docs[0] ? (
                <Link
                  className="btn-primary"
                  href={"/store/" + products.docs[0].slug}
                >
                  View course and enrol
                </Link>
              ) : null}
            </>
          )}
        </article>
      </div>
    </div>
  );
}
