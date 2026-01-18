/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Star,
  CheckCircle,
  XCircle,
  Shield,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';

interface HostDetails {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: any;
  };
  interests?: string[];
  isVerified: boolean;
  isActive: boolean;
  userStatus: 'active' | 'suspended' | 'pending' | 'inactive';
  role: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
  suspensionReason?: string;
  suspendedAt?: string;
  verifiedAt?: string;
  stripeAccountId?: string;
}

interface BackendResponse {
  success: boolean;
  message: string;
  data: {
    user: HostDetails;
    events: {
      hosted: {
        count: number;
        items: any[];
      };
      joined: {
        count: number;
        items: any[];
      };
    };
    ratings: {
      averageRating: number;
      totalReviews: number;
      distribution: any;
      reviewsReceived: any[];
      reviewsGiven: any[];
    };
    bookings: {
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      completed: number;
      totalSpent: number;
    };
  };
  timestamp: string;
}

interface ExtendedHostDetails extends HostDetails {
  avgRating?: number;
  totalEvents?: number;
  totalBookings?: number;
  totalRevenue?: number;
  hostStats?: {
    totalEvents: number;
    hostedEvents: number;
    joinedEvents: number;
    activeEvents: number;
    completedEvents: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    totalRevenue: number;
  };
}

export default function HostDetailsPage() {
  const params = useParams();
  const hostId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { user } = useAuth();

  const [host, setHost] = useState<ExtendedHostDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  // Fetch host details
  useEffect(() => {
    const fetchHostDetails = async () => {
      if (!hostId) {
        setError({ status: 400, message: 'Invalid host ID' });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching host details for ID:', hostId);
        const response = await api.get<BackendResponse>(`/hosts/${hostId}/details`);
        
        if (response.data?.data?.user) {
          const userData = response.data.data.user;
          const eventsData = response.data.data.events;
          const ratingsData = response.data.data.ratings;
          const bookingsData = response.data.data.bookings;

          // Combine user data with stats
          const extendedHost: ExtendedHostDetails = {
            ...userData,
            avgRating: ratingsData?.averageRating || userData.averageRating || 0,
            totalReviews: ratingsData?.totalReviews || userData.totalReviews || 0,
            totalEvents: eventsData?.hosted?.count || 0,
            totalBookings: bookingsData?.total || 0,
            totalRevenue: bookingsData?.totalSpent || 0,
            hostStats: {
              totalEvents: eventsData?.hosted?.count || 0,
              hostedEvents: eventsData?.hosted?.count || 0,
              joinedEvents: eventsData?.joined?.count || 0,
              activeEvents: 0, // This would need to be calculated from items if needed
              completedEvents: 0, // This would need to be calculated from items if needed
              totalBookings: bookingsData?.total || 0,
              confirmedBookings: bookingsData?.confirmed || 0,
              pendingBookings: bookingsData?.pending || 0,
              cancelledBookings: bookingsData?.cancelled || 0,
              completedBookings: bookingsData?.completed || 0,
              totalRevenue: bookingsData?.totalSpent || 0,
            }
          };

          setHost(extendedHost);
        } else {
          setError({ status: 500, message: 'Failed to load host details' });
          toast.error('Failed to load host details');
        }
      } catch (error: any) {
        console.error('Error fetching host details:', error);
        
        if (error.response?.status === 404) {
          setError({ status: 404, message: 'Host not found' });
          toast.error('Host not found');
        } else if (error.response?.status === 403) {
          setError({ status: 403, message: 'Access denied' });
          toast.error('Access denied');
        } else {
          setError({ status: 500, message: 'Failed to load host details' });
          toast.error('Failed to load host details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHostDetails();
  }, [hostId]);

  const handleVerify = async () => {
    if (!host) return;
    
    try {
      setActionLoading(true);
      const response = await api.patch(`/admin/hosts/${hostId}/verify`);
      
      if (response.data?.success) {
        toast.success('Host verified successfully');
        setHost(prev => prev ? { ...prev, isVerified: true, verifiedAt: new Date().toISOString() } : null);
      } else {
        toast.error('Failed to verify host');
      }
    } catch (error: any) {
      console.error('Error verifying host:', error);
      toast.error(error.response?.data?.message || 'Failed to verify host');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnverify = async () => {
    if (!host) return;
    
    try {
      setActionLoading(true);
      const response = await api.patch(`/admin/hosts/${hostId}/unverify`);
      
      if (response.data?.success) {
        toast.success('Host verification removed');
        setHost(prev => prev ? { ...prev, isVerified: false } : null);
      } else {
        toast.error('Failed to remove verification');
      }
    } catch (error: any) {
      console.error('Error removing verification:', error);
      toast.error(error.response?.data?.message || 'Failed to remove verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!host) return;
    
    const reason = window.prompt('Please provide a reason for suspension:');
    if (!reason) return;
    
    try {
      setActionLoading(true);
      const response = await api.patch(`/admin/hosts/${hostId}/suspend`, { reason });
      
      if (response.data?.success) {
        toast.success('Host suspended successfully');
        setHost(prev => prev ? { 
          ...prev, 
          userStatus: 'suspended', 
          suspensionReason: reason,
          suspendedAt: new Date().toISOString()
        } : null);
      } else {
        toast.error('Failed to suspend host');
      }
    } catch (error: any) {
      console.error('Error suspending host:', error);
      toast.error(error.response?.data?.message || 'Failed to suspend host');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinstate = async () => {
    if (!host) return;
    
    try {
      setActionLoading(true);
      const response = await api.patch(`/admin/hosts/${hostId}/reinstate`);
      
      if (response.data?.success) {
        toast.success('Host reinstated successfully');
        setHost(prev => prev ? { ...prev, userStatus: 'active' } : null);
      } else {
        toast.error('Failed to reinstate host');
      }
    } catch (error: any) {
      console.error('Error reinstating host:', error);
      toast.error(error.response?.data?.message || 'Failed to reinstate host');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!host) return;
    
    try {
      setActionLoading(true);
      const response = await api.patch(`/admin/hosts/${hostId}/approve`);
      
      if (response.data?.success) {
        toast.success('Host approved successfully');
        setHost(prev => prev ? { 
          ...prev, 
          userStatus: 'active',
          isVerified: true
        } : null);
      } else {
        toast.error('Failed to approve host');
      }
    } catch (error: any) {
      console.error('Error approving host:', error);
      toast.error(error.response?.data?.message || 'Failed to approve host');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!host) return;
    
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      setActionLoading(true);
      const response = await api.patch(`/admin/hosts/${hostId}/reject`, { reason });
      
      if (response.data?.success) {
        toast.success('Host rejected successfully');
        setHost(prev => prev ? { 
          ...prev, 
          userStatus: 'suspended',
          suspensionReason: reason
        } : null);
      } else {
        toast.error('Failed to reject host');
      }
    } catch (error: any) {
      console.error('Error rejecting host:', error);
      toast.error(error.response?.data?.message || 'Failed to reject host');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'admin') {
    return <ProtectedRoute requiredRole="admin"><div></div></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/admin/hosts">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-600 hover:bg-slate-700 text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Hosts
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl font-bold text-white">Host Details</h1>
                  <p className="text-slate-400 text-sm mt-1">Manage host information and status</p>
                </div>
              </div>
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-4" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-2xl bg-slate-800">
                  <CardContent className="p-6">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-2xl bg-slate-800">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : error ? (
            <Card className="border-0 shadow-2xl bg-slate-800">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {error.status === 404 ? 'Host Not Found' : 'Error Loading Host'}
                  </h2>
                  <p className="text-slate-300 mb-6">{error.message}</p>
                  
                  <div className="bg-slate-900 rounded-lg p-4 mb-6 text-left border border-slate-700">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong className="text-slate-100">Host ID:</strong> <span className="font-mono text-cyan-400">{hostId}</span>
                    </p>
                    <p className="text-sm text-slate-300 mb-2">
                      <strong className="text-slate-100">Error Status:</strong> <span className="font-mono text-orange-400">{error.status}</span>
                    </p>
                    <p className="text-sm text-slate-100 font-semibold mb-2">Possible reasons:</p>
                    <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                      {error.status === 404 ? (
                        <>
                          <li>The host ID may be incorrect or invalid</li>
                          <li>The host may have been deleted</li>
                          <li>The host may not exist in the database</li>
                        </>
                      ) : error.status === 403 ? (
                        <>
                          <li>You don&apos;t have permission to view this host</li>
                          <li>Your session may have expired</li>
                        </>
                      ) : (
                        <>
                          <li>Server connection issue</li>
                          <li>Database may be unavailable</li>
                          <li>Network connectivity problem</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                    <Link href="/dashboard/admin/hosts">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Hosts List
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : host ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar - Host Profile Card */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 sticky top-4 bg-slate-800 border-l-4 border-l-blue-500">
                  <CardContent className="p-6 text-center">
                    {/* Profile Image */}
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden border-4 border-slate-700 shadow-lg">
                      {host.profileImage ? (
                        <img
                          src={host.profileImage}
                          alt={host.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <UsersIcon className="w-16 h-16 text-white" />
                      )}
                    </div>

                    {/* Name and Role */}
                    <h2 className="text-2xl font-bold text-white mb-2">{host.fullName}</h2>
                    <Badge className="bg-blue-500/20 text-blue-300 mb-4 font-semibold border border-blue-500/50">
                      {host.role || 'User'}
                    </Badge>

                    {/* Status Badge */}
                    <div className="mb-6">
                      <Badge className={`${getStatusColor(host.userStatus)} text-sm font-semibold px-3 py-1`}>
                        {host.userStatus.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Verification Badge */}
                    <div className="mb-6 space-y-2">
                      {host.isVerified ? (
                        <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/30">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Verified Host</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-yellow-400 bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/30">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Unverified</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold text-white">
                          {(host.avgRating || host.averageRating || 0).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Based on {host.totalReviews || 0} reviews
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="truncate font-medium">{host.email}</span>
                      </div>
                      {host.phone && (
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <Phone className="w-4 h-4 text-blue-400" />
                          <span>{host.phone}</span>
                        </div>
                      )}
                      {host.location?.city && (
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          <span>
                            {host.location.city}
                            {host.location.state && `, ${host.location.state}`}
                            {host.location.country && `, ${host.location.country}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-700 mb-6" />

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {host.userStatus === 'pending' ? (
                        <>
                          <Button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Host
                          </Button>
                          <Button
                            onClick={handleReject}
                            disabled={actionLoading}
                            variant="outline"
                            className="w-full text-red-400 border-red-500/50 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <>
                          {!host.isVerified ? (
                            <Button
                              onClick={handleVerify}
                              disabled={actionLoading}
                              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold shadow-lg"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Verify Host
                            </Button>
                          ) : (
                            <Button
                              onClick={handleUnverify}
                              disabled={actionLoading}
                              variant="outline"
                              className="w-full text-orange-400 border-orange-500/50 hover:bg-orange-500/10"
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Remove Verification
                            </Button>
                          )}

                          {host.userStatus === 'active' && (
                            <Button
                              onClick={handleSuspend}
                              disabled={actionLoading}
                              variant="outline"
                              className="w-full text-red-400 border-red-500/50 hover:bg-red-500/10"
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Suspend Host
                            </Button>
                          )}

                          {host.userStatus === 'suspended' && (
                            <Button
                              onClick={handleReinstate}
                              disabled={actionLoading}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              Reinstate Host
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Section */}
                {host.bio && (
                  <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-slate-800 border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed">{host.bio}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Host Statistics */}
                <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-slate-800 border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Activity Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Events</p>
                            <p className="text-3xl font-bold text-blue-300 mt-2">
                              {host.hostStats?.totalEvents || host.totalEvents || 0}
                            </p>
                          </div>
                          <CalendarIcon className="w-10 h-10 text-blue-400/30" />
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Bookings</p>
                            <p className="text-3xl font-bold text-green-300 mt-2">
                              {host.hostStats?.totalBookings || host.totalBookings || 0}
                            </p>
                          </div>
                          <UsersIcon className="w-10 h-10 text-green-400/30" />
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Revenue</p>
                            <p className="text-3xl font-bold text-purple-300 mt-2">
                              ${(host.hostStats?.totalRevenue || host.totalRevenue || 0).toFixed(2)}
                            </p>
                          </div>
                          <DollarSign className="w-10 h-10 text-purple-400/30" />
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hosted Events</p>
                            <p className="text-3xl font-bold text-orange-300 mt-2">
                              {host.hostStats?.hostedEvents || 0}
                            </p>
                          </div>
                          <Eye className="w-10 h-10 text-orange-400/30" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Details */}
                {host.hostStats && (
                  <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-slate-800 border-l-4 border-l-cyan-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <UsersIcon className="w-5 h-5 text-cyan-400" />
                        Booking Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Confirmed</p>
                          <p className="text-2xl font-bold text-green-300 mt-2">
                            {host.hostStats.confirmedBookings || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Pending</p>
                          <p className="text-2xl font-bold text-yellow-300 mt-2">
                            {host.hostStats.pendingBookings || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Completed</p>
                          <p className="text-2xl font-bold text-blue-300 mt-2">
                            {host.hostStats.completedBookings || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Cancelled</p>
                          <p className="text-2xl font-bold text-red-300 mt-2">
                            {host.hostStats.cancelledBookings || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 col-span-2">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Revenue</p>
                          <p className="text-2xl font-bold text-purple-300 mt-2">
                            ${(host.hostStats.totalRevenue || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Account Information */}
                <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-slate-800 border-l-4 border-l-indigo-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 font-semibold uppercase">Joined Date</p>
                        <p className="text-sm text-white font-medium mt-2">
                          {formatDate(host.createdAt)}
                        </p>
                      </div>

                      {host.verifiedAt && (
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Verified Date</p>
                          <p className="text-sm text-green-300 font-medium mt-2">
                            {formatDate(host.verifiedAt)}
                          </p>
                        </div>
                      )}

                      {host.suspendedAt && host.userStatus === 'suspended' && (
                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 sm:col-span-2">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Suspended Date</p>
                          <p className="text-sm text-red-300 font-medium mt-2">
                            {formatDate(host.suspendedAt)}
                          </p>
                          {host.suspensionReason && (
                            <>
                              <p className="text-xs text-slate-400 font-semibold uppercase mt-3">Suspension Reason</p>
                              <p className="text-sm text-red-300 mt-1">{host.suspensionReason}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Interests */}
                {host.interests && host.interests.length > 0 && (
                  <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-slate-800 border-l-4 border-l-pink-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white">Interests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {host.interests.map((interest, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="bg-pink-500/10 text-pink-300 border-pink-500/50"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="border-0 shadow-2xl bg-slate-800">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300">No host data available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
