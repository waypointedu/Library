import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import Admin from '@/pages/Admin';
import AdminCourses from '@/pages/admin/AdminCourses';
import AdminCourseWeeks from '@/pages/admin/AdminCourseWeeks';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminEnrollments from '@/pages/admin/AdminEnrollments';
import AdminApplications from '@/pages/admin/AdminApplications';
import AdminTerms from '@/pages/admin/AdminTerms';
import AdminFaculty from '@/pages/admin/AdminFaculty';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/courses/:courseId/weeks" element={<AdminCourseWeeks />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/enrollments" element={<AdminEnrollments />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/terms" element={<AdminTerms />} />
        <Route path="/admin/faculty" element={<AdminFaculty />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App