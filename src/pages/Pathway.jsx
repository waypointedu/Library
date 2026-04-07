import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, ArrowLeft, CheckCircle2, Download } from 'lucide-react';
import CourseCard from '@/components/courses/CourseCard';
import { jsPDF } from 'jspdf';

export default function Pathway() {
  const urlParams = new URLSearchParams(window.location.search);
  const pathwayId = urlParams.get('id');
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: pathway } = useQuery({
    queryKey: ['pathway', pathwayId],
    queryFn: () => base44.entities.Pathway.filter({ id: pathwayId }),
    select: (data) => data[0],
    enabled: !!pathwayId
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['pathwayCourses', pathway?.course_ids],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.list();
      return pathway.course_ids.map(id => allCourses.find(c => c.id === id)).filter(Boolean);
    },
    enabled: !!pathway?.course_ids
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: pathwayEnrollment } = useQuery({
    queryKey: ['pathwayEnrollment', pathwayId, user?.email],
    queryFn: () => base44.entities.PathwayEnrollment.filter({ pathway_id: pathwayId, user_email: user?.email }),
    select: (data) => data[0],
    enabled: !!user?.email && !!pathwayId
  });

  const downloadCertificate = () => {
    const pdf = new jsPDF({ orientation: 'landscape' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFillColor(30, 58, 95);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(36);
    pdf.text('Certificate of Completion', pageWidth / 2, 60, { align: 'center' });

    pdf.setFontSize(20);
    pdf.text(user.full_name || user.email, pageWidth / 2, 100, { align: 'center' });

    pdf.setFontSize(14);
    pdf.text(`has successfully completed the ${pathway[`title_${lang}`] || pathway.title_en}`, pageWidth / 2, 130, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(`Issued: ${new Date().toLocaleDateString()}`, pageWidth / 2, 160, { align: 'center' });

    pdf.save(`${pathway.title_en}-certificate.pdf`);
  };

  const t = {
    en: { back: 'Back to Pathways', enrolled: 'Enrolled', courses: 'Courses', completed: 'Completed', downloadCert: 'Download Certificate' },
    es: { back: 'Volver a Rutas', enrolled: 'Inscrito', courses: 'Cursos', completed: 'Completado', downloadCert: 'Descargar Certificado' }
  };
  const text = t[lang];

  if (!pathway) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  const completedCourses = enrollments.filter(e => e.status === 'completed' && pathway.course_ids.includes(e.course_id));
  const isCompleted = completedCourses.length === pathway.course_ids.length && pathwayEnrollment;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1e3a5f] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link to={createPageUrl(`Pathways?lang=${lang}`)} className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />{text.back}
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-white/20 text-white border-0">{pathway.type}</Badge>
            {pathwayEnrollment && <Badge className="bg-green-500/80 text-white border-0">{text.enrolled}</Badge>}
            {isCompleted && <Badge className="bg-yellow-500/80 text-white border-0">{text.completed}</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{pathway[`title_${lang}`] || pathway.title_en}</h1>
          <p className="text-white/80 mb-6">{pathway[`description_${lang}`] || pathway.description_en}</p>
          {isCompleted && (
            <Button onClick={downloadCertificate} className="bg-white text-[#1e3a5f] hover:bg-slate-100">
              <Download className="w-4 h-4 mr-2" />{text.downloadCert}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{text.courses} ({completedCourses.length}/{pathway.course_ids.length})</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course, idx) => (
            <CourseCard
              key={course.id}
              course={course}
              lang={lang}
              enrolled={enrollments.some(e => e.course_id === course.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}