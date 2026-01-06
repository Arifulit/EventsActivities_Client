'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Tag
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  hostId: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
  };
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  image: string;
  images: string[];
  requirements: string[];
  tags: string[];
  status: string;
  isPublic: boolean;
  participants: string[];
  waitingList: string[];
  location: {
    venue: string;
    address: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminEditEventPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    date: '',
    time: '',
    duration: 0,
    maxParticipants: 0,
    price: 0,
    status: '',
    isPublic: true,
    location: {
      venue: '',
      address: '',
      city: ''
    },
    requirements: [] as string[],
    tags: [] as string[]
  });

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, user, router]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/admin/events/${eventId}`);
      const eventData: Event = response.data.data.event;
      setEvent(eventData);
      
      // Format date for input field (YYYY-MM-DD)
      const formattedDate = format(parseISO(eventData.date), 'yyyy-MM-dd');
      
      setFormData({
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        category: eventData.category,
        date: formattedDate,
        time: eventData.time,
        duration: eventData.duration,
        maxParticipants: eventData.maxParticipants,
        price: eventData.price,
        status: eventData.status,
        isPublic: eventData.isPublic,
        location: {
          venue: eventData.location.venue,
          address: eventData.location.address,
          city: eventData.location.city
        },
        requirements: eventData.requirements,
        tags: eventData.tags
      });
    } catch (error: any) {
      console.error('Failed to fetch event:', error);
      if (error.response?.status === 404) {
        toast.error('Event not found');
      } else if (error.response?.status === 403) {
        toast.error('Access denied: You do not have permission to edit this event');
      } else {
        toast.error('Failed to load event: Server error');
      }
      router.push('/dashboard/admin/events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field: 'requirements' | 'tags', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // Convert date back to ISO format
      const isoDate = new Date(formData.date).toISOString();
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        date: isoDate,
        time: formData.time,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        price: formData.price,
        status: formData.status,
        isPublic: formData.isPublic,
        location: formData.location,
        requirements: formData.requirements,
        tags: formData.tags
      };

      const response = await api.put(`/admin/events/${eventId}`, updateData);
      
      if (response.data?.success) {
        toast.success('Event updated successfully');
        router.push(`/dashboard/admin/events/${eventId}`);
      } else {
        toast.error('Failed to update event');
      }
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event: Server error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-blue-100 rounded-full mx-auto"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Loading event...</div>
          <div className="text-sm text-gray-500 mt-1">Please wait while we fetch event information</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
          <p className="text-gray-600 mb-4">The event you're trying to edit doesn't exist</p>
          <Button onClick={() => router.push('/dashboard/admin/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.back()} 
                    className="hover:bg-gray-100 transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Events
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      Edit Event
                    </h1>
                    <p className="text-gray-600 mt-2">Update event information and manage settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6 bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter event description"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Event Type</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="meetup">Meetup</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule & Location */}
              <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6 bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    Schedule & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                        placeholder="120"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 0)}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        value={formData.location.venue}
                        onChange={(e) => handleInputChange('location.venue', e.target.value)}
                        placeholder="Event venue"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.location.address}
                        onChange={(e) => handleInputChange('location.address', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.location.city}
                        onChange={(e) => handleInputChange('location.city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Settings */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Pricing & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="isPublic">Public Event</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements & Tags */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Requirements & Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                    <Input
                      id="requirements"
                      value={formData.requirements.join(', ')}
                      onChange={(e) => handleArrayChange('requirements', e.target.value)}
                      placeholder="Laptop required, Basic programming knowledge"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleArrayChange('tags', e.target.value)}
                      placeholder="tech, workshop, web-development"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
