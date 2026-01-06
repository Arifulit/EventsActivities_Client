'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank,
  Star,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';

export default function HostEarningsPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    pendingPayments: 0,
    totalEvents: 0,
    averagePerEvent: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [hostReviews, setHostReviews] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [hostStats, setHostStats] = useState<{
    averageRating: number;
    totalReviews: number;
    totalEvents: number;
    activeEvents: number;
    ratingDistribution: Record<string, { count: number; percentage: string }> | null;
  }>({
    averageRating: 0,
    totalReviews: 0,
    totalEvents: 0,
    activeEvents: 0,
    ratingDistribution: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
    fetchHostReviews();
    fetchHostStats();
  }, [selectedPeriod, selectedEvent]);

  const fetchHostReviews = async () => {
    try {
      const response = await api.get(`/hosts/${user?._id}/rating-stats`);
      const data = response.data.data;
      
      // Update host reviews with the comprehensive data
      setHostReviews(data.reviews || []);
      
      // Update host stats with the rating statistics
      setHostStats(prev => ({
        ...prev,
        totalReviews: data.stats.totalReviews,
        averageRating: data.stats.averageRating,
        ratingDistribution: data.stats.ratingDistribution
      }));
      
      // Set monthly earnings data (mock for now, can be replaced with API call)
      setMonthlyEarnings([
        { month: 'Aug', earnings: 2100 },
        { month: 'Sep', earnings: 2450 },
        { month: 'Oct', earnings: 2890 },
        { month: 'Nov', earnings: 3200 },
        { month: 'Dec', earnings: 3240 },
        { month: 'Jan', earnings: earningsData.thisMonth || 2980 }
      ]);
    } catch (error: any) {
      console.error('Failed to fetch host rating stats:', error);
    }
  };

  const fetchHostStats = async () => {
    try {
      const response = await api.get('/events/my-hosted');
      const events = response.data.data || [];
      const activeEvents = events.filter((event: any) => event.status === 'open').length;
      
      setHostStats({
        totalEvents: events.length,
        activeEvents,
        totalReviews: hostReviews.length,
        averageRating: hostReviews.length > 0 
          ? hostReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / hostReviews.length 
          : 0,
        ratingDistribution: null
      });
    } catch (error: any) {
      console.error('Failed to fetch host stats:', error);
    }
  };

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dashboard/earnings', {
        params: {
          period: selectedPeriod,
          eventId: selectedEvent === 'all' ? undefined : selectedEvent
        }
      });
      
      console.log('Earnings API Response:', response);
      
      const data = response.data.data;
      setEarningsData(data.earnings);
      setRecentTransactions(data.transactions);
    } catch (error: any) {
      console.error('Failed to fetch earnings data:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      // Check if we got HTML instead of JSON
      if (error.response?.data && typeof error.response.data === 'string') {
        if (error.response.data.includes('<!DOCTYPE')) {
          toast.error('Server returned HTML instead of JSON. Check API endpoint.');
        } else {
          toast.error(error.response.data);
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to load earnings data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your event revenue and payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Host Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {hostStats.activeEvents} active events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {hostStats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Host Status</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="text-green-600">Pro Host</Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hostStats.ratingDistribution ? (
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const ratingData = hostStats.ratingDistribution[rating.toString()];
                const percentage = parseFloat(ratingData?.percentage || '0');
                const count = ratingData?.count || 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-20 justify-end">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No rating data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hostReviews.length > 0 ? (
            <div className="space-y-4">
              {hostReviews.slice(0, 3).map((review: any) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.userId?.fullName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{review.userId?.fullName || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{review.eventId?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400">Your reviews will appear here once participants leave feedback</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              +12.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.thisMonth)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              +12.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.pendingPayments)}</div>
            <p className="text-xs text-muted-foreground">
              2 transactions pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Event</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.averagePerEvent)}</div>
            <p className="text-xs text-muted-foreground">
              Across {earningsData.totalEvents} events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
        
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Events</option>
          <option value="completed">Completed Only</option>
          <option value="pending">Pending Only</option>
        </select>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          More Filters
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{transaction.eventName}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {transaction.date}
                    </span>
                    <span>{transaction.attendees} attendees</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyEarnings.map((month, index) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-emerald-500 rounded-t-lg transition-all duration-300 hover:bg-emerald-600"
                  style={{ height: `${(month.earnings / 3500) * 100}%` }}
                />
                <span className="text-xs mt-2 text-gray-600">{month.month}</span>
                <span className="text-xs text-gray-500">{formatCurrency(month.earnings)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}