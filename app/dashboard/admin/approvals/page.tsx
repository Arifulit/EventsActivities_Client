'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { UserCheck, Clock, CheckCircle, XCircle, Mail, Calendar, User, MapPin, Star, Loader2, Eye } from 'lucide-react';

interface HostLocation {
  city: string;
}

interface Host {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage: string;
  bio: string;
  interests: string[];
  isVerified: boolean;
  isActive: boolean;
  userStatus: string;
  suspensionReason: string;
  averageRating: number;
  totalReviews: number;
  stripeAccountId: string;
  hostedEvents: string[];
  joinedEvents: string[];
  savedEvents: string[];
  createdAt: string;
  updatedAt: string;
  location: HostLocation;
  eventCount: number;
  avgRating: number;
}

interface HostsResponse {
  hosts: Host[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function AdminApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch hosts from API
  useEffect(() => {
    const fetchHosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/hosts');
        const data = response.data?.data as HostsResponse;
        setHosts(data?.hosts || []);
      } catch (error: any) {
        console.error('Error fetching hosts:', error);
        if (error.response?.status === 403) {
          toast.error('Access denied: You do not have permission to manage hosts');
        } else if (error.response?.status === 401) {
          toast.error('Authentication required: Please log in again');
        } else {
          toast.error('Failed to load hosts: Server error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  // Calculate statistics
  const stats = {
    pending: hosts.filter(h => !h.isVerified && h.userStatus !== 'suspended').length,
    approvedToday: hosts.filter(h => h.isVerified && new Date(h.updatedAt).toDateString() === new Date().toDateString()).length,
    rejected: hosts.filter(h => h.userStatus === 'suspended').length,
    avgReviewTime: '2.5d' // This would need to be calculated based on actual data
  };

  const handleApprove = async (hostId: string) => {
    try {
      setActionLoading(hostId);
      const response = await api.patch(`/admin/hosts/${hostId}/approve`);
      
      if (response.data?.success) {
        toast.success('Host approved successfully');
        // Update host status locally
        setHosts(prev => prev.map(host => 
          host._id === hostId 
            ? { ...host, isVerified: true, userStatus: 'active' }
            : host
        ));
      } else {
        toast.error('Failed to approve host');
      }
    } catch (error: any) {
      console.error('Error approving host:', error);
      toast.error(error.response?.data?.message || 'Failed to approve host');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (hostId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      setActionLoading(hostId);
      const response = await api.patch(`/admin/hosts/${hostId}/reject`, { reason });
      
      if (response.data?.success) {
        toast.success('Host rejected successfully');
        // Update host status locally
        setHosts(prev => prev.map(host => 
          host._id === hostId 
            ? { ...host, isVerified: false, userStatus: 'suspended', suspensionReason: reason }
            : host
        ));
      } else {
        toast.error('Failed to reject host');
      }
    } catch (error: any) {
      console.error('Error rejecting host:', error);
      toast.error(error.response?.data?.message || 'Failed to reject host');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter only pending hosts for approvals
  const pendingHosts = hosts.filter(host => !host.isVerified && host.userStatus !== 'suspended');

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Host Approvals</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Export List</Button>
          <Button>Review All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.approvedToday}</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5d</div>
            <p className="text-xs text-muted-foreground">
              -0.5d from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Loading pending applications...</p>
              </div>
            </div>
          ) : pendingHosts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
              <p className="text-gray-500">All hosts have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingHosts.map((host) => (
                <div key={host._id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {host.profileImage ? (
                          <img
                            src={host.profileImage}
                            alt={host.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <UserCheck className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{host.fullName}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="w-4 h-4 mr-1" />
                          {host.email}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied: {formatDate(host.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {host.location?.city || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Experience</h4>
                      <p className="text-sm text-gray-600">
                        {host.bio || 'No experience information provided'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Event Types</h4>
                      <p className="text-sm text-gray-600">
                        {host.interests && host.interests.length > 0 
                          ? host.interests.join(', ')
                          : 'No specific interests mentioned'
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Events Activity</h4>
                      <p className="text-sm text-gray-600">
                        {host.eventCount} events hosted, {host.joinedEvents.length} events joined
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Rating</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{host.avgRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({host.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/dashboard/admin/hosts/${host._id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" disabled>
                        Download Documents
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(host._id)}
                        disabled={actionLoading === host._id}
                      >
                        {actionLoading === host._id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(host._id)}
                        disabled={actionLoading === host._id}
                      >
                        {actionLoading === host._id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  );
}
