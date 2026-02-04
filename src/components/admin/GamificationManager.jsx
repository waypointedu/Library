import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2 } from "lucide-react";

const lucideIcons = [
  'Star', 'Trophy', 'Zap', 'Heart', 'Flame', 'Crown', 'Target', 'Rocket',
  'Award', 'Gem', 'Lightbulb', 'Smile', 'Book', 'Code', 'Settings', 'Users'
];

export default function GamificationManager() {
  const [activeTab, setActiveTab] = useState('achievements');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);
  const queryClient = useQueryClient();

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list()
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const entity = activeTab === 'achievements' ? 'Achievement' : 'Badge';
      return base44.entities[entity].create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      setFormData(null);
      setEditingId(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const entity = activeTab === 'achievements' ? 'Achievement' : 'Badge';
      return base44.entities[entity].update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      setFormData(null);
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      const entity = activeTab === 'achievements' ? 'Achievement' : 'Badge';
      return base44.entities[entity].delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab] });
    }
  });

  const handleSubmit = () => {
    if (!formData?.title_en) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData(activeTab === 'achievements' 
      ? { title_en: '', points: 100, trigger_type: 'course_complete', icon: 'Star' }
      : { title_en: '', badge_type: 'course_completion', icon: 'Award', color: 'bronze', xp_reward: 100 }
    );
  };

  const items = activeTab === 'achievements' ? achievements : badges;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button 
          variant={activeTab === 'achievements' ? 'default' : 'outline'}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </Button>
        <Button 
          variant={activeTab === 'badges' ? 'default' : 'outline'}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{activeTab === 'achievements' ? 'Achievements' : 'Badges'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{item.title_en}</p>
                      <p className="text-xs text-slate-500">{item.description_en}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Edit' : 'Create New'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData && (
              <>
                <Input 
                  placeholder="Title"
                  value={formData.title_en}
                  onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                />
                <Textarea 
                  placeholder="Description"
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  className="h-20"
                />
                <Select value={formData.icon || 'Star'} onValueChange={(val) => setFormData({...formData, icon: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lucideIcons.map(icon => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {activeTab === 'achievements' && (
                  <>
                    <Input 
                      type="number"
                      placeholder="Points"
                      value={formData.points || 100}
                      onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    />
                    <Select value={formData.trigger_type} onValueChange={(val) => setFormData({...formData, trigger_type: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Trigger Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_lesson">First Lesson</SelectItem>
                        <SelectItem value="first_quiz">First Quiz</SelectItem>
                        <SelectItem value="course_complete">Course Complete</SelectItem>
                        <SelectItem value="streak_7">7-Day Streak</SelectItem>
                        <SelectItem value="streak_30">30-Day Streak</SelectItem>
                        <SelectItem value="perfect_quiz">Perfect Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                {activeTab === 'badges' && (
                  <>
                    <Select value={formData.badge_type} onValueChange={(val) => setFormData({...formData, badge_type: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Badge Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course_completion">Course Completion</SelectItem>
                        <SelectItem value="reading_streak">Reading Streak</SelectItem>
                        <SelectItem value="peer_endorsement">Peer Endorsement</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={formData.color || 'bronze'} onValueChange={(val) => setFormData({...formData, color: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      type="number"
                      placeholder="XP Reward"
                      value={formData.xp_reward || 100}
                      onChange={(e) => setFormData({...formData, xp_reward: parseInt(e.target.value)})}
                    />
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSubmit} className="flex-1" size="sm">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button onClick={() => {setFormData(null); setEditingId(null);}} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </>
            )}
            {!formData && (
              <Button onClick={handleNew} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}