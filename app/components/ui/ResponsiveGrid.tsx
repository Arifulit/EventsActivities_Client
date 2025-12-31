'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2;
    tablet?: 1 | 2 | 3;
    desktop?: 1 | 2 | 3 | 4;
    large?: 1 | 2 | 3 | 4 | 5;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    large?: string;
  };
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = { mobile: '4', tablet: '6', desktop: '6', large: '8' }
}) => {
  const gridColsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5'
  };

  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.mobile}`,
    cols.tablet && `md:${gridColsClasses[cols.tablet]}`,
    cols.desktop && `lg:${gridColsClasses[cols.desktop]}`,
    cols.large && `xl:${gridColsClasses[cols.large]}`,
    `gap-${gap.mobile}`,
    gap.tablet && `md:gap-${gap.tablet}`,
    gap.desktop && `lg:gap-${gap.desktop}`,
    gap.large && `xl:gap-${gap.large}`,
    className
  );

  return <div className={gridClasses}>{children}</div>;
};

export default ResponsiveGrid;
