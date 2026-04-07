import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Edit, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import CourseFormDialog from '@/components/admin/CourseFormDialog';

export default function AdminCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const load = () => {
    base44.entities.Course.list('-created_date', 100).then(data => {
      setCourses(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  if (user?.role !== 'admin') return <div className="text-center py-16 text-gray-500">Access denied.</div>;

  const STATUS_COLORS = { draft: 'secondary', published: 'default', archived: 'destructive' };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
        </div>
        <Button onClick={() => { setEditCourse(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <Card key={course.id}>
              <CardContent className="py-4 flex items-center gap-4">
                <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 truncate">{course.title_en}</span>
                    <Badge variant={STATUS_COLORS[course.status] ?? 'secondary'}>{course.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{course.description_en}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/admin/courses/${course.id}/weeks`}>
                    <Button size="sm" variant="outline">Weeks</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => { setEditCourse(course); setDialogOpen(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CourseFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        course={editCourse}
        onSaved={load}
      />
    </div>
  );
}