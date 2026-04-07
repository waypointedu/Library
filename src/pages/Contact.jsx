import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";
import PublicHeader from '@/components/common/PublicHeader';

export default function Contact() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader lang={lang} currentPage="Contact" />

      <div className="pt-24 pb-12 px-4 bg-[#1e3a5f]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{lang === 'es' ? 'Contactar a Waypoint Institute' : 'Contact Waypoint Institute'}</h1>
          <p className="text-white/80">{lang === 'es' ? '¿Tienes preguntas o necesitas ayuda? Estamos aquí para ayudar.' : "Have questions or need assistance? We're here to help."}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-[#1e3a5f] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{lang === 'es' ? 'Envíanos un Correo' : 'Email Us'}</h3>
                <p className="text-slate-600 text-sm mb-3">{lang === 'es' ? 'Para admisiones, soporte técnico o consultas generales:' : 'For admissions, technical support, or general inquiries:'}</p>
                <code className="text-[#1e3a5f] font-medium">admin@waypoint.institute</code>
                <div className="mt-3">
                  <a href="mailto:admin@waypoint.institute">
                    <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                      <Mail className="w-4 h-4 mr-2" />
                      {lang === 'es' ? 'Enviar Correo' : 'Send Email'}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <MessageCircle className="w-6 h-6 text-[#1e3a5f] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{lang === 'es' ? 'Soporte Estudiantil' : 'Student Support'}</h3>
                <p className="text-slate-600 text-sm mb-3">{lang === 'es' ? 'Los estudiantes actuales pueden contactarnos para:' : 'Current students can reach out for:'}</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {(lang === 'es' ? [
                    "Dificultades técnicas con la plataforma",
                    "Preguntas sobre contenido del curso o tareas",
                    "Programación y preparación de capstone",
                    "Solicitudes de adaptación"
                  ] : [
                    "Technical difficulties with the platform",
                    "Questions about course content or assignments",
                    "Capstone scheduling and preparation",
                    "Accommodation requests"
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-[#1e3a5f]">•</span>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-1">{lang === 'es' ? 'Tiempo de Respuesta' : 'Response Time'}</h3>
            <p className="text-slate-600 text-sm">{lang === 'es' ? 'Generalmente respondemos dentro de 24 horas durante los días laborables.' : 'We typically respond within 24 hours during weekdays.'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}