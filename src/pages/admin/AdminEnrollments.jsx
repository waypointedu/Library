import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminEnrollments() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Enrollment.list('-created_date', 200),
      base44.entities.Course.list(),
    ]).then(([enrolls, allCourses]) => {
      setEnrollments(enrolls);
      const map = {};
      allCourses.forEach(c => { map[c.id] = c; });
      setCourses(map);
      setLoading(false);
    });
  }, []);

  if (user?.role !== 'admin') return <div className="text-center py-16 text-gray-500">Access denied.</div>;

  const STATUS_COLORS = { active: 'default', completed: 'secondary', dropped: 'destructive' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Enrollments</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {enrollments.map(e => (
            <Card key={e.id}>
              <CardContent className="py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{e.user_email}</p>
                  <p className="text-xs text-gray-500">{courses[e.course_id]?.title_en ?? e.course_id ?? 'Unknown course'}</p>
                </div>
                <Badge variant={STATUS_COLORS[e.status] ?? 'secondary'}>{e.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}