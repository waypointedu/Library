import React from 'react';

export default function LanguageToggle({ currentLang, onToggle }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
      <button
        onClick={() => onToggle('en')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
          currentLang === 'en'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onToggle('es')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
          currentLang === 'es'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        ES
      </button>
    </div>
  );
}