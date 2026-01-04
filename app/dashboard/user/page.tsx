'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Calendar, BookOpen, Heart, TrendingUp } from 'lucide-react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'user')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
        <p className="text-gray-600 mt-1">Manage your bookings and saved events</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              2 upcoming events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Events</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
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
            <div className="text-2xl font-bold">$450</div>
            <p className="text-xs text-muted-foreground">
              This month: $120
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
                    <p className="text-sm text-gray-600">You have 2 events coming up this week.</p>
                  </div>
                </Link>
                <Link href="/dashboard/user/saved-events">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer group transform-gpu hover:scale-[1.02]">
                    <h3 className="font-medium mb-2 group-hover:text-green-600 transition-colors">❤️ Saved Events</h3>
                    <p className="text-sm text-gray-600">3 new events match your interests.</p>
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