import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_OPTIONS = ['submitted', 'under_review', 'interview_scheduled', 'accepted', 'waitlisted', 'declined'];
const STATUS_COLORS = {
  submitted: 'secondary', under_review: 'default', interview_scheduled: 'default',
  accepted: 'default', waitlisted: 'secondary', declined: 'destructive'
};

export default function AdminApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    base44.entities.Application.list('-created_date', 200).then(data => {
      setApplications(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await base44.entities.Application.update(id, { status });
    load();
  };

  if (user?.role !== 'admin') return <div className="text-center py-16 text-gray-500">Access denied.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <Card key={app.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{app.full_name}</p>
                    <p className="text-xs text-gray-500">{app.email} · {app.country}</p>
                  </div>
                  <Select value={app.status} onValueChange={v => handleStatusChange(app.id, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded === app.id ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                {expanded === app.id && (
                  <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                    {app.faith_journey && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Faith Journey</p>
                        <p className="text-sm text-gray-700">{app.faith_journey}</p>
                      </div>
                    )}
                    {app.why_waypoint && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Why Waypoint</p>
                        <p className="text-sm text-gray-700">{app.why_waypoint}</p>
                      </div>
                    )}
                    {app.ministry_experience && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase mb-1">Ministry Experience</p>
                        <p className="text-sm text-gray-700">{app.ministry_experience}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}