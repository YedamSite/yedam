'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

/**
 * SafeImage: renders Next.js <Image> for valid remote/local URLs,
 * and falls back to a native <img> tag for data: URLs (base64) or
 * when the bucket isn't set up yet. This prevents page crashes.
 */
export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  fallbackSrc,
}: SafeImageProps) {
  const [error, setError] = useState(false);

  // Use native img for data: URLs (base64 from fallback upload)
  // Next.js <Image> does not support data: URLs and will crash.
  const isDataUrl = src?.startsWith('data:');
  const effectiveSrc = (error || !src) ? (fallbackSrc || '') : src;

  if (isDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={effectiveSrc}
        alt={alt}
        className={`${fill ? 'absolute inset-0 w-full h-full' : ''} ${className || ''}`}
        style={fill ? { objectFit: 'cover' } : {}}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  if (!effectiveSrc) return null;

  if (fill) {
    return (
      <NextImage
        src={effectiveSrc}
        alt={alt}
        fill
        sizes={sizes || '100vw'}
        className={className}
        priority={priority}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <NextImage
      src={effectiveSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
