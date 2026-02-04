import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Heart, Mail } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';

export default function Faculty() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

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

      <div className="max-w-6xl mx-auto px-6 py-32">
        {/* Hero */}
        <div className="mb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-8 leading-tight">
            Meet Our <span className="italic text-[#c4933f]">Faculty</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Shepherds and scholars who guide students through rigorous theological formation, oral examinations, and prayerful mentorship.
          </p>
        </div>

        {/* Core Faculty */}
        <section className="mb-24">
          <h2 className="text-4xl font-light text-slate-900 mb-12 text-center">Core Faculty</h2>
          
          <div className="space-y-16">
            {/* Josh Snell */}
            <Card className="overflow-hidden shadow-xl border border-slate-200">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src="https://waypoint.institute/assets/img/snell.jpeg" 
                    alt="Josh Snell" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="md:w-2/3 p-10">
                  <div className="mb-6">
                    <h3 className="text-3xl font-semibold text-slate-900 mb-2">Josh Snell</h3>
                    <p className="text-lg text-[#c4933f] font-medium">Academic Director / Biblical Studies Faculty</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Josh Snell holds a B.A. in Philosophy and English from Boise State University and an M.Div. from The Southern Baptist Theological Seminary. A non-denominational pastor, he has taught and traveled in Europe and Southeast Asia, bringing a global perspective to Christian theology, philosophy, and the dialogue between worldviews.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Courses</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">Hermeneutics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">Old Testament: Torah, Prophets, Writings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">New Testament: Gospels & Acts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">New Testament: Epistles & Revelation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">New Testament Use of the Old Testament</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">Apologetics Seminar Series (co-faculty)</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Michael Barros */}
            <Card className="overflow-hidden shadow-xl border border-slate-200">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src="https://waypoint.institute/assets/img/barros.jpeg" 
                    alt="Michael Barros" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="md:w-2/3 p-10">
                  <div className="mb-6">
                    <h3 className="text-3xl font-semibold text-slate-900 mb-2">Michael Barros</h3>
                    <p className="text-lg text-[#c4933f] font-medium">Operations Director / Religion & Culture Faculty</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Michael C. Barros is a scholar of religion and culture and an active researcher in the cognitive science of religion, with training in psychology and theology and a background in classical education. He teaches philosophy at the University of the People and has taught undergraduate theology, philosophy, and literature.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Courses</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">Waypoint Introduction Seminar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">Biblical Principles of Culture</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">Biblical Spiritual Practices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">Apologetics Seminar Series (co-faculty)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                        <span className="text-slate-600">Associate Research Seminar (coming soon)</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>

        {/* Contributing Faculty */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-slate-900 mb-4">Contributing Faculty</h2>
            <p className="text-xl text-slate-600">Additional faculty members to be announced</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-50 border-2 border-dashed border-slate-300">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">To be announced</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mentorship & Support */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* Mentorship */}
          <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] text-white shadow-xl border-0">
            <CardContent className="p-10">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-6">Mentorship Commitments</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 mt-2 flex-shrink-0" />
                  <span className="text-white/95">Regular feedback on written work and spiritual practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 mt-2 flex-shrink-0" />
                  <span className="text-white/95">Preparation calls ahead of each capstone conversation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 mt-2 flex-shrink-0" />
                  <span className="text-white/95">Prayerful shepherding for students across time zones</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 mt-2 flex-shrink-0" />
                  <span className="text-white/95">Shared reflection on vocation, mission, and witness</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Supporting Students */}
          <Card className="bg-white shadow-xl border border-slate-200">
            <CardContent className="p-10">
              <div className="w-14 h-14 rounded-full bg-[#c4933f]/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#c4933f]" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Supporting Students</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                  <span className="text-slate-600">Translation summaries for capstones recorded in other languages</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                  <span className="text-slate-600">Resource development for the digital library and research seminar</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                  <span className="text-slate-600">Coordination with contributors to keep every course tuition-free</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                  <span className="text-slate-600">Collaboration with volunteers who bring regional expertise</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">Partner with our faculty</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Interested in contributing to the mission? Reach out to learn about faculty opportunities and collaboration.
          </p>
          <Link to={createPageUrl(`Contact?lang=${lang}`)}>
            <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}