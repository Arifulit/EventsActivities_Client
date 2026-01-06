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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/app/components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  MapPin,
  Calendar,
  Star,
  User,
  Loader2,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface HostLocation {
  city: string;
}

interface Host {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
  bio?: string;
  interests?: string[];
  isVerified: boolean;
  isActive: boolean;
  userStatus: string;
  suspensionReason?: string;
  averageRating?: number;
  totalReviews?: number;
  stripeAccountId?: string;
  hostedEvents?: string[];
  joinedEvents?: string[];
  savedEvents?: string[];
  createdAt: string;
  updatedAt: string;
  location?: HostLocation;
  eventCount: number;
  avgRating: number;
}

interface HostsResponse {
  success: boolean;
  data: {
    hosts: Host[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
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

export default function AdminHosts() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHosts, setTotalHosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 20;

  // Fetch hosts from API
  const fetchHosts = async (showRefreshLoading = false, page = currentPage) => {
    try {
      if (showRefreshLoading) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(verificationFilter !== 'all' && { isVerified: verificationFilter })
      });
      
      const response = await api.get<HostsResponse>(`/admin/hosts?${params}`);
      const data = response.data?.data;
      
      if (data && Array.isArray(data.hosts)) {
        setHosts(data.hosts);
        setTotalHosts(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setHosts([]);
        setTotalHosts(0);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Error fetching hosts:', error);
      setHosts([]);
      setTotalHosts(0);
      setTotalPages(1);
      
      if (error.response?.status === 403) {
        toast.error('Access denied: You do not have permission to manage hosts');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required: Please log in again');
      } else if (error.response?.status === 500) {
        toast.error('Server error: Please try again later');
      } else {
        toast.error('Failed to load hosts');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHosts(false, 1);
  }, [searchTerm, statusFilter, verificationFilter]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchHosts(false, currentPage);
    }
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchHosts(false, 1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, verificationFilter]);

  // Calculate host statistics
  const stats = useMemo(() => {
    if (!Array.isArray(hosts)) {
      return { 
        total: 0, 
        active: 0, 
        suspended: 0, 
        verified: 0, 
        unverified: 0,
        pending: 0
      };
    }
    
    return {
      total: hosts.length,
      active: hosts.filter(h => h.userStatus === 'active').length,
      suspended: hosts.filter(h => h.userStatus === 'suspended').length,
      pending: hosts.filter(h => h.userStatus === 'pending').length,
      verified: hosts.filter(h => h.isVerified).length,
      unverified: hosts.filter(h => !h.isVerified).length
    };
  }, [hosts]);

  const handleHostAction = async (hostId: string, action: string) => {
    try {
      setActionLoading(hostId);
      
      switch (action) {
        case 'view':
          router.push(`/dashboard/admin/hosts/${hostId}`);
          break;
        case 'approve':
          const approveResponse = await api.patch(`/admin/hosts/${hostId}/approve`);
          if (approveResponse.data?.success) {
            toast.success('Host approved successfully');
            // Update host locally
            setHosts(prev => prev.map(host => 
              host._id === hostId 
                ? { ...host, isVerified: true, userStatus: 'active' }
                : host
            ));
          } else {
            toast.error('Failed to approve host');
          }
          break;
        case 'reject':
          const reason = window.prompt('Please provide a reason for rejection:');
          if (!reason) {
            setActionLoading(null);
            return;
          }
          
          const rejectResponse = await api.patch(`/admin/hosts/${hostId}/reject`, { reason });
          if (rejectResponse.data?.success) {
            toast.success('Host rejected successfully');
            // Update host locally
            setHosts(prev => prev.map(host => 
              host._id === hostId 
                ? { ...host, isVerified: false, userStatus: 'suspended', suspensionReason: reason }
                : host
            ));
          } else {
            toast.error('Failed to reject host');
          }
          break;
        case 'suspend':
          const suspendReason = window.prompt('Please provide a reason for suspension:');
          if (!suspendReason) {
            setActionLoading(null);
            return;
          }
          
          const suspendResponse = await api.patch(`/admin/hosts/${hostId}/suspend`, { reason: suspendReason });
          if (suspendResponse.data?.success) {
            toast.success('Host suspended successfully');
            setHosts(prev => prev.map(host => 
              host._id === hostId 
                ? { ...host, userStatus: 'suspended', suspensionReason: suspendReason }
                : host
            ));
          } else {
            toast.error('Failed to suspend host');
          }
          break;
        case 'reinstate':
          const reinstateResponse = await api.patch(`/admin/hosts/${hostId}/reinstate`);
          if (reinstateResponse.data?.success) {
            toast.success('Host reinstated successfully');
            setHosts(prev => prev.map(host => 
              host._id === hostId 
                ? { ...host, userStatus: 'active', suspensionReason: '' }
                : host
            ));
          } else {
            toast.error('Failed to reinstate host');
          }
          break;
        case 'verify':
          const verifyResponse = await api.patch(`/admin/hosts/${hostId}/verify`);
          if (verifyResponse.data?.success) {
            toast.success('Host verified successfully');
            setHosts(prev => prev.map(host => 
              host._id === hostId 
                ? { ...host, isVerified: true }
                : host
            ));
          } else {
            toast.error('Failed to verify host');
          }
          break;
        case 'unverify':
          const unverifyResponse = await api.patch(`/admin/hosts/${hostId}/unverify`);
          if (unverifyResponse.data?.success) {
            toast.success('Host verification removed successfully');
            setHosts(prev => prev.map(host => 
              host._id === hostId 
                ? { ...host, isVerified: false }
                : host
            ));
          } else {
            toast.error('Failed to remove host verification');
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      console.error(`Error performing ${action} on host ${hostId}:`, error);
      const errorMessage = error.response?.data?.message || `Failed to perform action: ${action}`;
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = () => {
    // Export functionality - could download CSV/Excel
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
        + ["Name,Email,Status,Verified,Events,Rating,Joined Date"].join("\n")
        + "\n"
        + hosts.map(host => 
            `"${host.fullName}","${host.email}","${host.userStatus}","${host.isVerified ? 'Yes' : 'No'}","${host.eventCount}","${host.avgRating.toFixed(1)}","${formatDate(host.createdAt)}"`
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hosts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Hosts exported successfully');
    } catch (error) {
      console.error('Error exporting hosts:', error);
      toast.error('Failed to export hosts');
    }
  };

  const handleRefresh = () => {
    fetchHosts(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setVerificationFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxPagesToShow - 1);
      
      if (end - start + 1 < maxPagesToShow) {
        start = Math.max(1, end - maxPagesToShow + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-blue-600 rounded-xl shadow-md">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Hosts Management
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage and approve event hosts in the system</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleExport}
                  className="border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm"
                  disabled={loading || hosts.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  disabled={refreshing || loading}
                  className="border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6 sm:mb-8">
            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-800">Total Hosts</CardTitle>
                <div className="p-2 bg-blue-600 rounded-xl shadow-md">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold animate-pulse text-blue-300">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-900">{totalHosts}</div>
                    <p className="text-xs text-blue-600 mt-1 font-medium">All registered hosts</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-800">Active</CardTitle>
                <div className="p-2 bg-green-600 rounded-xl shadow-md">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold animate-pulse text-green-300">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-900">{stats.active}</div>
                    <p className="text-xs text-green-600 mt-1 font-medium">Currently active</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-red-800">Suspended</CardTitle>
                <div className="p-2 bg-red-600 rounded-xl shadow-md">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold animate-pulse text-red-300">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-red-900">{stats.suspended}</div>
                    <p className="text-xs text-red-600 mt-1 font-medium">Suspended hosts</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-800">Verified</CardTitle>
                <div className="p-2 bg-purple-600 rounded-xl shadow-md">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold animate-pulse text-purple-300">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-900">{stats.verified}</div>
                    <p className="text-xs text-purple-600 mt-1 font-medium">Verified hosts</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-yellow-800">Pending</CardTitle>
                <div className="p-2 bg-yellow-600 rounded-xl shadow-md">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold animate-pulse text-yellow-300">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                    <p className="text-xs text-yellow-600 mt-1 font-medium">Need verification</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hosts Management */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <div className="p-2 bg-blue-600 rounded-xl shadow-md">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Hosts List
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    View, approve, and manage all hosts in the system
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing {Math.min((currentPage - 1) * limit + 1, totalHosts)}-{Math.min(currentPage * limit, totalHosts)} of {totalHosts}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search hosts by name, email, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 sm:h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 sm:h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                    <SelectTrigger className="h-10 sm:h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm">
                      <SelectValue placeholder="Verification" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 rounded-lg shadow-lg">
                      <SelectItem value="all">All Verification</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleResetFilters}
                    variant="outline" 
                    className="h-10 sm:h-11 border-gray-200 hover:bg-gray-50 rounded-lg text-sm"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-500">Loading hosts...</p>
                  </div>
                </div>
              ) : hosts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hosts found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                  <Button 
                    onClick={handleResetFilters}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm min-w-full">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableRow className="border-b border-gray-200">
                            <TableHead className="font-semibold text-gray-700 py-3">Host</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Contact</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Location</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Status</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Events</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Rating</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-3">Joined</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 py-3 pr-4">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {hosts.map((host, index) => (
                            <TableRow 
                              key={host._id} 
                              className={`hover:bg-blue-50 transition-colors border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                            >
                              <TableCell className="py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                    {host.profileImage ? (
                                      <img
                                        src={host.profileImage}
                                        alt={host.fullName}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<User className="h-5 w-5 text-gray-400" />';
                                        }}
                                      />
                                    ) : (
                                      <User className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm truncate">{host.fullName}</div>
                                    <div className="flex items-center gap-1 mt-1">
                                      {host.isVerified && (
                                        <Badge className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5">
                                          <CheckCircle className="h-3 w-3 mr-1 inline" />
                                          Verified
                                        </Badge>
                                      )}
                                      <Badge variant="outline" className="text-xs border-gray-200">
                                        {host.role || 'User'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{host.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span>{host.location?.city || 'Unknown'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge className={getStatusColor(host.userStatus)} variant="secondary">
                                  {host.userStatus.charAt(0).toUpperCase() + host.userStatus.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="text-sm">
                                  <div className="font-medium">{host.eventCount || 0}</div>
                                  <div className="text-gray-500 text-xs">hosted</div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-sm">{(host.avgRating || 0).toFixed(1)}</span>
                                  <span className="text-xs text-gray-500">({host.totalReviews || 0})</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  {formatDate(host.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell className="py-3 text-right pr-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="hover:bg-gray-100 p-1.5 transition-colors duration-200"
                                      onClick={(e) => e.stopPropagation()}
                                      disabled={actionLoading === host._id}
                                    >
                                      {actionLoading === host._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent 
                                    align="end" 
                                    className="w-48 border shadow-lg bg-white rounded-lg"
                                    sideOffset={5}
                                  >
                                    <DropdownMenuItem 
                                      onClick={() => handleHostAction(host._id, 'view')}
                                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                      <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    
                                    {!host.isVerified ? (
                                      <DropdownMenuItem 
                                        onClick={() => handleHostAction(host._id, 'verify')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors text-green-600"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Verify Host
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem 
                                        onClick={() => handleHostAction(host._id, 'unverify')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors text-orange-600"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Remove Verification
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {host.userStatus === 'pending' && (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={() => handleHostAction(host._id, 'approve')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors text-green-600"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleHostAction(host._id, 'reject')}
                                          className="cursor-pointer hover:bg-gray-50 transition-colors text-red-600"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    
                                    {host.userStatus === 'active' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleHostAction(host._id, 'suspend')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors text-orange-600"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Suspend Host
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {host.userStatus === 'suspended' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleHostAction(host._id, 'reinstate')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors text-green-600"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Reinstate Host
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {hosts.map((host) => (
                      <Card key={host._id} className="hover:shadow-md transition-shadow border border-gray-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
                                  {host.profileImage ? (
                                    <img
                                      src={host.profileImage}
                                      alt={host.fullName}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<User className="h-6 w-6 text-gray-400" />';
                                      }}
                                    />
                                  ) : (
                                    <User className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-base">{host.fullName}</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    {host.isVerified && (
                                      <Badge className="bg-blue-100 text-blue-800 text-xs font-medium">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs border-gray-200">
                                      {host.role || 'User'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="hover:bg-gray-100 p-2 transition-colors duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={actionLoading === host._id}
                                  >
                                    {actionLoading === host._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <MoreHorizontal className="w-4 h-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="end" 
                                  className="w-48 border shadow-lg bg-white rounded-lg"
                                  sideOffset={5}
                                >
                                  <DropdownMenuItem 
                                    onClick={() => handleHostAction(host._id, 'view')}
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                  >
                                    <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gray-100" />
                                  
                                  {!host.isVerified ? (
                                    <DropdownMenuItem 
                                      onClick={() => handleHostAction(host._id, 'verify')}
                                      className="cursor-pointer hover:bg-gray-50 transition-colors text-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Verify Host
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem 
                                      onClick={() => handleHostAction(host._id, 'unverify')}
                                      className="cursor-pointer hover:bg-gray-50 transition-colors text-orange-600"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Remove Verification
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {host.userStatus === 'pending' && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => handleHostAction(host._id, 'approve')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors text-green-600"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleHostAction(host._id, 'reject')}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors text-red-600"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  
                                  {host.userStatus === 'active' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleHostAction(host._id, 'suspend')}
                                      className="cursor-pointer hover:bg-gray-50 transition-colors text-orange-600"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Suspend Host
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {host.userStatus === 'suspended' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleHostAction(host._id, 'reinstate')}
                                      className="cursor-pointer hover:bg-gray-50 transition-colors text-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Reinstate Host
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <div className="text-gray-600">Status</div>
                                <Badge className={getStatusColor(host.userStatus)} variant="secondary">
                                  {host.userStatus.charAt(0).toUpperCase() + host.userStatus.slice(1)}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="text-gray-600">Location</div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  {host.location?.city || 'Unknown'}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-gray-600">Events</div>
                                <div className="font-medium">{host.eventCount || 0} hosted</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-gray-600">Rating</div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  {(host.avgRating || 0).toFixed(1)} ({host.totalReviews || 0})
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-gray-600">Email</div>
                                <div className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{host.email}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-gray-600">Joined</div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  {formatDate(host.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * limit, totalHosts)}
                        </span>{' '}
                        of <span className="font-medium">{totalHosts}</span> results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-9 px-3"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous</span>
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={`h-9 w-9 ${currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-9 px-3"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next</span>
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