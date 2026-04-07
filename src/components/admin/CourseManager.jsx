import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Search, BookOpen } from 'lucide-react';

export default function CourseManager({ lang = 'en', user }) {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const createCourseMutation = useMutation({
    mutationFn: () => base44.entities.Course.create({ title_en: 'New Course', status: 'draft' }),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      window.location.href = createPageUrl(`CourseEditor?id=${newCourse.id}`);
    },
  });

  const filtered = courses.filter(c =>
    !search || (c.title_en || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = { draft: 'bg-slate-100 text-slate-600', published: 'bg-green-100 text-green-700', archived: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => createCourseMutation.mutate()} disabled={createCourseMutation.isPending} className="bg-[#1e3a5f]">
          <Plus className="w-4 h-4 mr-1" /> New Course
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-slate-400"><BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No courses found.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(course => (
            <Card key={course.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{course.title_en}</p>
                  <p className="text-sm text-slate-500">{course.duration_weeks ? `${course.duration_weeks} weeks` : ''}{course.credits ? ` · ${course.credits} credits` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColor[course.status] || 'bg-slate-100 text-slate-600'}>{course.status}</Badge>
                  <Link to={createPageUrl(`CourseEditor?id=${course.id}`)}>
                    <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}