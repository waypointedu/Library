import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function WeekFormDialog({ open, onClose, week, courseId, existingWeekNumbers, onSaved }) {
  const [form, setForm] = useState({ week_number: '', title_en: '', overview_en: '', video_url: '', has_discussion: false, has_written_assignment: false, written_assignment_en: '', discussion_prompt_en: '', reading_assignment_en: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (week) {
      setForm({
        week_number: week.week_number || '',
        title_en: week.title_en || '',
        overview_en: week.overview_en || '',
        video_url: week.video_url || '',
        has_discussion: week.has_discussion || false,
        has_written_assignment: week.has_written_assignment || false,
        written_assignment_en: week.written_assignment_en || '',
        discussion_prompt_en: week.discussion_prompt_en || '',
        reading_assignment_en: week.reading_assignment_en || '',
      });
    } else {
      const nextNum = existingWeekNumbers.length > 0 ? Math.max(...existingWeekNumbers) + 1 : 1;
      setForm({ week_number: nextNum, title_en: '', overview_en: '', video_url: '', has_discussion: false, has_written_assignment: false, written_assignment_en: '', discussion_prompt_en: '', reading_assignment_en: '' });
    }
  }, [week, open]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, course_id: courseId, week_number: Number(form.week_number) };
    if (week) {
      await base44.entities.Week.update(week.id, data);
    } else {
      await base44.entities.Week.create(data);
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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}