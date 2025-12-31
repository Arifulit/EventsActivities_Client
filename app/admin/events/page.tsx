'use client';

import React, { useState, useEffect } from 'react';
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
import AdminSidebar from '../components/AdminSidebar';
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
  Tag,
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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return <CheckCircle className="w-3 h-3" />;
    case 'cancelled':
      return <XCircle className="w-3 h-3" />;
    case 'completed':
      return <CheckCircle className="w-3 h-3" />;
    case 'pending':
      return <AlertCircle className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (timeString: string) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminEvents() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/events');
        setEvents(response.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        if (error.response?.status === 403) {
          toast.error('Access denied: You do not have permission to manage events');
        } else if (error.response?.status === 401) {
          toast.error('Authentication required: Please log in again');
        } else {
          toast.error('Failed to load events: Server error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get unique categories and types for filters
  const categories = [...new Set(events.map(event => event.category).filter(Boolean))];
  const types = [...new Set(events.map(event => event.type).filter(Boolean))];

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const handleEventAction = async (eventId: string, action: string, newStatus?: string) => {
    try {
      switch (action) {
        case 'view':
          router.push(`/events/${eventId}`);
          break;
        case 'edit':
          router.push(`/admin/events/${eventId}/edit`);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            await api.delete(`/admin/events/${eventId}`);
            setEvents(events.filter(event => event._id !== eventId));
            toast.success('Event deleted successfully');
          }
          break;
        case 'cancel':
          if (confirm('Are you sure you want to cancel this event?')) {
            await api.patch(`/admin/events/${eventId}/cancel`);
            // Refresh events
            const response = await api.get('/admin/events');
            setEvents(response.data?.data || []);
            toast.success('Event cancelled successfully');
          }
          break;
        case 'updateStatus':
          if (!newStatus) {
            toast.error('Please select a status');
            return;
          }
          
          // Find the event to check current status
          const currentEvent = events.find(e => e._id === eventId);
          if (currentEvent && currentEvent.status === newStatus) {
            toast.error(`Event is already ${newStatus}`);
            return;
          }
          
          // Use the status update API endpoint
          const statusResponse = await api.patch(`/admin/events/${eventId}/status`, { status: newStatus });
          if (statusResponse.data?.success) {
            toast.success(`Event status updated to ${newStatus} successfully`);
            // Refresh events list
            const refreshResponse = await api.get('/admin/events');
            setEvents(refreshResponse.data?.data || []);
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on event ${eventId}:`, error);
      toast.error(`Failed to perform action: ${action}`);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 bg-white shadow-xl border-r border-gray-200 flex-shrink-0">
            <AdminSidebar 
              isOpen={true} 
              onClose={() => {}} 
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Events Management</h1>
              <div className="w-8"></div>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden lg:block bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Events Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage all events in the system</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{events.length}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          All events
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Events</CardTitle>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {events.filter(e => e.status === 'open').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Currently active
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {events.reduce((sum, event) => sum + event.currentParticipants, 0)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Across all events
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {formatCurrency(events.reduce((sum, event) => sum + (event.price * event.currentParticipants), 0))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          From all events
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Events Management */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    Events Management
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    View and manage all events in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search events..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10 lg:h-11"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full lg:w-40 h-10 lg:h-11">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full lg:w-40 h-10 lg:h-11">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full lg:w-40 h-10 lg:h-11">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                      {/* Desktop Table */}
                      <div className="hidden lg:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[300px]">Event</TableHead>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Participants</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEvents.map((event) => (
                              <TableRow key={event._id} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="py-4">
                                  <div className="space-y-2">
                                    <div className="font-bold text-gray-900 text-base truncate">{event.title}</div>
                                    <div className="text-sm text-gray-600 line-clamp-2">{event.description}</div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {event.type}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {event.category}
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
                                      <span className="truncate max-w-[150px]">{event.location.venue}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                      {event.location.city}
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
                                      {event.currentParticipants}/{event.maxParticipants}
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-blue-600 h-1.5 rounded-full" 
                                        style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="font-semibold text-gray-900">
                                    {event.price === 0 ? 'Free' : formatCurrency(event.price)}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEventAction(event._id, 'view')}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEventAction(event._id, 'edit')}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Event
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                          <AlertCircle className="w-4 h-4 mr-2" />
                                          Change Status
                                          <ChevronDown className="w-4 h-4 ml-auto" />
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                          <DropdownMenuItem onClick={() => handleEventAction(event._id, 'updateStatus', 'open')}>
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                            Open
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEventAction(event._id, 'updateStatus', 'cancelled')}>
                                            <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                            Cancelled
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEventAction(event._id, 'updateStatus', 'completed')}>
                                            <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                                            Completed
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEventAction(event._id, 'updateStatus', 'pending')}>
                                            <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                                            Pending
                                          </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                      <DropdownMenuSeparator />
                                      {event.status === 'open' && (
                                        <DropdownMenuItem onClick={() => handleEventAction(event._id, 'cancel')}>
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Cancel Event
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => handleEventAction(event._id, 'delete')}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Event
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="lg:hidden space-y-4">
                        {filteredEvents.map((event) => (
                          <Card key={event._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 mb-1">{event.title}</div>
                                    <div className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        {event.type}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {event.category}
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
                                      <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEventAction(event._id, 'view')}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEventAction(event._id, 'edit')}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Event
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                          <AlertCircle className="w-4 h-4 mr-2" />
                                          Change Status
                                          <ChevronDown className="w-4 h-4 ml-auto" />
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                          <DropdownMenuItem onClick={() => handleEventAction(event._id, 'updateStatus', 'open')}>
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                            Open
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEventAction(event._id, 'updateStatus', 'cancelled')}>
                                            <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                            Cancelled
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEventAction(event._id, 'updateStatus', 'completed')}>
                                            <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                                            Completed
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleEventAction(event._id, 'updateStatus', 'pending')}>
                                            <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                                            Pending
                                          </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                      <DropdownMenuSeparator />
                                      {event.status === 'open' && (
                                        <DropdownMenuItem onClick={() => handleEventAction(event._id, 'cancel')}>
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Cancel Event
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => handleEventAction(event._id, 'delete')}
                                        className="text-red-600"
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
                                    <div className="font-semibold text-gray-900 truncate">{event.location.venue}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500 mb-1 flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      Participants
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {event.currentParticipants}/{event.maxParticipants}
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
                        ))}
                      </div>

                      {filteredEvents.length === 0 && !loading && (
                        <div className="text-center py-8 lg:py-12">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                          <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
