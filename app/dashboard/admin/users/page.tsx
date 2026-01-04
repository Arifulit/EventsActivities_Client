'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
// import AdminSidebar from '../components/AdminSidebar';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/app/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import PermissionGuard from '@/components/auth/PermissionGuard';
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
  MoreHorizontal,
  Edit,
  Eye,
  Ban,
  UserCheck,
  TrendingUp,
  Activity,
  Award,
  UserPlus,
  UserX,
  ChevronDown,
  Plus,
  Menu,
  AlertTriangle
} from 'lucide-react';
import { getRoleDisplayName, getRoleBadgeColor, UserRole } from '@/types/auth';
import { changeUserRole, verifyUser, approveHost, rejectHost } from '@/app/lib/adminActions';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive?: boolean;
  profileImage?: string;
  totalEvents?: number;
  createdAt: string;
  averageRating?: number;
  totalReviews?: number;
  hostedEvents?: string[];
  joinedEvents?: string[];
}

// Function to detect role from email patterns
const getRoleFromEmail = (email: string): 'user' | 'host' | 'admin' => {
  const emailLower = email.toLowerCase();
  
  // Admin email patterns
  if (emailLower.includes('admin') || 
      emailLower.includes('administrator') || 
      emailLower.includes('sysadmin') ||
      emailLower.includes('root') ||
      emailLower.endsWith('@admin.com') ||
      emailLower.endsWith('@system.com')) {
    return 'admin';
  }
  
  // Host email patterns
  if (emailLower.includes('host') || 
      emailLower.includes('organizer') || 
      emailLower.includes('event') ||
      emailLower.includes('manager') ||
      emailLower.endsWith('@host.com') ||
      emailLower.endsWith('@events.com')) {
    return 'host';
  }
  
  // Default to user
  return 'user';
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'user':
      return <User className="w-4 h-4" />;
    case 'host':
      return <Crown className="w-4 h-4" />;
    case 'admin':
      return <Shield className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/users');
        setUsers(response.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        if (error.response?.status === 403) {
          toast.error('Access denied: You do not have permission to manage users');
        } else if (error.response?.status === 401) {
          toast.error('Authentication required: Please log in again');
        } else {
          toast.error('Failed to load users: Server error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    return users.filter((userItem: User) => {
      if (!userItem || !userItem.fullName || !userItem.email) return false;
      
      const matchesSearch = userItem.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getUserStats = () => {
    if (!Array.isArray(users)) return { total: 0, admins: 0, hosts: 0, regularUsers: 0, active: 0, verified: 0 };
    
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const hosts = users.filter(u => u.role === 'host').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const active = users.filter(u => u.isActive !== false).length;
    const verified = users.filter(u => u.isVerified).length;

    return { total, admins, hosts, regularUsers, active, verified };
  };

  const handleUserAction = async (userId: string, action: string, targetRole?: 'user' | 'host' | 'admin') => {
    try {
      switch (action) {
        case 'view':
          router.push(`/admin/users/${userId}`);
          break;
        case 'edit':
          router.push(`/admin/users/${userId}/edit`);
          break;
        case 'verify':
          await verifyUser(userId);
          // Refresh users list
          const usersResponse = await api.get('/admin/users');
          setUsers(usersResponse.data.data || []);
          toast.success('User verified successfully');
          break;
        case 'approveHost':
          await approveHost(userId);
          // Refresh users list
          const approveResponse = await api.get('/admin/users');
          setUsers(approveResponse.data.data || []);
          toast.success('Host approved successfully');
          break;
        case 'rejectHost':
          await rejectHost(userId);
          // Refresh users list
          const rejectResponse = await api.get('/admin/users');
          setUsers(rejectResponse.data.data || []);
          toast.success('Host rejected successfully');
          break;
        case 'makeHost':
          await changeUserRole(userId, { role: 'host' });
          // Refresh users list
          const hostResponse = await api.get('/admin/users');
          setUsers(hostResponse.data.data || []);
          toast.success('User promoted to host');
          break;
        case 'makeAdmin':
          await changeUserRole(userId, { role: 'admin' });
          // Refresh users list
          const adminResponse = await api.get('/admin/users');
          setUsers(adminResponse.data.data || []);
          toast.success('User promoted to admin');
          break;
        case 'demoteToUser':
          await changeUserRole(userId, { role: 'user' });
          // Refresh users list
          const demoteResponse = await api.get('/admin/users');
          setUsers(demoteResponse.data.data || []);
          toast.success('User demoted to user');
          break;
        case 'ban':
          await api.patch(`/admin/users/${userId}/ban`);
          // Refresh users list
          const banResponse = await api.get('/admin/users');
          setUsers(banResponse.data.data || []);
          toast.success('User banned successfully');
          break;
        case 'changeRole':
          if (!targetRole) {
            toast.error('Please select a role');
            return;
          }
          
          // Validate targetRole is one of the allowed values
          const validRoles = ['user', 'host', 'admin'] as const;
          if (!validRoles.includes(targetRole)) {
            toast.error('Invalid role selected');
            return;
          }
          
          // Find the user to check current role
          const currentUser = users.find(u => u._id === userId);
          if (currentUser && currentUser.role === targetRole) {
            toast.error(`User is already ${targetRole}`);
            return;
          }
          
          const roleResponse = await changeUserRole(userId, { role: targetRole });
          if (roleResponse) {
            toast.success(`User role changed to ${targetRole} successfully`);
            const refreshResponse = await api.get('/admin/users');
            setUsers(refreshResponse.data.data || []);
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on user ${userId}:`, error);
      toast.error(`Failed to perform action: ${action}`);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
      
          
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
              <h1 className="text-lg font-semibold text-gray-900">User Management</h1>
              <div className="w-8"></div>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden lg:block bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage all users and their permissions</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{getUserStats().total.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Registered users
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{getUserStats().active}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Currently active
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Hosts</CardTitle>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Crown className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{getUserStats().hosts}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Event organizers
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Verified Users</CardTitle>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{getUserStats().verified}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Verified accounts
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Users Management */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    User Management
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage all users and their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10 sm:h-11"
                        />
                      </div>
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-40 h-10 sm:h-11">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">Users</SelectItem>
                        <SelectItem value="host">Hosts</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-semibold text-gray-900">Users ({filteredUsers.length})</span>
                      <div className="text-sm font-normal text-gray-600 mt-1">
                        Manage user accounts and permissions
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push('/admin/users/add')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">
                      {searchTerm || roleFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'No users registered yet'}
                </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50 border-b">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-900 py-4 px-6">User</TableHead>
                          <TableHead className="font-semibold text-gray-900 py-4 px-6">Role</TableHead>
                          <TableHead className="font-semibold text-gray-900 py-4 px-6">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900 py-4 px-6">Events</TableHead>
                          <TableHead className="font-semibold text-gray-900 py-4 px-6">Rating</TableHead>
                          <TableHead className="font-semibold text-gray-900 py-4 px-6">Joined</TableHead>
                          <TableHead className="font-semibold text-gray-900 text-right py-4 px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user._id} className="hover:bg-gray-50 transition-colors border-b">
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                                  {user.profileImage ? (
                                    <AvatarImage src={user.profileImage} alt={user.fullName} />
                                  ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                      {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{user.fullName}</div>
                                  <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge className={`flex items-center space-x-1 border ${getRoleBadgeColor(user.role)}`}>
                                {getRoleIcon(user.role)}
                                <span className="capitalize">{user.role}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  user.isActive ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                <span className="text-sm font-medium">
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {user.isVerified && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Crown className="h-4 w-4 text-purple-600" />
                                  <span>{user.hostedEvents?.length || 0} hosted</span>
                                </div>
                                <div className="flex items-center space-x-1 mt-1">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span>{user.joinedEvents?.length || 0} joined</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              {(user.totalReviews ?? 0) > 0 ? (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-medium">{(user.averageRating ?? 0).toFixed(1)}</span>
                                  <span className="text-xs text-gray-500">({user.totalReviews})</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">No reviews</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-sm text-gray-600">
                                {formatDate(user.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 p-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 border shadow-lg z-50">
                                  <DropdownMenuItem onClick={() => handleUserAction(user._id, 'view')} className="hover:bg-gray-50 cursor-pointer">
                                    <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                    <span>View Profile</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="hover:bg-gray-50 cursor-pointer">
                                      <Shield className="h-4 w-4 mr-2 text-purple-600" />
                                      <span>Change Role</span>
                                      <ChevronDown className="h-4 w-4 ml-auto" />
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-40 border shadow-lg">
                                      {/* Only show User role if current user is not already user */}
                                      {user.role !== 'user' && (
                                        <DropdownMenuItem onClick={() => handleUserAction(user._id, 'changeRole', 'user')} className="hover:bg-blue-50 cursor-pointer">
                                          <User className="h-4 w-4 mr-2 text-blue-600" />
                                          <span>User</span>
                                        </DropdownMenuItem>
                                      )}
                                      {/* Only show Host role if user email doesn't suggest host already */}
                                      {user.role !== 'host' && (
                                        <DropdownMenuItem onClick={() => handleUserAction(user._id, 'changeRole', 'host')} className="hover:bg-purple-50 cursor-pointer">
                                          <Crown className="h-4 w-4 mr-2 text-purple-600" />
                                          <span>Host</span>
                                        </DropdownMenuItem>
                                      )}
                                      {/* Only show Admin role if current user is not already admin */}
                                      {user.role !== 'admin' && (
                                        <DropdownMenuItem onClick={() => handleUserAction(user._id, 'changeRole', 'admin')} className="hover:bg-red-50 cursor-pointer">
                                          <Shield className="h-4 w-4 mr-2 text-red-600" />
                                          <span>Admin</span>
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                  <DropdownMenuSeparator />
                                  {/* Host-specific actions */}
                                  {user.role === 'host' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleUserAction(user._id, 'approveHost')} className="hover:bg-green-50 cursor-pointer">
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                        <span>Approve Host</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUserAction(user._id, 'rejectHost')} className="hover:bg-red-50 cursor-pointer">
                                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                        <span>Reject Host</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  {!user.isVerified && (
                                    <DropdownMenuItem onClick={() => handleUserAction(user._id, 'verify')} className="hover:bg-green-50 cursor-pointer">
                                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                      <span>Verify</span>
                                    </DropdownMenuItem>
                                  )}
                                  {user.isActive ? (
                                    <DropdownMenuItem onClick={() => handleUserAction(user._id, 'ban')} className="text-red-600 hover:bg-red-50 cursor-pointer">
                                      <Ban className="h-4 w-4 mr-2" />
                                      <span>Ban</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleUserAction(user._id, 'unban')} className="text-green-600 hover:bg-green-50 cursor-pointer">
                                      <UserX className="h-4 w-4 mr-2" />
                                      <span>Unban</span>
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
