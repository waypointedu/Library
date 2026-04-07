import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Pin, Lock, Send, ArrowLeft, User } from 'lucide-react';
import { format } from 'date-fns';
import MobileNav from '@/components/common/MobileNav';

export default function CourseForum() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }),
    select: (data) => data[0],
    enabled: !!courseId
  });

  const { data: forums = [], refetch: refetchForums } = useQuery({
    queryKey: ['forums', courseId],
    queryFn: async () => {
      const existing = await base44.entities.Forum.filter({ course_id: courseId });
      if (existing.length === 0) {
        const newForum = await base44.entities.Forum.create({
          course_id: courseId, title_en: 'Announcements', title_es: 'Anuncios',
          description_en: 'Instructor announcements and course updates'
        });
        return [newForum];
      }
      return existing;
    },
    enabled: !!courseId
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['forumPosts', courseId],
    queryFn: () => base44.entities.ForumPost.filter({ course_id: courseId }),
    select: (data) => data.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
      return new Date(b.last_reply_date || b.created_date) - new Date(a.last_reply_date || a.created_date);
    }),
    enabled: !!courseId
  });

  const createPostMutation = useMutation({
    mutationFn: async (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts', courseId] });
      setNewPost({ title: '', content: '' });
      setShowNewPost(false);
    }
  });

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    let defaultForum = forums[0];
    if (!defaultForum) {
      defaultForum = await base44.entities.Forum.create({ course_id: courseId, title_en: 'General Discussion', title_es: 'Discusión General' });
      refetchForums();
    }
    createPostMutation.mutate({
      forum_id: defaultForum.id, course_id: courseId, user_email: user.email,
      user_name: user.full_name || user.email, title: newPost.title,
      content: newPost.content, last_reply_date: new Date().toISOString()
    });
  };

  const t = {
    en: { title: 'Announcements', newPost: 'New Announcement', postTitle: 'Title', postContent: 'Your message...', submit: 'Post', cancel: 'Cancel', replies: 'replies', lastActivity: 'Last activity', noPosts: 'No announcements yet.' },
    es: { title: 'Anuncios', newPost: 'Nuevo Anuncio', postTitle: 'Título', postContent: 'Tu mensaje...', submit: 'Publicar', cancel: 'Cancelar', replies: 'respuestas', lastActivity: 'Última actividad', noPosts: 'Aún no hay anuncios.' }
  }[lang] || {};

  if (!user || !course) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to={createPageUrl(`Course?id=${courseId}&lang=${lang}`)} className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="w-4 h-4" />{course[`title_${lang}`] || course.title_en}
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          {(user.role === 'admin' || user.role === 'instructor') && (
            <Button onClick={() => setShowNewPost(!showNewPost)} className="bg-[#1e3a5f]">
              <MessageSquare className="w-4 h-4 mr-2" />{t.newPost}
            </Button>
          )}
        </div>

        {showNewPost && (
          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              <Input value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder={t.postTitle} />
              <Textarea value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} placeholder={t.postContent} rows={4} />
              <div className="flex gap-2">
                <Button onClick={handleCreatePost} disabled={createPostMutation.isPending} className="bg-[#1e3a5f]">
                  <Send className="w-4 h-4 mr-1" />{t.submit}
                </Button>
                <Button variant="outline" onClick={() => setShowNewPost(false)}>{t.cancel}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {posts.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-slate-500">{t.noPosts}</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <Link key={post.id} to={createPageUrl(`ForumPost?postId=${post.id}&courseId=${courseId}&lang=${lang}`)}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-1">
                      {post.is_pinned && <Pin className="w-3 h-3 text-orange-500 mt-1" />}
                      {post.is_locked && <Lock className="w-3 h-3 text-slate-400 mt-1" />}
                      <h3 className="font-semibold text-slate-900">{post.title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.user_name}</span>
                      <span>{post.reply_count || 0} {t.replies}</span>
                      <span>{t.lastActivity}: {format(new Date(post.last_reply_date || post.created_date), 'MMM d')}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <MobileNav lang={lang} />
    </div>
  );
}