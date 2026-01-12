'use client';

import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
      return;
    }

    const fetchOverviewData = async () => {
      try {
        // Fetch overview statistics
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchOverviewData();
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const overviewCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      change: '+8%',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: `$${stats?.totalRevenue || 0}`,
      change: '+23%',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      title: 'Active Bookings',
      value: stats?.activeBookings || 0,
      change: '+5%',
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground">Platform performance at a glance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{card.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => router.push('/dashboard/admin/users')}
                  className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">Manage Users</div>
                  <div className="text-sm text-muted-foreground">View and manage all users</div>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/admin/events')}
                  className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">Manage Events</div>
                  <div className="text-sm text-muted-foreground">Review and approve events</div>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/admin/bookings')}
                  className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">View Bookings</div>
                  <div className="text-sm text-muted-foreground">Monitor all bookings</div>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/admin/analytics')}
                  className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">Analytics</div>
                  <div className="text-sm text-muted-foreground">View detailed analytics</div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">New user registration</div>
                    <div className="text-sm text-muted-foreground">2 minutes ago</div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">User</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Event submitted for approval</div>
                    <div className="text-sm text-muted-foreground">15 minutes ago</div>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Event</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">New booking completed</div>
                    <div className="text-sm text-muted-foreground">1 hour ago</div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Booking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
