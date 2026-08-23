import type { NextFunction, Request, Response } from 'express';
import type { UserRequest } from '../types/express.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { prisma } from '../index.js';

type User = {
  id: number;
  role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
  email: string;
};

export const userMiddleware = async function (
  req: UserRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies.token;
  const secret = process.env.student_jwt_secret;

  if (!token) {
    res.status(401).json({ message: 'invalid request' });
    return;
  }

  if (!secret) {
    throw new Error('jwt secret missing');
  }

  let user;
  try {
    const decoded = jwt.verify(token, secret);
    user = decoded as User;
  } catch (e) {
    console.error('invalid jwt');
    res.status(401).json({ message: 'invalid jwt' });
    return;
  }

  // admin can block a user, so check here that they are not blocked before letting them in
  const dbUser = await prisma.user.findFirst({
    where: { id: user.id, role: user.role },
  });

  if (!dbUser || dbUser.isDeleted) {
    res.status(401).json({ message: 'invalid request' });
    return;
  }

  if (dbUser.isBlocked) {
    res.status(403).json({ message: 'this account is blocked' });
    return;
  }

  req.user = user;
  next();
};
