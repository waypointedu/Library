import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Award, MessageSquare, TrendingUp } from "lucide-react";

export default function QuickStats({ userProfile, userBadges, endorsements, readingSessions }) {
  const stats = [
    { icon: BookOpen, label: "Pages Read", value: userProfile?.total_pages_read || 0, color: "bg-blue-500" },
    { icon: Award, label: "Badges Earned", value: userBadges?.length || 0, color: "bg-purple-500" },
    { icon: MessageSquare, label: "Peer Endorsements", value: endorsements?.length || 0, color: "bg-green-500" },
    { icon: TrendingUp, label: "Reading Hours", value: Math.round((userProfile?.total_reading_minutes || 0) / 60), color: "bg-orange-500" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}