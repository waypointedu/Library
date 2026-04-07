import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookOpen, User, Award } from 'lucide-react';

export default function MobileNav({ lang, currentPage }) {
  const navItems = [
    { icon: Home, label: lang === 'es' ? 'Inicio' : 'Home', page: 'Home' },
    { icon: BookOpen, label: lang === 'es' ? 'Cursos' : 'Courses', page: 'Catalog' },
    { icon: Award, label: lang === 'es' ? 'Logros' : 'Achievements', page: 'Achievements' },
    { icon: User, label: lang === 'es' ? 'Perfil' : 'Profile', page: 'Dashboard' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, page }) => (
          <Link
            key={page}
            to={createPageUrl(`${page}?lang=${lang}`)}
            className={`flex flex-col items-center gap-1 py-2 px-4 ${currentPage === page ? 'text-[#1e3a5f]' : 'text-slate-400'}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}