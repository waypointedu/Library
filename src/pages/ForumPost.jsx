import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowLeft, Send, User } from 'lucide-react';
import { format } from 'date-fns';
import LanguageToggle from '@/components/common/LanguageToggle';
import MobileNav from '@/components/common/MobileNav';

export default function ForumPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('postId');
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);
  const [newReply, setNewReply] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: post } = useQuery({
    queryKey: ['forumPost', postId],
    queryFn: () => base44.entities.ForumPost.filter({ id: postId }),
    select: (data) => data[0],
    enabled: !!postId
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forumReplies', postId],
    queryFn: () => base44.entities.ForumReply.filter({ post_id: postId }),
    select: (data) => data.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
    enabled: !!postId
  });

  const createReplyMutation = useMutation({
    mutationFn: async (data) => {
      const reply = await base44.entities.ForumReply.create(data);
      await base44.entities.ForumPost.update(postId, {
        reply_count: (post?.reply_count || 0) + 1,
        last_reply_date: new Date().toISOString()
      });
      return reply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies', postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPost', postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setNewReply('');
    }
  });

  const handleReply = () => {
    if (!newReply.trim() || post?.is_locked) return;

    createReplyMutation.mutate({
      post_id: postId,
      user_email: user.email,
      user_name: user.full_name || user.email,
      content: newReply
    });
  };

  const text = {
    en: {
      reply: 'Reply',
      yourReply: 'Your reply...',
      submit: 'Post Reply',
      locked: 'This discussion is locked',
      replies: 'Replies'
    },
    es: {
      reply: 'Responder',
      yourReply: 'Tu respuesta...',
      submit: 'Publicar Respuesta',
      locked: 'Esta discusión está bloqueada',
      replies: 'Respuestas'
    }
  };
  const t = text[lang];

  if (!user || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-6">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Waypoint Institute</span>
          </Link>
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <Link
          to={createPageUrl(`CourseForum?courseId=${post.course_id}&lang=${lang}`)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'es' ? 'Volver al foro' : 'Back to forum'}
        </Link>

        {/* Original Post */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h1 className="text-3xl font-light text-slate-900 mb-4">{post.title}</h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#1e3a5f]" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{post.user_name}</p>
                <p className="text-sm text-slate-500">
                  {format(new Date(post.created_date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t.replies} ({replies.length})
          </h2>
          <div className="space-y-4">
            {replies.map(reply => (
              <Card key={reply.id} className="bg-slate-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{reply.user_name}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(reply.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap ml-11">{reply.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reply Form */}
        {!post.is_locked ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">{t.reply}</h3>
              <Textarea
                placeholder={t.yourReply}
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={4}
                className="text-base"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleReply}
                  disabled={!newReply.trim() || createReplyMutation.isPending}
                  size="lg"
                  className="bg-[#1e3a5f]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t.submit}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6 text-center text-amber-900">
              {t.locked}
            </CardContent>
          </Card>
        )}
      </div>

      <MobileNav lang={lang} currentPage="Courses" />
    </div>
  );
}