import type { Payload, TypedUser } from "payload";
export async function AdminOverview({
  payload,
  user,
}: {
  payload: Payload;
  user: TypedUser;
}) {
  const collections = [
    "users",
    "products",
    "orders",
    "registrations",
    "mentorship-requests",
  ] as const;
  const counts = await Promise.all(
    collections.map((collection) =>
      payload.count({ collection, overrideAccess: false, user }),
    ),
  );
  return (
    <section className="pans-admin-overview">
      <h2>Your community, at a glance.</h2>
      <p>
        Manage the website, review submissions, and keep PANS moving. Changes to
        published content appear on the website.
      </p>
      <div className="pans-admin-stats">
        {counts.map((count, i) => (
          <div key={collections[i]}>
            <strong>{count.totalDocs}</strong>
            <span>
              {
                [
                  "Members",
                  "Products",
                  "Orders",
                  "Event registrations",
                  "Mentorship requests",
                ][i]
              }
            </span>
          </div>
        ))}
      </div>
      <a href="/" target="_blank" rel="noreferrer">
        View website
      </a>
      <a href="/admin/globals/home">Edit homepage</a>
      <a href="/admin/globals/settings">Site settings</a>
    </section>
  );
}
