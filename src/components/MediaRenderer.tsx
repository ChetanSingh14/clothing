"use client";

import React from "react";
import Image from "next/image";

interface MediaRendererProps {
  src: string;
  alt: string;
  className?: string;
  useNextImage?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export default function MediaRenderer({
  src,
  alt,
  className = "",
  useNextImage = false,
  fill = false,
  width,
  height,
  onClick
}: MediaRendererProps) {
  if (!src) return null;

  const cleanSrc = src.toLowerCase().split('?')[0].split('#')[0];
  const isVideo =
    cleanSrc.endsWith('.mp4') ||
    cleanSrc.endsWith('.webm') ||
    cleanSrc.endsWith('.m4v') ||
    cleanSrc.endsWith('.m4') ||
    cleanSrc.endsWith('.mov') ||
    cleanSrc.includes('/video/upload/');

  if (isVideo) {
    return (
      <video
        src={src}
        className={`object-cover ${className}`}
        autoPlay
        loop
        muted
        playsInline
        onClick={onClick}
      />
    );
  }

  if (useNextImage) {
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        fill={fill}
        width={width}
        height={height}
        onClick={onClick}
        unoptimized
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
}
