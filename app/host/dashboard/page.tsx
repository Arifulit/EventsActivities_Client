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
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  MapPin,
  Search,
  Filter,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Home,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

interface HostEvent {
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
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  totalRevenue: number;
  averageRating: number;
  reviews: number;
}

interface HostStats {
  totalEvents: number;
  totalParticipants: number;
  totalRevenue: number;
  averageRating: number;
  upcomingEvents: number;
  completedEvents: number;
}

export default function HostDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<HostStats>({
    totalEvents: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    averageRating: 0,
    upcomingEvents: 0,
    completedEvents: 0,
  });
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HostEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'host') {
      router.push('/login');
      return;
    }
    fetchHostData();
  }, [user, router]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter]);

  const fetchHostData = async () => {
    try {
      // Fetch host stats
      const statsResponse = await fetch('/api/host/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Fetch host events
      const eventsResponse = await fetch('/api/host/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (statsResponse.ok && eventsResponse.ok) {
        const statsData = await statsResponse.json();
        const eventsData = await eventsResponse.json();
        
        setStats(statsData.data);
        setEvents(eventsData.data);
      }
    } catch (error) {
      console.error('Error fetching host data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEventAction = (eventId: string, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/host/events/${eventId}`);
        break;
      case 'edit':
        router.push(`/host/events/${eventId}/edit`);
        break;
      case 'participants':
        router.push(`/host/events/${eventId}/participants`);
        break;
      case 'delete':
        // Handle delete action
        toast.success('Event deleted successfully');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
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
      {/* Sidebar - Fixed Position */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-screen lg:overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Host Dashboard</h1>
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
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                  {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{user?.fullName}</div>
              <div className="text-sm text-gray-500 truncate">{user?.email}</div>
              <Badge className="mt-1 bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                Host
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-purple-50"
            onClick={() => router.push('/host/dashboard')}
          >
            <Home className="h-4 w-4 mr-3 text-purple-600" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-purple-50"
            onClick={() => router.push('/host/events')}
          >
            <Calendar className="h-4 w-4 mr-3 text-purple-600" />
            My Events
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-purple-50"
            onClick={() => router.push('/host/events/create')}
          >
            <Plus className="h-4 w-4 mr-3 text-purple-600" />
            Create Event
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-purple-50"
            onClick={() => router.push('/host/payments')}
          >
            <CreditCard className="h-4 w-4 mr-3 text-purple-600" />
            Payments
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-purple-50"
            onClick={() => router.push('/host/analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-3 text-purple-600" />
            Analytics
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-purple-50"
            onClick={() => router.push('/host/messages')}
          >
            <MessageSquare className="h-4 w-4 mr-3 text-purple-600" />
            Messages
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-purple-50"
            onClick={() => router.push('/host/settings')}
          >
            <Settings className="h-4 w-4 mr-3 text-purple-600" />
            Settings
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
              <h1 className="text-lg font-semibold">Host Dashboard</h1>
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
              Manage your events and track your performance
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Participants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Recent Events</CardTitle>
                  <CardDescription className="text-gray-600">
                    Your latest events and their performance
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push('/host/events/create')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first event to get started'
                    }
                    </p>
                    <Button
                      onClick={() => router.push('/host/events/create')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                ) : (
                  filteredEvents.map((event) => (
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
                              <span>{event.time}</span>
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
                              <DollarSign className="h-4 w-4" />
                              <span>${event.price}</span>
                            </div>
                            {event.averageRating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{event.averageRating.toFixed(1)} ({event.reviews})</span>
                              </div>
                            )}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEventAction(event._id, 'edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEventAction(event._id, 'participants')}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
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
