import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./db/generated/prisma/client.js";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // clean the old data first, order matters becuase of the foreign keys
  await prisma.enrollment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  const password = await bcrypt.hash("password123", 3);

  const category = await prisma.category.create({
    data: { title: "Web Development" },
  });

  const instructor = await prisma.user.create({
    data: {
      name: "Ankush",
      email: "ankush@mail.com",
      password,
      role: "INSTRUCTOR",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Student 1",
      email: "student1@mail.com",
      password,
      role: "STUDENT",
    },
  });

  // 12 courses so that the pagination has something to show
  const courses = [];
  for (let i = 1; i <= 12; i++) {
    const course = await prisma.course.create({
      data: {
        title: "Course " + i,
        description: "This is the description of course " + i,
        instructorId: instructor.id,
        categoryId: category.id,
        status: "PUBLIC",
      },
    });
    courses.push(course);
  }

  const firstCourse = courses[0]!;

  const section = await prisma.section.create({
    data: { title: "Getting started", courseId: firstCourse.id },
  });

  await prisma.lesson.create({
    data: {
      title: "What is node",
      contentUrl: "https://youtube.com/watch?v=lesson1",
      sectionId: section.id,
      isReq: true,
    },
  });

  await prisma.quiz.create({
    data: {
      title: "Node basics quiz",
      courseId: firstCourse.id,
      passPercentage: 60,
      attemptLimit: 3,
      questions: {
        create: [
          {
            question: "What is Node.js ?",
            options: ["JavaScript runtime", "Database", "Browser", "Language"],
            correctAnswer: 0,
          },
        ],
      },
    },
  });

  await prisma.enrollment.create({
    data: { studentId: student.id, courseId: firstCourse.id },
  });

  console.log("seeding done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
