import React, { useEffect, useState } from "react";
import { FileText, Target, Send, Filter } from "lucide-react";
import { Historyapi} from "../lib/api"; // your API layer

export default function History() {
  const [activeTab, setActiveTab] = useState("all");
  const [uploads, setUploads] = useState([]);
  const [segmentations, setSegmentations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      const [uploadsRes, segRes, campaignsRes] = await Promise.all([
        Historyapi.getUploads(),
        Historyapi.getSegmentations(),
        Historyapi.getCampaigns(),
      ]);

      setUploads(uploadsRes.data);
      setSegmentations(segRes.data);
      setCampaigns(campaignsRes.data);
    } catch (err) {
      console.error("Error loading history:", err);
    }
    setIsLoading(false);
  };

  const filteredActivities = () => {
    switch (activeTab) {
      case "uploads":
        return uploads;
      case "segmentations":
        return segmentations;
      case "campaigns":
        return campaigns;
      default:
        return [...uploads, ...segmentations, ...campaigns].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      upload: <FileText className="w-5 h-5" />,
      segmentation: <Target className="w-5 h-5" />,
      campaign: <Send className="w-5 h-5" />,
    };
    return iconMap[type] || <FileText className="w-5 h-5" />;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">History</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {["all", "uploads", "segmentations", "campaigns"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-sm text-gray-500">Uploads</h2>
          <p className="text-xl font-bold">{uploads.length}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-sm text-gray-500">Segmentations</h2>
          <p className="text-xl font-bold">{segmentations.length}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-sm text-gray-500">Campaigns</h2>
          <p className="text-xl font-bold">{campaigns.length}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-sm text-gray-500">Total</h2>
          <p className="text-xl font-bold">
            {uploads.length + segmentations.length + campaigns.length}
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white shadow rounded p-4">
        {isLoading ? (
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-gray-200 rounded mb-2 w-full"
              ></div>
            ))}
          </div>
        ) : (
          filteredActivities().map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b"
            >
              <div className="flex items-center space-x-3">
                {getActivityIcon(item.type)}
                <div>
                  <p className="font-medium">{item.title || item.filename}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm font-semibold ${getStatusBadge(
                  item.status
                )}`}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
