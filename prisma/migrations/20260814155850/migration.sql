/*
  Warnings:

  - A unique constraint covering the columns `[student_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "name" TEXT,
ADD COLUMN     "student_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_student_id_key" ON "users"("student_id");
