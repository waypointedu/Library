import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, LogOut } from "lucide-react";

export default function AccountSettings() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ display_name: '', phone: '', mailing_address: '', city: '', country: '', bio: '' });

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setFormData({
        display_name: u.display_name || '',
        phone: u.phone || '',
        mailing_address: u.mailing_address || '',
        city: u.city || '',
        country: u.country || '',
        bio: u.bio || ''
      });
    }).catch(() => { base44.auth.redirectToLogin(); });
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => { alert(lang === 'es' ? 'Perfil actualizado' : 'Profile updated'); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleLogout = () => { base44.auth.logout(createPageUrl('Home')); };

  const getDashboardUrl = () => {
    if (!user) return createPageUrl('Home');
    if (user.role === 'admin' || user.user_type === 'admin') return createPageUrl(`Admin?lang=${lang}`);
    if (user.user_type === 'instructor') return createPageUrl(`InstructorDashboard?lang=${lang}`);
    return createPageUrl(`Dashboard?lang=${lang}`);
  };

  const t = {
    en: { title: 'Account Settings', back: 'Back to Dashboard', accountInfo: 'Account Information', email: 'Email', fullName: 'Full Name', displayName: 'Display Name', phone: 'Phone Number', address: 'Mailing Address', city: 'City', country: 'Country', bio: 'Bio', save: 'Save Changes', logout: 'Log Out', emailNote: 'Email and full name cannot be changed here' },
    es: { title: 'Configuración de Cuenta', back: 'Volver al Panel', accountInfo: 'Información de Cuenta', email: 'Correo Electrónico', fullName: 'Nombre Completo', displayName: 'Nombre de Usuario', phone: 'Teléfono', address: 'Dirección Postal', city: 'Ciudad', country: 'País', bio: 'Biografía', save: 'Guardar Cambios', logout: 'Cerrar Sesión', emailNote: 'El correo y nombre completo no se pueden cambiar aquí' }
  }[lang];

  if (!user) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to={getDashboardUrl()} className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="w-4 h-4" />{t.back}
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600">
          <LogOut className="w-4 h-4 mr-1" />{t.logout}
        </Button>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.title}</h1>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader><CardTitle className="text-base">{t.accountInfo}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.email}</Label>
                <Input value={user.email} disabled className="bg-slate-50" />
              </div>
              <div>
                <Label>{t.fullName}</Label>
                <Input value={user.full_name || ''} disabled className="bg-slate-50" />
                <p className="text-xs text-slate-400 mt-1">{t.emailNote}</p>
              </div>
              <div>
                <Label>{t.displayName}</Label>
                <Input value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} placeholder={user.full_name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.phone}</Label>
                  <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <Label>{t.country}</Label>
                  <Input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>{t.city}</Label>
                <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div>
                <Label>{t.bio}</Label>
                <Textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
              </div>
              <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]" disabled={updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />{t.save}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}