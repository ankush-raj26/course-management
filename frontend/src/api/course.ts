import { api } from './axios';
import type { Course, Review, Quiz, Section } from '../types';

export async function getPublicCourses(skip = 0): Promise<Course[]> {
  const res = await api.get(`/course?skip=${skip}`);
  return res.data.courses;
}

export async function getCourse(courseId: number): Promise<Course> {
  const res = await api.get(`/course/${courseId}`);
  return res.data.course;
}

// courses the logged in instructor created, private ones included
export async function getMyCourses(): Promise<Course[]> {
  const res = await api.get('/course/mine');
  return res.data.courses;
}

export async function createCourse(data: {
  instructorId: number;
  categoryId: number;
  title: string;
  description: string;
}) {
  const res = await api.post('/course/create', { ...data, status: 'PRIVATE' });
  return res.data;
}

export async function publishCourse(courseId: number) {
  const res = await api.put('/course/publish', { courseId });
  return res.data;
}

export async function getCourseReviews(courseId: number): Promise<Review[]> {
  const res = await api.get(`/course/${courseId}/reviews`);
  return res.data.reviews;
}

export async function getCourseQuiz(courseId: number): Promise<Quiz> {
  const res = await api.get(`/course/${courseId}/quiz`);
  return res.data.quiz;
}

export async function getCourseSections(courseId: number): Promise<Section[]> {
  const res = await api.get(`/course/${courseId}/sections`);
  return res.data.sections;
}
