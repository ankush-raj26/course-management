/*
  Warnings:

  - A unique constraint covering the columns `[email,role]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `instructorId` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_instructorId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "instructorId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_role_key" ON "User"("email", "role");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
