import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

export default function PathwayManager({ lang = 'en', user }) {
  const [newTitle, setNewTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: pathways = [] } = useQuery({
    queryKey: ['pathways'],
    queryFn: () => base44.entities.Pathway.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'published' }),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Pathway.create({ title_en: newTitle || 'New Pathway', type: 'certificate', course_ids: [], status: 'draft' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pathways'] }); setNewTitle(''); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pathway.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pathways'] }),
  });

  const statusColor = { draft: 'bg-slate-100 text-slate-600', published: 'bg-green-100 text-green-700', archived: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="New pathway title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="bg-[#1e3a5f]">
          <Plus className="w-4 h-4 mr-1" /> Create
        </Button>
      </div>

      {pathways.map(pathway => (
        <Card key={pathway.id}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{pathway[`title_${lang}`] || pathway.title_en}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge className={statusColor[pathway.status]}>{pathway.status}</Badge>
                <Badge variant="outline">{pathway.type}</Badge>
                <span className="text-xs text-slate-500">{(pathway.course_ids || []).length} courses</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(pathway.id)}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </CardHeader>
        </Card>
      ))}

      {pathways.length === 0 && (
        <Card><CardContent className="p-8 text-center text-slate-400">No pathways yet. Create one above.</CardContent></Card>
      )}
    </div>
  );
}