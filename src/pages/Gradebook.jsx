import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award } from "lucide-react";

export default function Gradebook() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: weeks = [] } = useQuery({
    queryKey: ['weeks', courseId],
    queryFn: () => base44.entities.Week.filter({ course_id: courseId }),
    select: (data) => data.sort((a, b) => a.week_number - b.week_number),
    enabled: !!courseId
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['weekQuizAttempts', courseId, user?.email],
    queryFn: () => base44.entities.WeekQuizAttempt.filter({ course_id: courseId, user_email: user?.email }),
    enabled: !!courseId && !!user?.email
  });

  const { data: writtenSubmissions = [] } = useQuery({
    queryKey: ['writtenSubmissions', courseId, user?.email],
    queryFn: () => base44.entities.WrittenAssignmentSubmission.filter({ course_id: courseId, user_email: user?.email }),
    enabled: !!courseId && !!user?.email
  });

  const t = {
    en: { title: 'My Grades', week: 'Week', assignment: 'Assignment', grade: 'Grade', status: 'Status', graded: 'Graded', pending: 'Pending', noGrades: 'No grades available yet', average: 'Course Average' },
    es: { title: 'Mis Calificaciones', week: 'Semana', assignment: 'Tarea', grade: 'Calificación', status: 'Estado', graded: 'Calificado', pending: 'Pendiente', noGrades: 'No hay calificaciones disponibles aún', average: 'Promedio del Curso' }
  }[lang];

  const gradeRows = weeks.flatMap(week => {
    const rows = [];
    if (week.has_quiz) {
      const quizAttempt = quizAttempts.find(qa => qa.week_id === week.id && qa.passed);
      rows.push({ week: week.week_number, assignment: 'Quiz', grade: quizAttempt?.final_score, graded: !!quizAttempt });
    }
    if (week.has_written_assignment) {
      const submission = writtenSubmissions.find(ws => ws.week_id === week.id);
      rows.push({ week: week.week_number, assignment: lang === 'es' ? 'Tarea Escrita' : 'Written Assignment', grade: submission?.grade, graded: submission?.status === 'graded' });
    }
    return rows;
  });

  const gradedCount = gradeRows.filter(r => r.graded).length;
  const totalGrades = gradeRows.reduce((sum, r) => sum + (r.grade || 0), 0);
  const average = gradedCount > 0 ? Math.round(totalGrades / gradedCount) : 0;

  if (!user || !course) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <Link to={createPageUrl(`CourseView?id=${courseId}&lang=${lang}`)} className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="w-4 h-4" />{course[`title_${lang}`] || course.title_en}
        </Link>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-[#1e3a5f]">{average}%</p>
            <p className="text-xs text-slate-500">{t.average}</p>
          </Card>
        </div>

        {gradeRows.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-slate-500">{t.noGrades}</CardContent></Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.week}</TableHead>
                  <TableHead>{t.assignment}</TableHead>
                  <TableHead>{t.grade}</TableHead>
                  <TableHead>{t.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeRows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.week}</TableCell>
                    <TableCell>{row.assignment}</TableCell>
                    <TableCell>{row.graded ? `${row.grade}%` : '—'}</TableCell>
                    <TableCell>
                      <Badge className={row.graded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {row.graded ? t.graded : t.pending}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}