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

courseRouter.use(userMiddleware);

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
