import { api } from './axios';

export type NewQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export async function createQuiz(data: {
  courseId: number;
  title: string;
  passPercentage: number;
  attemptLimit: number;
  questions: NewQuestion[];
}) {
  const res = await api.post('/instructor/quiz', data);
  return res.data;
}

export async function createSection(data: { courseId: number; title: string; parentId?: number }) {
  const res = await api.post('/instructor/sections', data);
  return res.data;
}

export async function createLesson(data: {
  sectionId: number;
  title: string;
  contentUrl: string;
  isReq: boolean;
}) {
  const res = await api.post('/instructor/lessons', data);
  return res.data;
}
