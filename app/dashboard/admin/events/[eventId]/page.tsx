'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/lib/api';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Star,
  ExternalLink,
  User,
  Mail,
  Tag,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface Participant {
  _id: string;
  fullName: string;
  email: string;
  profileImage: string;
}

interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage: string;
  };
  hostId: string;
  eventId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface Host {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage: string;
  averageRating: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  hostId: Host;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  image: string;
  images: string[];
  requirements: string[];
  tags: string[];
  status: string;
  isPublic: boolean;
  participants: Participant[];
  waitingList: string[];
  location: {
    venue: string;
    address: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EventDetailsResponse {
  event: Event;
  bookingStats: any[];
  reviews: Review[];
  reviewStats: {
    total: number;
    averageRating: number;
  };
}

export default function AdminEventDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, user, router]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/admin/events/${eventId}`);
      const data: EventDetailsResponse = response.data.data;
      setEventDetails(data);
      setEvent(data.event);
    } catch (error: any) {
      console.error('Failed to fetch event details:', error);
      if (error.response?.status === 404) {
        toast.error('Event not found');
      } else if (error.response?.status === 403) {
        toast.error('Access denied: You do not have permission to view this event');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required: Please log in again');
      } else {
        toast.error('Failed to load event details: Server error');
      }
      router.push('/dashboard/admin/events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAction = async (action: string) => {
    if (!event) return;
    
    setIsActionLoading(true);
    try {
      switch (action) {
        case 'edit':
          router.push(`/dashboard/admin/events/${eventId}/edit`);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            await api.delete(`/admin/events/${eventId}`);
            toast.success('Event deleted successfully');
            router.push('/dashboard/admin/events');
          }
          break;
        case 'cancel':
          if (confirm('Are you sure you want to cancel this event?')) {
            await api.patch(`/admin/events/${eventId}/cancel`);
            toast.success('Event cancelled successfully');
            fetchEventDetails();
          }
          break;
        case 'viewPublic':
          router.push(`/events/${eventId}`);
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to perform action: ${action}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technology':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'food':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'workshop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMMM d, yyyy \'at\' h:mm a');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-blue-100 rounded-full mx-auto"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Loading event details...</div>
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
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist</p>
          <Button onClick={() => router.push('/dashboard/admin/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-gray-100">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Events
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Event Details</h1>
                    <p className="text-gray-600">View and manage event information</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => handleEventAction('viewPublic')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Page
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" disabled={isActionLoading}>
                        <Edit className="h-4 w-4 mr-2" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEventAction('edit')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                      </DropdownMenuItem>
                      {event.status === 'open' && (
                        <DropdownMenuItem onClick={() => handleEventAction('cancel')}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Event
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleEventAction('delete')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Event Info Card */}
              <div className="lg:col-span-1">
                <Card className="bg-white shadow-lg border-0 lg:sticky lg:top-24">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-48 w-full rounded-lg object-cover mb-4"
                        />
                      ) : (
                        <div className="h-48 w-full rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                          <Calendar className="h-16 w-16 text-white" />
                        </div>
                      )}
                      
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        <Badge className={`border ${getStatusColor(event.status)}`}>
                          {event.status}
                        </Badge>
                        <Badge className={`border ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </Badge>
                        <Badge variant="secondary">
                          {event.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Price</span>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(event.price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Participants</span>
                        <span className="text-sm text-gray-900">{event.currentParticipants}/{event.maxParticipants}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Duration</span>
                        <span className="text-sm text-gray-900">{event.duration} minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Public Event</span>
                        <Badge className={event.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {event.isPublic ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Details Cards */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Event Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date</label>
                        <p className="text-gray-900">{formatDate(event.date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Time</label>
                        <p className="text-gray-900">{event.time}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Venue</label>
                        <p className="text-gray-900">{event.location.venue}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-gray-900">{event.location.address}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="text-gray-900">{event.location.city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-gray-900">{formatDate(event.createdAt)}</p>
                      </div>
                    </div>
                    
                    {event.requirements.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Requirements</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {event.requirements.map((requirement, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {requirement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {event.tags.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Host Information */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Host Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        {event.hostId.profileImage ? (
                          <AvatarImage src={event.hostId.profileImage} alt={event.hostId.fullName} />
                        ) : (
                          <AvatarFallback>
                            {event.hostId.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{event.hostId.fullName}</h4>
                        <p className="text-gray-600">{event.hostId.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {event.hostId.role}
                          </Badge>
                          {event.hostId.averageRating > 0 && (
                            <div className="flex items-center">
                              {renderStars(Math.floor(event.hostId.averageRating))}
                              <span className="text-sm text-gray-600 ml-1">
                                ({event.hostId.averageRating.toFixed(1)})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Participants ({event.participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.participants.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No participants yet</p>
                    ) : (
                      <div className="space-y-3">
                        {event.participants.map((participant) => (
                          <div key={participant._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Avatar className="h-8 w-8">
                              {participant.profileImage ? (
                                <AvatarImage src={participant.profileImage} alt={participant.fullName} />
                              ) : (
                                <AvatarFallback className="text-xs">
                                  {participant.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{participant.fullName}</p>
                              <p className="text-sm text-gray-600">{participant.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reviews */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Reviews ({eventDetails?.reviews.length || 0})
                      </div>
                      {eventDetails?.reviewStats.total > 0 && (
                        <div className="flex items-center">
                          {renderStars(Math.floor(eventDetails.reviewStats.averageRating))}
                          <span className="text-sm text-gray-600 ml-1">
                            ({eventDetails.reviewStats.averageRating.toFixed(1)})
                          </span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {eventDetails?.reviews.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No reviews yet</p>
                    ) : (
                      <div className="space-y-4">
                        {eventDetails?.reviews.map((review) => (
                          <div key={review._id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                {review.userId.profileImage ? (
                                  <AvatarImage src={review.userId.profileImage} alt={review.userId.fullName} />
                                ) : (
                                  <AvatarFallback className="text-xs">
                                    {review.userId.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">{review.userId.fullName}</h4>
                                  <div className="flex items-center">
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                                <p className="text-gray-600 mt-1">{review.comment}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
