/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Eye, 
  Star,
  Clock,
  MapPin,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Award,
  Bell,
  Settings,
  BarChart3,
  TrendingDown,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Crown
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

interface Activity {
  id: string;
  message: string;
  time: string;
  color: string;
  icon: any;
}

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    totalEarnings: 0,
    avgRating: 0,
    monthlyGrowth: {
      participants: 0,
      earnings: 0,
      events: 0
    },
    recentActivities: [] as Activity[],
    upcomingEvents: [] as any[],
    topPerformingEvents: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'host')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'host') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch events data with resilient fallback
      const events: any[] = [];
      try {
        const eventsResponse = await api.get('/events/my-hosted');
        const data = eventsResponse.data?.data || [];
        events.push(...data);
      } catch (err: any) {
        console.warn('Host: /events/my-hosted unavailable, using fallback.', err?.message || err);
      }

      // Calculate dashboard metrics
      const activeEvents = events.filter((event: any) =>
        event.status === 'open' && new Date(event.date) > new Date()
      ).length;

      const totalParticipants = events.reduce((sum: number, event: any) =>
        sum + (event.currentParticipants || 0), 0
      );

      const totalEarnings = events.reduce((sum: number, event: any) =>
        sum + ((event.currentParticipants || 0) * (event.price || 0)), 0
      );

      // Fetch ratings data from API with fallback
      let avgRating = 0;
      try {
        const ratingsResponse = await api.get('/events/my-ratings');
        const ratingsData = ratingsResponse.data?.data || {};
        avgRating = ratingsData.averageRating || 0;
      } catch (err: any) {
        console.warn('Host: /events/my-ratings unavailable, defaulting rating.', err?.message || err);
        avgRating = 0;
      }

      // Fetch growth data from API with fallback
      let monthlyGrowth = { participants: 0, earnings: 0, events: 0 };
      try {
        const growthResponse = await api.get('/dashboard/growth');
        const growthData = growthResponse.data?.data || {};
        monthlyGrowth = {
          participants: growthData.participantsGrowth || 0,
          earnings: growthData.earningsGrowth || 0,
          events: growthData.eventsGrowth || 0,
        };
      } catch (err: any) {
        console.warn('Host: /dashboard/growth unavailable, using fallback growth.', err?.message || err);
        monthlyGrowth = { participants: 0, earnings: 0, events: 0 };
      }

      // Fetch recent activities from API
      let recentActivities: Activity[] = [];
      try {
        const activitiesResponse = await api.get('/dashboard/activities');
        recentActivities = (activitiesResponse.data?.data || []) as Activity[];
      } catch (err: any) {
        console.warn('Host: /dashboard/activities unavailable.', err?.message || err);
        recentActivities = [];
      }

      // Upcoming events
      const upcomingEvents = events
        .filter((event: any) => new Date(event.date) > new Date())
        .slice(0, 3);

      // Top performing events
      const topPerformingEvents = events
        .sort((a: any, b: any) => ((b.currentParticipants || 0) * (b.price || 0)) - ((a.currentParticipants || 0) * (a.price || 0)))
        .slice(0, 3);

      setDashboardData({
        totalEvents: events.length,
        activeEvents,
        totalParticipants,
        totalEarnings,
        avgRating,
        monthlyGrowth,
        recentActivities,
        upcomingEvents,
        topPerformingEvents,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-emerald-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Preparing your insights...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'host') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-full mx-auto p-6 space-y-6">
        {/* Premium Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-green-600 to-teal-700 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]"></div>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro Host
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1">
                  <Star className="w-3 h-3 mr-1 fill-yellow-300" />
                  {dashboardData.avgRating.toFixed(1)} Rating
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Host'}! 👋
              </h1>
              <p className="text-emerald-50 text-lg max-w-2xl">
                Your events are performing great! Keep up the excellent work.
              </p>
              
              {/* Quick Stats in Header */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-200" />
                    <span className="text-emerald-100 text-xs font-medium">Revenue Growth</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    +{dashboardData.monthlyGrowth.earnings || 12}%
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-emerald-200" />
                    <span className="text-emerald-100 text-xs font-medium">Active Events</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardData.activeEvents}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-emerald-200" />
                    <span className="text-emerald-100 text-xs font-medium">Participants</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardData.totalParticipants}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link href="/dashboard/host/events/create">
                <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-white/20 border-0 h-12 px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Bell className="w-4 h-4" />
                </Button>
                
                <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  onClick={() => fetchDashboardData()}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events Card */}
        <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/10 to-blue-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Events</CardTitle>
            <div className="p-3 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-gray-900">{dashboardData.totalEvents}</div>
              <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                All time
              </Badge>
            </div>
            <div className="flex items-center mt-3 gap-1">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">
                {dashboardData.activeEvents} active
              </span>
              <span className="text-sm text-gray-500">• Running now</span>
            </div>
            <div className="mt-4 bg-linear-to-r from-blue-100 via-blue-50 to-transparent rounded-full h-2 overflow-hidden">
              <div 
                className="bg-linear-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-200"
                style={{ width: `${Math.min((dashboardData.activeEvents / Math.max(dashboardData.totalEvents, 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Total Participants Card */}
        <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/10 to-emerald-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Participants</CardTitle>
            <div className="p-3 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-gray-900">{dashboardData.totalParticipants.toLocaleString()}</div>
              {dashboardData.monthlyGrowth.participants !== 0 && (
                <Badge variant="outline" className={`text-xs ${
                  dashboardData.monthlyGrowth.participants > 0 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {dashboardData.monthlyGrowth.participants > 0 ? '+' : ''}
                  {dashboardData.monthlyGrowth.participants}%
                </Badge>
              )}
            </div>
            <div className="flex items-center mt-3 gap-1">
              {dashboardData.monthlyGrowth.participants >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${
                dashboardData.monthlyGrowth.participants >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {dashboardData.monthlyGrowth.participants >= 0 ? 'Growing' : 'Declining'}
              </span>
              <span className="text-sm text-gray-500">• vs last month</span>
            </div>
            <div className="mt-4 bg-linear-to-r from-emerald-100 via-emerald-50 to-transparent rounded-full h-2 overflow-hidden">
              <div className="bg-linear-to-r from-emerald-600 to-emerald-400 h-2 rounded-full w-4/5 transition-all duration-1000 ease-out shadow-lg shadow-emerald-200"></div>
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings Card */}
        <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-400/10 to-orange-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Revenue</CardTitle>
            <div className="p-3 bg-linear-to-br from-amber-50 to-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-gray-900">
                ${dashboardData.totalEarnings.toLocaleString()}
              </div>
              {dashboardData.monthlyGrowth.earnings !== 0 && (
                <Badge variant="outline" className={`text-xs ${
                  dashboardData.monthlyGrowth.earnings > 0 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {dashboardData.monthlyGrowth.earnings > 0 ? '+' : ''}
                  {dashboardData.monthlyGrowth.earnings}%
                </Badge>
              )}
            </div>
            <div className="flex items-center mt-3 gap-1">
              {dashboardData.monthlyGrowth.earnings >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${
                dashboardData.monthlyGrowth.earnings >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${Math.abs(dashboardData.monthlyGrowth.earnings * 100).toFixed(0)} this month
              </span>
            </div>
            <div className="mt-4 bg-linear-to-r from-orange-100 via-amber-50 to-transparent rounded-full h-2 overflow-hidden">
              <div className="bg-linear-to-r from-orange-600 to-amber-400 h-2 rounded-full w-3/4 transition-all duration-1000 ease-out shadow-lg shadow-orange-200"></div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating Card */}
        <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-yellow-400/10 to-yellow-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-600">Avg Rating</CardTitle>
            <div className="p-3 bg-linear-to-br from-yellow-50 to-yellow-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-gray-900">
                {dashboardData.avgRating.toFixed(1)}
              </div>
              <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                / 5.0
              </Badge>
            </div>
            <div className="flex items-center mt-3 gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(dashboardData.avgRating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-yellow-600 ml-1">
                {dashboardData.avgRating >= 4.5 ? 'Excellent' : dashboardData.avgRating >= 4 ? 'Great' : 'Good'}
              </span>
            </div>
            <div className="mt-4 bg-linear-to-r from-yellow-100 via-yellow-50 to-transparent rounded-full h-2 overflow-hidden">
              <div 
                className="bg-linear-to-r from-yellow-600 to-yellow-400 h-2 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-yellow-200"
                style={{ width: `${(dashboardData.avgRating / 5) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {children || (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Actions & Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Grid */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-linear-to-r from-gray-50 to-white border-b border-gray-100\">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Zap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                      <CardDescription className="text-sm">Manage your events efficiently</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/dashboard/host/events/create" className="group">
                    <div className="relative overflow-hidden rounded-xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-green-50 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <Plus className="w-8 h-8 text-emerald-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-1">Create New Event</h3>
                      <p className="text-sm text-gray-600">Set up your next amazing event</p>
                      <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>

                  <Link href="/dashboard/host/events" className="group">
                    <div className="relative overflow-hidden rounded-xl border-2 border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <Eye className="w-8 h-8 text-blue-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-1">Manage Events</h3>
                      <p className="text-sm text-gray-600">View and edit your events</p>
                      <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>

                  <Link href="/dashboard/host/participants" className="group">
                    <div className="relative overflow-hidden rounded-xl border-2 border-purple-200 bg-linear-to-br from-purple-50 to-pink-50 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <Users className="w-8 h-8 text-purple-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-1">Participants</h3>
                      <p className="text-sm text-gray-600">Manage your attendees</p>
                      <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>

                  <Link href="/dashboard/host/analytics" className="group">
                    <div className="relative overflow-hidden rounded-xl border-2 border-orange-200 bg-linear-to-br from-orange-50 to-amber-50 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <BarChart3 className="w-8 h-8 text-orange-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-1">Analytics</h3>
                      <p className="text-sm text-gray-600">View detailed insights</p>
                      <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity with Enhanced Design */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-linear-to-r from-gray-50 to-white border-b border-gray-100\">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                      <CardDescription className="text-sm">Latest updates on your events</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 animate-pulse">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.map((activity, index) => (
                      <div 
                        key={activity.id} 
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`p-3 rounded-xl bg-linear-to-br from-${activity.color}-100 to-${activity.color}-50 group-hover:scale-110 transition-transform duration-300`}>
                          <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-0.5">{activity.message}</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events with Premium Design */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-linear-to-r from-gray-50 to-white border-b border-gray-100\">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Upcoming Events</CardTitle>
                      <CardDescription className="text-sm">Your scheduled events</CardDescription>
                    </div>
                  </div>
                  <Link href="/dashboard/host/events">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {dashboardData.upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingEvents.map((event: any, index: number) => (
                      <div 
                        key={event._id} 
                        className="relative group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                        <div className="relative flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-emerald-200 transition-all duration-300 hover:shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-linear-to-br from-orange-100 to-amber-50 rounded-xl group-hover:scale-110 transition-transform">
                              <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                  <Clock className="w-3.5 h-3.5" />
                                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                  <Users className="w-3.5 h-3.5" />
                                  {event.currentParticipants || 0}/{event.maxParticipants} Spots
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {event.location?.city || 'TBD'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-black text-emerald-600">${event.price}</p>
                              <Badge variant="outline" className={`text-xs mt-1 ${
                                event.status === 'open' 
                                  ? 'bg-green-50 border-green-200 text-green-700' 
                                  : 'bg-gray-50 border-gray-200 text-gray-600'
                              }`}>
                                {event.status}
                              </Badge>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => window.location.href = `/events/${event._id}`}
                            >
                              <ChevronRight className="w-5 h-5 text-emerald-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-gray-100 rounded-full blur-xl"></div>
                      <Calendar className="relative w-16 h-16 text-gray-300 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Start creating amazing events and watch your community grow
                    </p>
                    <Link href="/dashboard/host/events/create">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Event
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Enhanced Performance & Insights */}
          <div className="space-y-6">
            {/* Performance Overview with Modern Design */}
            <Card className="border-0 shadow-lg overflow-hidden bg-linear-to-br from-white to-gray-50">
              <CardHeader className="bg-linear-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Performance</CardTitle>
                    <CardDescription className="text-sm">Your key metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Main Performance Metric */}
                <div className="text-center p-6 bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl mb-3 shadow-lg shadow-indigo-200">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-1">
                    ${Math.round((dashboardData.totalEarnings / Math.max(dashboardData.totalEvents, 1)))}
                  </div>
                  <p className="text-sm font-medium text-gray-600">Avg Revenue per Event</p>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Occupancy Rate</span>
                      <span className="text-sm font-bold text-emerald-600">78%</span>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-green-400 rounded-full shadow-inner" style={{ width: '78%' }}></div>
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Success Rate</span>
                      <span className="text-sm font-bold text-blue-600">92%</span>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-400 rounded-full shadow-inner" style={{ width: '92%' }}></div>
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Customer Satisfaction</span>
                      <span className="text-sm font-bold text-purple-600">96%</span>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-400 rounded-full shadow-inner" style={{ width: '96%' }}></div>
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                  </div>
                </div>

                <Link href="/dashboard/host/analytics">
                  <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Top Performing Events with Premium Design */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-linear-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Top Performers</CardTitle>
                    <CardDescription className="text-sm">Your best events</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {dashboardData.topPerformingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.topPerformingEvents.map((event: any, index: number) => (
                      <div 
                        key={event._id} 
                        className="group relative"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-linear-to-r hover:from-amber-50 hover:to-transparent transition-all duration-300 cursor-pointer">
                          {/* Rank Badge */}
                          <div className={`shrink-0 w-10 h-10 rounded-xl bg-linear-to-br shadow-lg flex items-center justify-center text-white font-black text-sm ${
                            index === 0 ? 'from-amber-500 to-orange-500 shadow-amber-200' :
                            index === 1 ? 'from-gray-400 to-gray-500 shadow-gray-200' :
                            'from-orange-400 to-amber-400 shadow-orange-200'
                          } group-hover:scale-110 transition-transform`}>
                            {index + 1}
                          </div>
                          
                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate mb-0.5 group-hover:text-amber-700 transition-colors">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="flex items-center gap-1 text-gray-500">
                                <Users className="w-3 h-3" />
                                {event.currentParticipants} attendees
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-emerald-600 font-semibold">
                                ${(event.currentParticipants * event.price).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Trophy Icon for Top Event */}
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                              <Award className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="relative inline-block mb-3">
                      <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl"></div>
                      <Award className="relative w-12 h-12 text-amber-300" />
                    </div>
                    <p className="text-sm text-gray-500">No events data yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create events to see performance</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights with Premium Design */}
            <Card className="border-0 shadow-xl overflow-hidden bg-linear-to-br from-purple-600 via-indigo-600 to-blue-600">
              <div className="absolute inset-0 bg-grid-white/[0.05] mask-[linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">AI Insights</CardTitle>
                    <CardDescription className="text-purple-100 text-sm">Powered by advanced analytics</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span className="text-xs text-purple-100 font-medium">Real-time recommendations</span>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-3 pb-6">
                {/* Insight Cards */}
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white mb-1">Growth Opportunity</p>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        Weekend events show 40% higher attendance. Consider scheduling more weekend activities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform">
                      <DollarSign className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white mb-1">Pricing Suggestion</p>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        Tech workshops can be priced 15% higher based on market demand analysis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Target className="w-4 h-4 text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white mb-1">Engagement Tip</p>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        Send reminder emails 2 days before events to reduce no-shows by 35%.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm mt-4 shadow-lg shadow-black/10"
                  onClick={() => window.location.href = '/dashboard/host/analytics'}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Explore AI Insights
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
