import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { testSupabaseConnection, testEmailSignup } from '@/lib/testSupabase';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugAuthPage() {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');
  const [testName, setTestName] = useState('Test User');
  const [testOtp, setTestOtp] = useState('');
  const [results, setResults] = useState([]);
  const { user, session, verifyOtp } = useAuth();

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const testConnection = async () => {
    addResult('Testing Supabase connection...');
    const isConnected = await testSupabaseConnection();
    addResult(`Connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`, isConnected ? 'success' : 'error');
  };

  const testSignup = async () => {
    addResult('Testing email signup...');
    const { data, error } = await testEmailSignup(testEmail, testPassword, testName);
    
    if (error) {
      addResult(`Signup error: ${error.message}`, 'error');
    } else {
      addResult(`Signup success: User created - ${data.user?.email}`, 'success');
    }
  };

  const testOtpVerification = async () => {
    addResult('Testing OTP verification...');
    const { data, error } = await verifyOtp(testEmail, testOtp, 'signup');
    
    if (error) {
      addResult(`OTP verification error: ${error.message}`, 'error');
    } else {
      addResult(`OTP verification success: User verified!`, 'success');
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Current Auth State</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
                <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
                <p><strong>Email Confirmed:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
              </div>
              
              <h2 className="text-lg font-semibold mb-4 mt-6">Test Controls</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">Test Email</Label>
                  <Input
                    id="testEmail"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="testPassword">Test Password</Label>
                  <Input
                    id="testPassword"
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="testOtp">OTP Code (6 digits)</Label>
                  <Input
                    id="testOtp"
                    value={testOtp}
                    onChange={(e) => setTestOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Button onClick={testConnection} className="w-full">
                    Test Connection
                  </Button>
                  <Button onClick={testSignup} className="w-full">
                    Test Signup
                  </Button>
                  <Button onClick={testOtpVerification} className="w-full" disabled={!testOtp}>
                    Test OTP Verification
                  </Button>
                  <Button onClick={clearResults} variant="outline" className="w-full">
                    Clear Results
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Test Results</h2>
                <span className="text-sm text-gray-500">{results.length} results</span>
              </div>
              <div className="bg-gray-50 p-4 rounded h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-gray-500">No test results yet...</p>
                ) : (
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm ${
                          result.type === 'error' ? 'bg-red-100 text-red-800' :
                          result.type === 'success' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <div className="font-mono text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                        {result.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
