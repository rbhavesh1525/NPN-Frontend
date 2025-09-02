import React, { useState, useEffect } from "react";

import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { 
  MessageSquare, 
  Wand2, 
  Send, 
  Users, 
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";

const SEGMENT_LABELS = {
  high_value: "High Value Customers",
  growth_potential: "Growth Potential",
  risk_management: "Risk Management", 
  basic_service: "Basic Service"
};

 function MessageGeneration() {
  const [customers, setCustomers] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

 const loadCustomers = async () => {
  try {
    const response = await axios.get("https://your-api-url/customers"); // your FastAPI endpoint
    const customerData = response.data || [];
    setCustomers(customerData);
  } catch (err) {
    setError("Error loading customer data");
  }
};


  const getSegmentStats = () => {
    const segmentCounts = customers.reduce((acc, customer) => {
      const segment = customer.segment || 'unassigned';
      acc[segment] = (acc[segment] || 0) + 1;
      return acc;
    }, {});
    return segmentCounts;
  };

  const generateMessage = async () => {
    if (!selectedSegment) {
      setError("Please select a customer segment");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const segmentCustomers = customers.filter(c => c.segment === selectedSegment);
      const avgBalance = segmentCustomers.length
  ? segmentCustomers.reduce((sum, c) => sum + (c.account_balance || 0), 0) / segmentCustomers.length
  : 0;

      const avgCreditScore = segmentCustomers.reduce((sum, c) => sum + (c.credit_score || 0), 0) / segmentCustomers.length;
      
      const prompt = `Generate a personalized marketing message for ${SEGMENT_LABELS[selectedSegment]} customers. 
      
      Segment characteristics:
      - Average account balance: $${avgBalance.toLocaleString()}
      - Average credit score: ${Math.round(avgCreditScore)}
      - Number of customers: ${segmentCustomers.length}
      
      The message should be:
      - Professional and banking-appropriate
      - Personalized to this customer segment
      - Include a clear call-to-action
      - Be concise but engaging (max 150 words)
      
      Focus on relevant financial products or services that would benefit this customer segment.`;

      const result = await InvokeLLM({ prompt });
      setGeneratedMessage(result);
      
    } catch (err) {
      console.error(err);
      setError("Error generating message. Please try again.");
    }
    
    setIsGenerating(false);
  };

  const sendMessage = async () => {
    if (!selectedSegment || !generatedMessage || !campaignName.trim()) {
      setError("Please complete all fields before sending");
      return;
    }

    setIsSending(true);
    setError(null);
   try {
  const targetCustomers = customers.filter(c => c.segment === selectedSegment);

  await axios.post("https://your-api-url/message-campaigns", {
    campaign_name: campaignName,
    target_segment: selectedSegment,
    message_content: generatedMessage,
    status: "sent",
    customers_targeted: targetCustomers.length,
    sent_date: new Date().toISOString().split("T")[0]
  });
} catch (err) {
  console.error(err)
  setError("Error creating message campaign");
}
    setIsSending(false);
  };

  const segmentStats = getSegmentStats();
  const availableSegments = Object.keys(segmentStats).filter(s => s !== 'unassigned' && segmentStats[s] > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Message Generation</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Create targeted marketing messages for specific customer segments using AI.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/30">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Message campaign sent successfully to {customers.filter(c => c.segment === selectedSegment).length} customers!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Generation */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Campaign Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Campaign Name
                </label>
                <Input
                  placeholder="Enter campaign name..."
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Target Segment
                </label>
                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer segment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSegments.map(segment => (
                      <SelectItem key={segment} value={segment}>
                        {SEGMENT_LABELS[segment]} ({segmentStats[segment]} customers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateMessage}
                disabled={!selectedSegment || isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating Message..." : "Generate AI Message"}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Message */}
          {generatedMessage && (
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generated Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                
                <Button
                  onClick={sendMessage}
                  disabled={!campaignName.trim() || isSending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? "Sending..." : `Send to ${customers.filter(c => c.segment === selectedSegment).length} Customers`}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Segment Overview */}
        <div>
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Segment Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableSegments.length > 0 ? (
                availableSegments.map(segment => (
                  <div
                    key={segment}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedSegment === segment
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSegment(segment)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {SEGMENT_LABELS[segment]}
                      </span>
                      <Badge variant="outline">
                        {segmentStats[segment]}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300">
                    No customer segments found. Run segmentation analysis first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default MessageGeneration;