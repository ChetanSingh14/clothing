"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, MessageSquare, Calendar, BarChart3, Sparkles } from "lucide-react";

export default function BentoGrid() {
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
            className="text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl"
          >
            Everything Your Team Needs to Work Smarter
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-4 text-base text-brand-charcoal/60 sm:text-lg tracking-wide font-light"
          >
            From task tracking to real-time chat, our features are built to keep your team connected, organized, and moving forward together.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Card 1: Wide Card - Built-In Team Chat (Col Span 3) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -6 }}
            className="group relative md:col-span-3 h-[380px] rounded-3xl overflow-hidden shadow-sm border border-brand-charcoal/5 cursor-pointer"
          >
            <Image 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
              alt="Built-in Team Chat"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-103"
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/85 via-brand-charcoal/30 to-brand-charcoal/10" />
            
            {/* Overlay Text */}
            <div className="absolute bottom-0 left-0 p-8 text-brand-bg flex flex-col justify-end h-full max-w-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg/10 backdrop-blur-md mb-4 border border-brand-bg/25">
                <MessageSquare className="h-5 w-5 text-brand-bg" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-brand-bg font-serif">
                Built-In Team Chat
              </h3>
              <p className="mt-2 text-sm text-brand-bg/75 tracking-wide font-light leading-relaxed">
                Communicate instantly, share feedback in threads, and keep everyone aligned on current tasks in real time without jumping between tools.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Square Card - Task Assignment (Col Span 2) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="md:col-span-2 h-[380px] rounded-3xl bg-brand-gray p-8 flex flex-col justify-between shadow-sm border border-brand-charcoal/5 relative overflow-hidden group cursor-pointer"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-charcoal/5 mb-6 border border-brand-charcoal/5">
                <CheckCircle2 className="h-5 w-5 text-brand-charcoal" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-brand-charcoal font-serif">
                Task Assignment
              </h3>
              <p className="mt-2 text-sm text-brand-charcoal/60 tracking-wide font-light leading-relaxed">
                Easily create, assign, and track tasks to keep everyone aligned and accountable.
              </p>
            </div>

            {/* Simulated task list widget */}
            <div className="mt-4 space-y-2.5 bg-brand-bg/60 p-4.5 rounded-2xl border border-brand-charcoal/5 shadow-inner">
              {[
                { label: "Update design tokens", checked: true },
                { label: "Refactor animation layers", checked: false },
                { label: "Finalize client pitch deck", checked: false },
              ].map((task, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all duration-300 ${task.checked ? 'bg-brand-green border-brand-green text-brand-bg' : 'border-brand-charcoal/20 bg-transparent'}`}>
                    {task.checked && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={`text-xs tracking-wide ${task.checked ? 'line-through text-brand-charcoal/40 font-light' : 'text-brand-charcoal font-medium'}`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Vertical Card - Real-Time Scheduling (Col Span 2) */}
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
                Real-Time Scheduling
              </h3>
              <p className="mt-2 text-sm text-brand-bg/80 tracking-wide font-light leading-relaxed">
                Plan meetings, set deadlines, and sync team calendars to keep everyone on the same page.
              </p>
            </div>

            {/* Calendar list widget */}
            <div className="mt-6 space-y-2.5 bg-brand-bg/10 p-4.5 rounded-2xl border border-brand-bg/15">
              <div className="flex justify-between items-center text-[10px] tracking-wider font-light text-brand-bg/70 border-b border-brand-bg/10 pb-2 uppercase">
                <span>June 2026</span>
                <span className="font-semibold text-brand-bg">today</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <div className="h-8 w-8 rounded-lg bg-brand-bg/15 flex flex-col justify-center items-center font-serif">
                  <span className="text-[10px] text-brand-bg/70 leading-none">Tue</span>
                  <span className="text-xs font-bold text-brand-bg leading-tight">30</span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold">Weekly Sync & Brainstorm</h4>
                  <p className="text-[10px] text-brand-bg/70">10:00 AM — 11:30 AM</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Wide Card - Progress Tracking (Col Span 3) */}
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
                  <BarChart3 className="h-5 w-5 text-brand-bg" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight font-serif">
                  Progress Tracking
                </h3>
                <p className="mt-2 text-sm text-brand-bg/85 tracking-wide font-light leading-relaxed max-w-sm">
                  Visualize your team's performance with interactive dashboards that highlight what's done and what needs attention next.
                </p>
              </div>

              {/* Status Pill Badge */}
              <div className="mt-8 flex items-center gap-2 bg-brand-bg/10 self-start px-3.5 py-1.5 rounded-full border border-brand-bg/15">
                <Sparkles className="h-4 w-4 text-brand-bg animate-pulse" />
                <span className="text-[11px] font-semibold tracking-wide lowercase">live project view</span>
              </div>
            </div>

            {/* Right Column: High Quality Cutout Image */}
            <div className="relative w-full md:w-[260px] h-[240px] md:h-full mt-6 md:mt-0 self-end flex justify-end">
              <div className="relative w-full h-[260px] md:absolute md:bottom-[-32px] md:right-[-16px] md:w-[280px] md:h-[360px] transition-transform duration-500 group-hover:scale-102">
                <Image 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop"
                  alt="Team Member"
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
