import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SignupPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/auth/signup", {
        fullname,
        email,
        password
      });

      // Save token/session
      localStorage.setItem("token", res.data.access_token);

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Signup failed. Try again.");
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
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Start your journey with CustomerIQ today.</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input 
                id="fullname" 
                type="text" 
                placeholder="John Doe"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
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
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or sign up with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full text-lg py-6 flex items-center gap-2"
              onClick={() => console.log("Google signup with Supabase OAuth")}
            >
              <svg role="img" viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="..."/></svg>
              Google
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
            <Link to="/pages/login"> <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                Sign in
              </span></Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
