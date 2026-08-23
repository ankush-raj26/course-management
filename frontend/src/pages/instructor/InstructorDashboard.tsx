import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCourses, publishCourse } from '../../api/course';
import type { Course } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getMyCourses()
      .then(setCourses)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePublish(courseId: number) {
    await publishCourse(courseId);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My courses</h1>
        <Link to="/instructor/courses/new">
          <Button size="sm">Create course</Button>
        </Link>
      </div>

      {loading && <p className="text-slate-500">loading...</p>}
      {!loading && courses.length === 0 && <p className="text-slate-500">You have not created any course yet.</p>}

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
              {course.status === 'PRIVATE' && (
                <Button size="sm" variant="outline" onClick={() => handlePublish(course.id)}>
                  Publish
                </Button>
              )}
              <Link to={`/instructor/courses/${course.id}/content`}>
                <Button size="sm" variant="outline">
                  Content
                </Button>
              </Link>
              <Link to={`/instructor/courses/${course.id}/quiz`}>
                <Button size="sm" variant="outline">
                  Quiz
                </Button>
              </Link>
              <Link to={`/courses/${course.id}`}>
                <Button size="sm" variant="secondary">
                  View
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
