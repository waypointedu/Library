import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function WrittenAssignmentStudent({ week, courseId, user, lang }) {
  const [answer, setAnswer] = useState('');
  const queryClient = useQueryClient();

  const { data: submissions = [] } = useQuery({
    queryKey: ['writtenSubmission', week.id, user.email],
    queryFn: () => base44.entities.WrittenAssignmentSubmission.filter({ week_id: week.id, user_email: user.email }),
    enabled: !!user?.email
  });

  const existing = submissions[0];

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.WrittenAssignmentSubmission.create({
      week_id: week.id, course_id: courseId, user_email: user.email,
      content: answer, submitted_date: new Date().toISOString(), status: 'submitted'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['writtenSubmission', week.id, user.email] });
      setAnswer('');
    }
  });

  const prompt = week[`written_assignment_${lang}`] || week.written_assignment_en;

  const t = {
    en: { title: 'Written Assignment', prompt: 'Assignment Prompt', yourAnswer: 'Your response...', submit: 'Submit', submitted: 'Submitted', grade: 'Grade', feedback: 'Instructor Feedback', pending: 'Awaiting review', submittedOn: 'Submitted on', graded: 'Graded' },
    es: { title: 'Tarea Escrita', prompt: 'Tarea', yourAnswer: 'Tu respuesta...', submit: 'Enviar', submitted: 'Enviada', grade: 'Calificación', feedback: 'Retroalimentación', pending: 'Pendiente de revisión', submittedOn: 'Enviada el', graded: 'Calificada' }
  }[lang] || {};

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />{t.title}
        </h3>

        {prompt && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-amber-800 mb-1">{t.prompt}</p>
            <p className="text-sm text-amber-700">{prompt}</p>
          </div>
        )}

        {existing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {existing.grade ? (
                <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />{t.graded}</Badge>
              ) : (
                <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{t.pending}</Badge>
              )}
              <span className="text-xs text-slate-400">{t.submittedOn} {format(new Date(existing.submitted_date || existing.created_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{existing.content}</p>
            </div>
            {existing.grade && (
              <div className="text-sm"><span className="font-medium">{t.grade}:</span> {existing.grade}</div>
            )}
            {existing.instructor_feedback && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 mb-1">{t.feedback}</p>
                <p className="text-sm text-blue-700">{existing.instructor_feedback}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder={t.yourAnswer}
              rows={5}
            />
            <Button onClick={() => submitMutation.mutate()} disabled={!answer.trim() || submitMutation.isPending} className="bg-[#1e3a5f]">
              <Send className="w-4 h-4 mr-1" />{t.submit}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}