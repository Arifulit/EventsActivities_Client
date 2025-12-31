'use client';

import { useState, useEffect } from 'react';

// Responsive utilities and breakpoints

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  
  // Max-width queries
  'max-sm': `(max-width: ${breakpoints.sm})`,
  'max-md': `(max-width: ${breakpoints.md})`,
  'max-lg': `(max-width: ${breakpoints.lg})`,
  'max-xl': `(max-width: ${breakpoints.xl})`,
  'max-2xl': `(max-width: ${breakpoints['2xl']})`
} as const;

// Responsive spacing utilities
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem'
} as const;

// Responsive font sizes
export const fontSizes = {
  xs: ['0.75rem', '1rem'],
  sm: ['0.875rem', '1.125rem'],
  base: ['1rem', '1.5rem'],
  lg: ['1.125rem', '1.75rem'],
  xl: ['1.25rem', '1.75rem'],
  '2xl': ['1.5rem', '2rem'],
  '3xl': ['1.875rem', '2.25rem'],
  '4xl': ['2.25rem', '2.5rem'],
  '5xl': ['3rem', '1'],
  '6xl': ['3.75rem', '1'],
  '7xl': ['4.5rem', '1'],
  '8xl': ['6rem', '1'],
  '9xl': ['8rem', '1']
} as const;

// Responsive container max widths
export const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '7xl': '1280px',
  full: '100%'
} as const;

// Grid system utilities
export const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12'
} as const;

// Helper function to generate responsive classes
export const responsive = (classes: Record<string, string>) => {
  return Object.entries(classes)
    .map(([breakpoint, className]) => {
      if (breakpoint === 'base') return className;
      return `${breakpoint}:${className}`;
    })
    .join(' ');
};

// Hook for detecting screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else if (width < 1280) setScreenSize('xl');
      else setScreenSize('2xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Device detection utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

export const isLargeDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1280;
};
