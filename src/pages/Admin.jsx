import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CourseManager from '@/components/admin/CourseManager';
import UserManager from '@/components/admin/UserManager';
import Analytics from '@/components/admin/Analytics';
import PathwayManager from '@/components/admin/PathwayManager';
import DetailedAnalytics from '@/components/admin/DetailedAnalytics';
import ApplicationsManager from '@/components/admin/ApplicationsManager';
import AcademicCalendar from '@/components/admin/AcademicCalendar';
import SemesterManager from '@/components/admin/SemesterManager';
import InstructorApprovalManager from '@/components/admin/InstructorApprovalManager';
import StudentManager from '@/components/admin/StudentManager';
import GamificationManager from '@/components/admin/GamificationManager';
import AdvancedCourseManager from '@/components/admin/AdvancedCourseManager';
import AnnouncementManager from '@/components/communication/AnnouncementManager';

export default function Admin() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(urlParams.get('tab') || 'overview');

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      const isAuthorized = u.role === 'admin' || u.user_type === 'instructor';
      if (!isAuthorized) {
        window.location.href = createPageUrl('Dashboard');
      }
      setUser(u);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const title = user?.role === 'admin' ? "Admin Dashboard" : "Instructor Dashboard";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to={createPageUrl('Home')}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs rounded ${lang === 'en' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>EN</button>
            <button onClick={() => setLang('es')} className={`px-2 py-1 text-xs rounded ${lang === 'es' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>ES</button>
          </div>
          <Link to={createPageUrl(`Dashboard?view=student&lang=${lang}`)} className="text-sm text-slate-600 hover:text-slate-900">Student View</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6">
            {user.role === 'admin' && <TabsTrigger value="overview">Overview</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="applications">{lang === 'es' ? 'Solicitudes' : 'Applications'}</TabsTrigger>}
            <TabsTrigger value="courses">{lang === 'es' ? 'Cursos' : 'Courses'}</TabsTrigger>
            {user.role === 'admin' && <TabsTrigger value="students">{lang === 'es' ? 'Estudiantes' : 'Students'}</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="instructors">{lang === 'es' ? 'Instructores' : 'Instructors'}</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="calendar">{lang === 'es' ? 'Calendario' : 'Calendar'}</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="pathways">{lang === 'es' ? 'Rutas' : 'Pathways'}</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="users">{lang === 'es' ? 'Usuarios' : 'Users'}</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="gamification">{lang === 'es' ? 'Gamificación' : 'Gamification'}</TabsTrigger>}
            {user.role === 'admin' && <TabsTrigger value="announcements">{lang === 'es' ? 'Anuncios' : 'Announcements'}</TabsTrigger>}
          </TabsList>

          {user.role === 'admin' && (
            <TabsContent value="overview">
              <Analytics lang={lang} />
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <TabsContent value="applications">
              <ApplicationsManager lang={lang} />
            </TabsContent>
          )}

          <TabsContent value="courses">
            <CourseManager lang={lang} user={user} />
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="students">
              <StudentManager />
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <TabsContent value="instructors">
              <InstructorApprovalManager />
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <TabsContent value="calendar">
              <AcademicCalendar lang={lang} />
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <TabsContent value="pathways">
              <PathwayManager lang={lang} user={user} />
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <TabsContent value="users">
              <UserManager lang={lang} />
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <TabsContent value="gamification">
              <GamificationManager />
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <TabsContent value="announcements">
              <AnnouncementManager />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}