"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Award, Heart, ArrowUpRight } from "lucide-react";

export default function Testimonials() {
  return (
    <section className="py-24 bg-brand-bg px-6 sm:px-8 border-t border-brand-charcoal/5">
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
            Crafting Client Satisfaction
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-4 text-base text-brand-charcoal/60 sm:text-lg tracking-wide font-light"
          >
            Discover what clients around the world are saying about our tailored cuts, fabric weights, and structured silhouettes.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Customer Testimonial */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-brand-gray p-8 flex flex-col justify-between shadow-sm border border-brand-charcoal/5"
          >
            <div className="space-y-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-brand-tan text-brand-tan" />
                ))}
              </div>
              <p className="text-base text-brand-charcoal/80 tracking-wide font-light italic leading-relaxed">
                "The double-breasted coat is a sartorial masterpiece. The wool drape is structured but soft, the shoulder padding is precise, and it arrived in elegant protective packaging."
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-4 border-t border-brand-charcoal/5 pt-6">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-brand-charcoal/10">
                <Image 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&fit=crop"
                  alt="Sarah Jenkins"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide text-brand-charcoal">Sarah Jenkins</h4>
                <p className="text-xs text-brand-charcoal/50 font-light">Creative Director, Loom Studio</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Fabric Standards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-brand-tan/10 p-8 flex flex-col justify-between shadow-sm border border-brand-tan/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Award className="h-32 w-32 text-brand-tan" />
            </div>
            
            <div className="space-y-4 z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-tan/20 border border-brand-tan/30">
                <Award className="h-5 w-5 text-brand-tan-dark" />
              </div>
              <h3 className="text-5xl font-bold tracking-tight text-brand-charcoal font-serif">
                100%
              </h3>
              <h4 className="text-lg font-semibold tracking-tight text-brand-charcoal">
                Traceable Cashmere & Wool
              </h4>
              <p className="text-sm text-brand-charcoal/60 tracking-wide font-light leading-relaxed">
                Every coat and sweater is crafted using certified raw fibers sourced from heritage Italian mills with transparent supply chains.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-charcoal/5 z-10">
              <div className="flex justify-between items-center text-xs tracking-wide text-brand-charcoal/50">
                <span>Certified Mill Standards</span>
                <span className="font-semibold text-brand-tan-dark flex items-center gap-0.5 cursor-pointer">
                  our mills <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Curators Trust */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-brand-charcoal p-8 flex flex-col justify-between shadow-sm border border-brand-charcoal/10 text-brand-bg relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg/10 border border-brand-bg/15">
                <Heart className="h-5 w-5 text-brand-bg" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight font-serif text-brand-bg">
                Wardrobe Curators
              </h3>
              <p className="text-sm text-brand-bg/70 tracking-wide font-light leading-relaxed">
                From luxury fashion stylists to minimalist outerwear collectors, designers trust our pieces to stand the test of time.
              </p>
            </div>

            {/* Avatars */}
            <div className="mt-8 space-y-3 bg-brand-bg/10 p-4.5 rounded-2xl border border-brand-bg/15">
              <div className="flex justify-between items-center text-[9px] tracking-widest font-semibold text-brand-bg/50 uppercase">
                <span>capsule community</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              
              <div className="flex -space-x-2.5 overflow-hidden">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&h=80&fit=crop",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&h=80&fit=crop",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&h=80&fit=crop",
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&h=80&fit=crop",
                ].map((avatar, idx) => (
                  <div key={idx} className="relative h-7 w-7 rounded-full overflow-hidden border-2 border-brand-charcoal">
                    <Image 
                      src={avatar}
                      alt="User Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-tan text-[9px] font-bold text-brand-charcoal border-2 border-brand-charcoal">
                  +48
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
