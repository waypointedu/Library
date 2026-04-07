import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items, lang }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          {item.url ? (
            <Link to={createPageUrl(item.url)} className="hover:text-slate-700">{item.label}</Link>
          ) : (
            <span className="text-slate-700">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}