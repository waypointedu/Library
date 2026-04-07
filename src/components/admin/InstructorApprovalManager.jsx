import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InstructorApprovalManager() {
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['instructorProfiles'],
    queryFn: () => base44.entities.InstructorProfile.list(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const instructors = users.filter(u => u.role === 'instructor' || u.role === 'admin');
  const pendingInstructors = users.filter(u => u.role === 'user' && profiles.some(p => p.instructor_email === u.email));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-3">Current Instructors ({instructors.length})</h3>
        <div className="space-y-2">
          {instructors.map(u => (
            <Card key={u.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{u.full_name || u.email}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
                <Select value={u.role} onValueChange={role => updateRoleMutation.mutate({ userId: u.id, role })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
          {instructors.length === 0 && <p className="text-sm text-slate-400">No instructors yet.</p>}
        </div>
      </div>

      {pendingInstructors.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-3">Pending Instructor Requests</h3>
          <div className="space-y-2">
            {pendingInstructors.map(u => (
              <Card key={u.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{u.full_name || u.email}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'instructor' })}>Approve</Button>
                    <Button size="sm" variant="outline">Deny</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}