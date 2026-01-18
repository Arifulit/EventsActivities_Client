/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Upload
} from 'lucide-react';

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'music',
    date: '',
    time: '',
    duration: '60',
    location: {
      venue: '',
      address: '',
      city: '',
      coordinates: { lat: 0, lng: 0 }
    },
    maxParticipants: '50',
    price: '0',
    paymentType: 'free',
    tags: '',
    image: ''
  });

  const categories = [
    'music',
    'gaming',
    'sports',
    'education',
    'food',
    'photography',
    'travel',
    'technology',
    'other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.date || !formData.time) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Here you would send the data to your API
      // const response = await api.post('/events', formData);

      toast.success('Event created successfully!');
      router.push('/dashboard/host/events');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create event';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="gap-2 mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Create a New Event
          </h1>
          <p className="text-lg text-gray-600">
            Share your passion and bring people together
          </p>
        </div>

        {/* Main Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 border-b">
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Fill in the information about your event
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Section */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Summer Music Festival"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your event in detail..."
                    required
                    rows={6}
                    className="w-full resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags <span className="text-gray-500 text-xs">(comma separated)</span>
                    </label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="fun, outdoor, beginner-friendly"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date & Time
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="60"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                
                <div className="space-y-2">
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                    Venue Name
                  </label>
                  <Input
                    id="venue"
                    name="location.venue"
                    value={formData.location.venue}
                    onChange={handleChange}
                    placeholder="e.g., Central Park"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <Input
                    id="address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    placeholder="e.g., 123 Main Street"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <Input
                    id="city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    placeholder="e.g., New York"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Participants & Pricing Section */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants & Pricing
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                      Max Participants
                    </label>
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={handleChange}
                      placeholder="50"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
                      Payment Type
                    </label>
                    <select
                      id="paymentType"
                      name="paymentType"
                      value={formData.paymentType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                {formData.paymentType === 'paid' && (
                  <div className="space-y-2">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price per Participant ($)
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Image Section */}
              <div className="space-y-4 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Event Image
                </h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Drag and drop your image here</p>
                  <p className="text-gray-500 text-sm mb-4">or click to browse</p>
                  <Button type="button" variant="outline" size="sm">
                    Choose Image
                  </Button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-8 border-0 shadow-md bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p>✓ Use a clear, descriptive title that tells people what your event is about</p>
            <p>✓ Include relevant tags to help people discover your event</p>
            <p>✓ Upload a high-quality image that represents your event</p>
            <p>✓ Be realistic about the number of participants you can accommodate</p>
            <p>✓ Set a competitive price if you're charging for your event</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
