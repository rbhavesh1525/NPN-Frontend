import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Send, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";

const actions = [
  {
    title: "Run Segmentation",
    description: "Analyze customers and create segments",
    icon: Users, 
    href: createPageUrl("SegmentationResults"),
    color: "green"
  },
  {
    title: "Run Campaign",
    description: "Create targeted campaigns for segments",
    icon: Send,
    href: createPageUrl("MessageGeneration"),
    color: "purple"
  }
];

export default function QuickActions() {
  return (
    <Card className="shadow-md border-0 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => (
          <Link key={action.title} to={action.href} className="block">
            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-200">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    action.color === 'green' ? 'bg-green-100 dark:bg-green-900' : 'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    <action.icon className={`w-5 h-5 ${
                      action.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}