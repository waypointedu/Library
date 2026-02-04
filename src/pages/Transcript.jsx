import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Download, ArrowLeft, Award, CheckCircle2, Clock } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Transcript() {
  const urlParams = new URLSearchParams(window.location.search);
  const userEmail = urlParams.get('email');
  const [lang, setLang] = useState(urlParams.get('lang') || 'en');
  const [currentUser, setCurrentUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const transcriptRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const targetEmail = userEmail || currentUser?.email;

  const { data: user } = useQuery({
    queryKey: ['user', targetEmail],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: targetEmail });
      return users[0];
    },
    enabled: !!targetEmail
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', targetEmail],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: targetEmail }),
    enabled: !!targetEmail
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['progress', targetEmail],
    queryFn: () => base44.entities.Progress.filter({ user_email: targetEmail }),
    enabled: !!targetEmail
  });

  const { data: allQuizAttempts = [] } = useQuery({
    queryKey: ['quizAttempts', targetEmail],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_email: targetEmail }),
    enabled: !!targetEmail
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
    const courseProgress = allProgress.filter(p => p.course_id === e.course_id);
    const completedLessons = courseProgress.filter(p => p.completed).length;
    const courseQuizzes = allQuizAttempts.filter(qa => qa.course_id === e.course_id && qa.passed);
    
    return {
      ...course,
      enrollment: e,
      completedLessons,
      passedQuizzes: courseQuizzes.length,
      credits: course?.credits || 0
    };
  }).filter(c => c.id);

  const completedCourses = enrolledCourses.filter(c => c.enrollment.status === 'completed');
  const totalCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalLessonsCompleted = allProgress.filter(p => p.completed).length;
  const totalQuizzesPassed = allQuizAttempts.filter(qa => qa.passed).length;

  const downloadPDF = async () => {
    if (!transcriptRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(transcriptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`waypoint-transcript-${user?.email || 'student'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const text = {
    en: {
      title: "Academic Transcript",
      download: "Download PDF",
      studentInfo: "Student Information",
      name: "Name",
      email: "Email",
      enrollmentDate: "First Enrollment",
      summary: "Academic Summary",
      coursesCompleted: "Courses Completed",
      totalCredits: "Total Credits Earned",
      lessonsCompleted: "Lessons Completed",
      quizzesPassed: "Quizzes Passed",
      courseHistory: "Course History",
      course: "Course",
      status: "Status",
      completed: "Completed",
      inProgress: "In Progress",
      completionDate: "Completion Date",
      credits: "Credits",
      lessons: "Lessons",
      quizzes: "Quizzes",
      officialRecord: "This is an official academic record from Waypoint Institute.",
      generatedOn: "Generated on",
      programProgress: "Program Progress",
      program: "Program",
      coursesRemaining: "Courses Remaining",
      pathwayCompleted: "Pathway Completed"
    },
    es: {
      title: "Expediente Académico",
      download: "Descargar PDF",
      studentInfo: "Información del Estudiante",
      name: "Nombre",
      email: "Correo",
      enrollmentDate: "Primera Inscripción",
      summary: "Resumen Académico",
      coursesCompleted: "Cursos Completados",
      totalCredits: "Créditos Totales",
      lessonsCompleted: "Lecciones Completadas",
      quizzesPassed: "Quizzes Aprobados",
      courseHistory: "Historial de Cursos",
      course: "Curso",
      status: "Estado",
      completed: "Completado",
      inProgress: "En Progreso",
      completionDate: "Fecha de Finalización",
      credits: "Créditos",
      lessons: "Lecciones",
      quizzes: "Quizzes",
      officialRecord: "Este es un registro académico oficial del Instituto Waypoint.",
      generatedOn: "Generado el",
      programProgress: "Progreso del Programa",
      program: "Programa",
      coursesRemaining: "Cursos Restantes",
      pathwayCompleted: "Programa Completado"
    }
  };

  const t = text[lang];

  if (!currentUser || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl(`Dashboard?lang=${lang}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" />
            {lang === 'es' ? 'Volver' : 'Back'}
          </Link>
          <Button onClick={downloadPDF} disabled={isGenerating} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? '...' : t.download}
          </Button>
        </div>

        <div ref={transcriptRef} className="bg-white rounded-lg shadow-lg p-12 border-4 border-[#1e3a5f]">
          {/* Header */}
          <div className="text-center border-b-2 border-[#c4933f] pb-6 mb-8">
            <div className="flex justify-center mb-4">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" alt="Waypoint Institute" className="h-24" />
            </div>
            <h1 className="text-4xl font-light text-slate-900 mb-2">Waypoint Institute</h1>
            <h2 className="text-2xl text-[#c4933f] font-serif italic">Academic Transcript</h2>
            <p className="text-sm text-slate-500 mt-2">
              {t.generatedOn}: {new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Student Info */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1e3a5f]" />
                {t.studentInfo}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">{t.name}</div>
                  <div className="font-medium">{user.full_name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">{t.email}</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">{t.enrollmentDate}</div>
                  <div className="font-medium">
                    {enrollments[0]?.enrolled_date ? new Date(enrollments[0].enrolled_date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card className="mb-8 bg-gradient-to-br from-[#1e3a5f]/5 to-[#c4933f]/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{t.summary}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1e3a5f]">{completedCourses.length}</div>
                  <div className="text-sm text-slate-600">{t.coursesCompleted}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c4933f]">{totalCredits}</div>
                  <div className="text-sm text-slate-600">{t.totalCredits}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1e3a5f]">{totalLessonsCompleted}</div>
                  <div className="text-sm text-slate-600">{t.lessonsCompleted}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c4933f]">{totalQuizzesPassed}</div>
                  <div className="text-sm text-slate-600">{t.quizzesPassed}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Progress */}
          {pathwayEnrollments.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t.programProgress}</h3>
                {pathwayEnrollments.map(pe => {
                  const pathway = allPathways.find(p => p.id === pe.pathway_id);
                  if (!pathway) return null;
                  
                  const requiredCourseIds = pathway.course_ids || [];
                  const completedCourseIds = completedCourses.map(c => c.id);
                  const completedRequired = requiredCourseIds.filter(id => completedCourseIds.includes(id));
                  const remaining = requiredCourseIds.length - completedRequired.length;
                  const isComplete = remaining === 0;
                  
                  return (
                    <div key={pe.id} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{pathway[`title_${lang}`] || pathway.title_en}</h4>
                          <p className="text-sm text-slate-600">{pathway.type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#1e3a5f]">
                            {completedRequired.length}/{requiredCourseIds.length}
                          </div>
                          <div className="text-xs text-slate-500">{t.coursesCompleted}</div>
                        </div>
                      </div>
                      {isComplete ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 text-sm font-medium">
                          ✓ {t.pathwayCompleted}
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900 text-sm">
                          {remaining} {t.coursesRemaining}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Course History */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1e3a5f]" />
              {t.courseHistory}
            </h3>
            <div className="space-y-4">
              {enrolledCourses.map(course => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{course[`title_${lang}`] || course.title_en}</h4>
                        <div className="text-sm text-slate-500 mt-1">
                          {course.enrollment.status === 'completed' ? (
                            <span className="text-green-600 font-medium">✓ {t.completed}</span>
                          ) : (
                            <span className="text-blue-600">{t.inProgress}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#1e3a5f]">{course.credits} {t.credits}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t">
                      <div>
                        <Clock className="w-4 h-4 inline text-slate-400 mr-1" />
                        {course.completedLessons} {t.lessons}
                      </div>
                      <div>
                        <CheckCircle2 className="w-4 h-4 inline text-slate-400 mr-1" />
                        {course.passedQuizzes} {t.quizzes}
                      </div>
                      {course.enrollment.completed_date && (
                        <div className="text-right text-slate-600">
                          {new Date(course.enrollment.completed_date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-slate-200 pt-6 text-center text-sm text-slate-500">
            <p className="italic">{t.officialRecord}</p>
            <p className="mt-2">© {new Date().getFullYear()} Waypoint Institute</p>
          </div>
        </div>
      </div>
    </div>
  );
}