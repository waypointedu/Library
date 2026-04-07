import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PathwayProgress({ enrollments, courses, progress }) {
  const pathwayCourses = [
    { order: 1, name: "Waypoint Introduction Seminar", credits: 1, weeks: 2 },
    { order: 2, name: "Hermeneutics", credits: 4, weeks: 16 },
    { order: 3, name: "Old Testament: Torah, Prophets, Writings", credits: 4, weeks: 16 },
    { order: 4, name: "New Testament: Gospels & Acts", credits: 4, weeks: 16 },
    { order: 5, name: "New Testament: Epistles & Revelation", credits: 4, weeks: 16 },
    { order: 6, name: "Biblical Principles of Culture", credits: 4, weeks: 16 },
    { order: 7, name: "Biblical Spiritual Practices", credits: 4, weeks: 16 },
    { order: 8, name: "Apologetics Seminar Series", credits: 1, weeks: 8 }
  ];

  const enrolledCourseIds = (enrollments || []).filter(e => e.status !== 'dropped').map(e => e.course_id);

  const isInProgram = pathwayCourses.some(pc => {
    const course = (courses || []).find(c => c.title_en === pc.name);
    return course && enrolledCourseIds.includes(course.id);
  });

  const getCourseStatus = (courseName) => {
    const course = (courses || []).find(c => c.title_en === courseName);
    if (!course) return 'locked';
    const isEnrolled = enrolledCourseIds.includes(course.id);
    if (!isEnrolled) return 'available';
    const courseProgress = (progress || []).find(p => p.course_id === course.id);
    if (courseProgress?.completion_percentage === 100) return 'completed';
    if (courseProgress) return 'in-progress';
    return 'enrolled';
  };

  const totalCredits = pathwayCourses.reduce((sum, c) => sum + c.credits, 0);
  const completedCredits = pathwayCourses.reduce((sum, c) => {
    const status = getCourseStatus(c.name);
    return sum + (status === 'completed' ? c.credits : 0);
  }, 0);

  const overallProgress = (completedCredits / totalCredits) * 100;

  if (!isInProgram) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Biblical Formation Certificate</CardTitle>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{completedCredits} of {totalCredits} credits</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pathwayCourses.map((pathwayCourse, index) => {
            const course = (courses || []).find(c => c.title_en === pathwayCourse.name);
            const status = getCourseStatus(pathwayCourse.name);
            const courseProgress = course ? (progress || []).find(p => p.course_id === course.id) : null;

            return (
              <div key={index} className="flex items-center gap-3 py-1">
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : status === 'in-progress' || status === 'enrolled' ? (
                  <Circle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                ) : status === 'available' ? (
                  <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-200 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{pathwayCourse.name}</p>
                  <p className="text-xs text-slate-400">{pathwayCourse.credits} cr</p>
                </div>
                {courseProgress && (
                  <span className="text-xs text-blue-600 font-medium">{Math.round(courseProgress.completion_percentage || 0)}%</span>
                )}
                {status === 'available' && course && (
                  <Link to={createPageUrl(`Course?id=${course.id}`)} className="text-xs text-[#1e3a5f] hover:underline whitespace-nowrap">
                    Enroll →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}