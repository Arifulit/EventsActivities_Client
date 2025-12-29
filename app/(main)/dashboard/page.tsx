'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { getDashboardStats } from '@/app/lib/dashboard';
import { getMyEvents } from '@/app/lib/events';
import {
  Calendar, Users, DollarSign, Star, Clock, MapPin, Plus, Eye, Edit, Trash2,
  User, Music, Gamepad2, Dumbbell, BookOpen, Coffee, Camera, Plane,
  BarChart3, Activity, Target, Search, Bell, Settings, ChevronRight,
  CalendarDays, UserCheck, Home, FileText, HelpCircle, Menu, X, Shield
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      // Redirect admin users to admin dashboard
      if (user.role === 'admin') {
        window.location.href = '/admin/admin-dashboard';
        return;
      }
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch real dashboard statistics
      const statsData = await getDashboardStats();
      if (statsData.success) {
        setStats(statsData.data);
      }
      
      // Fetch user's events
      const eventsData = await getMyEvents();
      if (eventsData.success) {
        setEvents(eventsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set fallback values
      setStats({
        totalEvents: 0,
        upcomingEvents: 0,
        pastEvents: 0,
        totalParticipants: 0,
        totalRevenue: 0,
        averageRating: 0,
        monthlyGrowth: 0,
        completionRate: 0
      });
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSidebarItems = (role: string) => {
    const items: any = {
      admin: [
        { id: 'overview', label: 'Dashboard', icon: Home },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'events', label: 'Events', icon: Calendar },
      ],
      host: [
        { id: 'overview', label: 'Dashboard', icon: Home },
        { id: 'events', label: 'My Events', icon: Calendar },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
      user: [
        { id: 'overview', label: 'Dashboard', icon: Home },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'profile', label: 'Profile', icon: User },
      ]
    };
    return items[role] || items.user;
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg">Please log in</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r transition-all`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && <span className="text-xl font-bold">EventsHub</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {sidebarOpen && (
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {getSidebarItems(user?.role || 'user').map((item: any) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} space-x-3 px-3 py-2 rounded-lg ${
                        activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}!</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Bell className="w-4 h-4" />
                </button>
                {user?.role === 'host' && (
                  <Link href="/events/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Event
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                  <p className="text-xs text-gray-500">+{stats?.monthlyGrowth || 0}% from last month</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold">{stats?.upcomingEvents || 0}</div>
                  <p className="text-xs text-gray-500">Next in 2 days</p>
                </div>

                {user?.role === 'host' ? (
                  <>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold">${stats?.totalRevenue || 0}</div>
                      <p className="text-xs text-gray-500">+12% from last month</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-600">Participants</p>
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold">{stats?.totalParticipants || 0}</div>
                      <p className="text-xs text-gray-500">+23% from last month</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-600">Rating</p>
                        <Star className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold">{stats?.averageRating || 0}</div>
                      <p className="text-xs text-gray-500">Your reviews</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-600">Completion</p>
                        <Target className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
                      <p className="text-xs text-gray-500">Events attended</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="music">Music</option>
                  <option value="sports">Sports</option>
                  <option value="gaming">Gaming</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500 text-center py-8">No events found</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Analytics</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <BarChart3 className="w-12 h-12 mr-2" />
                  <span>Analytics charts will appear here</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.fullName || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}