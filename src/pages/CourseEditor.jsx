import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Save, Upload, FileText, X } from 'lucide-react';

const SUBJECTS = [
  ['theology', 'Theology'], ['biblical_studies', 'Biblical Studies'], ['philosophy', 'Philosophy'],
  ['history', 'History'], ['literature', 'Literature'], ['culture', 'Culture'],
  ['psychology_cognitive_science', 'Psychology / Cognitive Science'],
  ['spiritual_formation', 'Spiritual Formation'], ['interdisciplinary', 'Interdisciplinary'],
];

export default function CourseEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeWeekId, setActiveWeekId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u.role !== 'admin' && u.role !== 'instructor') navigate('/');
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }),
    select: d => d[0],
    enabled: !!courseId
  });

  const { data: weeks = [] } = useQuery({
    queryKey: ['weeks', courseId],
    queryFn: () => base44.entities.Week.filter({ course_id: courseId }),
    select: d => d.sort((a, b) => a.week_number - b.week_number),
    enabled: !!courseId
  });

  const { data: weekQuizzes = [] } = useQuery({
    queryKey: ['weekQuizzes', courseId],
    queryFn: () => base44.entities.WeekQuiz.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const [courseForm, setCourseForm] = useState(null);
  const [weekForms, setWeekForms] = useState({});
  const [uploadingWeekId, setUploadingWeekId] = useState(null);
  const [quizForms, setQuizForms] = useState({});  // weekId -> { questions, pass_threshold }
  const [savingQuizId, setSavingQuizId] = useState(null);

  useEffect(() => {
    if (course && !courseForm) {
      setCourseForm({
        title_en: course.title_en || '', description_en: course.description_en || '',
        status: course.status || 'draft', primary_subject_area: course.primary_subject_area || '',
        duration_weeks: course.duration_weeks || '', credits: course.credits || '',
        cover_image_url: course.cover_image_url || '',
      });
    }
  }, [course]);

  useEffect(() => {
    if (weeks.length) {
      const forms = {};
      weeks.forEach(w => {
        forms[w.id] = {
          title_en: w.title_en || '', overview_en: w.overview_en || '', video_url: w.video_url || '',
          reading_assignment_en: w.reading_assignment_en || '',
          has_written_assignment: w.has_written_assignment || false,
          written_assignment_en: w.written_assignment_en || '',
          has_discussion: w.has_discussion || false,
          discussion_prompt_en: w.discussion_prompt_en || '',
          attachments: w.attachments || [],
        };
      });
      setWeekForms(forms);
      if (!activeWeekId && weeks.length) setActiveWeekId(weeks[0].id);
    }
  }, [weeks]);

  useEffect(() => {
    if (weekQuizzes.length) {
      const qf = {};
      weekQuizzes.forEach(q => {
        // Normalize old format
        const questions = (q.questions || []).map(qs => {
          if (qs.question_en !== undefined) {
            const opts = (qs.options || []);
            return {
              question: qs.question_en || '',
              options: opts.map(o => typeof o === 'string' ? o : (o.text_en || '')),
              correct_answer: opts.findIndex(o => typeof o === 'object' && o.is_correct) >= 0 ? opts.findIndex(o => typeof o === 'object' && o.is_correct) : 0
            };
          }
          return qs;
        });
        qf[q.week_id] = { id: q.id, questions, pass_threshold: q.pass_threshold || 70 };
      });
      setQuizForms(qf);
    }
  }, [weekQuizzes]);

  const saveCourse = useMutation({
    mutationFn: () => base44.entities.Course.update(courseId, {
      ...courseForm,
      duration_weeks: courseForm.duration_weeks ? Number(courseForm.duration_weeks) : undefined,
      credits: courseForm.credits ? Number(courseForm.credits) : undefined,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', courseId] })
  });

  const saveWeek = useMutation({
    mutationFn: (weekId) => base44.entities.Week.update(weekId, weekForms[weekId]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weeks', courseId] })
  });

  const addWeek = useMutation({
    mutationFn: () => {
      const nextNum = weeks.length > 0 ? Math.max(...weeks.map(w => w.week_number)) + 1 : 1;
      return base44.entities.Week.create({ course_id: courseId, week_number: nextNum, title_en: `Week ${nextNum}` });
    },
    onSuccess: (newWeek) => {
      queryClient.invalidateQueries({ queryKey: ['weeks', courseId] });
      setActiveWeekId(newWeek.id);
    }
  });

  const deleteWeek = useMutation({
    mutationFn: (weekId) => base44.entities.Week.delete(weekId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks', courseId] });
      setActiveWeekId(weeks[0]?.id || null);
    }
  });

  const setWeekField = (weekId, key, val) => {
    setWeekForms(prev => ({ ...prev, [weekId]: { ...prev[weekId], [key]: val } }));
  };

  const handleAttachmentUpload = async (weekId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingWeekId(weekId);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setWeekForms(prev => ({
      ...prev,
      [weekId]: { ...prev[weekId], attachments: [...(prev[weekId].attachments || []), { title: file.name, url: file_url }] }
    }));
    setUploadingWeekId(null);
    e.target.value = '';
  };

  const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correct_answer: 0 });

  const setQuizField = (weekId, key, val) => setQuizForms(prev => ({ ...prev, [weekId]: { ...prev[weekId], [key]: val } }));

  const setQuestionField = (weekId, qi, key, val) => {
    setQuizForms(prev => {
      const qs = [...(prev[weekId]?.questions || [])];
      qs[qi] = { ...qs[qi], [key]: val };
      return { ...prev, [weekId]: { ...prev[weekId], questions: qs } };
    });
  };

  const setOptionText = (weekId, qi, oi, val) => {
    setQuizForms(prev => {
      const qs = [...(prev[weekId]?.questions || [])];
      const opts = [...(qs[qi].options || [])];
      opts[oi] = val;
      qs[qi] = { ...qs[qi], options: opts };
      return { ...prev, [weekId]: { ...prev[weekId], questions: qs } };
    });
  };

  const addQuestion = (weekId) => setQuizForms(prev => ({
    ...prev, [weekId]: { ...prev[weekId], questions: [...(prev[weekId]?.questions || []), emptyQuestion()] }
  }));

  const removeQuestion = (weekId, qi) => setQuizForms(prev => ({
    ...prev, [weekId]: { ...prev[weekId], questions: prev[weekId].questions.filter((_, i) => i !== qi) }
  }));

  const saveQuiz = async (weekId) => {
    setSavingQuizId(weekId);
    const qf = quizForms[weekId];
    const payload = { week_id: weekId, course_id: courseId, questions: qf.questions, pass_threshold: qf.pass_threshold || 70, max_attempts: 2 };
    if (qf?.id) {
      await base44.entities.WeekQuiz.update(qf.id, payload);
    } else {
      const created = await base44.entities.WeekQuiz.create(payload);
      setQuizForms(prev => ({ ...prev, [weekId]: { ...prev[weekId], id: created.id } }));
    }
    queryClient.invalidateQueries({ queryKey: ['weekQuizzes', courseId] });
    setSavingQuizId(null);
  };

  const removeAttachment = (weekId, idx) => {
    setWeekForms(prev => ({
      ...prev,
      [weekId]: { ...prev[weekId], attachments: prev[weekId].attachments.filter((_, i) => i !== idx) }
    }));
  };

  if (!user || courseLoading) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  const activeWeek = weeks.find(w => w.id === activeWeekId);
  const activeWeekForm = weekForms[activeWeekId] || {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to="/Admin" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">{course?.title_en || 'Course Editor'}</h1>
        <Button onClick={() => saveCourse.mutate()} disabled={saveCourse.isPending} className="bg-[#1e3a5f]">
          <Save className="w-4 h-4 mr-1" />{saveCourse.isPending ? 'Saving...' : 'Save Course'}
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar — weeks */}
        <div className="w-56 flex-shrink-0">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Weeks</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {weeks.map(w => (
                <button
                  key={w.id}
                  onClick={() => setActiveWeekId(w.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeWeekId === w.id ? 'bg-[#1e3a5f] text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  Week {w.week_number}: {w.title_en?.slice(0, 20) || 'Untitled'}
                </button>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addWeek.mutate()} disabled={addWeek.isPending}>
                <Plus className="w-4 h-4 mr-1" /> Add Week
              </Button>
            </CardContent>
          </Card>

          {/* Course settings */}
          {courseForm && (
            <Card className="mt-4">
              <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Course Settings</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input className="mt-1 text-sm" value={courseForm.title_en} onChange={e => setCourseForm(f => ({ ...f, title_en: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={courseForm.status} onValueChange={v => setCourseForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Credits</Label>
                  <Input className="mt-1 text-sm" type="number" value={courseForm.credits} onChange={e => setCourseForm(f => ({ ...f, credits: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Duration (weeks)</Label>
                  <Input className="mt-1 text-sm" type="number" value={courseForm.duration_weeks} onChange={e => setCourseForm(f => ({ ...f, duration_weeks: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content — active week editor */}
        <div className="flex-1">
          {activeWeek && weekForms[activeWeekId] !== undefined ? (
            <><Card>
              <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
                <CardTitle className="text-base">Week {activeWeek.week_number}</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => saveWeek.mutate(activeWeekId)} disabled={saveWeek.isPending} size="sm" className="bg-[#1e3a5f]">
                    <Save className="w-4 h-4 mr-1" />{saveWeek.isPending ? 'Saving...' : 'Save Week'}
                  </Button>
                  <Button onClick={() => deleteWeek.mutate(activeWeekId)} variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input className="mt-1" value={activeWeekForm.title_en} onChange={e => setWeekField(activeWeekId, 'title_en', e.target.value)} />
                </div>
                <div>
                  <Label>Lesson Content (Markdown)</Label>
                  <Textarea className="mt-1 font-mono text-sm" rows={10} value={activeWeekForm.overview_en} onChange={e => setWeekField(activeWeekId, 'overview_en', e.target.value)} />
                </div>
                <div>
                  <Label>Video URL</Label>
                  <Input className="mt-1" placeholder="https://youtube.com/..." value={activeWeekForm.video_url} onChange={e => setWeekField(activeWeekId, 'video_url', e.target.value)} />
                </div>
                <div>
                  <Label>Reading Assignment</Label>
                  <Textarea className="mt-1" rows={3} value={activeWeekForm.reading_assignment_en} onChange={e => setWeekField(activeWeekId, 'reading_assignment_en', e.target.value)} />
                </div>
                {/* Attachments */}
                <div>
                  <Label>Handouts / Attachments</Label>
                  <div className="mt-1 space-y-2">
                    {(activeWeekForm.attachments || []).map((att, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border text-sm">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="flex-1 truncate text-slate-700">{att.title}</span>
                        <button onClick={() => removeAttachment(activeWeekId, i)} className="text-slate-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" onChange={e => handleAttachmentUpload(activeWeekId, e)} disabled={!!uploadingWeekId} />
                      <Button type="button" variant="outline" size="sm" disabled={!!uploadingWeekId} asChild>
                        <span><Upload className="w-4 h-4 mr-1" />{uploadingWeekId === activeWeekId ? 'Uploading...' : 'Upload File'}</span>
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="has_written" checked={activeWeekForm.has_written_assignment} onChange={e => setWeekField(activeWeekId, 'has_written_assignment', e.target.checked)} />
                  <Label htmlFor="has_written">Written Assignment</Label>
                </div>
                {activeWeekForm.has_written_assignment && (
                  <div>
                    <Label>Assignment Prompt</Label>
                    <Textarea className="mt-1" rows={3} value={activeWeekForm.written_assignment_en} onChange={e => setWeekField(activeWeekId, 'written_assignment_en', e.target.value)} />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="has_disc" checked={activeWeekForm.has_discussion} onChange={e => setWeekField(activeWeekId, 'has_discussion', e.target.checked)} />
                  <Label htmlFor="has_disc">Discussion Forum</Label>
                </div>
                {activeWeekForm.has_discussion && (
                  <div>
                    <Label>Discussion Prompt</Label>
                    <Textarea className="mt-1" rows={2} value={activeWeekForm.discussion_prompt_en} onChange={e => setWeekField(activeWeekId, 'discussion_prompt_en', e.target.value)} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiz Editor */}
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
                <CardTitle className="text-base">Quiz</CardTitle>
                <Button onClick={() => saveQuiz(activeWeekId)} disabled={savingQuizId === activeWeekId} size="sm" className="bg-[#1e3a5f]">
                  <Save className="w-4 h-4 mr-1" />{savingQuizId === activeWeekId ? 'Saving...' : 'Save Quiz'}
                </Button>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Label className="shrink-0">Pass Threshold (%)</Label>
                  <Input type="number" className="w-24" value={quizForms[activeWeekId]?.pass_threshold || 70}
                    onChange={e => setQuizField(activeWeekId, 'pass_threshold', Number(e.target.value))} />
                </div>
                {(quizForms[activeWeekId]?.questions || []).map((q, qi) => (
                  <div key={qi} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-slate-500 mt-2 w-5 shrink-0">{qi + 1}.</span>
                      <Textarea className="flex-1" rows={2} placeholder="Question text" value={q.question}
                        onChange={e => setQuestionField(activeWeekId, qi, 'question', e.target.value)} />
                      <button onClick={() => removeQuestion(activeWeekId, qi)} className="mt-2 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="pl-7 space-y-2">
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`q${qi}-correct`} checked={q.correct_answer === oi}
                            onChange={() => setQuestionField(activeWeekId, qi, 'correct_answer', oi)}
                            className="w-4 h-4 shrink-0" title="Mark as correct" />
                          <Input className="flex-1 text-sm" placeholder={`Option ${oi + 1}`} value={opt}
                            onChange={e => setOptionText(activeWeekId, qi, oi, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addQuestion(activeWeekId)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Question
                </Button>
                {!(quizForms[activeWeekId]?.questions?.length > 0) && (
                  <p className="text-sm text-slate-400">No questions yet. Click "Add Question" to start building the quiz.</p>
                )}
              </CardContent>
            </Card></>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                Select a week from the sidebar or add a new one.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}