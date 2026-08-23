import express from 'express';
export const instructorRouter = express.Router();

import { instructorSignin } from '../controllers/instructor/instructorController.js';
import { instructorSignup } from '../controllers/instructor/instructorController.js';
import { userMiddleware } from '../auth/auth.middleware.js';
import { rbac } from '../auth/rbac.js';
import { asyncHandler } from '../lib/asynchandler.js';
import { createQuiz } from '../controllers/instructor/instructorController.js';
import { CourseProgess } from '../controllers/instructor/instructorController.js';
import { quizResults } from '../controllers/instructor/instructorController.js';
import { createSection } from '../controllers/instructor/instructorController.js';
import { createLesson } from '../controllers/instructor/instructorController.js';
import { errorHandler } from '../lib/errorHandler.js';
import { rateLimiter } from '../lib/rateLimiter.js';

/**
 * @openapi
 * /instructor/signup:
 *   post:
 *     tags: [Instructor]
 *     summary: Create an instructor account
 *     responses:
 *       200:
 *         description: instructor created
 */
instructorRouter.post('/signup', rateLimiter, asyncHandler(instructorSignup));

/**
 * @openapi
 * /instructor/signin:
 *   post:
 *     tags: [Instructor]
 *     summary: Sign in as instructor
 *     responses:
 *       200:
 *         description: signed in
 */
instructorRouter.post('/signin', rateLimiter, asyncHandler(instructorSignin));

instructorRouter.use(userMiddleware);
instructorRouter.use(rbac('INSTRUCTOR'));
instructorRouter.get('/:userId/courseprogress', asyncHandler(CourseProgess));
instructorRouter.get('/:quizId/quizResults', asyncHandler(quizResults));
instructorRouter.post(
  '/quiz',
  rbac('INSTRUCTOR'),
  asyncHandler(createQuiz),
);

/**
 * @openapi
 * /instructor/sections:
 *   post:
 *     tags: [Instructor]
 *     summary: Create a content folder for a course, optionally nested under another folder
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: folder created
 */
instructorRouter.post('/sections', rbac('INSTRUCTOR'), asyncHandler(createSection));

/**
 * @openapi
 * /instructor/lessons:
 *   post:
 *     tags: [Instructor]
 *     summary: Add a lecture (with its content url) inside a folder
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: lecture added
 */
instructorRouter.post('/lessons', rbac('INSTRUCTOR'), asyncHandler(createLesson));

// will the error handler triggered ?

instructorRouter.use(errorHandler);
