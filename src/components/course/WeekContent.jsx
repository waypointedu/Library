import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import ForumPanel from './ForumPanel';

export default function WeekContent({ week, user, courseId }) {
  const lang = 'en';
  const title = week[`title_${lang}`] || `Week ${week.week_number}`;
  const overview = week[`overview_${lang}`] || week[`lesson_content_${lang}`];
  const reading = week[`reading_assignment_${lang}`];
  const written = week[`written_assignment_${lang}`];
  const discussion = week[`discussion_prompt_${lang}`];
  const contentBlocks = week[`content_blocks_${lang}`] || [];

  const tabs = [
    { id: 'lesson', label: 'Lesson', show: true },
    { id: 'reading', label: 'Reading', show: !!reading },
    { id: 'assignment', label: 'Assignment', show: week.has_written_assignment && !!written },
    { id: 'discussion', label: 'Discussion', show: week.has_discussion },
  ].filter(t => t.show);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-slate-900">
          Week {week.week_number}: {title}
        </h2>
      </div>

      <Tabs defaultValue="lesson" className="p-6">
        <TabsList className="mb-6">
          {tabs.map(t => (
            <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="lesson" className="space-y-4">
          {overview ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{overview}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No lesson content yet.</p>
          )}

          {contentBlocks.length > 0 && (
            <div className="space-y-4 mt-6">
              {contentBlocks.map((block, i) => (
                <ContentBlock key={block.id ?? i} block={block} />
              ))}
            </div>
          )}

          {week.video_url && (
            <div className="mt-4 aspect-video">
              <iframe
                src={week.video_url.replace('watch?v=', 'embed/')}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          )}

          {week.attachments?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
              <div className="space-y-1">
                {week.attachments.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    📎 {a.title || a.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reading">
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{reading}</ReactMarkdown>
          </div>
        </TabsContent>

        <TabsContent value="assignment">
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{written}</ReactMarkdown>
          </div>
        </TabsContent>

        <TabsContent value="discussion">
          <ForumPanel weekId={week.id} courseId={courseId} prompt={discussion} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentBlock({ block }) {
  if (block.type === 'video') {
    return (
      <div className="aspect-video">
        <iframe src={block.url?.replace('watch?v=', 'embed/')} className="w-full h-full rounded-lg" allowFullScreen />
        {block.caption && <p className="text-xs text-gray-500 mt-1">{block.caption}</p>}
      </div>
    );
  }
  if (block.type === 'image') {
    return (
      <div>
        <img src={block.url} alt={block.caption} className="rounded-lg max-w-full" />
        {block.caption && <p className="text-xs text-gray-500 mt-1">{block.caption}</p>}
      </div>
    );
  }
  if (block.type === 'richtext' || block.type === 'text') {
    return (
      <div className="prose prose-sm max-w-none text-gray-700">
        <ReactMarkdown>{block.content}</ReactMarkdown>
      </div>
    );
  }
  if (block.type === 'audio') {
    return (
      <div>
        <audio controls src={block.url} className="w-full" />
        {block.caption && <p className="text-xs text-gray-500 mt-1">{block.caption}</p>}
      </div>
    );
  }
  return null;
}