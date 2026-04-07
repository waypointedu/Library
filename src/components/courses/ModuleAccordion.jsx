import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, Circle, Clock, FileText, PlayCircle } from "lucide-react";

export default function ModuleAccordion({
  modules,
  lessons,
  completedLessons = [],
  lang = 'en',
  courseId
}) {
  const getLessonsForModule = (moduleId) => {
    return lessons
      .filter(l => l.module_id === moduleId)
      .sort((a, b) => a.order_index - b.order_index);
  };

  const getModuleProgress = (moduleId) => {
    const moduleLessons = getLessonsForModule(moduleId);
    if (moduleLessons.length === 0) return 0;
    const completed = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completed / moduleLessons.length) * 100);
  };

  return (
    <Accordion type="multiple" className="space-y-2">
      {modules.map((module, index) => {
        const moduleTitle = module[`title_${lang}`] || module.title_en;
        const moduleLessons = getLessonsForModule(module.id);
        const progress = getModuleProgress(module.id);

        return (
          <AccordionItem key={module.id} value={module.id} className="border border-slate-200 rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{moduleTitle}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{moduleLessons.length} {lang === 'es' ? 'lecciones' : 'lessons'}</span>
                    {module.estimated_hours && <span><Clock className="w-3 h-3 inline" /> {module.estimated_hours}h</span>}
                    {progress > 0 && <span className="text-green-600">{progress}%</span>}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <div className="space-y-1">
                {moduleLessons.map((lesson) => {
                  const lessonTitle = lesson[`title_${lang}`] || lesson.title_en;
                  const isCompleted = completedLessons.includes(lesson.id);

                  return (
                    <Link
                      key={lesson.id}
                      to={createPageUrl(`Lesson?id=${lesson.id}&lang=${lang}`)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      )}
                      <span className="text-sm text-slate-700 flex-1">{lessonTitle}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {lesson.video_url && <PlayCircle className="w-3 h-3" />}
                        {lesson.estimated_minutes && <span>{lesson.estimated_minutes} min</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}