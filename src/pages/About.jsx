import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import LanguageToggle from '@/components/common/LanguageToggle';

export default function About() {
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

      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">Mission, Ethos, and Faith</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Waypoint Institute exists to obey the Great Commission through a tuition-free Christian college education. Our students pursue the Good, the True, and the Beautiful together, rooted in Christ and welcoming disciples from every nation.
          </p>
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border-l-4 border-[#1e3a5f]">
            <p className="text-lg text-slate-700 italic">
              "Go therefore and make disciples of all nations… teaching them to observe all that I have commanded you."
            </p>
            <p className="text-sm text-slate-500 mt-2">Matthew 28:19–20</p>
          </div>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-3xl font-light text-slate-900 mb-6">Our Mission</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Waypoint Institute forms resilient disciples who know Scripture, love the church, and live as witnesses wherever God places them. We do this through tuition-free college courses, pastoral presence, and capstone conversations that call each student to faithful obedience.
            </p>
            <p>
              We steward contributor support to offer rigorous, college-level theological learning without barriers so believers in restricted or resource-limited contexts can be trained for gospel ministry.
            </p>
            <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">How Mission Shapes the Year</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                <span>Courses run on a shared calendar with self-paced weeks and clearly defined checkpoints.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                <span>Capstone dialogues function as oral examinations to affirm mastery and shepherd growth.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mt-2 flex-shrink-0" />
                <span>Future associate pathways will invite students into collaborative research and witness.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Tuition Free */}
        <section className="mb-16 p-8 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] rounded-2xl text-white">
          <h2 className="text-2xl font-semibold mb-3">Always tuition-free, assessment costs covered</h2>
          <p className="text-white/90 leading-relaxed">
            No application fees. No tuition bills. No charges for exams or capstones. Supporters underwrite every course so you never enter a credit card number for your college education, to study, demonstrate mastery, or graduate.
          </p>
        </section>

        {/* Ethos */}
        <section className="mb-16">
          <h2 className="text-3xl font-light text-slate-900 mb-6">Our Ethos</h2>
          <p className="text-slate-600 mb-8">These commitments flow from Christ and guide every lesson, discussion, and decision.</p>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">Christocentrism</h3>
              <p className="text-slate-600 leading-relaxed">
                Jesus is the center of history, the lens for Scripture, and the anchor of our hope. Every course, conversation, and assessment aims to magnify His lordship.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">Pursuit of Truth</h3>
              <p className="text-slate-600 leading-relaxed italic mb-2">
                "Whatever is true, whatever is honorable… if there is any excellence, if there is anything worthy of praise, think about these things."
              </p>
              <p className="text-sm text-slate-500">(Philippians 4:8)</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">Radical Accessibility</h3>
              <p className="text-slate-600 leading-relaxed">
                Jesus warned the Pharisees against shutting people out of the kingdom (Matthew 23:13). We do the opposite—removing financial, cultural, and technological barriers so every willing disciple can learn freely.
              </p>
            </div>
          </div>
        </section>

        {/* Faith Statement */}
        <section className="mb-16">
          <h2 className="text-3xl font-light text-slate-900 mb-6">Mere-Christian Statement of Faith</h2>
          <p className="text-slate-600 mb-6">
            We confess the Apostles' Creed with the historic church, standing shoulder to shoulder with believers across traditions and centuries.
          </p>
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">The Apostles' Creed</h3>
            <div className="text-slate-700 leading-relaxed space-y-3">
              <p>I believe in God, the Father almighty,</p>
              <p className="ml-4">maker of heaven and earth.</p>
              <p className="mt-4">And in Jesus Christ, his only Son, our Lord,</p>
              <p className="ml-4">who was conceived by the Holy Spirit,</p>
              <p className="ml-4">born of the Virgin Mary,</p>
              <p className="ml-4">suffered under Pontius Pilate,</p>
              <p className="ml-4">was crucified, died, and was buried;</p>
              <p className="ml-4">he descended to the dead.</p>
              <p className="ml-4">On the third day he rose again;</p>
              <p className="ml-4">he ascended into heaven,</p>
              <p className="ml-4">he is seated at the right hand of the Father,</p>
              <p className="ml-4">and he will come again to judge the living and the dead.</p>
              <p className="mt-4">I believe in the Holy Spirit,</p>
              <p className="ml-4">the holy catholic Church,</p>
              <p className="ml-4">the communion of saints,</p>
              <p className="ml-4">the forgiveness of sins,</p>
              <p className="ml-4">the resurrection of the body,</p>
              <p className="ml-4">and the life everlasting. Amen.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Join our community</h2>
          <p className="text-slate-600 mb-8">
            Step into a learning community that is Christ-centered, truth-seeking, and globally accessible. Biblical Formation begins in 2025.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl(`Apply?lang=${lang}`)}>
              <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                {lang === 'es' ? 'Aplicar' : 'Apply'}
              </Button>
            </Link>
            <Link to={createPageUrl(`Support?lang=${lang}`)}>
              <Button size="lg" variant="outline" className="border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                {lang === 'es' ? 'Apoyar educación sin matrícula' : 'Support tuition-free college'}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}