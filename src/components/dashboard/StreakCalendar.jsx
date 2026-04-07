import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

export default function StreakCalendar({ userProfile, readingSessions }) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const hasReadingOnDay = (day) => {
    return (readingSessions || []).some(session =>
      session.qualified_as_read && isSameDay(new Date(session.session_date), day)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Reading Streak
          <span className="text-2xl font-bold text-orange-500">{userProfile?.reading_streak_days || 0}</span>
          <span className="text-sm font-normal text-slate-500">days</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs text-slate-400 font-medium">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const hasReading = hasReadingOnDay(day);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = day.getMonth() === today.getMonth();

            return (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-xs rounded ${
                  hasReading ? 'bg-orange-400 text-white font-medium' :
                  isToday ? 'bg-slate-900 text-white' :
                  isCurrentMonth ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-3">
          <span>Current: {userProfile?.reading_streak_days || 0} days</span>
          <span>Best: {userProfile?.longest_reading_streak || 0} days</span>
        </div>
      </CardContent>
    </Card>
  );
}