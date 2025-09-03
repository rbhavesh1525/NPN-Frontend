import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ArrowLeft, Mail } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendConfirmation } = useAuth();
  
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/pages/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');

    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await verifyOtp(email, otpString, 'signup');
      
      if (error) {
        console.error('OTP verification error:', error);
        if (error.message.includes('Token has expired')) {
          setError('OTP has expired. Please request a new one.');
        } else if (error.message.includes('Token not found')) {
          setError('Invalid OTP. Please check and try again.');
        } else {
          setError(error.message || 'Invalid OTP. Please try again.');
        }
        return;
      }

      if (data?.user && data?.session) {
        console.log('OTP verification successful:', data);
        navigate('/pages/dashboard');
      }
    } catch (err) {
      console.error('OTP verification exception:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');

    try {
      const { error } = await resendConfirmation(email);
      if (error) {
        setError(error.message || 'Failed to resend verification code');
      } else {
        setResendCooldown(60);
        setError('');
        // Clear existing OTP inputs
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError('Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                Enter the 6-digit verification code sent to your email address.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp-0">Enter 6-digit verification code</Label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}
            
            <Button 
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResendOtp}
                disabled={resendLoading || resendCooldown > 0}
                className="w-full"
              >
                {resendLoading 
                  ? "Sending..." 
                  : resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : "Resend Verification Code"
                }
              </Button>
            </div>

            <div className="flex items-center justify-center pt-4">
              <Link 
                to="/pages/signup" 
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Signup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
