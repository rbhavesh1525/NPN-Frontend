import React, { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Modal from "@/components/ui/modal";
import { supabase } from "@/lib/supabase";
import { 
  MessageSquare, 
  Wand2, 
  Send, 
  Users, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  Loader
} from "lucide-react";


const SEGMENT_LABELS = [
  "New & Cautious",
  "Stable Earners", 
  "Mid-Tier Professionals",
  "Affluent Customers",
  "High-Value Elite"
];

// Map segment labels to table names
const SEGMENT_TABLE_MAP = {
  "New & Cautious": "new_and_cautious",
  "Stable Earners": "stable_earners",
  "Mid-Tier Professionals": "mid_tier_professionals", 
  "Affluent Customers": "affluent_customers",
  "High-Value Elite": "high_value_elite"
};

// Map segment labels to cluster names for bank products
const SEGMENT_CLUSTER_MAP = {
  "New & Cautious": "New & Cautious",
  "Stable Earners": "Stable Earners",
  "Mid-Tier Professionals": "Mid-Tier Professionals",
  "Affluent Customers": "Affluent Customers",
  "High-Value Elite": "High-Value Elite"
};

 function MessageGeneration() {

  const [selectedSegment, setSelectedSegment] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);
  const [bankProducts, setBankProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [campaignResult, setCampaignResult] = useState(null);

  // Fetch bank products based on selected segment
  const fetchBankProducts = async (segment) => {
    if (!segment) return;
    
    console.log('🔍 Fetching products for segment:', segment);
    setLoadingProducts(true);
    setError(null);
    
    try {
      const clusterName = SEGMENT_CLUSTER_MAP[segment];
      console.log('🎯 Cluster name mapped to:', clusterName);
      
      const { data, error } = await supabase
        .from('bank_products')
        .select('*')
        .eq('cluster_name', clusterName)
        .order('product_name', { ascending: true });
      
      console.log('📊 Supabase response:', { data, error });
      
      if (error) throw error;
      
      setBankProducts(data || []);
      console.log('✅ Bank products set:', data?.length || 0, 'products');
      
    } catch (err) {
      console.error('❌ Error fetching bank products:', err);
      setError(`Failed to load bank products: ${err.message}`);
      setBankProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch bank products when segment changes
  useEffect(() => {
    if (selectedSegment) {
      setSelectedProduct(""); // Reset product selection
      fetchBankProducts(selectedSegment);
    } else {
      setBankProducts([]);
      setSelectedProduct("");
    }
  }, [selectedSegment]);

  const runCampaign = async () => {
    if (!selectedSegment) {
      setError("Please select a customer segment");
      return;
    }
    if (!selectedProduct) {
      setError("Please select a bank product");
      return;
    }
    if (!campaignName.trim()) {
      setError("Please enter a campaign name");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Starting campaign...');
      
      // Step 1: Start campaign logging in backend
      const campaignStartResponse = await fetch('http://localhost:8000/campaigns/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_name: campaignName,
          segment_name: selectedSegment,
          product_name: selectedProduct
          // total_customers will be calculated by backend
        })
      });

      if (!campaignStartResponse.ok) {
        throw new Error('Failed to start campaign logging');
      }

      const campaignData = await campaignStartResponse.json();
      const campaignId = campaignData.campaign_id;
      
      console.log('📊 Campaign logged with ID:', campaignId);

      // Step 2: Trigger n8n workflow
      const n8nPayload = {
        campaign_id: campaignId,
        campaign_name: campaignName,
        segment: selectedSegment,
        segment_table: SEGMENT_TABLE_MAP[selectedSegment],
        product_name: selectedProduct
        // total_customers not needed in n8n payload
      };

      console.log('📤 Sending to n8n via backend proxy:', n8nPayload);

      const n8nResponse = await fetch('http://localhost:8000/trigger-n8n-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload)
      });

      if (!n8nResponse.ok) {
        throw new Error(`n8n webhook failed: ${n8nResponse.status}`);
      }

      const result = await n8nResponse.json();
      console.log('✅ n8n response:', result);

      // Show success modal
      setShowSuccessModal(true);
      setCampaignResult({
        campaign_id: campaignId,
        campaign_name: campaignName,
        segment: selectedSegment,
        product: selectedProduct,
        status: 'running'
      });

      // Reset form
      setCampaignName("");
      setSelectedSegment("");
      setSelectedProduct("");

    } catch (error) {
      console.error('❌ Campaign error:', error);
      setError(`Campaign failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const availableSegments = SEGMENT_LABELS;

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
                        {segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Bank Product
                </label>
                <Select 
                  value={selectedProduct} 
                  onValueChange={setSelectedProduct}
                  disabled={!selectedSegment || loadingProducts}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        loadingProducts 
                          ? "Loading products..." 
                          : selectedSegment 
                            ? "Select bank product..." 
                            : "Select segment first..."
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts ? (
                      <SelectItem value="loading" disabled>
                        Loading products...
                      </SelectItem>
                    ) : (
                      bankProducts.map(product => (
                        <SelectItem key={product.product_id} value={product.product_name}>
                          {product.product_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={runCampaign}
                disabled={!selectedSegment || !selectedProduct || !campaignName.trim() || isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Running Campaign...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Run Campaign
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
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
                        {segment}
                      </span>
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

      {/* Success Modal Popup */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 Success!"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Campaign "{campaignName}" Run Successfully!
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Product: <strong>{selectedProduct}</strong><br />
            Segment: <strong>{selectedSegment}</strong>
          </p>
          <Button 
            onClick={() => setShowSuccessModal(false)}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            Great!
          </Button>
        </div>
      </Modal>
    </div>
  );
}
export default MessageGeneration;