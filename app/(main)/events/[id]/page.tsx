/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  MapPinIcon,
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';
import JoinEventButton from '@/app/components/events/JoinEventButton';
import { Event } from '@/app/lib/events';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  useAuth();
  const eventId = params.id as string;

  // Debug: Log the extracted event ID
  console.log('🎯 Event Detail Page - Event ID Extraction:');
  console.log('  - params:', params);
  console.log('  - eventId:', eventId);
  console.log('  - eventId type:', typeof eventId);
  console.log('  - eventId length:', eventId?.length || 'undefined');

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const ORIGIN = useMemo(() => API_BASE.replace(/\/api\/?$/, ''), [API_BASE]);

  const normalizeImageUrl = useCallback((raw?: string | null) => {
    if (!raw) return '';
    try {
      let src = String(raw).trim().replace(/\\/g, '/');
      src = src.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      if (/^data:image\//i.test(src)) return src;
      if (/^https?:\/\//i.test(src)) return src;
      if (src.startsWith('//')) return `${window.location.protocol}${src}`;
      if (src.startsWith('/')) return `${ORIGIN}${src}`;
      return `${ORIGIN}/${src}`;
    } catch {
      return '';
    }
  }, [ORIGIN]);

  useEffect(() => {
    if (eventId) {
      void fetchEventDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📡 Fetching event details for ID:', eventId);
      console.log('📍 API Base URL:', API_BASE);
      console.log('📍 Origin:', ORIGIN);

      if (!eventId || eventId === 'undefined') {
        throw new Error('Invalid event ID: ' + eventId);
      }

      // Verify event ID format (should be 24-char MongoDB ObjectId)
      const isValidId = /^[0-9a-fA-F]{24}$/.test(eventId);
      console.log('✅ Event ID format valid:', isValidId, '- ', eventId);
      
      const response = await api.get(`/events/${eventId}`);
      
      console.log('📥 Event details response status:', response.status);
      console.log('📥 Event details response:', response.data);
      
      if (response.data.success && response.data.data) {
        setEvent(response.data.data);
        console.log('✅ Event loaded successfully:', response.data.data.title);
        console.log('   Event Image:', response.data.data.image);
        console.log('   Event Host:', response.data.data.hostId);
      } else if (response.data.data) {
        // Handle case where API doesn't set success flag but returns data
        setEvent(response.data.data);
        console.log('✅ Event loaded (no success flag):', response.data.data.title);
      } else {
        console.error('❌ API returned success:false', response.data);
        setError(response.data.message || 'Failed to load event details');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      console.error('❌ Error fetching event details:');
      console.error('   Error type:', error instanceof Error ? 'Error' : typeof error);
      console.error('   Error message:', apiError.message || error);
      console.error('   Error response:', apiError.response?.data);
      console.error('   Event ID that failed:', eventId);
      console.error('   Full error object:', error);
      
      const errorMsg = apiError.response?.data?.message || 
                      apiError.response?.data?.error ||
                      apiError.message ||
                      'Failed to load event';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset image error when event changes
  useEffect(() => {
    setImageError(false);
  }, [event?.image]);

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {error || 'Event not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              The event you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push('/events')} className="w-full">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spotsAvailable = event.maxParticipants - event.currentParticipants;
  const spotsPercentage = (event.currentParticipants / event.maxParticipants) * 100;
  const isEventFull = spotsAvailable <= 0;
  const isFreeEvent = event.price === 0;
  const eventDate = new Date(event.date);
  const isEventPast = eventDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-gray-600 hover:text-gray-900"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="rounded-lg overflow-hidden bg-gray-200 h-80 lg:h-96 flex items-center justify-center border border-gray-300 relative">
              {(() => {
                const raw = (event as any)?.image || (event as any)?.imageUrl || '';
                const base = normalizeImageUrl(raw);
                const cacheKey = (event as any)?.updatedAt || (event as any)?.imageUpdatedAt || Date.now().toString();
                const src = base ? `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(cacheKey)}` : '';
                return src && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                ) : null;
              })()}

              {imageError || (!((event as any)?.image || (event as any)?.imageUrl)) ? (
                <div className="w-full h-full bg-linear-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center absolute inset-0">
                  <Calendar className="w-20 h-20 text-white opacity-50" />
                </div>
              ) : null}
            </div>

            {/* Event Title and Meta */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{event.category}</Badge>
                    <Badge className="bg-blue-100 text-blue-800">{event.type}</Badge>
                    {event.status === 'open' && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Open
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span>{eventDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span>{event.duration} mins</span>
                    </div>
                  </div>
                </div>
                {isFreeEvent ? (
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">FREE</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Price per ticket</p>
                    <p className="text-3xl font-bold text-green-600">${event.price}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{event.location.venue}</h4>
                  <p className="text-gray-600">{event.location.address}</p>
                  <p className="text-gray-600">{event.location.city}</p>
                </div>
                {event.location.coordinates && (
                  <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center border border-gray-300">
                    <MapPinIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {event.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Card */}
            <Card>
              <CardHeader>
                <CardTitle>Host</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    {typeof event.hostId === 'object' && event.hostId.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.hostId.profileImage}
                        alt={typeof event.hostId === 'object' ? event.hostId.fullName : 'Host'}
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {typeof event.hostId === 'object' ? event.hostId.fullName : 'Event Organizer'}
                    </h4>
                    <p className="text-sm text-gray-600">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Card */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="pt-6 space-y-6">
                {/* Participants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">
                        {event.currentParticipants}/{event.maxParticipants} Attending
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(spotsPercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {isEventFull ? (
                      <span className="text-red-600 font-semibold">Event is full</span>
                    ) : (
                      <>
                        {spotsAvailable} spot{spotsAvailable !== 1 ? 's' : ''} remaining
                      </>
                    )}
                  </p>
                </div>

                {/* Price Summary */}
                <div className="border-t border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per ticket</span>
                    <span className="font-semibold text-gray-900">
                      {isFreeEvent ? 'Free' : `$${event.price}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-green-600">
                      {isFreeEvent ? 'Free' : `$${event.price}`}
                    </span>
                  </div>
                </div>

                {/* Join/Leave Button */}
                <JoinEventButton
                  event={event}
                  onUpdate={(updatedEvent) => setEvent(updatedEvent)}
                  onJoinSuccess={(response) => {
                    toast.success(response.message);
                    // Refresh event data
                    fetchEventDetails();
                  }}
                  onLeaveSuccess={(response) => {
                    toast.success(response.message);
                    // Refresh event data
                    fetchEventDetails();
                  }}
                  className="w-full h-12 font-semibold"
                />

                {/* Status Message */}
                {isEventPast && (
                  <p className="text-sm text-red-600 text-center">
                    This event has already ended.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
