'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function HostEarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState('all');

  // Mock data
  const earningsData = {
    totalEarnings: 12540.50,
    thisMonth: 3240.00,
    lastMonth: 2890.00,
    pendingPayments: 890.00,
    totalEvents: 24,
    averagePerEvent: 522.52
  };

  const recentTransactions = [
    {
      id: 1,
      eventName: 'Summer Music Festival',
      amount: 1250.00,
      date: '2024-01-15',
      status: 'completed',
      attendees: 45
    },
    {
      id: 2,
      eventName: 'Tech Workshop 2024',
      amount: 890.00,
      date: '2024-01-12',
      status: 'pending',
      attendees: 20
    },
    {
      id: 3,
      eventName: 'Food & Wine Tasting',
      amount: 1100.00,
      date: '2024-01-10',
      status: 'completed',
      attendees: 30
    },
    {
      id: 4,
      eventName: 'Photography Masterclass',
      amount: 750.00,
      date: '2024-01-08',
      status: 'completed',
      attendees: 15
    }
  ];

  const monthlyEarnings = [
    { month: 'Aug', earnings: 2100 },
    { month: 'Sep', earnings: 2450 },
    { month: 'Oct', earnings: 2890 },
    { month: 'Nov', earnings: 3200 },
    { month: 'Dec', earnings: 3240 },
    { month: 'Jan', earnings: 2980 }
  ];

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