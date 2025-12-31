'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  padding = 'md',
  maxWidth = '7xl'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-4 sm:px-6 py-6',
    lg: 'px-4 sm:px-6 lg:px-8 py-8',
    xl: 'px-4 sm:px-6 lg:px-8 xl:px-12 py-12'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      paddingClasses[padding],
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
