import { api } from './axios';
import type { Role, User } from '../types';

// signup/signin path is different per role, backend has 3 separate routers for this
const rolePath: Record<Role, string> = {
  STUDENT: 'user',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

export async function signup(role: Role, name: string, email: string, password: string) {
  const res = await api.post(`/${rolePath[role]}/signup`, { name, email, password });
  return res.data;
}

export async function signin(role: Role, email: string, password: string) {
  const res = await api.post(`/${rolePath[role]}/signin`, { email, password });
  return res.data;
}

// token is httpOnly so we cant read it in js, this is how we find out who is logged in
export async function getMe(): Promise<User | null> {
  try {
    const res = await api.get('/me');
    return res.data.user;
  } catch {
    return null;
  }
}

export async function logout() {
  const res = await api.post('/logout');
  return res.data;
}
