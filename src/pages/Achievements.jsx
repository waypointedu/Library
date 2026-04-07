import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trophy, Target } from 'lucide-react';
import AchievementBadge from '@/components/gamification/AchievementBadge';
import StreakDisplay from '@/components/gamification/StreakDisplay';
import MobileNav from '@/components/common/MobileNav';

export default function Achievements() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list()
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['userAchievements', user?.email],
    queryFn: () => base44.entities.UserAchievement.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: streak } = useQuery({
    queryKey: ['streak', user?.email],
    queryFn: async () => {
      const streaks = await base44.entities.Streak.filter({ user_email: user?.email });
      return streaks[0];
    },
    enabled: !!user?.email
  });

  const earnedIds = userAchievements.map(ua => ua.achievement_id);
  const earnedAchievements = achievements.filter(a => earnedIds.includes(a.id));
  const unearnedAchievements = achievements.filter(a => !earnedIds.includes(a.id));

  const text = {
    en: { title: 'Your Achievements', points: 'Total Points', earned: 'Earned', locked: 'Locked', streak: 'Current Streak' },
    es: { title: 'Tus Logros', points: 'Puntos Totales', earned: 'Obtenidos', locked: 'Bloqueados', streak: 'Racha Actual' }
  };
  const t = text[lang];

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">{t.title}</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{streak?.total_points || 0}</p>
              <p className="text-sm text-slate-500">{t.points}</p>
            </CardContent>
          </Card>
          {streak && <div className="flex-1"><StreakDisplay streak={streak} lang={lang} /></div>}
        </div>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t.earned} ({earnedAchievements.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedAchievements.map(achievement => (
              <Card key={achievement.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <AchievementBadge achievement={achievement} size="md" />
                  <div>
                    <p className="font-medium text-slate-900">{achievement[`title_${lang}`] || achievement.title_en}</p>
                    <p className="text-xs text-slate-500">{achievement[`description_${lang}`] || achievement.description_en}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t.locked} ({unearnedAchievements.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unearnedAchievements.map(achievement => (
              <Card key={achievement.id} className="opacity-60">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <Target className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{achievement[`title_${lang}`] || achievement.title_en}</p>
                    <p className="text-xs text-slate-400">+{achievement.points} pts</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <MobileNav lang={lang} currentPage="Achievements" />
    </div>
  );
}