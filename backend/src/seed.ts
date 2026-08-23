import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './db/generated/prisma/client.js';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // clean the old data first, order matters becuase of the foreign keys
  await prisma.enrollment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  const password = await bcrypt.hash('password123', 3);

  // signup as admin is not exposed in the UI, this is the only way to get an admin account
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@mail.com',
      password,
      role: 'ADMIN',
    },
  });

  const category = await prisma.category.create({
    data: { title: 'Web Development' },
  });

  const instructor = await prisma.user.create({
    data: {
      name: 'Ankush',
      email: 'ankush@mail.com',
      password,
      role: 'INSTRUCTOR',
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'Student 1',
      email: 'student1@mail.com',
      password,
      role: 'STUDENT',
    },
  });

  // 12 courses so that the pagination has something to show
  const courses = [];
  for (let i = 1; i <= 12; i++) {
    const course = await prisma.course.create({
      data: {
        title: 'Course ' + i,
        description: 'This is the description of course ' + i,
        instructorId: instructor.id,
        categoryId: category.id,
        status: 'PUBLIC',
      },
    });
    courses.push(course);
  }

  const firstCourse = courses[0]!;

  // folder structure: two sections, each with a couple of lessons
  const gettingStarted = await prisma.section.create({
    data: { title: 'Getting started', courseId: firstCourse.id },
  });

  await prisma.lesson.create({
    data: {
      title: 'What is node',
      contentUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      sectionId: gettingStarted.id,
      isReq: true,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Setting up your environment',
      contentUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      sectionId: gettingStarted.id,
      isReq: true,
    },
  });

  const coreConcepts = await prisma.section.create({
    data: { title: 'Core concepts', courseId: firstCourse.id },
  });

  await prisma.lesson.create({
    data: {
      title: 'Modules and npm',
      contentUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      sectionId: coreConcepts.id,
      isReq: true,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'The event loop',
      contentUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      sectionId: coreConcepts.id,
      isReq: false,
    },
  });

  // a subfolder nested inside "Core concepts", to show folders can nest more than one level deep
  const advancedTopics = await prisma.section.create({
    data: { title: 'Advanced topics', courseId: firstCourse.id, parentId: coreConcepts.id },
  });

  await prisma.lesson.create({
    data: {
      title: 'Streams and buffers',
      contentUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      sectionId: advancedTopics.id,
      isReq: false,
    },
  });

  await prisma.quiz.create({
    data: {
      title: 'Node basics quiz',
      courseId: firstCourse.id,
      passPercentage: 60,
      attemptLimit: 3,
      questions: {
        create: [
          {
            question: 'What is the best way to fix a bug the night before a deadline?',
            options: ['All of the above', 'Some of the above', 'Any of the above', 'None of the above'],
            correctAnswer: 3,
          },
          {
            question: 'Why did the deployment break right after someone said "it works on my machine"?',
            options: ['All of the above', 'Some of the above', 'Any of the above', 'None of the above'],
            correctAnswer: 0,
          },
          {
            question: "What's the real reason npm install takes forever?",
            options: ['All of the above', 'Some of the above', 'Any of the above', 'None of the above'],
            correctAnswer: 2,
          },
          {
            question: 'Which excuse works best when the demo crashes in front of everyone?',
            options: ['All of the above', 'Some of the above', 'Any of the above', 'None of the above'],
            correctAnswer: 1,
          },
          {
            question: 'What did the senior dev say after being asked to review a 3000 line pull request?',
            options: ['All of the above', 'Some of the above', 'Any of the above', 'None of the above'],
            correctAnswer: 3,
          },
        ],
      },
    },
  });

  console.log('seeding done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
