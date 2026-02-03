import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Users, BookOpen, TrendingUp, Eye } from 'lucide-react';
import LanguageToggle from '@/components/common/LanguageToggle';

export default function InstructorDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.role !== 'instructor' && u.role !== 'admin') {
        window.location.href = createPageUrl('Dashboard');
      }
      setUser(u);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['instructorCourses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => base44.entities.Enrollment.list()
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allProgress'],
    queryFn: () => base44.entities.Progress.list()
  });

  const { data: allQuizAttempts = [] } = useQuery({
    queryKey: ['allQuizAttempts'],
    queryFn: () => base44.entities.QuizAttempt.list()
  });

  const text = {
    en: {
      title: 'Instructor Dashboard',
      myCourses: 'My Courses',
      students: 'Students',
      analytics: 'Analytics',
      courseTitle: 'Course',
      enrolled: 'Enrolled',
      avgProgress: 'Avg Progress',
      actions: 'Actions',
      viewDetails: 'View Details',
      totalStudents: 'Total Students',
      activeCourses: 'Active Courses',
      avgCompletion: 'Avg Completion',
      studentName: 'Student',
      progress: 'Progress',
      quizzesPassed: 'Quizzes Passed'
    },
    es: {
      title: 'Panel del Instructor',
      myCourses: 'Mis Cursos',
      students: 'Estudiantes',
      analytics: 'Analíticas',
      courseTitle: 'Curso',
      enrolled: 'Inscritos',
      avgProgress: 'Progreso Prom.',
      actions: 'Acciones',
      viewDetails: 'Ver Detalles',
      totalStudents: 'Total Estudiantes',
      activeCourses: 'Cursos Activos',
      avgCompletion: 'Completado Prom.',
      studentName: 'Estudiante',
      progress: 'Progreso',
      quizzesPassed: 'Quizzes Aprobados'
    }
  };
  const t = text[lang];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  const myCourseIds = courses.map(c => c.id);
  const myEnrollments = allEnrollments.filter(e => myCourseIds.includes(e.course_id));
  const uniqueStudents = [...new Set(myEnrollments.map(e => e.user_email))].length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Waypoint Institute</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={setLang} />
            <Link to={createPageUrl(`Dashboard?lang=${lang}`)}>
              <Button variant="outline" size="sm">
                {lang === 'es' ? 'Mi Panel' : 'My Dashboard'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light text-slate-900 mb-8">{t.title}</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{t.totalStudents}</p>
                  <p className="text-3xl font-semibold text-slate-900">{uniqueStudents}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{t.activeCourses}</p>
                  <p className="text-3xl font-semibold text-slate-900">{courses.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{t.avgCompletion}</p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {myEnrollments.filter(e => e.status === 'completed').length > 0
                      ? Math.round((myEnrollments.filter(e => e.status === 'completed').length / myEnrollments.length) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t.myCourses}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.courseTitle}</TableHead>
                  <TableHead>{t.enrolled}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map(course => {
                  const enrolled = allEnrollments.filter(e => e.course_id === course.id).length;
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course[`title_${lang}`] || course.title_en}
                      </TableCell>
                      <TableCell>{enrolled}</TableCell>
                      <TableCell>
                        <Link to={createPageUrl(`Course?id=${course.id}&lang=${lang}`)}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            {t.viewDetails}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}