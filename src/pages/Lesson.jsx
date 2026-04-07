import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, PlayCircle, Circle } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';
import LanguageFallbackNotice from '@/components/common/LanguageFallbackNotice';
import ProgressBar from '@/components/common/ProgressBar';
import QuizContainer from '@/components/quiz/QuizContainer';
import CommentSection from '@/components/lesson/CommentSection';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import MobileNav from '@/components/common/MobileNav';
import { jsPDF } from 'jspdf';

export default function Lesson() {
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
    const newUrl = `${window.location.pathname}?id=${lessonId}&lang=${lang}`;
    window.history.replaceState({}, '', newUrl);
  }, [lang, lessonId]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => base44.entities.Lesson.filter({ id: lessonId }),
    select: (data) => data[0],
    enabled: !!lessonId
  });

  const { data: module } = useQuery({
    queryKey: ['module', lesson?.module_id],
    queryFn: () => base44.entities.Module.filter({ id: lesson.module_id }),
    select: (data) => data[0],
    enabled: !!lesson?.module_id
  });

  const { data: course } = useQuery({
    queryKey: ['course', module?.course_id],
    queryFn: () => base44.entities.Course.filter({ id: module.course_id }),
    select: (data) => data[0],
    enabled: !!module?.course_id
  });

  const { data: moduleLessons = [] } = useQuery({
    queryKey: ['moduleLessons', lesson?.module_id],
    queryFn: () => base44.entities.Lesson.filter({ module_id: lesson.module_id }),
    select: (data) => data.sort((a, b) => a.order_index - b.order_index),
    enabled: !!lesson?.module_id
  });

  const { data: quiz } = useQuery({
    queryKey: ['lessonQuiz', lessonId],
    queryFn: () => base44.entities.Quiz.filter({ lesson_id: lessonId }),
    select: (data) => data[0],
    enabled: !!lessonId
  });

  const { data: progress } = useQuery({
    queryKey: ['lessonProgress', lessonId, user?.email],
    queryFn: () => base44.entities.Progress.filter({ lesson_id: lessonId, user_email: user?.email }),
    select: (data) => data[0],
    enabled: !!user?.email && !!lessonId
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['moduleProgress', user?.email, lesson?.module_id],
    queryFn: () => base44.entities.Progress.filter({ user_email: user?.email, module_id: lesson?.module_id }),
    enabled: !!user?.email && !!lesson?.module_id
  });

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (progress) {
        return base44.entities.Progress.update(progress.id, { completed: true, completed_date: new Date().toISOString() });
      } else {
        return base44.entities.Progress.create({
          user_email: user.email, lesson_id: lessonId, module_id: lesson.module_id,
          course_id: module.course_id, completed: true, completed_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonProgress', lessonId, user?.email] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    }
  });

  useEffect(() => {
    if (lesson) {
      const hasLangContent = lesson[`content_${lang}`];
      setShowFallback(lang === 'es' && !hasLangContent);
    }
  }, [lesson, lang]);

  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{lang === 'es' ? 'Lección no encontrada' : 'Lesson not found'}</p>
          <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-[#1e3a5f] hover:underline">{lang === 'es' ? 'Volver al catálogo' : 'Back to catalog'}</Link>
        </div>
      </div>
    );
  }

  const title = lesson[`title_${lang}`] || lesson.title_en;
  const content = lesson[`content_${lang}`] || lesson.content_en || '';
  const moduleTitle = module?.[`title_${lang}`] || module?.title_en;
  const courseTitle = course?.[`title_${lang}`] || course?.title_en;

  const currentIndex = moduleLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null;

  const isComplete = progress?.completed === true;

  const completedInModule = moduleLessons.filter(l => allProgress.some(p => p.lesson_id === l.id && p.completed)).length;
  const moduleProgress = moduleLessons.length > 0 ? Math.round((completedInModule / moduleLessons.length) * 100) : 0;

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const getVimeoEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(lesson.video_url) || getVimeoEmbedUrl(lesson.video_url);

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    pdf.setFontSize(20);
    pdf.text(title, margin, y);
    y += 15;

    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin);
    lines.forEach(line => {
      if (y > pdf.internal.pageSize.getHeight() - 20) { pdf.addPage(); y = 20; }
      pdf.text(line, margin, y);
      y += 7;
    });

    pdf.save(`lesson-${lessonId}.pdf`);
  };

  const t = {
    en: { backToCourse: "Back to course", markComplete: "Mark as complete", completed: "Completed", previous: "Previous", next: "Next", attachments: "Attachments", quiz: "Quiz", downloadPDF: "Download PDF", moduleProgress: "Module Progress" },
    es: { backToCourse: "Volver al curso", markComplete: "Marcar como completada", completed: "Completada", previous: "Anterior", next: "Siguiente", attachments: "Archivos adjuntos", quiz: "Quiz", downloadPDF: "Descargar PDF", moduleProgress: "Progreso del Módulo" }
  };
  const text = t[lang];

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {course && (
            <Link to={createPageUrl(`Course?id=${module.course_id}&lang=${lang}`)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />{text.backToCourse}
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadPDF}>{text.downloadPDF}</Button>
            <LanguageToggle currentLang={lang} onToggle={setLang} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {course && module && (
          <Breadcrumbs
            items={[
              { label: courseTitle, url: `Course?id=${module.course_id}&lang=${lang}` },
              { label: moduleTitle },
              { label: title }
            ]}
            lang={lang}
          />
        )}

        {showFallback && <LanguageFallbackNotice requestedLang={lang} />}

        {/* Lesson Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <div className="flex items-center gap-3 mt-1">
              {lesson.estimated_minutes && <span className="text-sm text-slate-500">{lesson.estimated_minutes} min</span>}
              {isComplete && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />{text.completed}</span>}
            </div>
          </div>
          {!isComplete && user && (
            <Button onClick={() => markCompleteMutation.mutate()} disabled={markCompleteMutation.isPending} className="bg-[#1e3a5f]">
              <CheckCircle2 className="w-4 h-4 mr-1" />{text.markComplete}
            </Button>
          )}
        </div>

        {/* Module Progress */}
        {moduleLessons.length > 1 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-500 mb-1">
              <span>{text.moduleProgress}</span>
              <span>{moduleProgress}%</span>
            </div>
            <ProgressBar value={moduleProgress} />
            <p className="text-xs text-slate-400 mt-1">{completedInModule} / {moduleLessons.length} {lang === 'es' ? 'lecciones' : 'lessons'}</p>
          </div>
        )}

        {/* Video */}
        {embedUrl && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
          </div>
        )}

        {/* Content */}
        {content && (
          <div className="prose max-w-none mb-8">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {/* Attachments */}
        {lesson.attachments?.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">{text.attachments}</h3>
              <div className="space-y-2">
                {lesson.attachments.map((att, i) => (
                  <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#1e3a5f] hover:underline">
                    <Download className="w-4 h-4" />{att.title}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz */}
        {quiz && user && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{text.quiz}</h3>
            <QuizContainer quizId={quiz.id} user={user} courseId={module?.course_id} lessonId={lessonId} lang={lang} />
          </div>
        )}

        {/* Comments */}
        {user && <div className="mb-8"><CommentSection lessonId={lessonId} user={user} lang={lang} /></div>}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {prevLesson ? (
            <Link to={createPageUrl(`Lesson?id=${prevLesson.id}&lang=${lang}`)}>
              <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1" />{text.previous}</Button>
            </Link>
          ) : <div />}
          {nextLesson && (
            <Link to={createPageUrl(`Lesson?id=${nextLesson.id}&lang=${lang}`)}>
              <Button className="bg-[#1e3a5f]">{text.next}<ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          )}
        </div>
      </div>

      <MobileNav lang={lang} />
    </div>
  );
}