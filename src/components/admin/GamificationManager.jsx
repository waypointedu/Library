import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Award } from 'lucide-react';

export default function GamificationManager() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title_en: '', description_en: '', points: 10, icon: 'Award', trigger_type: 'first_lesson' });
  const queryClient = useQueryClient();

  const { data: badges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Badge.create({ ...form, points: Number(form.points) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['all-badges'] }); setShowForm(false); setForm({ title_en: '', description_en: '', points: 10, icon: 'Award', trigger_type: 'first_lesson' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Badge.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-badges'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#1e3a5f]"><Plus className="w-4 h-4 mr-1" /> New Badge</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div><Label className="text-xs">Title</Label><Input className="mt-1" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} /></div>
            <div><Label className="text-xs">Description</Label><Textarea className="mt-1" rows={2} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} /></div>
            <div><Label className="text-xs">Points</Label><Input className="mt-1" type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!form.title_en || createMutation.isPending} className="bg-[#1e3a5f]">Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {badges.map(badge => (
          <Card key={badge.id}>
            <CardContent className="p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Award className="w-8 h-8 text-[#1e3a5f] mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">{badge.title_en}</p>
                  <p className="text-xs text-slate-500">{badge.points} pts · {badge.trigger_type}</p>
                  {badge.description_en && <p className="text-xs text-slate-400 mt-1">{badge.description_en}</p>}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(badge.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
            </CardContent>
          </Card>
        ))}
        {badges.length === 0 && !showForm && <p className="text-sm text-slate-400 col-span-3">No badges yet.</p>}
      </div>
    </div>
  );
}