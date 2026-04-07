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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_COLORS = { upcoming: 'secondary', active: 'default', completed: 'outline' };

export default function AdminTerms() {
  const { user } = useAuth();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTerm, setEditTerm] = useState(null);
  const [form, setForm] = useState({ season: 'Spring', year: new Date().getFullYear(), start_date: '', end_date: '', status: 'upcoming' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    base44.entities.AcademicTerm.list('-year', 50).then(data => {
      setTerms(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openDialog = (term = null) => {
    setEditTerm(term);
    setForm(term ? { season: term.season, year: term.year, start_date: term.start_date, end_date: term.end_date, status: term.status } : { season: 'Spring', year: new Date().getFullYear(), start_date: '', end_date: '', status: 'upcoming' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, year: Number(form.year), name: `${form.season} ${form.year}` };
    if (editTerm) {
      await base44.entities.AcademicTerm.update(editTerm.id, data);
    } else {
      await base44.entities.AcademicTerm.create(data);
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
          <h1 className="text-2xl font-bold text-slate-900">Academic Terms</h1>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-1" /> New Term
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {terms.map(term => (
            <Card key={term.id}>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{term.name || `${term.season} ${term.year}`}</span>
                    <Badge variant={STATUS_COLORS[term.status] ?? 'secondary'}>{term.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{term.start_date} — {term.end_date}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openDialog(term)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTerm ? 'Edit Term' : 'New Term'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Season</Label>
                <Select value={form.season} onValueChange={v => setForm(f => ({ ...f, season: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Spring', 'Summer', 'Fall', 'Winter'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Input className="mt-1" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input className="mt-1" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input className="mt-1" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['upcoming', 'active', 'completed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
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