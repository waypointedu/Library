import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Clock, Users, Calendar, CheckCircle2 } from "lucide-react";
import MobileNav from '@/components/common/MobileNav';

export default function CourseInstanceCatalog() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: terms = [] } = useQuery({
    queryKey: ['academicTerms', 'active'],
    queryFn: async () => {
      const all = await base44.entities.AcademicTerm.list('-start_date');
      return all.filter(t => t.status === 'upcoming' || t.status === 'active');
    }
  });

  const { data: instances = [], isLoading } = useQuery({
    queryKey: ['courseInstances', 'scheduled'],
    queryFn: async () => {
      const all = await base44.entities.CourseInstance.filter({ status: 'scheduled' });
      return all.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', 'published'],
    queryFn: () => base44.entities.Course.filter({ status: 'published' })
  });

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const isEnrolled = (instanceId) => myEnrollments.some(e => e.course_instance_id === instanceId && e.status !== 'dropped');
  const isFull = (instance) => instance.max_students && instance.current_enrollment >= instance.max_students;

  const enrollMutation = useMutation({
    mutationFn: async (instanceId) => {
      const instance = instances.find(i => i.id === instanceId);
      if (isEnrolled(instanceId)) throw new Error('Already enrolled');
      if (isFull(instance)) throw new Error('Course is full');

      await base44.entities.Enrollment.create({
        course_id: instance.course_id,
        course_instance_id: instanceId,
        user_email: user.email,
        status: 'active',
        enrolled_date: new Date().toISOString()
      });

      await base44.entities.CourseInstance.update(instanceId, {
        current_enrollment: (instance.current_enrollment || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courseInstances'] });
    }
  });

  const unenrollMutation = useMutation({
    mutationFn: async (instanceId) => {
      const enrollment = myEnrollments.find(e => e.course_instance_id === instanceId);
      if (!enrollment) throw new Error('Not enrolled');
      await base44.entities.Enrollment.update(enrollment.id, { status: 'dropped' });
      const instance = instances.find(i => i.id === instanceId);
      if (instance) {
        await base44.entities.CourseInstance.update(instanceId, {
          current_enrollment: Math.max(0, (instance.current_enrollment || 1) - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courseInstances'] });
    }
  });

  const filteredInstances = instances.filter(instance => {
    const course = courses.find(c => c.id === instance.course_id);
    if (!course) return false;
    const title = course[`title_${lang}`] || course.title_en;
    return searchQuery === '' || title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{lang === 'es' ? 'Inicia sesión para inscribirte en cursos' : 'Sign in to enroll in courses'}</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-[#1e3a5f]">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="bg-[#1e3a5f] pt-6 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            {lang === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">{lang === 'es' ? 'Próximas Ofertas de Cursos' : 'Upcoming Course Offerings'}</h1>
          <p className="text-white/80">{lang === 'es' ? 'Explora cursos programados e inscríbete para próximos términos' : 'Browse scheduled courses and enroll for upcoming terms'}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={lang === 'es' ? 'Buscar cursos...' : 'Search courses...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="bg-white h-48 rounded-xl animate-pulse"></div>)}
          </div>
        ) : filteredInstances.length === 0 ? (
          <p className="text-center text-slate-500 py-16">{lang === 'es' ? 'No hay ofertas de cursos próximos disponibles' : 'No upcoming course offerings available'}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredInstances.map(instance => {
              const course = courses.find(c => c.id === instance.course_id);
              const term = terms.find(t => t.id === instance.term_id);
              if (!course) return null;

              const title = course[`title_${lang}`] || course.title_en;
              const description = course[`description_${lang}`] || course.description_en;
              const spotsLeft = instance.max_students ? instance.max_students - (instance.current_enrollment || 0) : null;
              const enrolled = isEnrolled(instance.id);
              const full = isFull(instance);

              return (
                <Card key={instance.id}>
                  {course.cover_image_url && (
                    <div className="h-32 overflow-hidden rounded-t-xl">
                      <img src={course.cover_image_url} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{title}</h3>
                      {enrolled && <Badge className="bg-green-100 text-green-700 text-xs whitespace-nowrap">Enrolled</Badge>}
                    </div>
                    <p className="text-slate-500 text-sm mb-1">{term?.name || instance.cohort_name}</p>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{lang === 'es' ? 'Inicia' : 'Starts'}: {new Date(instance.start_date).toLocaleDateString()}</span>
                      {spotsLeft !== null && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{spotsLeft} {lang === 'es' ? 'lugares' : 'spots'}</span>}
                    </div>
                    {enrolled ? (
                      <Button variant="outline" size="sm" className="w-full border-red-200 text-red-600" onClick={() => unenrollMutation.mutate(instance.id)} disabled={unenrollMutation.isPending}>
                        {lang === 'es' ? 'Cancelar inscripción' : 'Unenroll'}
                      </Button>
                    ) : full ? (
                      <Button disabled className="w-full">{lang === 'es' ? 'Lleno' : 'Full'}</Button>
                    ) : (
                      <Button className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8a]" onClick={() => enrollMutation.mutate(instance.id)} disabled={enrollMutation.isPending}>
                        {enrollMutation.isPending ? '...' : (lang === 'es' ? 'Inscribirse' : 'Enroll')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <MobileNav lang={lang} currentPage="CourseInstanceCatalog" />
    </div>
  );
}