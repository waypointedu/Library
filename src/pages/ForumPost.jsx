import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, User } from 'lucide-react';
import { format } from 'date-fns';
import MobileNav from '@/components/common/MobileNav';

export default function ForumPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('postId');
  const courseId = urlParams.get('courseId');
  const [lang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);
  const [newReply, setNewReply] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: post } = useQuery({
    queryKey: ['forumPost', postId],
    queryFn: async () => {
      const posts = await base44.entities.ForumPost.list();
      return posts.find(p => p.id === postId) || null;
    },
    enabled: !!postId
  });

  const { data: allReplies = [] } = useQuery({
    queryKey: ['forumReplies', postId],
    queryFn: () => base44.entities.ForumReply.filter({ post_id: postId }),
    select: (data) => data.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    enabled: !!postId
  });

  const createReplyMutation = useMutation({
    mutationFn: async (data) => {
      const reply = await base44.entities.ForumReply.create(data);
      if (post) {
        await base44.entities.ForumPost.update(postId, {
          reply_count: (post.reply_count || 0) + 1,
          last_reply_date: new Date().toISOString()
        });
      }
      return reply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies', postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPost', postId] });
      setNewReply('');
    }
  });

  const t = {
    en: { yourReply: 'Your reply...', submit: 'Post Reply', locked: 'This discussion is locked', replies: 'Replies' },
    es: { yourReply: 'Tu respuesta...', submit: 'Publicar Respuesta', locked: 'Esta discusión está bloqueada', replies: 'Respuestas' }
  }[lang] || {};

  if (!user) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{lang === 'es' ? 'Publicación no encontrada' : 'Post not found'}</p>
          <Button variant="outline" onClick={() => window.history.back()}>{lang === 'es' ? 'Volver' : 'Go Back'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        {courseId && (
          <Link to={createPageUrl(`CourseForum?courseId=${courseId}&lang=${lang}`)} className="flex items-center gap-2 text-sm text-slate-600">
            <ArrowLeft className="w-4 h-4" />{lang === 'es' ? 'Volver al foro' : 'Back to forum'}
          </Link>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <h1 className="text-xl font-bold text-slate-900 mb-3">{post.title}</h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
              <User className="w-4 h-4" />
              <span>{post.user_name}</span>
              <span>•</span>
              <span>{format(new Date(post.created_date), 'MMM d, yyyy h:mm a')}</span>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
          </CardContent>
        </Card>

        <h2 className="text-lg font-semibold text-slate-900 mb-4">{t.replies} ({allReplies.length})</h2>

        {!post.is_locked && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Textarea value={newReply} onChange={e => setNewReply(e.target.value)} placeholder={t.yourReply} rows={3} className="mb-3" />
              <Button
                onClick={() => createReplyMutation.mutate({ post_id: postId, user_email: user.email, user_name: user.full_name || user.email, content: newReply })}
                disabled={!newReply.trim() || createReplyMutation.isPending}
                className="bg-[#1e3a5f]"
              >
                <Send className="w-4 h-4 mr-1" />{t.submit}
              </Button>
            </CardContent>
          </Card>
        )}

        {post.is_locked && (
          <Card className="mb-6"><CardContent className="p-4 text-center text-slate-500">{t.locked}</CardContent></Card>
        )}

        <div className="space-y-3">
          {allReplies.map(reply => (
            <Card key={reply.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-slate-800">{reply.user_name}</span>
                  <span>•</span>
                  <span>{format(new Date(reply.created_date), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{reply.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <MobileNav lang={lang} />
    </div>
  );
}