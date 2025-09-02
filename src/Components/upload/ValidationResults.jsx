import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Users, FileSpreadsheet } from "lucide-react";

export default function ValidationResults({ validationData }) {
  const { rowsProcessed, validRows, errorRows, errors, preview } = validationData;

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <FileSpreadsheet className="w-5 h-5" />
          Validation Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">Total Rows</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{rowsProcessed}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Valid Rows</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{validRows}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Error Rows</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{errorRows}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
            <p className="text-sm text-purple-600 dark:text-purple-400">Success Rate</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {Math.round((validRows / rowsProcessed) * 100)}%
            </p>
          </div>
        </div>

        {/* Status Alert */}
        {errorRows === 0 ? (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/30">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              All rows processed successfully! Your customer data is ready to be saved to the database.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/30">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              {errorRows} rows had validation errors. Valid rows can still be saved to the database.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Details */}
        {errors && errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">Validation Errors:</h4>
            <div className="space-y-1">
              {errors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {error}
                </div>
              ))}
              {errors.length > 5 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ... and {errors.length - 5} more errors
                </p>
              )}
            </div>
          </div>
        )}

        {/* Data Preview */}
        {preview && preview.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Preview (First 3 rows):</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-600 rounded-lg">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 3).map((row, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}