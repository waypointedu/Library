import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, BookOpen, Award, TrendingUp, Search, FileText, Download } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DetailedAnalytics({ lang }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => base44.entities.Enrollment.list()
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => base44.entities.Progress.list()
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quizAttempts'],
    queryFn: () => base44.entities.QuizAttempt.list()
  });

  const userStats = users.map(user => {
    const userEnrollments = enrollments.filter(e => e.user_email === user.email);
    const userProgress = progress.filter(p => p.user_email === user.email);
    const userQuizzes = quizAttempts.filter(qa => qa.user_email === user.email);
    
    const completedCourses = userEnrollments.filter(e => e.status === 'completed').length;
    const completedLessons = userProgress.filter(p => p.completed).length;
    const passedQuizzes = userQuizzes.filter(qa => qa.passed).length;
    const avgQuizScore = userQuizzes.length > 0 
      ? (userQuizzes.reduce((sum, qa) => sum + qa.score, 0) / userQuizzes.length).toFixed(1)
      : 0;

    return {
      ...user,
      enrolledCourses: userEnrollments.length,
      completedCourses,
      completedLessons,
      passedQuizzes,
      avgQuizScore
    };
  });

  const filteredUsers = userStats.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCourse === 'all') return matchesSearch;
    
    const hasEnrollment = enrollments.some(e => e.user_email === user.email && e.course_id === selectedCourse);
    return matchesSearch && hasEnrollment;
  });

  const courseEngagement = courses.map(course => {
    const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
    const completedEnrollments = courseEnrollments.filter(e => e.status === 'completed');
    const completionRate = courseEnrollments.length > 0 
      ? ((completedEnrollments.length / courseEnrollments.length) * 100).toFixed(0)
      : 0;

    return {
      name: course.title_en?.substring(0, 20) || 'Course',
      enrolled: courseEnrollments.length,
      completed: completedEnrollments.length,
      completionRate: parseInt(completionRate)
    };
  });

  const text = {
    en: {
      title: "Detailed Analytics & Progress Tracking",
      overview: "System Overview",
      totalUsers: "Total Users",
      activeEnrollments: "Active Enrollments",
      totalLessonsCompleted: "Lessons Completed",
      avgCompletionRate: "Avg Completion Rate",
      userProgress: "User Progress Dashboard",
      search: "Search by name or email",
      filterCourse: "Filter by course",
      allCourses: "All Courses",
      name: "Name",
      email: "Email",
      enrolled: "Enrolled",
      completed: "Completed",
      lessons: "Lessons",
      quizzes: "Quizzes",
      avgScore: "Avg Score",
      viewTranscript: "View Transcript",
      courseEngagement: "Course Engagement Metrics",
      engagementChart: "Enrollments vs Completions by Course"
    },
    es: {
      title: "Análisis Detallado y Seguimiento de Progreso",
      overview: "Resumen del Sistema",
      totalUsers: "Usuarios Totales",
      activeEnrollments: "Inscripciones Activas",
      totalLessonsCompleted: "Lecciones Completadas",
      avgCompletionRate: "Tasa de Finalización Promedio",
      userProgress: "Panel de Progreso de Usuarios",
      search: "Buscar por nombre o correo",
      filterCourse: "Filtrar por curso",
      allCourses: "Todos los Cursos",
      name: "Nombre",
      email: "Correo",
      enrolled: "Inscritos",
      completed: "Completados",
      lessons: "Lecciones",
      quizzes: "Quizzes",
      avgScore: "Puntaje Prom.",
      viewTranscript: "Ver Expediente",
      courseEngagement: "Métricas de Participación en Cursos",
      engagementChart: "Inscripciones vs Finalizaciones por Curso"
    }
  };

  const t = text[lang];

  const totalCompletedLessons = progress.filter(p => p.completed).length;
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const totalCompletions = enrollments.filter(e => e.status === 'completed').length;
  const avgCompletionRate = enrollments.length > 0 
    ? ((totalCompletions / enrollments.length) * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-[#1e3a5f]" />
        <h2 className="text-2xl font-semibold text-slate-900">{t.title}</h2>
      </div>

      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t.overview}</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                  <div className="text-sm text-slate-500">{t.totalUsers}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{activeEnrollments}</div>
                  <div className="text-sm text-slate-500">{t.activeEnrollments}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{totalCompletedLessons}</div>
                  <div className="text-sm text-slate-500">{t.totalLessonsCompleted}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{avgCompletionRate}%</div>
                  <div className="text-sm text-slate-500">{t.avgCompletionRate}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t.courseEngagement}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrolled" fill="#1e3a5f" name={t.enrolled} />
              <Bar dataKey="completed" fill="#c4933f" name={t.completed} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.userProgress}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCourses}</SelectItem>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead className="text-center">{t.enrolled}</TableHead>
                  <TableHead className="text-center">{t.completed}</TableHead>
                  <TableHead className="text-center">{t.lessons}</TableHead>
                  <TableHead className="text-center">{t.quizzes}</TableHead>
                  <TableHead className="text-center">{t.avgScore}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{user.enrolledCourses}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800">{user.completedCourses}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{user.completedLessons}</TableCell>
                    <TableCell className="text-center">{user.passedQuizzes}</TableCell>
                    <TableCell className="text-center">
                      <span className={user.avgQuizScore >= 70 ? 'text-green-600 font-semibold' : 'text-slate-600'}>
                        {user.avgQuizScore}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link to={createPageUrl(`Transcript?email=${user.email}&lang=${lang}`)}>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          {t.viewTranscript}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}