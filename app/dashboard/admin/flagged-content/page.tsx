'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
// import AdminSidebar from '../components/AdminSidebar';
import { toast } from 'react-hot-toast';
import { getFlaggedContent, reviewFlaggedContent, FlaggedEvent } from '@/app/lib/adminActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Calendar,
  User,
  Flag,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function AdminFlaggedContentPage() {
  const { user } = useAuth();
  const [flaggedEvents, setFlaggedEvents] = useState<FlaggedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const fetchFlaggedContent = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getFlaggedContent(page, 10);
      setFlaggedEvents(response.data.events);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Error fetching flagged content:', error);
      toast.error('Failed to load flagged content');
    } finally {
      setLoading(false);
    }
  };

  const handleContentAction = async (contentId: string, action: string) => {
    try {
      switch (action) {
        case 'approve':
          await reviewFlaggedContent(contentId, 'approve');
          setFlaggedEvents(flaggedEvents.filter(item => item._id !== contentId));
          toast.success('Content approved and flag removed');
          break;
        case 'remove':
          await reviewFlaggedContent(contentId, 'remove');
          setFlaggedEvents(flaggedEvents.filter(item => item._id !== contentId));
          toast.success('Content removed successfully');
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on content ${contentId}:`, error);
      toast.error(`Failed to perform action: ${action}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'removed':
        return <Badge className="bg-red-100 text-red-800">Removed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
      
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Flagged Content</h1>
                <p className="text-sm sm:text-base text-gray-600">Review and moderate flagged content</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Flagged</CardTitle>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Flag className="h-4 w-4 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{pagination.total}</div>
                    <p className="text-xs text-gray-500 mt-1">Flagged items</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {flaggedEvents.filter(item => item.status === 'pending').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {flaggedEvents.filter(item => item.status === 'approved').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Content approved</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Removed</CardTitle>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {flaggedEvents.filter(item => item.status === 'removed').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Content removed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Flagged Content Table */}
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-semibold text-gray-900">Flagged Events ({flaggedEvents.length})</span>
                      <div className="text-sm font-normal text-gray-600 mt-1">
                        Review and moderate flagged content
                      </div>
                    </div>
                    <Button 
                      onClick={() => fetchFlaggedContent()}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading flagged content...</p>
                    </div>
                  ) : flaggedEvents.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                        <Flag className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged content</h3>
                      <p className="text-gray-600">No content has been flagged for review</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50 border-b">
                          <TableRow>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Event</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Flagged By</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Reason</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Status</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Date</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-right py-4 px-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flaggedEvents.map((event) => (
                            <TableRow key={event._id} className="hover:bg-gray-50 transition-colors border-b">
                              <TableCell className="py-4 px-6">
                                <div>
                                  <p className="font-medium text-gray-900">{event.title}</p>
                                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{event.description}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{event.flaggedBy}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="max-w-xs">
                                  <p className="text-sm text-gray-600 line-clamp-2">{event.reason}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                {getStatusBadge(event.status)}
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="text-sm text-gray-600">
                                  {formatDate(event.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="hover:bg-gray-100 p-2">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 border shadow-lg z-50">
                                    <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">
                                      <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                      <span>View Details</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {event.status === 'pending' && (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={() => handleContentAction(event._id, 'approve')} 
                                          className="text-green-600 hover:bg-green-50 cursor-pointer"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          <span>Approve</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleContentAction(event._id, 'remove')} 
                                          className="text-red-600 hover:bg-red-50 cursor-pointer"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          <span>Remove</span>
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
