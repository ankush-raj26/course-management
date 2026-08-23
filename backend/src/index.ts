import 'dotenv/config';
import winston from 'winston';
import { PrismaPg } from '@prisma/adapter-pg';
import { swaggerSpec } from './swagger/swagger.js';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from './db/generated/prisma/client.js';
import { Roles } from './db/generated/prisma/enums.js';
import { userRouter } from './routes/studentRoutes.js';
import { instructorRouter } from './routes/instructorRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { asyncHandler } from './lib/asynchandler.js';
import { courseRouter } from './routes/courseRoutes.js';
import { userMiddleware } from './auth/auth.middleware.js';
import type { UserRequest } from './types/express.js';
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});

export const app = express();

app.use(express.json());
app.use(helmet());
// frontend runs on a different port, needs credentials: true so the login cookie goes through
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(cookieParser());
app.get('/life', (req, res) => {
  res.json({ message: 'ping' });
});

// frontend calls this on every page load to check who is logged in (token is httpOnly so js cant read it directly)
app.get('/me', userMiddleware, (req: UserRequest, res) => {
  res.status(200).json({ user: req.user });
});

// clears the login cookie, same for every role
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'logged out' });
});

// public list of categories, an instructor needs this to pick one while creating a course
// only admin can create new ones, that stays under /admin/category
app.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany();
    res.status(200).json({ categories });
  }),
);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: '../logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '../logs/combined.log' }),
  ],
  
});



app.use('/user', userRouter);
app.use('/instructor', instructorRouter);
app.use('/admin', adminRouter);
app.use('/course', courseRouter);
const port = process.env.PORT || 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(asyncHandler);


if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}


app.listen(port, () => {
  console.log('Server is running on port ' + port);
});

