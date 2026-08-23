import express from 'express';
export const userRouter = express.Router();
import { studentSignin } from '../controllers/student/studentController.js';
import { asyncHandler } from '../lib/asynchandler.js';
import { studentSignup } from '../controllers/student/studentController.js';
import { userMiddleware } from '../auth/auth.middleware.js';
import { errorHandler } from '../lib/errorHandler.js';
import { rbac } from '../auth/rbac.js';
import { CourseProgess } from '../controllers/student/studentController.js';
import { quizResults } from '../controllers/student/studentController.js';
import {enroll} from "../controllers/student/studentController.js"
import { myCourses } from '../controllers/student/studentController.js';
import { completeLesson } from '../controllers/student/studentController.js';
import { submitQuiz } from '../controllers/student/studentController.js';
import { submitRevieww } from '../controllers/student/studentController.js';
import { rateLimiter } from '../lib/rateLimiter.js';
/**
 * @openapi
 * /user/signup:
 *   post:
 *     tags: [Student]
 *     summary: Create a student account
 *     responses:
 *       200:
 *         description: user created
 *       400:
 *         description: zod said the body is wrong
 */
userRouter.post('/signup', rateLimiter, asyncHandler(studentSignup));

/**
 * @openapi
 * /user/signin:
 *   post:
 *     tags: [Student]
 *     summary: Sign in, sets the token cookie
 *     responses:
 *       200:
 *         description: signed in
 *       400:
 *         description: wrong email or password
 */
userRouter.post('/signin', rateLimiter, asyncHandler(studentSignin));

userRouter.use(userMiddleware);

/**
 * @openapi
 * /user/{userId}/courseprog:
 *   get:
 *     tags: [Student]
 *     summary: Lessons this student has finished
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: progress report
 */
userRouter.get('/:userId/courseprog', rbac('STUDENT'), asyncHandler(CourseProgess));
userRouter.get('/quizresults', rbac('STUDENT', 'INSTRUCTOR'), asyncHandler(quizResults));

userRouter.post(
  '/courses/:courseId/enroll',
  rbac('STUDENT'),
  asyncHandler(enroll),
);

userRouter.get(
  '/courses',
  rbac('STUDENT'),
  asyncHandler(myCourses),
);

userRouter.post(
  '/lessons/:lessonId/complete',
  rbac('STUDENT'),
  asyncHandler(completeLesson),
);

userRouter.post(
  '/quiz/submit',
  rbac('STUDENT'),
  asyncHandler(submitQuiz),
);

userRouter.post(
  '/courses/:courseId/review',
  rbac('STUDENT'),
  asyncHandler(submitRevieww),
);



userRouter.use(errorHandler);
