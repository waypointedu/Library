import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Video, ArrowRight } from "lucide-react";
import PublicHeader from '@/components/common/PublicHeader';

export default function HowItWorks() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader lang={lang} currentPage="HowItWorks" />

      <div className="pt-24 pb-12 px-4 bg-[#1e3a5f]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{lang === 'es' ? 'Cómo Funciona Waypoint Institute' : 'How Waypoint Institute Works'}</h1>
          <p className="text-white/80">{lang === 'es' ? 'Un ritmo a tu ritmo con puntos de control compartidos.' : 'A self-paced rhythm with shared checkpoints that keeps disciples supported.'}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {[
          { icon: BookOpen, num: '01', title: lang === 'es' ? 'Comienza Fuerte' : 'Start Strong', desc: lang === 'es' ? 'Únete al Seminario de Introducción de Waypoint. Aprende las herramientas, expectativas y puntos de control compartidos.' : 'Join the Waypoint Introduction Seminar. Learn the tools, expectations, and shared checkpoints that frame the Biblical Formation year.',
            details: lang === 'es' ? ['Orientación sobre políticas, tecnología y ritmos de estudio', 'Presentaciones del profesorado y expectativas comunitarias', 'Guía para organizar el trabajo según responsabilidades locales'] : ['Orientation to policies, technology, and study rhythms', 'Faculty introductions and community expectations', 'Guidance for pacing work around local responsibilities']
          },
          { icon: Users, num: '02', title: lang === 'es' ? 'Estudia a Tu Ritmo' : 'Study at Your Pace', desc: lang === 'es' ? 'Cada curso incluye puntos de control semanales, lecturas y prácticas. Decides cuándo completar el trabajo.' : 'Each 8- or 16-week course includes weekly checkpoints, readings, and practices.',
            details: lang === 'es' ? ['Recordatorios semanales y puntos de control compartidos', 'Retroalimentación del profesorado sobre entregas y reflexiones', 'Reuniones opcionales con compañeros para oración y ánimo'] : ['Weekly reminders and shared checkpoints', 'Faculty feedback on submissions and reflections', 'Optional peer meetups for prayer and encouragement']
          },
          { icon: Video, num: '03', title: lang === 'es' ? 'Graba el Capstone' : 'Record the Capstone', desc: lang === 'es' ? 'Concluye cada curso con una conversación de 30 minutos sobre el tema central.' : 'Wrap up each course with a 30-minute conversation on the central topic.',
            details: lang === 'es' ? ['Las conversaciones pueden ser en inglés o tu idioma nativo', 'El profesorado proporciona retroalimentación individual', 'Tareas correctivas cuando se necesita reforzar el dominio'] : ['Conversations can be in English or your native language', 'Faculty provide individual feedback and next steps', 'Remedial assignments or one-on-one dialogue when mastery needs strengthening']
          }
        ].map((step, i) => (
          <section key={i} className="flex gap-6">
            <div className="w-16 h-16 rounded-xl bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {step.num}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h2>
              <p className="text-slate-600 mb-4">{step.desc}</p>
              <ul className="space-y-2">
                {step.details.map((detail, j) => (
                  <li key={j} className="flex items-start gap-2 text-slate-600 text-sm"><span className="text-[#1e3a5f]">•</span>{detail}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        {/* Technology */}
        <section className="bg-slate-50 rounded-xl p-8">
          <h3 className="font-semibold text-slate-900 mb-4">{lang === 'es' ? 'Lista de Verificación Tecnológica' : 'Technology Checklist'}</h3>
          <ul className="space-y-2">
            {(lang === 'es' ? [
              'Acceso constante a internet para lecturas, discusiones y cargas',
              'Una cuenta de Google (gratuita) para acceder a Docs, Sheets, Slides y Meet',
              'Un dispositivo capaz de unirse a al menos una llamada de Google Meet de 30 minutos por curso',
              'Micrófono (e idealmente cámara) para grabar conversaciones de capstone'
            ] : [
              'Consistent internet access for reading, submitting assignments, and occasional streaming',
              'A Google account (free) to access Docs, Sheets, Slides, and Meet',
              'A device capable of joining at least one 30-minute Google Meet call per course',
              'Microphone (and ideally camera) to record capstone conversations in English or your native language'
            ]).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600 text-sm"><span className="text-green-500">✓</span>{item}</li>
            ))}
          </ul>
        </section>

        <div className="text-center">
          <Link to={createPageUrl(`Apply?lang=${lang}`)}>
            <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {lang === 'es' ? 'Comienza Tu Solicitud' : 'Start Your Application'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}