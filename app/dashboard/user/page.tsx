'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Calendar, BookOpen, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { fetchUserBookings, fetchUserJoinedEvents } from '@/lib/api';
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
      const upcomingBookings = bookings.filter((booking: any) => 
        isAfter(parseISO(booking.event?.date || booking.date), now)
      ).length;
      const pastBookings = bookings.filter((booking: any) => 
        isBefore(parseISO(booking.event?.date || booking.date), now)
      ).length;
      
      const totalSpent = bookings.reduce((sum: number, booking: any) => 
        sum + (booking.amount || booking.event?.price || 0), 0
      );
      
      const monthlySpent = bookings.filter((booking: any) => {
        const bookingDate = parseISO(booking.createdAt || booking.date);
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
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your bookings and events</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.upcomingBookings || 0} upcoming events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.joinedEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.hostedEvents || 0} hosted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendedEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Great attendance!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalSpent || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month: ${stats?.monthlySpent || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {children || (
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {user.fullName}!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Here's what's happening with your events today. Use the sidebar to navigate through your dashboard.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/user/my-bookings">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer group transform-gpu hover:scale-[1.02]">
                    <h3 className="font-medium mb-2 group-hover:text-green-600 transition-colors">📅 Upcoming Events</h3>
                    <p className="text-sm text-gray-600">You have {stats?.upcomingBookings || 0} events coming up.</p>
                  </div>
                </Link>
                <Link href="/dashboard/user/my-events">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer group transform-gpu hover:scale-[1.02]">
                    <h3 className="font-medium mb-2 group-hover:text-green-600 transition-colors">🎯 My Events</h3>
                    <p className="text-sm text-gray-600">Manage your hosted and joined events.</p>
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}