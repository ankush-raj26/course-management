import express from 'express';
export const courseRouter = express.Router();
import { userMiddleware } from '../auth/auth.middleware.js';
import { rbac } from '../auth/rbac.js';
import type { Response } from 'express';
import { asyncHandler } from '../lib/asynchandler.js';
import { allCourses } from '../controllers/course/course.controller.js';
import { errorHandler } from '../lib/errorHandler.js';
import { createCourse } from '../controllers/course/course.controller.js';
import { publishCourse } from '../controllers/course/course.controller.js';
import { getCourse } from '../controllers/course/course.controller.js';
import { myCoursesInstructor } from '../controllers/course/course.controller.js';
import { courseReviews } from '../controllers/course/course.controller.js';
import { getQuiz } from '../controllers/course/course.controller.js';

/**
 * @openapi
 * /course:
 *   get:
 *     tags: [Course]
 *     summary: Course list, 10 at a time. send skip in the body to get the next page
 *     responses:
 *       200:
 *         description: one page of courses
 */
courseRouter.get('/', asyncHandler(allCourses));

/**
 * @openapi
 * /course/mine:
 *   get:
 *     tags: [Course]
 *     summary: Courses the logged in instructor created, PRIVATE ones included
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: instructor's own courses
 */
// this needs to be registered before /:courseId, otherwise express would try to
// read "mine" as a courseId
courseRouter.get('/mine', userMiddleware, rbac('INSTRUCTOR'), asyncHandler(myCoursesInstructor));

/**
 * @openapi
 * /course/{courseId}:
 *   get:
 *     tags: [Course]
 *     summary: One course with its category and instructor name
 *     responses:
 *       200:
 *         description: course details
 *       404:
 *         description: course not found
 */
courseRouter.get('/:courseId', asyncHandler(getCourse));

/**
 * @openapi
 * /course/{courseId}/reviews:
 *   get:
 *     tags: [Course]
 *     summary: Reviews left on a course
 *     responses:
 *       200:
 *         description: list of reviews
 */
courseRouter.get('/:courseId/reviews', asyncHandler(courseReviews));

courseRouter.use(userMiddleware);

/**
 * @openapi
 * /course/{courseId}/quiz:
 *   get:
 *     tags: [Course]
 *     summary: Quiz questions for a course, no correct answers included
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: quiz with questions
 *       404:
 *         description: no quiz yet
 */
courseRouter.get('/:courseId/quiz', rbac('STUDENT'), asyncHandler(getQuiz));

/**
 * @openapi
 * /course/create:
 *   post:
 *     tags: [Course]
 *     summary: Instructor creates a course, it starts as PRIVATE
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: course created
 *       403:
 *         description: you are not an instructor
 */
courseRouter.post('/create', rbac('INSTRUCTOR'), asyncHandler(createCourse));

/**
 * @openapi
 * /course/publish:
 *   put:
 *     tags: [Course]
 *     summary: Make a course PUBLIC. instructor can only publish his own one
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: course published
 *       403:
 *         description: not your course
 */
courseRouter.put('/publish', rbac('ADMIN', 'INSTRUCTOR'), asyncHandler(publishCourse));

courseRouter.use(errorHandler);
