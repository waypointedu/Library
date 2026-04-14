import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function WeekQuizStudent({ weekId, user, lang }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const queryClient = useQueryClient();

  const { data: quiz } = useQuery({
    queryKey: ['weekQuiz', weekId],
    queryFn: async () => {
      const quizzes = await base44.entities.WeekQuiz.filter({ week_id: weekId });
      const raw = quizzes[0];
      if (!raw) return null;
      // Normalize old format → new format
      const normalized = (raw.questions || []).map(q => {
        if (typeof q.question === 'string') return q; // already new format
        // Old format: question_en, options[{text_en, is_correct}]
        const options = (q.options || []).map(o => o.text_en || o.text_es || '');
        const correct_answer = (q.options || []).findIndex(o => o.is_correct);
        return { question: q.question_en || q.question_es || '', options, correct_answer: correct_answer >= 0 ? correct_answer : 0 };
      });
      return { ...raw, questions: normalized };
    },
    enabled: !!weekId
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ['weekQuizAttempts', weekId, user.email],
    queryFn: () => base44.entities.WeekQuizAttempt.filter({ week_id: weekId, user_email: user.email }),
    enabled: !!user?.email && !!weekId
  });

  const lastAttempt = attempts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  const maxAttempts = quiz?.max_attempts || 2;
  const canRetry = attempts.length < maxAttempts;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const questions = quiz.questions || [];
      let correct = 0;
      questions.forEach((q, i) => {
        if (selectedAnswers[i] === q.correct_answer) correct++;
      });
      const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      setScore({ correct, total: questions.length, pct });
      setSubmitted(true);
      await base44.entities.WeekQuizAttempt.create({
        week_id: weekId, quiz_id: quiz.id, user_email: user.email,
        answers: selectedAnswers, score: pct, passed: pct >= (quiz.pass_threshold || 70)
      });
      queryClient.invalidateQueries({ queryKey: ['weekQuizAttempts', weekId, user.email] });
    }
  });

  const t = {
    en: { title: 'Quiz', start: 'Start Quiz', submit: 'Submit', score: 'Score', passed: 'Passed', failed: 'Try Again', retake: 'Retake Quiz', attemptsLeft: 'attempt(s) remaining', noQuiz: 'No quiz for this week.' },
    es: { title: 'Quiz', start: 'Comenzar', submit: 'Enviar', score: 'Puntaje', passed: 'Aprobado', failed: 'Inténtalo de nuevo', retake: 'Repetir Quiz', attemptsLeft: 'intento(s) restante(s)', noQuiz: 'No hay quiz esta semana.' }
  }[lang] || {};

  if (!quiz || (quiz.questions || []).length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-slate-500">
          <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>{lang === 'es' ? 'El quiz aún no está disponible.' : 'Quiz not available yet.'}</p>
        </CardContent>
      </Card>
    );
  }

  const questions = quiz.questions || [];

  const passed = lastAttempt?.passed;
  const attemptsLeft = maxAttempts - attempts.length;

  if (submitted && score) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ClipboardCheck className="w-8 h-8 mx-auto mb-3 text-slate-400" />
          <h3 className="font-semibold text-slate-900 mb-2">{t.title} — {t.score}: {score.pct}%</h3>
          <p className="text-slate-600 mb-4">{score.correct}/{score.total} correct</p>
          {score.pct >= (quiz.pass_threshold || 70) ? (
            <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />{t.passed}</Badge>
          ) : canRetry ? (
            <Button onClick={() => { setSubmitted(false); setSelectedAnswers({}); setScore(null); }} variant="outline">
              <RefreshCw className="w-4 h-4 mr-1" />{t.retake} ({attemptsLeft - 1} {t.attemptsLeft})
            </Button>
          ) : (
            <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t.failed}</Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  if (lastAttempt && !submitted) {
    const pct = lastAttempt.score;
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />{t.title}
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-slate-700">{t.score}: <strong>{pct}%</strong></span>
            {lastAttempt.passed ? (
              <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />{t.passed}</Badge>
            ) : (
              <Badge variant="destructive">{t.failed}</Badge>
            )}
          </div>
          {!lastAttempt.passed && canRetry && (
            <Button onClick={() => { setSelectedAnswers({}); }} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />{t.retake} ({attemptsLeft} {t.attemptsLeft})
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4" />{t.title}
        </h3>
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi}>
              <p className="text-sm font-medium text-slate-900 mb-2">{qi + 1}. {q.question}</p>
              <div className="space-y-2">
                {(q.options || []).map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q${qi}`}
                      value={oi}
                      checked={selectedAnswers[qi] === oi}
                      onChange={() => setSelectedAnswers(prev => ({ ...prev, [qi]: oi }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={Object.keys(selectedAnswers).length < questions.length || submitMutation.isPending}
          className="mt-6 bg-[#1e3a5f]"
        >
          {t.submit}
        </Button>
      </CardContent>
    </Card>
  );
}