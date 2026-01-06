'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AdminCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    period: string;
  };
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  loading?: boolean;
}

export default function AdminCard({
  title,
  value,
  description,
  icon,
  trend,
  badge,
  action,
  className,
  loading = false
}: AdminCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (trend.value < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    
    if (trend.value > 0) return 'text-green-600';
    if (trend.value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0 shadow-md',
      'bg-white',
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 pointer-events-none" />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            {title}
            {badge && (
              <Badge variant={badge.variant} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs text-gray-500">
              {description}
            </CardDescription>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Icon */}
          <div className={cn(
            'p-2.5 rounded-xl transition-all duration-300',
            'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
          )}>
            {icon}
          </div>
          
          {/* Action Menu */}
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {/* Value */}
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {loading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></div>
                </div>
              ) : (
                value
              )}
            </div>
            
            {/* Trend */}
            {trend && (
              <div className="flex items-center space-x-2">
                {getTrendIcon()}
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {Math.abs(trend.value)}% {trend.period}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {action && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="w-full"
            >
              {action.label}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
