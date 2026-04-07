import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/common/PublicHeader';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Globe } from "lucide-react";

export default function About() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader lang={lang} currentPage="About" />

      {/* Hero Section */}
      <div className="bg-[#1e3a5f] pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Mission, Ethos, and Faith</h1>
          <p className="text-white/80 text-lg">
            Waypoint Institute exists to obey the Great Commission through a tuition-free Christian college education.
          </p>
          <blockquote className="mt-6 border-l-4 border-white/30 pl-4 text-left text-white/70 italic max-w-2xl mx-auto">
            "Go therefore and make disciples of all nations… teaching them to observe all that I have commanded you."
            <footer className="mt-2 text-sm text-white/50">Matthew 28:19–20</footer>
          </blockquote>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-700 mb-4">
            Waypoint Institute forms resilient disciples who know Scripture, love the church, and live as witnesses wherever God places them. We do this through tuition-free college courses, pastoral presence, and capstone conversations that call each student to faithful obedience.
          </p>
          <p className="text-slate-700 mb-6">
            We steward contributor support to offer rigorous, college-level theological learning without barriers so believers in restricted or resource-limited contexts can be trained for gospel ministry.
          </p>
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-3">How Mission Shapes the Year</h3>
            <ul className="space-y-2 text-slate-700">
              <li>• Courses run on a shared calendar with self-paced weeks and clearly defined checkpoints.</li>
              <li>• Capstone dialogues function as oral examinations to affirm mastery and shepherd growth.</li>
              <li>• Future associate pathways will invite students into collaborative research and witness.</li>
            </ul>
          </div>
        </section>

        {/* Tuition Free */}
        <section className="bg-[#1e3a5f] rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Always tuition-free, assessment costs covered</h2>
          <p className="text-white/80">
            No application fees. No tuition bills. No charges for exams or capstones. Supporters underwrite every course so you never enter a credit card number for your college education, to study, demonstrate mastery, or graduate.
          </p>
        </section>

        {/* Ethos */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Ethos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-slate-900 mb-2">Christocentrism</h3>
              <p className="text-slate-600 text-sm">Jesus is the center of history, the lens for Scripture, and the anchor of our hope.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-slate-900 mb-2">Pursuit of Truth</h3>
              <p className="text-slate-600 text-sm italic">"Whatever is true, whatever is honorable… think about these things." (Philippians 4:8)</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-slate-900 mb-2">Radical Accessibility</h3>
              <p className="text-slate-600 text-sm">Removing financial, cultural, and technological barriers so every willing disciple can learn freely.</p>
            </div>
          </div>
        </section>

        {/* Faith Statement */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Mere-Christian Statement of Faith</h2>
          <p className="text-slate-700 mb-6">We confess the Apostles' Creed with the historic church, standing shoulder to shoulder with believers across traditions and centuries.</p>
          <div className="bg-slate-50 rounded-xl p-8">
            <h3 className="font-semibold text-slate-900 mb-4">The Apostles' Creed</h3>
            <p className="text-slate-700 leading-relaxed">
              I believe in God, the Father almighty, maker of heaven and earth. And in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried; he descended to the dead. On the third day he rose again; he ascended into heaven, he is seated at the right hand of the Father, and he will come again to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting. Amen.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Join our community</h2>
          <p className="text-slate-600 mb-6">Step into a learning community that is Christ-centered, truth-seeking, and globally accessible.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl(`Apply?lang=${lang}`)}>
              <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">{lang === 'es' ? 'Aplicar' : 'Apply'}</Button>
            </Link>
            <Link to={createPageUrl(`Support?lang=${lang}`)}>
              <Button variant="outline">{lang === 'es' ? 'Apoyar educación sin matrícula' : 'Support tuition-free college'}</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}