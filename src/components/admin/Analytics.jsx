import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';

export default function Analytics({ lang = 'en' }) {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => base44.entities.Course.list() });
  const { data: enrollments = [] } = useQuery({ queryKey: ['allEnrollments'], queryFn: () => base44.entities.Enrollment.list() });
  const { data: applications = [] } = useQuery({ queryKey: ['applications'], queryFn: () => base44.entities.Application.list() });

  const stats = [
    { label: lang === 'es' ? 'Usuarios' : 'Total Users', value: users.length, icon: Users, color: 'text-blue-600' },
    { label: lang === 'es' ? 'Cursos' : 'Published Courses', value: courses.filter(c => c.status === 'published').length, icon: BookOpen, color: 'text-green-600' },
    { label: lang === 'es' ? 'Inscripciones' : 'Active Enrollments', value: enrollments.filter(e => e.status === 'active').length, icon: TrendingUp, color: 'text-purple-600' },
    { label: lang === 'es' ? 'Solicitudes' : 'Pending Applications', value: applications.filter(a => a.status === 'submitted').length, icon: FileText, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>{lang === 'es' ? 'Inscripciones Recientes' : 'Recent Enrollments'}</CardTitle></CardHeader>
        <CardContent>
          {enrollments.slice(0, 10).map(e => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <p className="text-sm text-slate-700">{e.user_email}</p>
              <p className="text-xs text-slate-400">{e.status}</p>
            </div>
          ))}
          {enrollments.length === 0 && <p className="text-sm text-slate-400">No enrollments yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}