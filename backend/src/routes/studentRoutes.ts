import express from "express"
export const userRouter = express.Router(); 
import { studentSignin } from "../controllers/student/studentController.js";
import { asyncHandler } from "../lib/asynchandler.js";
import { studentSignup } from "../controllers/student/studentController.js";
import { userMiddleware } from "../auth/auth.middleware.js";
import { errorHandler } from "../lib/errorHandler.js";
import { rbac } from "../auth/rbac.js";
import { CourseProgess } from "../controllers/student/studentController.js";
import { quizResults } from "../controllers/student/studentController.js";
userRouter.post("/signup"  ,asyncHandler(studentSignup));
userRouter.post("/signin", asyncHandler(studentSignin));

userRouter.use(userMiddleware);

userRouter.use("/:userId/courseprog",rbac("STUDENT" ),asyncHandler(CourseProgess));
userRouter.use("/quizresults" , rbac("STUDENT","INSTRUCTOR" ) , asyncHandler(quizResults));











userRouter.use(errorHandler);
