import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, Clock, BookOpen, Star, Users, CheckCircle2, 
  Target, GraduationCap, PlayCircle 
} from "lucide-react";
import ModuleAccordion from '@/components/courses/ModuleAccordion';
import LanguageToggle from '@/components/common/LanguageToggle';
import LanguageFallbackNotice from '@/components/common/LanguageFallbackNotice';
import ProgressBar from '@/components/common/ProgressBar';

export default function Course() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
    const newUrl = `${window.location.pathname}?id=${courseId}&lang=${lang}`;
    window.history.replaceState({}, '', newUrl);
  }, [lang, courseId]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }),
    select: (data) => data[0],
    enabled: !!courseId
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => base44.entities.Module.filter({ course_id: courseId }),
    select: (data) => data.sort((a, b) => a.order_index - b.order_index),
    enabled: !!courseId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const allLessons = [];
      for (const mod of modules) {
        const modLessons = await base44.entities.Lesson.filter({ module_id: mod.id });
        allLessons.push(...modLessons);
      }
      return allLessons;
    },
    enabled: modules.length > 0
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, user_email: user?.email }),
    select: (data) => data[0],
    enabled: !!user?.email && !!courseId
  });

  const { data: userPrefs } = useQuery({
    queryKey: ['userPrefs', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user?.email });
      return prefs[0];
    },
    enabled: !!user?.email
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', courseId, user?.email],
    queryFn: () => base44.entities.Progress.filter({ course_id: courseId, user_email: user?.email, completed: true }),
    enabled: !!user?.email && !!courseId
  });

  const enrollMutation = useMutation({
    mutationFn: () => base44.entities.Enrollment.create({
      course_id: courseId,
      user_email: user.email,
      status: 'active',
      enrolled_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId, user?.email] });
    }
  });

  useEffect(() => {
    if (course) {
      const hasLangContent = course[`title_${lang}`] && course[`description_${lang}`];
      setShowFallback(lang === 'es' && !hasLangContent);
    }
  }, [course, lang]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{lang === 'es' ? 'Curso no encontrado' : 'Course not found'}</p>
          <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-[#1e3a5f] font-medium hover:underline">
            {lang === 'es' ? 'Volver al catálogo' : 'Back to catalog'}
          </Link>
        </div>
      </div>
    );
  }

  const title = course[`title_${lang}`] || course.title_en;
  const description = course[`description_${lang}`] || course.description_en;
  const prerequisites = course[`prerequisites_${lang}`] || course.prerequisites_en;
  const outcomes = course[`learning_outcomes_${lang}`] || course.learning_outcomes_en || [];
  
  const completedLessonIds = progress.map(p => p.lesson_id);
  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleEnroll = () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    enrollMutation.mutate();
  };

  const firstLesson = lessons.sort((a, b) => a.order_index - b.order_index)[0];

  const text = {
    en: {
      backToCatalog: "Back to catalog",
      enrolled: "Enrolled",
      enroll: "Enroll Now",
      continue: "Continue Learning",
      start: "Start Course",
      weeks: "weeks",
      credits: "credits",
      lessons: "lessons",
      progress: "Progress",
      prerequisites: "Prerequisites",
      outcomes: "Learning Outcomes",
      curriculum: "Curriculum"
    },
    es: {
      backToCatalog: "Volver al catálogo",
      enrolled: "Inscrito",
      enroll: "Inscribirse",
      continue: "Continuar Aprendiendo",
      start: "Comenzar Curso",
      weeks: "semanas",
      credits: "créditos",
      lessons: "lecciones",
      progress: "Progreso",
      prerequisites: "Requisitos previos",
      outcomes: "Resultados de Aprendizaje",
      curriculum: "Contenido del curso"
    }
  };

  const t = text[lang];

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
          <div className="flex items-center gap-2">
            {user && <AccessibilityMenu user={user} userPrefs={userPrefs} lang={lang} />}
            <LanguageToggle currentLang={lang} onToggle={setLang} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link
            to={createPageUrl(`Catalog?lang=${lang}`)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToCatalog}
          </Link>

          {showFallback && <LanguageFallbackNotice requestedLang={lang} />}

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="bg-slate-100">
                    {tag}
                  </Badge>
                ))}
                {enrollment && (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {t.enrolled}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">{title}</h1>
              <p className="text-xl text-slate-500 mb-8">{description}</p>

              <div className="flex flex-wrap gap-6 text-slate-600">
                {course.duration_weeks && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    {course.duration_weeks} {t.weeks}
                  </span>
                )}
                {course.credits && (
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-slate-400" />
                    {course.credits} {t.credits}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                  {totalLessons} {t.lessons}
                </span>
              </div>
            </div>

            <div>
              <Card className="border-slate-100 shadow-lg sticky top-24">
                {course.cover_image_url && (
                  <div className="aspect-video overflow-hidden rounded-t-xl">
                    <img
                      src={course.cover_image_url}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  {enrollment ? (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">{t.progress}</span>
                          <span className="font-medium">{progressPercent}%</span>
                        </div>
                        <ProgressBar value={progressPercent} />
                      </div>
                      {firstLesson && (
                        <Link to={createPageUrl(`Lesson?id=${firstLesson.id}&lang=${lang}`)}>
                          <Button className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8a] gap-2">
                            <PlayCircle className="w-4 h-4" />
                            {progressPercent > 0 ? t.continue : t.start}
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending}
                      className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8a]"
                    >
                      {enrollMutation.isPending ? '...' : t.enroll}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* Learning Outcomes */}
              {outcomes.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                    <Target className="w-6 h-6 text-[#1e3a5f]" />
                    {t.outcomes}
                  </h2>
                  <ul className="space-y-3">
                    {outcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curriculum */}
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-[#1e3a5f]" />
                  {t.curriculum}
                </h2>
                <ModuleAccordion
                  modules={modules}
                  lessons={lessons}
                  completedLessons={completedLessonIds}
                  lang={lang}
                  courseId={courseId}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {prerequisites && (
                <Card className="border-slate-100">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-3">{t.prerequisites}</h3>
                    <p className="text-slate-500">{prerequisites}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}