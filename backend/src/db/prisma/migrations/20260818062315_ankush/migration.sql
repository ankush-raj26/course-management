/*
  Warnings:

  - The values [public,private] on the enum `courseStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "courseStatus_new" AS ENUM ('PUBLIC', 'PRIVATE');
ALTER TABLE "Course" ALTER COLUMN "status" TYPE "courseStatus_new" USING ("status"::text::"courseStatus_new");
ALTER TYPE "courseStatus" RENAME TO "courseStatus_old";
ALTER TYPE "courseStatus_new" RENAME TO "courseStatus";
DROP TYPE "public"."courseStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "status" SET DEFAULT 'PRIVATE';
