import type { UserRequest } from '../../types/express.js';
import type { Response } from 'express';
import { userMiddleware } from '../../auth/auth.middleware.js';
import { prisma } from '../../index.js';
import { courseType } from '../../lib/typeValidator/courseType.js';
// this is public so comes before the auth  middlewares
export const allCourses = async function (req: UserRequest, res: Response) {
 
  const skip = Number(req.query.skip ?? 0);
  // pagination .
  const courses = await prisma.course.findMany({
    where: {},
    skip: skip,
    take: 10,
    orderBy: { id: 'asc' },
  });
   res.status(200).json({
    courses,
  });
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
