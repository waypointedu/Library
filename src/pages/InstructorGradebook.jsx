import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle2, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function InstructorGradebook() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const [user, setUser] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u.role !== 'admin' && u.role !== 'instructor') window.history.back();
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }),
    select: d => d[0],
    enabled: !!courseId
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: weeks = [] } = useQuery({
    queryKey: ['weeks', courseId],
    queryFn: () => base44.entities.Week.filter({ course_id: courseId }),
    select: d => d.sort((a, b) => a.week_number - b.week_number),
    enabled: !!courseId
  });

  const { data: allSubmissions = [] } = useQuery({
    queryKey: ['allSubmissions', courseId],
    queryFn: () => base44.entities.WrittenAssignmentSubmission.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const gradeSubmission = useMutation({
    mutationFn: ({ subId, grade, feedback }) => base44.entities.WrittenAssignmentSubmission.update(subId, {
      grade, instructor_feedback: feedback, graded_date: new Date().toISOString(), status: 'graded'
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allSubmissions', courseId] })
  });

  const updateEnrollment = useMutation({
    mutationFn: ({ enrollId, status }) => base44.entities.Enrollment.update(enrollId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments', courseId] })
  });

  if (!user) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  const weekWithAssignments = weeks.filter(w => w.has_written_assignment);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{course?.title_en} — Gradebook</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{enrollments.length}</div>
            <div className="text-sm text-slate-500">Students Enrolled</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{enrollments.filter(e => e.status === 'completed').length}</div>
            <div className="text-sm text-slate-500">Completed</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{allSubmissions.filter(s => s.status !== 'graded').length}</div>
            <div className="text-sm text-slate-500">Pending Review</div>
          </CardContent></Card>
        </div>

        {/* Student list */}
        <div className="space-y-3">
          {enrollments.map(enrollment => {
            const studentEmail = enrollment.user_email;
            const studentSubmissions = allSubmissions.filter(s => s.user_email === studentEmail);
            const pendingCount = studentSubmissions.filter(s => s.status !== 'graded').length;
            const isExpanded = expandedStudent === enrollment.id;

            return (
              <Card key={enrollment.id}>
                <CardContent className="p-0">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedStudent(isExpanded ? null : enrollment.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-sm font-bold">
                        {studentEmail[0]?.toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{studentEmail}</p>
                        <p className="text-xs text-slate-500">
                          {enrollment.status === 'completed' ? '✓ Completed' : 'Active'} • {studentSubmissions.length} submission(s)
                          {pendingCount > 0 && <span className="ml-1 text-amber-600 font-medium">• {pendingCount} pending</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={enrollment.status}
                        onValueChange={v => { updateEnrollment.mutate({ enrollId: enrollment.id, status: v }); }}
                      >
                        <SelectTrigger className="w-32 text-xs" onClick={e => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                      </Select>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 space-y-4">
                      {weekWithAssignments.length === 0 ? (
                        <p className="text-sm text-slate-400">No written assignments in this course.</p>
                      ) : weekWithAssignments.map(week => {
                        const submission = studentSubmissions.find(s => s.week_id === week.id);
                        const draftKey = `${enrollment.id}-${week.id}`;
                        if (!feedbackDrafts[draftKey] && submission) {
                          setFeedbackDrafts(prev => ({ ...prev, [draftKey]: { grade: submission.grade || '', feedback: submission.instructor_feedback || '' } }));
                        }
                        const draft = feedbackDrafts[draftKey] || { grade: '', feedback: '' };

                        return (
                          <div key={week.id} className="border border-slate-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Week {week.week_number}: {week.title_en}</h4>
                            {submission ? (
                              <div className="space-y-3">
                                <div className="bg-slate-50 rounded p-3">
                                  <p className="text-xs text-slate-500 mb-1">Submitted {format(new Date(submission.submitted_date || submission.created_date), 'MMM d, yyyy')}</p>
                                  <p className="text-sm text-slate-700">{submission.content}</p>
                                </div>
                                <div className="flex gap-3">
                                  <div>
                                    <p className="text-xs font-medium text-slate-600 mb-1">Grade</p>
                                    <Input
                                      className="w-24 text-sm"
                                      placeholder="A, B+, ..."
                                      value={draft.grade}
                                      onChange={e => setFeedbackDrafts(prev => ({ ...prev, [draftKey]: { ...draft, grade: e.target.value } }))}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-600 mb-1">Feedback</p>
                                    <Textarea
                                      rows={2}
                                      className="text-sm"
                                      value={draft.feedback}
                                      onChange={e => setFeedbackDrafts(prev => ({ ...prev, [draftKey]: { ...draft, feedback: e.target.value } }))}
                                    />
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-[#1e3a5f]"
                                  onClick={() => gradeSubmission.mutate({ subId: submission.id, grade: draft.grade, feedback: draft.feedback })}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Save Grade
                                </Button>
                                {submission.status === 'graded' && <Badge className="ml-2 bg-green-100 text-green-700">Graded</Badge>}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Not submitted yet</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {enrollments.length === 0 && (
            <Card><CardContent className="p-8 text-center text-slate-400">No students enrolled yet.</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}