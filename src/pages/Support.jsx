import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, BookOpen, Users, Mail } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';

export default function Support() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  const text = {
    en: {
      title: "Support Waypoint Institute",
      subtitle: "Students pay nothing. Your contribution keeps our Christian college certificate tuition-free today and fuels future associate pathways.",
      disclaimer: "We are not currently a 501(c)(3). Contributions are not tax-deductible.",
      course_creation: "Build a Course",
      course_creation_amount: "$500",
      course_creation_desc: "Honorarium for the instructor who authors a reusable course with readings, assignments, and assessments.",
      course_creation_details: ["Funds evergreen curriculum and media", "Includes initial capstone design"],
      course_facilitation: "Run a Course",
      course_facilitation_amount: "$500",
      course_facilitation_desc: "Honorarium for the instructor who facilitates a course run, reviews capstones, and offers pastoral feedback.",
      course_facilitation_details: ["Covers capstone evaluation time", "Keeps office hours and feedback flowing"],
      platform: "Keep Access Open",
      platform_desc: "Supports translation summaries, technology, and digital library growth so students worldwide can study without tuition.",
      platform_details: ["Expands multilingual resources", "Maintains low-cost platforms and security"],
      how_to: "How to Contribute",
      how_to_desc: "We receive contributions directly while we evaluate long-term nonprofit status. Reach out to discuss a one-time or recurring contribution.",
      email_btn: "Email to Contribute"
    },
    es: {
      title: "Apoyar a Waypoint Institute",
      subtitle: "Los estudiantes no pagan nada. Tu contribución mantiene nuestro certificado universitario cristiano sin matrícula hoy y alimenta futuros programas asociados.",
      disclaimer: "Actualmente no somos una organización 501(c)(3). Las contribuciones no son deducibles de impuestos.",
      course_creation: "Construir un Curso",
      course_creation_amount: "$500",
      course_creation_desc: "Honorario para el instructor que crea un curso reutilizable con lecturas, tareas y evaluaciones.",
      course_creation_details: ["Financia currículo y medios perennes", "Incluye diseño inicial de capstone"],
      course_facilitation: "Facilitar un Curso",
      course_facilitation_amount: "$500",
      course_facilitation_desc: "Honorario para el instructor que facilita un curso, revisa capstones y ofrece retroalimentación pastoral.",
      course_facilitation_details: ["Cubre tiempo de evaluación de capstone", "Mantiene horas de oficina y retroalimentación"],
      platform: "Mantener el Acceso Abierto",
      platform_desc: "Apoya resúmenes de traducción, tecnología y crecimiento de la biblioteca digital para que estudiantes de todo el mundo estudien sin matrícula.",
      platform_details: ["Expande recursos multilingües", "Mantiene plataformas de bajo costo y seguridad"],
      how_to: "Cómo Contribuir",
      how_to_desc: "Recibimos contribuciones directamente mientras evaluamos el estado de organización sin fines de lucro a largo plazo. Contáctanos para discutir una contribución única o recurrente.",
      email_btn: "Enviar Correo para Contribuir"
    }
  };

  const t = text[lang];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl(`Home?lang=${lang}`)} className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint" className="h-10" />
          </Link>
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-semibold text-slate-900 mb-6">{t.title}</h1>
          <p className="text-xl text-slate-600 mb-4">{t.subtitle}</p>
          <p className="text-sm text-slate-500">{t.disclaimer}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-[#1e3a5f]/10 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <div className="text-3xl font-bold text-[#1e3a5f] mb-2">{t.course_creation_amount}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t.course_creation}</h3>
              <p className="text-slate-600 mb-4">{t.course_creation_desc}</p>
              <ul className="space-y-2">
                {t.course_creation_details.map((item, i) => (
                  <li key={i} className="text-sm text-slate-500">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-[#c4933f]/10 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-[#c4933f]" />
              </div>
              <div className="text-3xl font-bold text-[#c4933f] mb-2">{t.course_facilitation_amount}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t.course_facilitation}</h3>
              <p className="text-slate-600 mb-4">{t.course_facilitation_desc}</p>
              <ul className="space-y-2">
                {t.course_facilitation_details.map((item, i) => (
                  <li key={i} className="text-sm text-slate-500">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-slate-200">
          <CardContent className="p-8">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <DollarSign className="w-7 h-7 text-green-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">{t.platform}</h3>
            <p className="text-slate-600 mb-4">{t.platform_desc}</p>
            <ul className="space-y-2">
              {t.platform_details.map((item, i) => (
                <li key={i} className="text-sm text-slate-500">• {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mt-16 text-center p-12 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] rounded-2xl">
          <h3 className="text-2xl font-semibold text-white mb-4">{t.how_to}</h3>
          <p className="text-slate-200 mb-6 max-w-2xl mx-auto">{t.how_to_desc}</p>
          <a href="mailto:admin@waypoint.institute">
            <Button size="lg" className="bg-white text-[#1e3a5f] hover:bg-slate-100 gap-2">
              <Mail className="w-4 h-4" />
              {t.email_btn}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}