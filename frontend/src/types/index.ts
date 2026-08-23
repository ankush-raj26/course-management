export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export type User = {
  id: number;
  email: string;
  role: Role;
};

export type Category = {
  id: number;
  title: string;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  status: 'PUBLIC' | 'PRIVATE';
  instructorId: number;
  categoryId: number;
  category?: Category;
  instructor?: { id: number; name: string };
};

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  student: { id: number; name: string };
};

export type Question = {
  id: number;
  question: string;
  options: string[];
};

export type Quiz = {
  id: number;
  title: string;
  passPercentage: number;
  attemptLimit: number;
  questions: Question[];
};

export type Enrollment = {
  id: number;
  courseId: number;
  studentId: number;
  enrolledAt: string;
  course: Course;
};

export type ProgressEntry = {
  id: number;
  lessonId: number;
  completedAt: string;
  lesson: {
    id: number;
    title: string;
    section: { id: number; title: string };
  };
};

export type QuizAttempt = {
  id: number;
  quizId: number;
  score: number;
  passed: boolean;
  attemptNo: number;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
  isDeleted: boolean;
  createdAT: string;
};
