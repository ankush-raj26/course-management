import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminCourses, deleteCourse } from '../../api/admin';
import type { Course } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getAdminCourses()
      .then(setCourses)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(courseId: number) {
    await deleteCourse(courseId);
    load();
  }

  if (loading) return <p className="text-slate-500">loading...</p>;

  return (
    <div className="flex flex-col gap-3">
      {courses.map((course) => (
        <Card key={course.id} className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{course.title}</span>
              <Badge tone={course.status === 'PUBLIC' ? 'green' : 'gray'}>{course.status}</Badge>
            </div>
            <p className="text-sm text-slate-500">{course.description}</p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link to={`/courses/${course.id}`}>
              <Button size="sm" variant="outline">
                View
              </Button>
            </Link>
            <Button size="sm" variant="danger" onClick={() => handleDelete(course.id)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
