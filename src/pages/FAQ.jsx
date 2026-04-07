import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PublicHeader from '@/components/common/PublicHeader';

export default function FAQ() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  const faqs = {
    en: [
      { q: "Is Waypoint really tuition-free?", a: "Yes. Contributors cover all costs so students never pay tuition, testing fees, or technology charges." },
      { q: "What languages are courses offered in?", a: "Instruction is in English. Students may record capstone conversations in their native language, and we provide translated summaries when bilingual staff or volunteers are available." },
      { q: "Can I study while working or raising a family?", a: "Absolutely. Courses are self-paced during the week with shared weekly checkpoints, so you study around your real-life responsibilities." },
      { q: "What are capstone conversations?", a: "Each course ends with a 30-minute recorded discussion with 1-2 peers. Faculty evaluate each participant and provide feedback or assign follow-up work if needed." },
      { q: "Do I need to be on camera?", a: "A microphone is required for capstone recordings. A camera is ideal but not mandatory." },
      { q: "Can I transfer credits to another college?", a: "Waypoint is a religious educational ministry exempt from state authorization. Credits are for ministerial education and not intended for transfer to secular degree programs." },
      { q: "What happens after I complete the Biblical Formation certificate?", a: "Associate-level specializations are in development. You'll stay connected to your peers and reconvene for advanced pathways and a research seminar." },
      { q: "How do I apply?", a: "Visit our Apply page to start your application. You'll need to share your faith journey, affirm the Apostles' Creed and Waypoint ethos, and confirm you can join Google Meet capstones." }
    ],
    es: [
      { q: "¿Waypoint es realmente sin matrícula?", a: "Sí. Los colaboradores cubren todos los costos para que los estudiantes nunca paguen matrícula, tarifas de exámenes o cargos tecnológicos." },
      { q: "¿En qué idiomas se ofrecen los cursos?", a: "La instrucción es en inglés. Los estudiantes pueden grabar conversaciones de capstone en su idioma nativo." },
      { q: "¿Puedo estudiar mientras trabajo o cuido a mi familia?", a: "Absolutamente. Los cursos son a tu ritmo durante la semana con puntos de control semanales compartidos." },
      { q: "¿Qué son las conversaciones de capstone?", a: "Cada curso termina con una discusión grabada de 30 minutos con 1-2 compañeros." },
      { q: "¿Necesito estar en cámara?", a: "Se requiere un micrófono para las grabaciones de capstone. Una cámara es ideal pero no obligatoria." },
      { q: "¿Cómo aplico?", a: "Visita nuestra página de Aplicar para comenzar tu solicitud." }
    ]
  };

  const questions = faqs[lang] || faqs.en;

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader lang={lang} currentPage="FAQ" />

      <div className="pt-24 pb-12 px-4 bg-[#1e3a5f]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white">{lang === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <Accordion type="multiple">
          {questions.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-slate-600">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="text-center mt-10">
          <p className="text-slate-600 mb-4">Still have questions?</p>
          <Link to={createPageUrl(`Contact?lang=${lang}`)}>
            <Button className="bg-[#1e3a5f]">Contact Us</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}