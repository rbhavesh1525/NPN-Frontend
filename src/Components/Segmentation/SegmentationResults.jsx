import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Download, Users, TrendingUp, Shield, Star } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const SEGMENT_COLORS = {
  high_value: "#10b981",
  growth_potential: "#3b82f6", 
  risk_management: "#f59e0b",
  basic_service: "#8b5cf6"
};

const SEGMENT_ICONS = {
  high_value: Star,
  growth_potential: TrendingUp,
  risk_management: Shield,
  basic_service: Users
};

const SEGMENT_LABELS = {
  high_value: "High Value",
  growth_potential: "Growth Potential",
  risk_management: "Risk Management", 
  basic_service: "Basic Service"
};

export default function SegmentationResults({ results, customers }) {
  const segmentData = results?.segments || {};
  const chartData = Object.entries(segmentData).map(([segment, count]) => ({
    name: SEGMENT_LABELS[segment] || segment,
    value: count,
    color: SEGMENT_COLORS[segment] || "#8b5cf6"
  }));

  const downloadResults = () => {
    const csvContent = [
      ["Customer ID", "Name", "Email", "Segment", "Account Balance", "Credit Score"].join(','),
      ...customers.map(customer => [
        customer.customer_id,
        customer.name,
        customer.email,
        SEGMENT_LABELS[customer.segment] || customer.segment,
        customer.account_balance || 0,
        customer.credit_score || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customer_segmentation_results.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(segmentData).map(([segment, count]) => {
          const Icon = SEGMENT_ICONS[segment] || Users;
          return (
            <Card key={segment} className="shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {SEGMENT_LABELS[segment]}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: SEGMENT_COLORS[segment] }}>
                      {count}
                    </p>
                  </div>
                  <Icon className="w-8 h-8" style={{ color: SEGMENT_COLORS[segment] }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Segment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Segment Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Segments</CardTitle>
            <Button onClick={downloadResults} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Credit Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.slice(0, 10).map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.customer_id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Badge 
                        className="text-white"
                        style={{ backgroundColor: SEGMENT_COLORS[customer.segment] || "#8b5cf6" }}
                      >
                        {SEGMENT_LABELS[customer.segment] || customer.segment}
                      </Badge>
                    </TableCell>
                    <TableCell>${customer.account_balance?.toLocaleString()}</TableCell>
                    <TableCell>{customer.credit_score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {customers.length > 10 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
              Showing first 10 results. Download CSV to see all {customers.length} customers.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}