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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" 
              alt="Waypoint Institute" 
              className="h-12" 
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            <Link to={createPageUrl(`Pathways?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Programas' : 'Programs'}
            </Link>
            <Link to={createPageUrl(`About?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Acerca de' : 'About'}
            </Link>
            <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Cursos' : 'Courses'}
            </Link>
            <Link to={createPageUrl(`HowItWorks?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Cómo Funciona' : 'How it works'}
            </Link>
            <Link to={createPageUrl(`Support?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Apoyar' : 'Support'}
            </Link>
            <Link to={createPageUrl(`FAQ?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              FAQ
            </Link>
            <Link to={createPageUrl(`Contact?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Contacto' : 'Contact'}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={setLang} />
            <Link to={createPageUrl(`Apply?lang=${lang}`)}>
              <Button size="sm" variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white hidden sm:inline-flex">
                {lang === 'es' ? 'Aplicar' : 'Apply'}
              </Button>
            </Link>
            <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-32">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">Learning Pathway</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {lang === 'es' 
              ? 'Completa el certificado gratuito de Formación Bíblica de Waypoint durante el primer año'
              : 'Complete Waypoint\'s tuition-free Biblical Formation college certificate during year one'}
          </p>
        </div>

        <div className="space-y-16">
          {pathways.map((pathway, idx) => (
            <Card key={pathway.id} className="border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-[#1e3a5f] text-white p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-light">Year {idx === 0 ? 'One' : 'Two'}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">{pathway[`title_${lang}`] || pathway.title_en}</h3>
                  <p className="text-white/90 text-lg leading-relaxed">{pathway[`description_${lang}`] || pathway.description_en}</p>
                </div>

                {user && enrolledIds.includes(pathway.id) && (
                  <div className="bg-emerald-50 border-t border-emerald-100 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-emerald-800">Your Progress</span>
                      <span className="text-sm font-semibold text-emerald-900">{getPathwayProgress(pathway)}%</span>
                    </div>
                    <ProgressBar value={getPathwayProgress(pathway)} className="mb-4" />
                    <Link to={createPageUrl(`Pathway?id=${pathway.id}&lang=${lang}`)}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Continue Learning <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}

                {!user && (
                  <div className="p-6 bg-slate-50 border-t">
                    <div className="flex gap-3">
                      <Button onClick={() => base44.auth.redirectToLogin()} className="flex-1 bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                        Sign In to Enroll
                      </Button>
                      <Link to={createPageUrl(`Apply?lang=${lang}`)}>
                        <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f]">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <MobileNav lang={lang} currentPage="Courses" />
    </div>
  );
}