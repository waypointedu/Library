import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DetailedAnalytics({ lang = 'en' }) {
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => base44.entities.Course.list() });
  const { data: enrollments = [] } = useQuery({ queryKey: ['allEnrollments'], queryFn: () => base44.entities.Enrollment.list() });

  const courseEnrollmentData = courses.map(c => ({
    name: (c.title_en || 'Untitled').slice(0, 20),
    enrollments: enrollments.filter(e => e.course_id === c.id).length,
  })).sort((a, b) => b.enrollments - a.enrollments).slice(0, 8);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{lang === 'es' ? 'Inscripciones por Curso' : 'Enrollments by Course'}</CardTitle></CardHeader>
        <CardContent>
          {courseEnrollmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseEnrollmentData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">No data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}