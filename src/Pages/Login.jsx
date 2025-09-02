import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        email,
        password
      });
      
      // Save token in localStorage/sessionStorage
      localStorage.setItem("token", res.data.access_token);

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back to CustomerIQ</h1>
          <p className="text-gray-600 mt-2">Enter your credentials to access your dashboard.</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            
            <Button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Google OAuth button (supabase.auth.signInWithOAuth) */}
            <Button 
              variant="outline" 
              className="w-full text-lg py-6 flex items-center gap-2"
              onClick={() => console.log("Google login flow")}
            >
              <svg role="img" viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="..."/></svg>
              Google
            </Button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
          <Link to="/pages/signup"> <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                Sign up
              </span></Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
