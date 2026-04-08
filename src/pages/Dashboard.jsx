import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star, BookOpen, Trophy, Clock, ArrowRight,
  GraduationCap, Target, ChevronRight, FileText, Settings
} from "lucide-react";
import CourseCard from '@/components/courses/CourseCard';
import ProgressBar from '@/components/common/ProgressBar';
import MobileNav from '@/components/common/MobileNav';
import StreakDisplay from '@/components/gamification/StreakDisplay';
import { useMutation } from '@tanstack/react-query';
import PathwayProgress from '@/components/dashboard/PathwayProgress';
import WeeklyStudyPlan from '@/components/dashboard/WeeklyStudyPlan';
import StreakCalendar from '@/components/dashboard/StreakCalendar';
import CourseCalendar from '@/components/calendar/CourseCalendar';
import AnnouncementFeed from '@/components/dashboard/AnnouncementFeed';
import AccessGate from '@/components/AccessGate';

export default function Dashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
    const newUrl = `${window.location.pathname}?lang=${lang}`;
    window.history.replaceState({}, '', newUrl);
  }, [lang]);

  useEffect(() => {
    const viewMode = urlParams.get('view');

    base44.auth.me().then((u) => {
      if (viewMode !== 'student') {
        if (u.role === 'admin' || u.user_type === 'admin') {
          window.location.href = createPageUrl(`Admin?lang=${lang}`);
          return;
        }
      }
      setUser(u);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allProgress', user?.email],
    queryFn: () => base44.entities.Progress.filter({ user_email: user?.email, completed: true }),
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

  const { data: weeks = [] } = useQuery({
    queryKey: ['weeks'],
    queryFn: () => base44.entities.Week.list()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });

  const { data: readingSessions = [] } = useQuery({
    queryKey: ['readingSessions', user?.email],
    queryFn: () => base44.entities.ReadingSession.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: userPrefs } = useQuery({
    queryKey: ['userPrefs', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user?.email });
      return prefs[0];
    },
    enabled: !!user?.email
  });

  const { data: resumeLesson } = useQuery({
    queryKey: ['resumeLesson', userPrefs?.last_lesson_id],
    queryFn: async () => {
      if (!userPrefs?.last_lesson_id) return null;
      const lessons = await base44.entities.Lesson.filter({ id: userPrefs.last_lesson_id });
      return lessons[0];
    },
    enabled: !!userPrefs?.last_lesson_id
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = streak?.last_activity_date;
      if (lastDate === today) return streak;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak = lastDate === yesterdayStr ? (streak?.current_streak || 0) + 1 : 1;

      const data = {
        user_email: user.email,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak?.longest_streak || 0),
        last_activity_date: today,
        total_points: streak?.total_points || 0
      };

      if (streak?.id) {
        return base44.entities.Streak.update(streak.id, data);
      } else {
        return base44.entities.Streak.create(data);
      }
    }
  });

  useEffect(() => {
    if (user?.email && streak !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      if (streak?.last_activity_date !== today) {
        updateStreakMutation.mutate();
      }
    }
  }, [user?.email, streak]);

  const enrolledCourses = courses.filter(c =>
    enrollments.some(e => e.course_id === c.id)
  );

  const text = {
    en: {
      welcome: "Welcome back",
      myCourses: "My Courses",
      noCourses: "You haven't enrolled in any courses yet.",
      browseButton: "Browse Courses",
      continue: "Continue Learning",
      resumeLearning: "Resume Learning",
      continueFrom: "Continue from"
    },
    es: {
      welcome: "Bienvenido de nuevo",
      myCourses: "Mis Cursos",
      noCourses: "Aún no te has inscrito en ningún curso.",
      browseButton: "Explorar Cursos",
      continue: "Continuar Aprendiendo",
      resumeLearning: "Continuar Aprendiendo",
      continueFrom: "Continuar desde"
    }
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
    <AccessGate user={user}>
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
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
            <Link to={createPageUrl(`AccountSettings?lang=${lang}`)}>
              <Settings className="w-5 h-5 text-slate-500" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{t.welcome}, {user.full_name || user.email}</h1>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <PathwayProgress enrollments={enrollments} courses={courses} progress={[]} />

              {resumeLesson && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1">{t.resumeLearning}</h3>
                    <p className="text-sm text-slate-600 mb-3">{t.continueFrom}: {resumeLesson[`title_${lang}`] || resumeLesson.title_en}</p>
                    <Link to={createPageUrl(`Lesson?id=${resumeLesson.id}&lang=${lang}`)}>
                      <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">{t.continue}</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              <WeeklyStudyPlan enrollments={enrollments} courses={courses} weeks={weeks} />

              <CourseCalendar user={user} userType="student" lang={lang} />

              {/* My Courses */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">{t.myCourses}</h2>
                {enrolledCourses.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">{t.noCourses}</p>
                      <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
                        <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">{t.browseButton}</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {enrolledCourses.map(course => {
                      const enrollment = enrollments.find(e => e.course_id === course.id);
                      return (
                        <CourseCard key={course.id} course={course} lang={lang} enrolled={true} courseInstanceId={enrollment?.course_instance_id || 'direct'} />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <AnnouncementFeed user={user} lang={lang} />
              <StreakCalendar userProfile={userProfile} readingSessions={readingSessions} />
              {streak && <StreakDisplay streak={streak} lang={lang} />}
            </div>
          </div>
        </div>

        <MobileNav lang={lang} currentPage="Dashboard" />
      </div>
    </AccessGate>
  );
}