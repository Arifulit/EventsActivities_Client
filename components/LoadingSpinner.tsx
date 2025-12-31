'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mx-auto ${text ? 'mb-3' : ''}`} />
        {text && (
          <p className="text-sm font-medium text-gray-700">{text}</p>
        )}
      </div>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingSkeleton({ className = '', children }: LoadingSkeletonProps) {
  return (
    <div className={`loading-skeleton rounded-lg ${className}`}>
      {children}
    </div>
  );
}

interface LoadingCardProps {
  count?: number;
  className?: string;
}

export function LoadingCard({ count = 1, className = '' }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`glass p-6 rounded-xl shadow-card border border-gray-100 ${className}`}>
          <div className="space-y-4">
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-8 w-1/2" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </>
  );
}

interface FullPageLoadingProps {
  text?: string;
  subtext?: string;
}

export function FullPageLoading({ text = 'Loading...', subtext }: FullPageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-900 mb-2">{text}</div>
        {subtext && (
          <div className="text-sm text-gray-500">{subtext}</div>
        )}
      </div>
    </div>
  );
}

export default LoadingSpinner;
