'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { BarChart3, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,549</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +15 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,678</div>
            <p className="text-xs text-muted-foreground">
              +25% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: 'Jan', users: 1200, growth: '+12%' },
                { month: 'Feb', users: 1450, growth: '+21%' },
                { month: 'Mar', users: 1680, growth: '+16%' },
                { month: 'Apr', users: 1920, growth: '+14%' },
                { month: 'May', users: 2340, growth: '+22%' },
                { month: 'Jun', users: 2850, growth: '+22%' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-8">{stat.month}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(stat.users / 3000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-right">
                    <span className="text-sm font-medium">{stat.users.toLocaleString()}</span>
                    <Badge variant="secondary" className="text-xs">{stat.growth}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Music Events', revenue: 45678, percentage: 36, color: 'bg-green-600' },
                { category: 'Workshops', revenue: 32145, percentage: 26, color: 'bg-blue-600' },
                { category: 'Food & Dining', revenue: 28934, percentage: 23, color: 'bg-purple-600' },
                { category: 'Sports', revenue: 18921, percentage: 15, color: 'bg-orange-600' },
              ].map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-24">{cat.category}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${cat.color} h-2 rounded-full`} 
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">${cat.revenue.toLocaleString()}</span>
                    <Badge variant="outline" className="text-xs ml-2">{cat.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">98.5%</div>
              <p className="text-sm text-gray-500 mt-1">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1.2s</div>
              <p className="text-sm text-gray-500 mt-1">Avg Load Time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4.8</div>
              <p className="text-sm text-gray-500 mt-1">User Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
