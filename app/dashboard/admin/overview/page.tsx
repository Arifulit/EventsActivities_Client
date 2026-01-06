'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/app/components/admin/AdminLayout';
import AdminStats from '@/app/components/admin/AdminStats';
import { useCommonStats } from '@/app/components/admin/AdminStats';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Clock,
  CheckCircle,
  BarChart3,
  Eye,
  MessageSquare,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '120ms'
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
      setRecentActivity([
        {
          id: 1,
          type: 'user_registration',
          message: 'New user registered: John Doe',
          time: '2 minutes ago',
          severity: 'info'
        },
        {
          id: 2,
          type: 'host_approval',
          message: 'Host application pending: Sarah Smith',
          time: '15 minutes ago',
          severity: 'warning'
        },
        {
          id: 3,
          type: 'event_created',
          message: 'New event created: Tech Workshop 2025',
          time: '1 hour ago',
          severity: 'success'
        },
        {
          id: 4,
          type: 'review_flagged',
          message: 'Review flagged for moderation',
          time: '2 hours ago',
          severity: 'error'
        }
      ]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const { userStats, eventStats, reviewStats, hostStats } = useCommonStats();

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all user accounts',
      icon: <Users className="w-5 h-5" />,
      href: '/dashboard/admin/users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Review Applications',
      description: 'Approve pending host applications',
      icon: <Shield className="w-5 h-5" />,
      href: '/dashboard/admin/approvals',
      color: 'from-purple-500 to-purple-600',
      badge: '12 pending'
    },
    {
      title: 'Moderate Content',
      description: 'Review flagged reviews and content',
      icon: <MessageSquare className="w-5 h-5" />,
      href: '/dashboard/admin/reviews',
      color: 'from-orange-500 to-orange-600',
      badge: '3 flagged'
    },
    {
      title: 'View Analytics',
      description: 'System performance and insights',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/dashboard/admin/analytics',
      color: 'from-green-500 to-green-600'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'host_approval':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'event_created':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'review_flagged':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout title="Admin Dashboard" subtitle="Loading dashboard...">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin dashboard...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout 
        title="Admin Dashboard" 
        subtitle="System overview and management hub"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/admin' }
        ]}
      >
        <div className="space-y-6">
          {/* System Health Banner */}
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-800">System Healthy</span>
                  </div>
                  <div className="text-sm text-green-700">
                    Uptime: {systemHealth.uptime} • Response: {systemHealth.responseTime}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">View Details</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Overview
                </h3>
                <AdminStats stats={userStats} columns={2} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Event Performance
                </h3>
                <AdminStats stats={eventStats} columns={2} />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Content Moderation
                </h3>
                <AdminStats stats={reviewStats} columns={2} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Host Management
                </h3>
                <AdminStats stats={hostStats} columns={2} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common administrative tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => window.location.href = action.href}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {action.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                      {action.badge && (
                        <Badge variant="destructive" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Latest system events and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border ${getSeverityColor(activity.severity)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">{activity.message}</p>
                      <p className="text-xs opacity-75">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Growth</span>
                    <span className="text-lg font-semibold text-green-600">+12.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Users</span>
                    <span className="text-lg font-semibold">342</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Events</span>
                    <span className="text-lg font-semibold">456</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Server Response</span>
                    <span className="text-lg font-semibold text-blue-600">120ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Load</span>
                    <span className="text-lg font-semibold text-yellow-600">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="text-lg font-semibold text-green-600">2.4GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
