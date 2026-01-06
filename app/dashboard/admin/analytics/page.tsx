'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Star,
  Activity,
  UserCheck,
  Download,
  RefreshCw,
  BarChart4,
  PieChart,
  LineChart,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Types
interface AnalyticsPeriod {
  label: string;
  value: string;
}

interface UserAnalytics {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByRole: Array<{
    _id: string;
    count: number;
  }>;
  dailyRegistrations: Array<{
    date: string;
    count: number;
  }>;
  topHosts: Array<{
    _id: string;
    fullName: string;
    email: string;
    averageRating: number;
    hostedEventsCount: number;
    totalRevenue?: number;
    profileImage?: string;
  }>;
}

interface RevenueAnalytics {
  period: string;
  summary: {
    totalRevenue: number;
    totalBookings: number;
    averageBookingValue: number;
    revenueChange: number;
    bookingChange: number;
  };
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  topRevenueEvents: Array<{
    _id: string;
    title: string;
    revenue: number;
    bookings: number;
    category: string;
  }>;
}

interface EventAnalytics {
  period: string;
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  eventsByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  eventsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  topPerformingEvents: Array<{
    _id: string;
    title: string;
    participationRate: number;
    revenue: number;
    rating: number;
    category: string;
  }>;
}

const PERIODS: AnalyticsPeriod[] = [
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'Last 90 Days', value: '90days' },
  { label: 'Last Year', value: '1year' },
  { label: 'All Time', value: 'all' },
];

const STATS_CARDS = {
  users: [
    {
      title: 'Total Users',
      description: 'All registered users',
      icon: Users,
      color: 'blue',
      trendKey: 'totalUsers'
    },
    {
      title: 'Active Users',
      description: 'Currently active',
      icon: Activity,
      color: 'green',
      trendKey: 'activeUsers'
    },
    {
      title: 'New Users',
      description: 'Recent registrations',
      icon: TrendingUp,
      color: 'purple',
      trendKey: 'newUsers'
    },
    {
      title: 'Verified Users',
      description: 'Verified accounts',
      icon: UserCheck,
      color: 'orange',
      trendKey: 'verifiedUsers'
    }
  ],
  revenue: [
    {
      title: 'Total Revenue',
      description: 'All revenue generated',
      icon: DollarSign,
      color: 'green',
      trendKey: 'totalRevenue'
    },
    {
      title: 'Total Bookings',
      description: 'Completed bookings',
      icon: Calendar,
      color: 'blue',
      trendKey: 'totalBookings'
    },
    {
      title: 'Avg Booking Value',
      description: 'Average per booking',
      icon: BarChart3,
      color: 'purple',
      trendKey: 'averageBookingValue'
    },
    {
      title: 'Revenue Growth',
      description: 'Compared to last period',
      icon: TrendingUp,
      color: 'indigo',
      trendKey: 'revenueChange'
    }
  ],
  events: [
    {
      title: 'Total Events',
      description: 'All events created',
      icon: Calendar,
      color: 'blue',
      trendKey: 'totalEvents'
    },
    {
      title: 'Active Events',
      description: 'Currently running',
      icon: Activity,
      color: 'green',
      trendKey: 'activeEvents'
    },
    {
      title: 'Completed Events',
      description: 'Successfully finished',
      icon: CheckCircle,
      color: 'purple',
      trendKey: 'completedEvents'
    },
    {
      title: 'Cancelled Events',
      description: 'Cancelled events',
      icon: XCircle,
      color: 'red',
      trendKey: 'cancelledEvents'
    }
  ]
};

export default function AdminAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30days');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
    period: '30days',
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    usersByRole: [],
    dailyRegistrations: [],
    topHosts: []
  });
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics>({
    period: '30days',
    summary: {
      totalRevenue: 0,
      totalBookings: 0,
      averageBookingValue: 0,
      revenueChange: 0,
      bookingChange: 0
    },
    dailyRevenue: [],
    revenueByCategory: [],
    topRevenueEvents: []
  });
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics>({
    period: '30days',
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    eventsByCategory: [],
    eventsByStatus: [],
    topPerformingEvents: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Parallel API calls for better performance
      const [userResponse, revenueResponse, eventResponse] = await Promise.allSettled([
        api.get(`/admin/analytics/users?period=${selectedPeriod}`),
        api.get(`/admin/analytics/revenue?period=${selectedPeriod}`),
        api.get(`/admin/analytics/events?period=${selectedPeriod}`)
      ]);

      // Handle user analytics
      if (userResponse.status === 'fulfilled') {
        setUserAnalytics(userResponse.value.data?.data || userResponse.value.data);
      } else {
        console.error('Failed to fetch user analytics:', userResponse.reason);
        toast.error('Failed to load user analytics');
      }

      // Handle revenue analytics
      if (revenueResponse.status === 'fulfilled') {
        setRevenueAnalytics(revenueResponse.value.data?.data || revenueResponse.value.data);
      } else {
        console.error('Failed to fetch revenue analytics:', revenueResponse.reason);
        toast.error('Failed to load revenue analytics');
      }

      // Handle event analytics
      if (eventResponse.status === 'fulfilled') {
        setEventAnalytics(eventResponse.value.data?.data || eventResponse.value.data);
      } else {
        console.error('Failed to fetch event analytics:', eventResponse.reason);
        toast.error('Failed to load event analytics');
      }

    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error(error.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalyticsData();
  };

  const handleExportData = () => {
    // Export functionality placeholder
    const analyticsData = {
      period: selectedPeriod,
      timestamp: new Date().toISOString(),
      users: userAnalytics,
      revenue: revenueAnalytics,
      events: eventAnalytics
    };

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Analytics data exported successfully');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTrendIcon = (value: number): React.ReactNode => {
    if (value > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (value < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (value: number): string => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getTrendText = (value: number): string => {
    if (value > 0) return `+${value}%`;
    if (value < 0) return `${value}%`;
    return '0%';
  };

  const renderStatCard = (
    title: string,
    value: number | string,
    description: string,
    icon: React.ElementType,
    color: string,
    trend?: number,
    isCurrency: boolean = false
  ) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-50`}>
          {React.createElement(icon, { className: `w-4 h-4 text-${color}-600` })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {isCurrency ? formatCurrency(value as number) : formatNumber(value as number)}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">{description}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {getTrendIcon(trend)}
              <span className={`text-xs font-medium ${getTrendColor(trend)}`}>
                {getTrendText(trend)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeletonCard = () => (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500'
    };
    return colors[color] || 'bg-blue-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>{renderSkeletonCard()}</div>
            ))}
          </div>

          {/* Additional Skeleton Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportData}
              className="border-gray-200 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* User Analytics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              User Analytics
            </h2>
            <Badge variant="outline" className="text-xs">
              {selectedPeriod.replace('days', ' days').replace('year', 'year').toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS_CARDS.users.map((stat) => (
              <div key={stat.title}>
                {renderStatCard(
                  stat.title,
                  userAnalytics[stat.trendKey as keyof UserAnalytics] as number,
                  stat.description,
                  stat.icon,
                  stat.color
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Revenue Analytics
            </h2>
            <Badge variant="outline" className="text-xs">
              Total: {formatCurrency(revenueAnalytics.summary.totalRevenue)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderStatCard(
              'Total Revenue',
              revenueAnalytics.summary.totalRevenue,
              'All revenue generated',
              DollarSign,
              'green',
              revenueAnalytics.summary.revenueChange,
              true
            )}
            {renderStatCard(
              'Total Bookings',
              revenueAnalytics.summary.totalBookings,
              'Completed bookings',
              Calendar,
              'blue',
              revenueAnalytics.summary.bookingChange
            )}
            {renderStatCard(
              'Avg Booking Value',
              revenueAnalytics.summary.averageBookingValue,
              'Average per booking',
              BarChart3,
              'purple',
              undefined,
              true
            )}
            {renderStatCard(
              'Revenue Growth',
              revenueAnalytics.summary.revenueChange,
              'Compared to last period',
              TrendingUp,
              'indigo'
            )}
          </div>
        </div>

        {/* Event Analytics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Event Analytics
            </h2>
            <Badge variant="outline" className="text-xs">
              {eventAnalytics.totalEvents} Total Events
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS_CARDS.events.map((stat) => (
              <div key={stat.title}>
                {renderStatCard(
                  stat.title,
                  eventAnalytics[stat.trendKey as keyof EventAnalytics] as number,
                  stat.description,
                  stat.icon,
                  stat.color
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout for Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Hosts */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5 text-yellow-600" />
                Top Performing Hosts
              </CardTitle>
              <CardDescription>
                Based on ratings and event performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userAnalytics.topHosts.length > 0 ? (
                <div className="space-y-3">
                  {userAnalytics.topHosts.slice(0, 5).map((host, index) => (
                    <div 
                      key={host._id} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {host.fullName?.charAt(0) || 'H'}
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{host.fullName}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{host.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900">{host.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs font-normal">
                            {host.hostedEventsCount} events
                          </Badge>
                          {host.totalRevenue && (
                            <Badge variant="outline" className="text-xs font-normal">
                              {formatCurrency(host.totalRevenue)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No host data available</p>
                  <p className="text-sm text-gray-400 mt-1">Host performance metrics will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Revenue Events */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-green-600" />
                Top Revenue Events
              </CardTitle>
              <CardDescription>
                Highest revenue generating events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueAnalytics.topRevenueEvents.length > 0 ? (
                <div className="space-y-3">
                  {revenueAnalytics.topRevenueEvents.slice(0, 5).map((event, index) => (
                    <div 
                      key={event._id} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {index < 3 && (
                            <div className={`w-5 h-5 ${getColorClasses(['green', 'blue', 'purple'][index] || 'gray')} rounded-full flex items-center justify-center`}>
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                          )}
                          <p className="font-medium text-gray-900 truncate">{event.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-normal capitalize">
                            {event.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{event.bookings} bookings</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(event.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No revenue data available</p>
                  <p className="text-sm text-gray-400 mt-1">Event revenue metrics will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Distribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users by Role */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="w-5 h-5 text-blue-600" />
                Users by Role
              </CardTitle>
              <CardDescription>Distribution of user roles</CardDescription>
            </CardHeader>
            <CardContent>
              {userAnalytics.usersByRole.length > 0 ? (
                <div className="space-y-4">
                  {userAnalytics.usersByRole.map((role, index) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                    const percentage = (role.count / userAnalytics.totalUsers) * 100;
                    return (
                      <div key={role._id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-sm font-medium capitalize">{role._id}s</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{role.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No role distribution data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events by Category */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart4 className="w-5 h-5 text-purple-600" />
                Events by Category
              </CardTitle>
              <CardDescription>Category distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {eventAnalytics.eventsByCategory.length > 0 ? (
                <div className="space-y-3">
                  {eventAnalytics.eventsByCategory.map((category, index) => {
                    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                    return (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                          <span className="text-sm capitalize">{category.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">{category.count}</span>
                          <Badge variant="outline" className="text-xs">
                            {category.percentage?.toFixed(1) || '0.0'}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart4 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events by Status */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-green-600" />
                Events by Status
              </CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {eventAnalytics.eventsByStatus.length > 0 ? (
                <div className="space-y-3">
                  {eventAnalytics.eventsByStatus.map((status, index) => {
                    const getStatusColor = (status: string) => {
                      if (!status) return 'bg-gray-500';
                      switch (status.toLowerCase()) {
                        case 'active': return 'bg-green-500';
                        case 'completed': return 'bg-blue-500';
                        case 'cancelled': return 'bg-red-500';
                        case 'pending': return 'bg-yellow-500';
                        default: return 'bg-gray-500';
                      }
                    };
                    
                    const getStatusIcon = (status: string) => {
                      if (!status) return <AlertCircle className="w-3 h-3" />;
                      switch (status.toLowerCase()) {
                        case 'active': return <Activity className="w-3 h-3" />;
                        case 'completed': return <CheckCircle className="w-3 h-3" />;
                        case 'cancelled': return <XCircle className="w-3 h-3" />;
                        case 'pending': return <Clock className="w-3 h-3" />;
                        default: return <AlertCircle className="w-3 h-3" />;
                      }
                    };

                    return (
                      <div key={status.status || `status-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getStatusColor(status.status)}`}>
                            {getStatusIcon(status.status)}
                          </div>
                          <span className="text-sm capitalize">{status.status || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">{status.count}</span>
                          <Badge variant="outline" className="text-xs">
                            {status.percentage ? status.percentage.toFixed(1) : '0.0'}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No status data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Platform Summary</h3>
              <p className="text-sm text-gray-600">Performance overview for selected period</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userAnalytics.totalUsers}</div>
                <div className="text-xs text-gray-500">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenueAnalytics.summary.totalRevenue)}
                </div>
                <div className="text-xs text-gray-500">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{eventAnalytics.totalEvents}</div>
                <div className="text-xs text-gray-500">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{revenueAnalytics.summary.totalBookings}</div>
                <div className="text-xs text-gray-500">Total Bookings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}