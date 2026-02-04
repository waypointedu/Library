import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function Faculty() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
    }).catch(() => setUser(null));
  }, []);

  const activeFaculty = [
    {
      name: "Josh Snell",
      role: "Academic Director / Biblical Studies Faculty",
      bio: "Josh Snell holds a B.A. in Philosophy and English from Boise State University and an M.Div. from The Southern Baptist Theological Seminary. A non-denominational pastor, he has taught and traveled in Europe and Southeast Asia, bringing a global perspective to Christian theology, philosophy, and the dialogue between worldviews.",
      image: "https://waypointedu.github.io/site/assets/img/snell.jpeg",
      email: "josh@waypoint.institute",
      courses: [
        "Hermeneutics",
        "Old Testament: Torah, Prophets, Writings",
        "New Testament: Gospels & Acts",
        "New Testament: Epistles & Revelation",
        "New Testament Use of the Old Testament",
        "Apologetics Seminar Series (co-faculty)"
      ]
    },
    {
      name: "Michael Barros",
      role: "Operations Director / Religion & Culture Faculty",
      bio: "Michael C. Barros is a scholar of religion and culture and an active researcher in the cognitive science of religion, with training in psychology and theology and a background in classical education. He teaches philosophy at the University of the People and has taught undergraduate theology, philosophy, and literature.",
      image: "https://waypointedu.github.io/site/assets/img/barros.jpeg",
      email: "michael@waypoint.institute",
      courses: [
        "Waypoint Introduction Seminar",
        "Biblical Principles of Culture",
        "Biblical Spiritual Practices",
        "Apologetics Seminar Series (co-faculty)",
        "Associate Research Seminar (coming soon)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" 
              alt="Waypoint Institute" 
              className="h-12" 
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            <Link to={createPageUrl('Pathways')} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              Programs
            </Link>
            <Link to={createPageUrl('About')} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              About
            </Link>
            <Link to={createPageUrl('Catalog')} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              Courses
            </Link>
            <Link to={createPageUrl('Faculty')} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              Faculty
            </Link>
            <Link to={createPageUrl('HowItWorks')} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              How it works
            </Link>
            <Link to={createPageUrl('Support')} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              Support
            </Link>
            <Link to={createPageUrl('FAQ')} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              FAQ
            </Link>
            <Link to={createPageUrl('Contact')} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link to={createPageUrl('Apply')}>
                  <Button size="sm" variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white hidden sm:inline-flex">
                    Apply
                  </Button>
                </Link>
              </>
            ) : (
              <Link to={createPageUrl(user.role === 'admin' || user.user_type === 'admin' ? 'Admin' : user.user_type === 'instructor' ? 'InstructorDashboard' : 'Dashboard')}>
                <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                  My Learning Area
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-32">
        {/* Hero */}
        <div className="mb-12 md:mb-20 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-6 md:mb-8 leading-tight">
            Meet Our <span className="italic text-[#c4933f]">Faculty</span>
          </h1>
          <p className="text-base md:text-lg lg:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Our faculty bring decades of pastoral, missionary, and academic experience to guide students through rigorous theological formation.
          </p>
        </div>

        {/* Active Faculty */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 text-center">Active Faculty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {activeFaculty.map((member, index) => (
              <Card key={index} className="overflow-hidden shadow-xl border-slate-200 hover:shadow-2xl transition-shadow">
                <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center text-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-slate-200 mb-6 shadow-lg ring-4 ring-white">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-base text-[#1e3a5f] font-medium">{member.role}</p>
                </div>
                <CardContent className="p-6 md:p-8">
                  <p className="text-slate-600 leading-relaxed mb-6 text-base md:text-lg text-center">
                    {member.bio}
                  </p>
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-3 text-center">Courses</h4>
                    <ul className="space-y-1">
                      {member.courses.map((course, i) => (
                        <li key={i} className="text-sm text-slate-600 text-center">• {course}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-center">
                    <a 
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contributing Faculty */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 text-center">Contributing Faculty</h2>
          <p className="text-center text-slate-600 mb-8">Additional faculty who design and contribute to our course offerings.</p>
          <p className="text-center text-slate-500 italic">To be announced</p>
        </div>

        {/* Teaching Philosophy */}
        <section className="p-8 md:p-14 bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c4933f]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-semibold mb-5">Our Teaching Philosophy</h2>
            <p className="text-base md:text-lg text-white/95 leading-relaxed">
              We believe theological education should be both accessible and rigorous. Our faculty are committed to shepherding students through deep engagement with Scripture, doctrine, and the Christian tradition—all while remaining grounded in the realities of ministry and mission.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">Learn with us</h2>
          <p className="text-slate-600 mb-8 text-base md:text-lg max-w-2xl mx-auto">
            Experience world-class theological education from faculty who care deeply about your formation and calling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Apply')}>
              <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                Apply Now
              </Button>
            </Link>
            <Link to={createPageUrl('Catalog')}>
              <Button size="lg" variant="outline" className="border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                View Courses
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}