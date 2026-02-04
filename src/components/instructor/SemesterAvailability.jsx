import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from "lucide-react";

export default function SemesterAvailability({ user }) {
  const queryClient = useQueryClient();
  const [expandedTerm, setExpandedTerm] = useState(null);

  const { data: terms = [] } = useQuery({
    queryKey: ['academicTerms'],
    queryFn: () => base44.entities.AcademicTerm.list('-start_date')
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['semesterAvailability', user?.email],
    queryFn: () => base44.entities.InstructorSemesterAvailability.filter({ 
      instructor_email: user?.email 
    }),
    enabled: !!user?.email
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: (data) => base44.entities.InstructorSemesterAvailability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesterAvailability'] });
    }
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InstructorSemesterAvailability.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesterAvailability'] });
    }
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id) => base44.entities.InstructorSemesterAvailability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesterAvailability'] });
    }
  });

  const handleAddAvailability = (termId) => {
    createAvailabilityMutation.mutate({
      instructor_email: user.email,
      term_id: termId,
      is_available: true,
      max_courses: 3
    });
    setExpandedTerm(null);
  };

  const handleUpdateMaxCourses = (record, newMax) => {
    updateAvailabilityMutation.mutate({
      id: record.id,
      data: { max_courses: newMax }
    });
  };

  const handleToggleAvailable = (record) => {
    updateAvailabilityMutation.mutate({
      id: record.id,
      data: { is_available: !record.is_available }
    });
  };

  const handleDelete = (id) => {
    deleteAvailabilityMutation.mutate(id);
  };

  const getAvailabilityForTerm = (termId) => {
    return availability.find(a => a.term_id === termId);
  };

  const upcomingTerms = terms.filter(t => t.status === 'upcoming' || t.status === 'active');
  const registeredTerms = upcomingTerms.filter(t => getAvailabilityForTerm(t.id));
  const availableTerms = upcomingTerms.filter(t => !getAvailabilityForTerm(t.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Semester Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Registered Terms */}
          {registeredTerms.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">Registered For</h3>
              <div className="space-y-2">
                {registeredTerms.map(term => {
                  const record = getAvailabilityForTerm(term.id);
                  return (
                    <div key={term.id} className="border rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{term.name}</h4>
                          <p className="text-sm text-slate-600">
                            {new Date(term.start_date).toLocaleDateString()} – {new Date(term.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={record.is_available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                          {record.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-2">
                            Max Courses: {record.max_courses}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={record.max_courses}
                            onChange={(e) => handleUpdateMaxCourses(record, parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={record.is_available ? 'default' : 'outline'}
                            onClick={() => handleToggleAvailable(record)}
                            className={record.is_available ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {record.is_available ? 'Available' : 'Mark Available'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Terms */}
          {availableTerms.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">Available Semesters</h3>
              <div className="space-y-2">
                {availableTerms.map(term => (
                  <div key={term.id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{term.name}</h4>
                        <p className="text-sm text-slate-600">
                          {new Date(term.start_date).toLocaleDateString()} – {new Date(term.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddAvailability(term.id)}
                        className="bg-[#1e3a5f]"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Register
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingTerms.length === 0 && (
            <p className="text-slate-500 text-center py-8">No upcoming semesters available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}