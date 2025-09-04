import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Database } from "lucide-react";
import FileUploader from "../components/upload/FileUploader";
import ValidationResults from "../components/upload/ValidationResults";

// Placeholder API functions (replace with actual API calls)
const apiUploadFile = async (file) => {
  // Example: call FastAPI endpoint to upload file
  return { file_url: "https://example.com/uploaded_file.csv" };
};

const apiExtractData = async ({ file_url }) => {
  // Example: call FastAPI endpoint to extract and validate CSV data
  // Return in same format as previous extraction
  return {
    status: "success",
    output: [
      { customer_id: 1, name: "John Doe", email: "john@example.com", age: 30, income: 50000, account_balance: 1000, credit_score: 700, last_transaction_date: "2025-01-01" },
      { customer_id: 2, name: "Jane Smith", email: "jane@example.com", age: 28, income: 60000, account_balance: 2000, credit_score: 720, last_transaction_date: "2025-01-02" }
    ]
  };
};

const apiSaveCustomers = async (data, file) => {
  // Example: call FastAPI endpoint to save customer data
  return { success: true };
};

function UploadData() {
  const [currentFile, setCurrentFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);

  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setError(null);
    setValidationData(null);
    setSaveComplete(false);

    try {
      const { file_url } = await apiUploadFile(file);

      const extractionResult = await apiExtractData({ file_url });

      if (extractionResult.status === "success" && extractionResult.output) {
        const data = Array.isArray(extractionResult.output)
          ? extractionResult.output
          : [extractionResult.output];

        // Simulate validation results
        const validRows = data.filter(row => row.customer_id && row.name && row.email);
        const errorRows = data.length - validRows.length;
        const errors = data.length > validRows.length
          ? ["Missing required fields in some rows", "Invalid email format detected"]
          : [];

        setValidationData({
          rowsProcessed: data.length,
          validRows: validRows.length,
          errorRows,
          errors,
          preview: validRows.slice(0, 3),
          extractedData: validRows,
          file_url
        });
      } else {
        throw new Error("Failed to extract data from file");
      }
    } catch (err) {
      setError(`Error processing file: ${err.message}`);
    }

    setIsProcessing(false);
  };

  const handleSaveToDatabase = async () => {
    if (!validationData?.extractedData) return;

    setIsSaving(true);
    setError(null);

    try {
      await apiSaveCustomers(validationData.extractedData, currentFile);
      setSaveComplete(true);
    } catch (err) {
      setError(`Error saving to database: ${err.message}`);
    }

    setIsSaving(false);
  };

  const handleClearFile = () => {
    setCurrentFile(null);
    setValidationData(null);
    setError(null);
    setSaveComplete(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Customer Data</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Import CSV files containing customer information for segmentation analysis.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {saveComplete && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/30">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Customer data has been successfully saved to the database! You can now proceed to segmentation analysis.
          </AlertDescription>
        </Alert>
      )}

      {/* File Uploader */}
      <FileUploader 
        onFileUpload={(file) => {
          setCurrentFile(file);
          handleFileUpload(file);
        }}
        isProcessing={isProcessing}
      />

      {/* Validation Results */}
      {validationData && (
        <ValidationResults validationData={validationData} />
      )}

      {/* Action Buttons */}
      {validationData && !saveComplete && (
        <div className="flex gap-4">
          <Button
            onClick={handleSaveToDatabase}
            disabled={isSaving || validationData.validRows === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Database className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save to Database"}
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFile}
            disabled={isSaving}
          >
            Clear & Upload New File
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Expected CSV Format</h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
          Your CSV file should include the following columns:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">customer_id</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">name</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">gender</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">age</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">occupation</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">city</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">account_type</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">income</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">balance</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">account_tenure</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">has_loan</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">has_credit_card</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">has_investment</div>
          <div className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">last_marketing_response</div>
        </div>
      </div>
    </div>
  );
}

export default UploadData;
