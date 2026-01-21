'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContentGeneratorAnimation } from '@/components/ui/content-generator-animation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await apiClient.post('/auth/login', {
        email,
        password,
        username: 'login_request'
      });
      setAuth(data.user, data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        const { data } = await apiClient.post('/auth/google', { token: "mock_google_token" });
        setAuth(data.user, data.access_token);
        router.push('/dashboard');
    } catch (e) {
        console.error("Google Auth Failed", e);
        setError('Google authentication failed');
    }
  };

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
                Watch AI Create Content
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Experience the power of automated content generation in real-time.
                Our AI analyzes, researches, and writes professional content instantly.
              </p>
            </div>

            {/* 3D Animation Container */}
            <div className="relative h-96 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <ContentGeneratorAnimation />
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-sm text-gray-300">Lightning Fast</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm text-gray-300">SEO Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-sm text-gray-300">AI Powered</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">

            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your ProContent Engine account</p>
            </div>

            {/* Login Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error ? "Please check your credentials" : undefined}
                required
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={error ? "Please check your credentials" : undefined}
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
            </div>

            {error && (
              <div className="text-sm text-red-400 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25" size="lg" isLoading={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
            size="lg"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Animation - Show on smaller screens */}
        <div className="lg:hidden mt-12">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">See AI in Action</h3>
            <p className="text-gray-400 text-sm">Watch how our AI creates content automatically</p>
          </div>

          <div className="h-64 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <ContentGeneratorAnimation />
          </div>
        </div>
      </div>
    </div>
  );
}