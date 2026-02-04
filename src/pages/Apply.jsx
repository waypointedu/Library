import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import LanguageToggle from '@/components/common/LanguageToggle';
import { base44 } from '@/api/base44Client';

export default function Apply() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    birth_year: new Date().getFullYear() - 25,
    primary_language: 'English',
    education_background: '',
    ministry_experience: '',
    faith_journey: '',
    why_waypoint: '',
    has_internet: true,
    has_device: true,
    can_join_google_meet: true,
    affirms_apostles_creed: false,
    affirms_waypoint_ethos: false
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Application.create({
      ...data,
      status: 'submitted'
    }),
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const text = {
    en: {
      title: "Apply to Waypoint Institute",
      subtitle: "Join the 2025 Biblical Formation cohort — tuition-free, self-paced, and designed for serious discipleship.",
      submitted_title: "Application Submitted!",
      submitted_msg: "Thank you for applying. Watch your email for confirmation and next steps from admin@waypoint.institute within 24 hours.",
      back_home: "Back to Home",
      section1: "Create Your Profile",
      section2: "Share Your Story",
      section3: "Technology & Affirmations",
      full_name: "Full Legal Name",
      preferred_name: "Preferred Name or Pseudonym (Optional)",
      email: "Email Address",
      phone: "Phone Number",
      country: "Country",
      city: "City",
      birth_year: "Year of Birth",
      primary_language: "Primary Language",
      education: "Education Background",
      education_placeholder: "Briefly describe your previous schooling or equivalent experience...",
      ministry: "Ministry or Work Experience",
      ministry_placeholder: "Share relevant ministry, work, or leadership experience...",
      faith_journey: "Your Faith Journey & Goals (300-500 words)",
      faith_placeholder: "Tell us about your relationship with Christ and what you hope to gain from Waypoint...",
      why_waypoint: "Why Waypoint Institute?",
      why_placeholder: "What drew you to apply?",
      tech_access: "I have consistent internet access",
      has_device: "I have a computer or device for coursework",
      google_meet: "I can join Google Meet video calls for capstones",
      affirm_creed: "I affirm the Apostles' Creed",
      affirm_ethos: "I affirm Waypoint's ethos and mission",
      submit: "Submit Application",
      submitting: "Submitting..."
    },
    es: {
      title: "Aplicar a Waypoint Institute",
      subtitle: "Únete a la cohorte de Formación Bíblica 2025: sin matrícula, a tu ritmo y diseñada para un discipulado serio.",
      submitted_title: "¡Solicitud Enviada!",
      submitted_msg: "Gracias por aplicar. Revisa tu correo para confirmación y próximos pasos de admin@waypoint.institute en 24 horas.",
      back_home: "Volver al Inicio",
      section1: "Crea Tu Perfil",
      section2: "Comparte Tu Historia",
      section3: "Tecnología y Afirmaciones",
      full_name: "Nombre Completo Legal",
      preferred_name: "Nombre Preferido o Seudónimo (Opcional)",
      email: "Correo Electrónico",
      phone: "Teléfono",
      country: "País",
      city: "Ciudad",
      birth_year: "Año de Nacimiento",
      primary_language: "Idioma Principal",
      education: "Antecedentes Educativos",
      education_placeholder: "Describe brevemente tu educación previa o experiencia equivalente...",
      ministry: "Experiencia Ministerial o Laboral",
      ministry_placeholder: "Comparte experiencia ministerial, laboral o de liderazgo relevante...",
      faith_journey: "Tu Camino de Fe y Metas (300-500 palabras)",
      faith_placeholder: "Cuéntanos sobre tu relación con Cristo y qué esperas de Waypoint...",
      why_waypoint: "¿Por qué Waypoint Institute?",
      why_placeholder: "¿Qué te atrajo a aplicar?",
      tech_access: "Tengo acceso constante a internet",
      has_device: "Tengo una computadora o dispositivo para el curso",
      google_meet: "Puedo unirme a llamadas de Google Meet para los capstones",
      affirm_creed: "Afirmo el Credo de los Apóstoles",
      affirm_ethos: "Afirmo el ethos y la misión de Waypoint",
      submit: "Enviar Solicitud",
      submitting: "Enviando..."
    }
  };

  const t = text[lang];

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-semibold text-slate-900 mb-4">{t.submitted_title}</h1>
          <p className="text-slate-600 mb-8">{t.submitted_msg}</p>
          <Link to={createPageUrl(`Home?lang=${lang}`)}>
            <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {t.back_home}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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

      {/* Hero */}
      <div className="bg-gradient-to-b from-white to-slate-50 py-12 px-6 mt-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-semibold text-slate-900 mb-4">{t.title}</h1>
          <p className="text-lg text-slate-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1 */}
          <Card>
            <CardHeader>
              <CardTitle>{t.section1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.full_name} *</Label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div>
                <Label>{t.preferred_name}</Label>
                <Input
                  value={formData.preferred_name}
                  onChange={(e) => setFormData({...formData, preferred_name: e.target.value})}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{t.email} *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{t.phone}</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>{t.country}</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{t.city}</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{t.birth_year}</Label>
                  <Input
                    type="number"
                    value={formData.birth_year}
                    onChange={(e) => setFormData({...formData, birth_year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label>{t.primary_language}</Label>
                <Input
                  value={formData.primary_language}
                  onChange={(e) => setFormData({...formData, primary_language: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader>
              <CardTitle>{t.section2}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.education}</Label>
                <Textarea
                  className="h-24"
                  placeholder={t.education_placeholder}
                  value={formData.education_background}
                  onChange={(e) => setFormData({...formData, education_background: e.target.value})}
                />
              </div>
              <div>
                <Label>{t.ministry}</Label>
                <Textarea
                  className="h-24"
                  placeholder={t.ministry_placeholder}
                  value={formData.ministry_experience}
                  onChange={(e) => setFormData({...formData, ministry_experience: e.target.value})}
                />
              </div>
              <div>
                <Label>{t.faith_journey} *</Label>
                <Textarea
                  required
                  className="h-40"
                  placeholder={t.faith_placeholder}
                  value={formData.faith_journey}
                  onChange={(e) => setFormData({...formData, faith_journey: e.target.value})}
                />
              </div>
              <div>
                <Label>{t.why_waypoint}</Label>
                <Textarea
                  className="h-24"
                  placeholder={t.why_placeholder}
                  value={formData.why_waypoint}
                  onChange={(e) => setFormData({...formData, why_waypoint: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader>
              <CardTitle>{t.section3}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.has_internet}
                  onCheckedChange={(checked) => setFormData({...formData, has_internet: checked})}
                />
                <Label>{t.tech_access}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.has_device}
                  onCheckedChange={(checked) => setFormData({...formData, has_device: checked})}
                />
                <Label>{t.has_device}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.can_join_google_meet}
                  onCheckedChange={(checked) => setFormData({...formData, can_join_google_meet: checked})}
                />
                <Label>{t.google_meet}</Label>
              </div>
              <hr className="my-4" />
              <div className="flex items-center gap-2">
                <Checkbox
                  required
                  checked={formData.affirms_apostles_creed}
                  onCheckedChange={(checked) => setFormData({...formData, affirms_apostles_creed: checked})}
                />
                <Label>{t.affirm_creed} *</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  required
                  checked={formData.affirms_waypoint_ethos}
                  onCheckedChange={(checked) => setFormData({...formData, affirms_waypoint_ethos: checked})}
                />
                <Label>{t.affirm_ethos} *</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={submitMutation.isPending}
              className="bg-[#1e3a5f] hover:bg-[#2d5a8a] gap-2"
            >
              {submitMutation.isPending ? t.submitting : t.submit}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}