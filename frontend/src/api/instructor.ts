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
