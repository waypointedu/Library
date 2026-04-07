import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PublicHeader from '@/components/common/PublicHeader';

export default function Faculty() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['facultyProfiles'],
    queryFn: () => base44.entities.InstructorProfile.filter({ is_published: true })
  });

  const allCore = profiles.filter(p => p.faculty_type === 'core');
  const joshFirst = [...allCore].sort((a, b) => {
    if (a.instructor_email.includes('josh')) return -1;
    if (b.instructor_email.includes('josh')) return 1;
    return 0;
  });
  const coreFaculty = joshFirst;
  const contributingFaculty = profiles.filter(p => p.faculty_type === 'contributing');

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader currentPage="Faculty" />

      {/* Hero */}
      <div className="bg-[#1e3a5f] pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Our Faculty</h1>
          <p className="text-white/80">Scholars and pastors committed to rigorous theological formation.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {coreFaculty.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">Core Faculty</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {coreFaculty.map(profile => (
                    <FacultyCard key={profile.id} profile={profile} isCore={true} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">Contributing Faculty</h2>
              {contributingFaculty.length === 0 ? (
                <p className="text-slate-500 italic">To be announced</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contributingFaculty.map(profile => (
                    <FacultyCard key={profile.id} profile={profile} isCore={false} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Teaching Philosophy */}
        <section className="mt-16 bg-slate-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Teaching Philosophy</h2>
          <p className="text-slate-700">
            We believe theological education should be both accessible and rigorous. Our faculty are committed to shepherding students through deep engagement with Scripture, doctrine, and the Christian tradition—all while remaining grounded in the realities of ministry and mission.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Learn with us</h2>
          <p className="text-slate-600 mb-6">Experience world-class theological education from faculty who care deeply about your formation and calling.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl('Apply')}><Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">Apply Now</Button></Link>
            <Link to={createPageUrl('Catalog')}><Button variant="outline">View Courses</Button></Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function FacultyCard({ profile, isCore }) {
  const coursesByCategory = (profile.courses_taught || []).reduce((acc, c) => {
    const cat = c.category || 'Courses';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c.title);
    return acc;
  }, {});

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      {/* Top: photo + name */}
      <div className="flex items-start gap-4 mb-4">
        {profile.photo_url ? (
          <img src={profile.photo_url} alt={profile.display_name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {(profile.display_name || '?')[0]}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-900">{profile.display_name}</h3>
          {isCore && profile.title && (
            <p className="text-slate-500 text-sm">{profile.title}</p>
          )}
        </div>
      </div>

      {/* Courses & Seminars */}
      <div className="space-y-3 mb-4">
        {Object.entries(coursesByCategory).length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Courses</p>
            <ul className="space-y-1">
              {Object.values(coursesByCategory).flat().map((title, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-1"><span>•</span>{title}</li>
              ))}
            </ul>
          </div>
        )}
        {profile.seminars?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Seminars</p>
            <ul className="space-y-1">
              {profile.seminars.map((s, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-1"><span>•</span>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {(!profile.courses_taught?.length && !profile.seminars?.length) && (
          <p className="text-sm text-slate-400 italic">Courses coming soon</p>
        )}
      </div>

      <Link to={createPageUrl(`FacultyProfile?email=${encodeURIComponent(profile.instructor_email)}`)} className="text-sm text-[#1e3a5f] font-medium hover:underline flex items-center gap-1">
        View Full Profile <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}