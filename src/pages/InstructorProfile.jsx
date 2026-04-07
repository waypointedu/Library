import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2, ArrowLeft } from "lucide-react";
import MobileNav from '@/components/common/MobileNav';

export default function InstructorProfile() {
  const [user, setUser] = useState(null);
  const [newEducation, setNewEducation] = useState({ degree: '', field: '', institution: '', year: '' });
  const [newProfDev, setNewProfDev] = useState({ type: 'paper', title: '', details: '', date: '' });
  const [profileData, setProfileData] = useState({ bio: '', education: [], professional_development: [] });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      fetchProfile(u.email);
    }).catch(() => setUser(null));
  }, []);

  const fetchProfile = async (email) => {
    const profiles = await base44.entities.InstructorProfile.filter({ instructor_email: email });
    if (profiles.length > 0) {
      setProfileData({
        ...profiles[0],
        education: profiles[0].education || [],
        professional_development: profiles[0].professional_development || []
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      if (profileData.id) {
        return base44.entities.InstructorProfile.update(profileData.id, profileData);
      } else {
        return base44.entities.InstructorProfile.create({ instructor_email: user.email, ...profileData });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructorProfile'] });
    }
  });

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setProfileData({ ...profileData, education: [...profileData.education, { ...newEducation, year: parseInt(newEducation.year) || new Date().getFullYear() }] });
      setNewEducation({ degree: '', field: '', institution: '', year: '' });
    }
  };

  const removeEducation = (index) => {
    setProfileData({ ...profileData, education: profileData.education.filter((_, i) => i !== index) });
  };

  const addProfDev = () => {
    if (newProfDev.title) {
      setProfileData({ ...profileData, professional_development: [...profileData.professional_development, newProfDev] });
      setNewProfDev({ type: 'paper', title: '', details: '', date: '' });
    }
  };

  const removeProfDev = (index) => {
    setProfileData({ ...profileData, professional_development: profileData.professional_development.filter((_, i) => i !== index) });
  };

  if (!user) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to={createPageUrl('InstructorDashboard')} className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-[#1e3a5f]">
          {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Instructor Profile</h1>

        <Tabs defaultValue="bio">
          <TabsList>
            <TabsTrigger value="bio">Biography</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="profdev">Professional Dev</TabsTrigger>
          </TabsList>

          <TabsContent value="bio" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <label className="text-sm font-medium mb-2 block">Your Biography</label>
                <Textarea
                  rows={8}
                  value={profileData.bio || ''}
                  onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Write a biographical overview for your faculty profile..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="mt-4 space-y-4">
            {profileData.education.map((edu, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{edu.degree} - {edu.institution}</p>
                    <p className="text-sm text-slate-500">{edu.field}, {edu.year}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeEducation(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-slate-900">Add Education</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Degree" value={newEducation.degree} onChange={e => setNewEducation({ ...newEducation, degree: e.target.value })} />
                  <Input placeholder="Field" value={newEducation.field} onChange={e => setNewEducation({ ...newEducation, field: e.target.value })} />
                  <Input placeholder="Institution" value={newEducation.institution} onChange={e => setNewEducation({ ...newEducation, institution: e.target.value })} />
                  <Input placeholder="Year" value={newEducation.year} onChange={e => setNewEducation({ ...newEducation, year: e.target.value })} />
                </div>
                <Button onClick={addEducation} size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profdev" className="mt-4 space-y-4">
            {profileData.professional_development.map((pd, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{pd.title}</p>
                    <p className="text-sm text-slate-500">{pd.type} - {pd.details}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeProfDev(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-slate-900">Add Activity</h3>
                <Input placeholder="Title" value={newProfDev.title} onChange={e => setNewProfDev({ ...newProfDev, title: e.target.value })} />
                <Textarea placeholder="Details" value={newProfDev.details} onChange={e => setNewProfDev({ ...newProfDev, details: e.target.value })} />
                <Button onClick={addProfDev} size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav lang="en" currentPage="InstructorProfile" />
    </div>
  );
}