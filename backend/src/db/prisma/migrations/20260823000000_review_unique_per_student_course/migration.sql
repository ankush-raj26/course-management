-- keep only the most recent review per (studentId, courseId) before adding the unique constraint
DELETE FROM "Review" a USING "Review" b
WHERE a."studentId" = b."studentId"
  AND a."courseId" = b."courseId"
  AND a.id < b.id;

-- AddUniqueConstraint
CREATE UNIQUE INDEX "Review_studentId_courseId_key" ON "Review"("studentId", "courseId");
