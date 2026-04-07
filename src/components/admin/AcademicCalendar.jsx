import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

const STATUS_COLORS = { upcoming: 'bg-blue-100 text-blue-700', active: 'bg-green-100 text-green-700', completed: 'bg-slate-100 text-slate-600' };

export default function AcademicCalendar({ lang = 'en' }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ season: 'Spring', year: new Date().getFullYear() + 1, start_date: '', end_date: '', status: 'upcoming' });
  const queryClient = useQueryClient();

  const { data: terms = [] } = useQuery({
    queryKey: ['terms'],
    queryFn: () => base44.entities.AcademicTerm.list('-start_date'),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.AcademicTerm.create({ ...form, year: Number(form.year), name: `${form.season} ${form.year}` }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['terms'] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AcademicTerm.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['terms'] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AcademicTerm.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['terms'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#1e3a5f]"><Plus className="w-4 h-4 mr-1" /> New Term</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Season</Label>
              <Select value={form.season} onValueChange={v => setForm(f => ({ ...f, season: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Spring', 'Summer', 'Fall', 'Winter'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Year</Label>
              <Input className="mt-1" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input className="mt-1" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input className="mt-1" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
            <div className="col-span-2 md:col-span-1 flex items-end gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!form.start_date || !form.end_date || createMutation.isPending} className="bg-[#1e3a5f] flex-1">Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {terms.map(term => (
        <Card key={term.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{term.name || `${term.season} ${term.year}`}</p>
              <p className="text-sm text-slate-500">{term.start_date} → {term.end_date}</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={term.status} onValueChange={status => updateStatusMutation.mutate({ id: term.id, status })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(term.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {terms.length === 0 && !showForm && (
        <Card><CardContent className="p-8 text-center text-slate-400">No academic terms yet.</CardContent></Card>
      )}
    </div>
  );
}