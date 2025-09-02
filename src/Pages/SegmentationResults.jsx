import React, { useState, useEffect } from "react";
// import { Customer, SegmentationRun } from "@/entities/all";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import SegmentationControls from "../components/segmentation/SegmentationControls";
import SegmentationResults from "../components/segmentation/SegmentationResults";

export default function SegmentationResultsPage() {
  const [customers, setCustomers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const customerData = await Customer.list();
      setCustomers(customerData);
      
      // If customers have segments, show results
      if (customerData.length > 0 && customerData.some(c => c.segment)) {
        const segmentCounts = customerData.reduce((acc, customer) => {
          const segment = customer.segment || 'unassigned';
          acc[segment] = (acc[segment] || 0) + 1;
          return acc;
        }, {});
        
        setResults({ segments: segmentCounts });
      }
    } catch (err) {
      setError("Error loading customer data");
    }
  };

  const runSegmentation = async () => {
    if (customers.length === 0) {
      setError("No customer data found. Please upload customer data first.");
      return;
    }

    setIsRunning(true);
    setError(null);
    
    try {
      // Simulate ML segmentation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock segmentation logic based on customer attributes
      const segmentedCustomers = customers.map(customer => {
        let segment = 'basic_service';
        
        const balance = customer.account_balance || 0;
        const creditScore = customer.credit_score || 600;
        const income = customer.income || 50000;
        
        if (balance > 100000 && creditScore > 750) {
          segment = 'high_value';
        } else if (income > 75000 && creditScore > 700) {
          segment = 'growth_potential';
        } else if (creditScore < 600 || balance < 1000) {
          segment = 'risk_management';
        }
        
        return { ...customer, segment };
      });

      // Update customers with segments
      await Promise.all(
        segmentedCustomers.map(customer =>
          Customer.update(customer.id, { segment: customer.segment })
        )
      );

      // Calculate segment distribution
      const segmentCounts = segmentedCustomers.reduce((acc, customer) => {
        acc[customer.segment] = (acc[customer.segment] || 0) + 1;
        return acc;
      }, {});

      // Record the segmentation run
      await SegmentationRun.create({
        run_name: `Segmentation ${new Date().toLocaleDateString()}`,
        total_customers: customers.length,
        segments_created: Object.keys(segmentCounts).length,
        status: 'completed',
        results_summary: { segmentCounts }
      });

      setResults({ segments: segmentCounts });
      setCustomers(segmentedCustomers);
      
    } catch (err) {
      setError("Error running segmentation analysis");
    }
    
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Segmentation</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Analyze customer behavior and create targeted segments using machine learning.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Customer Count Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900 dark:text-blue-100">
            {customers.length} customers available for segmentation
          </span>
        </div>
      </div>

      {/* Segmentation Controls */}
      <SegmentationControls 
        onRunSegmentation={runSegmentation}
        isRunning={isRunning}
      />

      {/* Results */}
      {results && (
        <SegmentationResults 
          results={results}
          customers={customers}
        />
      )}

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Customer Data Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Upload customer data first to begin segmentation analysis.
          </p>
        </div>
      )}
    </div>
  );
}