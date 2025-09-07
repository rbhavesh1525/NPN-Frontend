import React, { useState, useEffect } from "react";
import { Users, Send } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";

function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      // Fetch dashboard stats and recent campaigns
      const [statsResponse, campaignsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/stats`),
        fetch(`${API_BASE_URL}/campaigns/recent?limit=5`)
      ]);
      
      // Handle stats
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats({
          totalCustomers: statsData.total_customers || 0,
          messagesSent: statsData.total_messages_sent || 0
        });
      }
      
      // Handle recent campaigns
      const campaignsData = await campaignsResponse.json();
      if (campaignsData.success && campaignsData.campaigns) {
        const recentActivity = campaignsData.campaigns.map(campaign => ({
          name: campaign.campaign_name,
          status: campaign.status,
          date: new Date(campaign.started_at).toLocaleDateString(),
          color: campaign.status === 'completed' ? 'green' : campaign.status === 'running' ? 'blue' : 'red'
        }));
        setActivity(recentActivity);
      } else {
        setActivity([]);
      }
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Set default values on error
      setStats({
        totalCustomers: 0,
        messagesSent: 0
      });
      setActivity([]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(2).fill(0).map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard 
          title="Total Customers" 
          value={stats.totalCustomers.toLocaleString()} 
          icon={Users} 
          color="blue" 
        />
        <StatsCard 
          title="Messages Sent" 
          value={stats.messagesSent.toLocaleString()} 
          icon={Send} 
          color="orange" 
        />
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border-0">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Email Campaigns</h3>
          <div className="space-y-4">
            {activity.length > 0 ? (
              activity.map((campaign, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-1 bg-${campaign.color}-500 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {campaign.name}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        campaign.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {campaign.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {campaign.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent campaigns</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Start your first email campaign to see activity here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
