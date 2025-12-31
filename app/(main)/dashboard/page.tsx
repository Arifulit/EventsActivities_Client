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
  CalendarDays, UserCheck, Home, FileText, HelpCircle, Menu, X, Shield, TrendingUp
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
        window.location.href = '/admin/dashboard';
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900">Loading Dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing your workspace</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</div>
          <div className="text-gray-600 mb-6">Please log in to access your dashboard</div>
          <Link href="/auth/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar - Relative positioning within main content */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} glass border-r transition-all duration-300 flex-shrink-0`}>
        <div className="flex flex-col h-full sticky top-0">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {sidebarOpen && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EventsHub
              </span>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* User Profile Section - Moved to Top */}
          {sidebarOpen && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <div className="text-xs text-gray-500 capitalize flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      user?.role === 'admin' ? 'bg-red-500' : 
                      user?.role === 'host' ? 'bg-purple-500' : 'bg-green-500'
                    }`}></div>
                    {user?.role}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {getSidebarItems(user?.role || 'user').map((item: any) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        activeTab === item.id 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-200' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content - No margin needed since sidebar is part of flex */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="glass border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize animate-fade-in">{activeTab}</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  Welcome back, <span className="font-semibold text-gray-900">{user?.fullName}</span>!
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="relative p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Bell className="w-4 h-4 text-gray-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                {user?.role === 'host' && (
                  <Link 
                    href="/events/create" 
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-xl shadow-card hover-lift border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600">Total Events</p>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalEvents || 0}</div>
                  <div className="flex items-center text-sm">
                    <div className="flex items-center text-green-600 font-medium">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{stats?.monthlyGrowth || 0}%
                    </div>
                    <span className="text-gray-500 ml-2">from last month</span>
                  </div>
                </div>

                <div className="glass p-6 rounded-xl shadow-card hover-lift border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600">Upcoming</p>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.upcomingEvents || 0}</div>
                  <p className="text-sm text-gray-500">Next event in 2 days</p>
                </div>

                {user?.role === 'host' ? (
                  <>
                    <div className="glass p-6 rounded-xl shadow-card hover-lift border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-gray-600">Revenue</p>
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">${stats?.totalRevenue || 0}</div>
                      <div className="flex items-center text-sm">
                        <div className="flex items-center text-green-600 font-medium">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +12%
                        </div>
                        <span className="text-gray-500 ml-2">from last month</span>
                      </div>
                    </div>

                    <div className="glass p-6 rounded-xl shadow-card hover-lift border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-gray-600">Participants</p>
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Users className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalParticipants || 0}</div>
                      <div className="flex items-center text-sm">
                        <div className="flex items-center text-green-600 font-medium">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +23%
                        </div>
                        <span className="text-gray-500 ml-2">from last month</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="glass p-6 rounded-xl shadow-card hover-lift border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-gray-600">Rating</p>
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.averageRating || 0}</div>
                      <p className="text-sm text-gray-500">Your reviews</p>
                    </div>

                    <div className="glass p-6 rounded-xl shadow-card hover-lift border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-gray-600">Completion</p>
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Target className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.completionRate || 0}%</div>
                      <p className="text-sm text-gray-500">Events attended</p>
                    </div>
                  </>
                )}
              </div>

              {/* Recent Activity Section */}
              <div className="glass p-6 rounded-xl shadow-card border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New event registered</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Profile updated</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Received 5-star review</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Categories</option>
                  <option value="music">Music</option>
                  <option value="sports">Sports</option>
                  <option value="gaming">Gaming</option>
                  <option value="education">Education</option>
                  <option value="social">Social</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-xl shadow-card border border-gray-100 hover-lift">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No events found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass p-6 rounded-xl shadow-card border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Analytics Overview
                </h3>
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 className="w-12 h-12 mb-4" />
                  <span className="font-medium">Analytics charts will appear here</span>
                  <span className="text-sm mt-2">Track your performance metrics</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-xl shadow-card border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Engagement Rate</h4>
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <p className="text-sm text-gray-500">+5% from last month</p>
                </div>
                <div className="glass p-6 rounded-xl shadow-card border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Avg. Session Duration</h4>
                  <div className="text-2xl font-bold text-green-600">24m</div>
                  <p className="text-sm text-gray-500">+12% from last month</p>
                </div>
                <div className="glass p-6 rounded-xl shadow-card border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Bounce Rate</h4>
                  <div className="text-2xl font-bold text-orange-600">32%</div>
                  <p className="text-sm text-gray-500">-8% from last month</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass p-6 rounded-xl shadow-card border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Profile Settings
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.fullName || ''}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Save Changes
                    </button>
                    <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}