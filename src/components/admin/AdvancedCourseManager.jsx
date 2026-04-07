import React from 'react';
import CourseManager from './CourseManager';

// AdvancedCourseManager extends CourseManager
export default function AdvancedCourseManager({ lang = 'en', user }) {
  return <CourseManager lang={lang} user={user} />;
}