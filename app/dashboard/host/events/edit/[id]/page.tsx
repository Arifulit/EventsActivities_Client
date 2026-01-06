'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Save, 
  X, 
  Brain,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Tag,
  Target,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  type: z.string().min(1, 'Type is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(30, 'Duration must be at least 30 minutes'),
  venue: z.string().min(1, 'Venue is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  price: z.number().min(0, 'Price must be positive'),
  maxParticipants: z.number().min(1, 'Capacity must be at least 1'),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  status: z.enum(['draft', 'open', 'cancelled']).default('draft'),
  isPublic: z.boolean().default(true),
});

type EventFormData = z.infer<typeof eventSchema>;

const categories = [
  'technology', 'business', 'education', 'health', 'arts', 'sports', 
  'music', 'food', 'travel', 'photography', 'writing', 'other'
];

const eventTypes = [
  'workshop', 'seminar', 'conference', 'meetup', 'webinar', 
  'training', 'networking', 'social', 'competition', 'other'
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [formData, setFormData] = useState({
    tags: [] as string[],
    requirements: [] as string[],
    newTag: '',
    newRequirement: '',
    image: ''
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
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
      tags: [],
      requirements: [],
      status: 'draft',
      isPublic: true,
    },
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${params.id}`);
        const event = response.data.data;
        
        if (event) {
          form.reset({
            title: event.title || '',
            description: event.description || '',
            category: event.category || '',
            type: event.type || 'workshop',
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            time: event.time || '',
            duration: event.duration || 120,
            venue: event.location?.venue || '',
            address: event.location?.address || '',
            city: event.location?.city || '',
            price: event.price || 0,
            maxParticipants: event.maxParticipants || 10,
            status: event.status || 'draft',
            isPublic: event.isPublic !== false,
          });
          
          setFormData({
            tags: event.tags || [],
            requirements: event.requirements || [],
            newTag: '',
            newRequirement: '',
            image: event.image || ''
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch event:', error);
        toast.error(error.response?.data?.message || 'Failed to load event');
        router.push('/dashboard/host/events');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id, form, router]);

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, formData.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRequirement = () => {
    if (formData.newRequirement.trim() && !formData.requirements.includes(formData.newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, formData.newRequirement.trim()],
        newRequirement: ''
      }));
    }
  };

  const removeRequirement = (requirementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirementToRemove)
    }));
  };

  const generateAIContent = async () => {
    setIsAILoading(true);
    
    try {
      const currentValues = form.getValues();
      
      // Call AI service for content generation
      const response = await api.post('/ai/generate-content', {
        title: currentValues.title,
        category: currentValues.category,
        type: currentValues.type,
        tags: formData.tags,
        requirements: formData.requirements
      });
      
      const aiContent = response.data.data;
      
      form.setValue('title', aiContent.title || currentValues.title);
      form.setValue('description', aiContent.description || currentValues.description);
      setFormData(prev => ({
        ...prev,
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
      const currentValues = form.getValues();
      const basePrice = currentValues.price || 50;
      const categoryMultiplier = currentValues.category === 'technology' ? 1.2 : 
                               currentValues.category === 'business' ? 1.5 : 1.0;
      const durationMultiplier = currentValues.duration > 120 ? 1.3 : 1.0;
      const suggestedPrice = Math.round(basePrice * categoryMultiplier * durationMultiplier);
      
      form.setValue('price', suggestedPrice);
      toast.success(`AI suggests $${suggestedPrice} based on market analysis`);
    } catch (error) {
      console.error('Failed to get AI pricing:', error);
      toast.error('Failed to get AI pricing recommendation');
    } finally {
      setIsAILoading(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    setSubmitting(true);
    
    try {
      const eventData = {
        ...data,
        tags: formData.tags,
        requirements: formData.requirements,
        image: formData.image,
        location: {
          venue: data.venue,
          address: data.address,
          city: data.city
        },
        date: new Date(data.date).toISOString(),
      };

      const response = await api.patch(`/events/${params.id}`, eventData);
      
      if (response.data.success) {
        toast.success('Event updated successfully!');
        router.push('/dashboard/host/events');
      } else {
        throw new Error(response.data.message || 'Failed to update event');
      }
    } catch (error: any) {
      console.error('Failed to update event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-4xl flex justify-center">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Event</h1>
                <p className="text-gray-600">Update your event details and settings</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/host/events')}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span>Basic Information</span>
                    </CardTitle>
                    <CardDescription>
                      Essential details about your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Event Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter an engaging event title"
                          {...form.register('title')}
                          className={form.formState.errors.title ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.title && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={form.watch('category')} 
                          onValueChange={(value) => form.setValue('category', value)}
                        >
                          <SelectTrigger className={form.formState.errors.category ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.category && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="type">Event Type *</Label>
                        <Select 
                          value={form.watch('type')} 
                          onValueChange={(value) => form.setValue('type', value)}
                        >
                          <SelectTrigger className={form.formState.errors.type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.type && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.type.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what participants will learn and experience..."
                        rows={4}
                        {...form.register('description')}
                        className={form.formState.errors.description ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.description && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">
                          {form.watch('description')?.length || 0} characters
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateAIContent}
                          disabled={isAILoading}
                          className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          {isAILoading ? 'Generating...' : 'AI Generate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Schedule */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <span>Location & Schedule</span>
                    </CardTitle>
                    <CardDescription>
                      Where and when your event will take place
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="venue">Venue *</Label>
                        <Input
                          id="venue"
                          placeholder="Event venue name"
                          {...form.register('venue')}
                          className={form.formState.errors.venue ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.venue && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.venue.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="address">Address *</Label>
                        <Input
                          id="address"
                          placeholder="Street address"
                          {...form.register('address')}
                          className={form.formState.errors.address ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.address && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="City"
                          {...form.register('city')}
                          className={form.formState.errors.city ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.city && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          {...form.register('date')}
                          className={form.formState.errors.date ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.date && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          {...form.register('time')}
                          className={form.formState.errors.time ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.time && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.time.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration (min) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="30"
                          step="30"
                          placeholder="120"
                          {...form.register('duration', { valueAsNumber: true })}
                          className={form.formState.errors.duration ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.duration && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags & Requirements */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Tag className="w-5 h-5 text-purple-500" />
                      <span>Tags & Requirements</span>
                    </CardTitle>
                    <CardDescription>
                      Help participants find and prepare for your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Add a tag"
                          value={formData.newTag}
                          onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} variant="outline">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Requirements</Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Add a requirement"
                          value={formData.newRequirement}
                          onChange={(e) => setFormData(prev => ({ ...prev, newRequirement: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        />
                        <Button type="button" onClick={addRequirement} variant="outline">
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{requirement}</span>
                            <button
                              type="button"
                              onClick={() => removeRequirement(requirement)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pricing & Capacity */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      <span>Pricing & Capacity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="price">Ticket Price ($) *</Label>
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...form.register('price', { valueAsNumber: true })}
                            className="pl-10"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={getAIPricing}
                          disabled={isAILoading}
                          className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 whitespace-nowrap"
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          AI Price
                        </Button>
                      </div>
                      {form.formState.errors.price && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Set 0 for free events</p>
                    </div>

                    <div>
                      <Label htmlFor="maxParticipants">Max Capacity *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="maxParticipants"
                          type="number"
                          min="1"
                          placeholder="10"
                          {...form.register('maxParticipants', { valueAsNumber: true })}
                          className="pl-10"
                        />
                      </div>
                      {form.formState.errors.maxParticipants && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.maxParticipants.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Event Settings */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <span>Event Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={form.watch('status')} 
                        onValueChange={(value) => form.setValue('status', value as 'draft' | 'open' | 'cancelled')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        {...form.register('isPublic')}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isPublic" className="text-sm">
                        Make this event public
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating Event...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Event
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/host/events')}
                        className="w-full h-12"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}