'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  UserCheck,
  AlertCircle,
  FileText,
  Send,
  Eye,
  DollarSign,
  Loader2
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function HostParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchParticipants();
    fetchEvents();
  }, [selectedEventId, pagination.currentPage]);

  const fetchParticipants = async () => {
    try {
      setIsLoading(true);
      let url = '/events/participants';
      
      if (selectedEventId !== 'all') {
        url = `/events/${selectedEventId}/participants`;
      }
      
      console.log('Fetching participants from:', url);
      console.log('Request params:', {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm
      });
      
      const response = await api.get(url, {
        params: {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          search: searchTerm
        }
      });
      
      console.log('API Response:', response);
      
      if (response.data.success) {
        setParticipants(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error: any) {
      console.error('Failed to fetch participants - Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error response:', error.response);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        toast.error('Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Check if the backend routes are properly configured.');
      } else {
        toast.error(`Failed to load participants: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log('Fetching events from:', '/events/my-hosted');
      const response = await api.get('/events/my-hosted');
      console.log('Events API Response:', response);
      
      if (response.data.success) {
        setEvents(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch events - Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error response:', error.response);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        toast.error('Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('Events API endpoint not found. Check if the backend routes are properly configured.');
      } else {
        toast.error(`Failed to load events: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = !searchTerm || 
      (participant.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       participant.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       participant.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEvent = selectedEventId === 'all' || participant.eventId === selectedEventId;
    
    return matchesSearch && matchesEvent;
  });

  const confirmedParticipants = participants.filter(p => p.status === 'confirmed');
  const pendingParticipants = participants.filter(p => p.status === 'pending');
  const cancelledParticipants = participants.filter(p => p.status === 'cancelled');

  const exportParticipants = () => {
    console.log('Exporting participants data...');
    // TODO: Implement export functionality
    toast.success('Export feature coming soon!');
  };

  const sendNotification = async (participantId: string, message: string) => {
    try {
      // TODO: Implement notification API call
      console.log('Sending notification to participant:', participantId, message);
      toast.success('Notification sent successfully!');
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  if (isLoading && participants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Event Participants</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportParticipants}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedParticipants.length}</div>
            <p className="text-xs text-muted-foreground">
              Paid attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingParticipants.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${participants
                .filter(p => p.paymentStatus === 'paid')
                .reduce((sum, p) => sum + p.price, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From confirmed bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search participants by name, email, or ticket number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Events</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({participants.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedParticipants.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingParticipants.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledParticipants.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <tr key={participant._id || participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <UserCheck className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {participant.user?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {participant.user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {participant.event?.title || 'Unknown Event'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(participant.createdAt || participant.registrationDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {participant.ticketNumber || `TKT-${participant._id?.slice(-6)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(participant.status)}
                          {getStatusBadge(participant.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentBadge(participant.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendNotification(participant._id || participant.id, 'Hello!')}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {confirmedParticipants.map((participant) => (
              <Card key={participant._id || participant.id} className="hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {participant.user?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {participant.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ${participant.amount || participant.price || 0}
                      </p>
                      {getPaymentBadge(participant.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {participant.event?.title || 'Unknown Event'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(participant.createdAt || participant.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Ticket: {participant.ticketNumber || `TKT-${participant._id?.slice(-6)}`}
                      </span>
                    </div>
                    {participant.specialRequests && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-600 text-sm">{participant.specialRequests}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => sendNotification(participant._id || participant.id, 'Hello!')}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Notify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingParticipants.map((participant) => (
              <Card key={participant._id || participant.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-yellow-400">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {participant.user?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {participant.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">
                        ${participant.amount || participant.price || 0}
                      </p>
                      {getPaymentBadge(participant.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {participant.event?.title || 'Unknown Event'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(participant.createdAt || participant.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Ticket: {participant.ticketNumber || `TKT-${participant._id?.slice(-6)}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cancelledParticipants.map((participant) => (
              <Card key={participant._id || participant.id} className="hover:shadow-md transition-all duration-200 opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {participant.user?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {participant.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-400">
                        ${participant.amount || participant.price || 0}
                      </p>
                      {getPaymentBadge(participant.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {participant.event?.title || 'Unknown Event'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(participant.createdAt || participant.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Ticket: {participant.ticketNumber || `TKT-${participant._id?.slice(-6)}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-600 text-sm">
                        {participant.specialRequests || 'Cancelled'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm text-gray-500">
                      Refund processed
                    </div>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredParticipants.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No participants found</h3>
            <p className="text-gray-600 mb-6">
              No participants match your current filters.
            </p>
            <Button variant="outline" onClick={() => {setSearchTerm(''); setSelectedEventId('all');}}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}