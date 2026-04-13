import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import WeekFormDialog from '@/components/admin/WeekFormDialog';

export default function AdminCourseWeeks() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editWeek, setEditWeek] = useState(null);

  const load = async () => {
    const [courses, courseWeeks] = await Promise.all([
      base44.entities.Course.filter({ id: courseId }),
      base44.entities.Week.filter({ course_id: courseId }),
    ]);
    setCourse(courses[0] ?? null);
    setWeeks([...courseWeeks].sort((a, b) => a.week_number - b.week_number));
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const handleDelete = async (week) => {
    if (!confirm(`Delete Week ${week.week_number}?`)) return;
    await base44.entities.Week.delete(week.id);
    load();
  };

  if (user?.role !== 'admin' && user?.role !== 'instructor') return <div className="text-center py-16 text-gray-500">Access denied.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/courses" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {course ? `${course.title_en} — Weeks` : 'Course Weeks'}
          </h1>
        </div>
        <Button onClick={() => { setEditWeek(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Week
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : weeks.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
          <p>No weeks yet. Add the first week!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {weeks.map(week => (
            <Card key={week.id}>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                  {week.week_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{week.title_en || `Week ${week.week_number}`}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{week.overview_en || 'No overview'}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditWeek(week); setDialogOpen(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(week)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WeekFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        week={editWeek}
        courseId={courseId}
        existingWeekNumbers={weeks.map(w => w.week_number)}
        onSaved={load}
      />
    </div>
  );
}