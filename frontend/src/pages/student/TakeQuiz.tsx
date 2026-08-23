import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseQuiz } from '../../api/course';
import { submitQuiz } from '../../api/student';
import type { Quiz } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function TakeQuiz() {
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    getCourseQuiz(Number(courseId))
      .then(setQuiz)
      .catch(() => setError('no quiz for this course yet'))
      .finally(() => setLoading(false));
  }, [courseId]);

  function pickAnswer(questionId: number, optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!quiz || !courseId) return;

    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer,
    }));

    try {
      const res = await submitQuiz(Number(courseId), payload);
      setResult(res.submitted);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'could not submit the quiz');
    }
  }

  if (loading) return <p className="p-6 text-slate-500">loading...</p>;
  if (error) return <p className="p-6 text-slate-500">{error}</p>;
  if (!quiz) return null;

  if (result) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">
            {result.passed ? 'You passed!' : 'You did not pass'}
          </h1>
          <p className="text-slate-600">Score: {result.score}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">{quiz.title}</h1>
      <p className="mb-6 text-sm text-slate-500">Pass mark: {quiz.passPercentage}%</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {quiz.questions.map((question, qIndex) => (
          <Card key={question.id}>
            <p className="mb-3 font-medium text-slate-900">
              {qIndex + 1}. {question.question}
            </p>
            <div className="flex flex-col gap-2">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === optIndex}
                    onChange={() => pickAnswer(question.id, optIndex)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </Card>
        ))}

        <Button type="submit">Submit answers</Button>
      </form>
    </div>
  );
}
