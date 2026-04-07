import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PublicHeader from '@/components/common/PublicHeader';

export default function Pathways() {
  const urlParams = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader lang={lang} currentPage="Pathways" />

      <div className="pt-24 pb-12 px-4 bg-[#1e3a5f]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Certificate in Biblical Formation</h1>
          <p className="text-white/80">The Biblical Formation certificate is our launch-year, college-level credential.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Program Overview */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Program overview</h2>
          <p className="text-slate-700 mb-4">Begin with a two-week introduction seminar covering tools, policies, and study rhythms. Courses run 8 or 16 weeks with shared checkpoints; readings and assignments are self-paced between those checkpoints.</p>
          <p className="text-slate-700">After completing the Biblical Formation core, you remain connected to peers while awaiting the launch of associate-level pathways and the accompanying research seminar.</p>
        </section>

        {/* Year One */}
        <section className="bg-slate-50 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-[#1e3a5f] text-white">Year One</Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Certificate in Biblical Formation</h2>
          <p className="text-slate-600 mb-6">Seven 16-week courses (4 cr each), plus a two-week introduction seminar (1 cr) and an integrated apologetics seminar (1 cr). Total 30 credits.</p>
          <div className="space-y-2">
            {[
              { title: "Hermeneutics", detail: "16 weeks • 4 cr" },
              { title: "Old Testament: Torah, Prophets, Writings", detail: "16 weeks • 4 cr" },
              { title: "New Testament: Gospels & Acts", detail: "16 weeks • 4 cr" },
              { title: "New Testament: Epistles & Revelation", detail: "16 weeks • 4 cr" },
              { title: "New Testament Use of the Old Testament", detail: "16 weeks • 4 cr" },
              { title: "Biblical Principles of Culture", detail: "16 weeks • 4 cr" },
              { title: "Biblical Spiritual Practices", detail: "16 weeks • 4 cr" },
              { title: "Waypoint Introduction Seminar", detail: "2 weeks • 1 cr" },
              { title: "Apologetics Seminar Series", detail: "integrated • 1 cr" },
            ].map((course, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                <span className="text-slate-800">{course.title}</span>
                <span className="text-slate-500 text-sm whitespace-nowrap">{course.detail}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 font-semibold">
              <span>Total:</span>
              <span>30 credits</span>
            </div>
          </div>
          <div className="mt-6">
            <Link to={createPageUrl(`Catalog?lang=${lang}`)}>
              <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">Open Course Catalog</Button>
            </Link>
          </div>
        </section>

        {/* Year Two */}
        <section className="bg-slate-50 rounded-xl p-8 opacity-75">
          <Badge variant="outline" className="mb-4">Year Two</Badge>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Associate Pathways (coming soon)</h2>
          <p className="text-slate-600">After year one, associate-level tracks will let you deepen focus areas while staying connected to your peers.</p>
        </section>

        {/* Capstones & Assessment */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Capstones & Assessment</h2>
          <p className="text-slate-700">Each course culminates in a topical capstone conversation. Students record a 30-minute audio or video discussion with one or two peers. Faculty review individual contributions as an oral examination.</p>
        </section>

        {/* Study Rhythm */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Study Rhythm & Capstones</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Guided pace</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Weekly checkpoints and reminders keep everyone aligned</li>
                <li>• Flexible windows for readings, reflections, and assignments</li>
                <li>• Faculty mentors accompany your progress</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Self-Paced Study</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Plan for gentle, sustainable study rhythms each week</li>
                <li>• Google Docs and Sheets host written work</li>
                <li>• Capstone preparation includes peer dialogue and prayer</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Capstone Conversations</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• 30-minute small-group conversations per course</li>
                <li>• Conducted in English or your local language</li>
                <li>• Remediation or one-on-one follow up when needed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="mr-4">
            <Button variant="outline">Browse courses</Button>
          </Link>
          <Link to={createPageUrl(`Apply?lang=${lang}`)}>
            <Button className="bg-[#1e3a5f]">Apply</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}