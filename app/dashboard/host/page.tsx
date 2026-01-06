'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
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
  Settings
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

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
    recentActivities: [],
    upcomingEvents: [],
    topPerformingEvents: []
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
      
      // Fetch events data
      const eventsResponse = await api.get('/events/my-hosted');
      const events = eventsResponse.data.data || [];
      
      // Calculate dashboard metrics
      const activeEvents = events.filter((event: any) => 
        event.status === 'open' && new Date(event.date) > new Date()
      ).length;
      
      const totalParticipants = events.reduce((sum: number, event: any) => 
        sum + event.currentParticipants, 0
      );
      
      const totalEarnings = events.reduce((sum: number, event: any) => 
        sum + (event.currentParticipants * event.price), 0
      );
      
      // Fetch ratings data from API
      const ratingsResponse = await api.get('/events/my-ratings');
      const ratingsData = ratingsResponse.data.data || {};
      const avgRating = ratingsData.averageRating || 0;
      
      // Fetch growth data from API
      const growthResponse = await api.get('/dashboard/growth');
      const growthData = growthResponse.data.data || {};
      const monthlyGrowth = {
        participants: growthData.participantsGrowth || 0,
        earnings: growthData.earningsGrowth || 0,
        events: growthData.eventsGrowth || 0
      };
      
      // Fetch recent activities from API
      const activitiesResponse = await api.get('/dashboard/activities');
      const recentActivities = activitiesResponse.data.data || [];
      
      // Upcoming events
      const upcomingEvents = events
        .filter((event: any) => new Date(event.date) > new Date())
        .slice(0, 3);
      
      // Top performing events
      const topPerformingEvents = events
        .sort((a: any, b: any) => (b.currentParticipants * b.price) - (a.currentParticipants * a.price))
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
        topPerformingEvents
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'host') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName || 'Host'}!</h1>
            <p className="text-green-100 text-lg">Manage your events and track your performance</p>
            <div className="flex items-center space-x-4 mt-4">
              <Badge className="bg-white/20 text-white border-white/30">
                <Award className="w-3 h-3 mr-1" />
                Pro Host
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <Star className="w-3 h-3 mr-1" />
                {dashboardData.avgRating} Rating
              </Badge>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Events</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{dashboardData.totalEvents}</div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-600 font-medium">
                {dashboardData.activeEvents} active events
              </p>
            </div>
            <div className="mt-2 bg-blue-50 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(dashboardData.activeEvents / Math.max(dashboardData.totalEvents, 1)) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Participants</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{dashboardData.totalParticipants.toLocaleString()}</div>
            <div className="flex items-center mt-2">
              {dashboardData.monthlyGrowth.participants > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs font-medium ${
                dashboardData.monthlyGrowth.participants > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {dashboardData.monthlyGrowth.participants > 0 ? '+' : ''}{dashboardData.monthlyGrowth.participants}% from last month
              </p>
            </div>
            <div className="mt-2 bg-green-50 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Earnings</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${dashboardData.totalEarnings.toLocaleString()}</div>
            <div className="flex items-center mt-2">
              {dashboardData.monthlyGrowth.earnings > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs font-medium ${
                dashboardData.monthlyGrowth.earnings > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {dashboardData.monthlyGrowth.earnings > 0 ? '+' : ''}{dashboardData.monthlyGrowth.earnings}% from last month
              </p>
            </div>
            <div className="mt-2 bg-emerald-50 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full w-4/5"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Avg Rating</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{dashboardData.avgRating}</div>
            <div className="flex items-center mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(dashboardData.avgRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-green-600 font-medium ml-2">Excellent</p>
            </div>
            <div className="mt-2 bg-yellow-50 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(dashboardData.avgRating / 5) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {children || (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/dashboard/host/events/create">
                    <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform-gpu hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <Link href="/dashboard/host/events">
                    <Button variant="outline" className="w-full h-12 border-2 hover:bg-gray-50 transform-gpu hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                      <Eye className="w-4 h-4 mr-2" />
                      View Events
                    </Button>
                  </Link>
                  <Link href="/dashboard/host/participants">
                    <Button variant="outline" className="w-full h-12 border-2 hover:bg-gray-50 transform-gpu hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                      <Users className="w-4 h-4 mr-2" />
                      Participants
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-2 border-purple-200 hover:bg-purple-50 transform-gpu hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    onClick={() => window.location.href = '/dashboard/host/events'}
                  >
                    <Brain className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="text-purple-600">AI Assistant</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span>Recent Activity</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                        <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full animate-pulse`}></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingEvents.map((event: any) => (
                      <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                {event.currentParticipants}/{event.maxParticipants}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${event.price}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming events</p>
                    <Link href="/dashboard/host/events/create">
                      <Button className="mt-4" size="sm">
                        Create Your First Event
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Performance Overview */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-500" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {Math.round((dashboardData.totalEarnings / Math.max(dashboardData.totalEvents, 1)))}
                  </div>
                  <p className="text-sm text-gray-600">Avg Revenue per Event</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Occupancy Rate</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Events */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.topPerformingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.topPerformingEvents.map((event: any, index: number) => (
                      <div key={event._id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                          <p className="text-xs text-gray-500">${event.currentParticipants * event.price} revenue</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            ${(event.currentParticipants * event.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">Growth Opportunity</p>
                  <p className="text-xs text-gray-600">Weekend events show 40% higher attendance</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">Pricing Suggestion</p>
                  <p className="text-xs text-gray-600">Tech workshops can be priced 15% higher</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={() => window.location.href = '/dashboard/host/events'}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  View AI Insights
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
