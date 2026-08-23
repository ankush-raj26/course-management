import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { getCourse, getCourseReviews, publishCourse } from '../api/course';
import { enrollInCourse, submitReview } from '../api/student';
import { userAtom } from '../store/userAtom';
import type { Course, Review } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';

export default function CourseDetail() {
  const { courseId } = useParams();
  const user = useRecoilValue(userAtom);

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!courseId) return;
    load(Number(courseId));
  }, [courseId]);

  async function load(id: number) {
    setLoading(true);
    const [c, r] = await Promise.all([getCourse(id), getCourseReviews(id)]);
    setCourse(c);
    setReviews(r);
    setLoading(false);
  }

  async function handleEnroll() {
    if (!course) return;
    setMessage('');
    try {
      await enrollInCourse(course.id);
      setMessage('enrolled! check your dashboard.');
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? 'could not enroll');
    }
  }

  async function handlePublish() {
    if (!course) return;
    await publishCourse(course.id);
    load(course.id);
  }

  async function handleReview(e: FormEvent) {
    e.preventDefault();
    if (!course) return;
    setMessage('');
    try {
      await submitReview(course.id, rating, comment);
      setComment('');
      load(course.id);
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? 'could not submit review');
    }
  }

  if (loading) return <p className="p-6 text-slate-500">loading...</p>;
  if (!course) return <p className="p-6 text-slate-500">course not found</p>;

  const isOwner = user?.role === 'INSTRUCTOR' && user.id === course.instructorId;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
        <Badge tone={course.status === 'PUBLIC' ? 'green' : 'gray'}>{course.status}</Badge>
      </div>

      <p className="mb-4 text-slate-600">{course.description}</p>

      <p className="mb-6 text-sm text-slate-500">
        {course.category && <>Category: {course.category.title} · </>}
        {course.instructor && <>By {course.instructor.name}</>}
      </p>

      {message && <p className="mb-4 text-sm text-slate-700">{message}</p>}

      <div className="mb-8 flex flex-wrap gap-2">
        {user?.role === 'STUDENT' && <Button onClick={handleEnroll}>Enroll</Button>}

        {isOwner && course.status === 'PRIVATE' && (
          <Button variant="outline" onClick={handlePublish}>
            Publish course
          </Button>
        )}

        {isOwner && (
          <Link to={`/instructor/courses/${course.id}/quiz`}>
            <Button variant="outline">Create quiz</Button>
          </Link>
        )}

        {user?.role === 'STUDENT' && (
          <Link to={`/student/courses/${course.id}/quiz`}>
            <Button variant="outline">Take quiz</Button>
          </Link>
        )}
      </div>

      <h2 className="mb-3 text-lg font-medium text-slate-900">Reviews</h2>

      {reviews.length === 0 && <p className="mb-4 text-sm text-slate-500">No reviews yet.</p>}

      <div className="mb-6 flex flex-col gap-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <p className="text-sm font-medium text-slate-900">
              {review.student.name} · {review.rating}/5
            </p>
            {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
          </Card>
        ))}
      </div>

      {user?.role === 'STUDENT' && (
        <form onSubmit={handleReview} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-slate-900">Leave a review</h3>
          <Select
            label="Rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
          <Textarea
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" size="sm">
            Submit review
          </Button>
        </form>
      )}
    </div>
  );
}
