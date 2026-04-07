import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Mail, BookOpen, Edit2, ArrowLeft, ExternalLink } from "lucide-react";

export default function FacultyProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetEmail = urlParams.get('email');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['facultyProfile', targetEmail],
    queryFn: () => base44.entities.InstructorProfile.filter({ instructor_email: targetEmail }),
    enabled: !!targetEmail
  });

  const profile = profiles[0];

  const canEdit = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.email === targetEmail
  );

  const coursesByCategory = (profile?.courses_taught || []).reduce((acc, c) => {
    const cat = c.category || 'Courses';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c.title);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Faculty profile not found.</p>
          <Link to={createPageUrl('Faculty')} className="text-[#1e3a5f] hover:underline">← Back to Faculty</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to={createPageUrl('Faculty')} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Faculty
          </Link>
          {canEdit && (
            <Link to={createPageUrl(`FacultyProfileEdit?email=${encodeURIComponent(targetEmail)}`)}>
              <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" /> Edit Profile</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-[#1e3a5f] py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.display_name} className="w-32 h-32 rounded-full object-cover ring-4 ring-white/20" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-white text-4xl font-bold">
              {(profile.display_name || '?')[0]}
            </div>
          )}
          <div className="text-white text-center md:text-left">
            <span className="text-xs uppercase tracking-wider text-white/60 mb-2 block">
              {profile.faculty_type === 'core' ? 'Core Faculty' : 'Contributing Faculty'}
            </span>
            <h1 className="text-3xl font-bold mb-1">{profile.display_name}</h1>
            {profile.faculty_type === 'core' && profile.title && (
              <p className="text-white/80 mb-2">{profile.title}</p>
            )}
            {profile.positioning_sentence && (
              <p className="text-white/70 italic">{profile.positioning_sentence}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <a href={`mailto:${profile.instructor_email}`} className="flex items-center gap-1 text-white/70 hover:text-white text-sm">
                <Mail className="w-4 h-4" /> Contact
              </a>
              <Link to={createPageUrl(`Catalog`)} className="flex items-center gap-1 text-white/70 hover:text-white text-sm">
                <BookOpen className="w-4 h-4" /> View Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* OVERVIEW */}
        {profile.overview && (
          <Section label="Overview">
            <p className="text-slate-700 leading-relaxed">{profile.overview}</p>
          </Section>
        )}

        {/* TEACHING */}
        {Object.keys(coursesByCategory).length > 0 && (
          <Section label="Courses Taught">
            {Object.entries(coursesByCategory).map(([category, titles]) => (
              <div key={category} className="mb-4">
                <h4 className="font-medium text-slate-900 mb-2">{category}</h4>
                <ul className="space-y-1">
                  {titles.map((t, i) => (
                    <li key={i} className="text-slate-600 flex items-start gap-2"><span>•</span>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {/* EDUCATION */}
        {profile.education?.length > 0 && (
          <Section label="Education">
            <ul className="space-y-3">
              {profile.education.map((edu, i) => (
                <li key={i}>
                  <p className="font-medium text-slate-900">{edu.degree}{edu.note ? ` (${edu.note})` : null}</p>
                  <p className="text-slate-600">{edu.institution}{edu.year ? `, ${edu.year}` : ''}</p>
                  {edu.dissertation && (
                    <p className="text-slate-500 text-sm mt-1">Dissertation: {edu.dissertation}</p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* BOOKS */}
        {profile.books?.length > 0 && (
          <Section label="Books">
            {profile.books.map((book, i) => (
              <div key={i} className="mb-2">
                <p className="font-medium text-slate-900">{book.title}</p>
                {book.note && <p className="text-slate-500 text-sm">{book.note}</p>}
              </div>
            ))}
          </Section>
        )}

        {/* LECTURES */}
        {profile.lectures?.length > 0 && (
          <Section label="Lectures & Media">
            {profile.lectures.map((lecture, i) => (
              <div key={i} className="mb-3">
                <p className="font-medium text-slate-900">{lecture.title}</p>
                {lecture.venue && <p className="text-slate-500 text-sm">{lecture.venue}</p>}
                {lecture.url && (
                  <a href={lecture.url} target="_blank" rel="noopener noreferrer" className="text-[#1e3a5f] text-sm flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> View
                  </a>
                )}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{label}</h2>
      {children}
    </div>
  );
}