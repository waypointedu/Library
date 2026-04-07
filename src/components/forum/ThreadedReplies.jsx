import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2 } from 'lucide-react';

const MAX_DEPTH = 4;

function ReplyNode({ reply, allReplies, user, isInstructor, lang, nestedReplyingTo, setNestedReplyingTo, nestedReplyTexts, setNestedReplyTexts, onSubmitNestedReply, onDeleteReply, onUpdateReply, depth = 0 }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);

  const children = allReplies
    .filter(r => r.parent_id === reply.id)
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const isReplying = nestedReplyingTo === reply.id;
  const canReply = user && depth < MAX_DEPTH;
  const canEdit = user && reply.user_email === user.email;
  const canDelete = user && (reply.user_email === user.email || isInstructor);

  return (
    <div className={depth > 0 ? 'pl-4 border-l-2 border-slate-100 mt-2 space-y-2' : ''}>
      <div className="bg-slate-50 rounded-lg p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ width: depth > 1 ? '24px' : '28px', height: depth > 1 ? '24px' : '28px', fontSize: depth > 1 ? '10px' : '12px', backgroundColor: depth === 0 ? '#334155' : '#64748b' }}
            >
              {(reply.user_name || reply.user_email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <span className={`font-medium text-slate-800 ${depth > 1 ? 'text-xs' : 'text-sm'}`}>{reply.user_name || reply.user_email?.split('@')[0]}</span>
              <span className="text-xs text-slate-400 ml-2">{new Date(reply.created_date).toLocaleDateString()}</span>
            </div>
          </div>
          {(canEdit || canDelete) && !editing && (
            <div className="flex gap-1">
              {canEdit && (
                <button onClick={() => { setEditing(true); setEditText(reply.content); }} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              {canDelete && (
                <button onClick={() => { if (confirm(lang === 'es' ? '¿Eliminar respuesta?' : 'Delete this reply?')) { onDeleteReply(reply.id); } }} className="p-1 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-2">
            <Textarea value={editText} onChange={e => setEditText(e.target.value)} className="text-sm min-h-[60px]" />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => { onUpdateReply(reply.id, editText); setEditing(false); }}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{reply.content}</p>
        )}

        {canReply && !editing && (
          <button
            onClick={() => setNestedReplyingTo(isReplying ? null : reply.id)}
            className="text-xs text-slate-400 hover:text-slate-600 mt-2"
          >
            {lang === 'es' ? 'Responder' : 'Reply'}
          </button>
        )}

        {isReplying && (
          <div className="mt-2">
            <Textarea
              value={nestedReplyTexts[reply.id] || ''}
              onChange={e => setNestedReplyTexts(prev => ({ ...prev, [reply.id]: e.target.value }))}
              placeholder={lang === 'es' ? 'Tu respuesta...' : 'Your reply...'}
              className="text-sm min-h-[60px]"
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => onSubmitNestedReply(reply.id, reply.user_name)}>
                {lang === 'es' ? 'Enviar' : 'Post'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setNestedReplyingTo(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {children.length > 0 && (
        <div className="space-y-2">
          {children.map(child => (
            <ReplyNode
              key={child.id}
              reply={child}
              allReplies={allReplies}
              user={user}
              isInstructor={isInstructor}
              lang={lang}
              nestedReplyingTo={nestedReplyingTo}
              setNestedReplyingTo={setNestedReplyingTo}
              nestedReplyTexts={nestedReplyTexts}
              setNestedReplyTexts={setNestedReplyTexts}
              onSubmitNestedReply={onSubmitNestedReply}
              onDeleteReply={onDeleteReply}
              onUpdateReply={onUpdateReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadedReplies({ replies, user, isInstructor, lang, nestedReplyingTo, setNestedReplyingTo, nestedReplyTexts, setNestedReplyTexts, onSubmitNestedReply, onDeleteReply, onUpdateReply }) {
  const topLevel = replies.filter(r => !r.parent_id);

  return (
    <div className="space-y-3">
      {topLevel.map(reply => (
        <ReplyNode
          key={reply.id}
          reply={reply}
          allReplies={replies}
          user={user}
          isInstructor={isInstructor}
          lang={lang}
          nestedReplyingTo={nestedReplyingTo}
          setNestedReplyingTo={setNestedReplyingTo}
          nestedReplyTexts={nestedReplyTexts}
          setNestedReplyTexts={setNestedReplyTexts}
          onSubmitNestedReply={onSubmitNestedReply}
          onDeleteReply={onDeleteReply}
          onUpdateReply={onUpdateReply}
          depth={0}
        />
      ))}
    </div>
  );
}