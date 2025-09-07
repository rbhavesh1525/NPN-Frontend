import React, { useEffect, useState } from "react";
import { FileText, Target, Send, Filter, Calendar, Users, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function History() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCampaignHistory();
  }, []);

  const loadCampaignHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/campaigns/recent');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
      console.log('📊 Campaign history loaded:', data.campaigns);
    } catch (err) {
      console.error("Error loading campaign history:", err);
      setCampaigns([]);
    }
    setIsLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'running': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
      'completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'failed': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
    };
    
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock };
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 border`}>
        <IconComponent size={12} />
        {status || 'unknown'}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (startedAt, completedAt) => {
    if (!startedAt) return 'N/A';
    if (!completedAt) return 'Running...';
    
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const durationMs = end - start;
    
    if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`;
    if (durationMs < 3600000) return `${Math.round(durationMs / 60000)}m`;
    return `${Math.round(durationMs / 3600000)}h`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaign History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your email campaign performance and history
          </p>
        </div>
        <Button 
          onClick={loadCampaignHistory}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaigns found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start your first campaign from the Message Generation page to see history here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.campaign_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {campaign.campaign_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {campaign.campaign_id}
                    </p>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{campaign.segment_name}</p>
                      <p className="text-xs text-gray-500">
                        {campaign.total_customers || 0} customers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Started</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(campaign.started_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-xs text-gray-500">
                        {calculateDuration(campaign.started_at, campaign.completed_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {campaign.product_name && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Product:</span> {campaign.product_name}
                    </p>
                  </div>
                )}

                {campaign.completed_at && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Completed:</span> {formatDate(campaign.completed_at)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
