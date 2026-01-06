'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import AdminCard from './AdminCard';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    period: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

interface AdminStatsProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
  loading?: boolean;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
};

export default function AdminStats({ 
  stats, 
  columns = 4, 
  className, 
  loading = false 
}: AdminStatsProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  return (
    <div className={cn(
      'grid gap-4 sm:gap-6',
      gridCols[columns],
      className
    )}>
      {stats.map((stat, index) => (
        <AdminCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          trend={stat.trend}
          badge={stat.badge}
          loading={loading}
          className="transform hover:scale-105 transition-transform duration-200"
        />
      ))}
    </div>
  );
}

// Predefined stat configurations for common use cases
export const useCommonStats = () => {
  const userStats: StatItem[] = [
    {
      title: 'Total Users',
      value: '2,547',
      description: 'Registered users',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 12.5, period: 'from last month' },
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: '1,823',
      description: 'Currently active',
      icon: <CheckCircle className="w-5 h-5" />,
      trend: { value: 8.2, period: 'from last month' },
      color: 'green'
    },
    {
      title: 'New Users',
      value: '342',
      description: 'Joined this month',
      icon: <TrendingUp className="w-5 h-5" />,
      trend: { value: 15.3, period: 'from last month' },
      color: 'purple'
    },
    {
      title: 'Pending Approval',
      value: '28',
      description: 'Awaiting verification',
      icon: <Clock className="w-5 h-5" />,
      badge: { text: 'Urgent', variant: 'destructive' },
      color: 'orange'
    },
  ];

  const eventStats: StatItem[] = [
    {
      title: 'Total Events',
      value: '1,234',
      description: 'All events',
      icon: <Calendar className="w-5 h-5" />,
      trend: { value: 5.7, period: 'from last month' },
      color: 'blue'
    },
    {
      title: 'Active Events',
      value: '456',
      description: 'Currently running',
      icon: <CheckCircle className="w-5 h-5" />,
      trend: { value: -2.3, period: 'from last month' },
      color: 'green'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      description: 'Total revenue',
      icon: <DollarSign className="w-5 h-5" />,
      trend: { value: 18.9, period: 'from last month' },
      color: 'green'
    },
    {
      title: 'Avg. Rating',
      value: '4.6',
      description: 'Out of 5 stars',
      icon: <Star className="w-5 h-5" />,
      trend: { value: 0.2, period: 'from last month' },
      color: 'yellow'
    },
  ];

  const reviewStats: StatItem[] = [
    {
      title: 'Total Reviews',
      value: '3,456',
      description: 'All reviews',
      icon: <MessageSquare className="w-5 h-5" />,
      trend: { value: 8.4, period: 'from last month' },
      color: 'blue'
    },
    {
      title: 'Average Rating',
      value: '4.2',
      description: 'Out of 5 stars',
      icon: <Star className="w-5 h-5" />,
      trend: { value: 0.1, period: 'from last month' },
      color: 'green'
    },
    {
      title: '5-Star Reviews',
      value: '2,134',
      description: 'Excellent reviews',
      icon: <Star className="w-5 h-5" />,
      trend: { value: 12.7, period: 'from last month' },
      color: 'green'
    },
    {
      title: 'Flagged Content',
      value: '23',
      description: 'Needs review',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: { text: 'Action Required', variant: 'destructive' },
      color: 'red'
    },
    {
      title: 'Response Time',
      value: '2.3h',
      description: 'Average response',
      icon: <Clock className="w-5 h-5" />,
      trend: { value: -15.2, period: 'from last month' },
      color: 'purple'
    },
  ];

  const hostStats: StatItem[] = [
    {
      title: 'Total Hosts',
      value: '892',
      description: 'Registered hosts',
      icon: <Shield className="w-5 h-5" />,
      trend: { value: 6.8, period: 'from last month' },
      color: 'blue'
    },
    {
      title: 'Verified Hosts',
      value: '756',
      description: 'Approved hosts',
      icon: <CheckCircle className="w-5 h-5" />,
      trend: { value: 4.2, period: 'from last month' },
      color: 'green'
    },
    {
      title: 'Pending Approval',
      value: '34',
      description: 'Awaiting review',
      icon: <Clock className="w-5 h-5" />,
      badge: { text: 'Review Needed', variant: 'destructive' },
      color: 'orange'
    },
    {
      title: 'Suspended',
      value: '12',
      description: 'Suspended hosts',
      icon: <AlertTriangle className="w-5 h-5" />,
      trend: { value: -8.5, period: 'from last month' },
      color: 'red'
    },
  ];

  return {
    userStats,
    eventStats,
    reviewStats,
    hostStats
  };
};
