import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send } from 'lucide-react';

export default function ForumPanel({ weekId, courseId, prompt, user }) {
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState({});
  const [newPost, setNewPost] = useState('');
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [allPosts, allReplies] = await Promise.all([
      base44.entities.ForumPost.filter({ week_id: weekId }),
      base44.entities.ForumReply.filter({ post_id: { $exists: true } }),
    ]);
    const postsForWeek = allPosts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const replyMap = {};
    allReplies.forEach(r => {
      if (!replyMap[r.post_id]) replyMap[r.post_id] = [];
      replyMap[r.post_id].push(r);
    });
    setPosts(postsForWeek);
    setReplies(replyMap);
    setLoading(false);
  };

  useEffect(() => {
    if (weekId) load();
  }, [weekId]);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    await base44.entities.ForumPost.create({
      week_id: weekId,
      course_id: courseId,
      user_email: user.email,
      user_name: user.full_name || user.email,
      content: newPost.trim(),
    });
    setNewPost('');
    load();
  };

  const handleReply = async (postId) => {
    const text = replyText[postId];
    if (!text?.trim() || !user) return;
    await base44.entities.ForumReply.create({
      post_id: postId,
      user_email: user.email,
      user_name: user.full_name || user.email,
      content: text.trim(),
    });
    setReplyText(prev => ({ ...prev, [postId]: '' }));
    setReplyingTo(null);
    load();
  };

  if (loading) return <div className="text-gray-400 text-sm py-4">Loading discussion...</div>;

  return (
    <div className="space-y-6">
      {prompt && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">Discussion Prompt</p>
          <p className="text-sm text-blue-700">{prompt}</p>
        </div>
      )}

      {/* New post */}
      {user && (
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts..."
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            rows={3}
          />
          <Button size="sm" onClick={handlePost} disabled={!newPost.trim()}>
            <Send className="w-3 h-3 mr-1" /> Post
          </Button>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                  {(post.user_name || post.user_email)?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-gray-900">{post.user_name || post.user_email}</span>
                    <span className="text-xs text-gray-400">{new Date(post.created_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{post.content}</p>
                </div>
              </div>

              {/* Replies */}
              {(replies[post.id] || []).map(reply => (
                <div key={reply.id} className="ml-11 border-l-2 border-gray-100 pl-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                    {(reply.user_name || reply.user_email)?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-gray-900">{reply.user_name || reply.user_email}</span>
                      <span className="text-xs text-gray-400">{new Date(reply.created_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}

              {/* Reply input */}
              {user && (
                <div className="ml-11">
                  {replyingTo === post.id ? (
                    <div className="flex gap-2">
                      <Input
                        size="sm"
                        placeholder="Write a reply..."
                        value={replyText[post.id] || ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleReply(post.id)}
                      />
                      <Button size="sm" onClick={() => handleReply(post.id)}>Reply</Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <button onClick={() => setReplyingTo(post.id)} className="text-xs text-gray-400 hover:text-gray-600">
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}