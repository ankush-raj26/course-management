import { api } from './axios';
import type { Enrollment, ProgressEntry, QuizAttempt } from '../types';

export async function enrollInCourse(courseId: number) {
  const res = await api.post(`/user/courses/${courseId}/enroll`);
  return res.data;
}

export async function getMyEnrolledCourses(): Promise<Enrollment[]> {
  const res = await api.get('/user/courses');
  return res.data.courses;
}

export async function getCourseProgress(userId: number): Promise<ProgressEntry[]> {
  const res = await api.get(`/user/${userId}/courseprog`);
  return res.data.progressReport;
}

export async function submitQuiz(courseId: number, answers: { questionId: number; answer: number }[]) {
  const res = await api.post('/user/quiz/submit', { courseId, answers });
  return res.data;
}

export async function submitReview(courseId: number, rating: number, comments: string) {
  const res = await api.post(`/user/courses/${courseId}/review`, { rating, comments });
  return res.data;
}

export async function getQuizResults(): Promise<QuizAttempt[]> {
  const res = await api.get('/user/quizresults');
  return res.data.results;
}
