'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Skeleton } from '../../../components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Settings, 
  CheckCircle,
  Shield,
  BarChart3,
  Bell,
  Activity,
  Server,
  CreditCard,
  Database,
  Zap,
  ChevronRight,
  Target,
  LineChart,
  PieChart,
  Rocket,
  Crown,
  Star,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  UserCog,
  CalendarCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import api from '@/app/lib/api';

// Define interfaces based on your API response structure
interface DashboardStats {
  users: {
    total: number;
    active: number;
    verified: number;
    banned: number;
  };
  events: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    lastMonth: number;
    currency: string;
  };
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: string;
  user?: string;
  event?: string;
  amount?: number;
  status?: string;
  eventTitle?: string;
  role?: string;
}

interface DashboardData {
  success: boolean;
  message: string;
  data: {
    stats: DashboardStats;
    recentActivity: RecentActivity[];
  };
  timestamp: string;
}

interface UserAnalytics {
  success: boolean;
  message: string;
  data: {
    period: string;
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    usersByRole: Array<{ _id: string; count: number }>;
    dailyRegistrations: Array<{ _id: string; count: number }>;
    topHosts: Array<{
      _id: string;
      fullName: string;
      email: string;
      averageRating: number;
      hostedEventsCount: number;
    }>;
  };
}

interface EventsAnalytics {
  success: boolean;
  message: string;
  data: {
    period: string;
    totalEvents: number;
    newEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    eventsByCategory: Array<{ _id: string; count: number }>;
    eventsByStatus: Array<{ _id: string; count: number }>;
    dailyEventCreations: Array<{ _id: string; count: number }>;
    topRatedEvents: Array<{
      _id: string;
      title: string;
      category: string;
      price: number;
    }>;
    popularEvents: Array<{
      _id: string;
      title: string;
      category: string;
      attendeesCount: number;
    }>;
  };
}

interface RevenueAnalytics {
  success: boolean;
  message: string;
  data: {
    period: string;
    summary: {
      _id: null;
      totalRevenue: number;
      totalBookings: number;
      averageBookingValue: number;
    };
    dailyRevenue: Array<{
      _id: string;
      revenue: number;
      bookings: number;
    }>;
    revenueByCategory: Array<{
      _id: string;
      revenue: number;
      bookings: number;
    }>;
    topRevenueEvents: Array<{
      _id: string;
      revenue: number;
      bookings: number;
      eventId: string;
      eventTitle: string;
      category: string;
    }>;
  };
}

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  pendingUsers: number;
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  totalRevenue: number;
  pendingApprovals: number;
  systemAlerts: number;
  serverHealth: number;
  userGrowth: number;
  revenueGrowth: number;
  eventGrowth: number;
  platformUptime: number;
}

interface TopPerformer {
  name: string;
  role: string;
  rating: number;
  events: number;
  revenue: number;
}

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  actionRequired: boolean;
  icon: string;
}

interface AdminAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  gradient: string;
  badge?: number;
  variant: 'default' | 'outline';
  graphic: 'chart' | 'users' | 'calendar' | 'shield' | 'dollar' | 'settings';
}

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}



const platformMetrics = [
  { name: 'Response Time', value: 85, target: 90, color: '#10B981' },
  { name: 'Uptime', value: 99.8, target: 99.9, color: '#3B82F6' },
  { name: 'Error Rate', value: 0.2, target: 0.1, color: '#F59E0B' },
  { name: 'User Satisfaction', value: 4.7, target: 4.8, color: '#8B5CF6' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [eventsAnalytics, setEventsAnalytics] = useState<EventsAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  

  const fetchAdminStats = async (): Promise<DashboardData | null> => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return null;
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics/users', { baseURL: '/api' });
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics/revenue', { baseURL: '/api' });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return null;
    }
  };

  const fetchEventsAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics/events', { baseURL: '/api' });
      return response.data;
    } catch (error) {
      console.error('Error fetching events analytics:', error);
      return null;
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);

      // Fetch all data in parallel
      const [dashboardStats, userGrowth, revenue, events] = await Promise.all([
        fetchAdminStats(),
        fetchUserAnalytics(),
        fetchRevenueAnalytics(),
        fetchEventsAnalytics()
      ]);

      console.log('📊 Data received:', {
        dashboard: dashboardStats?.success,
        userAnalytics: userGrowth?.success,
        revenueAnalytics: revenue?.success,
        eventsAnalytics: events?.success
      });

      if (dashboardStats?.success) {
        setDashboardData(dashboardStats);
      } else {
        console.error('❌ Failed to fetch dashboard stats');
        toast.error('Failed to load dashboard statistics');
      }

      if (userGrowth?.success) {
        setUserAnalytics(userGrowth);
      }

      if (revenue?.success) {
        setRevenueAnalytics(revenue);
      }

      if (events?.success) {
        setEventsAnalytics(events);
      }


    } catch (error: Error | unknown) {
      console.error('💥 Error in fetchDashboardData:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Process dashboard data into AdminStats format
  const getAdminStats = (): AdminStats => {
    if (!dashboardData) {
      return {
        totalUsers: 0,
        verifiedUsers: 0,
        bannedUsers: 0,
        pendingUsers: 0,
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        systemAlerts: 0,
        serverHealth: 98.5,
        userGrowth: 0,
        revenueGrowth: 0,
        eventGrowth: 0,
        platformUptime: 99.8
      };
    }

    const stats = dashboardData.data.stats;
    const userAnalyticsData = userAnalytics?.data;
    const eventsAnalyticsData = eventsAnalytics?.data;
    const revenueAnalyticsData = revenueAnalytics?.data;

    return {
      totalUsers: stats.users.total,
      verifiedUsers: stats.users.verified,
      bannedUsers: stats.users.banned,
      pendingUsers: userAnalyticsData?.newUsers || 0,
      totalEvents: stats.events.total,
      activeEvents: stats.events.active,
      completedEvents: stats.events.completed,
      cancelledEvents: stats.events.cancelled,
      totalRevenue: stats.revenue.total,
      pendingApprovals: 0, // You can add this field if your API provides it
      systemAlerts: 0, // You can add this field if your API provides it
      serverHealth: 98.5,
      userGrowth: userAnalyticsData?.newUsers || 0,
      revenueGrowth: revenueAnalyticsData?.summary.totalRevenue || 0,
      eventGrowth: eventsAnalyticsData?.newEvents || 0,
      platformUptime: 99.8
    };
  };

  const getSystemAlerts = (): SystemAlert[] => {
    if (!dashboardData) return [];
    
    return dashboardData.data.recentActivity.slice(0, 5).map((activity, index) => ({
      id: `alert-${index}`,
      title: activity.type === 'booking_created' ? 'New Booking' :
             activity.type === 'event_created' ? 'New Event Created' :
             activity.type === 'user_signup' ? 'New User Signup' : 'System Activity',
      description: activity.message,
      severity: activity.type === 'booking_created' && activity.amount && activity.amount > 0 ? 'high' : 'low',
      timestamp: activity.timestamp,
      actionRequired: false,
      icon: activity.type === 'booking_created' ? 'credit-card' :
            activity.type === 'event_created' ? 'calendar' :
            activity.type === 'user_signup' ? 'users' : 'activity'
    }));
  };

  const getUserGrowthChartData = () => {
    if (!userAnalytics?.data) return [];

    const data = userAnalytics.data as Record<string, unknown>;
    const { dailyRegistrations, chartData, dailyData } = data;
    const source = dailyRegistrations || chartData || dailyData;
    if (!Array.isArray(source)) return [];

    return source.map((reg: Record<string, unknown>) => {
      const dateStr = String(reg._id ?? reg.date ?? '');
      return {
        name: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: Number(reg.count ?? reg.newUsers ?? reg.activeUsers ?? 0),
      };
    });
  };

  const getRevenueChartData = () => {
    if (!revenueAnalytics?.data) return [];

    const data = revenueAnalytics.data as Record<string, unknown>;
    const { dailyRevenue, chartData, dailyData } = data;
    const source = dailyRevenue || chartData || dailyData;
    if (!Array.isArray(source)) return [];

    return source.map((rev: Record<string, unknown>) => {
      const dateStr = String(rev._id ?? rev.date ?? '');
      return {
        name: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Number(rev.revenue ?? rev.totalRevenue ?? rev.netRevenue ?? 0),
        bookings: Number(rev.bookings ?? rev.transactions ?? 0),
      };
    });
  };

  const getTopPerformers = (): TopPerformer[] => {
    if (!userAnalytics?.data) return [];

    const data = userAnalytics.data as Record<string, unknown>;
    const { topHosts, topPerformers, topUsers } = data;
    const source = topHosts || topPerformers || topUsers;
    if (!Array.isArray(source)) return [];

    return source.map((host: Record<string, unknown>): TopPerformer => ({
      name: String(host.fullName ?? host.name ?? 'Unknown'),
      role: String(host.role ?? 'Host'),
      rating: Number(host.averageRating ?? host.rating ?? 0),
      events: Number(host.hostedEventsCount ?? host.events ?? host.totalEvents ?? 0),
      revenue: Number(host.revenue ?? 0),
    }));
  };

  const performanceMetrics: PerformanceMetric[] = (() => {
    const stats = getAdminStats();
    return [
      {
        label: 'User Growth',
        value: stats.userGrowth,
        target: 10,
        unit: ' users',
        trend: 'up',
        icon: TrendingUpIcon,
        color: 'green'
      },
      {
        label: 'Revenue Growth',
        value: stats.revenueGrowth,
        target: 1000,
        unit: ' USD',
        trend: 'up',
        icon: DollarSign,
        color: 'emerald'
      },
      {
        label: 'Event Completion',
        value: stats.completedEvents > 0 ? ((stats.completedEvents / stats.totalEvents) * 100) : 0,
        target: 80,
        unit: '%',
        trend: stats.completedEvents > 0 ? 'up' : 'stable',
        icon: CheckCircle,
        color: 'blue'
      },
      {
        label: 'Platform Uptime',
        value: stats.platformUptime,
        target: 99.9,
        unit: '%',
        trend: 'stable',
        icon: Server,
        color: 'purple'
      }
    ];
  })();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchDashboardData();
    }
  }, [user, loading, router, fetchDashboardData]);

  const handleRefresh = async () => {
    try { 
      setIsRefreshing(true);
      await fetchDashboardData();
      toast.success('Dashboard refreshed successfully');
    } catch {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = dashboardData?.data.stats.revenue.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#F59E0B';
      case 'low': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getSeverityGradient = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'cpu': return Server;
      case 'database': return Database;
      case 'shield': return Shield;
      case 'credit-card': return CreditCard;
      case 'calendar': return Calendar;
      case 'users': return Users;
      case 'activity': return Activity;
      default: return AlertCircle;
    }
  };

  const adminStats = getAdminStats();
  const systemAlerts = getSystemAlerts();
  const userGrowthData = getUserGrowthChartData();
  const revenueData = getRevenueChartData();
  const topPerformers = getTopPerformers();

  const adminActions: AdminAction[] = [
    {
      title: 'User Management',
      description: 'Manage all platform users',
      icon: UserCog,
      href: '/dashboard/admin/users',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      badge: userAnalytics?.data.newUsers || 0,
      variant: 'default',
      graphic: 'users'
    },
    {
      title: 'Event Control',
      description: 'Monitor and manage events',
      icon: CalendarCheck,
      href: '/dashboard/admin/events',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      badge: eventsAnalytics?.data.newEvents || 0,
      variant: 'outline',
      graphic: 'calendar'
    },
    {
      title: 'Host Administration',
      description: 'Approve and manage hosts',
      icon: Shield,
      href: '/dashboard/admin/hosts',
      color: 'green',
      gradient: 'from-emerald-500 to-green-500',
      badge: 0,
      variant: 'outline',
      graphic: 'shield'
    },
    {
      title: 'Analytics Hub',
      description: 'Deep insights and reports',
      icon: BarChart3,
      href: '/dashboard/admin/analytics',
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500',
      variant: 'outline',
      graphic: 'chart'
    },
    {
      title: 'Revenue Dashboard',
      description: 'Financial insights',
      icon: DollarSign,
      href: '/dashboard/admin/reports',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      badge: revenueAnalytics?.data.summary.totalBookings || 0,
      variant: 'outline',
      graphic: 'dollar'
    },
    {
      title: 'System Settings',
      description: 'Platform configuration',
      icon: Settings,
      href: '/dashboard/admin/settings',
      color: 'gray',
      gradient: 'from-gray-500 to-slate-500',
      variant: 'outline',
      graphic: 'settings'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header with connection status */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-blue-100">
                    Admin Command Center
                  </h1>
                 
                </div>
              </div>
              <p className="text-blue-100">
                Complete oversight and control of platform operations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleRefresh}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Badge className="bg-white/20 backdrop-blur-sm border-white/30">
                <Activity className="w-3 h-3 mr-1" />
                {adminStats.serverHealth}% Healthy
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Users',
                value: adminStats.totalUsers,
                description: 'Registered users',
                icon: Users,
                color: 'blue',
                trend: `${userAnalytics?.data.newUsers || 0} new`,
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                title: 'Active Events',
                value: adminStats.activeEvents,
                description: 'Currently running',
                icon: Activity,
                color: 'green',
                trend: `${eventsAnalytics?.data.newEvents || 0} new`,
                gradient: 'from-emerald-500 to-green-500'
              },
              {
                title: 'Total Revenue',
                value: adminStats.totalRevenue,
                description: 'All time earnings',
                icon: DollarSign,
                color: 'purple',
                trend: `${revenueAnalytics?.data.summary.totalBookings || 0} bookings`,
                isCurrency: true,
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Platform Health',
                value: adminStats.platformUptime,
                description: 'System uptime',
                icon: Server,
                color: 'orange',
                trend: '99.9% Target',
                gradient: 'from-orange-500 to-yellow-500',
                isPercentage: true
              }
            ].map((stat, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-linear-to-br from-white to-gray-50"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.isCurrency ? formatCurrency(stat.value) : stat.isPercentage ? `${formatNumber(stat.value)}%` : formatNumber(stat.value)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{stat.description}</p>
                    <Badge className={`text-xs bg-${stat.color}-100 text-${stat.color}-800`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={75} className={`h-1 bg-${stat.color}-100`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Performance Metrics with Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  User Growth Trend
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  +{userAnalytics?.data.newUsers || 0} New Users
                </Badge>
              </div>
              <CardDescription>
                User registration trend over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : userGrowthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fill="url(#colorUsers)" 
                        activeDot={{ r: 6, fill: '#1D4ED8' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Users className="w-12 h-12 mb-2" />
                    <p>No user growth data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Revenue Trend
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800">
                  Total: {formatCurrency(revenueAnalytics?.data.summary.totalRevenue || 0)}
                </Badge>
              </div>
              <CardDescription>
                Daily revenue performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="url(#colorRevenue)" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <DollarSign className="w-12 h-12 mb-2" />
                    <p>No revenue data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions Grid */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-500" />
                Quick Actions
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {adminActions.length} Control Panels
              </Badge>
            </div>
            <CardDescription>
              Direct access to administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className={`absolute inset-0 bg-linear-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                      {action.graphic === 'chart' && (
                        <div className="relative w-16 h-16">
                          <LineChart className="w-16 h-16 text-current" />
                        </div>
                      )}
                      {action.graphic === 'users' && (
                        <div className="relative w-16 h-16">
                          <UsersIcon className="w-16 h-16 text-current" />
                        </div>
                      )}
                      {action.graphic === 'calendar' && (
                        <div className="relative w-16 h-16">
                          <CalendarDays className="w-16 h-16 text-current" />
                        </div>
                      )}
                      {action.graphic === 'shield' && (
                        <div className="relative w-16 h-16">
                          <ShieldCheck className="w-16 h-16 text-current" />
                        </div>
                      )}
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-linear-to-br ${action.gradient} shadow-lg`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        {action.badge && action.badge > 0 && (
                          <Badge className={`bg-${action.color}-100 text-${action.color}-800`}>
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{action.description}</p>
                      <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
                        <span>Open Panel</span>
                        <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Metrics Radar */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Platform Performance
              </CardTitle>
              <CardDescription>
                Key performance indicators vs targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={platformMetrics}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis 
                      dataKey="name" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]}
                      stroke="#6B7280"
                    />
                    <Radar
                      name="Current"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Target"
                      dataKey="target"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-500 animate-pulse" />
                  Recent Activity
                  {systemAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length > 0 && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                  )}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {systemAlerts.length} Activities
                </Badge>
              </div>
              <CardDescription>
                Latest platform activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-75 overflow-y-auto pr-2">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : systemAlerts.length > 0 ? (
                  systemAlerts.map((alert) => {
                    const Icon = getIconComponent(alert.icon);
                    return (
                      <div 
                        key={alert.id}
                        className={`relative p-4 rounded-xl border-2 hover:shadow-md transition-all duration-200 ${
                          alert.severity === 'critical' ? 'border-red-200 bg-linear-to-r from-red-50 to-red-100' :
                          alert.severity === 'high' ? 'border-orange-200 bg-linear-to-r from-orange-50 to-orange-100' :
                          alert.severity === 'medium' ? 'border-yellow-200 bg-linear-to-r from-yellow-50 to-yellow-100' :
                          'border-blue-200 bg-linear-to-r from-blue-50 to-blue-100'
                        }`}
                      >
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                          style={{ backgroundColor: getSeverityColor(alert.severity) }}
                        ></div>
                        
                        <div className="flex items-start gap-3 ml-2">
                          <div className={`p-2 rounded-lg bg-linear-to-br ${getSeverityGradient(alert.severity)}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                              <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge className={`capitalize ${
                                alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {alert.severity} Priority
                              </Badge>
                              {alert.actionRequired && (
                                <Button size="sm" variant="destructive" className="text-xs h-7">
                                  Take Action
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics and Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-purple-500" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Key performance indicators vs targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded bg-${metric.color}-100`}>
                          <metric.icon className={`w-4 h-4 text-${metric.color}-600`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {metric.value?.toFixed(1)}{metric.unit}
                        </span>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <Progress 
                        value={metric.value ? (metric.value / metric.target) * 100 : 0} 
                        className={`h-2 bg-${metric.color}-100`}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Current: {metric.value?.toFixed(1)}{metric.unit}</span>
                        <span>Target: {metric.target}{metric.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Top Hosts
              </CardTitle>
              <CardDescription>
                Leading hosts and organizers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))
                ) : topPerformers.length > 0 ? (
                  topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {performer.name.charAt(0)}
                          </div>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1">
                              <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{performer.name}</p>
                          <p className="text-xs text-gray-500">{performer.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1 justify-end">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">{performer.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {performer.events} events
                          </Badge>
                          {performer.revenue > 0 && (
                            <span className="text-xs font-medium text-emerald-600">
                              {formatCurrency(performer.revenue)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Crown className="w-12 h-12 mx-auto mb-2" />
                    <p>No hosts data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Categories */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-pink-500" />
              Event Categories
            </CardTitle>
            <CardDescription>
              Distribution of event types on platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                {eventsAnalytics?.data.eventsByCategory && eventsAnalytics.data.eventsByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={eventsAnalytics.data.eventsByCategory.map((cat, index) => ({
                          name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
                          value: cat.count,
                          color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {eventsAnalytics.data.eventsByCategory.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} events`, 'Count']}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <PieChart className="w-12 h-12 mb-2" />
                    <p>No category data available</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {eventsAnalytics?.data.eventsByCategory ? (
                  eventsAnalytics.data.eventsByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]
                          }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          {category._id.charAt(0).toUpperCase() + category._id.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">{category.count} events</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${(category.count / eventsAnalytics.data.totalEvents) * 100}%`,
                              backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No category data available</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children Content */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}

        {/* Platform Summary Footer */}
        {!children && (
          <div className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold mb-2">Platform Summary</h3>
                <p className="text-blue-100 text-sm">Real-time performance overview</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
                  <div className="text-xs text-blue-200">Total Users</div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold">{adminStats.activeEvents}</div>
                  <div className="text-xs text-blue-200">Active Events</div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold">{formatCurrency(adminStats.totalRevenue)}</div>
                  <div className="text-xs text-blue-200">Total Revenue</div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold">{adminStats.platformUptime}%</div>
                  <div className="text-xs text-blue-200">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}