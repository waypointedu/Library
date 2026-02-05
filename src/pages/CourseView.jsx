import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  CheckCircle2,
  Clock,
  Menu,
  X
} from "lucide-react";

export default function CourseView() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.list();
      return courses.find(c => c.id === courseId);
    },
    enabled: !!courseId
  });

  const { data: weeks = [] } = useQuery({
    queryKey: ['weeks', courseId],
    queryFn: () => base44.entities.Week.filter({ course_id: courseId }),
    select: (data) => data.sort((a, b) => a.week_number - b.week_number),
    enabled: !!courseId
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', courseId, user?.email],
    queryFn: () => base44.entities.Progress.filter({ course_id: courseId, user_email: user?.email }),
    enabled: !!user?.email && !!courseId
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => base44.entities.Announcement.filter({ published: true }),
    select: (data) => data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5)
  });

  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const selectWeek = (week) => {
    setSelectedContent({ type: 'week', data: week });
  };

  if (!courseId || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  const title = course[`title_${lang}`] || course.title_en;
  const completedWeeks = progress.filter(p => p.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">
                {completedWeeks} / {weeks.length} {lang === 'es' ? 'semanas completadas' : 'weeks completed'}
              </p>
            </div>
          </div>
          <Link to={createPageUrl(`Dashboard?lang=${lang}`)}>
            <Button variant="outline" size="sm">
              {lang === 'es' ? 'Volver al Panel' : 'Back to Dashboard'}
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out flex flex-col`}
        >
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1">
                  {lang === 'es' ? 'Contenido' : 'Content'}
                </TabsTrigger>
                <TabsTrigger value="announcements" className="flex-1">
                  {lang === 'es' ? 'Anuncios' : 'Announcements'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-2 mt-4">
                {weeks.map(week => {
                  const weekTitle = week[`title_${lang}`] || week.title_en;
                  const isExpanded = expandedWeeks[week.id];
                  const isCompleted = progress.some(p => p.week_id === week.id && p.completed);

                  return (
                    <div key={week.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleWeek(week.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <div className="text-left">
                            <p className="font-medium text-slate-900 text-sm">
                              {lang === 'es' ? 'Semana' : 'Week'} {week.week_number}
                            </p>
                            <p className="text-xs text-slate-500">{weekTitle}</p>
                          </div>
                        </div>
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3 space-y-1">
                          <button
                            onClick={() => selectWeek(week)}
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2"
                          >
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            {lang === 'es' ? 'Material de Lectura' : 'Reading Material'}
                          </button>

                          {week.has_written_assignment && (
                            <button
                              onClick={() => setSelectedContent({ type: 'assignment', data: week })}
                              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-slate-400" />
                              {lang === 'es' ? 'Tarea Escrita' : 'Written Assignment'}
                            </button>
                          )}

                          {week.has_discussion && (
                            <button
                              onClick={() => setSelectedContent({ type: 'discussion', data: week })}
                              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4 text-slate-400" />
                              {lang === 'es' ? 'Foro de Discusión' : 'Discussion Forum'}
                            </button>
                          )}

                          {week.has_quiz && (
                            <button
                              onClick={() => setSelectedContent({ type: 'quiz', data: week })}
                              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-slate-400" />
                              {lang === 'es' ? 'Cuestionario' : 'Quiz'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="announcements" className="mt-4 space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    {lang === 'es' ? 'No hay anuncios' : 'No announcements'}
                  </p>
                ) : (
                  announcements.map(announcement => (
                    <Card key={announcement.id} className="border-slate-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">{announcement.title}</CardTitle>
                        <p className="text-xs text-slate-500">
                          {new Date(announcement.created_date).toLocaleDateString()}
                        </p>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-600">
                        <div dangerouslySetInnerHTML={{ __html: announcement.content.substring(0, 150) + '...' }} />
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedContent ? (
            <div className="max-w-4xl mx-auto">
              <Card className="border-slate-200">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    {lang === 'es' ? 'Bienvenido al Curso' : 'Welcome to the Course'}
                  </h2>
                  <p className="text-slate-600">
                    {lang === 'es' 
                      ? 'Selecciona una semana del menú lateral para comenzar' 
                      : 'Select a week from the sidebar to get started'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : selectedContent.type === 'week' ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-light text-slate-900 mb-2">
                  {selectedContent.data[`title_${lang}`] || selectedContent.data.title_en}
                </h2>
                <p className="text-slate-600">
                  {lang === 'es' ? 'Semana' : 'Week'} {selectedContent.data.week_number}
                </p>
              </div>

              {selectedContent.data[`overview_${lang}`] && (
                <Card className="border-slate-200 mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {lang === 'es' ? 'Resumen' : 'Overview'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      {selectedContent.data[`overview_${lang}`] || selectedContent.data.overview_en}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div 
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedContent.data[`lesson_content_${lang}`] || selectedContent.data.lesson_content_en || ''
                    }} 
                  />
                </CardContent>
              </Card>

              {selectedContent.data[`reading_assignment_${lang}`] && (
                <Card className="border-slate-200 mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {lang === 'es' ? 'Lectura Asignada' : 'Reading Assignment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      {selectedContent.data[`reading_assignment_${lang}`] || selectedContent.data.reading_assignment_en}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : selectedContent.type === 'assignment' ? (
            <div className="max-w-4xl mx-auto">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {lang === 'es' ? 'Tarea Escrita' : 'Written Assignment'}
                  </CardTitle>
                  <p className="text-slate-600">
                    {lang === 'es' ? 'Semana' : 'Week'} {selectedContent.data.week_number}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-slate-700">
                      {selectedContent.data[`written_assignment_${lang}`] || selectedContent.data.written_assignment_en}
                    </p>
                  </div>
                  <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                    {lang === 'es' ? 'Ver Detalles de la Tarea' : 'View Assignment Details'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : selectedContent.type === 'discussion' ? (
            <div className="max-w-4xl mx-auto">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {lang === 'es' ? 'Foro de Discusión' : 'Discussion Forum'}
                  </CardTitle>
                  <p className="text-slate-600">
                    {lang === 'es' ? 'Semana' : 'Week'} {selectedContent.data.week_number}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-slate-700">
                      {selectedContent.data[`discussion_prompt_${lang}`] || selectedContent.data.discussion_prompt_en}
                    </p>
                  </div>
                  <Link to={createPageUrl(`CourseForum?courseId=${courseId}&lang=${lang}`)}>
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                      {lang === 'es' ? 'Ir al Foro' : 'Go to Forum'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : selectedContent.type === 'quiz' ? (
            <div className="max-w-4xl mx-auto">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {lang === 'es' ? 'Cuestionario' : 'Quiz'}
                  </CardTitle>
                  <p className="text-slate-600">
                    {lang === 'es' ? 'Semana' : 'Week'} {selectedContent.data.week_number}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                    {lang === 'es' ? 'Comenzar Cuestionario' : 'Start Quiz'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}