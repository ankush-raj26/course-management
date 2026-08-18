import express from "express";
export const instructorRouter = express.Router(); 

import { instructorSignin } from "../controllers/instructor/instructorController.js";
import { instructorSignup } from "../controllers/instructor/instructorController.js";
import { userMiddleware } from "../auth/auth.middleware.js";
import { rbac } from "../auth/rbac.js";
import { asyncHandler } from "../lib/asynchandler.js";

import { CourseProgess } from "../controllers/instructor/instructorController.js";
import { quizResults } from "../controllers/instructor/instructorController.js";
import { errorHandler } from "../lib/errorHandler.js";
instructorRouter.post("/signup"  ,asyncHandler(instructorSignup));
instructorRouter.post("/signin", asyncHandler(instructorSignin));

instructorRouter.use(userMiddleware);
instructorRouter.use(rbac('INSTRUCTOR'));
instructorRouter.use("/:userId/courseprogress",asyncHandler(CourseProgess));
instructorRouter.use("/:quizId/quizResults",asyncHandler(quizResults));



// will the error handler triggered ? 




instructorRouter.use(errorHandler);
