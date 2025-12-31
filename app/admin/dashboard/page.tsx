'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Menu,
  Shield
} from 'lucide-react';


interface ChartData {
  [key: string]: any;
  name: string;
  value: number;
}

interface MonthlyData {
  month: string;
  users: number;
  events: number;
}

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeUsers: number;
  totalHosts?: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Always true - sidebar always visible
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Chart data
  const [eventStatusData, setEventStatusData] = useState<ChartData[]>([]);
  const [userRoleData, setUserRoleData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // Fetch users and stats from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch admin stats
        try {
          const statsResponse = await api.get('/admin/stats');
          const statsData = statsResponse.data?.data || {};
          setStats({
            totalUsers: statsData.totalUsers || 0,
            totalEvents: statsData.totalEvents || 0,
            totalRevenue: statsData.totalRevenue || 0,
            pendingApprovals: statsData.pendingApprovals || 0,
            activeUsers: statsData.activeUsers || 0
          });

          // Process chart data
          const eventStatus = [
            { name: 'Active Events', value: statsData.activeEvents || 0 },
            { name: 'Completed Events', value: statsData.completedEvents || 0 }
          ];
          setEventStatusData(eventStatus);

          // Process user role data for chart
          const roleData = [
            { name: 'Users', value: statsData.totalUsers || 0 },
            { name: 'Hosts', value: statsData.totalHosts || 0 },
            { name: 'Admins', value: statsData.totalAdmins || 0 }
          ];
          setUserRoleData(roleData);

        } catch (statsError: any) {
          console.error('Error fetching stats:', statsError);
          toast.error('Failed to load dashboard stats');
        }
        
      } catch (error) {
        console.error('Error in fetchData:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar - Within main content, no footer overlap */}
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
              <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
              <div className="w-8"></div>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden lg:block bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage users, events, and system settings</p>
              </div>
            </div>
            
            {/* Scrollable Content */}
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
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                      <p className="text-xs text-gray-500 mt-1">
                        +{stats.activeUsers} active this month
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Hosts</CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                  ) : (
                    <>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalHosts}</div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.pendingApprovals} pending approval
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                  ) : (
                    <>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
                      <p className="text-xs text-gray-500 mt-1">
                        +15% from last month
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                  ) : (
                    <>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">${(stats.totalRevenue || 0).toLocaleString()}</div>
                      <p className="text-xs text-gray-500 mt-1">
                        +22% from last month
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
              {/* Event Status Chart */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Event Status Overview
                  </CardTitle>
                  <CardDescription>Distribution of active and completed events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={eventStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Roles Chart */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    User Role Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={userRoleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
