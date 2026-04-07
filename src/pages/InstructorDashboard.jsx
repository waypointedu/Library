import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, MessageSquare, Eye, FileText, TrendingUp, Users } from "lucide-react";
import SemesterAvailability from '@/components/instructor/SemesterAvailability';
import CourseCalendar from '@/components/calendar/CourseCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnnouncementFeed from '@/components/dashboard/AnnouncementFeed';

export default function InstructorDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      const isAuthorized = u.role === 'admin' || u.user_type === 'admin' || u.user_type === 'instructor';
      if (!isAuthorized) {
        window.location.href = createPageUrl('Dashboard');
      }
      setUser(u);
    }).catch(() => { base44.auth.redirectToLogin(); });
  }, []);

  const { data: courseInstances = [] } = useQuery({
    queryKey: ['courseInstances', user?.email],
    queryFn: () => base44.entities.CourseInstance.filter({}),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => base44.entities.WrittenAssignmentSubmission.filter({ status: 'submitted' })
  });

  const { data: forumPosts = [] } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list()
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => base44.entities.Enrollment.list()
  });

  if (!user) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  const assignedInstances = courseInstances.filter(ci => ci.instructor_emails?.includes(user.email));
  const totalStudents = new Set(enrollments.map(e => e.user_email)).size;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to={createPageUrl('Home')}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint" className="h-7 w-auto" />
        </Link>
        <span className="text-sm text-slate-600">Instructor Dashboard</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Instructor Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'To Grade', value: submissions.length, icon: ClipboardCheck },
            { label: 'Forum Posts', value: forumPosts.length, icon: MessageSquare },
            { label: 'My Courses', value: assignedInstances.length, icon: FileText },
            { label: 'Total Students', value: totalStudents, icon: Users },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className="w-8 h-8 text-[#1e3a5f]" />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            <Card>
              <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
              <CardContent>
                {assignedInstances.length === 0 ? (
                  <p className="text-slate-500">No courses assigned yet</p>
                ) : (
                  <div className="space-y-3">
                    {assignedInstances.map(instance => {
                      const course = courses.find(c => c.id === instance.course_id);
                      if (!course) return null;
                      return (
                        <div key={instance.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{course[`title_${lang}`] || course.title_en}</p>
                            <p className="text-sm text-slate-500">{instance.cohort_name}</p>
                          </div>
                          <div className="flex gap-2">
                            <Link to={createPageUrl(`CourseView?id=${course.id}&courseInstanceId=${instance.id}&lang=${lang}`)}>
                              <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" /> View</Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <AnnouncementFeed user={user} lang={lang} />
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <CourseCalendar user={user} userType="instructor" lang={lang} />
          </TabsContent>

          <TabsContent value="availability" className="mt-4">
            <SemesterAvailability user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}