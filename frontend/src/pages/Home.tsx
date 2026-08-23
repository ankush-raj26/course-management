import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicCourses } from '../api/course';
import type { Course } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses(0);
  }, []);

  async function loadCourses(newSkip: number) {
    setLoading(true);
    const data = await getPublicCourses(newSkip);
    setCourses(data);
    setSkip(newSkip);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Browse courses</h1>
      <p className="mb-6 text-sm text-slate-500">Published courses from all instructors.</p>

      {loading && <p className="text-slate-500">loading...</p>}

      {!loading && courses.length === 0 && (
        <p className="text-slate-500">No courses published yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col gap-2">
            <h2 className="font-medium text-slate-900">{course.title}</h2>
            <p className="line-clamp-2 text-sm text-slate-500">{course.description}</p>
            <Link to={`/courses/${course.id}`} className="mt-2">
              <Button size="sm" variant="outline">
                View course
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <Button size="sm" variant="secondary" disabled={skip === 0} onClick={() => loadCourses(skip - 10)}>
          Previous
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={courses.length < 10}
          onClick={() => loadCourses(skip + 10)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
