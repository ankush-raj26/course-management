import { api } from './axios';
import type { AdminUser, Course, Category } from '../types';

export async function getUsers(skip = 0): Promise<AdminUser[]> {
  const res = await api.get(`/admin/users?skip=${skip}`);
  return res.data.users;
}

export async function blockUser(userId: number) {
  const res = await api.put(`/admin/users/${userId}/block`);
  return res.data;
}

export async function unblockUser(userId: number) {
  const res = await api.put(`/admin/users/${userId}/unblock`);
  return res.data;
}

export async function deleteUser(userId: number) {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
}

export async function getAdminCourses(skip = 0): Promise<Course[]> {
  const res = await api.get(`/admin/courses?skip=${skip}`);
  return res.data.courses;
}

export async function deleteCourse(courseId: number) {
  const res = await api.delete(`/admin/courses/${courseId}`);
  return res.data;
}

export async function createCategory(title: string): Promise<Category> {
  const res = await api.post('/admin/category', { title });
  return res.data.category;
}
