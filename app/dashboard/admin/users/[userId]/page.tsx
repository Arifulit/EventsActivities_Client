'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getAdminUsers, verifyUser, banUser, unbanUser, AdminUser } from '@/app/lib/admin';
import { api } from '@/app/lib/api';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  SelectValue,
} from '@/app/components/ui/dropdown-menu';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  MapPin,
  Shield,
  Crown,
  Star,
  CheckCircle,
  XCircle,
  Users,
  Activity,
  Award,
  UserCheck,
  Ban,
  UserX,
  Edit,
  Loader2,
  Heart,
  Briefcase
} from 'lucide-react';

export default function UserDetailsPage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [userActivity, setUserActivity] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin
    if (currentUser && currentUser.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, currentUser, router]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminUsers();
      const foundUser = response.data.find(u => u._id === userId);
      
      if (!foundUser) {
        toast.error('User not found');
        router.push('/admin/users');
        return;
      }
      
      setUser(foundUser);
      
      // Fetch user activity
      try {
        const activityResponse = await api.get(`/admin/users/${userId}/activity`);
        setUserActivity(activityResponse.data.data);
      } catch (activityError) {
        console.error('Failed to fetch user activity:', activityError);
        // Don't show error for activity, just continue without it
      }
      
    } catch (error: any) {
      console.error('Failed to fetch user details:', error);
      toast.error(error.response?.data?.message || 'Failed to load user details');
      router.push('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (action: string) => {
    if (!user) return;
    
    setIsActionLoading(true);
    try {
      switch (action) {
        case 'verify':
          await api.post(`/admin/users/${userId}/verify`);
          toast.success('User verified successfully');
          setUser({ ...user, isVerified: true });
          break;
        case 'ban':
          await api.post(`/admin/users/${userId}/ban`);
          toast.success('User banned successfully');
          setUser({ ...user, isActive: false });
          break;
        case 'unban':
          await api.post(`/admin/users/${userId}/unban`);
          toast.success('User unbanned successfully');
          setUser({ ...user, isActive: true });
          break;
        case 'suspend':
          await api.patch(`/admin/users/${userId}/suspend`);
          toast.success('User suspended successfully');
          setUser({ ...user, isActive: false });
          break;
        case 'reactivate':
          await api.patch(`/admin/users/${userId}/status`, { status: 'active' });
          toast.success('User reactivated successfully');
          setUser({ ...user, isActive: true });
          break;
        case 'delete':
          await api.delete(`/admin/users/${userId}`);
          toast.success('User deleted successfully');
          router.push('/admin/users');
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to perform action: ${action}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'host':
        return <Crown className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'host':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMMM d, yyyy \'at\' h:mm a');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-blue-100 rounded-full mx-auto"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Loading user details...</div>
          <div className="text-sm text-gray-500 mt-1">Please wait while we fetch user information</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist</p>
          <Button onClick={() => router.push('/admin/users')}>
            Back to Users
          </Button>
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
                    Back to Users
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
                    <p className="text-gray-600">View and manage user information</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => router.push(`/admin/users/${userId}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit User
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
              <div className="lg:col-span-1">
                <Card className="bg-white shadow-lg border-0 lg:sticky lg:top-24">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-gray-200">
                        {user.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={user.fullName} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-2xl">
                            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.fullName}</h2>
                      <p className="text-gray-600 mb-4">{user.email}</p>
                      
                      <Badge className={`flex items-center justify-center space-x-1 border ${getRoleBadgeColor(user.role)} mb-4`}>
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </Badge>

                      <div className="flex items-center justify-center space-x-2 mb-6">
                        <div className={`w-3 h-3 rounded-full ${
                          user.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        {!user.isVerified && (
                          <Button 
                            onClick={() => handleUserAction('verify')} 
                            disabled={isActionLoading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Verify
                          </Button>
                        )}
                        {user.role === 'user' && (
                          <Dropdown>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="hover:bg-gray-50 cursor-pointer">
                                <Button 
                                  disabled={isActionLoading}
                                  className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                  <Crown className="h-4 w-4 mr-2" />
                                  Promote to Host
                                </Button>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-40 border shadow-lg">
                                <DropdownMenuItem onClick={() => handleUserAction('changeRole', 'host')} className="hover:bg-purple-50 cursor-pointer">
                                  <Crown className="h-4 w-4 mr-2 text-purple-600" />
                                  <span>Host</span>
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </Dropdown>
                          </Dropdown>
                        )}
                        {user.role === 'host' && (
                          <Dropdown>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="hover:bg-gray-50 cursor-pointer">
                                <Button 
                                  disabled={isActionLoading}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  Convert to User
                                </Button>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-40 border shadow-lg">
                                <DropdownMenuItem onClick={() => handleUserAction('changeRole', 'user')} className="hover:bg-blue-50 cursor-pointer">
                                  <User className="h-4 w-4 mr-2 text-blue-600" />
                                  <span>User</span>
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </Dropdown>
                          </Dropdown>
                        )}
                        {user.isActive ? (
                          <Button 
                            onClick={() => handleUserAction('ban')} 
                            disabled={isActionLoading}
                            variant="destructive"
                            className="w-full"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Ban
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleUserAction('unban')} 
                            disabled={isActionLoading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Unban
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

          {/* Details Cards */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-gray-900">{user.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Location</label>
                        <p className="text-gray-900">{user.location?.city || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                        <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    {user.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bio</label>
                        <p className="text-gray-900">{user.bio}</p>
                      </div>
                    )}
                    {user.interests && user.interests.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Interests</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.interests.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

            {/* Activity Statistics */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Activity Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="p-3 bg-purple-100 rounded-lg w-12 h-12 mx-auto mb-2">
                          <Crown className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{user.hostedEvents.length}</div>
                        <div className="text-sm text-gray-500">Events Hosted</div>
                      </div>
                      <div className="text-center">
                        <div className="p-3 bg-blue-100 rounded-lg w-12 h-12 mx-auto mb-2">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{user.joinedEvents.length}</div>
                        <div className="text-sm text-gray-500">Events Joined</div>
                      </div>
                      <div className="text-center">
                        <div className="p-3 bg-red-100 rounded-lg w-12 h-12 mx-auto mb-2">
                          <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{user.savedEvents.length}</div>
                        
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rating & Reviews */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Rating & Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.totalReviews > 0 ? (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${
                                i < Math.floor(user.averageRating) 
                                  ? 'text-yellow-500 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-gray-900">{user.averageRating.toFixed(1)}</span>
                          <span className="text-gray-500 ml-1">({user.totalReviews} reviews)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No reviews yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Account Status */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Account Status</span>
                      <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Verification Status</span>
                      <Badge className={user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {user.isVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Last Updated</span>
                      <span className="text-sm text-gray-500">{formatDate(user.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
