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
export let adminSignup = async function (req: Request, res: Response): Promise<void> {
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
      role: 'ADMIN',
    },
  });

  res.status(200).json({ message: 'user created succesfully', user: userCreated });
  return;
};

export let adminSignin = async function (req: Request, res: Response): Promise<void> {
  const safe = signinType.safeParse(req.body);
  if (!safe.success) {
    throw new Error(safe?.error?.issues[0]?.message);
  }
  // find if username present
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
      role: 'ADMIN',
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

  const token = jwt.sign({ id: user.id, role: 'ADMIN', email: user.email }, student_jwt_secret);
  res.cookie('token', token, {
    httpOnly: true, // js can't get it from the dom
    secure: true,
    sameSite: 'strict', // protect's from the csrf
  });

  res.status(200).json({ message: 'signin succesfull' });

  return;
};

// fields safe to send back to the client, password hash should never leave the server
const userSafeFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  isBlocked: true,
  isDeleted: true,
  createdAT: true,
} as const;

// list all users, 10 at a time, same pagination as the course list
export const listUsers = async function (req: UserRequest, res: Response): Promise<void> {
  const skip = Number(req.query.skip ?? 0);

  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
    select: userSafeFields,
    skip: skip,
    take: 10,
    orderBy: { id: 'asc' },
  });

  res.status(200).json({ users });
  return;
};

export const blockUser = async function (req: UserRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  if (typeof userId !== 'string') {
    res.status(400).json({ message: 'invalid userId' });
    return;
  }

  const blockedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { isBlocked: true },
    select: userSafeFields,
  });

  res.status(200).json({ message: 'user blocked', blockedUser });
  return;
};

export const unblockUser = async function (req: UserRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  if (typeof userId !== 'string') {
    res.status(400).json({ message: 'invalid userId' });
    return;
  }

  const unblockedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { isBlocked: false },
    select: userSafeFields,
  });

  res.status(200).json({ message: 'user unblocked', unblockedUser });
  return;
};

// not removing the row, just soft delete so we dont lose the course/review history tied to this user
export const deleteUser = async function (req: UserRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  if (typeof userId !== 'string') {
    res.status(400).json({ message: 'invalid userId' });
    return;
  }

  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  res.status(200).json({ message: 'user deleted' });
  return;
};

// unlike /course this one shows PRIVATE courses too, admin needs to see everything
export const allCoursesAdmin = async function (req: UserRequest, res: Response): Promise<void> {
  const skip = Number(req.query.skip ?? 0);

  const courses = await prisma.course.findMany({
    where: {},
    skip: skip,
    take: 10,
    orderBy: { id: 'asc' },
  });

  res.status(200).json({ courses });
  return;
};

export const deleteCourse = async function (req: UserRequest, res: Response): Promise<void> {
  const { courseId } = req.params;
  if (typeof courseId !== 'string') {
    res.status(400).json({ message: 'invalid courseId' });
    return;
  }

  // this can fail if students already enrolled or left a review (fk constraint), that error will
  // just fall through to the errorHandler for now
  await prisma.course.delete({
    where: { id: parseInt(courseId) },
  });

  res.status(200).json({ message: 'course deleted' });
  return;
};

// categories were missing a route entirely, course create needs a categoryId to already exist
export const createCategory = async function (req: UserRequest, res: Response): Promise<void> {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ message: 'title is required' });
    return;
  }

  const category = await prisma.category.create({
    data: { title },
  });

  res.status(200).json({ message: 'category created', category });
  return;
};

export const listCategory = async function (req: UserRequest, res: Response): Promise<void> {
  const categories = await prisma.category.findMany();
  res.status(200).json({ categories });
  return;
};
