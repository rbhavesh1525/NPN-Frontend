import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

export default function DangerZone() {
  const handleDeleteAccount = () => {
    // This would typically open a confirmation modal
    alert("This action is irreversible. Are you sure you want to delete your account? This will permanently delete all your data.");
  };

  return (
    <Card className="border-red-500 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-red-500">These actions are permanent and cannot be undone.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="font-medium">Delete Account</p>
          <p className="text-sm text-gray-500">Permanently delete your account and all associated data.</p>
        </div>
        <Button variant="destructive" onClick={handleDeleteAccount}>
          Delete My Account
        </Button>
      </CardContent>
    </Card>
  );
}