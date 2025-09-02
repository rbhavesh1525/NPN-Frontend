
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider'; // FIX: Corrected import path

export default function AppearanceSettings() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Appearance
        </CardTitle>
        <CardDescription>Customize the look and feel of the application.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg">
          <div>
            <p className="font-medium">Interface Theme</p>
            <p className="text-sm text-gray-500">
              Select your preferred theme. Current: {darkMode ? 'Dark' : 'Light'}
            </p>
          </div>
          <Button variant="outline" onClick={toggleTheme} className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Toggle Theme
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
