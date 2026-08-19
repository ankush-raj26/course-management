import express from 'express';
export const adminRouter = express.Router();
import { adminSignin } from '../controllers/admin/adminController.js';
import { asyncHandler } from '../lib/asynchandler.js';
import { adminSignup } from '../controllers/admin/adminController.js';
import { userMiddleware } from '../auth/auth.middleware.js';
import { errorHandler } from '../lib/errorHandler.js';

// admin signup is open for now, have to close it later
adminRouter.post('/signup', asyncHandler(adminSignup));
adminRouter.post('/signin', asyncHandler(adminSignin));

adminRouter.use(userMiddleware);

adminRouter.use(errorHandler);
