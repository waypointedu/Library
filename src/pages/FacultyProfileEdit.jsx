import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Save, ChevronUp, ChevronDown, Pencil, Check, X } from "lucide-react";

export default function FacultyProfileEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetEmail = urlParams.get('email');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState(null);

  const [newCourse, setNewCourse] = useState({ category: '', title: '' });
  const [newSeminar, setNewSeminar] = useState('');
  const [newResearch, setNewResearch] = useState('');
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '', note: '', dissertation: '' });
  const [newBook, setNewBook] = useState({ title: '', note: '' });
  const [newLecture, setNewLecture] = useState({ title: '', venue: '', url: '' });
  const [editingIdx, setEditingIdx] = useState({});

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (u.role !== 'admin' && u.email !== targetEmail) {
        navigate(`/FacultyProfile?email=${encodeURIComponent(targetEmail)}`);
      }
    }).catch(() => { base44.auth.redirectToLogin(); });
  }, [targetEmail]);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['facultyProfileEdit', targetEmail],
    queryFn: () => base44.entities.InstructorProfile.filter({ instructor_email: targetEmail }),
    enabled: !!targetEmail
  });

  useEffect(() => {
    if (profiles.length > 0 && !form) {
      const p = profiles[0];
      setForm({
        id: p.id,
        instructor_email: p.instructor_email,
        display_name: p.display_name || '',
        title: p.title || '',
        photo_url: p.photo_url || '',
        positioning_sentence: p.positioning_sentence || '',
        overview: p.overview || '',
        faculty_type: p.faculty_type || 'contributing',
        is_published: p.is_published !== false,
        education: (p.education || []).map(edu => ({ ...edu, year: edu.year !== undefined && edu.year !== null ? String(edu.year) : '' })),
        courses_taught: p.courses_taught || [],
        seminars: p.seminars || [],
        research_areas: p.research_areas || [],
        books: p.books || [],
        lectures: p.lectures || [],
      });
    } else if (profiles.length === 0 && !isLoading && !form && targetEmail) {
      setForm({
        instructor_email: targetEmail,
        display_name: '', title: '', photo_url: '', positioning_sentence: '', overview: '',
        faculty_type: 'contributing', is_published: true,
        education: [], courses_taught: [], seminars: [], research_areas: [], books: [], lectures: [],
      });
    }
  }, [profiles, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        instructor_email: form.instructor_email,
        display_name: form.display_name,
        title: form.title,
        photo_url: form.photo_url,
        positioning_sentence: form.positioning_sentence,
        overview: form.overview,
        faculty_type: form.faculty_type,
        is_published: form.is_published,
        education: (form.education || []).map(edu => ({ degree: edu.degree || '', institution: edu.institution || '', year: edu.year ? String(edu.year) : '', note: edu.note || '', dissertation: edu.dissertation || '' })),
        courses_taught: form.courses_taught || [],
        seminars: form.seminars || [],
        research_areas: form.research_areas || [],
        books: form.books || [],
        lectures: form.lectures || [],
      };
      if (form.id) return base44.entities.InstructorProfile.update(form.id, data);
      return base44.entities.InstructorProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultyProfile', targetEmail] });
      queryClient.invalidateQueries({ queryKey: ['facultyProfiles'] });
      navigate(`/FacultyProfile?email=${encodeURIComponent(targetEmail)}`);
    }
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const addToArray = (key, item) => setForm(f => ({ ...f, [key]: [...(f[key] || []), item] }));
  const removeFromArray = (key, index) => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }));

  if (!form) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link to={`/FacultyProfile?email=${encodeURIComponent(targetEmail)}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Link>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-[#1e3a5f]">
          <Save className="w-4 h-4 mr-1" />
          {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
          <div>
            <label className="text-sm font-medium text-slate-700">Display Name</label>
            <Input value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="e.g. Michael C. Barros" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Title (core faculty only)</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Scholar of Religion & Culture" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Photo URL</label>
            <Input value={form.photo_url} onChange={e => set('photo_url', e.target.value)} placeholder="https://..." className="mt-1" />
            {form.photo_url && <img src={form.photo_url} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Faculty Type</label>
            <select value={form.faculty_type} onChange={e => set('faculty_type', e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm bg-white">
              <option value="core">Core</option>
              <option value="contributing">Contributing</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} className="w-4 h-4 rounded" />
            <label className="text-sm text-slate-700">Visible on Faculty page</label>
          </div>
        </section>

        {/* Narrative */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Narrative</h2>
          <div>
            <label className="text-sm font-medium text-slate-700">Positioning Sentence</label>
            <Input value={form.positioning_sentence} onChange={e => set('positioning_sentence', e.target.value)} placeholder="One-sentence researcher positioning..." className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Overview (5-7 sentences)</label>
            <Textarea rows={6} value={form.overview} onChange={e => set('overview', e.target.value)} placeholder="Biographical overview..." className="mt-1" />
          </div>
        </section>

        {/* Courses Taught */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Courses Taught</h2>
          {form.courses_taught.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
              <span className="text-sm flex-1">{c.category}: {c.title}</span>
              <button onClick={() => removeFromArray('courses_taught', i)}><X className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Category" value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })} />
            <Input placeholder="Title" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
            <Button size="sm" onClick={() => { if (newCourse.title) { addToArray('courses_taught', newCourse); setNewCourse({ category: '', title: '' }); } }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Seminars */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Seminars</h2>
          {form.seminars.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
              <span className="text-sm flex-1">{s}</span>
              <button onClick={() => removeFromArray('seminars', i)}><X className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Seminar title" value={newSeminar} onChange={e => setNewSeminar(e.target.value)} />
            <Button size="sm" onClick={() => { if (newSeminar) { addToArray('seminars', newSeminar); setNewSeminar(''); } }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Education */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Education</h2>
          {form.education.map((edu, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
              <span className="text-sm flex-1">{edu.degree} — {edu.institution} {edu.year ? `(${edu.year})` : ''}</span>
              <button onClick={() => removeFromArray('education', i)}><X className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Degree" value={newEducation.degree} onChange={e => setNewEducation({ ...newEducation, degree: e.target.value })} />
            <Input placeholder="Institution" value={newEducation.institution} onChange={e => setNewEducation({ ...newEducation, institution: e.target.value })} />
            <Input placeholder="Year" value={newEducation.year} onChange={e => setNewEducation({ ...newEducation, year: e.target.value })} />
            <Input placeholder="Note (e.g. ABD)" value={newEducation.note} onChange={e => setNewEducation({ ...newEducation, note: e.target.value })} />
          </div>
          <Button size="sm" onClick={() => { if (newEducation.degree) { addToArray('education', newEducation); setNewEducation({ degree: '', institution: '', year: '', note: '', dissertation: '' }); } }}>
            <Plus className="w-4 h-4 mr-1" /> Add Education
          </Button>
        </section>

        {/* Books */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Books</h2>
          {form.books.map((b, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
              <span className="text-sm flex-1">{b.title} {b.note ? `(${b.note})` : ''}</span>
              <button onClick={() => removeFromArray('books', i)}><X className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Title" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} />
            <Input placeholder="Note (e.g. forthcoming)" value={newBook.note} onChange={e => setNewBook({ ...newBook, note: e.target.value })} />
            <Button size="sm" onClick={() => { if (newBook.title) { addToArray('books', newBook); setNewBook({ title: '', note: '' }); } }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Lectures */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Lectures & Media</h2>
          {form.lectures.map((l, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
              <span className="text-sm flex-1">{l.title} — {l.venue}</span>
              <button onClick={() => removeFromArray('lectures', i)}><X className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Title" value={newLecture.title} onChange={e => setNewLecture({ ...newLecture, title: e.target.value })} />
            <Input placeholder="Venue" value={newLecture.venue} onChange={e => setNewLecture({ ...newLecture, venue: e.target.value })} />
            <Input placeholder="URL (optional)" value={newLecture.url} onChange={e => setNewLecture({ ...newLecture, url: e.target.value })} className="col-span-2" />
          </div>
          <Button size="sm" onClick={() => { if (newLecture.title) { addToArray('lectures', newLecture); setNewLecture({ title: '', venue: '', url: '' }); } }}>
            <Plus className="w-4 h-4 mr-1" /> Add Lecture
          </Button>
        </section>
      </div>
    </div>
  );
}