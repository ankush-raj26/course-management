import express from 'express';
export const adminRouter = express.Router();
import { adminSignin } from '../controllers/admin/adminController.js';
import { asyncHandler } from '../lib/asynchandler.js';
import { adminSignup } from '../controllers/admin/adminController.js';
import { userMiddleware } from '../auth/auth.middleware.js';
import { rbac } from '../auth/rbac.js';
import { errorHandler } from '../lib/errorHandler.js';
import { rateLimiter } from '../lib/rateLimiter.js';
import { listUsers } from '../controllers/admin/adminController.js';
import { blockUser } from '../controllers/admin/adminController.js';
import { unblockUser } from '../controllers/admin/adminController.js';
import { deleteUser } from '../controllers/admin/adminController.js';
import { allCoursesAdmin } from '../controllers/admin/adminController.js';
import { deleteCourse } from '../controllers/admin/adminController.js';
import { createCategory } from '../controllers/admin/adminController.js';
import { listCategory } from '../controllers/admin/adminController.js';

// admin signup is open for now, have to close it later
adminRouter.post('/signup', rateLimiter, asyncHandler(adminSignup));
adminRouter.post('/signin', rateLimiter, asyncHandler(adminSignin));

adminRouter.use(userMiddleware);
adminRouter.use(rbac('ADMIN'));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users, 10 at a time. send skip in the query to page through
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: one page of users
 */
adminRouter.get('/users', asyncHandler(listUsers));

/**
 * @openapi
 * /admin/users/{userId}/block:
 *   put:
 *     tags: [Admin]
 *     summary: Block a user so they cant use the platform
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: user blocked
 */
adminRouter.put('/users/:userId/block', asyncHandler(blockUser));

/**
 * @openapi
 * /admin/users/{userId}/unblock:
 *   put:
 *     tags: [Admin]
 *     summary: Unblock a user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: user unblocked
 */
adminRouter.put('/users/:userId/unblock', asyncHandler(unblockUser));

/**
 * @openapi
 * /admin/users/{userId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Soft delete a user (keeps the row, just marks isDeleted)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: user deleted
 */
adminRouter.delete('/users/:userId', asyncHandler(deleteUser));

/**
 * @openapi
 * /admin/courses:
 *   get:
 *     tags: [Admin]
 *     summary: List all courses including PRIVATE ones, 10 at a time
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: one page of courses
 */
adminRouter.get('/courses', asyncHandler(allCoursesAdmin));

/**
 * @openapi
 * /admin/courses/{courseId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a course
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: course deleted
 */
adminRouter.delete('/courses/:courseId', asyncHandler(deleteCourse));

/**
 * @openapi
 * /admin/category:
 *   post:
 *     tags: [Admin]
 *     summary: Create a category, courses need one of these to exist first
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: category created
 *   get:
 *     tags: [Admin]
 *     summary: List all categories
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: all categories
 */
adminRouter.post('/category', asyncHandler(createCategory));
adminRouter.get('/category', asyncHandler(listCategory));

adminRouter.use(errorHandler);
