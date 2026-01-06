'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertTriangle,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Eye,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  Flag,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface ReportedEvent {
  _id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  hostId: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
  };
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  image: string;
  status: string;
  isPublic: boolean;
  participants: string[];
  waitingList: string[];
  location: {
    venue: string;
    address: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
  reports: {
    _id: string;
    userId: {
      _id: string;
      fullName: string;
      email: string;
      profileImage: string;
    };
    reason: string;
    description: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: string;
  }[];
}

interface ReportedEventsResponse {
  events: ReportedEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function AdminReportedEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<ReportedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    fetchReportedEvents();
  }, [user, currentPage, searchTerm, statusFilter]);

  const fetchReportedEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });
      
      const response = await api.get(`/admin/events/reported?${params}`);
      const data: ReportedEventsResponse = response.data.data;
      setEvents(data.events || []);
      setTotalEvents(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (error: any) {
      console.error('Error fetching reported events:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied: You do not have permission to manage reported events');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required: Please log in again');
      } else {
        toast.error('Failed to load reported events: Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async (action: string, eventId: string, reportId?: string) => {
    try {
      switch (action) {
        case 'view':
          router.push(`/events/${eventId}`);
          break;
        case 'resolveReport':
          if (reportId) {
            await api.patch(`/admin/events/reports/${reportId}/resolve`);
            toast.success('Report resolved successfully');
            fetchReportedEvents();
          }
          break;
        case 'dismissReport':
          if (reportId) {
            await api.patch(`/admin/events/reports/${reportId}/dismiss`);
            toast.success('Report dismissed successfully');
            fetchReportedEvents();
          }
          break;
        case 'deleteEvent':
          if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            await api.delete(`/admin/events/${eventId}`);
            toast.success('Event deleted successfully');
            fetchReportedEvents();
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to perform action: ${action}`);
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

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getPendingReportsCount = (event: ReportedEvent) => {
    return event.reports.filter(report => report.status === 'pending').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-orange-100 rounded-full mx-auto"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Loading reported events...</div>
          <div className="text-sm text-gray-500 mt-1">Please wait while we fetch reported event data</div>
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
                    Back to Admin
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                      <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
                      Reported Events
                    </h1>
                    <p className="text-gray-600">Manage and review reported events</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    {totalEvents} Total Reports
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reported events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Reports</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 text-lg font-medium">No reported events found</div>
                  <p className="text-sm text-gray-400 mt-2">
                    {totalEvents === 0 
                      ? "Great! No events have been reported." 
                      : "Try adjusting your search or filters"
                    }
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <Card key={event._id} className="bg-white shadow-sm border hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {event.image ? (
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                  <AlertTriangle className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{event.title}</h3>
                                <Badge className={`border ${getStatusColor(event.status)}`}>
                                  {event.status}
                                </Badge>
                                <Badge className={`border ${getCategoryColor(event.category)}`}>
                                  {event.category}
                                </Badge>
                                {getPendingReportsCount(event) > 0 && (
                                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                    <Flag className="h-3 w-3 mr-1" />
                                    {getPendingReportsCount(event)} Pending
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(event.date)}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {event.time}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {event.location.city}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {event.currentParticipants}/{event.maxParticipants}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {formatPrice(event.price)}
                                </div>
                              </div>
                              
                              {/* Reports Section */}
                              <div className="border-t pt-3">
                                <div className="text-sm font-medium text-gray-700 mb-2">Recent Reports:</div>
                                <div className="space-y-2">
                                  {event.reports.slice(0, 2).map((report) => (
                                    <div key={report._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <div className="flex items-center space-x-2">
                                        <Avatar className="h-6 w-6">
                                          {report.userId.profileImage ? (
                                            <AvatarImage src={report.userId.profileImage} alt={report.userId.fullName} />
                                          ) : (
                                            <AvatarFallback className="text-xs">
                                              {report.userId.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                          )}
                                        </Avatar>
                                        <div>
                                          <div className="text-sm font-medium">{report.userId.fullName}</div>
                                          <div className="text-xs text-gray-500">{report.reason}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Badge className={`text-xs border ${getReportStatusColor(report.status)}`}>
                                          {report.status}
                                        </Badge>
                                        {report.status === 'pending' && (
                                          <div className="flex space-x-1">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleEventAction('resolveReport', event._id, report._id)}
                                              className="h-6 px-2 text-xs"
                                            >
                                              <CheckCircle className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleEventAction('dismissReport', event._id, report._id)}
                                              className="h-6 px-2 text-xs"
                                            >
                                              <XCircle className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {event.reports.length > 2 && (
                                    <div className="text-xs text-gray-500 text-center">
                                      +{event.reports.length - 2} more reports
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEventAction('view', event._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/events/${event._id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleEventAction('deleteEvent', event._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalEvents)} of {totalEvents} reported events
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
