import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, BookOpen, MessageSquare, FileText, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WeekContent from '@/components/course/WeekContent';

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [activeWeek, setActiveWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.filter({ id: courseId }),
      base44.entities.Week.filter({ course_id: courseId }),
      user ? base44.entities.Enrollment.filter({ user_email: user.email, course_id: courseId }) : Promise.resolve([]),
    ]).then(([courses, courseWeeks, enrolls]) => {
      const c = courses[0] ?? null;
      const sorted = [...courseWeeks].sort((a, b) => a.week_number - b.week_number);
      setCourse(c);
      setWeeks(sorted);
      setEnrollment(enrolls[0] ?? null);
      setActiveWeek(sorted[0] ?? null);
      setLoading(false);
    });
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user || enrolling) return;
    setEnrolling(true);
    const newEnroll = await base44.entities.Enrollment.create({
      course_id: courseId,
      user_email: user.email,
      status: 'active',
      enrolled_date: new Date().toISOString(),
    });
    setEnrollment(newEnroll);
    setEnrolling(false);
  };

  const handleDrop = async () => {
    if (!enrollment) return;
    await base44.entities.Enrollment.update(enrollment.id, { status: 'dropped' });
    setEnrollment({ ...enrollment, status: 'dropped' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (!course) return (
    <div className="text-center py-16 text-gray-400">
      <p>Course not found.</p>
      <Link to="/courses" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Back to courses</Link>
    </div>
  );

  const isEnrolled = enrollment?.status === 'active';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </Link>

      {/* Course header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {course.cover_image_url && (
          <img src={course.cover_image_url} alt="" className="w-full h-48 object-cover rounded-lg mb-4" />
        )}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{course.title_en}</h1>
            <p className="text-gray-600 mt-2">{course.description_en}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {course.primary_subject_area && <Badge variant="secondary">{course.primary_subject_area.replace(/_/g, ' ')}</Badge>}
              {course.duration_weeks && <Badge variant="outline">{course.duration_weeks} weeks</Badge>}
              {course.credits && <Badge variant="outline">{course.credits} credits</Badge>}
            </div>
          </div>
          <div className="flex-shrink-0">
            {isEnrolled ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Enrolled
                </span>
                <Button variant="outline" size="sm" onClick={handleDrop}>Drop</Button>
              </div>
            ) : (
              <Button onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Course content */}
      {(isEnrolled || user?.role === 'admin' || user?.role === 'instructor') && weeks.length > 0 ? (
        <div className="grid md:grid-cols-4 gap-6">
          {/* Week sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Course Weeks</h3>
              </div>
              <nav className="py-2">
                {weeks.map(week => (
                  <button
                    key={week.id}
                    onClick={() => setActiveWeek(week)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                      activeWeek?.id === week.id
                        ? 'bg-slate-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">Week {week.week_number}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Week content */}
          <div className="md:col-span-3">
            {activeWeek && <WeekContent week={activeWeek} user={user} courseId={courseId} />}
          </div>
        </div>
      ) : !isEnrolled ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Enroll to access course content</h3>
          <p className="text-gray-400 text-sm mb-4">Join this course to view lessons, discussions, and assignments.</p>
          <Button onClick={handleEnroll} disabled={enrolling}>
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </Button>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No content available yet.</p>
        </div>
      )}
    </div>
  );
}