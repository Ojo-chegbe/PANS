import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'manager', 'mentor', 'contributor', 'student');
  CREATE TYPE "public"."enum_users_level" AS ENUM('100L', '200L', '300L', '400L', '500L', 'Alumni');
  CREATE TYPE "public"."enum_files_visibility" AS ENUM('private', 'members');
  CREATE TYPE "public"."enum_products_type" AS ENUM('digital', 'course', 'physical');
  CREATE TYPE "public"."enum_products_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_type" AS ENUM('digital', 'course', 'physical');
  CREATE TYPE "public"."enum__products_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_courses_delivery" AS ENUM('self-paced', 'live');
  CREATE TYPE "public"."enum_courses_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courses_v_version_delivery" AS ENUM('self-paced', 'live');
  CREATE TYPE "public"."enum__courses_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__courses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_lessons_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_lessons_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lessons_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__lessons_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_resources_level" AS ENUM('100L', '200L', '300L', '400L', '500L', 'Alumni');
  CREATE TYPE "public"."enum_resources_resource_type" AS ENUM('PDF', 'Article', 'Video', 'Website', 'Template', 'Course', 'Opportunity');
  CREATE TYPE "public"."enum_resources_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_resources_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resources_v_version_level" AS ENUM('100L', '200L', '300L', '400L', '500L', 'Alumni');
  CREATE TYPE "public"."enum__resources_v_version_resource_type" AS ENUM('PDF', 'Article', 'Video', 'Website', 'Template', 'Course', 'Opportunity');
  CREATE TYPE "public"."enum__resources_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__resources_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_articles_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_opportunities_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_opportunities_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__opportunities_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__opportunities_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_mentors_availability" AS ENUM('available', 'limited', 'unavailable');
  CREATE TYPE "public"."enum_mentors_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_mentors_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__mentors_v_version_availability" AS ENUM('available', 'limited', 'unavailable');
  CREATE TYPE "public"."enum__mentors_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__mentors_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_mode" AS ENUM('in-person', 'online', 'hybrid');
  CREATE TYPE "public"."enum_events_event_status" AS ENUM('announced', 'upcoming', 'ongoing', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_events_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_mode" AS ENUM('in-person', 'online', 'hybrid');
  CREATE TYPE "public"."enum__events_v_version_event_status" AS ENUM('announced', 'upcoming', 'ongoing', 'completed', 'cancelled');
  CREATE TYPE "public"."enum__events_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_leadership_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_leadership_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__leadership_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__leadership_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_albums_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_albums_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__albums_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__albums_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_review_status" AS ENUM('draft', 'pending', 'changes-requested', 'approved', 'archived');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_orders_items_type" AS ENUM('digital', 'course', 'physical');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'refund-pending', 'refunded', 'cancelled');
  CREATE TYPE "public"."enum_orders_fulfilment" AS ENUM('pending', 'ready-for-collection', 'collected', 'complete', 'needs-attention', 'cancelled');
  CREATE TYPE "public"."enum_registrations_status" AS ENUM('confirmed', 'cancelled');
  CREATE TYPE "public"."enum_mentorship_requests_preferred_type" AS ENUM('Senior student', 'Pharmacist', 'Alumnus', 'No preference');
  CREATE TYPE "public"."enum_mentorship_requests_status" AS ENUM('submitted', 'under-review', 'assigned', 'accepted', 'declined', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_mentor_applications_status" AS ENUM('pending', 'approved', 'declined');
  CREATE TYPE "public"."enum_contributor_applications_status" AS ENUM('pending', 'approved', 'declined');
  CREATE TYPE "public"."enum_contact_messages_category" AS ENUM('General', 'Technical', 'Partnership', 'Mentorship', 'Digital Store', 'Event');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'send-notification');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'send-notification');
  CREATE TYPE "public"."enum_home_sections_kind" AS ENUM('store', 'archive', 'mentorship', 'events', 'about', 'gallery', 'resources', 'articles', 'opportunities');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_sections_kind" AS ENUM('store', 'archive', 'mentorship', 'events', 'about', 'gallery', 'resources', 'articles', 'opportunities');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"level" "enum_users_level",
  	"phone" varchar,
  	"department" varchar DEFAULT 'Pharmacy',
  	"bio" varchar,
  	"photo_id" integer,
  	"membership_verified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"visibility" "enum_files_visibility" DEFAULT 'private' NOT NULL,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"category" varchar,
  	"type" "enum_products_type",
  	"price" numeric,
  	"file_id" integer,
  	"course_id" integer,
  	"stock" numeric DEFAULT 0,
  	"featured" boolean,
  	"display_order" numeric DEFAULT 0,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_products_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"sales_open" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_category" varchar,
  	"version_type" "enum__products_v_version_type",
  	"version_price" numeric,
  	"version_file_id" integer,
  	"version_course_id" integer,
  	"version_stock" numeric DEFAULT 0,
  	"version_featured" boolean,
  	"version_display_order" numeric DEFAULT 0,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__products_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_sales_open" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "courses_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"category" varchar,
  	"instructor" varchar,
  	"delivery" "enum_courses_delivery" DEFAULT 'self-paced',
  	"is_free" boolean DEFAULT false,
  	"duration" varchar,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_courses_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_courses_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_courses_v_version_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_category" varchar,
  	"version_instructor" varchar,
  	"version_delivery" "enum__courses_v_version_delivery" DEFAULT 'self-paced',
  	"version_is_free" boolean DEFAULT false,
  	"version_duration" varchar,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__courses_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__courses_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "lessons_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer
  );
  
  CREATE TABLE "lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"course_id" integer,
  	"module" varchar,
  	"position" numeric DEFAULT 0,
  	"preview" boolean DEFAULT false,
  	"content" jsonb,
  	"video_u_r_l" varchar,
  	"owner_id" integer,
  	"review_status" "enum_lessons_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"video_file_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_lessons_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_lessons_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lessons_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_course_id" integer,
  	"version_module" varchar,
  	"version_position" numeric DEFAULT 0,
  	"version_preview" boolean DEFAULT false,
  	"version_content" jsonb,
  	"version_video_u_r_l" varchar,
  	"version_owner_id" integer,
  	"version_review_status" "enum__lessons_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_video_file_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__lessons_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "resources_level" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_resources_level",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"category" varchar,
  	"resource_type" "enum_resources_resource_type",
  	"url" varchar,
  	"file_id" integer,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_resources_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_resources_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_resources_v_version_level" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__resources_v_version_level",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_resources_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_category" varchar,
  	"version_resource_type" "enum__resources_v_version_resource_type",
  	"version_url" varchar,
  	"version_file_id" integer,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__resources_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__resources_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"category" varchar,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_articles_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_category" varchar,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__articles_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_articles_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "opportunities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"category" varchar,
  	"organization" varchar,
  	"deadline" timestamp(3) with time zone,
  	"eligibility" varchar,
  	"location" varchar,
  	"url" varchar,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_opportunities_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_opportunities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_opportunities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_category" varchar,
  	"version_organization" varchar,
  	"version_deadline" timestamp(3) with time zone,
  	"version_eligibility" varchar,
  	"version_location" varchar,
  	"version_url" varchar,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__opportunities_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__opportunities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "mentors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"position" varchar,
  	"years_experience" numeric,
  	"availability" "enum_mentors_availability" DEFAULT 'available',
  	"capacity" numeric DEFAULT 5,
  	"linkedin" varchar,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_mentors_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_mentors_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "mentors_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_mentors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_position" varchar,
  	"version_years_experience" numeric,
  	"version_availability" "enum__mentors_v_version_availability" DEFAULT 'available',
  	"version_capacity" numeric DEFAULT 5,
  	"version_linkedin" varchar,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__mentors_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__mentors_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_mentors_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "events_speakers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"position" varchar
  );
  
  CREATE TABLE "events_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"activity" varchar
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"category" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"registration_deadline" timestamp(3) with time zone,
  	"venue" varchar,
  	"mode" "enum_events_mode" DEFAULT 'hybrid',
  	"capacity" numeric,
  	"event_status" "enum_events_event_status" DEFAULT 'announced',
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_events_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_events_v_version_speakers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"position" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"activity" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_category" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_registration_deadline" timestamp(3) with time zone,
  	"version_venue" varchar,
  	"version_mode" "enum__events_v_version_mode" DEFAULT 'hybrid',
  	"version_capacity" numeric,
  	"version_event_status" "enum__events_v_version_event_status" DEFAULT 'announced',
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__events_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "leadership_achievements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "leadership_executives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"position" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "leadership" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"session" varchar,
  	"verified" boolean DEFAULT false,
  	"image_id" integer,
  	"president" varchar,
  	"vision" varchar,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_leadership_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_leadership_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_leadership_v_version_achievements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_leadership_v_version_executives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"position" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_leadership_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_session" varchar,
  	"version_verified" boolean DEFAULT false,
  	"version_image_id" integer,
  	"version_president" varchar,
  	"version_vision" varchar,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__leadership_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__leadership_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"event_id" integer,
  	"owner_id" integer,
  	"review_status" "enum_albums_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_albums_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_albums_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_event_id" integer,
  	"version_owner_id" integer,
  	"version_review_status" "enum__albums_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__albums_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "photos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"album_id" integer NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar NOT NULL,
  	"position" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"complete" boolean DEFAULT false
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_projects_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_projects_v_version_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"complete" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__projects_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"content" jsonb,
  	"owner_id" integer,
  	"review_status" "enum_pages_review_status" DEFAULT 'draft',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_content" jsonb,
  	"version_owner_id" integer,
  	"version_review_status" "enum__pages_v_version_review_status" DEFAULT 'draft',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"title" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"type" "enum_orders_items_type",
  	"course_id" integer,
  	"file_id" integer
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"reference" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"total" numeric NOT NULL,
  	"currency" varchar DEFAULT 'NGN',
  	"payment_status" "enum_orders_payment_status" DEFAULT 'pending',
  	"fulfilment" "enum_orders_fulfilment" DEFAULT 'pending',
  	"provider_i_d" varchar,
  	"checkout_u_r_l" varchar,
  	"stock_reserved" boolean DEFAULT false,
  	"reservation_expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entitlements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"key" varchar NOT NULL,
  	"product_id" integer,
  	"course_id" integer,
  	"order_id" integer,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entitlements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"files_id" integer
  );
  
  CREATE TABLE "enrollments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"key" varchar NOT NULL,
  	"course_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"key" varchar NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"key" varchar NOT NULL,
  	"event_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"level" varchar,
  	"department" varchar,
  	"membership" boolean,
  	"status" "enum_registrations_status" DEFAULT 'confirmed',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_interests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"key" varchar NOT NULL,
  	"event_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mentorship_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"level" varchar NOT NULL,
  	"interest" varchar NOT NULL,
  	"career_goal" varchar,
  	"preferred_type" "enum_mentorship_requests_preferred_type",
  	"message" varchar NOT NULL,
  	"requested_mentor_id" integer,
  	"assigned_mentor_id" integer,
  	"status" "enum_mentorship_requests_status" DEFAULT 'submitted',
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mentor_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"name" varchar NOT NULL,
  	"bio" varchar NOT NULL,
  	"expertise" varchar,
  	"position" varchar,
  	"status" "enum_mentor_applications_status" DEFAULT 'pending',
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contributor_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"name" varchar NOT NULL,
  	"bio" varchar NOT NULL,
  	"expertise" varchar,
  	"position" varchar,
  	"status" "enum_contributor_applications_status" DEFAULT 'pending',
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookmarks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"key" varchar NOT NULL,
  	"resource_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"url" varchar,
  	"read_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"category" "enum_contact_messages_category",
  	"message" varchar NOT NULL,
  	"resolved" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"actor_id" integer,
  	"action" varchar NOT NULL,
  	"collection" varchar NOT NULL,
  	"record" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rate_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"count" numeric NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "downloads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"product_id" integer,
  	"resource_id" integer,
  	"file_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "carts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"quantity" numeric NOT NULL
  );
  
  CREATE TABLE "carts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer,
  	"key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"files_id" integer,
  	"products_id" integer,
  	"courses_id" integer,
  	"lessons_id" integer,
  	"resources_id" integer,
  	"articles_id" integer,
  	"opportunities_id" integer,
  	"mentors_id" integer,
  	"events_id" integer,
  	"leadership_id" integer,
  	"albums_id" integer,
  	"photos_id" integer,
  	"projects_id" integer,
  	"pages_id" integer,
  	"orders_id" integer,
  	"entitlements_id" integer,
  	"enrollments_id" integer,
  	"progress_id" integer,
  	"registrations_id" integer,
  	"event_interests_id" integer,
  	"mentorship_requests_id" integer,
  	"mentor_applications_id" integer,
  	"contributor_applications_id" integer,
  	"bookmarks_id" integer,
  	"notifications_id" integer,
  	"contact_messages_id" integer,
  	"audit_log_id" integer,
  	"rate_limits_id" integer,
  	"downloads_id" integer,
  	"carts_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "home_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "home_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_home_sections_kind",
  	"visible" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_store_promos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"price_label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_description" varchar,
  	"hero_image_id" integer,
  	"hero_caption" varchar,
  	"hero_caption_description" varchar,
  	"hero_primary_label" varchar,
  	"hero_primary_u_r_l" varchar,
  	"hero_secondary_label" varchar,
  	"hero_secondary_u_r_l" varchar,
  	"vision" varchar,
  	"mission" varchar,
  	"announcement_visible" boolean DEFAULT false,
  	"announcement_text" varchar,
  	"announcement_url" varchar,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_home_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__home_v_version_sections_kind",
  	"visible" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_store_promos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"price_label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_eyebrow" varchar,
  	"version_hero_title" varchar,
  	"version_hero_description" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_caption" varchar,
  	"version_hero_caption_description" varchar,
  	"version_hero_primary_label" varchar,
  	"version_hero_primary_u_r_l" varchar,
  	"version_hero_secondary_label" varchar,
  	"version_hero_secondary_u_r_l" varchar,
  	"version_vision" varchar,
  	"version_mission" varchar,
  	"version_announcement_visible" boolean DEFAULT false,
  	"version_announcement_text" varchar,
  	"version_announcement_url" varchar,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "settings_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings_footer_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings_footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings_page_intros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"eyebrow" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'PANS Digital Hub' NOT NULL,
  	"description" varchar,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"address" varchar,
  	"footer_description" varchar,
  	"collection_instructions" varchar DEFAULT 'Collect your order from the PANS team on campus. You will be notified when it is ready.',
  	"copyright" varchar DEFAULT 'Pharmaceutical Association of Nigerian Students — University of Jos Chapter',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_settings_v_version_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_footer_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_page_intros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"eyebrow" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'PANS Digital Hub' NOT NULL,
  	"version_description" varchar,
  	"version_contact_email" varchar,
  	"version_contact_phone" varchar,
  	"version_address" varchar,
  	"version_footer_description" varchar,
  	"version_collection_instructions" varchar DEFAULT 'Collect your order from the PANS team on campus. You will be notified when it is ready.',
  	"version_copyright" varchar DEFAULT 'Pharmaceutical Association of Nigerian Students — University of Jos Chapter',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "files" ADD CONSTRAINT "files_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_file_id_files_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_course_id_courses_id_fk" FOREIGN KEY ("version_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_modules" ADD CONSTRAINT "courses_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_version_modules" ADD CONSTRAINT "_courses_v_version_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_parent_id_courses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_attachments" ADD CONSTRAINT "lessons_attachments_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_attachments" ADD CONSTRAINT "lessons_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_video_file_id_files_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v_version_attachments" ADD CONSTRAINT "_lessons_v_version_attachments_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v_version_attachments" ADD CONSTRAINT "_lessons_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_parent_id_lessons_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_version_course_id_courses_id_fk" FOREIGN KEY ("version_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_version_video_file_id_files_id_fk" FOREIGN KEY ("version_video_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources_level" ADD CONSTRAINT "resources_level_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v_version_level" ADD CONSTRAINT "_resources_v_version_level_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_resources_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_parent_id_resources_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_file_id_files_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_texts" ADD CONSTRAINT "articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_texts" ADD CONSTRAINT "_articles_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_parent_id_opportunities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mentors" ADD CONSTRAINT "mentors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mentors" ADD CONSTRAINT "mentors_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mentors_texts" ADD CONSTRAINT "mentors_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_mentors_v" ADD CONSTRAINT "_mentors_v_parent_id_mentors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mentors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_mentors_v" ADD CONSTRAINT "_mentors_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_mentors_v" ADD CONSTRAINT "_mentors_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_mentors_v_texts" ADD CONSTRAINT "_mentors_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_mentors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_speakers" ADD CONSTRAINT "events_speakers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_schedule" ADD CONSTRAINT "events_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_speakers" ADD CONSTRAINT "_events_v_version_speakers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_schedule" ADD CONSTRAINT "_events_v_version_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leadership_achievements" ADD CONSTRAINT "leadership_achievements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leadership"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leadership_executives" ADD CONSTRAINT "leadership_executives_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leadership_executives" ADD CONSTRAINT "leadership_executives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leadership"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leadership" ADD CONSTRAINT "leadership_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leadership" ADD CONSTRAINT "leadership_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_leadership_v_version_achievements" ADD CONSTRAINT "_leadership_v_version_achievements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_leadership_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_leadership_v_version_executives" ADD CONSTRAINT "_leadership_v_version_executives_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_leadership_v_version_executives" ADD CONSTRAINT "_leadership_v_version_executives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_leadership_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_leadership_v" ADD CONSTRAINT "_leadership_v_parent_id_leadership_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."leadership"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_leadership_v" ADD CONSTRAINT "_leadership_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_leadership_v" ADD CONSTRAINT "_leadership_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_parent_id_albums_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_event_id_events_id_fk" FOREIGN KEY ("version_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "photos" ADD CONSTRAINT "photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_milestones" ADD CONSTRAINT "projects_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_milestones" ADD CONSTRAINT "_projects_v_version_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_links_items" ADD CONSTRAINT "pages_blocks_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_links" ADD CONSTRAINT "pages_blocks_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text" ADD CONSTRAINT "_pages_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_links_items" ADD CONSTRAINT "_pages_v_blocks_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_links" ADD CONSTRAINT "_pages_v_blocks_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entitlements_rels" ADD CONSTRAINT "entitlements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entitlements_rels" ADD CONSTRAINT "entitlements_rels_files_fk" FOREIGN KEY ("files_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "progress" ADD CONSTRAINT "progress_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "progress" ADD CONSTRAINT "progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "progress" ADD CONSTRAINT "progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "registrations" ADD CONSTRAINT "registrations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_interests" ADD CONSTRAINT "event_interests_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_interests" ADD CONSTRAINT "event_interests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_requested_mentor_id_mentors_id_fk" FOREIGN KEY ("requested_mentor_id") REFERENCES "public"."mentors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_assigned_mentor_id_users_id_fk" FOREIGN KEY ("assigned_mentor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mentor_applications" ADD CONSTRAINT "mentor_applications_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contributor_applications" ADD CONSTRAINT "contributor_applications_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "downloads" ADD CONSTRAINT "downloads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "downloads" ADD CONSTRAINT "downloads_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "downloads" ADD CONSTRAINT "downloads_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "downloads" ADD CONSTRAINT "downloads_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts" ADD CONSTRAINT "carts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_files_fk" FOREIGN KEY ("files_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opportunities_fk" FOREIGN KEY ("opportunities_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mentors_fk" FOREIGN KEY ("mentors_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leadership_fk" FOREIGN KEY ("leadership_id") REFERENCES "public"."leadership"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photos_fk" FOREIGN KEY ("photos_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entitlements_fk" FOREIGN KEY ("entitlements_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enrollments_fk" FOREIGN KEY ("enrollments_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_progress_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_registrations_fk" FOREIGN KEY ("registrations_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_interests_fk" FOREIGN KEY ("event_interests_id") REFERENCES "public"."event_interests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mentorship_requests_fk" FOREIGN KEY ("mentorship_requests_id") REFERENCES "public"."mentorship_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mentor_applications_fk" FOREIGN KEY ("mentor_applications_id") REFERENCES "public"."mentor_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contributor_applications_fk" FOREIGN KEY ("contributor_applications_id") REFERENCES "public"."contributor_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookmarks_fk" FOREIGN KEY ("bookmarks_id") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rate_limits_fk" FOREIGN KEY ("rate_limits_id") REFERENCES "public"."rate_limits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_downloads_fk" FOREIGN KEY ("downloads_id") REFERENCES "public"."downloads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carts_fk" FOREIGN KEY ("carts_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stats" ADD CONSTRAINT "home_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_pathways" ADD CONSTRAINT "home_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_sections" ADD CONSTRAINT "home_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_store_promos" ADD CONSTRAINT "home_store_promos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_stats" ADD CONSTRAINT "_home_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_pathways" ADD CONSTRAINT "_home_v_version_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_sections" ADD CONSTRAINT "_home_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_store_promos" ADD CONSTRAINT "_home_v_version_store_promos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings_navigation" ADD CONSTRAINT "settings_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_footer_groups_links" ADD CONSTRAINT "settings_footer_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_footer_groups" ADD CONSTRAINT "settings_footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_social_links" ADD CONSTRAINT "settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_page_intros" ADD CONSTRAINT "settings_page_intros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_navigation" ADD CONSTRAINT "_settings_v_version_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_footer_groups_links" ADD CONSTRAINT "_settings_v_version_footer_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v_version_footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_footer_groups" ADD CONSTRAINT "_settings_v_version_footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_social_links" ADD CONSTRAINT "_settings_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_page_intros" ADD CONSTRAINT "_settings_v_version_page_intros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_photo_idx" ON "users" USING btree ("photo_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_owner_idx" ON "media" USING btree ("owner_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "files_owner_idx" ON "files" USING btree ("owner_id");
  CREATE INDEX "files_updated_at_idx" ON "files" USING btree ("updated_at");
  CREATE INDEX "files_created_at_idx" ON "files" USING btree ("created_at");
  CREATE UNIQUE INDEX "files_filename_idx" ON "files" USING btree ("filename");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_image_idx" ON "products" USING btree ("image_id");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category");
  CREATE INDEX "products_file_idx" ON "products" USING btree ("file_id");
  CREATE INDEX "products_course_idx" ON "products" USING btree ("course_id");
  CREATE INDEX "products_owner_idx" ON "products" USING btree ("owner_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_image_idx" ON "_products_v" USING btree ("version_image_id");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category");
  CREATE INDEX "_products_v_version_version_file_idx" ON "_products_v" USING btree ("version_file_id");
  CREATE INDEX "_products_v_version_version_course_idx" ON "_products_v" USING btree ("version_course_id");
  CREATE INDEX "_products_v_version_version_owner_idx" ON "_products_v" USING btree ("version_owner_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX "courses_modules_order_idx" ON "courses_modules" USING btree ("_order");
  CREATE INDEX "courses_modules_parent_id_idx" ON "courses_modules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_image_idx" ON "courses" USING btree ("image_id");
  CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category");
  CREATE INDEX "courses_owner_idx" ON "courses" USING btree ("owner_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses__status_idx" ON "courses" USING btree ("_status");
  CREATE INDEX "_courses_v_version_modules_order_idx" ON "_courses_v_version_modules" USING btree ("_order");
  CREATE INDEX "_courses_v_version_modules_parent_id_idx" ON "_courses_v_version_modules" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_parent_idx" ON "_courses_v" USING btree ("parent_id");
  CREATE INDEX "_courses_v_version_version_slug_idx" ON "_courses_v" USING btree ("version_slug");
  CREATE INDEX "_courses_v_version_version_image_idx" ON "_courses_v" USING btree ("version_image_id");
  CREATE INDEX "_courses_v_version_version_category_idx" ON "_courses_v" USING btree ("version_category");
  CREATE INDEX "_courses_v_version_version_owner_idx" ON "_courses_v" USING btree ("version_owner_id");
  CREATE INDEX "_courses_v_version_version_updated_at_idx" ON "_courses_v" USING btree ("version_updated_at");
  CREATE INDEX "_courses_v_version_version_created_at_idx" ON "_courses_v" USING btree ("version_created_at");
  CREATE INDEX "_courses_v_version_version__status_idx" ON "_courses_v" USING btree ("version__status");
  CREATE INDEX "_courses_v_created_at_idx" ON "_courses_v" USING btree ("created_at");
  CREATE INDEX "_courses_v_updated_at_idx" ON "_courses_v" USING btree ("updated_at");
  CREATE INDEX "_courses_v_latest_idx" ON "_courses_v" USING btree ("latest");
  CREATE INDEX "_courses_v_autosave_idx" ON "_courses_v" USING btree ("autosave");
  CREATE INDEX "lessons_attachments_order_idx" ON "lessons_attachments" USING btree ("_order");
  CREATE INDEX "lessons_attachments_parent_id_idx" ON "lessons_attachments" USING btree ("_parent_id");
  CREATE INDEX "lessons_attachments_file_idx" ON "lessons_attachments" USING btree ("file_id");
  CREATE UNIQUE INDEX "lessons_slug_idx" ON "lessons" USING btree ("slug");
  CREATE INDEX "lessons_course_idx" ON "lessons" USING btree ("course_id");
  CREATE INDEX "lessons_owner_idx" ON "lessons" USING btree ("owner_id");
  CREATE INDEX "lessons_video_file_idx" ON "lessons" USING btree ("video_file_id");
  CREATE INDEX "lessons_updated_at_idx" ON "lessons" USING btree ("updated_at");
  CREATE INDEX "lessons_created_at_idx" ON "lessons" USING btree ("created_at");
  CREATE INDEX "lessons__status_idx" ON "lessons" USING btree ("_status");
  CREATE INDEX "_lessons_v_version_attachments_order_idx" ON "_lessons_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_lessons_v_version_attachments_parent_id_idx" ON "_lessons_v_version_attachments" USING btree ("_parent_id");
  CREATE INDEX "_lessons_v_version_attachments_file_idx" ON "_lessons_v_version_attachments" USING btree ("file_id");
  CREATE INDEX "_lessons_v_parent_idx" ON "_lessons_v" USING btree ("parent_id");
  CREATE INDEX "_lessons_v_version_version_slug_idx" ON "_lessons_v" USING btree ("version_slug");
  CREATE INDEX "_lessons_v_version_version_course_idx" ON "_lessons_v" USING btree ("version_course_id");
  CREATE INDEX "_lessons_v_version_version_owner_idx" ON "_lessons_v" USING btree ("version_owner_id");
  CREATE INDEX "_lessons_v_version_version_video_file_idx" ON "_lessons_v" USING btree ("version_video_file_id");
  CREATE INDEX "_lessons_v_version_version_updated_at_idx" ON "_lessons_v" USING btree ("version_updated_at");
  CREATE INDEX "_lessons_v_version_version_created_at_idx" ON "_lessons_v" USING btree ("version_created_at");
  CREATE INDEX "_lessons_v_version_version__status_idx" ON "_lessons_v" USING btree ("version__status");
  CREATE INDEX "_lessons_v_created_at_idx" ON "_lessons_v" USING btree ("created_at");
  CREATE INDEX "_lessons_v_updated_at_idx" ON "_lessons_v" USING btree ("updated_at");
  CREATE INDEX "_lessons_v_latest_idx" ON "_lessons_v" USING btree ("latest");
  CREATE INDEX "_lessons_v_autosave_idx" ON "_lessons_v" USING btree ("autosave");
  CREATE INDEX "resources_level_order_idx" ON "resources_level" USING btree ("order");
  CREATE INDEX "resources_level_parent_idx" ON "resources_level" USING btree ("parent_id");
  CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");
  CREATE INDEX "resources_image_idx" ON "resources" USING btree ("image_id");
  CREATE INDEX "resources_category_idx" ON "resources" USING btree ("category");
  CREATE INDEX "resources_file_idx" ON "resources" USING btree ("file_id");
  CREATE INDEX "resources_owner_idx" ON "resources" USING btree ("owner_id");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "resources__status_idx" ON "resources" USING btree ("_status");
  CREATE INDEX "_resources_v_version_level_order_idx" ON "_resources_v_version_level" USING btree ("order");
  CREATE INDEX "_resources_v_version_level_parent_idx" ON "_resources_v_version_level" USING btree ("parent_id");
  CREATE INDEX "_resources_v_parent_idx" ON "_resources_v" USING btree ("parent_id");
  CREATE INDEX "_resources_v_version_version_slug_idx" ON "_resources_v" USING btree ("version_slug");
  CREATE INDEX "_resources_v_version_version_image_idx" ON "_resources_v" USING btree ("version_image_id");
  CREATE INDEX "_resources_v_version_version_category_idx" ON "_resources_v" USING btree ("version_category");
  CREATE INDEX "_resources_v_version_version_file_idx" ON "_resources_v" USING btree ("version_file_id");
  CREATE INDEX "_resources_v_version_version_owner_idx" ON "_resources_v" USING btree ("version_owner_id");
  CREATE INDEX "_resources_v_version_version_updated_at_idx" ON "_resources_v" USING btree ("version_updated_at");
  CREATE INDEX "_resources_v_version_version_created_at_idx" ON "_resources_v" USING btree ("version_created_at");
  CREATE INDEX "_resources_v_version_version__status_idx" ON "_resources_v" USING btree ("version__status");
  CREATE INDEX "_resources_v_created_at_idx" ON "_resources_v" USING btree ("created_at");
  CREATE INDEX "_resources_v_updated_at_idx" ON "_resources_v" USING btree ("updated_at");
  CREATE INDEX "_resources_v_latest_idx" ON "_resources_v" USING btree ("latest");
  CREATE INDEX "_resources_v_autosave_idx" ON "_resources_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_image_idx" ON "articles" USING btree ("image_id");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category");
  CREATE INDEX "articles_owner_idx" ON "articles" USING btree ("owner_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_texts_order_parent" ON "articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_image_idx" ON "_articles_v" USING btree ("version_image_id");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category");
  CREATE INDEX "_articles_v_version_version_owner_idx" ON "_articles_v" USING btree ("version_owner_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "_articles_v_texts_order_parent" ON "_articles_v_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "opportunities_slug_idx" ON "opportunities" USING btree ("slug");
  CREATE INDEX "opportunities_category_idx" ON "opportunities" USING btree ("category");
  CREATE INDEX "opportunities_owner_idx" ON "opportunities" USING btree ("owner_id");
  CREATE INDEX "opportunities_updated_at_idx" ON "opportunities" USING btree ("updated_at");
  CREATE INDEX "opportunities_created_at_idx" ON "opportunities" USING btree ("created_at");
  CREATE INDEX "opportunities__status_idx" ON "opportunities" USING btree ("_status");
  CREATE INDEX "_opportunities_v_parent_idx" ON "_opportunities_v" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_version_slug_idx" ON "_opportunities_v" USING btree ("version_slug");
  CREATE INDEX "_opportunities_v_version_version_category_idx" ON "_opportunities_v" USING btree ("version_category");
  CREATE INDEX "_opportunities_v_version_version_owner_idx" ON "_opportunities_v" USING btree ("version_owner_id");
  CREATE INDEX "_opportunities_v_version_version_updated_at_idx" ON "_opportunities_v" USING btree ("version_updated_at");
  CREATE INDEX "_opportunities_v_version_version_created_at_idx" ON "_opportunities_v" USING btree ("version_created_at");
  CREATE INDEX "_opportunities_v_version_version__status_idx" ON "_opportunities_v" USING btree ("version__status");
  CREATE INDEX "_opportunities_v_created_at_idx" ON "_opportunities_v" USING btree ("created_at");
  CREATE INDEX "_opportunities_v_updated_at_idx" ON "_opportunities_v" USING btree ("updated_at");
  CREATE INDEX "_opportunities_v_latest_idx" ON "_opportunities_v" USING btree ("latest");
  CREATE INDEX "_opportunities_v_autosave_idx" ON "_opportunities_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "mentors_slug_idx" ON "mentors" USING btree ("slug");
  CREATE INDEX "mentors_image_idx" ON "mentors" USING btree ("image_id");
  CREATE INDEX "mentors_owner_idx" ON "mentors" USING btree ("owner_id");
  CREATE INDEX "mentors_updated_at_idx" ON "mentors" USING btree ("updated_at");
  CREATE INDEX "mentors_created_at_idx" ON "mentors" USING btree ("created_at");
  CREATE INDEX "mentors__status_idx" ON "mentors" USING btree ("_status");
  CREATE INDEX "mentors_texts_order_parent" ON "mentors_texts" USING btree ("order","parent_id");
  CREATE INDEX "_mentors_v_parent_idx" ON "_mentors_v" USING btree ("parent_id");
  CREATE INDEX "_mentors_v_version_version_slug_idx" ON "_mentors_v" USING btree ("version_slug");
  CREATE INDEX "_mentors_v_version_version_image_idx" ON "_mentors_v" USING btree ("version_image_id");
  CREATE INDEX "_mentors_v_version_version_owner_idx" ON "_mentors_v" USING btree ("version_owner_id");
  CREATE INDEX "_mentors_v_version_version_updated_at_idx" ON "_mentors_v" USING btree ("version_updated_at");
  CREATE INDEX "_mentors_v_version_version_created_at_idx" ON "_mentors_v" USING btree ("version_created_at");
  CREATE INDEX "_mentors_v_version_version__status_idx" ON "_mentors_v" USING btree ("version__status");
  CREATE INDEX "_mentors_v_created_at_idx" ON "_mentors_v" USING btree ("created_at");
  CREATE INDEX "_mentors_v_updated_at_idx" ON "_mentors_v" USING btree ("updated_at");
  CREATE INDEX "_mentors_v_latest_idx" ON "_mentors_v" USING btree ("latest");
  CREATE INDEX "_mentors_v_autosave_idx" ON "_mentors_v" USING btree ("autosave");
  CREATE INDEX "_mentors_v_texts_order_parent" ON "_mentors_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "events_speakers_order_idx" ON "events_speakers" USING btree ("_order");
  CREATE INDEX "events_speakers_parent_id_idx" ON "events_speakers" USING btree ("_parent_id");
  CREATE INDEX "events_schedule_order_idx" ON "events_schedule" USING btree ("_order");
  CREATE INDEX "events_schedule_parent_id_idx" ON "events_schedule" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "events_category_idx" ON "events" USING btree ("category");
  CREATE INDEX "events_owner_idx" ON "events" USING btree ("owner_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "_events_v_version_speakers_order_idx" ON "_events_v_version_speakers" USING btree ("_order");
  CREATE INDEX "_events_v_version_speakers_parent_id_idx" ON "_events_v_version_speakers" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_schedule_order_idx" ON "_events_v_version_schedule" USING btree ("_order");
  CREATE INDEX "_events_v_version_schedule_parent_id_idx" ON "_events_v_version_schedule" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_image_idx" ON "_events_v" USING btree ("version_image_id");
  CREATE INDEX "_events_v_version_version_category_idx" ON "_events_v" USING btree ("version_category");
  CREATE INDEX "_events_v_version_version_owner_idx" ON "_events_v" USING btree ("version_owner_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "leadership_achievements_order_idx" ON "leadership_achievements" USING btree ("_order");
  CREATE INDEX "leadership_achievements_parent_id_idx" ON "leadership_achievements" USING btree ("_parent_id");
  CREATE INDEX "leadership_executives_order_idx" ON "leadership_executives" USING btree ("_order");
  CREATE INDEX "leadership_executives_parent_id_idx" ON "leadership_executives" USING btree ("_parent_id");
  CREATE INDEX "leadership_executives_photo_idx" ON "leadership_executives" USING btree ("photo_id");
  CREATE UNIQUE INDEX "leadership_slug_idx" ON "leadership" USING btree ("slug");
  CREATE UNIQUE INDEX "leadership_session_idx" ON "leadership" USING btree ("session");
  CREATE INDEX "leadership_image_idx" ON "leadership" USING btree ("image_id");
  CREATE INDEX "leadership_owner_idx" ON "leadership" USING btree ("owner_id");
  CREATE INDEX "leadership_updated_at_idx" ON "leadership" USING btree ("updated_at");
  CREATE INDEX "leadership_created_at_idx" ON "leadership" USING btree ("created_at");
  CREATE INDEX "leadership__status_idx" ON "leadership" USING btree ("_status");
  CREATE INDEX "_leadership_v_version_achievements_order_idx" ON "_leadership_v_version_achievements" USING btree ("_order");
  CREATE INDEX "_leadership_v_version_achievements_parent_id_idx" ON "_leadership_v_version_achievements" USING btree ("_parent_id");
  CREATE INDEX "_leadership_v_version_executives_order_idx" ON "_leadership_v_version_executives" USING btree ("_order");
  CREATE INDEX "_leadership_v_version_executives_parent_id_idx" ON "_leadership_v_version_executives" USING btree ("_parent_id");
  CREATE INDEX "_leadership_v_version_executives_photo_idx" ON "_leadership_v_version_executives" USING btree ("photo_id");
  CREATE INDEX "_leadership_v_parent_idx" ON "_leadership_v" USING btree ("parent_id");
  CREATE INDEX "_leadership_v_version_version_slug_idx" ON "_leadership_v" USING btree ("version_slug");
  CREATE INDEX "_leadership_v_version_version_session_idx" ON "_leadership_v" USING btree ("version_session");
  CREATE INDEX "_leadership_v_version_version_image_idx" ON "_leadership_v" USING btree ("version_image_id");
  CREATE INDEX "_leadership_v_version_version_owner_idx" ON "_leadership_v" USING btree ("version_owner_id");
  CREATE INDEX "_leadership_v_version_version_updated_at_idx" ON "_leadership_v" USING btree ("version_updated_at");
  CREATE INDEX "_leadership_v_version_version_created_at_idx" ON "_leadership_v" USING btree ("version_created_at");
  CREATE INDEX "_leadership_v_version_version__status_idx" ON "_leadership_v" USING btree ("version__status");
  CREATE INDEX "_leadership_v_created_at_idx" ON "_leadership_v" USING btree ("created_at");
  CREATE INDEX "_leadership_v_updated_at_idx" ON "_leadership_v" USING btree ("updated_at");
  CREATE INDEX "_leadership_v_latest_idx" ON "_leadership_v" USING btree ("latest");
  CREATE INDEX "_leadership_v_autosave_idx" ON "_leadership_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "albums_slug_idx" ON "albums" USING btree ("slug");
  CREATE INDEX "albums_image_idx" ON "albums" USING btree ("image_id");
  CREATE INDEX "albums_event_idx" ON "albums" USING btree ("event_id");
  CREATE INDEX "albums_owner_idx" ON "albums" USING btree ("owner_id");
  CREATE INDEX "albums_updated_at_idx" ON "albums" USING btree ("updated_at");
  CREATE INDEX "albums_created_at_idx" ON "albums" USING btree ("created_at");
  CREATE INDEX "albums__status_idx" ON "albums" USING btree ("_status");
  CREATE INDEX "_albums_v_parent_idx" ON "_albums_v" USING btree ("parent_id");
  CREATE INDEX "_albums_v_version_version_slug_idx" ON "_albums_v" USING btree ("version_slug");
  CREATE INDEX "_albums_v_version_version_image_idx" ON "_albums_v" USING btree ("version_image_id");
  CREATE INDEX "_albums_v_version_version_event_idx" ON "_albums_v" USING btree ("version_event_id");
  CREATE INDEX "_albums_v_version_version_owner_idx" ON "_albums_v" USING btree ("version_owner_id");
  CREATE INDEX "_albums_v_version_version_updated_at_idx" ON "_albums_v" USING btree ("version_updated_at");
  CREATE INDEX "_albums_v_version_version_created_at_idx" ON "_albums_v" USING btree ("version_created_at");
  CREATE INDEX "_albums_v_version_version__status_idx" ON "_albums_v" USING btree ("version__status");
  CREATE INDEX "_albums_v_created_at_idx" ON "_albums_v" USING btree ("created_at");
  CREATE INDEX "_albums_v_updated_at_idx" ON "_albums_v" USING btree ("updated_at");
  CREATE INDEX "_albums_v_latest_idx" ON "_albums_v" USING btree ("latest");
  CREATE INDEX "_albums_v_autosave_idx" ON "_albums_v" USING btree ("autosave");
  CREATE INDEX "photos_album_idx" ON "photos" USING btree ("album_id");
  CREATE INDEX "photos_image_idx" ON "photos" USING btree ("image_id");
  CREATE INDEX "photos_updated_at_idx" ON "photos" USING btree ("updated_at");
  CREATE INDEX "photos_created_at_idx" ON "photos" USING btree ("created_at");
  CREATE INDEX "projects_milestones_order_idx" ON "projects_milestones" USING btree ("_order");
  CREATE INDEX "projects_milestones_parent_id_idx" ON "projects_milestones" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_image_idx" ON "projects" USING btree ("image_id");
  CREATE INDEX "projects_owner_idx" ON "projects" USING btree ("owner_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "_projects_v_version_milestones_order_idx" ON "_projects_v_version_milestones" USING btree ("_order");
  CREATE INDEX "_projects_v_version_milestones_parent_id_idx" ON "_projects_v_version_milestones" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_image_idx" ON "_projects_v" USING btree ("version_image_id");
  CREATE INDEX "_projects_v_version_version_owner_idx" ON "_projects_v" USING btree ("version_owner_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "pages_blocks_links_items_order_idx" ON "pages_blocks_links_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_links_items_parent_id_idx" ON "pages_blocks_links_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_links_order_idx" ON "pages_blocks_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_links_parent_id_idx" ON "pages_blocks_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_links_path_idx" ON "pages_blocks_links" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_owner_idx" ON "pages" USING btree ("owner_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_blocks_text_order_idx" ON "_pages_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_parent_id_idx" ON "_pages_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_path_idx" ON "_pages_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_image_idx" ON "_pages_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_links_items_order_idx" ON "_pages_v_blocks_links_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_links_items_parent_id_idx" ON "_pages_v_blocks_links_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_links_order_idx" ON "_pages_v_blocks_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_links_parent_id_idx" ON "_pages_v_blocks_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_links_path_idx" ON "_pages_v_blocks_links" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_owner_idx" ON "_pages_v" USING btree ("version_owner_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_items_course_idx" ON "orders_items" USING btree ("course_id");
  CREATE INDEX "orders_items_file_idx" ON "orders_items" USING btree ("file_id");
  CREATE INDEX "orders_owner_idx" ON "orders" USING btree ("owner_id");
  CREATE UNIQUE INDEX "orders_reference_idx" ON "orders" USING btree ("reference");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "entitlements_owner_idx" ON "entitlements" USING btree ("owner_id");
  CREATE UNIQUE INDEX "entitlements_key_idx" ON "entitlements" USING btree ("key");
  CREATE INDEX "entitlements_product_idx" ON "entitlements" USING btree ("product_id");
  CREATE INDEX "entitlements_course_idx" ON "entitlements" USING btree ("course_id");
  CREATE INDEX "entitlements_order_idx" ON "entitlements" USING btree ("order_id");
  CREATE INDEX "entitlements_updated_at_idx" ON "entitlements" USING btree ("updated_at");
  CREATE INDEX "entitlements_created_at_idx" ON "entitlements" USING btree ("created_at");
  CREATE INDEX "entitlements_rels_order_idx" ON "entitlements_rels" USING btree ("order");
  CREATE INDEX "entitlements_rels_parent_idx" ON "entitlements_rels" USING btree ("parent_id");
  CREATE INDEX "entitlements_rels_path_idx" ON "entitlements_rels" USING btree ("path");
  CREATE INDEX "entitlements_rels_files_id_idx" ON "entitlements_rels" USING btree ("files_id");
  CREATE INDEX "enrollments_owner_idx" ON "enrollments" USING btree ("owner_id");
  CREATE UNIQUE INDEX "enrollments_key_idx" ON "enrollments" USING btree ("key");
  CREATE INDEX "enrollments_course_idx" ON "enrollments" USING btree ("course_id");
  CREATE INDEX "enrollments_updated_at_idx" ON "enrollments" USING btree ("updated_at");
  CREATE INDEX "enrollments_created_at_idx" ON "enrollments" USING btree ("created_at");
  CREATE INDEX "progress_owner_idx" ON "progress" USING btree ("owner_id");
  CREATE UNIQUE INDEX "progress_key_idx" ON "progress" USING btree ("key");
  CREATE INDEX "progress_lesson_idx" ON "progress" USING btree ("lesson_id");
  CREATE INDEX "progress_course_idx" ON "progress" USING btree ("course_id");
  CREATE INDEX "progress_updated_at_idx" ON "progress" USING btree ("updated_at");
  CREATE INDEX "progress_created_at_idx" ON "progress" USING btree ("created_at");
  CREATE INDEX "registrations_owner_idx" ON "registrations" USING btree ("owner_id");
  CREATE UNIQUE INDEX "registrations_key_idx" ON "registrations" USING btree ("key");
  CREATE INDEX "registrations_event_idx" ON "registrations" USING btree ("event_id");
  CREATE INDEX "registrations_updated_at_idx" ON "registrations" USING btree ("updated_at");
  CREATE INDEX "registrations_created_at_idx" ON "registrations" USING btree ("created_at");
  CREATE INDEX "event_interests_owner_idx" ON "event_interests" USING btree ("owner_id");
  CREATE UNIQUE INDEX "event_interests_key_idx" ON "event_interests" USING btree ("key");
  CREATE INDEX "event_interests_event_idx" ON "event_interests" USING btree ("event_id");
  CREATE INDEX "event_interests_updated_at_idx" ON "event_interests" USING btree ("updated_at");
  CREATE INDEX "event_interests_created_at_idx" ON "event_interests" USING btree ("created_at");
  CREATE INDEX "mentorship_requests_owner_idx" ON "mentorship_requests" USING btree ("owner_id");
  CREATE INDEX "mentorship_requests_requested_mentor_idx" ON "mentorship_requests" USING btree ("requested_mentor_id");
  CREATE INDEX "mentorship_requests_assigned_mentor_idx" ON "mentorship_requests" USING btree ("assigned_mentor_id");
  CREATE INDEX "mentorship_requests_updated_at_idx" ON "mentorship_requests" USING btree ("updated_at");
  CREATE INDEX "mentorship_requests_created_at_idx" ON "mentorship_requests" USING btree ("created_at");
  CREATE INDEX "mentor_applications_owner_idx" ON "mentor_applications" USING btree ("owner_id");
  CREATE INDEX "mentor_applications_updated_at_idx" ON "mentor_applications" USING btree ("updated_at");
  CREATE INDEX "mentor_applications_created_at_idx" ON "mentor_applications" USING btree ("created_at");
  CREATE INDEX "contributor_applications_owner_idx" ON "contributor_applications" USING btree ("owner_id");
  CREATE INDEX "contributor_applications_updated_at_idx" ON "contributor_applications" USING btree ("updated_at");
  CREATE INDEX "contributor_applications_created_at_idx" ON "contributor_applications" USING btree ("created_at");
  CREATE INDEX "bookmarks_owner_idx" ON "bookmarks" USING btree ("owner_id");
  CREATE UNIQUE INDEX "bookmarks_key_idx" ON "bookmarks" USING btree ("key");
  CREATE INDEX "bookmarks_resource_idx" ON "bookmarks" USING btree ("resource_id");
  CREATE INDEX "bookmarks_updated_at_idx" ON "bookmarks" USING btree ("updated_at");
  CREATE INDEX "bookmarks_created_at_idx" ON "bookmarks" USING btree ("created_at");
  CREATE INDEX "notifications_owner_idx" ON "notifications" USING btree ("owner_id");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_id");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("key");
  CREATE INDEX "rate_limits_updated_at_idx" ON "rate_limits" USING btree ("updated_at");
  CREATE INDEX "rate_limits_created_at_idx" ON "rate_limits" USING btree ("created_at");
  CREATE INDEX "downloads_owner_idx" ON "downloads" USING btree ("owner_id");
  CREATE INDEX "downloads_product_idx" ON "downloads" USING btree ("product_id");
  CREATE INDEX "downloads_resource_idx" ON "downloads" USING btree ("resource_id");
  CREATE INDEX "downloads_file_idx" ON "downloads" USING btree ("file_id");
  CREATE INDEX "downloads_updated_at_idx" ON "downloads" USING btree ("updated_at");
  CREATE INDEX "downloads_created_at_idx" ON "downloads" USING btree ("created_at");
  CREATE INDEX "carts_items_order_idx" ON "carts_items" USING btree ("_order");
  CREATE INDEX "carts_items_parent_id_idx" ON "carts_items" USING btree ("_parent_id");
  CREATE INDEX "carts_items_product_idx" ON "carts_items" USING btree ("product_id");
  CREATE INDEX "carts_owner_idx" ON "carts" USING btree ("owner_id");
  CREATE UNIQUE INDEX "carts_key_idx" ON "carts" USING btree ("key");
  CREATE INDEX "carts_updated_at_idx" ON "carts" USING btree ("updated_at");
  CREATE INDEX "carts_created_at_idx" ON "carts" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_files_id_idx" ON "payload_locked_documents_rels" USING btree ("files_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("lessons_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_opportunities_id_idx" ON "payload_locked_documents_rels" USING btree ("opportunities_id");
  CREATE INDEX "payload_locked_documents_rels_mentors_id_idx" ON "payload_locked_documents_rels" USING btree ("mentors_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_leadership_id_idx" ON "payload_locked_documents_rels" USING btree ("leadership_id");
  CREATE INDEX "payload_locked_documents_rels_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("albums_id");
  CREATE INDEX "payload_locked_documents_rels_photos_id_idx" ON "payload_locked_documents_rels" USING btree ("photos_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_entitlements_id_idx" ON "payload_locked_documents_rels" USING btree ("entitlements_id");
  CREATE INDEX "payload_locked_documents_rels_enrollments_id_idx" ON "payload_locked_documents_rels" USING btree ("enrollments_id");
  CREATE INDEX "payload_locked_documents_rels_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("progress_id");
  CREATE INDEX "payload_locked_documents_rels_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("registrations_id");
  CREATE INDEX "payload_locked_documents_rels_event_interests_id_idx" ON "payload_locked_documents_rels" USING btree ("event_interests_id");
  CREATE INDEX "payload_locked_documents_rels_mentorship_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("mentorship_requests_id");
  CREATE INDEX "payload_locked_documents_rels_mentor_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("mentor_applications_id");
  CREATE INDEX "payload_locked_documents_rels_contributor_applications_i_idx" ON "payload_locked_documents_rels" USING btree ("contributor_applications_id");
  CREATE INDEX "payload_locked_documents_rels_bookmarks_id_idx" ON "payload_locked_documents_rels" USING btree ("bookmarks_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_locked_documents_rels_rate_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("rate_limits_id");
  CREATE INDEX "payload_locked_documents_rels_downloads_id_idx" ON "payload_locked_documents_rels" USING btree ("downloads_id");
  CREATE INDEX "payload_locked_documents_rels_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("carts_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_stats_order_idx" ON "home_stats" USING btree ("_order");
  CREATE INDEX "home_stats_parent_id_idx" ON "home_stats" USING btree ("_parent_id");
  CREATE INDEX "home_pathways_order_idx" ON "home_pathways" USING btree ("_order");
  CREATE INDEX "home_pathways_parent_id_idx" ON "home_pathways" USING btree ("_parent_id");
  CREATE INDEX "home_sections_order_idx" ON "home_sections" USING btree ("_order");
  CREATE INDEX "home_sections_parent_id_idx" ON "home_sections" USING btree ("_parent_id");
  CREATE INDEX "home_store_promos_order_idx" ON "home_store_promos" USING btree ("_order");
  CREATE INDEX "home_store_promos_parent_id_idx" ON "home_store_promos" USING btree ("_parent_id");
  CREATE INDEX "home_hero_hero_image_idx" ON "home" USING btree ("hero_image_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "_home_v_version_stats_order_idx" ON "_home_v_version_stats" USING btree ("_order");
  CREATE INDEX "_home_v_version_stats_parent_id_idx" ON "_home_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_pathways_order_idx" ON "_home_v_version_pathways" USING btree ("_order");
  CREATE INDEX "_home_v_version_pathways_parent_id_idx" ON "_home_v_version_pathways" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_sections_order_idx" ON "_home_v_version_sections" USING btree ("_order");
  CREATE INDEX "_home_v_version_sections_parent_id_idx" ON "_home_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_store_promos_order_idx" ON "_home_v_version_store_promos" USING btree ("_order");
  CREATE INDEX "_home_v_version_store_promos_parent_id_idx" ON "_home_v_version_store_promos" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_hero_version_hero_image_idx" ON "_home_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "settings_navigation_order_idx" ON "settings_navigation" USING btree ("_order");
  CREATE INDEX "settings_navigation_parent_id_idx" ON "settings_navigation" USING btree ("_parent_id");
  CREATE INDEX "settings_footer_groups_links_order_idx" ON "settings_footer_groups_links" USING btree ("_order");
  CREATE INDEX "settings_footer_groups_links_parent_id_idx" ON "settings_footer_groups_links" USING btree ("_parent_id");
  CREATE INDEX "settings_footer_groups_order_idx" ON "settings_footer_groups" USING btree ("_order");
  CREATE INDEX "settings_footer_groups_parent_id_idx" ON "settings_footer_groups" USING btree ("_parent_id");
  CREATE INDEX "settings_social_links_order_idx" ON "settings_social_links" USING btree ("_order");
  CREATE INDEX "settings_social_links_parent_id_idx" ON "settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "settings_page_intros_order_idx" ON "settings_page_intros" USING btree ("_order");
  CREATE INDEX "settings_page_intros_parent_id_idx" ON "settings_page_intros" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_navigation_order_idx" ON "_settings_v_version_navigation" USING btree ("_order");
  CREATE INDEX "_settings_v_version_navigation_parent_id_idx" ON "_settings_v_version_navigation" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_footer_groups_links_order_idx" ON "_settings_v_version_footer_groups_links" USING btree ("_order");
  CREATE INDEX "_settings_v_version_footer_groups_links_parent_id_idx" ON "_settings_v_version_footer_groups_links" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_footer_groups_order_idx" ON "_settings_v_version_footer_groups" USING btree ("_order");
  CREATE INDEX "_settings_v_version_footer_groups_parent_id_idx" ON "_settings_v_version_footer_groups" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_social_links_order_idx" ON "_settings_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_settings_v_version_social_links_parent_id_idx" ON "_settings_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_page_intros_order_idx" ON "_settings_v_version_page_intros" USING btree ("_order");
  CREATE INDEX "_settings_v_version_page_intros_parent_id_idx" ON "_settings_v_version_page_intros" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_created_at_idx" ON "_settings_v" USING btree ("created_at");
  CREATE INDEX "_settings_v_updated_at_idx" ON "_settings_v" USING btree ("updated_at");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "files" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "courses_modules" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "_courses_v_version_modules" CASCADE;
  DROP TABLE "_courses_v" CASCADE;
  DROP TABLE "lessons_attachments" CASCADE;
  DROP TABLE "lessons" CASCADE;
  DROP TABLE "_lessons_v_version_attachments" CASCADE;
  DROP TABLE "_lessons_v" CASCADE;
  DROP TABLE "resources_level" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "_resources_v_version_level" CASCADE;
  DROP TABLE "_resources_v" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_texts" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_texts" CASCADE;
  DROP TABLE "opportunities" CASCADE;
  DROP TABLE "_opportunities_v" CASCADE;
  DROP TABLE "mentors" CASCADE;
  DROP TABLE "mentors_texts" CASCADE;
  DROP TABLE "_mentors_v" CASCADE;
  DROP TABLE "_mentors_v_texts" CASCADE;
  DROP TABLE "events_speakers" CASCADE;
  DROP TABLE "events_schedule" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "_events_v_version_speakers" CASCADE;
  DROP TABLE "_events_v_version_schedule" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "leadership_achievements" CASCADE;
  DROP TABLE "leadership_executives" CASCADE;
  DROP TABLE "leadership" CASCADE;
  DROP TABLE "_leadership_v_version_achievements" CASCADE;
  DROP TABLE "_leadership_v_version_executives" CASCADE;
  DROP TABLE "_leadership_v" CASCADE;
  DROP TABLE "albums" CASCADE;
  DROP TABLE "_albums_v" CASCADE;
  DROP TABLE "photos" CASCADE;
  DROP TABLE "projects_milestones" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "_projects_v_version_milestones" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_links_items" CASCADE;
  DROP TABLE "pages_blocks_links" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_blocks_text" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_links_items" CASCADE;
  DROP TABLE "_pages_v_blocks_links" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "entitlements" CASCADE;
  DROP TABLE "entitlements_rels" CASCADE;
  DROP TABLE "enrollments" CASCADE;
  DROP TABLE "progress" CASCADE;
  DROP TABLE "registrations" CASCADE;
  DROP TABLE "event_interests" CASCADE;
  DROP TABLE "mentorship_requests" CASCADE;
  DROP TABLE "mentor_applications" CASCADE;
  DROP TABLE "contributor_applications" CASCADE;
  DROP TABLE "bookmarks" CASCADE;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "rate_limits" CASCADE;
  DROP TABLE "downloads" CASCADE;
  DROP TABLE "carts_items" CASCADE;
  DROP TABLE "carts" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_stats" CASCADE;
  DROP TABLE "home_pathways" CASCADE;
  DROP TABLE "home_sections" CASCADE;
  DROP TABLE "home_store_promos" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "_home_v_version_stats" CASCADE;
  DROP TABLE "_home_v_version_pathways" CASCADE;
  DROP TABLE "_home_v_version_sections" CASCADE;
  DROP TABLE "_home_v_version_store_promos" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "settings_navigation" CASCADE;
  DROP TABLE "settings_footer_groups_links" CASCADE;
  DROP TABLE "settings_footer_groups" CASCADE;
  DROP TABLE "settings_social_links" CASCADE;
  DROP TABLE "settings_page_intros" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "_settings_v_version_navigation" CASCADE;
  DROP TABLE "_settings_v_version_footer_groups_links" CASCADE;
  DROP TABLE "_settings_v_version_footer_groups" CASCADE;
  DROP TABLE "_settings_v_version_social_links" CASCADE;
  DROP TABLE "_settings_v_version_page_intros" CASCADE;
  DROP TABLE "_settings_v" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_level";
  DROP TYPE "public"."enum_files_visibility";
  DROP TYPE "public"."enum_products_type";
  DROP TYPE "public"."enum_products_review_status";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_type";
  DROP TYPE "public"."enum__products_v_version_review_status";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_courses_delivery";
  DROP TYPE "public"."enum_courses_review_status";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum__courses_v_version_delivery";
  DROP TYPE "public"."enum__courses_v_version_review_status";
  DROP TYPE "public"."enum__courses_v_version_status";
  DROP TYPE "public"."enum_lessons_review_status";
  DROP TYPE "public"."enum_lessons_status";
  DROP TYPE "public"."enum__lessons_v_version_review_status";
  DROP TYPE "public"."enum__lessons_v_version_status";
  DROP TYPE "public"."enum_resources_level";
  DROP TYPE "public"."enum_resources_resource_type";
  DROP TYPE "public"."enum_resources_review_status";
  DROP TYPE "public"."enum_resources_status";
  DROP TYPE "public"."enum__resources_v_version_level";
  DROP TYPE "public"."enum__resources_v_version_resource_type";
  DROP TYPE "public"."enum__resources_v_version_review_status";
  DROP TYPE "public"."enum__resources_v_version_status";
  DROP TYPE "public"."enum_articles_review_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_review_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_opportunities_review_status";
  DROP TYPE "public"."enum_opportunities_status";
  DROP TYPE "public"."enum__opportunities_v_version_review_status";
  DROP TYPE "public"."enum__opportunities_v_version_status";
  DROP TYPE "public"."enum_mentors_availability";
  DROP TYPE "public"."enum_mentors_review_status";
  DROP TYPE "public"."enum_mentors_status";
  DROP TYPE "public"."enum__mentors_v_version_availability";
  DROP TYPE "public"."enum__mentors_v_version_review_status";
  DROP TYPE "public"."enum__mentors_v_version_status";
  DROP TYPE "public"."enum_events_mode";
  DROP TYPE "public"."enum_events_event_status";
  DROP TYPE "public"."enum_events_review_status";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_mode";
  DROP TYPE "public"."enum__events_v_version_event_status";
  DROP TYPE "public"."enum__events_v_version_review_status";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_leadership_review_status";
  DROP TYPE "public"."enum_leadership_status";
  DROP TYPE "public"."enum__leadership_v_version_review_status";
  DROP TYPE "public"."enum__leadership_v_version_status";
  DROP TYPE "public"."enum_albums_review_status";
  DROP TYPE "public"."enum_albums_status";
  DROP TYPE "public"."enum__albums_v_version_review_status";
  DROP TYPE "public"."enum__albums_v_version_status";
  DROP TYPE "public"."enum_projects_review_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_review_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_pages_review_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_review_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_orders_items_type";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_fulfilment";
  DROP TYPE "public"."enum_registrations_status";
  DROP TYPE "public"."enum_mentorship_requests_preferred_type";
  DROP TYPE "public"."enum_mentorship_requests_status";
  DROP TYPE "public"."enum_mentor_applications_status";
  DROP TYPE "public"."enum_contributor_applications_status";
  DROP TYPE "public"."enum_contact_messages_category";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_home_sections_kind";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_sections_kind";
  DROP TYPE "public"."enum__home_v_version_status";`);
}
