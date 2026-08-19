import { signupType } from '../../lib/typeValidator/signupType.js';
import { signinType } from '../../lib/typeValidator/signinType.js';
import 'dotenv/config';
import { prisma } from '../../index.js';
import jwt from 'jsonwebtoken';
import type { UserRequest } from '../../types/express.js';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { rbac } from '../../auth/rbac.js';
import type { User } from '../../db/generated/prisma/client.js';
//import * as z from "zod";
const student_jwt_secret: string = process.env.student_jwt_secret || 'jwt-secret-1';
export let studentSignup = async function (req: Request, res: Response): Promise<void> {
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
      role: 'STUDENT',
    },
  });

  res.status(200).json({ message: 'user created succesfully', user: userCreated });
  return;
};

export let studentSignin = async function (req: Request, res: Response): Promise<void> {
  const safe = signinType.safeParse(req.body);
  if (!safe.success) {
    throw new Error(safe?.error?.issues[0]?.message);
  }
  // find if username present
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.emaail,
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

  const token = jwt.sign({ id: user.id, role: 'STUDENT', email: user.email }, student_jwt_secret);
  res.cookie('token', token, {
    httpOnly: true, // js can't get it from the dom
    secure: true,
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
  // (optional bcz it can be a feature too ) validate that other user is not trying to see other's progresss
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
  if (!req.user?.id) throw new Error('user id not present');

  const results = prisma.quizAttempt.findMany({
    where: { studentId: req.user?.id },
  });

  res.status(200).json({ message: 'results creatd', results });
  return;
};

export const enroll = async function (req: UserRequest, res: Response): Promise<void> {
  const { courseId } = req.params;
  if (typeof courseId !== 'string') {
    res.json({ message: 'invlaid msg' });
    return;
  }

  if (!req.user?.id) {
    throw new Error('missing token');
    return;
  }

  const enrolled = await prisma.enrollment.create({
    data: {
      courseId: parseInt(courseId),
      studentId: req.user?.id,
    },
  });

  res.status(200).json({ message: 'enrolled in the course' });
  return;
};

export const myCourses = async function (req: UserRequest, res: Response): Promise<void> {
  if (!req.user?.id) return;

  const courses = await prisma.enrollment.findMany({
    where: {
      studentId: req.user?.id,
    },
    include: {
      course: true,
    },
  });
};

export const completeLesson = async function (req: UserRequest, res: Response): Promise<void> {
  const { lessonId } = req.params;
  if (!req.user?.id) return;
  if (typeof lessonId !== 'string') {
    res.json({ message: 'invalid requst' });
    return;
  }
  const markComplete = await prisma.progress.create({
    data: {
      studentId: req.user?.id,
      lessonId: parseInt(lessonId),
    },
  });
  res.json({ message: 'lesson marked as completed' });
  return;
};

export const submitQuiz = async function (req: UserRequest, res: Response): Promise<void> {
  //        {
  //   "courseId": 10,
  //   "answers": [
  //     { "questionId": 1, "answer": 2 },
  //     { "questionId": 2, "answer": 1 },
  //     { "questionId": 3, "answer": 0 }
  //   ]
  // }
  const { courseId, answers } = req.body;

  if (!req.user?.id) return;

  const quizDetails = await prisma.quiz.findFirst({
    where: {
      courseId: courseId,
    },
  });
  let quizId = quizDetails?.id;
  if (!quizId) return;

  if (!quizDetails) return;

  const prevQuizes = await prisma.quizAttempt.findFirst({
    where: {
      studentId: req.user.id,
      quizId: quizId,
    },
  });

  if (prevQuizes?.attemptNo == quizDetails.attemptLimit) {
    res.json({ message: 'max attempt limit ' });
    return;
  }
  const minimarksTopass = quizDetails.passPercentage;
  const answerMap = new Map(
    answers.map((answer: { questionId: number; answer: number }) => [
      answer.questionId,
      answer.answer,
    ]),
  );

  // how to create the score. ?
  // fetch the questions
  const questions = await prisma.question.findMany({
    where: {
      quizId,
    },
  });

  let correctAnswers = 0;

  for (const question of questions) {
    const submittedAnswer = answerMap.get(question.id);

    if (submittedAnswer === question.correctAnswer) {
      correctAnswers++;
    }
  }

  const totalQuestions = questions.length;

  const score = Math.round((correctAnswers / totalQuestions) * 100);
  let passed = false;
  if (score >= minimarksTopass) {
    passed = true;
  }

  const submitted = await prisma.quizAttempt.create({
    data: {
      studentId: req.user.id,
      quizId: quizId,
      score: correctAnswers,
      passed,
    },
  });

  res.json({ submitted });
  return;
};

export const submitRevieww = async function (req: UserRequest, res: Response): Promise<void> {
  const { courseId, comments, rating } = req.body;
  if (!req.user?.id) return;
  const review = await prisma.review.create({
    data: {
      studentId: req.user?.id,
      courseId: courseId,
      comment: comments,
      rating: rating,
    },
  });
  res.json({ message: 'thanks for the review' });
  return;
};
