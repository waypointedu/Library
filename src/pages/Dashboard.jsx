import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Star, BookOpen, Trophy, Clock, ArrowRight, 
  GraduationCap, Target, ChevronRight 
} from "lucide-react";
import CourseCard from '../components/courses/CourseCard';
import LanguageToggle from '../components/common/LanguageToggle';
import ProgressBar from '../components/common/ProgressBar';

export default function Dashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
    const newUrl = `${window.location.pathname}?lang=${lang}`;
    window.history.replaceState({}, '', newUrl);
  }, [lang]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allProgress', user?.email],
    queryFn: () => base44.entities.Progress.filter({ user_email: user?.email, completed: true }),
    enabled: !!user?.email
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['allLessons'],
    queryFn: () => base44.entities.Lesson.list()
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quizAttempts', user?.email],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const enrolledCourses = courses.filter(c => 
    enrollments.some(e => e.course_id === c.id)
  );

  const getCourseProgress = (courseId) => {
    const courseLessons = allLessons.filter(l => {
      return allProgress.some(p => p.course_id === courseId && p.lesson_id === l.id);
    });
    const courseAllLessons = allProgress.filter(p => p.course_id === courseId);
    const total = allLessons.filter(l => allProgress.some(p => p.lesson_id === l.id && p.course_id === courseId)).length || 0;
    const completed = allProgress.filter(p => p.course_id === courseId && p.completed).length;
    
    // Rough estimate - we need lessons per course
    return total > 0 ? Math.round((completed / Math.max(total, completed)) * 100) : 0;
  };

  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const totalLessonsCompleted = allProgress.length;
  const passedQuizzes = quizAttempts.filter(a => a.passed).length;

  const text = {
    en: {
      welcome: "Welcome back",
      myCourses: "My Courses",
      exploreCourses: "Explore more courses",
      stats: {
        enrolled: "Courses Enrolled",
        completed: "Courses Completed",
        lessons: "Lessons Completed",
        quizzes: "Quizzes Passed"
      },
      noCourses: "You haven't enrolled in any courses yet.",
      browseButton: "Browse Courses",
      continue: "Continue Learning",
      recentActivity: "Recent Activity",
      viewCourse: "View Course"
    },
    es: {
      welcome: "Bienvenido de nuevo",
      myCourses: "Mis Cursos",
      exploreCourses: "Explorar más cursos",
      stats: {
        enrolled: "Cursos Inscritos",
        completed: "Cursos Completados",
        lessons: "Lecciones Completadas",
        quizzes: "Quizzes Aprobados"
      },
      noCourses: "Aún no te has inscrito en ningún curso.",
      browseButton: "Explorar Cursos",
      continue: "Continuar Aprendiendo",
      recentActivity: "Actividad Reciente",
      viewCourse: "Ver Curso"
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Waypoint Institute</span>
          </Link>

          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={setLang} />
            {user.role === 'admin' && (
              <Link to={createPageUrl(`Admin?lang=${lang}`)}>
                <Button variant="outline" size="sm">Admin</Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => base44.auth.logout()}
            >
              {lang === 'es' ? 'Cerrar sesión' : 'Sign out'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-light text-slate-900 mb-2">
            {t.welcome}, <span className="font-semibold">{user.full_name || user.email}</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: t.stats.enrolled, value: enrollments.length, icon: BookOpen, color: 'bg-blue-500' },
            { label: t.stats.completed, value: completedCourses, icon: Trophy, color: 'bg-emerald-500' },
            { label: t.stats.lessons, value: totalLessonsCompleted, icon: Target, color: 'bg-purple-500' },
            { label: t.stats.quizzes, value: passedQuizzes, icon: GraduationCap, color: 'bg-amber-500' }
          ].map((stat, i) => (
            <Card key={i} className="border-slate-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.color}/10 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">{t.myCourses}</h2>
            <Link
              to={createPageUrl(`Catalog?lang=${lang}`)}
              className="text-[#1e3a5f] font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              {t.exploreCourses}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <Card className="border-slate-100">
              <CardContent className="py-16 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-6">{t.noCourses}</p>
                <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
                  <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                    {t.browseButton}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  lang={lang}
                  enrolled={true}
                  progress={getCourseProgress(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}