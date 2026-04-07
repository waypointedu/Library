import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, CheckCircle2, Download } from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function Transcript() {
  const urlParams = new URLSearchParams(window.location.search);
  const userEmail = urlParams.get('email');
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [currentUser, setCurrentUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const transcriptRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => { base44.auth.redirectToLogin(); });
  }, []);

  const targetEmail = userEmail || currentUser?.email;

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', targetEmail],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: targetEmail }),
    enabled: !!targetEmail
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: pathwayEnrollments = [] } = useQuery({
    queryKey: ['pathwayEnrollments', targetEmail],
    queryFn: () => base44.entities.PathwayEnrollment.filter({ user_email: targetEmail }),
    enabled: !!targetEmail
  });

  const { data: allPathways = [] } = useQuery({
    queryKey: ['pathways'],
    queryFn: () => base44.entities.Pathway.list()
  });

  const enrolledCourses = enrollments.map(e => {
    const course = allCourses.find(c => c.id === e.course_id);
    return { ...course, enrollment: e, credits: course?.credits || 0, grade: e.status === 'completed' ? 'P' : 'IP' };
  }).filter(c => c.id);

  const completedCourses = enrolledCourses.filter(c => c.enrollment.status === 'completed');
  const totalCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0);

  const downloadPDF = async () => {
    if (!transcriptRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(transcriptRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ratio = pdfWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, canvas.height * ratio);
      pdf.save(`waypoint-transcript-${targetEmail}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const t = {
    en: { title: "Academic Transcript", download: "Download PDF", studentInfo: "Student Information", name: "Name", email: "Email", summary: "Academic Summary", coursesCompleted: "Courses Completed", totalCredits: "Total Credits Earned", courseHistory: "Course History", course: "Course", grade: "Grade", credits: "Credits", status: "Status", completed: "Completed", inProgress: "In Progress", officialRecord: "This is an unofficial academic record from Waypoint Institute.", generatedOn: "Generated on", programProgress: "Program Progress", coursesRemaining: "Courses Remaining", pathwayCompleted: "Pathway Completed" },
    es: { title: "Expediente Académico", download: "Descargar PDF", studentInfo: "Información del Estudiante", name: "Nombre", email: "Correo", summary: "Resumen Académico", coursesCompleted: "Cursos Completados", totalCredits: "Créditos Totales", courseHistory: "Historial de Cursos", course: "Curso", grade: "Calificación", credits: "Créditos", status: "Estado", completed: "Completado", inProgress: "En Progreso", officialRecord: "Este es un registro académico no oficial del Instituto Waypoint.", generatedOn: "Generado el", programProgress: "Progreso del Programa", coursesRemaining: "Cursos Restantes", pathwayCompleted: "Programa Completado" }
  }[lang];

  if (!currentUser) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  const displayUser = currentUser;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="w-4 h-4" />{lang === 'es' ? 'Volver' : 'Back'}
        </button>
        <Button onClick={downloadPDF} disabled={isGenerating} className="bg-[#1e3a5f]">
          <Download className="w-4 h-4 mr-2" />{isGenerating ? '...' : t.download}
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div ref={transcriptRef} className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8 border-b border-slate-200 pb-6">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint Institute" className="h-12 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-slate-900">Waypoint Institute</h1>
            <h2 className="text-lg text-slate-600">Academic Transcript</h2>
            <p className="text-slate-400 text-sm mt-1">{t.generatedOn}: {new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t.studentInfo}</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-slate-500">{t.name}</dt><dd className="font-medium">{displayUser.full_name}</dd></div>
                <div><dt className="text-slate-500">{t.email}</dt><dd className="font-medium">{displayUser.email}</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t.summary}</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-slate-500">{t.coursesCompleted}</dt><dd className="font-medium text-2xl">{completedCourses.length}</dd></div>
                <div><dt className="text-slate-500">{t.totalCredits}</dt><dd className="font-medium text-2xl">{totalCredits}</dd></div>
              </dl>
            </div>
          </div>

          {/* Program Progress */}
          {pathwayEnrollments.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-3">{t.programProgress}</h3>
              <div className="space-y-3">
                {pathwayEnrollments.map(pe => {
                  const pathway = allPathways.find(p => p.id === pe.pathway_id);
                  if (!pathway) return null;
                  const requiredCourseIds = pathway.course_ids || [];
                  const completedCourseIds = completedCourses.map(c => c.id);
                  const completedRequired = requiredCourseIds.filter(id => completedCourseIds.includes(id));
                  const remaining = requiredCourseIds.length - completedRequired.length;
                  const isComplete = remaining === 0;

                  return (
                    <div key={pe.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{pathway[`title_${lang}`] || pathway.title_en}</p>
                        <p className="text-sm text-slate-500">{completedRequired.length}/{requiredCourseIds.length} {t.coursesCompleted}</p>
                      </div>
                      {isComplete ? (
                        <Badge className="bg-green-100 text-green-700">✓ {t.pathwayCompleted}</Badge>
                      ) : (
                        <Badge variant="outline">{remaining} {t.coursesRemaining}</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Course History */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">{t.courseHistory}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium">{t.course}</th>
                  <th className="text-center py-2 text-slate-500 font-medium">{t.credits}</th>
                  <th className="text-center py-2 text-slate-500 font-medium">{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {enrolledCourses.map((course, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 text-slate-800">{course[`title_${lang}`] || course.title_en}</td>
                    <td className="py-3 text-center text-slate-600">{course.credits}</td>
                    <td className="py-3 text-center">
                      {course.enrollment.status === 'completed' ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">✓ {t.completed}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">{t.inProgress}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-slate-400 text-xs">{t.officialRecord}</p>
            <p className="text-slate-400 text-xs">© {new Date().getFullYear()} Waypoint Institute</p>
          </div>
        </div>
      </div>
    </div>
  );
}