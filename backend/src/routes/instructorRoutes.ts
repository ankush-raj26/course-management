import express from 'express';
export const instructorRouter = express.Router();

import { instructorSignin } from '../controllers/instructor/instructorController.js';
import { instructorSignup } from '../controllers/instructor/instructorController.js';
import { userMiddleware } from '../auth/auth.middleware.js';
import { rbac } from '../auth/rbac.js';
import { asyncHandler } from '../lib/asynchandler.js';

import { CourseProgess } from '../controllers/instructor/instructorController.js';
import { quizResults } from '../controllers/instructor/instructorController.js';
import { errorHandler } from '../lib/errorHandler.js';

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
instructorRouter.post('/signup', asyncHandler(instructorSignup));

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
instructorRouter.post('/signin', asyncHandler(instructorSignin));

instructorRouter.use(userMiddleware);
instructorRouter.use(rbac('INSTRUCTOR'));
instructorRouter.use('/:userId/courseprogress', asyncHandler(CourseProgess));
instructorRouter.use('/:quizId/quizResults', asyncHandler(quizResults));

// will the error handler triggered ?

instructorRouter.use(errorHandler);
