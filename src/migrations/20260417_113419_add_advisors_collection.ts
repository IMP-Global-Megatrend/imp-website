import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "advisors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role_title" varchar NOT NULL,
  	"photo_id" integer,
  	"bio" varchar NOT NULL,
  	"linkedin_url" varchar,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages" ADD COLUMN "about_us_advisory_board_heading" varchar;
  ALTER TABLE "pages" ADD COLUMN "about_us_advisory_board_intro" varchar;
  ALTER TABLE "pages_rels" ADD COLUMN "advisors_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_us_advisory_board_heading" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_us_advisory_board_intro" varchar;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "advisors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "advisors_id" integer;
  ALTER TABLE "advisors" ADD CONSTRAINT "advisors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "advisors_photo_idx" ON "advisors" USING btree ("photo_id");
  CREATE INDEX "advisors_updated_at_idx" ON "advisors" USING btree ("updated_at");
  CREATE INDEX "advisors_created_at_idx" ON "advisors" USING btree ("created_at");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_advisors_fk" FOREIGN KEY ("advisors_id") REFERENCES "public"."advisors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_advisors_fk" FOREIGN KEY ("advisors_id") REFERENCES "public"."advisors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_advisors_fk" FOREIGN KEY ("advisors_id") REFERENCES "public"."advisors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_advisors_id_idx" ON "pages_rels" USING btree ("advisors_id");
  CREATE INDEX "_pages_v_rels_advisors_id_idx" ON "_pages_v_rels" USING btree ("advisors_id");
  CREATE INDEX "payload_locked_documents_rels_advisors_id_idx" ON "payload_locked_documents_rels" USING btree ("advisors_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_advisors_fk";
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_advisors_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_advisors_fk";

  DROP INDEX IF EXISTS "pages_rels_advisors_id_idx";
  DROP INDEX IF EXISTS "_pages_v_rels_advisors_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_advisors_id_idx";

  ALTER TABLE "pages" DROP COLUMN IF EXISTS "about_us_advisory_board_heading";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "about_us_advisory_board_intro";
  ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "advisors_id";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_about_us_advisory_board_heading";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_about_us_advisory_board_intro";
  ALTER TABLE "_pages_v_rels" DROP COLUMN IF EXISTS "advisors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "advisors_id";

  DROP TABLE IF EXISTS "advisors" CASCADE;`)
}
