import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, Users, Globe, Star, ChevronRight } from "lucide-react";
import CourseCard from '@/components/courses/CourseCard';
import LanguageToggle from '@/components/common/LanguageToggle';
import MobileNav from '@/components/common/MobileNav';

export default function Home() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', 'published'],
    queryFn: () => base44.entities.Course.filter({ status: 'published' }),
    select: (data) => data.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const featuredCourses = courses.slice(0, 3);
  const enrolledCourseIds = enrollments.map(e => e.course_id);

  const text = {
    en: {
      hero: "Toward that which truly",
      heroItalic: "is.",
      tagline: "A tuition-free Christian college education that pursues the Good, the True, and the Beautiful.",
      description: "Waypoint Institute offers a supporter-funded, tuition-free college pathway in Scripture, doctrine, culture, and mission. Learn through self-paced modules, guided checkpoints, and oral capstones that keep formation personal and flexible.",
      browse: "Browse Courses",
      myCourses: "My Courses",
      features: [
        { icon: GraduationCap, title: "Tuition-free college", desc: "Your formation is fully covered by supporters" },
        { icon: BookOpen, title: "Self-paced flexibility", desc: "Study around real life while staying on track" },
        { icon: Users, title: "Capstones that form witnesses", desc: "Oral examinations with faculty guidance" }
      ],
      featured: "Featured Courses",
      viewAll: "View all courses"
    },
    es: {
      hero: "Hacia lo que verdaderamente",
      heroItalic: "es.",
      tagline: "Una educación universitaria cristiana sin matrícula que persigue el Bien, la Verdad y la Belleza.",
      description: "Waypoint Institute ofrece una vía universitaria sin matrícula financiada por colaboradores en Escritura, doctrina, cultura y misión. Aprende a través de módulos a tu ritmo, puntos de control guiados y capstones orales que mantienen la formación personal y flexible.",
      browse: "Explorar Cursos",
      myCourses: "Mis Cursos",
      features: [
        { icon: GraduationCap, title: "Universidad sin matrícula", desc: "Tu formación está cubierta por colaboradores" },
        { icon: BookOpen, title: "Flexibilidad a tu ritmo", desc: "Estudia según tu vida real" },
        { icon: Users, title: "Capstones formativos", desc: "Exámenes orales con guía docente" }
      ],
      featured: "Cursos Destacados",
      viewAll: "Ver todos los cursos"
    }
  };

  const t = text[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint Institute" className="h-10" />
                </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-slate-600 hover:text-slate-900 transition-colors">
              {lang === 'es' ? 'Cursos' : 'Courses'}
            </Link>
            <Link to={createPageUrl(`About?lang=${lang}`)} className="text-slate-600 hover:text-slate-900 transition-colors">
              {lang === 'es' ? 'Acerca de' : 'About'}
            </Link>
            {user && (
              <Link to={createPageUrl(`Dashboard?lang=${lang}`)} className="text-slate-600 hover:text-slate-900 transition-colors">
                {lang === 'es' ? 'Mi Panel' : 'Dashboard'}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={setLang} />
            {user ? (
              <Link to={createPageUrl(`Dashboard?lang=${lang}`)}>
                <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                  {t.myCourses}
                </Button>
              </Link>
            ) : (
              <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-[#1e3a5f]/5 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#1e3a5f]/10 rounded-full px-4 py-1.5 mb-8">
              <Globe className="w-4 h-4 text-[#1e3a5f]" />
              <span className="text-sm font-medium text-[#1e3a5f]">
                {lang === 'es' ? 'A todas las naciones' : 'To all the nations'}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-6 leading-tight">
              {t.hero}{' '}
              <em className="text-[#c4933f] font-serif">{t.heroItalic}</em>
            </h1>

            <p className="text-xl text-slate-600 mb-4">
              {t.tagline}
            </p>

            <p className="text-slate-500 mb-10 max-w-2xl mx-auto">
              {t.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
                <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#2d5a8a] gap-2 w-full sm:w-auto">
                  {t.browse}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {t.features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1e3a5f]/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#1e3a5f]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-semibold text-slate-900">{t.featured}</h2>
            <Link
              to={createPageUrl(`Catalog?lang=${lang}`)}
              className="text-[#1e3a5f] font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              {t.viewAll}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  lang={lang}
                  enrolled={enrolledCourseIds.includes(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint Institute" className="h-12 brightness-0 invert" />
                </div>
              <p className="text-slate-400 max-w-md text-sm">
                {lang === 'es' 
                  ? 'Guiados por la Gran Comisión, vamos y hacemos discípulos de todas las naciones.'
                  : 'Guided by the Great Commission, we go and make disciples of all nations.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <h4 className="font-semibold mb-4">{lang === 'es' ? 'Explorar' : 'Explore'}</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><Link to={createPageUrl(`Catalog?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Cursos' : 'Courses'}</Link></li>
                  <li><Link to={createPageUrl(`Pathways?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Rutas Académicas' : 'Pathways'}</Link></li>
                  <li><Link to={createPageUrl(`About?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Cómo funciona' : 'How it works'}</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Waypoint Institute
          </div>
        </div>
      </footer>

      <MobileNav lang={lang} currentPage="Home" />
    </div>
  );
}