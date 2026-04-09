import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Upload, FileText, X } from 'lucide-react';

const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correct_answer: 0 });

export default function WeekFormDialog({ open, onClose, week, courseId, existingWeekNumbers, onSaved }) {
  const [form, setForm] = useState({
    week_number: '', title_en: '', overview_en: '', video_url: '',
    has_discussion: false, has_written_assignment: false, has_quiz: false,
    written_assignment_en: '', discussion_prompt_en: '', reading_assignment_en: '',
    attachments: []
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch existing quiz when editing
  const { data: existingQuiz } = useQuery({
    queryKey: ['weekQuizEdit', week?.id],
    queryFn: async () => {
      const quizzes = await base44.entities.WeekQuiz.filter({ week_id: week.id });
      return quizzes[0] || null;
    },
    enabled: !!week?.id && open
  });

  useEffect(() => {
    if (week) {
      setForm({
        week_number: week.week_number || '',
        title_en: week.title_en || '',
        overview_en: week.overview_en || '',
        video_url: week.video_url || '',
        has_discussion: week.has_discussion || false,
        has_written_assignment: week.has_written_assignment || false,
        has_quiz: week.has_quiz || false,
        written_assignment_en: week.written_assignment_en || '',
        discussion_prompt_en: week.discussion_prompt_en || '',
        reading_assignment_en: week.reading_assignment_en || '',
        attachments: week.attachments || [],
      });
    } else {
      const nextNum = existingWeekNumbers.length > 0 ? Math.max(...existingWeekNumbers) + 1 : 1;
      setForm({
        week_number: nextNum, title_en: '', overview_en: '', video_url: '',
        has_discussion: false, has_written_assignment: false, has_quiz: false,
        written_assignment_en: '', discussion_prompt_en: '', reading_assignment_en: '',
        attachments: []
      });
      setQuestions([emptyQuestion()]);
    }
  }, [week, open]);

  useEffect(() => {
    if (existingQuiz?.questions?.length > 0) {
      setQuestions(existingQuiz.questions);
    }
  }, [existingQuiz]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addQuestion = () => setQuestions(q => [...q, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions(q => q.filter((_, idx) => idx !== i));
  const setQuestion = (i, field, val) => setQuestions(q => q.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  const setOption = (qi, oi, val) => setQuestions(q => q.map((item, idx) => {
    if (idx !== qi) return item;
    const opts = [...item.options];
    opts[oi] = val;
    return { ...item, options: opts };
  }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, attachments: [...(f.attachments || []), { title: file.name, url: file_url }] }));
    setUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (i) => setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, course_id: courseId, week_number: Number(form.week_number) };
    let savedWeek;
    if (week) {
      savedWeek = await base44.entities.Week.update(week.id, data);
    } else {
      savedWeek = await base44.entities.Week.create(data);
    }

    // Save quiz if enabled
    if (form.has_quiz && questions.some(q => q.question.trim())) {
      const weekId = week?.id || savedWeek?.id;
      if (weekId) {
        const validQuestions = questions.filter(q => q.question.trim() && q.options.some(o => o.trim()));
        if (existingQuiz) {
          await base44.entities.WeekQuiz.update(existingQuiz.id, { questions: validQuestions, week_id: weekId, pass_threshold: 70, max_attempts: 2 });
        } else {
          await base44.entities.WeekQuiz.create({ week_id: weekId, course_id: courseId, questions: validQuestions, pass_threshold: 70, max_attempts: 2 });
        }
      }
    }

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{week ? 'Edit Week' : 'New Week'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Week Number</Label>
              <Input className="mt-1" type="number" value={form.week_number} onChange={e => set('week_number', e.target.value)} />
            </div>
            <div>
              <Label>Title (English)</Label>
              <Input className="mt-1" value={form.title_en} onChange={e => set('title_en', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Overview / Lesson Content</Label>
            <Textarea className="mt-1" rows={5} value={form.overview_en} onChange={e => set('overview_en', e.target.value)} placeholder="Markdown supported..." />
          </div>
          <div>
            <Label>Video URL (optional)</Label>
            <Input className="mt-1" value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <div>
            <Label>Reading Assignment (optional)</Label>
            <Textarea className="mt-1" rows={2} value={form.reading_assignment_en} onChange={e => set('reading_assignment_en', e.target.value)} />
          </div>

          {/* Handouts / Attachments */}
          <div>
            <Label className="mb-2 block">Handouts / Attachments</Label>
            <div className="space-y-2 mb-2">
              {(form.attachments || []).map((att, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700 flex-1 truncate">{att.title}</span>
                  <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                <span><Upload className="w-4 h-4 mr-1" />{uploading ? 'Uploading...' : 'Upload File'}</span>
              </Button>
            </label>
          </div>

          {/* Written Assignment */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="has_written" checked={form.has_written_assignment} onChange={e => set('has_written_assignment', e.target.checked)} className="rounded" />
            <Label htmlFor="has_written">Include Written Assignment</Label>
          </div>
          {form.has_written_assignment && (
            <div>
              <Label>Assignment Prompt</Label>
              <Textarea className="mt-1" rows={3} value={form.written_assignment_en} onChange={e => set('written_assignment_en', e.target.value)} />
            </div>
          )}

          {/* Quiz */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="has_quiz" checked={form.has_quiz} onChange={e => set('has_quiz', e.target.checked)} className="rounded" />
            <Label htmlFor="has_quiz">Include Quiz</Label>
          </div>
          {form.has_quiz && (
            <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
              <p className="text-sm font-medium text-slate-700">Quiz Questions</p>
              {questions.map((q, qi) => (
                <div key={qi} className="bg-white border rounded-lg p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-500 mt-2 w-5 flex-shrink-0">Q{qi + 1}</span>
                    <Input
                      value={q.question}
                      onChange={e => setQuestion(qi, 'question', e.target.value)}
                      placeholder="Question text..."
                      className="flex-1"
                    />
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(qi)} className="text-slate-400 hover:text-red-500 mt-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="ml-7 space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${qi}`}
                          checked={q.correct_answer === oi}
                          onChange={() => setQuestion(qi, 'correct_answer', oi)}
                          className="w-4 h-4 flex-shrink-0"
                          title="Mark as correct answer"
                        />
                        <Input
                          value={opt}
                          onChange={e => setOption(qi, oi, e.target.value)}
                          placeholder={`Option ${oi + 1}`}
                          className="text-sm h-8"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-slate-400">Select the radio button next to the correct answer.</p>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-1" />Add Question
              </Button>
            </div>
          )}

          {/* Discussion */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="has_disc" checked={form.has_discussion} onChange={e => set('has_discussion', e.target.checked)} className="rounded" />
            <Label htmlFor="has_disc">Include Discussion Forum</Label>
          </div>
          {form.has_discussion && (
            <div>
              <Label>Discussion Prompt</Label>
              <Textarea className="mt-1" rows={2} value={form.discussion_prompt_en} onChange={e => set('discussion_prompt_en', e.target.value)} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}