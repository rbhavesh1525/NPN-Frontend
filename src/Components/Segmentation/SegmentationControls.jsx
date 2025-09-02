import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Settings } from "lucide-react";

export default function SegmentationControls({ onRunSegmentation, isRunning }) {
  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Segmentation Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Algorithm
            </label>
            <Select defaultValue="kmeans">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kmeans">K-Means Clustering</SelectItem>
                <SelectItem value="hierarchical">Hierarchical Clustering</SelectItem>
                <SelectItem value="dbscan">DBSCAN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Number of Segments
            </label>
            <Select defaultValue="4">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Segments</SelectItem>
                <SelectItem value="4">4 Segments</SelectItem>
                <SelectItem value="5">5 Segments</SelectItem>
                <SelectItem value="auto">Auto-detect</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          onClick={onRunSegmentation}
          disabled={isRunning}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? "Running Segmentation..." : "Run Customer Segmentation"}
        </Button>
      </CardContent>
    </Card>
  );
}