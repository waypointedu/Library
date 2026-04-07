import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function QuizContainer({ quizId, user, courseId, lessonId, lang }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => base44.entities.Quiz.filter({ id: quizId }),
    select: d => d[0],
    enabled: !!quizId
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions', quizId],
    queryFn: () => base44.entities.Question.filter({ quiz_id: quizId }),
    select: d => d.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    enabled: !!quizId
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ['quizAttempts', quizId, user?.email],
    queryFn: () => base44.entities.QuizAttempt.filter({ quiz_id: quizId, user_email: user?.email }),
    enabled: !!user?.email && !!quizId
  });

  const lastAttempt = attempts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  const maxAttempts = quiz?.max_attempts || 2;
  const canRetry = attempts.length < maxAttempts;

  const submitMutation = useMutation({
    mutationFn: async () => {
      let correct = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correct_answer_index) correct++;
      });
      const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      const passed = pct >= (quiz?.pass_threshold || 70);
      await base44.entities.QuizAttempt.create({
        quiz_id: quizId, lesson_id: lessonId, course_id: courseId,
        user_email: user.email, answers: selectedAnswers, score: pct, passed
      });
      setResult({ correct, total: questions.length, pct, passed });
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['quizAttempts', quizId, user?.email] });
    }
  });

  const t = {
    en: { submit: 'Submit Quiz', score: 'Score', passed: 'Passed!', failed: 'Not passed', retake: 'Retake', attemptsLeft: 'attempts left' },
    es: { submit: 'Enviar Quiz', score: 'Puntaje', passed: '¡Aprobado!', failed: 'No aprobado', retake: 'Repetir', attemptsLeft: 'intentos restantes' }
  }[lang] || {};

  if (!quiz || questions.length === 0) return null;

  if (submitted && result) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold mb-2">{result.pct}%</div>
          <p className="text-slate-600 mb-4">{result.correct}/{result.total} {t.score}</p>
          {result.passed ? (
            <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />{t.passed}</Badge>
          ) : canRetry ? (
            <Button onClick={() => { setSubmitted(false); setSelectedAnswers({}); setResult(null); }} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />{t.retake} ({maxAttempts - attempts.length - 1} {t.attemptsLeft})
            </Button>
          ) : (
            <Badge variant="destructive">{t.failed}</Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  if (lastAttempt && !submitted) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-700">{t.score}: <strong>{lastAttempt.score}%</strong></span>
            {lastAttempt.passed ? (
              <Badge className="ml-2 bg-green-100 text-green-700">{t.passed}</Badge>
            ) : (
              <Badge variant="destructive" className="ml-2">{t.failed}</Badge>
            )}
          </div>
          {!lastAttempt.passed && canRetry && (
            <Button onClick={() => setSelectedAnswers({})} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />{t.retake}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <Card key={q.id}>
          <CardContent className="p-4">
            <p className="font-medium text-slate-900 mb-3">{qi + 1}. {q.question_text || q.question}</p>
            <div className="space-y-2">
              {(q.options || []).map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={oi}
                    checked={selectedAnswers[q.id] === oi}
                    onChange={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: oi }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        onClick={() => submitMutation.mutate()}
        disabled={Object.keys(selectedAnswers).length < questions.length || submitMutation.isPending}
        className="bg-[#1e3a5f]"
      >
        {t.submit}
      </Button>
    </div>
  );
}