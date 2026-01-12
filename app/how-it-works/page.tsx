'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Search,
  Users,
  Calendar,
  Share2,
  MessageSquare,
  Zap,
  Heart,
  Shield,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Search & Discover',
      description: 'Browse events by category, location, or date. Find activities that match your interests and schedule.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Calendar,
      title: 'Check Details',
      description: 'Review event details, date, time, location, and what to bring. Read reviews from other participants.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Join the Community',
      description: 'Sign up for events and connect with other attendees. See who else is going and what they think.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: MessageSquare,
      title: 'Connect & Chat',
      description: 'Message event organizers and other participants. Ask questions and coordinate details before the event.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Heart,
      title: 'Attend & Enjoy',
      description: 'Show up to the event and have an amazing time. Make new friends and create lasting memories.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Share2,
      title: 'Share & Review',
      description: 'Leave a review and rating. Share photos and tell others about your experience.',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Easy to Use',
      description: 'Intuitive interface makes finding and joining events simple and quick.'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Verified hosts, secure payments, and user reviews keep the community safe.'
    },
    {
      icon: TrendingUp,
      title: 'Growing Community',
      description: 'Join thousands of people discovering new hobbies and making friends.'
    },
    {
      icon: Heart,
      title: 'Diverse Events',
      description: 'From music and sports to education and dining - find your passion.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            How EventHub Works
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover a simple way to find, join, and enjoy events with people who share your interests.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            6 Simple Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color}`} />
                  
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-300 mb-2">{index + 1}</div>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose EventHub?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'Is it free to use EventHub?',
                a: 'Yes! Creating an account and browsing events is completely free. Some events may have participation fees set by their organizers.'
              },
              {
                q: 'How do I create an event?',
                a: 'Become a host by clicking "Become a Host" in your profile. Once verified, you can create and manage events with full control over dates, locations, and pricing.'
              },
              {
                q: 'Is my payment information secure?',
                a: 'Absolutely. We use industry-standard encryption and Stripe for secure payment processing. Your payment information is never stored on our servers.'
              },
              {
                q: 'Can I cancel my registration?',
                a: 'Yes, you can cancel your registration anytime before the event. Cancellation policies may vary by event organizer.'
              },
              {
                q: 'How do I report an issue?',
                a: 'Use the "Report Issue" option in our support section or contact us directly. We take all reports seriously and respond promptly.'
              },
              {
                q: 'What if I have more questions?',
                a: 'Visit our Help Center or Contact Us page for more information. Our support team is available 24/7 to assist you.'
              },
            ].map((faq, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
            Join thousands of people discovering new experiences and making meaningful connections.
          </p>
          <Link href="/events">
            <Button size="lg" variant="secondary" className="gap-2">
              Explore Events <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
