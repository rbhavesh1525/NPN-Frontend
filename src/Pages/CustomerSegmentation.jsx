import React, { useState } from 'react';
import { Upload, Play, Users, AlertCircle, CheckCircle, FileText, Database } from 'lucide-react';

const CustomerSegmentation = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentationResults, setSegmentationResults] = useState(null);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError('');
      setSegmentationResults(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv') {
        setSelectedFile(file);
        setError('');
        setSegmentationResults(null);
      } else {
        setError('Please select a valid CSV file');
      }
    }
  };

  // Upload and run segmentation
  const handleSegmentation = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first');
      return;
    }

    setIsSegmenting(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Call the segmentation API
      const response = await fetch('http://127.0.0.1:8000/segment-and-store', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Segmentation failed');
      }

      // Debug: Log the actual response structure
      console.log('Segmentation API Response:', result);

      // Process and format results
      const formattedResults = {
        totalCustomers: Object.values(result.clusters).reduce((sum, cluster) => sum + (cluster.processed_count || 0), 0),
        clusters: result.clusters
      };

      setSegmentationResults(formattedResults);

    } catch (err) {
      setError(`Segmentation Error: ${err.message}`);
    } finally {
      setIsSegmenting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Customer Segmentation</h1>
        <p className="text-gray-600 dark:text-gray-300">Analyze customer behavior and create targeted segments using machine learning.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Upload Customer Data</h2>
        
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : selectedFile
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          
          {selectedFile ? (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-green-600 dark:text-green-400">File Selected</p>
                <p className="text-gray-600 dark:text-gray-300">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => document.getElementById('file-upload').click()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Choose Different File
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Upload Customer Data</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>
              <label htmlFor="file-upload" className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                Select CSV File
              </label>
            </div>
          )}
        </div>

        {/* Expected Format */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Expected CSV Format</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your CSV file should include the following columns:</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
            <div>• customer_id</div>
            <div>• email</div>
            <div>• name</div>
            <div>• age</div>
            <div>• income</div>
            <div>• account_balance</div>
            <div>• credit_score</div>
            <div>• last_transaction_date</div>
          </div>
        </div>

        {/* Run Segmentation Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSegmentation}
            disabled={!selectedFile || isSegmenting}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSegmenting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Customer Segmentation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {segmentationResults && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Segmentation Results
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              Segmentation Complete
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900 dark:text-white">Total Customers</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{segmentationResults.totalCustomers}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
              <Database className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900 dark:text-white">Segments Created</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Object.keys(segmentationResults.clusters).length}</p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Segment Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(segmentationResults.clusters).map(([segmentName, data]) => (
                <div key={segmentName} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">{segmentName.replace('_', ' ')}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      data.status === 'success' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    }`}>
                      {data.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>{data.processed_count || 0}</strong> customers assigned to this segment
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                      style={{
                        width: `${((data.processed_count || 0) / segmentationResults.totalCustomers) * 100}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {(((data.processed_count || 0) / segmentationResults.totalCustomers) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                <Users className="w-4 h-4" />
                View Segment Details
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                <FileText className="w-4 h-4" />
                Export Results
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Database className="w-4 h-4" />
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSegmentation;
