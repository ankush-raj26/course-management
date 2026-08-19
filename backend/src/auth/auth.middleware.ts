import type { NextFunction, Request, Response } from 'express';
import type { UserRequest } from '../types/express.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

type User = {
  id: number;
  role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
  email: string;
};

export const userMiddleware = function (req: UserRequest, res: Response, next: NextFunction): void {
  const token = req.cookies.token;
  const secret = process.env.student_jwt_secret;

  if (!token) {
    res.status(200).json({ message: 'invalid request' });
    return;
  }

  if (!secret) {
    throw new Error('jwt secret missing');
  }
  let user;
  try {
    const decoded = jwt.verify(token, secret);

    const user = decoded as User;

    req.user = user;

    next();
  } catch (e) {
    console.error('invalid jwt');
    res.status(404).json({ message: 'invalid jwt' });
    return;
  }
};
