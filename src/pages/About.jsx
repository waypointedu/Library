import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, Heart, Globe, BookOpen, Target } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';

export default function About() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
    const newUrl = `${window.location.pathname}?lang=${lang}`;
    window.history.replaceState({}, '', newUrl);
  }, [lang]);

  const text = {
    en: {
      mission: "Mission",
      missionText: "Guided by the Great Commission (Matthew 28:18–20), we go and make disciples of all nations through accessible, serious Christian learning.",
      ethos: "Ethos",
      ethosItems: [
        { title: "Christocentrism", desc: "Jesus is the center of history, our thinking, and every decision we make." },
        { title: "Biblical & Useful", desc: "We pursue truth wherever it is honorable, excellent, and expedient for discipleship." },
        { title: "Accessibility", desc: "We dismantle barriers—academic, cultural, or technological—so learners can encounter Christ together." }
      ],
      faith: "Faith",
      faithText: "We adhere to the Apostles' Creed, confessing the faith delivered once for all to the saints."
    },
    es: {
      mission: "Misión",
      missionText: "Guiados por la Gran Comisión (Mateo 28:18–20), vamos y hacemos discípulos de todas las naciones a través del aprendizaje cristiano accesible y serio.",
      ethos: "Ethos",
      ethosItems: [
        { title: "Cristocentrismo", desc: "Jesús es el centro de la historia, nuestro pensamiento y cada decisión que tomamos." },
        { title: "Bíblico y Útil", desc: "Perseguimos la verdad dondequiera que sea honorable, excelente y conveniente para el discipulado." },
        { title: "Accesibilidad", desc: "Desmantelamos barreras académicas, culturales o tecnológicas para que los estudiantes encuentren a Cristo juntos." }
      ],
      faith: "Fe",
      faithText: "Nos adherimos al Credo de los Apóstoles, confesando la fe entregada una vez para siempre a los santos."
    }
  };

  const t = text[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Waypoint Institute</span>
          </Link>
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-light text-slate-900 mb-16 text-center">
          {lang === 'es' ? 'Acerca de Waypoint' : 'About Waypoint'}
        </h1>

        {/* Mission */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f]/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-[#1e3a5f]" />
            </div>
            <h2 className="text-3xl font-semibold text-slate-900">{t.mission}</h2>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">{t.missionText}</p>
        </section>

        {/* Ethos */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f]/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#1e3a5f]" />
            </div>
            <h2 className="text-3xl font-semibold text-slate-900">{t.ethos}</h2>
          </div>
          <div className="space-y-6">
            {t.ethosItems.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Faith */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f]/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#1e3a5f]" />
            </div>
            <h2 className="text-3xl font-semibold text-slate-900">{t.faith}</h2>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed">{t.faithText}</p>
        </section>
      </div>
    </div>
  );
}