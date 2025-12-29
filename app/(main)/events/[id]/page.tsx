'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Users, Clock, DollarSign, ArrowLeft, Share2, MessageSquare, Star, ExternalLink, Loader2, User, MessageCircle, CheckCircle2, AlertCircle, CalendarIcon, MapPinIcon, UsersIcon, Heart, Edit, Tag, Info, CalendarCheck, AlertTriangle, UserCheck, Flag } from 'lucide-react';
import { getEventById, joinEvent, leaveEvent, Event } from '@/app/lib/events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export default function EventDetailsPage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const eventData = await getEventById(eventId);
      setEvent(eventData);
      
      // Check if current user is already a participant
      if (currentUser) {
        const isParticipant = eventData.participants.includes(currentUser._id);
        setIsJoined(isParticipant);
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (!event) return;

    setIsJoining(true);
    try {
      const response = await joinEvent(eventId);
      
      // Update local state with response data
      setEvent(response.data);
      setIsJoined(true);
      toast.success(response.message);
    } catch (error: any) {
      console.error('Failed to join event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to join event';
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!currentUser || !event) return;
    
    setIsJoining(true);
    try {
      const response = await leaveEvent(eventId);
      
      // Update local state with response data
      setEvent(response.data);
      setIsJoined(false);
      toast.success('Successfully left the event');
    } catch (error: any) {
      console.error('Failed to leave event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to leave event';
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = () => {
    if (!isClient || !event) return;
    
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'Event',
        text: event?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-lg font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isFull = event.currentParticipants >= event.maxParticipants;
  const isHost = currentUser?._id === (typeof event.hostId === 'object' ? event.hostId._id : event.hostId);
  const eventDate = parseISO(event.date);
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const isPastEvent = new Date(event.date) < new Date();
  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const participationPercentage = Math.round((event.currentParticipants / event.maxParticipants) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/events" className="hover:text-blue-600 transition-colors">Events</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{event.title}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-gray-600 hover:bg-white hover:text-blue-600 border border-transparent hover:border-gray-200 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header with Image */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white">
              <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
                    <CalendarIcon className="h-20 w-20 text-white opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge 
                        variant={event.status === 'cancelled' ? 'destructive' : 'default'}
                        className={`px-4 py-2 text-sm font-semibold mb-4 ${
                          event.status === 'active' ? 'bg-green-500 hover:bg-green-600 text-white border-0' : ''
                        }`}
                      >
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                      <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{event.title}</h1>
                      <Badge variant="secondary" className="bg-white/90 text-gray-800 backdrop-blur-sm px-3 py-1">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="absolute top-6 right-6">
                  <div className="flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      onClick={handleShare}
                      className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 border-0 shadow-lg"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 border-0 shadow-lg"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="sr-only">Save</span>
                    </Button>
                    {isHost && (
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        asChild
                        className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 border-0 shadow-lg"
                      >
                        <Link href={`/events/edit/${event._id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-8">
                {/* Host Info */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                      {typeof event.hostId === 'object' && event.hostId.profileImage ? (
                        <AvatarImage src={event.hostId.profileImage} alt={event.hostId.fullName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {typeof event.hostId === 'object' ? event.hostId.fullName.split(' ').map(n => n[0]).join('') : 'H'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900">Hosted by {typeof event.hostId === 'object' ? event.hostId.fullName : 'Host'}</p>
                      {typeof event.hostId === 'object' && event.hostId.averageRating && event.hostId.averageRating > 0 && (
                        <div className="flex items-center mt-1">
                          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
                            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                            <span className="text-xs font-medium text-yellow-700">
                              {event.hostId.averageRating.toFixed(1)} ({event.hostId.totalReviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Event Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Event Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="bg-blue-500 rounded-lg p-2 mr-4">
                        <CalendarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formattedDate}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.time} • {event.duration} minutes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="bg-green-500 rounded-lg p-2 mr-4">
                        <MapPinIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{event.location.venue}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.location.address}, {event.location.city}
                        </p>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-green-600 hover:text-green-700 mt-2" 
                          asChild
                        >
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location.venue}, ${event.location.address}, ${event.location.city}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-medium"
                          >
                            View on map <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="bg-purple-500 rounded-lg p-2 mr-4">
                        <UsersIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">
                            {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                          </span>
                          <span className="text-sm text-gray-600">
                            {event.currentParticipants} / {event.maxParticipants}
                          </span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, participationPercentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="bg-amber-500 rounded-lg p-2 mr-4">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {event.price > 0 ? `$${event.price} per person` : 'Free Event'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Requirements */}
                {event.requirements && event.requirements.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                      <ul className="space-y-3">
                        {event.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <div className="bg-amber-500 rounded-full p-1 mr-3 mt-0.5">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-gray-700 font-medium">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all cursor-pointer">
                          <Tag className="h-3 w-3 mr-1.5" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              
              {/* Mobile Action Buttons */}
              <div className="lg:hidden p-4 border-t bg-gray-50">
                <div className="flex space-x-3">
                  {isHost ? (
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/events/edit/${event._id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                      </Link>
                    </Button>
                  ) : isJoined ? (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleLeaveEvent}
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Leaving...
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Leave Event
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1"
                      onClick={handleJoinEvent}
                      disabled={isFull || isJoining}
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : isFull ? (
                        'Event Full'
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Join Event
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-4 w-4" />
                    <span className="sr-only">Chat</span>
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="details" 
                  onClick={() => setActiveTab('details')}
                  className={activeTab === 'details' ? 'bg-blue-50 text-blue-700' : ''}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="participants" 
                  onClick={() => setActiveTab('participants')}
                  className={activeTab === 'participants' ? 'bg-blue-50 text-blue-700' : ''}
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Participants ({event.participants.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="discussion" 
                  onClick={() => setActiveTab('discussion')}
                  className={activeTab === 'discussion' ? 'bg-blue-50 text-blue-700' : ''}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line text-gray-700">
                        {event.description}
                      </p>
                      
                      <h3 className="text-lg font-semibold mt-6 mb-3">Additional Information</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CalendarCheck className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Date & Time</p>
                            <p className="text-sm text-gray-600">
                              {formattedDate} at {event.time}
                            </p>
                            <p className="text-sm text-gray-600">
                              Duration: {event.duration} minutes
                            </p>
                          </div>
                        </li>
                        
                        <li className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-sm text-gray-600">
                              {event.location.venue}
                            </p>
                            <p className="text-sm text-gray-600">
                              {event.location.address}, {event.location.city}
                            </p>
                          </div>
                        </li>
                        
                        <li className="flex items-start">
                          <UsersIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Participants</p>
                            <p className="text-sm text-gray-600">
                              {event.currentParticipants} of {event.maxParticipants} spots filled
                            </p>
                            <p className="text-sm text-gray-600">
                              {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
                            </p>
                          </div>
                        </li>
                        
                        {event.requirements && event.requirements.length > 0 && (
                          <li className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Requirements</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {event.requirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          </li>
                        )}
                      </ul>
                      
                      {event.tags && event.tags.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="px-2 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="participants" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Participants ({event.participants.length})</CardTitle>
                      <div className="text-sm text-gray-500">
                        {event.currentParticipants} of {event.maxParticipants} spots filled
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {event.participants.length > 0 ? (
                      <div className="space-y-4">
                        {event.participants.map((participant) => {
                          // Handle both string IDs and user objects
                          const participantObj = typeof participant === 'string' 
                            ? { _id: participant, fullName: 'User', profileImage: undefined }
                            : participant;
                          
                          return (
                            <div key={participantObj._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10">
                                  {participantObj.profileImage ? (
                                    <AvatarImage src={participantObj.profileImage} alt={participantObj.fullName} />
                                  ) : (
                                    <AvatarFallback>
                                      {participantObj.fullName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="ml-3">
                                  <p className="font-medium">{participantObj.fullName}</p>
                                  {participantObj.rating && (
                                    <div className="flex items-center">
                                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                      <span className="text-xs text-gray-500">
                                        {participantObj.rating.toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <User className="h-4 w-4 mr-1" />
                                View Profile
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-700">No participants yet</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Be the first to join this event!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="discussion" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Discussion</CardTitle>
                    <CardDescription>
                      Ask questions, coordinate with other participants, or share your thoughts about the event.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-700">No discussions yet</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-4">
                        Start a conversation with other participants
                      </p>
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Discussion
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Event Actions */}
            <Card className="top-6 border-0 shadow-xl bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <CardTitle className="text-2xl font-bold text-white">
                  {event.price > 0 ? `$${event.price}` : 'Free'}
                </CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  {event.price > 0 ? 'Per person' : 'No cost to join'}
                </CardDescription>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Date</span>
                    <span className="text-sm font-semibold text-gray-900">{format(eventDate, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Time</span>
                    <span className="text-sm font-semibold text-gray-900">{event.time}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Duration</span>
                    <span className="text-sm font-semibold text-gray-900">{event.duration} minutes</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 font-medium">Spots left</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {spotsLeft} of {event.maxParticipants}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 space-y-3">
                  {isHost ? (
                    <div className="space-y-3">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3" size="lg" asChild>
                        <Link href={`/events/edit/${event._id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Event
                        </Link>
                      </Button>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">
                          <CheckCircle2 className="h-4 w-4 inline mr-1" />
                          You are the host of this event
                        </p>
                      </div>
                    </div>
                  ) : isJoined ? (
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 font-semibold py-3"
                        size="lg"
                        onClick={handleLeaveEvent}
                        disabled={isJoining}
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Leaving...
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Leave Event
                          </>
                        )}
                      </Button>
                      <Button variant="outline" className="w-full font-semibold py-3">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat with Host
                      </Button>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">
                          <CheckCircle2 className="h-4 w-4 inline mr-1" />
                          You're going to this event
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3" 
                      size="lg"
                      onClick={handleJoinEvent}
                      disabled={isFull || isJoining}
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : isFull ? (
                        'Event Full'
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Join Event
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {!isHost && !isJoined && !isFull && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    By joining, you agree to the event's terms and conditions
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Location Map */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <div className="bg-green-500 rounded-lg p-2 mr-3">
                    <MapPinIcon className="h-5 w-5 text-white" />
                  </div>
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center p-4">
                    <MapPinIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      {event.location.venue}
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.location.address}, {event.location.city}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-green-500 text-green-600 hover:bg-green-50 font-semibold"
                  size="sm"
                  asChild
                >
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location.venue}, ${event.location.address}, ${event.location.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    View on Google Maps
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            {/* Host Information */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Host Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-16 w-16 ring-4 ring-purple-100">
                    {typeof event.hostId === 'object' && event.hostId.profileImage ? (
                      <AvatarImage src={event.hostId.profileImage} alt={event.hostId.fullName} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-bold">
                        {typeof event.hostId === 'object' ? event.hostId.fullName.split(' ').map(n => n[0]).join('') : 'H'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-bold text-gray-900 text-lg">{typeof event.hostId === 'object' ? event.hostId.fullName : 'Host'}</p>
                    <p className="text-sm text-gray-600 font-medium">Event Host</p>
                    {typeof event.hostId === 'object' && event.hostId.averageRating && event.hostId.averageRating > 0 && (
                      <div className="flex items-center mt-2">
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          <span className="text-xs font-semibold text-yellow-700">
                            {event.hostId.averageRating.toFixed(1)} ({event.hostId.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {typeof event.hostId === 'object' && event.hostId.bio && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700 italic">"{typeof event.hostId === 'object' ? event.hostId.bio : ''}"</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold" asChild>
                    <Link href={`/profile/${typeof event.hostId === 'object' ? event.hostId._id : event.hostId}`}>
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                  </Button>
                  {!isHost && (
                    <Button variant="outline" className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Host
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Participants</span>
                    <span className="font-medium">
                      {event.currentParticipants} / {event.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, participationPercentage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{event.participants.length}</p>
                    <p className="text-xs text-gray-500">Going</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{event.waitingList?.length || 0}</p>
                    <p className="text-xs text-gray-500">Waitlist</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-gray-600 mb-2">Event Status</p>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      event.status === 'open' ? 'bg-green-500' : 
                      event.status === 'upcoming' ? 'bg-blue-500' : 
                      event.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">
                      {event.status}
                      {event.status === 'open' && ' - Join Now!'}
                      {event.status === 'upcoming' && ' - Coming Soon'}
                      {event.status === 'cancelled' && ' - Event Cancelled'}
                      {event.status === 'past' && ' - Event Ended'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Share Event */}
            <Card>
              <CardHeader>
                <CardTitle>Share This Event</CardTitle>
                <CardDescription>Invite friends to join you!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                  <Button variant="outline" size="icon">
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Message</span>
                  </Button>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Copy Link</span>
                  </Button>
                </div>
                
               
              </CardContent>
            </Card>
            
            {/* Report Event */}
            {!isHost && (
              <div className="text-center">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                  <Flag className="h-4 w-4 mr-1" />
                  Report Event
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}