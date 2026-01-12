'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  AlertCircle,
  Shield,
  Users,
  CheckCircle,
  Lock,
  Eye,
  Smartphone,
  Flag,
  Heart,
  ArrowRight
} from 'lucide-react';

export default function SafetyPage() {
  const guidelines = [
    {
      icon: Shield,
      title: 'Verified Hosts & Participants',
      description: 'All hosts undergo verification and background checks. User profiles are reviewed to ensure community safety.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'Your payment information is encrypted and protected. We never store your full card details.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: AlertCircle,
      title: 'Report & Block Users',
      description: 'Easily report inappropriate behavior or block users. Our team reviews all reports within 24 hours.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Eye,
      title: 'Event Transparency',
      description: 'All event details are clearly displayed with verified host information and participant reviews.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Heart,
      title: 'Community Standards',
      description: 'We enforce strict community guidelines to maintain a respectful and inclusive environment.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile Safety Features',
      description: 'Share your location with friends, set emergency contacts, and use our safety check-in feature.',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const tips = [
    {
      title: 'Before You Go',
      items: [
        'Read reviews and ratings from other participants',
        'Check the host\'s verification status and history',
        'Read the event description and rules carefully',
        'Share the event details with a friend or family member',
        'Plan your transportation in advance'
      ]
    },
    {
      title: 'During the Event',
      items: [
        'Arrive early to familiarize yourself with the location',
        'Stay in groups, especially in public areas',
        'Keep your personal information private',
        'Trust your instincts - leave if you feel uncomfortable',
        'Use the emergency contact feature if needed'
      ]
    },
    {
      title: 'After the Event',
      items: [
        'Leave an honest review to help other community members',
        'Report any issues immediately',
        'Connect safely with new friends on social media',
        'Provide feedback to help improve the community',
        'Check in with your emergency contact'
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-red-100 text-red-700 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Your Safety is Our Priority
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Safety Guidelines
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We take community safety seriously. Learn how we protect our users and best practices for a safe experience.
          </p>
        </div>
      </section>

      {/* Safety Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Our Safety Measures
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guidelines.map((guide, index) => {
              const IconComponent = guide.icon;
              return (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${guide.color}`} />
                  
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{guide.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600">{guide.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety Tips Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Best Practices for Your Safety
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tips.map((section, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          ✓
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Red Flags Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Warning Signs to Watch For
          </h2>
          
          <Card className="border-red-200 border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Report These Issues Immediately
              </CardTitle>
              <CardDescription>
                If you encounter any of the following, please report it to our support team right away.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  'Hosts asking for payment outside the platform',
                  'Inappropriate or offensive messages',
                  'Requests for personal information (SSN, address)',
                  'Threats, harassment, or bullying behavior',
                  'Misrepresented event details',
                  'Unsafe locations or activities',
                  'No-show or canceled events without notice',
                  'Suspicious profile information',
                ].map((warning, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{warning}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy & Data Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-900">
            Your Privacy Matters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">What We Protect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Payment information (encrypted)',
                    'Personal contact details',
                    'Location data (optional)',
                    'Event attendance history',
                    'Profile information'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <Lock className="w-4 h-4 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Your Control</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Control who can contact you',
                    'Block and report users',
                    'Manage privacy settings',
                    'Delete your account',
                    'Export your data'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <Shield className="w-4 h-4 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Need Help?
          </h2>
          <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
            Our support team is available 24/7 to help with any safety concerns or questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="gap-2">
                Contact Support <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/help">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Visit Help Center
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
