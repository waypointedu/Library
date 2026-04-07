import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink } from 'lucide-react';

export default function StudentManager() {
  const [search, setSearch] = useState('');

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
  const { data: enrollments = [] } = useQuery({ queryKey: ['allEnrollments'], queryFn: () => base44.entities.Enrollment.list() });

  const students = users.filter(u => u.role === 'user' || !u.role);

  const filtered = students.filter(u =>
    !search ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const getEnrollmentCount = (email) => enrollments.filter(e => e.user_email === email && e.status === 'active').length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input className="pl-9" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <p className="text-sm text-slate-500">{filtered.length} students</p>

      <div className="space-y-2">
        {filtered.map(u => (
          <Card key={u.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-sm font-bold">
                  {(u.full_name || u.email)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{u.full_name || '—'}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{getEnrollmentCount(u.email)} courses</Badge>
                <Link to={createPageUrl(`Transcript?email=${u.email}`)}>
                  <Button size="sm" variant="outline"><ExternalLink className="w-3 h-3 mr-1" /> Transcript</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <Card><CardContent className="p-8 text-center text-slate-400">No students found.</CardContent></Card>}
      </div>
    </div>
  );
}