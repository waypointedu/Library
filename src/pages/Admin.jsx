import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';
import CourseManager from '@/components/admin/CourseManager';
import UserManager from '@/components/admin/UserManager';
import Analytics from '@/components/admin/Analytics';
import PathwayManager from '@/components/admin/PathwayManager';
import DetailedAnalytics from '@/components/admin/DetailedAnalytics';

export default function Admin() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.role !== 'admin' && u.role !== 'instructor') {
        window.location.href = createPageUrl('Dashboard');
      }
      setUser(u);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const text = {
    en: {
      title: "Admin Dashboard",
      tabs: {
        courses: "Courses",
        users: "Users",
        analytics: "Analytics"
      }
    },
    es: {
      title: "Panel de Administración",
      tabs: {
        courses: "Cursos",
        users: "Usuarios",
        analytics: "Analíticas"
      }
    }
  };

  const t = text[lang];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Waypoint Institute</span>
          </Link>

          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={setLang} />
            <Link to={createPageUrl(`Dashboard?lang=${lang}`)}>
              <Button variant="outline" size="sm">
                {lang === 'es' ? 'Mi Panel' : 'Dashboard'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light text-slate-900 mb-8">{t.title}</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="courses">{t.tabs.courses}</TabsTrigger>
            <TabsTrigger value="users">{t.tabs.users}</TabsTrigger>
            <TabsTrigger value="analytics">{t.tabs.analytics}</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CourseManager lang={lang} />
          </TabsContent>

          <TabsContent value="users">
            <UserManager lang={lang} />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics lang={lang} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}