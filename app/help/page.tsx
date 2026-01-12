'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Search,
  BookOpen,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Users,
  DollarSign,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function HelpPage() {
  const categories = [
    {
      icon: Search,
      title: 'Getting Started',
      description: 'Learn how to create an account and explore events',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Joining Events',
      description: 'Find and register for events that interest you',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: DollarSign,
      title: 'Payments & Booking',
      description: 'Understand how payments and bookings work',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Safety & Security',
      description: 'Keep your account and personal information safe',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Zap,
      title: 'Hosting Events',
      description: 'Create and manage your own events',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: AlertCircle,
      title: 'Troubleshooting',
      description: 'Fix common issues and problems',
      color: 'from-pink-500 to-pink-600'
    },
  ];

  const faqs = [
    {
      category: 'Account & Profile',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Join Community" button on the homepage, fill in your information, and verify your email address.'
        },
        {
          q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox.'
        },
        {
          q: 'Can I change my email address?',
          a: 'Yes, go to your profile settings and update your email. You\'ll need to verify the new email address.'
        },
        {
          q: 'How do I delete my account?',
          a: 'Visit your account settings and select "Delete Account". Note: This action is permanent.'
        },
      ]
    },
    {
      category: 'Events & Registration',
      questions: [
        {
          q: 'How do I find events near me?',
          a: 'Use the search and filter options on the Events page to filter by location, date, category, and price.'
        },
        {
          q: 'Can I register for multiple events?',
          a: 'Yes! You can join as many events as you want. Check your calendar to manage your bookings.'
        },
        {
          q: 'What if an event is full?',
          a: 'You can join the waitlist, and we\'ll notify you if a spot becomes available.'
        },
        {
          q: 'Can I cancel my registration?',
          a: 'Yes, you can cancel anytime before the event. Refund policies depend on the host\'s settings.'
        },
      ]
    },
    {
      category: 'Payments',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, Amex) and digital payment methods through Stripe.'
        },
        {
          q: 'Is my payment information safe?',
          a: 'Yes, we use industry-standard encryption and PCI compliance. We never store full card details on our servers.'
        },
        {
          q: 'How do I get a refund?',
          a: 'Refunds depend on the host\'s cancellation policy. Check the event details for specific refund terms.'
        },
        {
          q: 'Why was my payment declined?',
          a: 'This could be due to insufficient funds, expired card, or security verification. Contact your bank to check.'
        },
      ]
    },
    {
      category: 'Hosting',
      questions: [
        {
          q: 'How do I become a host?',
          a: 'Click "Become a Host" in your profile, complete your verification, and you\'ll be able to create events.'
        },
        {
          q: 'What information do I need to create an event?',
          a: 'You\'ll need the event title, description, date, time, location, capacity, and price (if applicable).'
        },
        {
          q: 'Can I edit my event after publishing?',
          a: 'Yes, you can edit most details anytime. Major changes might require participant notifications.'
        },
        {
          q: 'How do I receive payments for my events?',
          a: 'Payments are automatically deposited to your connected bank account. See your Earnings page for details.'
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find answers to common questions and get the help you need.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Browse by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-12">
            {faqs.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                  {section.category}
                </h3>
                
                <div className="space-y-4">
                  {section.questions.map((faq, idx) => (
                    <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-900 flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {faq.q}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 pl-7">{faq.a}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Still Need Help?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Contact our support team directly and we'll help you out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                Contact Support <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/safety">
              <Button size="lg" variant="outline">
                View Safety Guidelines
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
