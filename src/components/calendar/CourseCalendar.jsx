import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default function CourseCalendar({ user, userType = 'student', lang = 'en' }) {
  const { data: courseInstances = [] } = useQuery({
    queryKey: ['courseInstances'],
    queryFn: () => base44.entities.CourseInstance.filter({ status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const enrolledInstanceIds = new Set(enrollments.map(e => e.course_instance_id).filter(Boolean));
  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id).filter(Boolean));

  const relevantInstances = userType === 'instructor'
    ? courseInstances.filter(ci => ci.instructor_emails?.includes(user?.email))
    : courseInstances.filter(ci => enrolledInstanceIds.has(ci.id) || enrolledCourseIds.has(ci.course_id));

  if (relevantInstances.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />{lang === 'es' ? 'Calendario' : 'Course Schedule'}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">{lang === 'es' ? 'No hay cursos programados.' : 'No scheduled courses found.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {lang === 'es' ? 'Calendario de Cursos' : 'Course Schedule'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relevantInstances.map(instance => {
            const course = courses.find(c => c.id === instance.course_id);
            if (!course) return null;
            const title = course[`title_${lang}`] || course.title_en;
            return (
              <div key={instance.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{title}</p>
                  <p className="text-sm text-slate-500">{instance.cohort_name}</p>
                  {instance.meeting_schedule && <p className="text-xs text-slate-400 mt-1">{instance.meeting_schedule}</p>}
                  <p className="text-xs text-slate-400">{instance.start_date} → {instance.end_date}</p>
                </div>
                <Badge className={instance.status === 'active' ? 'bg-green-100 text-green-700' : instance.status === 'completed' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}>
                  {instance.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}