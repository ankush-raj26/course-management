import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { userAtom, authLoadingAtom } from './store/userAtom';
import { getMe } from './api/auth';

import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import CourseDetail from './pages/CourseDetail';
import NotFound from './pages/NotFound';

import StudentDashboard from './pages/student/StudentDashboard';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults';

import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import CreateQuiz from './pages/instructor/CreateQuiz';
import CourseContent from './pages/instructor/CourseContent';

import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const setUser = useSetRecoilState(userAtom);
  const setLoading = useSetRecoilState(authLoadingAtom);

  // check once on app load if the httpOnly cookie still points at a logged in user
  useEffect(() => {
    getMe()
      .then(setUser)
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId/quiz"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <TakeQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz-results"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <QuizResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/new"
          element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
              <CreateCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/quiz"
          element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
              <CreateQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/content"
          element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
              <CourseContent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
