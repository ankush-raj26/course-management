import * as z from 'zod';
export const signinType = z.object({
  email: z.email(),
  password: z.string().min(8, 'too short password').max(20, 'too long password'),
});
