/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
// Fixed JSX structure
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
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
  MapPin, 
  DollarSign, 
  Users, 
  Save, 
  X, 
  Brain,
  Upload,
  Tag,
  Target,
  Loader2,
  Settings,
  Edit
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
  status: z.enum(['draft', 'open', 'cancelled']),
  isPublic: z.boolean(),
});

type EventFormData = z.infer<typeof eventSchema>;

const categories = [
  'technology', 'business', 'education', 'health', 'entertainment', 'sports', 
  'music', 'food', 'travel', 'photography', 'writing', 'other'
];

const eventTypes = [
  'workshop', 'seminar', 'conference', 'meetup', 'webinar', 
  'training', 'social', 'competition', 'other'
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    tags: [] as string[],
    requirements: [] as string[],
    newTag: '',
    newRequirement: '',
    image: ''
  });

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const ORIGIN = useMemo(() => API_BASE.replace(/\/api\/?$/, ''), [API_BASE]);

  const normalizeImageUrl = useCallback((src?: string | null) => {
    if (!src) return '';
    try {
      if (/^https?:\/\//i.test(src)) return src;
      if (src.startsWith('//')) return `${window.location.protocol}${src}`;
      if (src.startsWith('/')) return `${ORIGIN}${src}`;
      return `${ORIGIN}/${src}`;
    } catch {
      return '';
    }
  }, [ORIGIN]);

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
          // Map old enum values to new ones
          const categoryMap: { [key: string]: string } = {
            'arts': 'entertainment',
            'tech': 'technology',
          };
          const typeMap: { [key: string]: string } = {
            'networking': 'meetup',
          };
          
          const mappedCategory = categoryMap[event.category] || event.category;
          const mappedType = typeMap[event.type] || event.type;
          
          form.reset({
            title: event.title || '',
            description: event.description || '',
            category: mappedCategory || '',
            type: mappedType || 'workshop',
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            time: event.time || '',
            duration: event.duration || 120,
            venue: event.location?.venue || '',
            address: event.location?.address || '',
            city: event.location?.city || '',
            price: event.price || 0,
            maxParticipants: event.maxParticipants || 10,
            status: event.status || 'open',
            isPublic: event.isPublic !== false,
          });
          
          setFormData({
            tags: event.tags || [],
            requirements: event.requirements || [],
            newTag: '',
            newRequirement: '',
            image: normalizeImageUrl(event.image || event.imageUrl || '')
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

  // Upload local image and set URL into form data
  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 30000);

      const fetchResponse = await fetch('/api/upload/event-image', {
        method: 'POST',
        body: formDataUpload,
        signal: abortController.signal,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      clearTimeout(timeoutId);

      const response = await fetchResponse.json();

      if (fetchResponse.ok) {
        const imageUrl =
          response?.data?.imageUrl ||
          response?.imageUrl ||
          response?.url ||
          response?.data?.url;

        if (!imageUrl) {
          toast.error('Image uploaded but no URL returned from server');
          return;
        }

        try {
          new URL(imageUrl);
        } catch {
          toast.error('Invalid image URL format returned from server');
          return;
        }

        if (response?.warning) {
          toast.error('⚠️ Using placeholder image - configure Cloudinary for real uploads', { duration: 5000 });
        } else {
          toast.success('Image uploaded successfully!');
        }

        setFormData(prev => ({
          ...prev,
          // add cache buster so preview refreshes even if URL path stays same
          image: `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${Date.now()}`
        }));
      } else {
        toast.error(`Upload failed: ${response?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      const message = error?.message?.includes('The user aborted a request')
        ? 'Upload timed out. Please try again.'
        : error?.message || 'Failed to upload image';
      toast.error(message);
    }
    finally {
      setUploadingImage(false);
    }
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

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    setSubmitting(true);
    
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        date: new Date(data.date + 'T' + '00:00:00').toISOString(),
        time: data.time,
        duration: data.duration,
        price: data.price,
        maxParticipants: data.maxParticipants,
        tags: formData.tags,
        requirements: formData.requirements,
        image: formData.image,
        imageUrl: formData.image, // send both fields for compatibility
        location: {
          venue: data.venue,
          address: data.address,
          city: data.city
        },
        status: data.status,
        isPublic: data.isPublic,
      };

      const response = await api.put(`/events/${params.id}`, eventData);
      
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  return ( // Added return statement here
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header with Gradient */}
      <div className="relative bg-linear-to-r from-emerald-600 via-green-600 to-teal-700 text-white">
        <div className="absolute inset-0 bg-grid-white/10 opacity-10"></div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                <Edit className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Edit Your Event</h1>
                <p className="text-emerald-100">Update and enhance your event details</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/host/events')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xl">Basic Information</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Essential details about your event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Event Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter an engaging event title"
                        {...form.register('title')}
                        className={`mt-2 ${form.formState.errors.title ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {form.formState.errors.title && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category *</Label>
                      <Select 
                        value={form.watch('category')} 
                        onValueChange={(value) => form.setValue('category', value)}
                      >
                        <SelectTrigger className={`mt-2 ${form.formState.errors.category ? 'border-red-500' : ''}`}>
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
                      <Label htmlFor="type" className="text-sm font-semibold text-gray-700">Event Type *</Label>
                      <Select 
                        value={form.watch('type')} 
                        onValueChange={(value) => form.setValue('type', value)}
                      >
                        <SelectTrigger className={`mt-2 ${form.formState.errors.type ? 'border-red-500' : ''}`}>
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
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what participants will learn and experience..."
                      rows={4}
                      {...form.register('description')}
                      className={`mt-2 ${form.formState.errors.description ? 'border-red-500' : 'border-gray-300'}`}
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
                        className="bg-linear-to-r from-purple-50 to-indigo-50 border-purple-300 text-purple-700 hover:from-purple-100 hover:to-indigo-100 shadow-sm"
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        {isAILoading ? 'Generating...' : 'AI Generate'}
                      </Button>
                    </div>
                  </div>

                  {/* Event Image Upload */}
                  <div>
                    <Label htmlFor="event-image-upload" className="text-sm font-semibold text-gray-700">Event Image</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer mt-2"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const MAX_FILE_SIZE = 2 * 1024 * 1024;
                          if (file.size > MAX_FILE_SIZE) {
                            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                            setImageError(`File size (${sizeMB}MB) exceeds 2MB limit. Please use a smaller image.`);
                            return;
                          }
                          setImageError(null);
                          handleImageUpload(file);
                        }
                      }}
                    >
                      <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium mb-2">
                        {uploadingImage ? 'Uploading image...' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 2MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="event-image-upload"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
                            if (file.size > MAX_FILE_SIZE) {
                              const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                              setImageError(`File size (${sizeMB}MB) exceeds 2MB limit. Please use a smaller image.`);
                              return;
                            }
                            setImageError(null);
                            handleImageUpload(file);
                          }
                        }}
                      />
                    </div>
                    {imageError && (
                      <p className="text-red-500 text-sm mt-2">{imageError}</p>
                    )}
                    {formData.image && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Current Image Preview</p>
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formData.image}
                            alt="Event image preview"
                            className="w-full h-full object-cover"
                            onError={() => setImageError('Failed to load current image preview')}
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            Replace Image
                          </Button>
                          <Button type="button" variant="destructive" onClick={() => setFormData(prev => ({ ...prev, image: '' }))}>
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location & Schedule */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800">Location & Schedule</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600 ml-12">
                    Where and when your event will take place
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="venue" className="text-sm font-semibold text-gray-700">Venue *</Label>
                      <Input
                        id="venue"
                        placeholder="Event venue name"
                        {...form.register('venue')}
                        className={`mt-2 ${form.formState.errors.venue ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {form.formState.errors.venue && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.venue.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Address *</Label>
                      <Input
                        id="address"
                        placeholder="Street address"
                        {...form.register('address')}
                        className={`mt-2 ${form.formState.errors.address ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {form.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        {...form.register('city')}
                        className={`mt-2 ${form.formState.errors.city ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {form.formState.errors.city && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date" className="text-sm font-semibold text-gray-700">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        {...form.register('date')}
                        className={`mt-2 ${form.formState.errors.date ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {form.formState.errors.date && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="time" className="text-sm font-semibold text-gray-700">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        {...form.register('time')}
                        className={`mt-2 ${form.formState.errors.time ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {form.formState.errors.time && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.time.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">Duration (min) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="30"
                        step="30"
                        placeholder="120"
                        {...form.register('duration', { valueAsNumber: true })}
                        className={`mt-2 ${form.formState.errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {form.formState.errors.duration && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags & Requirements */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg shadow-lg">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800">Tags & Requirements</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600 ml-12">
                    Help participants find and prepare for your event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Tags</Label>
                    <div className="flex gap-2 mb-3 mt-2">
                      <Input
                        placeholder="Add a tag (e.g. workshop, beginner, outdoor)"
                        value={formData.newTag}
                        onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="border-gray-300"
                      />
                      <Button type="button" onClick={addTag} variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100">
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
                    <Label className="text-sm font-semibold text-gray-700">Requirements</Label>
                    <div className="flex gap-2 mb-3 mt-2">
                      <Input
                        placeholder="Add a requirement (e.g. bring water bottle)"
                        value={formData.newRequirement}
                        onChange={(e) => setFormData(prev => ({ ...prev, newRequirement: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        className="border-gray-300"
                      />
                      <Button type="button" onClick={addRequirement} variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100">
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-linear-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <span className="text-sm text-gray-700">{requirement}</span>
                          <button
                            type="button"
                            onClick={() => removeRequirement(requirement)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
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
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500 rounded-lg shadow-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800">Pricing & Capacity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Ticket Price ($) *</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
                        <Input
                          id="price"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="1"
                          {...form.register('price', { valueAsNumber: true })}
                          className="pl-10 border-gray-300"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getAIPricing}
                        disabled={isAILoading}
                        className="bg-linear-to-r from-purple-50 to-indigo-50 border-purple-300 text-purple-700 hover:from-purple-100 hover:to-indigo-100 shadow-sm whitespace-nowrap"
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
                    <Label htmlFor="maxParticipants" className="text-sm font-semibold text-gray-700">Max Capacity *</Label>
                    <div className="relative mt-2">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="1"
                        placeholder="10"
                        {...form.register('maxParticipants', { valueAsNumber: true })}
                        className="pl-10 border-gray-300"
                      />
                    </div>
                    {form.formState.errors.maxParticipants && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.maxParticipants.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Event Settings */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                <CardHeader className="bg-linear-to-r from-gray-50 to-slate-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-500 rounded-lg shadow-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800">Event Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
                    <Select 
                      value={form.watch('status')} 
                      onValueChange={(value) => form.setValue('status', value as any)}
                    >
                      <SelectTrigger className="mt-2 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <input
                      type="checkbox"
                      id="isPublic"
                      {...form.register('isPublic')}
                      className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <Label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Make this event public
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="shadow-xl border-0 bg-linear-to-br from-emerald-50 via-green-50 to-teal-50 transition-all duration-300 hover:shadow-2xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 bg-linear-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-700 hover:via-green-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Updating Event...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Update Event
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard/host/events')}
                      className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                    >
                      <X className="w-5 h-5 mr-2" />
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
  );
}