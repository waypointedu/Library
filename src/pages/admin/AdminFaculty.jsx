import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminFaculty() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [form, setForm] = useState({ instructor_email: '', display_name: '', title: '', faculty_type: 'contributing', overview: '', positioning_sentence: '', is_published: true });
  const [saving, setSaving] = useState(false);

  const load = () => {
    base44.entities.InstructorProfile.list('-created_date', 100).then(data => {
      setProfiles(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openDialog = (profile = null) => {
    setEditProfile(profile);
    setForm(profile ? {
      instructor_email: profile.instructor_email || '',
      display_name: profile.display_name || '',
      title: profile.title || '',
      faculty_type: profile.faculty_type || 'contributing',
      overview: profile.overview || '',
      positioning_sentence: profile.positioning_sentence || '',
      is_published: profile.is_published !== false,
    } : { instructor_email: '', display_name: '', title: '', faculty_type: 'contributing', overview: '', positioning_sentence: '', is_published: true });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editProfile) {
      await base44.entities.InstructorProfile.update(editProfile.id, form);
    } else {
      await base44.entities.InstructorProfile.create(form);
    }
    setSaving(false);
    load();
    setDialogOpen(false);
  };

  if (user?.role !== 'admin') return <div className="text-center py-16 text-gray-500">Access denied.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Faculty Profiles</h1>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-1" /> Add Faculty
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map(p => (
            <Card key={p.id}>
              <CardContent className="py-4 flex items-center gap-4">
                {p.photo_url ? (
                  <img src={p.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                    {p.display_name?.[0] ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{p.display_name}</span>
                    <Badge variant={p.faculty_type === 'core' ? 'default' : 'secondary'}>{p.faculty_type}</Badge>
                    {!p.is_published && <Badge variant="outline">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{p.instructor_email}</p>
                  {p.title && <p className="text-xs text-gray-600 mt-0.5">{p.title}</p>}
                </div>
                <Button size="sm" variant="ghost" onClick={() => openDialog(p)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editProfile ? 'Edit Faculty' : 'Add Faculty'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input className="mt-1" value={form.instructor_email} onChange={e => setForm(f => ({ ...f, instructor_email: e.target.value }))} />
              </div>
              <div>
                <Label>Display Name</Label>
                <Input className="mt-1" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Faculty Type</Label>
                <Select value={form.faculty_type} onValueChange={v => setForm(f => ({ ...f, faculty_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="contributing">Contributing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title (core only)</Label>
                <Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Positioning Sentence</Label>
              <Input className="mt-1" value={form.positioning_sentence} onChange={e => setForm(f => ({ ...f, positioning_sentence: e.target.value }))} />
            </div>
            <div>
              <Label>Overview</Label>
              <Textarea className="mt-1" rows={4} value={form.overview} onChange={e => setForm(f => ({ ...f, overview: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_pub" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded" />
              <Label htmlFor="is_pub">Published (visible on public faculty page)</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}