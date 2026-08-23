import type { UserRequest } from '../../types/express.js';
import type { Response } from 'express';
import { userMiddleware } from '../../auth/auth.middleware.js';
import { prisma } from '../../index.js';
import { courseType } from '../../lib/typeValidator/courseType.js';
// this is public so comes before the auth  middlewares
export const allCourses = async function (req: UserRequest, res: Response) {
 
  const skip = Number(req.query.skip ?? 0);
  // pagination . only show PUBLIC ones here, PRIVATE courses are for the admin/instructor to see
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLIC' },
    skip: skip,
    take: 10,
    orderBy: { id: 'asc' },
  });
   res.status(200).json({
    courses,
  });
};

// single course with the instructor name and category attached, used on the course details page
export const getCourse = async function (req: UserRequest, res: Response): Promise<void> {
  const { courseId } = req.params;
  if (typeof courseId !== 'string') {
    res.status(400).json({ message: 'invalid courseId' });
    return;
  }

  const course = await prisma.course.findFirst({
    where: { id: parseInt(courseId) },
    include: {
      category: true,
      instructor: { select: { id: true, name: true } },
    },
  });

  if (!course) {
    res.status(404).json({ message: 'course not found' });
    return;
  }

  res.status(200).json({ course });
  return;
};

// instructor's own courses, PRIVATE and PUBLIC both, so they can find the one to publish/manage
export const myCoursesInstructor = async function (
  req: UserRequest,
  res: Response,
): Promise<void> {
  if (!req.user?.id) return;

  const courses = await prisma.course.findMany({
    where: { instructorId: req.user.id },
    orderBy: { id: 'asc' },
  });

  res.status(200).json({ courses });
  return;
};

// reviews for a course, shown on the course details page
export const courseReviews = async function (req: UserRequest, res: Response): Promise<void> {
  const { courseId } = req.params;
  if (typeof courseId !== 'string') {
    res.status(400).json({ message: 'invalid courseId' });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { courseId: parseInt(courseId) },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  res.status(200).json({ reviews });
  return;
};

// quiz questions for a course, correctAnswer is left out so the student cant just read it off the response
export const getQuiz = async function (req: UserRequest, res: Response): Promise<void> {
  const { courseId } = req.params;
  if (typeof courseId !== 'string') {
    res.status(400).json({ message: 'invalid courseId' });
    return;
  }

  const quiz = await prisma.quiz.findFirst({
    where: { courseId: parseInt(courseId) },
    include: {
      questions: {
        select: { id: true, question: true, options: true },
      },
    },
  });

  if (!quiz) {
    res.status(404).json({ message: 'no quiz for this course yet' });
    return;
  }

  res.status(200).json({ quiz });
  return;
};

export const createCourse = async function (req: UserRequest, res: Response): Promise<void> {
  let sucess = courseType.safeParse(req.body);
  if (!sucess.success) {
    throw new Error(sucess.error.issues[0]?.message || 'invalid request');

    return;
  }
  if (!req.user) return;
  // create the course
  const createdCourse = await prisma.course.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      categoryId: parseInt(req.body.categoryId),
      instructorId: req.user?.id,
    },
  });

  res.status(200).json({ course: 'course created sucessfully', createdCourse });
  return;
};

export const publishCourse = async function (req: UserRequest, res: Response): Promise<void> {
  if (!req.body) {
    throw new Error('missing body');
  }
  const { courseId } = req.body;
  if (!courseId) {
    throw new Error('mssing courseId');
  }

  let course;
  if (req.user?.role == 'INSTRUCTOR') {
    // ONE INSTRUCTOR CAN NOT PUBLISH THE COURSE OF ANOTHER INSTRUCTOR
    course = await prisma.course.findFirst({
      where: {
        id: courseId,
      },
    });
    if (!course) {
      throw new Error('course not found');
      return;
    }
    if (course.instructorId != req.user.id) {
      throw new Error("can't modify other courses");
    }
  }

  // now we can publish the course

  let pubCourse = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      status: 'PUBLIC',
    },
  });

  res.status(200).json({ msg: 'course published' });
  return;
};
