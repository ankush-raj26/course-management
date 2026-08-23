import { useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createQuiz, type NewQuestion } from '../../api/instructor';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

function emptyQuestion(): NewQuestion {
  return { question: '', options: ['', '', '', ''], correctAnswer: 0 };
}

export default function CreateQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [passPercentage, setPassPercentage] = useState(60);
  const [attemptLimit, setAttemptLimit] = useState(3);
  const [questions, setQuestions] = useState<NewQuestion[]>([emptyQuestion()]);
  const [error, setError] = useState('');

  function updateQuestion(index: number, question: string) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, question } : q)));
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[optIndex] = value;
        return { ...q, options };
      }),
    );
  }

  function setCorrect(qIndex: number, optIndex: number) {
    setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, correctAnswer: optIndex } : q)));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    setError('');

    try {
      await createQuiz({
        courseId: Number(courseId),
        title,
        passPercentage: Number(passPercentage),
        attemptLimit: Number(attemptLimit),
        questions,
      });
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'could not create the quiz');
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Create quiz</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input label="Quiz title" required value={title} onChange={(e) => setTitle(e.target.value)} />

        <div className="flex gap-4">
          <Input
            label="Pass percentage"
            type="number"
            min={1}
            max={100}
            required
            value={passPercentage}
            onChange={(e) => setPassPercentage(Number(e.target.value))}
          />
          <Input
            label="Attempt limit"
            type="number"
            min={1}
            required
            value={attemptLimit}
            onChange={(e) => setAttemptLimit(Number(e.target.value))}
          />
        </div>

        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">Question {qIndex + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => removeQuestion(qIndex)}
                >
                  remove
                </button>
              )}
            </div>

            <Input
              placeholder="Question text"
              required
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, e.target.value)}
            />

            <p className="text-xs text-slate-500">Pick the correct option</p>
            {question.options.map((option, optIndex) => (
              <label key={optIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={question.correctAnswer === optIndex}
                  onChange={() => setCorrect(qIndex, optIndex)}
                />
                <Input
                  placeholder={`Option ${optIndex + 1}`}
                  required
                  value={option}
                  onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                  className="flex-1"
                />
              </label>
            ))}
          </Card>
        ))}

        <Button type="button" variant="secondary" onClick={addQuestion}>
          Add another question
        </Button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit">Save quiz</Button>
      </form>
    </div>
  );
}
