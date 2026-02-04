import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ArrowLeft, BookOpen, FileText, MessageSquare, ClipboardCheck } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';
import WrittenAssignmentStudent from '@/components/assignments/WrittenAssignmentStudent';
import WeekQuizStudent from '@/components/quiz/WeekQuizStudent';

export default function Week() {
  const urlParams = new URLSearchParams(window.location.search);
  const weekId = urlParams.get('id');
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
    const newUrl = `${window.location.pathname}?id=${weekId}&lang=${lang}`;
    window.history.replaceState({}, '', newUrl);
  }, [lang, weekId]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: week, isLoading } = useQuery({
    queryKey: ['week', weekId],
    queryFn: async () => {
      const weeks = await base44.entities.Week.filter({ id: weekId });
      return weeks[0];
    },
    enabled: !!weekId
  });

  const { data: course } = useQuery({
    queryKey: ['course', week?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: week.course_id });
      return courses[0];
    },
    enabled: !!week?.course_id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  if (!week) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{lang === 'es' ? 'Semana no encontrada' : 'Week not found'}</p>
          <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
            <Button className="bg-[#1e3a5f]">
              {lang === 'es' ? 'Volver al catálogo' : 'Back to catalog'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = week[`title_${lang}`] || week.title_en;
  const overview = week[`overview_${lang}`] || week.overview_en;
  const lessonContent = week[`lesson_content_${lang}`] || week.lesson_content_en;
  const readingAssignment = week[`reading_assignment_${lang}`] || week.reading_assignment_en;

  const text = {
    en: {
      backToCourse: 'Back to course',
      overview: 'Overview',
      lesson: 'Lesson',
      reading: 'Reading Assignment',
      discussion: 'Discussion Forum',
      openForum: 'Open Forum'
    },
    es: {
      backToCourse: 'Volver al curso',
      overview: 'Descripción',
      lesson: 'Lección',
      reading: 'Lectura Asignada',
      discussion: 'Foro de Discusión',
      openForum: 'Abrir Foro'
    }
  };

  const t = text[lang];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint Institute" className="h-10" />
          </Link>
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        {/* Back Link */}
        {course && (
          <Link
            to={createPageUrl(`Course?id=${course.id}&lang=${lang}`)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToCourse}
          </Link>
        )}

        {/* Week Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-500">Week {week.week_number}</p>
        </div>

        {/* Overview */}
        {overview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1e3a5f]" />
                {t.overview}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">{overview}</p>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        {lessonContent && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1e3a5f]" />
                {t.lesson}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-slate prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonContent }}
              />
            </CardContent>
          </Card>
        )}

        {/* Reading Assignment */}
        {readingAssignment && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1e3a5f]" />
                {t.reading}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-slate-600"
                dangerouslySetInnerHTML={{ __html: readingAssignment }}
              />
            </CardContent>
          </Card>
        )}

        {/* Discussion Forum */}
        {week.has_discussion && course && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1e3a5f]" />
                {t.discussion}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to={createPageUrl(`CourseForum?courseId=${course.id}&lang=${lang}`)}>
                <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t.openForum}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Written Assignment */}
        {week.has_written_assignment && user && (
          <div className="mb-6">
            <WrittenAssignmentStudent
              week={week}
              courseId={week.course_id}
              user={user}
              lang={lang}
            />
          </div>
        )}

        {/* Quiz */}
        {week.has_quiz && user && (
          <div className="mb-6">
            <WeekQuizStudent weekId={week.id} user={user} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}