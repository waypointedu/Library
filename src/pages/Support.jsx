import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, BookOpen, Users, Mail } from "lucide-react";
import PublicHeader from '@/components/common/PublicHeader';

export default function Support() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader lang={lang} currentPage="Support" />

      <div className="pt-24 pb-12 px-4 bg-[#1e3a5f]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{lang === 'es' ? 'Apoyar a Waypoint Institute' : 'Support Waypoint Institute'}</h1>
          <p className="text-white/80">{lang === 'es' ? 'Los estudiantes no pagan nada. Tu contribución mantiene nuestro certificado universitario cristiano sin matrícula.' : "Students pay nothing. Your contribution keeps our Christian college certificate tuition-free today."}</p>
          <p className="text-white/60 text-sm mt-2">{lang === 'es' ? 'Actualmente no somos una organización 501(c)(3). Las contribuciones no son deducibles de impuestos.' : 'We are not currently a 501(c)(3). Contributions are not tax-deductible.'}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        {[
          { icon: BookOpen, title: lang === 'es' ? 'Construir un Curso' : '$500 course creation honorarium', desc: lang === 'es' ? 'Honorario para el instructor que crea un curso reutilizable.' : 'Funds readings, assignments, and initial capstone design for a reusable course.' },
          { icon: Users, title: lang === 'es' ? 'Facilitar un Curso' : '$500 course facilitation honorarium', desc: lang === 'es' ? 'Honorario para el instructor que facilita un curso y revisa capstones.' : 'Compensates the instructor who reviews capstones and offers weekly feedback.' },
          { icon: DollarSign, title: lang === 'es' ? 'Mantener el Acceso Abierto' : 'Platform and library growth', desc: lang === 'es' ? 'Apoya traducciones y crecimiento de la biblioteca digital.' : 'Supports translations, technology upkeep, and digital resources students use at no cost.' },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-start gap-4">
              <item.icon className="w-6 h-6 text-[#1e3a5f] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-2">{lang === 'es' ? 'Cómo Contribuir' : 'How to Contribute'}</h3>
            <p className="text-slate-600 text-sm mb-4">{lang === 'es' ? 'Recibimos contribuciones directamente. Contáctanos para discutir una contribución única o recurrente.' : 'We receive contributions directly. Reach out to discuss a one-time or recurring contribution.'}</p>
            <a href="mailto:admin@waypoint.institute">
              <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                <Mail className="w-4 h-4 mr-2" />
                {lang === 'es' ? 'Enviar Correo para Contribuir' : 'Email to Contribute'}
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}