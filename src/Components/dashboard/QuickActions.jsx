import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Users, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";

const actions = [
  {
    title: "Upload Customer Data",
    description: "Import new CSV files with customer information",
    icon: Upload,
    href: createPageUrl("UploadData"),
    color: "blue"
  },
  {
    title: "Run Segmentation",
    description: "Analyze customers and create segments",
    icon: Users, 
    href: createPageUrl("SegmentationResults"),
    color: "green"
  },
  {
    title: "Generate Messages",
    description: "Create targeted messages for segments",
    icon: MessageSquare,
    href: createPageUrl("MessageGeneration"),
    color: "purple"
  }
];

export default function QuickActions() {
  const colorClasses = {
    blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
    green: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700",
    purple: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => (
          <Link key={action.title} to={action.href}>
            <div className={`p-4 rounded-lg border transition-all duration-200 ${colorClasses[action.color]} dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <action.icon className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm opacity-70">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-50" />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}