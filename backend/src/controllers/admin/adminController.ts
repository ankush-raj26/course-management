import { signupType } from '../../lib/typeValidator/signupType.js';
import { signinType } from '../../lib/typeValidator/signinType.js';
import 'dotenv/config';
import { prisma } from '../../index.js';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
//import * as z from "zod";
const student_jwt_secret: string = process.env.admin_jwt_secret || 'jwt-secret-1';
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

  const token = jwt.sign({ id: user.id, role: 'ADMIN', email: user.email }, student_jwt_secret);
  res.cookie('token', token, {
    httpOnly: true, // js can't get it from the dom
    secure: true,
    sameSite: 'strict', // protect's from the csrf
  });

  res.status(200).json({ message: 'signin succesfull' });

  return;
};
