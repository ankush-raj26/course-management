import * as z from 'zod';
import { Roles } from '../../db/generated/prisma/enums.js';
export const signupType = z.object({
  name: z
    .string('name should be string only')
    .min(3, "name can't be  of length less than 3 ")
    .max(40, "name can't be more than the length 40"),
  email: z.string().email(),
  password: z.string().min(8, 'too short password').max(20, 'too long password'),
  role: Roles,
});
