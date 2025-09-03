import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AuthError({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-700 text-sm font-medium">Authentication Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 text-sm underline hover:no-underline mt-2"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
