/*
  Warnings:

  - The values [USER] on the enum `Roles` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Roles_new" AS ENUM ('STUDENT', 'ADMIN', 'INSTRUCTOR');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Roles_new" USING ("role"::text::"Roles_new");
ALTER TYPE "Roles" RENAME TO "Roles_old";
ALTER TYPE "Roles_new" RENAME TO "Roles";
DROP TYPE "public"."Roles_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;
