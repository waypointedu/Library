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
    base44.auth.me().then((u) => {
      setUser(u);
      // Auto-redirect logged-in users to their dashboard
      if (u.role === 'admin' || u.user_type === 'admin') {
        window.location.href = createPageUrl('Admin?lang=' + lang);
      } else if (u.user_type === 'instructor') {
        window.location.href = createPageUrl('InstructorDashboard?lang=' + lang);
      } else {
        window.location.href = createPageUrl('Dashboard?lang=' + lang);
      }
    }).catch(() => setUser(null));
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

  // Don't render the marketing site if user is logged in - redirect happens in useEffect
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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

      {/* Hero Section with Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop" 
            alt="Mountain landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Globe className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              {lang === 'es' ? 'A todas las naciones' : 'To all the nations'}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-white mb-6 leading-[1.1]">
            Toward that which truly{' '}
            <em className="text-[#c4933f] font-serif">is.</em>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-4 font-light max-w-3xl mx-auto">
            {t.tagline}
          </p>

          <p className="text-base md:text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            {t.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
              <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#2d5a8a] text-white gap-2 w-full sm:w-auto px-8 h-12 text-base">
                {lang === 'es' ? 'Explorar Cursos' : 'Browse Courses'}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to={createPageUrl(`Apply?lang=${lang}`)}>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#1e3a5f] w-full sm:w-auto px-8 h-12 text-base bg-transparent">
                {lang === 'es' ? 'Aplicar Ahora' : 'Apply Now'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">
              {lang === 'es' ? 'Una Formación Transformadora' : 'A Transformative Education'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {lang === 'es' 
                ? 'Diseñado para equipar a la próxima generación de líderes cristianos'
                : 'Designed to equip the next generation of Christian leaders'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {t.features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center mb-6 mx-auto">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">{t.featured}</h2>
            <p className="text-lg text-slate-600">
              {lang === 'es' 
                ? 'Explora nuestros programas de estudio acreditados'
                : 'Explore our accredited programs of study'}
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
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

          <div className="text-center mt-12">
            <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
              <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                {t.viewAll}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6 leading-relaxed">
            {lang === 'es' 
              ? '"Nuestro compromiso es formar testigos fieles que busquen la verdad, encarnen la belleza y sirvan al bien común."'
              : '"Our commitment is to form faithful witnesses who seek truth, embody beauty, and serve the common good."'}
          </h2>
          <Link to={createPageUrl(`About?lang=${lang}`)}>
            <Button variant="link" className="text-[#1e3a5f] text-base">
              {lang === 'es' ? 'Conoce Nuestra Historia' : 'Learn Our Story'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" 
                alt="Waypoint Institute" 
                className="h-12 brightness-0 invert mb-4" 
              />
              <p className="text-white/80 max-w-md">
                {lang === 'es' 
                  ? 'Guiados por la Gran Comisión, vamos y hacemos discípulos de todas las naciones.'
                  : 'Guided by the Great Commission, we go and make disciples of all nations.'}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">{lang === 'es' ? 'Explorar' : 'Explore'}</h4>
              <ul className="space-y-3 text-white/80">
                <li><Link to={createPageUrl(`Pathways?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Programas' : 'Programs'}</Link></li>
                <li><Link to={createPageUrl(`Catalog?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Cursos' : 'Courses'}</Link></li>
                <li><Link to={createPageUrl(`HowItWorks?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Cómo funciona' : 'How it works'}</Link></li>
                <li><Link to={createPageUrl(`About?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Acerca de' : 'About'}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">{lang === 'es' ? 'Participar' : 'Get Involved'}</h4>
              <ul className="space-y-3 text-white/80">
                <li><Link to={createPageUrl(`Apply?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Aplicar' : 'Apply'}</Link></li>
                <li><Link to={createPageUrl(`Support?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Apoyar' : 'Support'}</Link></li>
                <li><Link to={createPageUrl(`Contact?lang=${lang}`)} className="hover:text-white transition-colors">{lang === 'es' ? 'Contacto' : 'Contact'}</Link></li>
                <li><Link to={createPageUrl(`FAQ?lang=${lang}`)} className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20 text-center text-white/60 text-sm">
            © {new Date().getFullYear()} Waypoint Institute. {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
}