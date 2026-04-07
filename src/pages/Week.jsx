import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowLeft, BookOpen, FileText, MessageSquare, ClipboardCheck } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';
import WrittenAssignmentStudent from '@/components/assignments/WrittenAssignmentStudent';
import WeekQuizStudent from '@/components/quiz/WeekQuizStudent';
import ReadingTracker from '@/components/gamification/ReadingTracker';

export default function Week() {
  const urlParams = new URLSearchParams(window.location.search);
  const weekId = urlParams.get('id');
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [courseLang, setCourseLang] = useState(urlParams.get('courseLang') || 'en');
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

  const availableLanguages = course?.language_availability || ['en'];

  useEffect(() => {
    if (course && availableLanguages.length > 0 && !availableLanguages.includes(courseLang)) {
      setCourseLang(availableLanguages[0]);
    }
  }, [course, availableLanguages]);

  const getVideoEmbedUrl = (url) => {
    if (!url) return '';
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const loomMatch = url.match(/loom\.com\/share\/([^?\s]+)/);
    if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  if (!week) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{lang === 'es' ? 'Semana no encontrada' : 'Week not found'}</p>
          <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-[#1e3a5f] hover:underline">{lang === 'es' ? 'Volver al catálogo' : 'Back to catalog'}</Link>
        </div>
      </div>
    );
  }

  const title = week[`title_${courseLang}`] || week.title_en;
  const overview = week[`overview_${courseLang}`] || week.overview_en;
  const contentBlocks = week[`content_blocks_${courseLang}`] || week.content_blocks_en || [];
  const lessonContent = week[`lesson_content_${courseLang}`] || week.lesson_content_en;
  const readingAssignment = week[`reading_assignment_${courseLang}`] || week.reading_assignment_en;

  const text = {
    en: { backToCourse: 'Back to course', overview: 'Overview', lesson: 'Lesson', reading: 'Reading Assignment', discussion: 'Discussion Forum', openForum: 'Open Forum' },
    es: { backToCourse: 'Volver al curso', overview: 'Descripción', lesson: 'Lección', reading: 'Lectura Asignada', discussion: 'Foro de Discusión', openForum: 'Abrir Foro' }
  };
  const t = text[lang];

  return (
    <div className="min-h-screen bg-white">
      {user && <ReadingTracker weekId={weekId} courseId={week?.course_id} userEmail={user?.email} />}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {course && (
            <Link to={createPageUrl(`Course?id=${course.id}&lang=${lang}`)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />{t.backToCourse}
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Week Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <span>Week {week.week_number}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        </div>

        {/* Overview */}
        {overview && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-medium text-blue-700 mb-2">{t.overview}</h2>
            <p className="text-slate-700">{overview}</p>
          </div>
        )}

        {/* Content Blocks */}
        {contentBlocks.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900">{t.lesson}</h2>
            {contentBlocks.map((block, index) => (
              <div key={index}>
                {block.type === 'text' && <p className="text-slate-700 whitespace-pre-wrap">{block.content}</p>}
                {block.type === 'richtext' && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />}
                {block.type === 'video' && block.url && (
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <iframe src={getVideoEmbedUrl(block.url)} className="w-full h-full" allowFullScreen />
                  </div>
                )}
                {block.type === 'image' && block.url && (
                  <img src={block.url} alt={block.caption || ''} className="rounded-xl max-w-full" />
                )}
                {block.caption && <p className="text-slate-400 text-sm text-center mt-1">{block.caption}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Legacy Lesson Content */}
        {!contentBlocks.length && lessonContent && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t.lesson}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lessonContent }} />
          </div>
        )}

        {/* Reading Assignment */}
        {readingAssignment && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />{t.reading}
              </h2>
              <p className="text-slate-700">{readingAssignment}</p>
            </CardContent>
          </Card>
        )}

        {/* Written Assignment */}
        {week.has_written_assignment && user && (
          <div className="mb-6">
            <WrittenAssignmentStudent week={week} courseId={week.course_id} user={user} lang={lang} />
          </div>
        )}

        {/* Quiz */}
        {week.has_quiz && user && (
          <div className="mb-6">
            <WeekQuizStudent weekId={weekId} user={user} lang={lang} />
          </div>
        )}

        {/* Discussion */}
        {week.has_discussion && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 mb-3">{t.discussion}</p>
              <Link to={createPageUrl(`CourseForum?courseId=${week.course_id}&lang=${lang}`)}>
                <Button className="bg-[#1e3a5f]">{t.openForum}</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}