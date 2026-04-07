import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Library() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  const text = {
    en: { title: 'Library', comingSoon: 'Coming Soon', description: 'Our digital library is currently under development. Check back soon for access to thousands of theological and academic resources.', backHome: 'Back to Home' },
    es: { title: 'Biblioteca', comingSoon: 'Próximamente', description: 'Nuestra biblioteca digital está actualmente en desarrollo.', backHome: 'Volver al Inicio' }
  };

  const t = text[lang];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-4">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t.title}</h1>
        <div className="inline-block bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1 rounded-full mb-4">{t.comingSoon}</div>
        <p className="text-slate-600 mb-6">{t.description}</p>
        <Link to={createPageUrl(`Home?lang=${lang}`)}>
          <Button variant="outline">{t.backHome}</Button>
        </Link>
      </div>
    </div>
  );
}