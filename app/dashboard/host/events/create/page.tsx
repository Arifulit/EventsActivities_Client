'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, Clock, Upload, AlertCircle, Plus, X, Brain, Sparkles } from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [aiSuggestionLoaded, setAiSuggestionLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'workshop',
    date: '',
    time: '',
    duration: 120,
    venue: '',
    address: '',
    city: '',
    price: 0,
    maxParticipants: 10,
    tags: [] as string[],
    requirements: [] as string[],
    newTag: '',
    newRequirement: '',
    image: ''
  });

  // Load AI suggestion if available
  useEffect(() => {
    const savedSuggestion = sessionStorage.getItem('aiSuggestion');
    if (savedSuggestion) {
      try {
        const suggestion = JSON.parse(savedSuggestion);
        setFormData(prev => ({
          ...prev,
          title: suggestion.title || prev.title,
          description: suggestion.description || prev.description,
          category: suggestion.category || prev.category,
          type: suggestion.type || prev.type,
          date: suggestion.date || prev.date,
          time: suggestion.time || prev.time,
          duration: suggestion.duration || prev.duration,
          price: suggestion.price || prev.price,
          maxParticipants: suggestion.maxParticipants || prev.maxParticipants,
          tags: suggestion.tags || prev.tags,
          requirements: suggestion.requirements || prev.requirements
        }));
        setAiSuggestionLoaded(true);
        toast.success('AI suggestion loaded! You can modify it as needed.');
        
        // Clear the suggestion from sessionStorage
        sessionStorage.removeItem('aiSuggestion');
      } catch (error) {
        console.error('Failed to load AI suggestion:', error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Maximum participants must be at least 1';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        time: formData.time,
        duration: formData.duration,
        price: formData.price,
        maxParticipants: formData.maxParticipants,
        location: {
          venue: formData.venue,
          address: formData.address,
          city: formData.city
        },
        tags: formData.tags,
        requirements: formData.requirements,
        image: formData.image,
        images: [],
        status: 'open', // Required field, default to open
        isPublic: true,
        currentParticipants: 0,
        participants: [],
        waitingList: []
      };

      const response = await api.post('/events', eventData);
      
      toast.success('Event created successfully!');
      router.push('/dashboard/host/events');
      
    } catch (error: any) {
      console.error('Failed to create event:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setErrors(errorMessages.reduce((acc: any, msg: string, index: number) => {
          acc[`server_${index}`] = msg;
          return acc;
        }, {}));
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create event. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIContent = async () => {
    setIsAILoading(true);
    
    try {
      // Call AI service for content generation
      const response = await api.post('/ai/generate-content', {
        title: formData.title,
        category: formData.category,
        type: formData.type,
        tags: formData.tags,
        requirements: formData.requirements
      });
      
      const aiContent = response.data.data;
      
      setFormData(prev => ({
        ...prev,
        title: aiContent.title || prev.title,
        description: aiContent.description || prev.description,
        tags: aiContent.tags || prev.tags,
        requirements: aiContent.requirements || prev.requirements
      }));
      
      toast.success('AI content generated successfully!');
    } catch (error: any) {
      console.error('Failed to generate AI content:', error);
      toast.error(error.response?.data?.message || 'Failed to generate AI content');
    } finally {
      setIsAILoading(false);
    }
  };

  const getAIPricing = async () => {
    setIsAILoading(true);
    
    try {
      // Call AI service for pricing recommendation
      const response = await api.post('/ai/pricing-suggestion', {
        category: formData.category,
        duration: formData.duration,
        basePrice: formData.price,
        location: formData.city
      });
      
      const { suggestedPrice } = response.data.data;
      
      setFormData(prev => ({
        ...prev,
        price: suggestedPrice
      }));
      
      toast.success(`AI suggests $${suggestedPrice} based on market analysis`);
    } catch (error: any) {
      console.error('Failed to get AI pricing:', error);
      toast.error(error.response?.data?.message || 'Failed to get AI pricing recommendation');
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          {aiSuggestionLoaded && (
            <Badge className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={generateAIContent}
            disabled={isAILoading}
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isAILoading ? 'Generating...' : 'AI Generate'}
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="music">Music & Concerts</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="sports">Sports & Fitness</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="food">Food & Drink</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Venue</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="venue"
                      name="venue"
                      placeholder="Event venue"
                      value={formData.venue}
                      onChange={handleChange}
                      className={`pl-10 ${errors.venue ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {errors.venue && (
                    <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Full address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Ticket Price ($)</Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleChange}
                        className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={getAIPricing}
                      disabled={isAILoading}
                      className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 whitespace-nowrap"
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      AI Price
                    </Button>
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Set 0 for free events</p>
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Max Capacity</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      min="1"
                      placeholder="100"
                      value={formData.maxParticipants}
                      onChange={handleChange}
                      className={`pl-10 ${errors.maxParticipants ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {errors.maxParticipants && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Click to upload event image
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File uploaded:', file);
                        // Handle file upload here
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Event...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
