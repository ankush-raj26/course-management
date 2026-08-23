import axios from 'axios';

// withCredentials so the httpOnly cookie the backend sets on signin gets sent back on every request
export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});
