import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, BookOpen, ArrowRight, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProgressBar from '@/components/common/ProgressBar';

export default function CourseCard({ course, lang = 'en', progress = 0, enrolled = false, courseInstanceId = null }) {
  const title = course[`title_${lang}`] || course.title_en;
  const description = course[`description_${lang}`] || course.description_en;

  const languageMap = {
    en: 'EN', es: 'ES', ps: 'PS', fa: 'FA', km: 'KM'
  };

  const availableLanguages = course.language_availability || ['en'];

  const linkUrl = enrolled
    ? `CourseView?id=${course.id}${courseInstanceId && courseInstanceId !== 'direct' ? `&courseInstanceId=${courseInstanceId}` : ''}&lang=${lang}`
    : `Course?id=${course.id}&lang=${lang}`;

  return (
    <Link to={createPageUrl(linkUrl)} className="block group">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {course.cover_image_url ? (
          <div className="h-40 overflow-hidden">
            <img src={course.cover_image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/50" />
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1 mb-2">
            {availableLanguages.map((l, i) => (
              <Badge key={i} variant="outline" className="text-xs">{languageMap[l]}</Badge>
            ))}
            {course.tags?.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>

          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-[#1e3a5f] transition-colors">{title}</h3>
          <p className="text-slate-500 text-sm mb-3 line-clamp-2 flex-1">{description}</p>

          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            {course.duration_weeks && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_weeks} {lang === 'es' ? 'semanas' : 'weeks'}</span>
            )}
            {course.credits && (
              <span>{course.credits} {lang === 'es' ? 'créditos' : 'credits'}</span>
            )}
          </div>

          {enrolled && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{lang === 'es' ? 'Progreso' : 'Progress'}</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}

          <div className="flex items-center gap-1 text-[#1e3a5f] text-sm font-medium">
            {lang === 'es' ? 'Ver curso' : 'View course'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}