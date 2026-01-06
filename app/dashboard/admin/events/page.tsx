
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/app/components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  ChevronDown
} from 'lucide-react';

interface EventLocation {
  venue: string;
  address: string;
  city: string;
}

interface HostInfo {
  _id: string;
  email: string;
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
  hostId: HostInfo | null;
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
  location: EventLocation;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination: PaginationData;
  };
}

const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'published':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string): React.ReactNode => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'open':
      return <CheckCircle className="w-3 h-3" />;
    case 'cancelled':
      return <XCircle className="w-3 h-3" />;
    case 'completed':
      return <CheckCircle className="w-3 h-3" />;
    case 'pending':
      return <AlertCircle className="w-3 h-3" />;
    case 'draft':
    case 'published':
      return <AlertCircle className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatTime = (timeString: string): string => {
  try {
    if (!timeString) return 'N/A';
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const timePart = timeString.includes('T') 
      ? timeString.split('T')[1]?.split('.')[0] 
      : timeString;
    
    const [hours, minutes] = timePart.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes ? parseInt(minutes, 10) : 0;
    
    const date = new Date();
    date.setHours(hour, minute, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return timeString;
  }
};

export default function AdminEvents() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(categoryFilter !== 'all' && { category: categoryFilter }),
          ...(typeFilter !== 'all' && { type: typeFilter })
        });
        
        const response = await api.get<ApiResponse>(`/admin/events?${params}`);
        const data = response.data?.data;
        
        if (data && Array.isArray(data.events)) {
          setEvents(data.events);
          setTotalEvents(data.pagination?.total || 0);
          setTotalPages(data.pagination?.pages || 1);
        } else {
          setEvents([]);
          setTotalEvents(0);
          setTotalPages(1);
        }
      } catch (error: any) {
        console.error('Error fetching events:', error);
        setEvents([]);
        setTotalEvents(0);
        setTotalPages(1);
        
        if (error.response?.status === 403) {
          toast.error('Access denied: You do not have permission to manage events');
        } else if (error.response?.status === 401) {
          toast.error('Authentication required: Please log in again');
        } else if (error.response?.status === 500) {
          toast.error('Server error: Please try again later');
        } else {
          toast.error('Failed to load events');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage, searchTerm, statusFilter, categoryFilter, typeFilter, limit]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Get unique categories and types for filters
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    events.forEach(event => {
      if (event.category) {
        uniqueCategories.add(event.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [events]);

  const types = useMemo(() => {
    const uniqueTypes = new Set<string>();
    events.forEach(event => {
      if (event.type) {
        uniqueTypes.add(event.type);
      }
    });
    return Array.from(uniqueTypes);
  }, [events]);

  // Filter events (client-side for display)
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event || !event.title || !event.description || !event.location) return false;
      
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      const matchesType = typeFilter === 'all' || event.type === typeFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesType;
    });
  }, [events, searchTerm, statusFilter, categoryFilter, typeFilter]);

  // Calculate event statistics
  const stats = useMemo(() => {
    return {
      total: events.length,
      open: events.filter(e => e.status === 'open').length,
      draft: events.filter(e => e.status === 'draft').length,
      cancelled: events.filter(e => e.status === 'cancelled').length,
      published: events.filter(e => e.status === 'published').length,
      completed: events.filter(e => e.status === 'completed').length,
      pending: events.filter(e => e.status === 'pending').length,
      totalRevenue: events.reduce((sum, e) => sum + (e.price * (e.currentParticipants || 0)), 0)
    };
  }, [events]);

  const handleEventAction = async (eventId: string, action: string, newStatus?: string) => {
    try {
      switch (action) {
        case 'view':
          router.push(`/events/${eventId}`);
          break;
        case 'edit':
          router.push(`/dashboard/admin/events/${eventId}/edit`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            await api.delete(`/admin/events/${eventId}`);
            setEvents(prev => prev.filter(event => event._id !== eventId));
            toast.success('Event deleted successfully');
          }
          break;
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this event?')) {
            await api.patch(`/admin/events/${eventId}/cancel`);
            // Update local state
            setEvents(prev => prev.map(event => 
              event._id === eventId ? { ...event, status: 'cancelled' } : event
            ));
            toast.success('Event cancelled successfully');
          }
          break;
        case 'updateStatus':
          if (!newStatus) {
            toast.error('Please select a status');
            return;
          }
          
          const currentEvent = events.find(e => e._id === eventId);
          if (currentEvent && currentEvent.status === newStatus) {
            toast.error(`Event is already ${newStatus}`);
            return;
          }
          
          const statusResponse = await api.put(`/admin/events/${eventId}/status`, { status: newStatus });
          if (statusResponse.data?.success) {
            toast.success(`Event status updated to ${newStatus} successfully`);
            // Update local state
            setEvents(prev => prev.map(event => 
              event._id === eventId ? { ...event, status: newStatus } : event
            ));
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      console.error(`Error performing ${action} on event ${eventId}:`, error);
      const errorMessage = error.response?.data?.message || `Failed to perform action: ${action}`;
      toast.error(errorMessage);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Events Management</h1>
          <div className="w-8"></div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden lg:block bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  Events Management
                </h1>
                <p className="text-sm text-gray-600 mt-2">Manage all events, monitor status, and handle administrative tasks</p>
              </div>
              <Button 
                onClick={() => router.push('/admin/events/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-800">Total Events</CardTitle>
                <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-3xl font-bold animate-pulse text-blue-300">...</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      All events
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-800">Active Events</CardTitle>
                <div className="p-3 bg-green-600 rounded-xl shadow-md">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-3xl font-bold animate-pulse text-green-300">...</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-green-900">{stats.open}</div>
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      Currently running
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-800">Completed</CardTitle>
                <div className="p-3 bg-purple-600 rounded-xl shadow-md">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-3xl font-bold animate-pulse text-purple-300">...</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-purple-900">{stats.completed}</div>
                    <p className="text-xs text-purple-600 mt-2 font-medium">
                      Finished events
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-orange-800">Total Revenue</CardTitle>
                <div className="p-3 bg-orange-600 rounded-xl shadow-md">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-3xl font-bold animate-pulse text-orange-300">...</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-orange-900">
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                    <p className="text-xs text-orange-600 mt-2 font-medium">
                      From all events
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Events Management */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
            <CardHeader className="pb-6 bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-gray-900">
                <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                Events Management
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-2">
                View, manage, and monitor all events in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search events by title, location, or host..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="all">All Types</SelectItem>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setTypeFilter('all');
                      setCurrentPage(1);
                    }}
                    variant="outline" 
                    className="h-11 border-gray-200 hover:bg-gray-50 rounded-lg"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Events Table */}
              {loading ? (
                <div className="flex items-center justify-center py-8 lg:py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 lg:h-10 lg:w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm lg:text-base">Loading events...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableRow className="border-b border-gray-200">
                            <TableHead className="w-[300px] font-semibold text-gray-700 py-4">Event</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4">Date & Time</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4">Location</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4">Participants</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4">Price</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 py-4 pr-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => (
                              <TableRow 
                                key={event._id} 
                                className={`hover:bg-blue-50 transition-colors border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                              >
                                <TableCell className="py-4">
                                  <div className="space-y-3">
                                    <div className="font-bold text-gray-900 text-base truncate max-w-[280px]">{event.title}</div>
                                    <div className="text-sm text-gray-600 line-clamp-2 max-w-[280px]">{event.description}</div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        {event.type || 'N/A'}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                        {event.category || 'N/A'}
                                      </Badge>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm">
                                      <Calendar className="w-3 h-3 text-gray-400" />
                                      {formatDate(event.date)}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      {formatTime(event.time)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {event.duration} min
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm">
                                      <MapPin className="w-3 h-3 text-gray-400" />
                                      <span className="truncate max-w-[150px]">{event.location?.venue || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                      {event.location?.city || 'N/A'}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <Badge className={getStatusColor(event.status)} variant="secondary">
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(event.status)}
                                      <span className="font-bold text-xs">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span>
                                    </div>
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm">
                                      <Users className="w-3 h-3 text-gray-400" />
                                      {event.currentParticipants || 0}/{event.maxParticipants || 0}
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-blue-600 h-1.5 rounded-full" 
                                        style={{ 
                                          width: `${event.maxParticipants ? ((event.currentParticipants || 0) / event.maxParticipants) * 100 : 0}%` 
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="font-semibold text-gray-900">
                                    {event.price === 0 ? 'Free' : formatCurrency(event.price)}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="hover:bg-gray-100 p-2 transition-colors duration-200"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent 
                                      align="end" 
                                      className="w-48 border shadow-lg bg-white rounded-lg"
                                      sideOffset={5}
                                    >
                                      <DropdownMenuItem 
                                        onClick={() => handleEventAction(event._id, 'view')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                      >
                                        <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleEventAction(event._id, 'edit')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                      >
                                        <Edit className="w-4 h-4 mr-2 text-green-600" />
                                        Edit Event
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-gray-100" />
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="cursor-pointer hover:bg-gray-50 transition-colors">
                                          <AlertCircle className="w-4 h-4 mr-2 text-purple-600" />
                                          Change Status
                                          <ChevronDown className="w-4 h-4 ml-auto" />
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="w-40 border shadow-lg bg-white rounded-lg">
                                          <DropdownMenuItem 
                                            onClick={() => handleEventAction(event._id, 'updateStatus', 'open')}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                            Open
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleEventAction(event._id, 'updateStatus', 'cancelled')}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                          >
                                            <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                            Cancelled
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleEventAction(event._id, 'updateStatus', 'completed')}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                                            Completed
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleEventAction(event._id, 'updateStatus', 'pending')}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                          >
                                            <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                                            Pending
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleEventAction(event._id, 'updateStatus', 'draft')}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                          >
                                            <AlertCircle className="w-4 h-4 mr-2 text-gray-600" />
                                            Draft
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleEventAction(event._id, 'updateStatus', 'published')}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                          >
                                            <AlertCircle className="w-4 h-4 mr-2 text-purple-600" />
                                            Published
                                          </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                      <DropdownMenuSeparator className="bg-gray-100" />
                                      {event.status === 'open' && (
                                        <DropdownMenuItem 
                                          onClick={() => handleEventAction(event._id, 'cancel')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors text-orange-600"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Cancel Event
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => handleEventAction(event._id, 'delete')}
                                        className="cursor-pointer hover:bg-red-50 transition-colors text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Event
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 lg:py-12">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <Card key={event._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 mb-1">{event.title}</div>
                                  <div className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {event.type || 'N/A'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {event.category || 'N/A'}
                                    </Badge>
                                    <Badge className={getStatusColor(event.status)} variant="secondary">
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(event.status)}
                                        <span className="font-bold text-xs">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span>
                                      </div>
                                    </Badge>
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="hover:bg-gray-100 p-2 transition-colors duration-200"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent 
                                    align="end" 
                                    className="w-48 border shadow-lg bg-white rounded-lg"
                                    sideOffset={5}
                                  >
                                    <DropdownMenuItem 
                                      onClick={() => handleEventAction(event._id, 'view')}
                                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                      <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleEventAction(event._id, 'edit')}
                                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                      <Edit className="w-4 h-4 mr-2 text-green-600" />
                                      Edit Event
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger className="cursor-pointer hover:bg-gray-50 transition-colors">
                                        <AlertCircle className="w-4 h-4 mr-2 text-purple-600" />
                                        Change Status
                                        <ChevronDown className="w-4 h-4 ml-auto" />
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent className="w-40 border shadow-lg bg-white rounded-lg">
                                        <DropdownMenuItem 
                                          onClick={() => handleEventAction(event._id, 'updateStatus', 'open')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                          Open
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleEventAction(event._id, 'updateStatus', 'cancelled')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                          <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                          Cancelled
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleEventAction(event._id, 'updateStatus', 'completed')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                                          Completed
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleEventAction(event._id, 'updateStatus', 'pending')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                          <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                                          Pending
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleEventAction(event._id, 'updateStatus', 'draft')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                          <AlertCircle className="w-4 h-4 mr-2 text-gray-600" />
                                          Draft
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleEventAction(event._id, 'updateStatus', 'published')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                          <AlertCircle className="w-4 h-4 mr-2 text-purple-600" />
                                          Published
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    {event.status === 'open' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleEventAction(event._id, 'cancel')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors text-orange-600"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel Event
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      onClick={() => handleEventAction(event._id, 'delete')}
                                      className="cursor-pointer hover:bg-red-50 transition-colors text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Event
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-gray-500 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Date
                                  </div>
                                  <div className="font-semibold text-gray-900">{formatDate(event.date)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Time
                                  </div>
                                  <div className="font-semibold text-gray-900">{formatTime(event.time)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Location
                                  </div>
                                  <div className="font-semibold text-gray-900 truncate">{event.location?.venue || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Participants
                                  </div>
                                  <div className="font-semibold text-gray-900">
                                    {event.currentParticipants || 0}/{event.maxParticipants || 0}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    Price
                                  </div>
                                  <div className="font-semibold text-gray-900">
                                    {event.price === 0 ? 'Free' : formatCurrency(event.price)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1">Duration</div>
                                  <div className="font-semibold text-gray-900">{event.duration} min</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 lg:py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * limit, totalEvents)}
                        </span>{' '}
                        of <span className="font-medium">{totalEvents}</span> results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="border-gray-300"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="border-gray-300"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}