import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";
import { format } from 'date-fns';

export default function AnnouncementFeed({ user, lang = 'en' }) {
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', 'published'],
    queryFn: async () => {
      const all = await base44.entities.Announcement.filter({ published: true });
      const userRole = user.user_type || user.role || 'user';
      const filtered = all.filter(a => {
        if (a.target_audience === 'all') return true;
        if (a.target_audience === 'students' && !['instructor', 'admin'].includes(userRole)) return true;
        if (a.target_audience === 'instructors' && userRole === 'instructor') return true;
        if (a.target_audience === 'admins' && userRole === 'admin') return true;
        return false;
      });
      return filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);
    },
    enabled: !!user
  });

  if (announcements.length === 0) return null;

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          {lang === 'es' ? 'Anuncios' : 'Announcements'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {announcements.map(announcement => (
            <div key={announcement.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-slate-900">{announcement.title}</h4>
                <Badge className={`text-xs ${priorityColors[announcement.priority]}`}>{announcement.priority}</Badge>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{announcement.content}</p>
              <p className="text-xs text-slate-400 mt-1">{format(new Date(announcement.created_date), 'MMM d, yyyy')}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}