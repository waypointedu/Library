import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_COLORS = {
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  waitlisted: 'bg-orange-100 text-orange-700',
  declined: 'bg-red-100 text-red-700',
};

export default function ApplicationsManager({ lang = 'en' }) {
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => base44.entities.Application.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Application.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });

  const filtered = filterStatus === 'all' ? applications : applications.filter(a => a.status === filterStatus);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-slate-500">{filtered.length} applications</span>
      </div>

      {filtered.map(app => (
        <Card key={app.id}>
          <CardContent className="p-0">
            <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
              <div>
                <p className="font-medium text-slate-900">{app.full_name}</p>
                <p className="text-sm text-slate-500">{app.email} · {app.country}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={STATUS_COLORS[app.status] || 'bg-slate-100 text-slate-600'}>{app.status?.replace(/_/g, ' ')}</Badge>
                {expanded === app.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {expanded === app.id && (
              <div className="border-t border-slate-100 p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Faith Journey</p>
                  <p className="text-sm text-slate-700">{app.faith_journey}</p>
                </div>
                {app.ministry_experience && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Ministry Experience</p>
                    <p className="text-sm text-slate-700">{app.ministry_experience}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-2">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {['under_review', 'accepted', 'waitlisted', 'declined'].map(s => (
                      <Button key={s} size="sm" variant={app.status === s ? 'default' : 'outline'}
                        className={app.status === s ? 'bg-[#1e3a5f]' : ''}
                        onClick={() => updateMutation.mutate({ id: app.id, data: { status: s, decision_date: new Date().toISOString() } })}>
                        {s.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {filtered.length === 0 && (
        <Card><CardContent className="p-8 text-center text-slate-400">No applications found.</CardContent></Card>
      )}
    </div>
  );
}