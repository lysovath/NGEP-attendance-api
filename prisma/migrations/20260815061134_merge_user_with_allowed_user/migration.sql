/*
  Warnings:

  - You are about to drop the `allowed_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "allowed_users" DROP CONSTRAINT "allowed_users_group_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "clerk_id" DROP NOT NULL;

-- DropTable
DROP TABLE "allowed_users";
