import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function PublicHeader({ lang = 'en', currentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const navLinks = [
    { label: lang === 'es' ? 'Programas' : 'Programs', page: `Pathways?lang=${lang}` },
    { label: lang === 'es' ? 'Acerca de' : 'About', page: `About?lang=${lang}` },
    { label: lang === 'es' ? 'Cursos' : 'Courses', page: `Catalog?lang=${lang}` },
    { label: lang === 'es' ? 'Facultad' : 'Faculty', page: `Faculty?lang=${lang}` },
    { label: lang === 'es' ? 'Cómo Funciona' : 'How it works', page: `HowItWorks?lang=${lang}` },
    { label: lang === 'es' ? 'Apoyar' : 'Support', page: `Support?lang=${lang}` },
    { label: 'FAQ', page: `FAQ?lang=${lang}` },
    { label: lang === 'es' ? 'Contacto' : 'Contact', page: `Contact?lang=${lang}` },
  ];

  const dashboardPage = user?.role === 'admin' || user?.user_type === 'admin'
    ? `Admin?lang=${lang}`
    : user?.user_type === 'instructor'
    ? `InstructorDashboard?lang=${lang}`
    : `Dashboard?lang=${lang}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={createPageUrl('Home')}>
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint" className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navLinks.slice(0, 4).map(link => (
              <Link key={link.page} to={createPageUrl(link.page)} className="text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap">
                {link.label}
              </Link>
            ))}
            <Link to={createPageUrl(`Apply?lang=${lang}`)} className="text-sm font-medium text-white bg-[#1e3a5f] px-4 py-2 rounded-lg hover:bg-[#2d5a8a] transition-colors whitespace-nowrap">
              {lang === 'es' ? 'Aplicar' : 'Apply'}
            </Link>
            {user ? (
              <Link to={createPageUrl(dashboardPage)} className="text-sm text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
            ) : (
              <button onClick={() => base44.auth.redirectToLogin()} className="text-sm text-slate-600 hover:text-slate-900">
                Sign In
              </button>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-4 px-4 space-y-3">
          {navLinks.map(link => (
            <Link key={link.page} to={createPageUrl(link.page)} className="block text-sm text-slate-600 hover:text-slate-900 py-1" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link to={createPageUrl(`Apply?lang=${lang}`)} className="block text-sm font-medium text-[#1e3a5f] py-1" onClick={() => setMobileMenuOpen(false)}>
            {lang === 'es' ? 'Aplicar' : 'Apply'}
          </Link>
          {user ? (
            <Link to={createPageUrl(dashboardPage)} className="block text-sm text-slate-600 py-1" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          ) : (
            <button onClick={() => base44.auth.redirectToLogin()} className="block text-sm text-slate-600 py-1">Sign In</button>
          )}
        </div>
      )}
    </nav>
  );
}