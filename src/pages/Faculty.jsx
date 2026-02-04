import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Linkedin } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';

export default function Faculty() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  const faculty = [
    {
      name: "Dr. Luke Tallon",
      role: "Founder & President",
      bio: "Luke holds a PhD in Theological Ethics and serves as the visionary leader of Waypoint Institute. His passion is equipping believers worldwide with rigorous theological education.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      email: "luke@waypoint.institute"
    },
    {
      name: "Dr. Sarah Chen",
      role: "Academic Dean",
      bio: "Sarah brings 15 years of experience in online theological education and curriculum design. She holds a PhD in Biblical Studies from Cambridge University.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      email: "sarah@waypoint.institute"
    },
    {
      name: "Rev. Marcus Johnson",
      role: "Professor of Biblical Studies",
      bio: "Marcus has served as a missionary and pastor in East Africa for over a decade. He teaches Old and New Testament courses with deep pastoral wisdom.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      email: "marcus@waypoint.institute"
    },
    {
      name: "Dr. Maria Rodriguez",
      role: "Professor of Theology",
      bio: "Maria specializes in systematic theology and has authored several books on Christian doctrine. She is passionate about making theology accessible to all.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      email: "maria@waypoint.institute"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
            <Link to={createPageUrl(`Faculty?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Facultad' : 'Faculty'}
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

      <div className="max-w-7xl mx-auto px-6 py-32">
        {/* Hero */}
        <div className="mb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-8 leading-tight">
            Meet Our <span className="italic text-[#c4933f]">Faculty</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Our faculty bring decades of pastoral, missionary, and academic experience to guide students through rigorous theological formation.
          </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {faculty.map((member, index) => (
            <Card key={index} className="overflow-hidden shadow-xl border-slate-200 hover:shadow-2xl transition-shadow">
              <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-3xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-lg text-white/90">{member.role}</p>
                </div>
              </div>
              <CardContent className="p-8">
                <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                  {member.bio}
                </p>
                <div className="flex gap-3">
                  <a 
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Statement */}
        <section className="mt-20 p-10 md:p-14 bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c4933f]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-5">Our Teaching Philosophy</h2>
            <p className="text-xl text-white/95 leading-relaxed">
              We believe theological education should be both accessible and rigorous. Our faculty are committed to shepherding students through deep engagement with Scripture, doctrine, and the Christian tradition—all while remaining grounded in the realities of ministry and mission.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">Learn with us</h2>
          <p className="text-slate-600 mb-8 text-lg max-w-2xl mx-auto">
            Experience world-class theological education from faculty who care deeply about your formation and calling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl(`Apply?lang=${lang}`)}>
              <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                {lang === 'es' ? 'Aplicar Ahora' : 'Apply Now'}
              </Button>
            </Link>
            <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
              <Button size="lg" variant="outline" className="border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                {lang === 'es' ? 'Ver Cursos' : 'View Courses'}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}