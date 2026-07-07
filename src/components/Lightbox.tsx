"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedUrl } from "@/utils/image";

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % images.length);
    },
    [isOpen, currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown, isOpen]);

  if (!isOpen || images.length === 0) return null;

  const currentSrc = images[currentIndex]?.toLowerCase().split('?')[0].split('#')[0] || "";
  const isVideo =
    currentSrc.endsWith('.mp4') ||
    currentSrc.endsWith('.webm') ||
    currentSrc.endsWith('.m4v') ||
    currentSrc.endsWith('.m4') ||
    currentSrc.endsWith('.m4a') ||
    currentSrc.endsWith('.mov') ||
    currentSrc.endsWith('.avi') ||
    currentSrc.endsWith('.wmv') ||
    currentSrc.endsWith('.flv') ||
    currentSrc.endsWith('.mkv') ||
    currentSrc.includes('/video/upload/') ||
    currentSrc.includes('video');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all z-[101]"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + images.length) % images.length); }}
          className="absolute left-4 md:left-8 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all z-[101]"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Main Image / Video */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center p-4 md:p-12" onClick={onClose}>
        {isVideo ? (
          <video
            src={images[currentIndex]}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm select-none"
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img
            src={getOptimizedUrl(images[currentIndex])}
            alt={`View ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm select-none"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        )}
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % images.length); }}
          className="absolute right-4 md:right-8 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all z-[101]"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Pagination indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); onNavigate(idx); }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? "bg-white scale-125" : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
