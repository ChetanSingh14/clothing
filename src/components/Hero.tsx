"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const PORTRAITS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=600&fit=crop",
];

interface HeroProps {
  user: any;
  onStartClick: () => void;
}

export default function Hero({ user, onStartClick }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Animate hero text translation and opacity based on scroll
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 40]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative flex min-h-[92vh] flex-col items-center justify-between overflow-hidden px-6 pt-16 pb-12 sm:px-8 md:pt-24 md:pb-16"
    >
      {/* Background radial soft light */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-tan/10 via-brand-bg to-brand-bg" />

      {/* Hero Typography & Button */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        className="mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-semibold tracking-tight text-brand-charcoal sm:text-6xl md:text-7xl leading-[1.1]"
        >
          <span className="font-serif italic font-normal text-brand-charcoal/80 block sm:inline sm:mr-3">
            Flowbox Atelier,
          </span>
          <span className="block sm:inline">
            Sartorial Collections
          </span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-2xl text-base text-brand-charcoal/60 sm:text-lg tracking-wide font-light"
        >
          Experience pure virgin wool double-breasted trench coats and cashmere-knit pieces handcrafted with timeless structured designs.
        </motion.p>

        {/* Pill-shaped Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <button 
            onClick={onStartClick}
            className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-brand-charcoal px-6.5 py-4 text-sm font-semibold tracking-wide text-brand-bg transition-all duration-300 hover:bg-brand-charcoal/90 hover:shadow-lg cursor-pointer"
          >
            <span>{user ? "Explore Catalog" : "Explore Collections"}</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-bg text-brand-charcoal transition-transform duration-300 group-hover:rotate-45">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>
        </motion.div>
      </motion.div>

      {/* 3D Perspective Curved Portrait Cards */}
      <div className="perspective-container relative w-full max-w-6xl mt-16 md:mt-24">
        <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 px-4 overflow-x-auto sm:overflow-x-visible pb-8 scrollbar-none">
          {PORTRAITS.map((url, i) => {
            const centerIdx = 3;
            const diff = i - centerIdx;
            
            // Custom transforms linked to scroll progress
            const rotateYVal = useTransform(scrollYProgress, [0, 0.6], [diff * 14, diff * 2]);
            const zVal = useTransform(scrollYProgress, [0, 0.6], [Math.abs(diff) * -45, 0]);
            const yVal = useTransform(scrollYProgress, [0, 0.6], [Math.abs(diff) * 15, 0]);
            const scaleVal = useTransform(scrollYProgress, [0, 0.6], [1 - Math.abs(diff) * 0.05, 1]);

            return (
              <motion.div
                key={i}
                style={{
                  rotateY: rotateYVal,
                  z: zVal,
                  y: yVal,
                  scale: scaleVal,
                  transformStyle: "preserve-3d",
                }}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.2 + i * 0.06,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="perspective-card relative flex-shrink-0 w-24 h-36 sm:w-32 sm:h-48 md:w-36 md:h-56 rounded-2xl overflow-hidden border border-brand-charcoal/10 shadow-md bg-brand-gray"
              >
                <Image
                  src={url}
                  alt={`Team Member ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 120px, 150px"
                  priority={i === centerIdx}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/30 via-transparent to-transparent" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
