'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Calendar,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { register } = useAuth();
  const router = useRouter();

  // পেজ লোড হওয়ার সাথে সাথে স্ক্রল টপে নিয়ে যাওয়া (জাম্পিং প্রবলেম ফিক্স)
  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // টাইপ করার সাথে সাথে এরর ক্লিয়ার
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        location: formData.location,
      });
      // সাকসেস হলে লগইন পেজে রিডাইরেক্ট করতে পারো (যদি চাও)
      // router.push('/login');
    } catch (error) {
      // AuthContext-এ এরর হ্যান্ডেল করা আছে
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EventsHub</h1>
              <p className="text-xs text-green-600">Discover Amazing Events</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Join EventsHub</h2>
          <p className="text-sm text-gray-600">Create your account and start connecting</p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span>Full Name</span>
                </label>
                <div className="relative">
                  <Input
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    } focus:border-green-500 focus:ring-2 focus:ring-green-500/20`}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:border-green-500 focus:ring-2 focus:ring-green-500/20`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>Location</span>
                </label>
                <div className="relative">
                  <Input
                    name="location"
                    type="text"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    } focus:border-green-500 focus:ring-2 focus:ring-green-500/20`}
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-10 py-2.5 rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:border-green-500 focus:ring-2 focus:ring-green-500/20`}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span>Confirm Password</span>
                </label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-10 py-2.5 rounded-lg border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:border-green-500 focus:ring-2 focus:ring-green-500/20`}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300 mt-0.5"
                />
                <label htmlFor="terms" className="text-xs text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-green-600 hover:text-green-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-green-600 hover:text-green-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-green-500/25 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-green-600 hover:text-green-700 inline-flex items-center space-x-1"
                >
                  <span>Sign in here</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}