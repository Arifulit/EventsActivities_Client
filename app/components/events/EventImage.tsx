'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface EventImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  height?: number;
  width?: number;
}

export default function EventImage({ 
  src, 
  alt, 
  className = '', 
  fill = false,
  height,
  width
}: EventImageProps) {
  const [imageError, setImageError] = useState(false);

  // Check if image URL is valid
  const isValidImageUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    try {
      const trimmedUrl = url.trim();
      // Skip placeholder URLs
      if (trimmedUrl.includes('placeholder.com') || trimmedUrl.includes('placehold.co')) {
        return false;
      }
      // Check for common image CDN patterns or local URLs
      const validPatterns = [
        /^https?:\/\//, // http or https
        /^\//, // relative paths
        /^data:image/, // data URLs
      ];
      return validPatterns.some(pattern => pattern.test(trimmedUrl));
    } catch {
      return false;
    }
  };

  const validSrc = isValidImageUrl(src) && !imageError ? src : null;

  if (!validSrc) {
    // Fallback gradient background
    return (
      <div 
        className={`bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center ${className}`}
      >
        <Sparkles className="w-12 h-12 text-white opacity-50" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={validSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={className}
        quality={80}
        priority={false}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <Image
      src={validSrc}
      alt={alt}
      height={height || 192}
      width={width || 384}
      className={className}
      quality={80}
      priority={false}
      onError={() => setImageError(true)}
    />
  );
}
