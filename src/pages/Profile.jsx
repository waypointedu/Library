import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Flame } from "lucide-react";
import MobileNav from '@/components/common/MobileNav';

export default function Profile() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
    base44.auth.me().then(setUser).catch(() => { base44.auth.redirectToLogin(); });
  }, []);

  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      if (profiles.length > 0) return profiles[0];
      return base44.entities.UserProfile.create({ user_email: user?.email, total_xp: 0, current_level: 1, reading_streak_days: 0 });
    },
    enabled: !!user?.email
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: async () => {
      const userBadges = await base44.entities.UserBadge.filter({ user_email: user?.email });
      const badgeIds = userBadges.map(ub => ub.badge_id);
      if (badgeIds.length === 0) return [];
      const allBadges = await base44.entities.Badge.list();
      return allBadges.filter(b => badgeIds.includes(b.id));
    },
    enabled: !!user?.email,
    initialData: []
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.list(),
    initialData: []
  });

  const earnedBadgeIds = badges.map(b => b.id);
  const level = profile?.current_level || 1;

  if (!user || !profile) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] px-4 py-12 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
          {(user.full_name || user.email)?.[0]?.toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold mb-1">{user.full_name}</h1>
        <div className="flex items-center justify-center gap-3 text-white/80 text-sm">
          <span className="flex items-center gap-1"><Trophy className="w-4 h-4" /> Level {level}</span>
          <span className="flex items-center gap-1"><Award className="w-4 h-4" /> {profile.total_xp || 0} XP</span>
          <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {profile.reading_streak_days || 0} day streak</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: lang === 'es' ? 'Páginas Leídas' : 'Pages Read', value: profile.total_pages_read || 0 },
            { label: lang === 'es' ? 'Racha' : 'Streak', value: `${profile.reading_streak_days || 0} days` },
            { label: lang === 'es' ? 'Insignias' : 'Badges', value: badges.length },
            { label: lang === 'es' ? 'Minutos' : 'Reading Hours', value: Math.round((profile.total_reading_minutes || 0) / 60) }
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Badges */}
        <Tabs defaultValue="earned">
          <TabsList>
            <TabsTrigger value="earned">{lang === 'es' ? 'Mis Insignias' : 'My Badges'}</TabsTrigger>
            <TabsTrigger value="all">{lang === 'es' ? 'Todas' : 'All Badges'}</TabsTrigger>
          </TabsList>
          <TabsContent value="earned">
            {badges.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-slate-500">No badges earned yet. Keep learning!</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {badges.map(badge => (
                  <Card key={badge.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Award className="w-10 h-10 text-[#1e3a5f]" />
                      <div>
                        <p className="font-medium text-slate-900">{lang === 'es' ? badge.title_es || badge.title_en : badge.title_en}</p>
                        <p className="text-xs text-slate-500">{lang === 'es' ? badge.description_es || badge.description_en : badge.description_en}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="all">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {allBadges.map(badge => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                return (
                  <Card key={badge.id} className={!isEarned ? 'opacity-50' : ''}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Award className={`w-10 h-10 ${isEarned ? 'text-[#1e3a5f]' : 'text-slate-300'}`} />
                      <div>
                        <p className="font-medium text-slate-900">{lang === 'es' ? badge.title_es || badge.title_en : badge.title_en}</p>
                        {!isEarned && <Badge variant="outline" className="text-xs">{lang === 'es' ? 'Bloqueado' : 'Locked'}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav lang={lang} currentPage="Profile" />
    </div>
  );
}