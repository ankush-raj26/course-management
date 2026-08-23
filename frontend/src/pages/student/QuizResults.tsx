import { useEffect, useState } from 'react';
import { getQuizResults } from '../../api/student';
import type { QuizAttempt } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function QuizResults() {
  const [results, setResults] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizResults()
      .then(setResults)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Quiz results</h1>

      {loading && <p className="text-slate-500">loading...</p>}
      {!loading && results.length === 0 && <p className="text-slate-500">No quiz attempts yet.</p>}

      <div className="flex flex-col gap-3">
        {results.map((attempt) => (
          <Card key={attempt.id} className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Attempt #{attempt.attemptNo}</span>
            <span className="text-sm text-slate-700">Score: {attempt.score}</span>
            <Badge tone={attempt.passed ? 'green' : 'red'}>
              {attempt.passed ? 'Passed' : 'Failed'}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
