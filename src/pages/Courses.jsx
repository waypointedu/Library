import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { BookOpen, Search, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const SUBJECT_LABELS = {
  theology: 'Theology',
  biblical_studies: 'Biblical Studies',
  philosophy: 'Philosophy',
  history: 'History',
  literature: 'Literature',
  culture: 'Culture',
  psychology_cognitive_science: 'Psychology',
  spiritual_formation: 'Spiritual Formation',
  interdisciplinary: 'Interdisciplinary',
};

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.filter({ status: 'published' }),
      user ? base44.entities.Enrollment.filter({ user_email: user.email }) : Promise.resolve([]),
    ]).then(([allCourses, enrolls]) => {
      setCourses(allCourses);
      setEnrollments(enrolls);
      setLoading(false);
    });
  }, [user]);

  const enrolledIds = new Set(enrollments.filter(e => e.status === 'active').map(e => e.course_id || e.course_instance_id));

  const filtered = courses.filter(c =>
    !search ||
    c.title_en?.toLowerCase().includes(search.toLowerCase()) ||
    c.description_en?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
        <p className="text-gray-500 mt-1">Browse and enroll in available courses.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No courses found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => {
            const isEnrolled = enrolledIds.has(course.id);
            return (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  {course.cover_image_url && (
                    <img src={course.cover_image_url} alt="" className="w-full h-36 object-cover rounded-t-xl" />
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">{course.title_en}</CardTitle>
                      {isEnrolled && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-500 line-clamp-3">{course.description_en}</p>
                    <div className="flex flex-wrap gap-1">
                      {course.primary_subject_area && (
                        <Badge variant="secondary" className="text-xs">
                          {SUBJECT_LABELS[course.primary_subject_area] ?? course.primary_subject_area}
                        </Badge>
                      )}
                      {course.duration_weeks && (
                        <Badge variant="outline" className="text-xs">{course.duration_weeks}w</Badge>
                      )}
                      {course.credits && (
                        <Badge variant="outline" className="text-xs">{course.credits} cr</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}