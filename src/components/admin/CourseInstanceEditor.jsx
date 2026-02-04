import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle } from "lucide-react";

export default function CourseInstanceEditor({ instanceId, courseId, termId, onClose }) {
  const queryClient = useQueryClient();
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [showVolunteerDialog, setShowVolunteerDialog] = useState(false);

  const { data: instance } = useQuery({
    queryKey: ['courseInstance', instanceId],
    queryFn: async () => {
      const instances = await base44.entities.CourseInstance.filter({ id: instanceId });
      return instances[0];
    },
    enabled: !!instanceId
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers', instanceId],
    queryFn: async () => {
      const avail = await base44.entities.InstructorAvailability.filter({ 
        course_instance_id: instanceId,
        volunteered: true
      });
      return avail;
    },
    enabled: !!instanceId
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const addInstructorMutation = useMutation({
    mutationFn: async () => {
      const currentInstructors = instance.instructor_emails || [];
      return base44.entities.CourseInstance.update(instanceId, {
        instructor_emails: [...currentInstructors, selectedInstructor]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseInstance'] });
      setSelectedInstructor('');
      setShowVolunteerDialog(false);
    }
  });

  const removeInstructorMutation = useMutation({
    mutationFn: async (email) => {
      const currentInstructors = instance.instructor_emails || [];
      return base44.entities.CourseInstance.update(instanceId, {
        instructor_emails: currentInstructors.filter(e => e !== email)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseInstance'] });
    }
  });

  const approveVolunteerMutation = useMutation({
    mutationFn: async (volunteerId) => {
      const volunteer = volunteers.find(v => v.id === volunteerId);
      return base44.entities.InstructorAvailability.update(volunteerId, {
        status: 'approved'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    }
  });

  const availableInstructors = users.filter(u => 
    u.user_type === 'instructor' && 
    !selectedInstructor &&
    (u.approved_courses || []).includes(courseId)
  );

  const volunteerUsers = volunteers.map(v => {
    const user = users.find(u => u.email === v.instructor_email);
    return { ...v, instructor: user };
  });

  if (!instance || !course) {
    return <div className="text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{course.title_en} - {instance.cohort_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Instructors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Assigned Instructors</h3>
              <Dialog open={showVolunteerDialog} onOpenChange={setShowVolunteerDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#1e3a5f]">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Instructor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Instructor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>From Volunteers</Label>
                      <div className="mt-2 space-y-2">
                        {volunteerUsers.map(v => (
                          <button
                            key={v.id}
                            onClick={() => {
                              addInstructorMutation.mutate();
                              setSelectedInstructor(v.instructor_email);
                            }}
                            className="w-full text-left p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{v.instructor.full_name}</p>
                                <p className="text-sm text-slate-600">{v.instructor.email}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">
                                {v.status === 'approved' ? 'Approved' : 'Pending'}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <Label>Or select any approved instructor</Label>
                      <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select instructor..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableInstructors.map(instructor => (
                            <SelectItem key={instructor.id} value={instructor.email}>
                              {instructor.full_name} - {instructor.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedInstructor && (
                        <Button 
                          className="w-full mt-3 bg-[#1e3a5f]"
                          onClick={() => addInstructorMutation.mutate()}
                          disabled={addInstructorMutation.isPending}
                        >
                          Add Selected
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {instance.instructor_emails?.length > 0 ? (
                instance.instructor_emails.map(email => (
                  <div key={email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium">{email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeInstructorMutation.mutate(email)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No instructors assigned</p>
              )}
            </div>
          </div>

          {/* Pending Volunteers */}
          {volunteerUsers.some(v => v.status === 'pending') && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-900 mb-3">Pending Volunteers</h3>
              <div className="space-y-2">
                {volunteerUsers.filter(v => v.status === 'pending').map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="font-medium">{v.instructor.full_name}</p>
                      <p className="text-sm text-slate-600">{v.instructor.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => approveVolunteerMutation.mutate(v.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}