import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SUBJECTS = [
  ['theology', 'Theology'],
  ['biblical_studies', 'Biblical Studies'],
  ['philosophy', 'Philosophy'],
  ['history', 'History'],
  ['literature', 'Literature'],
  ['culture', 'Culture'],
  ['psychology_cognitive_science', 'Psychology / Cognitive Science'],
  ['spiritual_formation', 'Spiritual Formation'],
  ['interdisciplinary', 'Interdisciplinary'],
];

export default function CourseFormDialog({ open, onClose, course, onSaved }) {
  const [form, setForm] = useState({ title_en: '', description_en: '', status: 'draft', primary_subject_area: '', duration_weeks: '', credits: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) {
      setForm({
        title_en: course.title_en || '',
        description_en: course.description_en || '',
        status: course.status || 'draft',
        primary_subject_area: course.primary_subject_area || '',
        duration_weeks: course.duration_weeks || '',
        credits: course.credits || '',
      });
    } else {
      setForm({ title_en: '', description_en: '', status: 'draft', primary_subject_area: '', duration_weeks: '', credits: '' });
    }
  }, [course, open]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.title_en.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      duration_weeks: form.duration_weeks ? Number(form.duration_weeks) : undefined,
      credits: form.credits ? Number(form.credits) : undefined,
    };
    if (course) {
      await base44.entities.Course.update(course.id, data);
    } else {
      await base44.entities.Course.create(data);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'New Course'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Title (English)</Label>
            <Input className="mt-1" value={form.title_en} onChange={e => set('title_en', e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1" rows={3} value={form.description_en} onChange={e => set('description_en', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject Area</Label>
              <Select value={form.primary_subject_area} onValueChange={v => set('primary_subject_area', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration (weeks)</Label>
              <Input className="mt-1" type="number" value={form.duration_weeks} onChange={e => set('duration_weeks', e.target.value)} />
            </div>
            <div>
              <Label>Credits</Label>
              <Input className="mt-1" type="number" value={form.credits} onChange={e => set('credits', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title_en.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}