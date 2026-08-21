-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('THEORY', 'LAB');

-- AlterTable: Session gets a type (THEORY/LAB)
ALTER TABLE "sessions" ADD COLUMN "type" "SessionType" NOT NULL DEFAULT 'THEORY';

-- AlterTable: trainee student_id becomes optional so name+email imports are allowed
ALTER TABLE "trainees" ALTER COLUMN "student_id" DROP NOT NULL;

-- CreateTable: per-date group override (home group stays the default)
CREATE TABLE "group_overrides" (
    "id" SERIAL NOT NULL,
    "trainee_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_overrides_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "sessions_start_time_idx" ON "sessions"("start_time");
CREATE UNIQUE INDEX "group_overrides_trainee_id_date_key" ON "group_overrides"("trainee_id", "date");
CREATE INDEX "group_overrides_date_idx" ON "group_overrides"("date");
CREATE INDEX "group_overrides_group_id_date_idx" ON "group_overrides"("group_id", "date");

-- Foreign keys
ALTER TABLE "group_overrides" ADD CONSTRAINT "group_overrides_trainee_id_fkey" FOREIGN KEY ("trainee_id") REFERENCES "trainees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_overrides" ADD CONSTRAINT "group_overrides_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
