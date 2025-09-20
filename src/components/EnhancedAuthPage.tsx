'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Phone, User, Lock, ArrowLeft, Github, Mail, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'register' | 'forgot' | 'otp';

export default function EnhancedAuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [userId, setUserId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [loginPhone, setLoginPhone] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [otp, setOtp] = useState('');

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.length > 0) {
        cleaned = '+1' + cleaned;
      }
    }
    return cleaned;
  };

  const handlePhoneChange = (value: string, setter: (value: string) => void) => {
    const formatted = formatPhoneNumber(value);
    setter(formatted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setAuthMode('otp');
        toast.success('OTP sent to your phone number');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: registerPhone, name: registerName }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setAuthMode('otp');
        toast.success('OTP sent to your phone number');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setAuthMode('otp');
        toast.success('Password reset OTP sent to your phone number');
      } else {
        toast.error(data.error || 'Failed to send reset OTP');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAuthMode('login');
    setUserId('');
    setOtp('');
    setLoginPhone('');
    setRegisterPhone('');
    setRegisterName('');
    setForgotPhone('');
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const transition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
  };

  const renderLoginForm = () => (
    <motion.div
      key="login"
      custom={0}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to continue your learning journey
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="login-phone"
              type="tel"
              placeholder="+1234567890"
              value={loginPhone}
              onChange={(e) => handlePhoneChange(e.target.value, setLoginPhone)}
              className="pl-10 h-12"
              required
            />
          </div>
          <p className="text-xs text-gray-500">Use international format with country code</p>
        </div>

        <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            'Continue with Phone'
          )}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setAuthMode('forgot')}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Forgot Password?
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              New to our platform?
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setAuthMode('register')}
          className="w-full h-12"
        >
          Create New Account
        </Button>
      </div>
    </motion.div>
  );

  const renderRegisterForm = () => (
    <motion.div
      key="register"
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAuthMode('login')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of learners today
          </p>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="register-name"
              type="text"
              placeholder="Enter your full name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="register-phone"
              type="tel"
              placeholder="+1234567890"
              value={registerPhone}
              onChange={(e) => handlePhoneChange(e.target.value, setRegisterPhone)}
              className="pl-10 h-12"
              required
            />
          </div>
          <p className="text-xs text-gray-500">Use international format with country code</p>
        </div>

        <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setAuthMode('login')}
          className="text-sm"
        >
          Already have an account? Sign in
        </Button>
      </div>
    </motion.div>
  );

  const renderForgotForm = () => (
    <motion.div
      key="forgot"
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAuthMode('login')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We'll send you a reset code
          </p>
        </div>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forgot-phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="forgot-phone"
              type="tel"
              placeholder="+1234567890"
              value={forgotPhone}
              onChange={(e) => handlePhoneChange(e.target.value, setForgotPhone)}
              className="pl-10 h-12"
              required
            />
          </div>
          <p className="text-xs text-gray-500">Use international format with country code</p>
        </div>

        <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Reset Code...
            </>
          ) : (
            'Send Reset Code'
          )}
        </Button>
      </form>
    </motion.div>
  );

  const renderOtpForm = () => (
    <motion.div
      key="otp"
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetForm}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Verify Code
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to your phone
          </p>
        </div>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="pl-10 h-12 text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify & Continue'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => {
            // Resend OTP logic would go here
            toast.info('Resend functionality coming soon');
          }}
          className="text-sm"
        >
          Didn't receive code? Resend
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0">
        <CardContent className="p-8">
          <AnimatePresence mode="wait" custom={authMode}>
            {authMode === 'login' && renderLoginForm()}
            {authMode === 'register' && renderRegisterForm()}
            {authMode === 'forgot' && renderForgotForm()}
            {authMode === 'otp' && renderOtpForm()}
          </AnimatePresence>
        </CardContent>
        
        {/* Developer Credits */}
        <div className="px-8 pb-6 text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <span>Designed & Developed by</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Sanket Mane</span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <a
              href="mailto:contactsanket1@gmail.com"
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <Mail className="h-3 w-3" />
              <span>contactsanket1@gmail.com</span>
            </a>
            <a
              href="https://github.com/SanketsMane"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Github className="h-3 w-3" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}