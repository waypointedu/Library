import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export default function AnnouncementManager() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', target_audience: 'all', priority: 'normal', published: false });
  const queryClient = useQueryClient();

  const { data: announcements = [] } = useQuery({
    queryKey: ['allAnnouncements'],
    queryFn: () => base44.entities.Announcement.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Announcement.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] }); setShowForm(false); setForm({ title: '', content: '', target_audience: 'all', priority: 'normal', published: false }); },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, published }) => base44.entities.Announcement.update(id, { published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAnnouncements'] }),
  });

  const priorityColor = { low: 'bg-slate-100 text-slate-600', normal: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#1e3a5f]"><Plus className="w-4 h-4 mr-1" /> New Announcement</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div><Label className="text-xs">Title</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label className="text-xs">Content</Label><Textarea className="mt-1" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Audience</Label>
                <Select value={form.target_audience} onValueChange={v => setForm(f => ({ ...f, target_audience: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="instructors">Instructors</SelectItem>
                    <SelectItem value="admins">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || !form.content || createMutation.isPending} className="bg-[#1e3a5f]">Create</Button>
              <Button variant="outline" onClick={() => { setForm(f => ({ ...f, published: true })); createMutation.mutate(); }} disabled={!form.title || !form.content || createMutation.isPending}>Publish Now</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {announcements.map(a => (
          <Card key={a.id}>
            <CardContent className="p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900">{a.title}</p>
                  <Badge className={priorityColor[a.priority]}>{a.priority}</Badge>
                  {a.published ? <Badge className="bg-green-100 text-green-700">Published</Badge> : <Badge variant="outline">Draft</Badge>}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{a.content}</p>
                <p className="text-xs text-slate-400 mt-1">For: {a.target_audience}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={() => togglePublishMutation.mutate({ id: a.id, published: !a.published })}>
                  {a.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(a.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && !showForm && <Card><CardContent className="p-8 text-center text-slate-400">No announcements yet.</CardContent></Card>}
      </div>
    </div>
  );
}