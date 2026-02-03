import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, BookOpen, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import LanguageToggle from '@/components/common/LanguageToggle';
import MobileNav from '@/components/common/MobileNav';
import ProgressBar from '@/components/common/ProgressBar';

export default function Pathways() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: pathways = [] } = useQuery({
    queryKey: ['pathways'],
    queryFn: () => base44.entities.Pathway.filter({ status: 'published' })
  });

  const { data: myPathways = [] } = useQuery({
    queryKey: ['pathwayEnrollments', user?.email],
    queryFn: () => base44.entities.PathwayEnrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const enrollMutation = useMutation({
    mutationFn: (pathwayId) => base44.entities.PathwayEnrollment.create({
      pathway_id: pathwayId,
      user_email: user.email,
      status: 'active',
      enrolled_date: new Date().toISOString()
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pathwayEnrollments'] })
  });

  const getPathwayProgress = (pathway) => {
    const completedCourses = pathway.course_ids?.filter(cid => 
      allEnrollments.some(e => e.course_id === cid && e.status === 'completed')
    ).length || 0;
    const total = pathway.course_ids?.length || 1;
    return Math.round((completedCourses / total) * 100);
  };

  const text = {
    en: { title: 'Academic Pathways', subtitle: 'Pursue degrees, certificates, and specializations', enroll: 'Enroll', enrolled: 'Enrolled', courses: 'courses', months: 'months', credits: 'credits', viewDetails: 'View Details', myPathways: 'My Pathways', available: 'Available Pathways' },
    es: { title: 'Rutas Académicas', subtitle: 'Obtén títulos, certificados y especializaciones', enroll: 'Inscribirse', enrolled: 'Inscrito', courses: 'cursos', months: 'meses', credits: 'créditos', viewDetails: 'Ver Detalles', myPathways: 'Mis Rutas', available: 'Rutas Disponibles' }
  };
  const t = text[lang];

  const enrolledIds = myPathways.map(p => p.pathway_id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-6">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Waypoint Institute</span>
          </Link>
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-3">{t.title}</h1>
          <p className="text-xl text-slate-600">{t.subtitle}</p>
        </div>

        {user && myPathways.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">{t.myPathways}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {myPathways.map(enrollment => {
                const pathway = pathways.find(p => p.id === enrollment.pathway_id);
                if (!pathway) return null;
                const progress = getPathwayProgress(pathway);
                return (
                  <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Award className="w-6 h-6 text-amber-600" />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 mb-1">{pathway[`title_${lang}`] || pathway.title_en}</h3>
                          <Badge>{pathway.type}</Badge>
                        </div>
                      </div>
                      <p className="text-slate-600 mb-4">{pathway[`description_${lang}`] || pathway.description_en}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-semibold text-[#1e3a5f]">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} />
                      </div>
                      <Link to={createPageUrl(`Pathway?id=${pathway.id}&lang=${lang}`)}>
                        <Button className="w-full bg-[#1e3a5f]">
                          {t.viewDetails} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">{t.available}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathways.filter(p => !enrolledIds.includes(p.id)).map(pathway => (
              <Card key={pathway.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Award className="w-6 h-6 text-[#1e3a5f]" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{pathway[`title_${lang}`] || pathway.title_en}</h3>
                      <Badge variant="outline">{pathway.type}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{pathway[`description_${lang}`] || pathway.description_en}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{pathway.course_ids?.length || 0} {t.courses}</span>
                    {pathway.estimated_months > 0 && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{pathway.estimated_months} {t.months}</span>}
                  </div>
                  {user ? (
                    <Button onClick={() => enrollMutation.mutate(pathway.id)} className="w-full bg-[#1e3a5f]">{t.enroll}</Button>
                  ) : (
                    <Button onClick={() => base44.auth.redirectToLogin()} className="w-full bg-[#1e3a5f]">{t.enroll}</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <MobileNav lang={lang} currentPage="Courses" />
    </div>
  );
}