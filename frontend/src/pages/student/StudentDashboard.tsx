import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEnrolledCourses } from '../../api/student';
import type { Enrollment } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrolledCourses()
      .then(setEnrollments)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My courses</h1>
        <div className="flex gap-2">
          <Link to="/">
            <Button size="sm" variant="outline">
              Browse courses
            </Button>
          </Link>
          <Link to="/student/quiz-results">
            <Button size="sm" variant="outline">
              Quiz results
            </Button>
          </Link>
        </div>
      </div>

      {loading && <p className="text-slate-500">loading...</p>}

      {!loading && enrollments.length === 0 && (
        <p className="text-slate-500">You are not enrolled in any course yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id} className="flex flex-col gap-2">
            <h2 className="font-medium text-slate-900">{enrollment.course.title}</h2>
            <p className="line-clamp-2 text-sm text-slate-500">{enrollment.course.description}</p>
            <Link to={`/courses/${enrollment.courseId}`} className="mt-2">
              <Button size="sm" variant="outline">
                Open course
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
