import React from 'react';
import { Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function StreakDisplay({ streak, lang }) {
  const text = {
    en: { days: 'day streak', best: 'Best' },
    es: { days: 'días de racha', best: 'Mejor' }
  };
  const t = text[lang] || text.en;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Flame className={`w-8 h-8 ${(streak?.current_streak || 0) > 0 ? 'text-orange-500' : 'text-slate-300'}`} />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{streak?.current_streak || 0}</span>
              <span className="text-sm text-slate-500">{t.days}</span>
            </div>
            {streak?.longest_streak > 0 && (
              <p className="text-xs text-slate-400">{t.best}: {streak.longest_streak}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}