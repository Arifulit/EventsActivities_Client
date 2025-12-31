'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import {
  Calendar,
  Users,
  MapPin,
  Star,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Search,
  Filter,
  Clock,
  TrendingUp,
  User,
  Ticket,
  BookmarkIcon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

interface UserEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  category: string;
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  averageRating: number;
  reviews: number;
}

interface UserStats {
  totalJoined: number;
  totalSaved: number;
  totalSpent: number;
  upcomingEvents: number;
  completedEvents: number;
  averageRating: number;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalJoined: 0,
    totalSaved: 0,
    totalSpent: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    averageRating: 0,
  });
  const [joinedEvents, setJoinedEvents] = useState<UserEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<UserEvent[]>([]);
  const [activeTab, setActiveTab] = useState('joined');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role === 'admin') {
      router.push('/login');
      return;
    }
    fetchUserData();
  }, [user, router]);

  const fetchUserData = async () => {
    try {
      // Fetch user stats
      const statsResponse = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Fetch joined events
      const joinedResponse = await fetch('/api/user/events/joined', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Fetch saved events
      const savedResponse = await fetch('/api/user/events/saved', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (statsResponse.ok && joinedResponse.ok && savedResponse.ok) {
        const statsData = await statsResponse.json();
        const joinedData = await joinedResponse.json();
        const savedData = await savedResponse.json();
        
        setStats(statsData.data);
        setJoinedEvents(joinedData.data);
        setSavedEvents(savedData.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(`2023-01-01T${timeString}`), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEventAction = (eventId: string, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/events/${eventId}`);
        break;
      case 'unsave':
        // Handle unsave action
        toast.success('Event removed from saved');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getActiveEvents = () => {
    const events = activeTab === 'joined' ? joinedEvents : savedEvents;
    if (!searchTerm) return events;
    
    return events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-screen lg:overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Dashboard</h1>
              <p className="text-sm text-gray-500">Event Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {user?.profileImage ? (
                <AvatarImage src={user.profileImage} alt={user.fullName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{user?.fullName}</div>
              <div className="text-sm text-gray-500 truncate">{user?.email}</div>
              <Badge className="mt-1 bg-blue-100 text-blue-800">
                <User className="h-3 w-3 mr-1" />
                User
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-blue-50"
            onClick={() => router.push('/user/dashboard')}
          >
            <Home className="h-4 w-4 mr-3 text-blue-600" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-blue-50"
            onClick={() => router.push('/events')}
          >
            <Search className="h-4 w-4 mr-3 text-blue-600" />
            Explore Events
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-blue-50"
            onClick={() => router.push('/user/events/joined')}
          >
            <Ticket className="h-4 w-4 mr-3 text-blue-600" />
            My Tickets
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-blue-50"
            onClick={() => router.push('/user/events/saved')}
          >
            <BookmarkIcon className="h-4 w-4 mr-3 text-blue-600" />
            Saved Events
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-blue-50"
            onClick={() => router.push(`/profile/${user?._id}`)}
          >
            <Settings className="h-4 w-4 mr-3 text-blue-600" />
            Profile Settings
          </Button>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-red-50 text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 lg:h-screen lg:overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">User Dashboard</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="p-6 pb-20">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-gray-600">
              Manage your events and track your activity
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Events Joined</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalJoined}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Ticket className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saved Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSaved}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <BookmarkIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalSpent}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Section */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">My Events</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your joined and saved events
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push('/events')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Explore Events
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={activeTab === 'joined' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('joined')}
                  className="flex-1"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Joined Events ({joinedEvents.length})
                </Button>
                <Button
                  variant={activeTab === 'saved' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('saved')}
                  className="flex-1"
                >
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Saved Events ({savedEvents.length})
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Events List */}
              <div className="space-y-4">
                {getActiveEvents().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                      {activeTab === 'joined' ? (
                        <Ticket className="h-8 w-8 text-gray-400" />
                      ) : (
                        <BookmarkIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No {activeTab === 'joined' ? 'joined' : 'saved'} events found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm
                        ? 'Try adjusting your search'
                        : `Start ${activeTab === 'joined' ? 'joining' : 'saving'} events to see them here`}
                    </p>
                    <Button
                      onClick={() => router.push('/events')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Explore Events
                    </Button>
                  </div>
                ) : (
                  getActiveEvents().map((event) => (
                    <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(event.time)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{event.currentParticipants}/{event.maxParticipants}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">${event.price}</span>
                            </div>
                            {event.averageRating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{event.averageRating.toFixed(1)} ({event.reviews})</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                {event.organizer.profileImage ? (
                                  <AvatarImage src={event.organizer.profileImage} alt={event.organizer.fullName} />
                                ) : (
                                  <AvatarFallback className="text-xs">
                                    {event.organizer.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-sm text-gray-500">by {event.organizer.fullName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEventAction(event._id, 'view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {activeTab === 'saved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEventAction(event._id, 'unsave')}
                            >
                              <BookmarkIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
