import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, X, Check, Users, Calendar } from 'lucide-react';

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

const emptyForm = {
  course_id: '',
  term_id: '',
  cohort_name: '',
  instructor_emails: [],
  start_date: '',
  end_date: '',
  max_students: '',
  meeting_schedule: '',
  status: 'scheduled',
};

export default function CourseInstanceManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [instructorInput, setInstructorInput] = useState('');

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: terms = [] } = useQuery({
    queryKey: ['terms'],
    queryFn: () => base44.entities.AcademicTerm.list('-start_date'),
  });

  const { data: instances = [] } = useQuery({
    queryKey: ['courseInstances'],
    queryFn: () => base44.entities.CourseInstance.list('-created_date'),
  });

  const { data: instructorProfiles = [] } = useQuery({
    queryKey: ['instructorProfiles'],
    queryFn: () => base44.entities.InstructorProfile.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CourseInstance.create({
      ...data,
      max_students: data.max_students ? Number(data.max_students) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseInstances'] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CourseInstance.update(id, {
      ...data,
      max_students: data.max_students ? Number(data.max_students) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseInstances'] });
      setEditingId(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CourseInstance.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courseInstances'] }),
  });

  const startEdit = (instance) => {
    setForm({
      course_id: instance.course_id || '',
      term_id: instance.term_id || '',
      cohort_name: instance.cohort_name || '',
      instructor_emails: instance.instructor_emails || [],
      start_date: instance.start_date || '',
      end_date: instance.end_date || '',
      max_students: instance.max_students || '',
      meeting_schedule: instance.meeting_schedule || '',
      status: instance.status || 'scheduled',
    });
    setEditingId(instance.id);
    setShowForm(false);
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const addInstructor = () => {
    const email = instructorInput.trim().toLowerCase();
    if (email && !form.instructor_emails.includes(email)) {
      setForm(f => ({ ...f, instructor_emails: [...f.instructor_emails, email] }));
    }
    setInstructorInput('');
  };

  const removeInstructor = (email) => {
    setForm(f => ({ ...f, instructor_emails: f.instructor_emails.filter(e => e !== email) }));
  };

  const getCourse = (id) => courses.find(c => c.id === id);
  const getTerm = (id) => terms.find(t => t.id === id);

  const isFormOpen = showForm || !!editingId;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="bg-[#1e3a5f]"
        >
          <Plus className="w-4 h-4 mr-1" /> New Course Instance
        </Button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <Card>
          <CardHeader className="py-4 px-6">
            <CardTitle className="text-base">{editingId ? 'Edit Course Instance' : 'Schedule New Course Instance'}</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Course</Label>
                <Select value={form.course_id} onValueChange={v => setForm(f => ({ ...f, course_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select course..." /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Term</Label>
                <Select value={form.term_id} onValueChange={v => setForm(f => ({ ...f, term_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select term..." /></SelectTrigger>
                  <SelectContent>
                    {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name || `${t.season} ${t.year}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Cohort Name</Label>
                <Input className="mt-1" placeholder="e.g. Cohort A, Evening Section" value={form.cohort_name} onChange={e => setForm(f => ({ ...f, cohort_name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Meeting Schedule</Label>
                <Input className="mt-1" placeholder="e.g. Tuesdays 7pm GMT" value={form.meeting_schedule} onChange={e => setForm(f => ({ ...f, meeting_schedule: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input className="mt-1" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input className="mt-1" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Max Students</Label>
                <Input className="mt-1" type="number" placeholder="Leave blank for unlimited" value={form.max_students} onChange={e => setForm(f => ({ ...f, max_students: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Instructors */}
            <div>
              <Label className="text-xs">Instructors</Label>
              <div className="mt-1 flex gap-2">
                <Select value={instructorInput} onValueChange={setInstructorInput}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select instructor..." /></SelectTrigger>
                  <SelectContent>
                    {instructorProfiles.map(p => (
                      <SelectItem key={p.instructor_email} value={p.instructor_email}>
                        {p.display_name || p.instructor_email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={addInstructor} disabled={!instructorInput}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.instructor_emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.instructor_emails.map(email => {
                    const profile = instructorProfiles.find(p => p.instructor_email === email);
                    return (
                      <Badge key={email} variant="secondary" className="gap-1">
                        {profile?.display_name || email}
                        <button onClick={() => removeInstructor(email)} className="ml-1 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={!form.course_id || !form.term_id || !form.cohort_name || !form.start_date || !form.end_date || createMutation.isPending || updateMutation.isPending}
                className="bg-[#1e3a5f]"
              >
                <Check className="w-4 h-4 mr-1" /> {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instances list */}
      {instances.length === 0 && !isFormOpen ? (
        <Card><CardContent className="p-8 text-center text-slate-400">No course instances yet. Click "New Course Instance" to schedule one.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {instances.map(instance => {
            const course = getCourse(instance.course_id);
            const term = getTerm(instance.term_id);
            return (
              <Card key={instance.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-900">{course?.title_en || 'Unknown Course'}</p>
                      <Badge className={STATUS_COLORS[instance.status] || 'bg-slate-100 text-slate-600'}>{instance.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {term?.name || instance.term_id || '—'} · {instance.cohort_name}
                      </span>
                      {instance.start_date && (
                        <span>{instance.start_date} → {instance.end_date}</span>
                      )}
                      {instance.meeting_schedule && (
                        <span>{instance.meeting_schedule}</span>
                      )}
                    </div>
                    {instance.instructor_emails?.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {instance.instructor_emails.map(email => {
                          const profile = instructorProfiles.find(p => p.instructor_email === email);
                          return (
                            <span key={email} className="text-xs text-slate-500">{profile?.display_name || email}</span>
                          );
                        })}
                      </div>
                    )}
                    {instance.max_students && (
                      <p className="text-xs text-slate-400 mt-1">{instance.current_enrollment || 0} / {instance.max_students} enrolled</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => startEdit(instance)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(instance.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}