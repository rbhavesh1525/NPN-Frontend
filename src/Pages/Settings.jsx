import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";
import ProfileSettings from "../components/settings/ProfileSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import DangerZone from "../components/settings/DangerZone";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Simulate loading user data
  useEffect(() => {
    setTimeout(() => {
      setUser({
        name: "John Doe",
        email: "john@example.com",
        notification_preferences: {
          email: true,
          sms: false,
          push: true,
        },
        theme: "light",
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  // Simulate updating user data
  const handleUpdate = async (data) => {
    setIsUpdating(true);
    setUpdateSuccess(false);

    // Simulate API delay
    setTimeout(() => {
      setUser((prev) => ({ ...prev, ...data }));
      setIsUpdating(false);
      setUpdateSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return <div>Error loading user data. Please try again.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your account details, preferences, and platform settings.
        </p>
      </div>

      {/* Update Success Alert */}
      {updateSuccess && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/30">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your settings have been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Components */}
      <ProfileSettings 
        userData={user} 
        onUpdate={handleUpdate} 
        isUpdating={isUpdating} 
      />
      <NotificationSettings 
        preferences={user.notification_preferences} 
        onUpdate={handleUpdate} 
        isUpdating={isUpdating} 
      />
      <AppearanceSettings />
      <DangerZone />
    </div>
  );
}
