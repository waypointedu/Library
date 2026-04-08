import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, Users, Globe, Star, ChevronRight, Menu, X } from "lucide-react";
import CourseCard from '@/components/courses/CourseCard';

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src="https://media.base44.com/images/public/69826d34529ac930f0c94f5a/40c45841e_pexels-pixabay-355288.jpg"
        alt=""
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#1e3a5f]/70"></div>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
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
      browse: "Browse Courses",
      myCourses: "My Courses",
      featured: "Featured Courses",
      viewAll: "View all courses"
    },
    es: {
      browse: "Explorar Cursos",
      myCourses: "Mis Cursos",
      featured: "Cursos Destacados",
      viewAll: "Ver todos los cursos"
    }
  };

  const t = text[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint" className="h-8 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to={createPageUrl(`Pathways?lang=${lang}`)} className="text-sm text-slate-600 hover:text-slate-900">Programs</Link>
              <Link to={createPageUrl(`About?lang=${lang}`)} className="text-sm text-slate-600 hover:text-slate-900">About</Link>
              <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-sm text-slate-600 hover:text-slate-900">Courses</Link>
              <Link to={createPageUrl(`Faculty?lang=${lang}`)} className="text-sm text-slate-600 hover:text-slate-900">Faculty</Link>
              <Link to={createPageUrl(`Apply?lang=${lang}`)} className="text-sm font-medium text-white bg-[#1e3a5f] px-4 py-2 rounded-lg hover:bg-[#2d5a8a] transition-colors">Apply</Link>
              {user ? (
                <Link to={createPageUrl(user.role === 'admin' ? `Admin?lang=${lang}` : `Dashboard?lang=${lang}`)} className="text-sm text-slate-600 hover:text-slate-900">Dashboard</Link>
              ) : (
                <button onClick={() => base44.auth.redirectToLogin()} className="text-sm text-slate-600 hover:text-slate-900">Sign In</button>
              )}
            </div>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white py-4 px-4 space-y-3">
            <Link to={createPageUrl(`Pathways?lang=${lang}`)} className="block text-sm text-slate-600" onClick={() => setMobileMenuOpen(false)}>Programs</Link>
            <Link to={createPageUrl(`About?lang=${lang}`)} className="block text-sm text-slate-600" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="block text-sm text-slate-600" onClick={() => setMobileMenuOpen(false)}>Courses</Link>
            <Link to={createPageUrl(`Faculty?lang=${lang}`)} className="block text-sm text-slate-600" onClick={() => setMobileMenuOpen(false)}>Faculty</Link>
            <Link to={createPageUrl(`Apply?lang=${lang}`)} className="block text-sm font-medium text-[#1e3a5f]" onClick={() => setMobileMenuOpen(false)}>Apply</Link>
            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <Link to={createPageUrl(user.role === 'admin' ? `Admin?lang=${lang}` : `Dashboard?lang=${lang}`)} className="block text-sm font-semibold text-[#1e3a5f]" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              ) : (
                <button onClick={() => { setMobileMenuOpen(false); base44.auth.redirectToLogin(); }} className="block text-sm font-semibold text-[#1e3a5f]">Sign In</button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <HeroBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              to{' '}
              <em className="not-italic text-amber-400">all</em>
              {' '}the nations
            </h1>
            <p className="text-xl text-white/90 mb-8">
              A tuition-free Christian college education that pursues the Good, the True, and the Beautiful.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl(`Apply?lang=${lang}`)}>
                <Button size="lg" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  {lang === 'es' ? 'Aplicar' : 'Apply'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  {t.browse}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            A tuition-free Christian college education that pursues the Good, the True, and the Beautiful.
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Waypoint Institute offers a supporter-funded, tuition-free college pathway in Scripture, doctrine, culture, and mission. Learn through self-paced modules, guided checkpoints, and oral capstones that keep formation personal and flexible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl(`Apply?lang=${lang}`)}>
              <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">{lang === 'es' ? 'Aplicar' : 'Apply'}</Button>
            </Link>
            <Link to={createPageUrl(`Support?lang=${lang}`)}>
              <Button variant="outline">{lang === 'es' ? 'Apoyar' : 'Support'}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <GraduationCap className="w-10 h-10 text-[#1e3a5f] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Tuition-free college</h3>
              <p className="text-slate-600">Your college-level formation is fully covered by supporters, so tuition, testing, and resources never become barriers.</p>
            </div>
            <div className="text-center p-6">
              <BookOpen className="w-10 h-10 text-[#1e3a5f] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Self-paced flexibility</h3>
              <p className="text-slate-600">Move through modular lessons and shared checkpoints so you can study around real life while staying on track.</p>
            </div>
            <div className="text-center p-6">
              <Users className="w-10 h-10 text-[#1e3a5f] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Capstones that form witnesses</h3>
              <p className="text-slate-600">Every course ends with a recorded oral examination so faculty can affirm mastery and shepherd growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t.featured}</h2>
              <p className="text-slate-600">{lang === 'es' ? 'Explora nuestros programas de estudio' : 'Explore our programs of study'}</p>
            </div>
            <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-[#1e3a5f] font-medium hover:underline flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="bg-slate-100 h-64 rounded-xl animate-pulse"></div>)}
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
          <div className="text-center mt-8">
            <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
              <Button variant="outline" size="lg">{t.viewAll}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-16 bg-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Who we serve</h2>
          <div className="space-y-4">
            <p className="text-white/90">Christians and seekers worldwide who need serious formation without cost.</p>
            <p className="text-white/90">Students in a variety of languages and contexts who benefit from self-paced weeks with shared milestones.</p>
            <p className="text-white/90">Lay leaders and bi-vocational ministers seeking structured study alongside ministry life.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="font-semibold">Waypoint Institute</p>
              <p className="text-slate-400 text-sm">Tuition-free Christian college education</p>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link to={createPageUrl(`About?lang=${lang}`)} className="hover:text-white">About</Link>
              <Link to={createPageUrl(`Contact?lang=${lang}`)} className="hover:text-white">Contact</Link>
              <Link to={createPageUrl(`FAQ?lang=${lang}`)} className="hover:text-white">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}