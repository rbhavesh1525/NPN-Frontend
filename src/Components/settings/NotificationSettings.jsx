import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from 'lucide-react';

const notificationOptions = [
  { id: 'weekly_summary', label: 'Weekly Summary', description: 'Receive a weekly report of platform activity.' },
  { id: 'campaign_alerts', label: 'Campaign Alerts', description: 'Get notified when a message campaign is completed.' },
  { id: 'upload_notifications', label: 'Upload Notifications', description: 'Receive an email when your data uploads are processed.' },
];

export default function NotificationSettings({ preferences, onUpdate, isUpdating }) {
  const [currentPreferences, setCurrentPreferences] = useState(preferences || {});

  const handleToggle = (id) => {
    setCurrentPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSave = () => {
    onUpdate({ notification_preferences: currentPreferences });
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
        <CardDescription>Manage your email notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationOptions.map(option => (
          <div key={option.id} className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg">
            <div>
              <Label htmlFor={option.id} className="font-medium">{option.label}</Label>
              <p className="text-sm text-gray-500">{option.description}</p>
            </div>
            <Switch
              id={option.id}
              checked={currentPreferences[option.id] || false}
              onCheckedChange={() => handleToggle(option.id)}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
}