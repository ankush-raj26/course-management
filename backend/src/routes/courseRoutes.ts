import express from "express";
export const courseRouter = express.Router(); 
import { userMiddleware } from "../auth/auth.middleware.js";
import { rbac } from "../auth/rbac.js";
import type { Response } from "express";
import { asyncHandler } from "../lib/asynchandler.js";
import { allCourses } from "../controllers/course/course.controller.js";
import { errorHandler } from "../lib/errorHandler.js";
import { createCourse } from "../controllers/course/course.controller.js";
import { publishCourse } from "../controllers/course/course.controller.js";

courseRouter.get("/" ,asyncHandler(allCourses) );


courseRouter.use(userMiddleware);

courseRouter.post("/create" , rbac("INSTRUCTOR" ) , asyncHandler(createCourse));
courseRouter.put("/publish", rbac("ADMIN", "INSTRUCTOR"  ) , asyncHandler(publishCourse));


courseRouter.use(errorHandler);
