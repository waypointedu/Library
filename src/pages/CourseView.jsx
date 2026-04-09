import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ChevronDown, ChevronRight, BookOpen, FileText, MessageSquare,
  CheckCircle2, Clock, Menu, X, Edit, Users, Eye, Trash2, ClipboardCheck, Pencil
} from "lucide-react";
import WeekQuizStudent from '@/components/quiz/WeekQuizStudent';
import WrittenAssignmentStudent from '@/components/assignments/WrittenAssignmentStudent';
import ThreadedReplies from '@/components/forum/ThreadedReplies';

export default function CourseView() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id') || urlParams.get('courseId');
  const courseInstanceId = urlParams.get('courseInstanceId');
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [viewAsStudent, setViewAsStudent] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [nestedReplyingTo, setNestedReplyingTo] = useState(null);
  const [nestedReplyTexts, setNestedReplyTexts] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
    }).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user) {
      const isAdmin = user.role === 'admin' || user.data?.user_type === 'admin';
      const isInstr = user.data?.user_type === 'instructor' || user.user_type === 'instructor';
      setIsInstructor(isAdmin || isInstr);
    }
  }, [user]);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.list();
      return courses.find(c => c.id === courseId);
    },
    enabled: !!courseId
  });

  const { data: courseInstance } = useQuery({
    queryKey: ['courseInstance', courseInstanceId],
    queryFn: async () => {
      if (!courseInstanceId) return null;
      const instances = await base44.entities.CourseInstance.filter({ id: courseInstanceId });
      return instances[0];
    },
    enabled: !!courseInstanceId
  });

  const { data: weeks = [] } = useQuery({
    queryKey: ['weeks', courseId],
    queryFn: async () => {
      const allWeeks = await base44.entities.Week.filter({ course_id: courseId });
      return allWeeks.sort((a, b) => a.week_number - b.week_number);
    },
    enabled: !!courseId
  });

  const { data: myProgress = [] } = useQuery({
    queryKey: ['myProgress', courseId, user?.email],
    queryFn: () => base44.entities.Progress.filter({ course_id: courseId, user_email: user?.email }),
    enabled: !!user?.email && !!courseId
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', courseId],
    queryFn: () => base44.entities.Announcement.filter({ course_id: courseId, published: true }),
    select: (data) => data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    enabled: !!courseId
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['courseEnrollments', courseId, courseInstanceId, isInstructor],
    queryFn: async () => {
      const res = await base44.functions.invoke('getEnrolledStudents', { courseId, courseInstanceId });
      return res.data.students || [];
    },
    enabled: !!courseId && isInstructor
  });

  const { data: forumPosts = [] } = useQuery({
    queryKey: ['forumPosts', courseId, selectedContent?.data?.id],
    queryFn: async () => {
      const all = await base44.entities.ForumPost.filter({ course_id: courseId });
      const weekId = selectedContent.data.id;
      return all.filter(p => p.forum_id === weekId || p.week_id === weekId);
    },
    enabled: !!selectedContent?.data?.id && selectedContent?.type === 'discussion'
  });

  const { data: forumReplies = [] } = useQuery({
    queryKey: ['forumReplies', selectedContent?.data?.id],
    queryFn: () => base44.entities.ForumReply.list(),
    enabled: !!selectedContent?.data?.id && selectedContent?.type === 'discussion'
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data) => {
      if (editingAnnouncement) {
        return base44.entities.Announcement.update(editingAnnouncement.id, data);
      }
      return base44.entities.Announcement.create({
        ...data, course_id: courseId, published: true,
        target_audience: 'students', priority: 'normal', created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', courseId] });
      setShowAnnouncementDialog(false);
      setNewAnnouncement({ title: '', content: '' });
      setEditingAnnouncement(null);
    }
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements', courseId] }); }
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.ForumPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts', courseId, selectedContent?.data?.id] });
      setNewPost('');
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: (replyData) => base44.entities.ForumReply.create(replyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies', selectedContent?.data?.id] });
    }
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (id) => base44.entities.ForumReply.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['forumReplies', selectedContent?.data?.id] }); }
  });

  const updateReplyMutation = useMutation({
    mutationFn: ({ id, content }) => base44.entities.ForumReply.update(id, { content }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['forumReplies', selectedContent?.data?.id] }); }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.ForumPost.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['forumPosts', courseId, selectedContent?.data?.id] }); }
  });

  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const isWeekCompleted = (week) => {
    return myProgress.some(p => p.week_id === week.id && p.completed);
  };

  const markWeekComplete = useMutation({
    mutationFn: async (week) => {
      const existing = myProgress.find(p => p.week_id === week.id);
      if (existing) {
        return base44.entities.Progress.update(existing.id, { completed: true, completed_date: new Date().toISOString() });
      }
      return base44.entities.Progress.create({
        user_email: user.email, week_id: week.id, course_id: courseId, completed: true, completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['myProgress'] }); }
  });

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

  if (!course) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const title = course[`title_${lang}`] || course.title_en;
  const completedWeeks = myProgress.filter(p => p.completed).length;
  const totalWeeks = weeks.length;
  const progress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  const renderWeekContent = () => {
    if (!selectedContent) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
          <div className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Select a week from the sidebar to begin</p>
          </div>
        </div>
      );
    }

    const { type, data: week } = selectedContent;
    const weekTitle = week[`title_${lang}`] || week.title_en;
    const weekOverview = week[`overview_${lang}`] || week.overview_en;
    const contentBlocks = week[`content_blocks_${lang}`] || week.content_blocks_en || [];
    const lessonContent = week[`lesson_content_${lang}`] || week.lesson_content_en;
    const readingAssignment = week[`reading_assignment_${lang}`] || week.reading_assignment_en;
    const discussionPrompt = week[`discussion_prompt_${lang}`] || week.discussion_prompt_en;

    const weekHeader = (
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-500 text-sm">Week {week.week_number}</p>
          <h2 className="text-2xl font-bold text-slate-900">{weekTitle}</h2>
        </div>
        {!isInstructor && !isWeekCompleted(week) && (
          <Button size="sm" onClick={() => markWeekComplete.mutate(week)} disabled={markWeekComplete.isPending} className="bg-[#1e3a5f]">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {lang === 'es' ? 'Marcar completa' : 'Mark Complete'}
          </Button>
        )}
        {isWeekCompleted(week) && (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />Completed
          </Badge>
        )}
      </div>
    );

    // Quiz-only view
    if (type === 'quiz') {
      return (
        <div className="p-6 max-w-3xl mx-auto">
          {weekHeader}
          {user && (
            <WeekQuizStudent weekId={week.id} user={user} lang={lang} />
          )}
        </div>
      );
    }

    // Assignment-only view
    if (type === 'assignment') {
      return (
        <div className="p-6 max-w-3xl mx-auto">
          {weekHeader}
          {user && (
            <WrittenAssignmentStudent week={week} courseId={courseId} user={user} lang={lang} />
          )}
        </div>
      );
    }

    // Discussion-only view
    if (type === 'discussion') {
      return (
        <div className="p-6 max-w-3xl mx-auto">
          {weekHeader}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4" />{lang === 'es' ? 'Foro de Discusión' : 'Discussion Forum'}</CardTitle>
              {discussionPrompt && <p className="text-slate-600 text-sm">{discussionPrompt}</p>}
            </CardHeader>
            <CardContent>
              {user && (
                <div className="mb-4">
                  <Textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={lang === 'es' ? 'Escribe tu respuesta...' : 'Write your response...'}
                    className="mb-2"
                  />
                  <Button
                    size="sm"
                    onClick={() => createPostMutation.mutate({
                      forum_id: week.id,
                      course_id: courseId,
                      week_id: week.id,
                      user_email: user.email,
                      user_name: user.full_name || user.email,
                      title: 'Response',
                      content: newPost,
                      last_reply_date: new Date().toISOString()
                    })}
                    disabled={!newPost.trim() || createPostMutation.isPending}
                    className="bg-[#1e3a5f]"
                  >
                    Post
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                {forumPosts.map(post => {
                  const postReplies = forumReplies.filter(r => r.post_id === post.id);
                  return (
                    <div key={post.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-slate-900">{post.user_name}</p>
                          <p className="text-xs text-slate-400">{new Date(post.created_date).toLocaleDateString()}</p>
                        </div>
                        {(isInstructor || post.user_email === user?.email) && (
                          <Button variant="ghost" size="sm" onClick={() => deletePostMutation.mutate(post.id)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                      <p className="text-slate-700 text-sm mb-3">{post.content}</p>
                      {user && (
                        <ThreadedReplies
                          replies={postReplies}
                          user={user}
                          isInstructor={isInstructor}
                          lang={lang}
                          nestedReplyingTo={nestedReplyingTo}
                          setNestedReplyingTo={setNestedReplyingTo}
                          nestedReplyTexts={nestedReplyTexts}
                          setNestedReplyTexts={setNestedReplyTexts}
                          onSubmitNestedReply={(parentId) => {
                            const text = nestedReplyTexts[parentId] || '';
                            if (!text.trim()) return;
                            createReplyMutation.mutate({
                              post_id: post.id,
                              parent_id: parentId,
                              user_email: user.email,
                              user_name: user.full_name || user.email,
                              content: text,
                              depth: 1
                            });
                            setNestedReplyTexts(prev => ({ ...prev, [parentId]: '' }));
                            setNestedReplyingTo(null);
                          }}
                          onDeleteReply={(id) => deleteReplyMutation.mutate(id)}
                          onUpdateReply={(id, content) => updateReplyMutation.mutate({ id, content })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Lesson view (default)
    return (
      <div className="p-6 max-w-3xl mx-auto">
        {weekHeader}

        {weekOverview && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-slate-700">{weekOverview}</p>
          </div>
        )}

        {contentBlocks.length > 0 && (
          <div className="space-y-6 mb-6">
            {contentBlocks.map((block, i) => (
              <div key={i}>
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

        {lessonContent && (
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: lessonContent }} />
        )}

        {readingAssignment && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4" />{lang === 'es' ? 'Lectura Asignada' : 'Reading Assignment'}</CardTitle></CardHeader>
            <CardContent><p className="text-slate-700">{readingAssignment}</p></CardContent>
          </Card>
        )}


      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
          <Menu className="w-5 h-5 text-slate-500" />
        </button>
        <Link to={createPageUrl(`Dashboard?lang=${lang}`)} className="text-sm text-slate-500 hover:text-slate-700">
          ← {lang === 'es' ? 'Mi Panel' : 'My Dashboard'}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-900 truncate">{title}</span>
        <div className="ml-auto flex items-center gap-3">
          {isInstructor && (
            <Button variant="ghost" size="sm" onClick={() => setViewAsStudent(!viewAsStudent)}>
              <Eye className="w-4 h-4 mr-1" />
              {viewAsStudent ? 'Instructor View' : 'Student View'}
            </Button>
          )}
          {isInstructor && !viewAsStudent && (
            <Button size="sm" onClick={() => { setEditingAnnouncement(null); setNewAnnouncement({ title: '', content: '' }); setShowAnnouncementDialog(true); }} className="bg-[#1e3a5f]">
              + Announcement
            </Button>
          )}
          <span className="text-sm text-slate-500">{progress}% complete</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="absolute md:relative z-20 w-72 h-full border-r border-slate-200 overflow-y-auto flex-shrink-0 bg-slate-50 shadow-lg md:shadow-none">
            {/* Instructor panel */}
            {isInstructor && !viewAsStudent && (
              <div className="p-4 border-b border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Instructor</p>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-700">{enrollments.length} students enrolled</p>
                </div>
              </div>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="p-4 border-b border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Announcements</p>
                {announcements.map(a => (
                  <div key={a.id} className="text-sm mb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">{a.title}</p>
                      {isInstructor && !viewAsStudent && (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingAnnouncement(a); setNewAnnouncement({ title: a.title, content: a.content }); setShowAnnouncementDialog(true); }}>
                            <Pencil className="w-3 h-3 text-slate-400" />
                          </button>
                          <button onClick={() => deleteAnnouncementMutation.mutate(a.id)}>
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-1">{a.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Weeks */}
            <div className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Course Content</p>
              <div className="space-y-1">
                {weeks.map(week => {
                  const weekTitle = week[`title_${lang}`] || week.title_en;
                  const isExpanded = expandedWeeks[week.id];
                  const isCompleted = isWeekCompleted(week);

                  return (
                    <div key={week.id}>
                      <button
                        onClick={() => toggleWeek(week.id)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white text-left transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                        )}
                        <span className="text-sm text-slate-700 flex-1 truncate">
                          <span className="text-slate-400 mr-1">{week.week_number}.</span>
                          {weekTitle}
                        </span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isExpanded && (
                        <div className="ml-6 space-y-1 mt-1">
                          <button
                            onClick={() => setSelectedContent({ type: 'lesson', data: week })}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm text-left transition-colors ${selectedContent?.data?.id === week.id && selectedContent?.type === 'lesson' ? 'bg-[#1e3a5f] text-white' : 'hover:bg-white text-slate-600'}`}
                          >
                            <BookOpen className="w-3 h-3 flex-shrink-0" />
                            {lang === 'es' ? 'Lección' : 'Lesson'}
                          </button>
                          {week.has_written_assignment && (
                            <button
                              onClick={() => setSelectedContent({ type: 'assignment', data: week })}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm text-left transition-colors ${selectedContent?.data?.id === week.id && selectedContent?.type === 'assignment' ? 'bg-[#1e3a5f] text-white' : 'hover:bg-white text-slate-600'}`}
                            >
                              <FileText className="w-3 h-3 flex-shrink-0" />
                              {lang === 'es' ? 'Tarea' : 'Assignment'}
                            </button>
                          )}
                          {week.has_quiz && (
                            <button
                              onClick={() => setSelectedContent({ type: 'quiz', data: week })}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm text-left transition-colors ${selectedContent?.data?.id === week.id && selectedContent?.type === 'quiz' ? 'bg-[#1e3a5f] text-white' : 'hover:bg-white text-slate-600'}`}
                            >
                              <ClipboardCheck className="w-3 h-3 flex-shrink-0" />
                              {lang === 'es' ? 'Prueba' : 'Quiz'}
                            </button>
                          )}
                          {week.has_discussion && (
                            <button
                              onClick={() => setSelectedContent({ type: 'discussion', data: week })}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm text-left transition-colors ${selectedContent?.data?.id === week.id && selectedContent?.type === 'discussion' ? 'bg-[#1e3a5f] text-white' : 'hover:bg-white text-slate-600'}`}
                            >
                              <MessageSquare className="w-3 h-3 flex-shrink-0" />
                              {lang === 'es' ? 'Discusión' : 'Discussion'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div className="md:hidden absolute inset-0 z-10 bg-black/30" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {renderWeekContent()}
        </div>
      </div>

      {/* Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={newAnnouncement.title}
              onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            />
            <Textarea
              placeholder="Content"
              rows={4}
              value={newAnnouncement.content}
              onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)}>Cancel</Button>
            <Button
              onClick={() => createAnnouncementMutation.mutate(newAnnouncement)}
              disabled={!newAnnouncement.title || createAnnouncementMutation.isPending}
              className="bg-[#1e3a5f]"
            >
              {editingAnnouncement ? 'Update' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}