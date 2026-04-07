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
import PublicHeader from '@/components/common/PublicHeader';

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
    mutationFn: async (data) => {
      const application = await base44.entities.Application.create({
        ...data,
        status: 'submitted'
      });

      try {
        await base44.integrations.Core.SendEmail({
          to: 'admin@waypoint.institute',
          subject: `New Application: ${data.full_name}`,
          body: `<h2>New Application Submitted</h2><p><strong>Name:</strong> ${data.full_name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Location:</strong> ${data.city}, ${data.country}</p><p><strong>Faith Journey:</strong> ${data.faith_journey}</p>`
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }

      return application;
    },
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const t = {
    en: {
      title: "Apply to Waypoint Institute",
      subtitle: "Join the 2025 Biblical Formation cohort — tuition-free, self-paced, and designed for serious discipleship.",
      submitted_title: "Application Submitted!",
      submitted_msg: "Thank you for applying. Watch your email for confirmation from admin@waypoint.institute.",
      back_home: "Back to Home",
      submit: "Submit Application",
      submitting: "Submitting..."
    },
    es: {
      title: "Aplicar a Waypoint Institute",
      subtitle: "Únete a la cohorte 2025 — sin matrícula, a tu ritmo.",
      submitted_title: "¡Solicitud Enviada!",
      submitted_msg: "Gracias por aplicar. Revisa tu correo para confirmación.",
      back_home: "Volver al Inicio",
      submit: "Enviar Solicitud",
      submitting: "Enviando..."
    }
  }[lang];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.submitted_title}</h2>
          <p className="text-slate-600 mb-6">{t.submitted_msg}</p>
          <Link to={createPageUrl('Home')}><Button className="bg-[#1e3a5f]">{t.back_home}</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader lang={lang} currentPage="Apply" />

      <div className="pt-24 pb-12 px-4 bg-[#1e3a5f]">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-white/80">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Legal Name *</Label>
                <Input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div>
                <Label>Preferred Name (Optional)</Label>
                <Input value={formData.preferred_name} onChange={e => setFormData({...formData, preferred_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Year of Birth</Label>
                  <Input type="number" value={formData.birth_year} onChange={e => setFormData({...formData, birth_year: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label>Primary Language</Label>
                  <Input value={formData.primary_language} onChange={e => setFormData({...formData, primary_language: e.target.value})} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Your Story</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Education Background</Label>
                <Textarea rows={3} value={formData.education_background} onChange={e => setFormData({...formData, education_background: e.target.value})} placeholder="Briefly describe your previous schooling..." />
              </div>
              <div>
                <Label>Ministry or Work Experience</Label>
                <Textarea rows={3} value={formData.ministry_experience} onChange={e => setFormData({...formData, ministry_experience: e.target.value})} placeholder="Share relevant experience..." />
              </div>
              <div>
                <Label>Your Faith Journey & Goals (300-500 words) *</Label>
                <Textarea rows={6} required value={formData.faith_journey} onChange={e => setFormData({...formData, faith_journey: e.target.value})} placeholder="Tell us about your relationship with Christ and what you hope to gain from Waypoint..." />
              </div>
              <div>
                <Label>Why Waypoint Institute?</Label>
                <Textarea rows={3} value={formData.why_waypoint} onChange={e => setFormData({...formData, why_waypoint: e.target.value})} placeholder="What drew you to apply?" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Technology & Affirmations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { key: 'has_internet', label: 'I have consistent internet access' },
                  { key: 'has_device', label: 'I have a computer or device for coursework' },
                  { key: 'can_join_google_meet', label: 'I can join Google Meet video calls for capstones' },
                  { key: 'affirms_apostles_creed', label: 'I affirm the Apostles\' Creed' },
                  { key: 'affirms_waypoint_ethos', label: 'I affirm Waypoint\'s ethos and mission' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Checkbox
                      checked={formData[key]}
                      onCheckedChange={checked => setFormData({...formData, [key]: checked})}
                    />
                    <Label>{label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8a] h-12 text-base"
            disabled={submitMutation.isPending || !formData.affirms_apostles_creed || !formData.affirms_waypoint_ethos}
          >
            {submitMutation.isPending ? t.submitting : t.submit}
          </Button>
        </form>
      </div>
    </div>
  );
}