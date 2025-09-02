import React, { useState, useEffect } from "react";
import { Users, FileText, Target, Send } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import { api } from "@/lib/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    uploadedFiles: 0,
    lastSegmentation: "Never",
    messagesSent: 0
  });
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      const [customersRes, uploadsRes, segRes, campaignsRes, activityRes] = await Promise.all([
        api.getCustomers(),
        api.getUploads(),
        api.getSegmentations(),
        api.getCampaigns(),
        api.getActivity()
      ]);

      setStats({
        totalCustomers: customersRes.data.length,
        uploadedFiles: uploadsRes.data.length,
        lastSegmentation: segRes.data.length > 0
          ? new Date(segRes.data[0].created_date).toLocaleDateString()
          : "Never",
        messagesSent: campaignsRes.data.filter(c => c.status === "sent").length
      });

      setActivity(activityRes.data);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Welcome to Customer Insights Dashboard</h1>
          <p className="text-blue-100 text-lg">
            Analyze customer behavior, create targeted segments, and deliver personalized messaging campaigns.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} trend="up" trendValue="+12% this month" color="blue" />
        <StatsCard title="Uploaded Files" value={stats.uploadedFiles} icon={FileText} trend="up" trendValue="+3 this week" color="green" />
        <StatsCard title="Last Segmentation" value={stats.lastSegmentation} icon={Target} color="purple" />
        <StatsCard title="Messages Sent" value={stats.messagesSent} icon={Send} trend="up" trendValue="+25% this month" color="orange" />
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border-0">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
          <div className="space-y-3">
            {activity.length > 0 ? (
              activity.map((a, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-sm">
                  <div className={`w-2 h-2 rounded-full bg-${a.color}-500`}></div>
                  <span className="text-gray-600 dark:text-gray-300">{a.message}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
