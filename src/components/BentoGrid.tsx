"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Zap, Sparkles, Calendar, Heart, Palette } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { shallow } from "zustand/shallow";

export default function BentoGrid() {
  const companyName = useSettingsStore((state) => state.companyName);

  return (
    <section id="product" className="py-24 bg-brand-bg px-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl font-serif"
          >
            Prints That Hit Different
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-4 text-base text-brand-charcoal/60 sm:text-lg tracking-wide font-light"
          >
            Every tee from {companyName} is a statement. Bold graphics, heavyweight cotton, drop-ready drops designed for Gen Z who refuse to blend in.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Card 1: Wide Card - Main Visual (Col Span 3) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -6 }}
            className="group relative md:col-span-3 h-[380px] rounded-3xl overflow-hidden shadow-sm border border-brand-charcoal/5 cursor-pointer"
          >
            <Image 
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop"
              alt="Gen Z streetwear graphic tees"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-103"
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/85 via-brand-charcoal/30 to-brand-charcoal/10" />
            
            {/* Overlay Text */}
            <div className="absolute bottom-0 left-0 p-8 text-brand-bg flex flex-col justify-end h-full max-w-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg/10 backdrop-blur-md mb-4 border border-brand-bg/25">
                <Zap className="h-5 w-5 text-brand-bg" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-brand-bg font-serif">
                Graphic Drops, Raw Energy
              </h3>
              <p className="mt-2 text-sm text-brand-bg/75 tracking-wide font-light leading-relaxed">
                Our tees are printed on 280GSM heavyweight cotton — thick, structured, and built to outlast every trend cycle.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Square Card - Limited Drops (Col Span 2) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="md:col-span-2 h-[380px] rounded-3xl bg-brand-brown p-8 flex flex-col justify-between shadow-sm border border-brand-charcoal/5 relative overflow-hidden group cursor-pointer text-brand-bg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg/15 mb-6 border border-brand-bg/25">
                <Palette className="h-5 w-5 text-brand-bg" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight font-serif text-brand-bg">
                Every Print Is Original
              </h3>
              <p className="mt-2 text-sm text-brand-bg/80 tracking-wide font-light leading-relaxed">
                No repeat prints. Every design drops once and never again — own your moment before it's gone.
              </p>
            </div>

            {/* Feature checklist */}
            <div className="mt-4 space-y-2.5 bg-brand-bg/10 p-4.5 rounded-2xl border border-brand-bg/15 shadow-inner">
              {[
                { label: "280GSM heavyweight cotton", checked: true },
                { label: "Screen-printed, not heat-pressed", checked: true },
                { label: "Washed & pre-shrunk", checked: false },
              ].map((task, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all duration-300 ${task.checked ? 'bg-brand-green border-brand-green text-brand-bg' : 'border-brand-bg/25 bg-transparent'}`}>
                    {task.checked && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={`text-xs tracking-wide ${task.checked ? 'line-through text-brand-bg/40 font-light' : 'text-brand-bg/90 font-medium'}`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Vertical Card - Drop Calendar (Col Span 2) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -6 }}
            className="md:col-span-2 min-h-[380px] rounded-3xl bg-brand-tan p-8 flex flex-col justify-between shadow-sm border border-brand-charcoal/5 relative overflow-hidden group cursor-pointer text-brand-bg"
          >
            {/* Background texture or gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-tan-dark/10 to-transparent pointer-events-none" />

            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg/10 backdrop-blur-md mb-6 border border-brand-bg/25">
                <Calendar className="h-5 w-5 text-brand-bg" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight font-serif">
                Seasonal Drops
              </h3>
              <p className="mt-2 text-sm text-brand-bg/80 tracking-wide font-light leading-relaxed">
                Exclusive capsule tee collections, streetwear sets, and limited edition prints dropping every season.
              </p>
            </div>

            {/* Calendar widget */}
            <div className="mt-6 space-y-2.5 bg-brand-bg/10 p-4.5 rounded-2xl border border-brand-bg/15">
              <div className="flex justify-between items-center text-[10px] tracking-wider font-light text-brand-bg/70 border-b border-brand-bg/10 pb-2 uppercase">
                <span>September 2026</span>
                <span className="font-semibold text-brand-bg">next drop</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <div className="h-8 w-8 rounded-lg bg-brand-bg/15 flex flex-col justify-center items-center font-serif">
                  <span className="text-[10px] text-brand-bg/70 leading-none">Fri</span>
                  <span className="text-xs font-bold text-brand-bg leading-tight">12</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold">Vol. 07 — Chaos Theory Tees</h4>
                  <p className="text-[10px] text-brand-bg/70">12:00 PM IST — Online Exclusive</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Wide Card - Brand Values (Col Span 3) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="md:col-span-3 min-h-[380px] rounded-3xl bg-brand-green p-8 flex flex-col md:flex-row justify-between shadow-sm border border-brand-charcoal/5 relative overflow-hidden group cursor-pointer text-brand-bg"
          >
            {/* Left Column: Text */}
            <div className="flex-1 flex flex-col justify-between z-10">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg/10 backdrop-blur-md mb-6 border border-brand-bg/25">
                  <Heart className="h-5 w-5 text-brand-bg" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight font-serif">
                  Made for the Culture
                </h3>
                <p className="mt-2 text-sm text-brand-bg/85 tracking-wide font-light leading-relaxed max-w-sm">
                  {companyName} exists for the ones who walk into a room and own it. Designed in India, worn worldwide — no gatekeeping.
                </p>
              </div>

              {/* Status Pill Badge */}
              <div className="mt-8 flex items-center gap-2 bg-brand-bg/10 self-start px-3.5 py-1.5 rounded-full border border-brand-bg/15">
                <Sparkles className="h-4 w-4 text-brand-bg" />
                <span className="text-[11px] font-semibold tracking-wide lowercase">100% original art — no AI prints</span>
              </div>
            </div>

            {/* Right Column: Cutout Image */}
            <div className="relative w-full md:w-[260px] h-[240px] md:h-full mt-6 md:mt-0 self-end flex justify-end">
              <div className="relative w-full h-[260px] md:absolute md:bottom-[-32px] md:right-[-16px] md:w-[280px] md:h-[360px] transition-transform duration-500 group-hover:scale-102">
                <Image 
                  src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=500&auto=format&fit=crop"
                  alt="Gen Z wearing printed streetwear tee"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
