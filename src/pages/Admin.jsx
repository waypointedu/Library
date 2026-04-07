import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Users, BookOpen, GraduationCap, FileText, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const adminSections = [
  { path: '/admin/courses', label: 'Course Management', description: 'Create, edit, and publish courses and weeks.', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
  { path: '/admin/users', label: 'User Management', description: 'View and manage student and instructor accounts.', icon: Users, color: 'bg-green-50 text-green-600' },
  { path: '/admin/enrollments', label: 'Enrollments', description: 'View and manage course enrollments.', icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
  { path: '/admin/applications', label: 'Applications', description: 'Review and process student applications.', icon: FileText, color: 'bg-orange-50 text-orange-600' },
  { path: '/admin/terms', label: 'Academic Terms', description: 'Manage semester and term schedules.', icon: Settings, color: 'bg-gray-50 text-gray-600' },
  { path: '/admin/faculty', label: 'Faculty Profiles', description: 'Manage instructor profiles and availability.', icon: BarChart3, color: 'bg-red-50 text-red-600' },
];

export default function Admin() {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Access denied. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
        <p className="text-gray-500 mt-1">Manage your LMS from here.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminSections.map(({ path, label, description, icon: Icon, color }) => (
          <Link key={path} to={path}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}