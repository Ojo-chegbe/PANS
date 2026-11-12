import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "courses" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_courses_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "lessons" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_lessons_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "resources" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_resources_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "articles" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "opportunities" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_opportunities_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "mentors" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_mentors_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "events" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "leadership" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_leadership_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "albums" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_albums_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "projects" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "pages" ADD COLUMN "review_notes" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_review_notes" varchar;
  ALTER TABLE "home" ADD COLUMN "hero_photo_label" varchar DEFAULT 'UNIVERSITY OF JOS CHAPTER';
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_photo_label" varchar DEFAULT 'UNIVERSITY OF JOS CHAPTER';`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "review_notes";
  ALTER TABLE "_products_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "courses" DROP COLUMN "review_notes";
  ALTER TABLE "_courses_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "lessons" DROP COLUMN "review_notes";
  ALTER TABLE "_lessons_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "resources" DROP COLUMN "review_notes";
  ALTER TABLE "_resources_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "articles" DROP COLUMN "review_notes";
  ALTER TABLE "_articles_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "opportunities" DROP COLUMN "review_notes";
  ALTER TABLE "_opportunities_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "mentors" DROP COLUMN "review_notes";
  ALTER TABLE "_mentors_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "events" DROP COLUMN "review_notes";
  ALTER TABLE "_events_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "leadership" DROP COLUMN "review_notes";
  ALTER TABLE "_leadership_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "albums" DROP COLUMN "review_notes";
  ALTER TABLE "_albums_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "projects" DROP COLUMN "review_notes";
  ALTER TABLE "_projects_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "pages" DROP COLUMN "review_notes";
  ALTER TABLE "_pages_v" DROP COLUMN "version_review_notes";
  ALTER TABLE "home" DROP COLUMN "hero_photo_label";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_photo_label";`);
}
