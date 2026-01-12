'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Calendar, BookOpen, TrendingUp, Users, Clock, DollarSign, Activity, Target, Award, ArrowUpRight, ArrowDownRight, Star, Zap } from 'lucide-react';
import { fetchUserJoinedEvents, fetchUserBookings } from '@/app/lib/dashboard';
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  pastBookings: number;
  totalSpent: number;
  monthlySpent: number;
  hostedEvents: number;
  joinedEvents: number;
  attendedEvents: number;
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'user')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch user bookings
      const bookingsResponse = await fetchUserBookings();
      const bookings = bookingsResponse.data || [];
      
      // Fetch user events
      const eventsResponse = await fetchUserJoinedEvents(user._id);
      const eventsData = eventsResponse.data || {};
      
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      // Calculate stats
      const totalBookings = bookings.length;
      const upcomingBookings = bookings.filter((booking: any) => {
        const dateStr = booking.event?.date || booking.date;
        return dateStr && isAfter(parseISO(dateStr), now);
      }).length;
      const pastBookings = bookings.filter((booking: any) => {
        const dateStr = booking.event?.date || booking.date;
        return dateStr && isBefore(parseISO(dateStr), now);
      }).length;
      
      const totalSpent = bookings.reduce((sum: number, booking: any) => 
        sum + (booking.amount || booking.event?.price || 0), 0
      );
      
      const monthlySpent = bookings.filter((booking: any) => {
        const dateStr = booking.createdAt || booking.date;
        if (!dateStr) return false;
        const bookingDate = parseISO(dateStr);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      }).reduce((sum: number, booking: any) => 
        sum + (booking.amount || booking.event?.price || 0), 0
      );
      
      // Use the API response structure
      const hostedEvents = eventsData.hosted?.length || 0;
      const joinedEvents = eventsData.joined?.length || 0;
      const savedEvents = eventsData.saved?.length || 0;
      const attendedEvents = pastBookings;
      
      setStats({
        totalBookings,
        upcomingBookings,
        pastBookings,
        totalSpent,
        monthlySpent,
        hostedEvents,
        joinedEvents,
        attendedEvents
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.fullName}! 👋</h1>
            <p className="text-gray-600 text-lg">Here's your event activity overview</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <Activity className="w-5 h-5" />
                <span className="font-semibold">Active User</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900">Total Bookings</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-1">{stats?.totalBookings || 0}</div>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>{stats?.upcomingBookings || 0} upcoming events</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-900">My Events</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">{stats?.joinedEvents || 0}</div>
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Target className="w-3 h-3" />
              <span>{stats?.hostedEvents || 0} hosted</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-900">Events Attended</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 mb-1">{stats?.attendedEvents || 0}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <Award className="w-3 h-3" />
              <span>Great attendance!</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-amber-900">Total Spent</CardTitle>
            <div className="bg-amber-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900 mb-1">${stats?.totalSpent || 0}</div>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <TrendingUp className="w-3 h-3" />
              <span>This month: ${stats?.monthlySpent || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/user/my-bookings">
                  <div className="group p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-3">
                      <Calendar className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                      <ArrowUpRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Upcoming Events</h3>
                    <p className="text-sm text-gray-600">You have {stats?.upcomingBookings || 0} events coming up</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <span>View all</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/user/my-events">
                  <div className="group p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-3">
                      <Target className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
                      <ArrowUpRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">My Events</h3>
                    <p className="text-sm text-gray-600">Manage your hosted and joined events</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-purple-600 font-medium">
                      <span>Manage</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
                <Link href="/events">
                  <div className="group p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-3">
                      <Star className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Explore Events</h3>
                    <p className="text-sm text-gray-600">Discover new events and activities</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <span>Explore</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
                <Link href={`/profile/${user._id}`}>
                  <div className="group p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-8 h-8 text-amber-600 group-hover:scale-110 transition-transform" />
                      <ArrowUpRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">My Profile</h3>
                    <p className="text-sm text-gray-600">Update your personal information</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <span>Edit profile</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Engagement Rate</span>
                  <span className="text-sm font-bold text-blue-600">High</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-emerald-900">Member Since</span>
                  <span className="text-sm font-bold text-emerald-600">2024</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Status</span>
                  <span className="text-sm font-bold text-purple-600">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}