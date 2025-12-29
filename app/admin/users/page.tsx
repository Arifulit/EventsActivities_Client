'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  Star, 
  CheckCircle, 
  XCircle, 
  Shield, 
  User, 
  Crown, 
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { getAdminUsers, AdminUser } from '@/app/lib/admin';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'host' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

      const getRoleIcon = (role: string) => {
          switch (role) {
              case 'admin':
                  return <Shield className="h-4 w-4 text-red-600" />;
              case 'host':
                  return <Crown className="h-4 w-4 text-purple-600" />;
              default:
                  return <User className="h-4 w-4 text-blue-600" />;
          }
      };

      const getRoleBadgeVariant = (role: string) => {
          switch (role) {
              case 'admin':
                  return 'destructive';
              case 'host':
                  return 'secondary';
              default:
                  return 'default';
          }
      };

      const formatDate = (dateString: string) => {
          return format(parseISO(dateString), 'MMM d, yyyy');
      };

      const getUserStats = () => {
          const total = users.length;
          const admins = users.filter(u => u.role === 'admin').length;
          const hosts = users.filter(u => u.role === 'host').length;
          const regularUsers = users.filter(u => u.role === 'user').length;
          const active = users.filter(u => u.isActive).length;
          const verified = users.filter(u => u.isVerified).length;

          return { total, admins, hosts, regularUsers, active, verified };
      };

      if (isLoading) {
          return (
              <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                      <div className="text-lg">Loading users...</div>
                  </div>
              </div>
          );
      }

      const stats = getUserStats();

      return (
          <div className="min-h-screen bg-gray-50">
              {/* Header */}
              <div className="bg-white shadow">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center py-6">
                          <div className="flex items-center space-x-4">
                              <Button variant="outline" size="sm" onClick={() => router.back()}>
                                  <ArrowLeft className="h-4 w-4 mr-2" />
                                  Back
                              </Button>
                              <div>
                                  <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                                  <p className="text-gray-600">Manage platform users and their roles</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Main Content */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                              <Users className="h-4 w-4 text-blue-600" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold">{stats.total}</div>
                              <p className="text-xs text-gray-600">Registered users</p>
                          </CardContent>
                      </Card>

                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold">{stats.active}</div>
                              <p className="text-xs text-gray-600">
                                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                              </p>
                          </CardContent>
                      </Card>

                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Hosts</CardTitle>
                              <Crown className="h-4 w-4 text-purple-600" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold">{stats.hosts}</div>
                              <p className="text-xs text-gray-600">Event organizers</p>
                          </CardContent>
                      </Card>

                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Verified</CardTitle>
                              <Shield className="h-4 w-4 text-orange-600" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold">{stats.verified}</div>
                              <p className="text-xs text-gray-600">Verified accounts</p>
                          </CardContent>
                      </Card>
                  </div>

                  {/* Filters */}
                  <Card className="mb-6">
                      <CardHeader>
                          <CardTitle>Filters</CardTitle>
                          <CardDescription>Filter users by role, status, or search</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="flex flex-col lg:flex-row gap-4">
                              <div className="flex-1">
                                  <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                      <Input
                                          placeholder="Search by name or email..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          className="pl-10"
                                      />
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  <select
                                      value={roleFilter}
                                      onChange={(e) => setRoleFilter(e.target.value as any)}
                                      className="px-3 py-2 border rounded-md bg-white"
                                  >
                                      <option value="all">All Roles</option>
                                      <option value="user">Users</option>
                                      <option value="host">Hosts</option>
                                      <option value="admin">Admins</option>
                                  </select>
                                  <select
                                      value={statusFilter}
                                      onChange={(e) => setStatusFilter(e.target.value as any)}
                                      className="px-3 py-2 border rounded-md bg-white"
                                  >
                                      <option value="all">All Status</option>
                                      <option value="active">Active</option>
                                      <option value="inactive">Inactive</option>
                                  </select>
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  {/* Users List */}
                  <Card>
                      <CardHeader>
                          <CardTitle>Users ({filteredUsers.length})</CardTitle>
                          <CardDescription>Manage user accounts and permissions</CardDescription>
                      </CardHeader>
                      <CardContent>
                          {filteredUsers.length === 0 ? (
                              <div className="text-center py-12">
                                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                                  <p className="text-gray-600">
                                      {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                                          ? 'Try adjusting your filters'
                                          : 'No users registered yet'}
                                  </p>
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  {filteredUsers.map((user) => (
                                      <div key={user._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                          <div className="flex items-start justify-between">
                                              <div className="flex items-start space-x-4">
                                                  <Avatar className="h-12 w-12">
                                                      {user.profileImage ? (
                                                          <AvatarImage src={user.profileImage} alt={user.fullName} />
                                                      ) : (
                                                          <AvatarFallback>
                                                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                          </AvatarFallback>
                                                      )}
                                                  </Avatar>
                                                  <div className="flex-1">
                                                      <div className="flex items-center space-x-2 mb-1">
                                                          <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                                                          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center space-x-1">
                                                              {getRoleIcon(user.role)}
                                                              <span className="capitalize">{user.role}</span>
                                                          </Badge>
                                                          {user.isVerified && (
                                                              <Badge variant="secondary" className="flex items-center space-x-1">
                                                                  <CheckCircle className="h-3 w-3" />
                                                                  <span>Verified</span>
                                                              </Badge>
                                                          )}
                                                          {user.isActive ? (
                                                              <Badge variant="default" className="bg-green-100 text-green-800">
                                                                  Active
                                                              </Badge>
                                                          ) : (
                                                              <Badge variant="destructive">
                                                                  Inactive
                                                              </Badge>
                                                          )}
                                                      </div>
                                                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                          <div className="flex items-center space-x-1">
                                                              <Mail className="h-4 w-4" />
                                                              <span>{user.email}</span>
                                                          </div>
                                                          <div className="flex items-center space-x-1">
                                                              <Calendar className="h-4 w-4" />
                                                              <span>Joined {formatDate(user.createdAt)}</span>
                                                          </div>
                                                      </div>
                                                      <div className="flex items-center space-x-6 text-sm">
                                                          <div className="flex items-center space-x-1">
                                                              <Crown className="h-4 w-4 text-purple-600" />
                                                              <span className="text-gray-600">
                                                                  {user.hostedEvents.length} hosted
                                                              </span>
                                                          </div>
                                                          <div className="flex items-center space-x-1">
                                                              <Users className="h-4 w-4 text-blue-600" />
                                                              <span className="text-gray-600">
                                                                  {user.joinedEvents.length} joined
                                                              </span>
                                                          </div>
                                                          {user.totalReviews > 0 && (
                                                              <div className="flex items-center space-x-1">
                                                                  <Star className="h-4 w-4 text-yellow-500" />
                                                                  <span className="text-gray-600">
                                                                      {user.averageRating.toFixed(1)} ({user.totalReviews} reviews)
                                                                  </span>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                  <Button variant="outline" size="sm">
                                                      View Profile
                                                  </Button>
                                                  <Button variant="outline" size="sm">
                                                      Edit
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
          </div>
      );
}
