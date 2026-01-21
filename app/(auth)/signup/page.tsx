'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, Eye, EyeOff, User, Mail, Lock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContentGeneratorAnimation } from '@/components/ui/content-generator-animation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const passwordStrength = (password: string) => {
    if (password.length === 0) return 0;
    if (password.length < 8) return 1;
    if (password.length >= 8 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 2;
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 3;
    return 4;
  };

  const getPasswordStrengthText = (strength: number) => {
    const texts = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return texts[strength];
  };

  const getPasswordStrengthColor = (strength: number) => {
    const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    return colors[strength];
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await apiClient.post('/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setAuth(data.user, data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}
      ></div>

      <div className={`w-full max-w-6xl ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 ease-out`}>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - Animation */}
          <div className="hidden lg:block">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Join the Content Revolution
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Experience the power of AI-driven content creation.
                Join thousands of creators who trust our platform to deliver exceptional results.
              </p>
            </div>

            {/* 3D Animation Container */}
            <div className="relative h-96 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <ContentGeneratorAnimation />
            </div>

            {/* Unique Benefits */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center group">
                <div className="text-3xl mb-2 group-hover:animate-bounce transition-transform">🌟</div>
                <div className="text-sm text-gray-300 font-medium">Expert Quality</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl mb-2 group-hover:animate-bounce transition-transform" style={{ animationDelay: '0.1s' }}>🎯</div>
                <div className="text-sm text-gray-300 font-medium">Targeted Content</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl mb-2 group-hover:animate-bounce transition-transform" style={{ animationDelay: '0.2s' }}>🚀</div>
                <div className="text-sm text-gray-300 font-medium">Scale Effortlessly</div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">

            {/* Back to Login */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>

            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
              <p className="text-gray-400">Start your journey to exceptional content creation</p>
            </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      strength === 1 ? 'text-red-400' :
                      strength === 2 ? 'text-yellow-400' :
                      strength === 3 ? 'text-blue-400' :
                      'text-green-400'
                    }`}>
                      {getPasswordStrengthText(strength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor(strength)}`}
                      style={{ width: `${(strength / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  error={formData.confirmPassword && !passwordMatch ? "Passwords do not match" : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {passwordMatch && (
                  <Check size={16} className="absolute right-10 top-9 text-green-400" />
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            By creating an account, you agree to our{" "}
            <Link href="#" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}