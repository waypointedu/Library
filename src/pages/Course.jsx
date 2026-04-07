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
  Target, GraduationCap, PlayCircle, MessageSquare
} from "lucide-react";
import AccessibilityMenu from '@/components/accessibility/AccessibilityMenu';
import ModuleAccordion from '@/components/courses/ModuleAccordion';
import LanguageToggle from '@/components/common/LanguageToggle';
import LanguageFallbackNotice from '@/components/common/LanguageFallbackNotice';
import ProgressBar from '@/components/common/ProgressBar';

export default function Course() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.list();
      return allCourses.find(c => c.id === courseId);
    },
    enabled: !!courseId
  });

  const { data: courseInstances = [] } = useQuery({
    queryKey: ['courseInstances', courseId],
    queryFn: async () => {
      const instances = await base44.entities.CourseInstance.filter({ course_id: courseId });
      return instances.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    },
    enabled: !!courseId
  });

  const { data: terms = [] } = useQuery({
    queryKey: ['academicTerms'],
    queryFn: () => base44.entities.AcademicTerm.list()
  });

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const isEnrolled = (instanceId) =>
    myEnrollments.some(e => e.course_instance_id === instanceId && e.status !== 'dropped');

  const enrollMutation = useMutation({
    mutationFn: async (instanceId) => {
      const instance = courseInstances.find(i => i.id === instanceId);
      if (isEnrolled(instanceId)) throw new Error('Already enrolled');

      if (course.prerequisite_course_ids && course.prerequisite_course_ids.length > 0) {
        const completedEnrollments = await base44.entities.Enrollment.filter({
          user_email: user.email, status: 'completed'
        });
        const completedCourseIds = completedEnrollments.map(e => e.course_id);
        const missingPrereqs = course.prerequisite_course_ids.filter(pid => !completedCourseIds.includes(pid));
        if (missingPrereqs.length > 0) throw new Error('Prerequisites not met');
      }

      if (instance?.max_students && instance.current_enrollment >= instance.max_students) {
        throw new Error('Course is full');
      }

      await base44.entities.Enrollment.create({
        course_id: courseId,
        course_instance_id: instanceId,
        user_email: user.email,
        status: 'active',
        enrolled_date: new Date().toISOString()
      });

      if (instance) {
        await base44.entities.CourseInstance.update(instanceId, {
          current_enrollment: (instance.current_enrollment || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courseInstances'] });
    },
    onError: (error) => {
      if (error.message === 'Prerequisites not met') {
        alert(lang === 'es' ? 'Debes completar los cursos prerequisitos antes de inscribirte.' : 'You must complete prerequisite courses before enrolling.');
      } else if (error.message === 'Course is full') {
        alert(lang === 'es' ? 'Este curso está lleno.' : 'This course is full.');
      }
    }
  });

  const unenrollMutation = useMutation({
    mutationFn: async (instanceId) => {
      const enrollment = myEnrollments.find(e => e.course_instance_id === instanceId && e.status !== 'dropped');
      if (!enrollment) throw new Error('Not enrolled');
      await base44.entities.Enrollment.update(enrollment.id, { status: 'dropped' });
      const instance = courseInstances.find(i => i.id === instanceId);
      if (instance) {
        await base44.entities.CourseInstance.update(instanceId, {
          current_enrollment: Math.max(0, (instance.current_enrollment || 1) - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courseInstances'] });
    }
  });

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{lang === 'es' ? 'No se especificó ningún curso' : 'No course specified'}</p>
          <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-[#1e3a5f] hover:underline">{lang === 'es' ? 'Ir al catálogo' : 'Go to catalog'}</Link>
        </div>
      </div>
    );
  }

  if (isLoading || !course) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const title = course[`title_${lang}`] || course.title_en;
  const description = course[`description_${lang}`] || course.description_en;
  const outcomes = course[`learning_outcomes_${lang}`] || course.learning_outcomes_en || [];

  const handleEnroll = async (instanceId) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    enrollMutation.mutate(instanceId);
  };

  const text = {
    en: {
      backToCatalog: "Back to catalog",
      enroll: "Enroll",
      weeks: "weeks",
      credits: "credits",
      outcomes: "What You'll Learn",
      schedule: "Upcoming Sessions",
      noSessions: "No sessions scheduled yet",
      full: "Full",
      spotsLeft: "spots left"
    },
    es: {
      backToCatalog: "Volver al catálogo",
      enroll: "Inscribirse",
      weeks: "semanas",
      credits: "créditos",
      outcomes: "Lo que Aprenderás",
      schedule: "Sesiones Próximas",
      noSessions: "No hay sesiones programadas aún",
      full: "Lleno",
      spotsLeft: "lugares disponibles"
    }
  };

  const t = text[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />{t.backToCatalog}
          </Link>
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1e3a5f] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {course.cover_image_url && (
            <div className="mb-6">
              <img src={course.cover_image_url} alt={title} className="w-full max-h-64 object-cover rounded-xl" />
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {course.tags?.map((tag, i) => (
              <Badge key={i} className="bg-white/20 text-white border-0">{tag}</Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
          <p className="text-white/80 mb-6">{description}</p>
          <div className="flex gap-4 text-white/70 text-sm">
            {course.duration_weeks && (
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration_weeks} {t.weeks}</span>
            )}
            {course.credits && (
              <span className="flex items-center gap-1"><Star className="w-4 h-4" />{course.credits} {t.credits}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* What You'll Learn */}
        {outcomes.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{t.outcomes}</h2>
            <ul className="grid md:grid-cols-2 gap-2">
              {outcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Schedule */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">{t.schedule}</h2>
          {courseInstances.length > 0 ? (
            <div className="space-y-4">
              {courseInstances.map(instance => {
                const term = terms.find(t => t.id === instance.term_id);
                const isFull = instance.max_students && instance.current_enrollment >= instance.max_students;
                const spotsLeft = instance.max_students ? instance.max_students - (instance.current_enrollment || 0) : null;
                return (
                  <Card key={instance.id}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-900 mb-2">{term?.name || instance.cohort_name}</h3>
                      <p className="text-slate-600 text-sm mb-3">
                        {new Date(instance.start_date).toLocaleDateString()} - {new Date(instance.end_date).toLocaleDateString()}
                      </p>
                      {instance.meeting_schedule && (
                        <p className="text-slate-500 text-sm mb-3">📅 {instance.meeting_schedule}</p>
                      )}
                      {spotsLeft !== null && (
                        <p className="text-slate-500 text-sm mb-4">{spotsLeft} {t.spotsLeft}</p>
                      )}
                      {isEnrolled(instance.id) ? (
                        <Button
                          variant="outline"
                          onClick={() => unenrollMutation.mutate(instance.id)}
                          disabled={unenrollMutation.isPending}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {unenrollMutation.isPending ? '...' : (lang === 'es' ? 'Cancelar inscripción' : 'Unenroll')}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEnroll(instance.id)}
                          disabled={enrollMutation.isPending || isFull}
                          className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8a]"
                        >
                          {isFull ? t.full : (enrollMutation.isPending ? '...' : t.enroll)}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">{t.noSessions}</CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}