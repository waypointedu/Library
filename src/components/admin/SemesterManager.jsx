import React from 'react';
import AcademicCalendar from './AcademicCalendar';

// SemesterManager delegates to AcademicCalendar
export default function SemesterManager({ lang = 'en' }) {
  return <AcademicCalendar lang={lang} />;
}