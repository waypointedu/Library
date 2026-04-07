import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function SemesterAvailability({ user }) {
  const queryClient = useQueryClient();

  const { data: terms = [] } = useQuery({
    queryKey: ['terms'],
    queryFn: () => base44.entities.AcademicTerm.list('-start_date', 10),
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['instructorAvailability', user?.email],
    queryFn: () => base44.entities.InstructorSemesterAvailability.filter({ instructor_email: user?.email }),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ termId, isAvailable }) => {
      const existing = availability.find(a => a.term_id === termId);
      if (existing) {
        return base44.entities.InstructorSemesterAvailability.update(existing.id, { is_available: isAvailable });
      }
      return base44.entities.InstructorSemesterAvailability.create({
        instructor_email: user.email,
        term_id: termId,
        is_available: isAvailable,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructorAvailability', user?.email] }),
  });

  const getAvailability = (termId) => {
    const record = availability.find(a => a.term_id === termId);
    return record?.is_available ?? true;
  };

  return (
    <Card>
      <CardHeader><CardTitle>Semester Availability</CardTitle></CardHeader>
      <CardContent>
        {terms.length === 0 ? (
          <p className="text-slate-500 text-sm">No upcoming terms found.</p>
        ) : (
          <div className="space-y-4">
            {terms.map(term => (
              <div key={term.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{term.name || `${term.season} ${term.year}`}</p>
                  <p className="text-sm text-slate-500">{term.start_date} – {term.end_date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getAvailability(term.id) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                    {getAvailability(term.id) ? 'Available' : 'Unavailable'}
                  </Badge>
                  <Switch
                    checked={getAvailability(term.id)}
                    onCheckedChange={(checked) => saveMutation.mutate({ termId: term.id, isAvailable: checked })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}