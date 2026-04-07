import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list('-created_date', 200).then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  if (user?.role !== 'admin') return <div className="text-center py-16 text-gray-500">Access denied.</div>;

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_COLORS = { admin: 'destructive', instructor: 'default', user: 'secondary' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input className="pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <Card key={u.id}>
              <CardContent className="py-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  {u.full_name?.[0] ?? u.email?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{u.full_name || '(no name)'}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <Badge variant={ROLE_COLORS[u.role] ?? 'secondary'}>{u.role ?? 'user'}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}