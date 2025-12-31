'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Heart,
  MessageSquare,
  Zap,
  Target,
  Eye,
  BarChart3,
  Crown,
  Sparkles
} from 'lucide-react';

export default function BecomeHost() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBecomeHost = async () => {
    if (!user) {
      toast.error('Please login or register first to become a host');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to update user role to host
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Congratulations! You are now a host. Start creating amazing events!');
      router.push('/events/create');
    } catch (error) {
      toast.error('Failed to become a host. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Earn Money',
      description: 'Monetize your events and earn income from your expertise'
    },
    {
      icon: Users,
      title: 'Build Community',
      description: 'Connect with like-minded people and grow your network'
    },
    {
      icon: Crown,
      title: 'Establish Authority',
      description: 'Position yourself as an expert in your field'
    },
    {
      icon: BarChart3,
      title: 'Track Performance',
      description: 'Get insights and analytics about your events'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Safe payments and protected transactions'
    },
    {
      icon: Zap,
      title: 'Easy Management',
      description: 'Simple tools to create and manage your events'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your account or login if you already have one'
    },
    {
      number: '2',
      title: 'Become a Host',
      description: 'Click the button below to upgrade your account to host status'
    },
    {
      number: '3',
      title: 'Create Events',
      description: 'Start creating and publishing your amazing events'
    },
    {
      number: '4',
      title: 'Start Earning',
      description: 'Accept bookings and begin your journey as an event host'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Yoga Instructor',
      content: 'Becoming a host has transformed my business. I now reach more students and earn double what I used to.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Tech Workshop Organizer',
      content: 'The platform is incredibly user-friendly. I can set up events in minutes and manage everything seamlessly.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Art Class Teacher',
      content: 'I love how I can focus on what I do best - teaching - while the platform handles all the logistics.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-yellow-900" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Become a
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Event Host
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto">
              Share your passion, build your community, and earn money by hosting amazing events
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleBecomeHost}
                disabled={isSubmitting}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Become a Host Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              {!user && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/register')}
                  className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-bold px-8 py-4 text-lg transition-all duration-300"
                >
                  Sign Up First
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-400/20 rounded-full blur-xl"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Become a Host?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful hosts who are already making a difference
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-emerald-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Hosts Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from successful event hosts
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join our community of successful hosts today and turn your passion into profit
          </p>
          <Button
            onClick={handleBecomeHost}
            disabled={isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Become a Host Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
