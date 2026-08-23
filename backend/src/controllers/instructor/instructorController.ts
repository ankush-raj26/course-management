import { signupType } from '../../lib/typeValidator/signupType.js';
import { signinType } from '../../lib/typeValidator/signinType.js';
import 'dotenv/config';
import { prisma } from '../../index.js';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import type { UserRequest } from '../../types/express.js';
import bcrypt from 'bcrypt';
//import * as z from "zod";
// using the same secret name everywhere so the login middleware can verify every role's token
const student_jwt_secret: string = process.env.student_jwt_secret || 'jwt-secret-1';
export let instructorSignup = async function (req: Request, res: Response): Promise<void> {
  const safe = signupType.safeParse(req.body);

  if (!safe.success) {
    throw new Error(safe?.error?.issues[0]?.message || 'internal server error');
  }
  const hashPass = await bcrypt.hash(req.body?.password, 3);

  // did not put this in the try catch because that will be handled by the async handler
  const userCreated = await prisma.user.create({
    data: {
      name: req.body?.name,
      email: req.body?.email,
      password: hashPass,
      role: 'INSTRUCTOR',
    },
  });

  res.status(200).json({ message: 'user created succesfully', user: userCreated });
  return;
};

export let instructorSignin = async function (req: Request, res: Response): Promise<void> {
  const safe = signinType.safeParse(req.body);
  if (!safe.success) {
    throw new Error(safe?.error?.issues[0]?.message);
  }
  // find if username present
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
      role: 'INSTRUCTOR',
    },
  });

  if (!user) {
    res.status(400).json({ mesage: 'email not found' });
    return;
  }
  // to - do
  // implement refresh and acess token not the single token to secure our site from xss and csrf
  const correctPass = await bcrypt.compare(req.body.password, user.password);
  if (!correctPass) {
    res.status(400).json({ message: 'invalid username or password' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, role: 'INSTRUCTOR', email: user.email },
    student_jwt_secret,
  );
  res.cookie('token', token, {
    httpOnly: true, // js can't get it from the dom
    secure: process.env.NODE_ENV === 'production', // only require https in prod, localhost/tests use plain http
    sameSite: 'strict', // protect's from the csrf
  });

  res.status(200).json({ message: 'signin succesfull' });

  return;
};

export const CourseProgess = async function (req: UserRequest, res: Response): Promise<void> {
  const { userId } = req.params;

  if (typeof userId !== 'string') {
    res.status(400).json({
      message: 'Invalid userId',
    });
    return;
  }

  const studentId = parseInt(userId, 10);

  if (Number.isNaN(studentId)) {
    res.status(400).json({
      message: 'userId must be a valid number',
    });
    return;
  }

  const progressReport = await prisma.progress.findMany({
    where: {
      studentId: studentId,
    },
    include: {
      lesson: {
        include: {
          section: true,
        },
      },
    },
  });

  res.json({
    message: 'Progress report created',
    progressReport,
  });
};

export const quizResults = async function (req: UserRequest, res: Response): Promise<void> {
  const quizId = req.params.quizId;
  if (!quizId) {
    return;
  }
  if (typeof quizId !== 'string') {
    res.status(400).json({
      message: 'Invalid userId',
    });
    return;
  }

  const results = await  prisma.quizAttempt.findMany({
    where: { quizId: parseInt(quizId) },
  });

  res.status(200).json({ message: 'results creatd', results });
  return;
};

export const createQuiz = async function (req: UserRequest, res: Response): Promise<void> {
  // how to handle the questions ?
  // {
  //   "courseId": 10,
  //   "title": "Node.js Basics",
  //   "passPercentage": 60,
  //   "attemptLimit": 3,

  //   "questions": [
  //     {
  //       "question": "What is Node.js?",
  //       "options": [
  //         "JavaScript runtime",
  //         "Database",
  //         "Operating system",
  //         "Browser"
  //       ],
  //       "correctAnswer": 0
  //     }

  //    }

  const { courseId, title, passPercentage, attemptLimit, questions } = req.body;

  const quiz = await prisma.quiz.create({
    data: {
      courseId: courseId,
      title,
      passPercentage: passPercentage,
      attemptLimit,

      questions: {
        create: questions,
      },
    },
  });

  // was missing before, request just used to hang forever without this
  res.status(200).json({ message: 'quiz created', quiz });
  return;
};

// a "folder" in the course content tree. pass parentId to nest it inside another folder
// (e.g. "Week 1" as the parent of "Frontend" / "Backend")
export const createSection = async function (req: UserRequest, res: Response): Promise<void> {
  const { courseId, title, parentId } = req.body;
  if (!req.user?.id) return;
  if (!courseId || !title) {
    res.status(400).json({ message: 'courseId and title are required' });
    return;
  }

  const course = await prisma.course.findFirst({ where: { id: courseId } });
  if (!course) {
    res.status(404).json({ message: 'course not found' });
    return;
  }
  if (course.instructorId !== req.user.id) {
    res.status(403).json({ message: "can't modify another instructor's course" });
    return;
  }

  const section = await prisma.section.create({
    data: {
      courseId,
      title,
      parentId: parentId ?? null,
    },
  });

  res.status(200).json({ message: 'folder created', section });
  return;
};

// a lecture inside a folder, contentUrl is just a link to the video/slides/whatever
export const createLesson = async function (req: UserRequest, res: Response): Promise<void> {
  const { sectionId, title, contentUrl, isReq } = req.body;
  if (!req.user?.id) return;
  if (!sectionId || !title || !contentUrl) {
    res.status(400).json({ message: 'sectionId, title and contentUrl are required' });
    return;
  }

  const section = await prisma.section.findFirst({
    where: { id: sectionId },
    include: { course: true },
  });
  if (!section) {
    res.status(404).json({ message: 'folder not found' });
    return;
  }
  if (section.course.instructorId !== req.user.id) {
    res.status(403).json({ message: "can't modify another instructor's course" });
    return;
  }

  const lesson = await prisma.lesson.create({
    data: {
      sectionId,
      title,
      contentUrl,
      isReq: isReq ?? true,
    },
  });

  res.status(200).json({ message: 'lecture added', lesson });
  return;
};
