import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, MessageSquare, FileText } from "lucide-react";

export default function WeeklyStudyPlan({ enrollments, courses, weeks }) {
  if (!enrollments || enrollments.length === 0) return null;

  const getCurrentWeekTasks = () => {
    const tasks = [];

    enrollments.forEach(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      if (!course) return;

      const courseWeeks = weeks.filter(w => w.course_id === course.id).sort((a, b) => a.week_number - b.week_number);
      const currentWeek = courseWeeks[0];

      if (currentWeek) {
        const weekLinkUrl = `Week?id=${currentWeek.id}&lang=en`;

        tasks.push({
          type: 'reading',
          course: course.title_en,
          title: currentWeek.title_en,
          description: `Week ${currentWeek.week_number} reading`,
          icon: BookOpen,
          link: createPageUrl(weekLinkUrl)
        });

        if (currentWeek.has_discussion) {
          tasks.push({
            type: 'discussion',
            course: course.title_en,
            title: 'Discussion forum',
            description: `${course.title_en} - Week ${currentWeek.week_number} discussion`,
            icon: MessageSquare,
            link: createPageUrl(`CourseForum?courseId=${course.id}&lang=en`)
          });
        }

        if (currentWeek.has_written_assignment) {
          tasks.push({
            type: 'assignment',
            course: course.title_en,
            title: 'Written assignment',
            description: `Week ${currentWeek.week_number} submission`,
            icon: FileText,
            link: createPageUrl(weekLinkUrl)
          });
        }
      }
    });

    return tasks.slice(0, 5);
  };

  const tasks = getCurrentWeekTasks();
  if (tasks.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">This Week's Study Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const Icon = task.icon;
            return (
              <Link key={index} to={task.link} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#1e3a5f]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.course}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}