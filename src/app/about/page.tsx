"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProductStore } from "@/store/useProductStore";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Recycle, ShieldCheck, Flame, Users, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface TimelineEvent {
  year: string;
  title: string;
  desc: string;
  tagline: string;
  image: string;
}

const timelineData: TimelineEvent[] = [
  {
    year: "2020",
    title: "VIBE BEGUN",
    tagline: "Unfinished designs & raw aesthetics.",
    desc: "A small collective of Gen-Z designers and knitters united under a single mission: to completely disrupt fast-fashion trash. We set up in a tiny warehouse, creating raw street graphics printed on organic cotton fabrics, focused on subcultural artistic ideas.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  },
  {
    year: "2021",
    title: "SKILLED HANDS",
    tagline: "Reviving handloom manufacturing.",
    desc: "We collaborated with regional artisans in the UK, establishing hand-guided looms to produce heavyweight, textured knitwear that machines simply cannot replicate. Fair wages, slower pacing, and unmatched material weight became our signature standard.",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop",
  },
  {
    year: "2022",
    title: "RESPONSIBLE SOURCING",
    tagline: "100% natural, organic, & recycled.",
    desc: "We fully banned synthetic polymers and polyester microplastics from our yarns. Shifting entirely to GOTS-certified organic cotton, raw linen, and certified recycled merino wool, we laid the foundation for zero-waste production.",
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=800&auto=format&fit=crop",
  },
  {
    year: "2023",
    title: "CIRCULARITY LOOP",
    tagline: "Wear, return, and repulp.",
    desc: "Launched our circular fashion loop. When our customers wear out their garments, they ship them back to us. We break down the fibers to spin brand new, high-grade yarns, closing the loop completely and eliminating waste landfill cycles.",
    image: "https://images.unsplash.com/photo-1532882772639-e4900c976686?q=80&w=800&auto=format&fit=crop",
  },
  {
    year: "2024",
    title: "DIGITAL MEETS PHYSICAL",
    tagline: "Building cultural tech nodes.",
    desc: "We launched interactive 3D model previews and custom decal rendering on our digital storefront. Connecting the virtual Gen-Z avatar identity with offline, durable streetwear. Real-world tailoring meets digital culture.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop",
  },
];

export default function AboutPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTimelineYear, setActiveTimelineYear] = useState("2020");
  const { fetchMe } = useAuthStore();
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    fetchMe();
  }, []);

  const activeTimeline = timelineData.find((t) => t.year === activeTimelineYear) || timelineData[0];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green selection:text-brand-bg">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-grow space-y-24 md:space-y-36 pb-24">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 md:pt-24 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-full px-4.5 py-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/70">Our Cultural Statement</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-8xl font-serif tracking-tight text-brand-charcoal leading-none"
          >
            CULTURE. CRAFT. <br />
            <span className="text-brand-green">CODE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm sm:text-base text-brand-charcoal/70 tracking-wide font-light leading-relaxed"
          >
            MDFK is a subculture design studio bridging physical garment artistry with Gen-Z digital lifestyles. We build sustainable clothing made to be worn, loved, and eventually reborn.
          </motion.p>
        </section>

        {/* VALUE STATEMENT CARD (BENTO INTRO) */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-brand-charcoal border border-brand-charcoal/10 text-brand-bg shadow-xl">
            {/* Background Graphic overlay */}
            <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1575455872124-74d53c118a30?q=80&w=1200&auto=format&fit=crop')` }} />
            
            <div className="relative p-8 sm:p-12 md:p-16 space-y-12">
              <div className="space-y-4 max-w-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-bg/50">Human Artistry</span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif tracking-tight leading-tight">
                  CRAFTED BY REAL PEOPLE - <br className="hidden sm:inline" />
                  <span className="text-brand-tan">NOT JUST MACHINES</span>
                </h2>
                <p className="text-xs sm:text-sm text-brand-bg/70 tracking-wide leading-relaxed font-light">
                  We are proud of the hands behind every stitch. Meet our creative community and see how each premium piece comes to life.
                </p>
              </div>

              {/* Bento Inner Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-brand-bg/15">
                {[
                  {
                    title: "DESIGN WITH PASSION",
                    desc: "Our knitwear is designed to reflect subculture. Every stitch is hand-drawn and tested, blending aesthetic graphics with tailored fits.",
                    icon: Flame,
                  },
                  {
                    title: "CRAFTED BY SKILLED HANDS",
                    desc: "Made by local artisans using traditional, low-impact methods. Hand-guided looms ensure that no two items are identically manufactured.",
                    icon: Users,
                  },
                  {
                    title: "SUSTAINABLE TO FINISH",
                    desc: "Consciously sourced from start to finish. We utilize recycled materials and organic wool to minimize footprint and promote circularity.",
                    icon: Recycle,
                  },
                ].map((item, i) => (
                  <div key={item.title} className="space-y-3 bg-brand-bg/5 backdrop-blur-md border border-brand-bg/10 rounded-2xl p-5 hover:bg-brand-bg/10 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-widest text-brand-tan">{item.title}</span>
                      <item.icon className="w-4 h-4 text-brand-tan" />
                    </div>
                    <p className="text-[11px] text-brand-bg/60 tracking-wide leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DYNAMIC TIMELINE SECTION (BROWN COLOR BLOCK) */}
        <section className="bg-brand-brown py-20 md:py-28 text-brand-bg overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-bg/10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-tan">Evolutionary Lineage</span>
                <h2 className="text-3xl sm:text-5xl font-serif tracking-tight">IT STARTS WITH THE SOURCE</h2>
              </div>
              <p className="max-w-md text-xs sm:text-sm text-brand-bg/65 tracking-wide leading-relaxed font-light">
                We choose yarns from trusted farms and mills that follow ethical, animal-safe, and circular practices. Follow our timeline.
              </p>
            </div>

            {/* Timeline UI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Year Selectors */}
              <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                {timelineData.map((t) => {
                  const isActive = t.year === activeTimelineYear;
                  return (
                    <button
                      key={t.year}
                      onClick={() => setActiveTimelineYear(t.year)}
                      className={`flex-shrink-0 flex items-center justify-between text-left px-5 py-4.5 rounded-2xl border transition-all duration-300 cursor-pointer lg:w-full ${
                        isActive
                          ? "bg-brand-bg text-brand-brown border-brand-bg shadow-lg scale-102"
                          : "border-brand-bg/10 text-brand-bg/60 hover:text-brand-bg hover:border-brand-bg/30 hover:bg-brand-bg/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-4 h-4 ${isActive ? "text-brand-green" : "text-brand-bg/40"}`} />
                        <span className="text-xs font-bold tracking-widest uppercase">{t.title}</span>
                      </div>
                      <span className="text-sm font-serif font-black tracking-tight">{t.year}</span>
                    </button>
                  );
                })}
              </div>

              {/* Year Display Content (with AnimatePresence) */}
              <div className="lg:col-span-8 bg-brand-bg/5 backdrop-blur-md border border-brand-bg/10 rounded-3xl p-8 sm:p-10 min-h-[400px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTimelineYear}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                  >
                    {/* Visual representation */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-brand-bg/10">
                      <img src={activeTimeline.image} alt={activeTimeline.title} className="object-cover w-full h-full" />
                    </div>

                    {/* Text information */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-tan px-2.5 py-1 bg-brand-bg/5 rounded-full border border-brand-bg/10">
                        {activeTimeline.tagline}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-serif tracking-tight text-brand-bg mt-2">
                        {activeTimeline.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-bg/70 tracking-wide leading-relaxed font-light">
                        {activeTimeline.desc}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Footer status indicating active year */}
                <div className="flex justify-between items-center pt-8 border-t border-brand-bg/10 text-[10px] uppercase font-bold tracking-widest text-brand-bg/40 mt-8">
                  <span>MDFK archive registry</span>
                  <span>Active year: {activeTimelineYear}</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* WHY YOU CAN TRUST US GRID */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Our Core Foundation</span>
            <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-brand-charcoal">WHY YOU CAN TRUST US</h2>
            <p className="max-w-md mx-auto text-xs sm:text-sm text-brand-charcoal/60 tracking-wide font-light">
              Limited-run clothing you won't find anywhere else. Designed for durability, built with pure ethics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Crafted with Care",
                desc: "Every print and garment is hand-inspected. We work with local artisan networks using traditional manufacturing methods.",
                icon: ShieldCheck,
              },
              {
                title: "Sustainably Made",
                desc: "We exclusively produce small batches to prevent bulk unsold stock and eliminate unnecessary warehouse waste.",
                icon: Recycle,
              },
              {
                title: "Made in the UK",
                desc: "Design prototypes, loom setups, and printing happens locally to support local crafts and reduce shipping footprint.",
                icon: Sparkles,
              },
              {
                title: "Ethical Materials",
                desc: "We only use organic cotton, GOTS-certified dyes, and organic materials to keep microplastics completely out of the loop.",
                icon: Heart,
              },
              {
                title: "Loved by Community",
                desc: "Driven by subcultures, artists, and creators. We don't build standard items; we create wearable culture.",
                icon: Users,
              },
              {
                title: "Easy Returns",
                desc: "No stress. If your garment doesn't feel and fit exactly how you want it, return it easily within 30 days.",
                icon: Sparkles,
              },
            ].map((card, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                key={card.title}
                className="bg-brand-gray/30 border border-brand-charcoal/5 rounded-3xl p-6 hover:shadow-md hover:border-brand-charcoal/15 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal">{card.title}</h3>
                    <div className="p-2 bg-brand-bg rounded-xl border border-brand-charcoal/5">
                      <card.icon className="w-4 h-4 text-brand-green" />
                    </div>
                  </div>
                  <p className="text-xs text-brand-charcoal/65 tracking-wide leading-relaxed font-light">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA TO COLLECTION */}
        <section className="max-w-5xl mx-auto px-6 sm:px-8 text-center bg-brand-gray/45 border border-brand-charcoal/5 rounded-3xl p-10 md:p-16 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-serif tracking-tight text-brand-charcoal">
            Ready to find your favorite knitwear?
          </h2>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-brand-charcoal/60 tracking-wide font-light">
            Browse our small batch, GOTS-certified custom printed t-shirts and handloom knitwear.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-charcoal text-brand-bg text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-full hover:bg-brand-charcoal/90 hover:scale-102 transition-all shadow-md group cursor-pointer"
          >
            <span>Explore Collection</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </section>

      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
        }}
      />
      <CartDrawer />
    </div>
  );
}
