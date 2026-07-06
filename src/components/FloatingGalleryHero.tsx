"use client"

import { useEffect, useRef, useState } from "react"
import { motion, stagger, useAnimate } from "framer-motion"
import { useSettingsStore } from "@/store/useSettingsStore"
import { ArrowRight } from "lucide-react"
import { apiFetch } from "@/utils/api"

import Floating, {
  FloatingElement,
} from "@/components/ui/parallax-floating"

const exampleImages = [
  { url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop" }, // shirts
  { url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop" }, // tee print
  { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop" }, // hoodie
  { url: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=800&auto=format&fit=crop" }, // model
  { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" }, // streetwear female
  { url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop" }, // streetwear male
  { url: "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?q=80&w=800&auto=format&fit=crop" }, // fashion
  { url: "https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?q=80&w=800&auto=format&fit=crop" }, // outfit
]

interface FloatingGalleryHeroProps {
  onStartClick?: () => void;
}

export default function FloatingGalleryHero({ onStartClick }: FloatingGalleryHeroProps) {
  const [scope, animate] = useAnimate()
  const companyName = useSettingsStore((state) => state.companyName);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await apiFetch("/gallery");
        if (res.success && res.data) {
          setGalleryImages(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    animate("img", { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.15) })
  }, [galleryImages, animate])

  const getImageUrl = (index: number) => {
    if (galleryImages[index] && galleryImages[index].url) {
      return galleryImages[index].url;
    }
    return exampleImages[index]?.url || exampleImages[0].url;
  };

  return (
    <div
      className="relative flex w-full h-full min-h-[92vh] justify-center items-center bg-brand-bg overflow-hidden"
      ref={scope}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-tan/10 via-brand-bg to-brand-bg" />

      <motion.div
        className="z-50 text-center space-y-4 items-center flex flex-col px-4 pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.88, delay: 0.5 }}
      >
        <p className="text-sm font-semibold tracking-widest text-brand-charcoal/60 uppercase">
          Welcome back
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-8xl z-50 text-brand-charcoal font-serif font-bold tracking-tight">
          {companyName || "MDFK CLOTHING"}
        </h1>
        <p className="text-brand-charcoal/80 max-w-lg mt-4 text-sm md:text-base font-light">
          Your exclusive access to the latest drops, premium heavyweight cottons, and original prints. 
        </p>
        
        <button 
            onClick={() => {
              const el = document.getElementById("catalog");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              if (onStartClick) onStartClick();
            }}
            className="pointer-events-auto mt-8 group relative flex items-center gap-3 overflow-hidden rounded-full bg-brand-charcoal px-6.5 py-4 text-sm font-semibold tracking-wide text-brand-bg transition-all duration-300 hover:bg-brand-charcoal/90 hover:shadow-lg cursor-pointer"
          >
            <span>Explore Latest Drops</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-bg text-brand-charcoal transition-transform duration-300 group-hover:rotate-45">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
        </button>
      </motion.div>

      <Floating sensitivity={-1} className="overflow-hidden pointer-events-none">
        <FloatingElement depth={0.5} className="top-[8%] left-[11%]">
          <motion.img
            initial={{ opacity: 0 }}
            src={getImageUrl(0)}
            className="w-16 h-16 md:w-28 md:h-28 rounded-xl shadow-lg border border-brand-charcoal/10 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform pointer-events-auto"
          />
        </FloatingElement>
        <FloatingElement depth={1} className="top-[10%] left-[72%] md:left-[82%]">
          <motion.img
            initial={{ opacity: 0 }}
            src={getImageUrl(1)}
            className="w-20 h-20 md:w-32 md:h-32 rounded-2xl shadow-lg border border-brand-charcoal/10 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform pointer-events-auto"
          />
        </FloatingElement>
        <FloatingElement depth={2} className="top-[15%] left-[53%] md:left-[55%]">
          <motion.img
            initial={{ opacity: 0 }}
            src={getImageUrl(2)}
            className="w-24 h-32 md:w-40 md:h-52 rounded-xl shadow-md border border-brand-charcoal/5 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform pointer-events-auto"
          />
        </FloatingElement>
        <FloatingElement depth={1} className="top-[70%] left-[83%]">
          <motion.img
            initial={{ opacity: 0 }}
            src={getImageUrl(3)}
            className="w-24 h-24 md:w-36 md:h-36 rounded-3xl shadow-lg border border-brand-charcoal/10 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform pointer-events-auto"
          />
        </FloatingElement>

        <FloatingElement depth={1} className="top-[40%] left-[2%] md:left-[8%]">
          <motion.img
            initial={{ opacity: 0 }}
            src={getImageUrl(4)}
            className="w-20 h-28 md:w-36 md:h-48 rounded-2xl shadow-md border border-brand-charcoal/10 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform pointer-events-auto"
          />
        </FloatingElement>
        <FloatingElement depth={2} className="top-[60%] left-[70%] md:left-[67%]">
          <motion.img
            initial={{ opacity: 0 }}
            src={getImageUrl(7)}
            className="w-20 h-28 md:w-36 md:h-48 rounded-xl shadow-lg border border-brand-charcoal/5 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform pointer-events-auto"
          />
        </FloatingElement>

        <FloatingElement depth={4} className="top-[73%] left-[15%] md:left-[22%]">
          <motion.img
            initial={{ opacity: 0 }}
            src={getImageUrl(5)}
            className="w-32 md:w-44 h-40 md:h-56 rounded-2xl shadow-xl border border-brand-charcoal/10 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform pointer-events-auto"
          />
        </FloatingElement>
        <FloatingElement depth={1} className="top-[80%] left-[45%] md:left-[48%]">
          <motion.img
            initial={{ opacity: 0 }}
            src={getImageUrl(6)}
            className="w-16 h-16 md:w-28 md:h-28 rounded-full shadow-md border border-brand-charcoal/5 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform pointer-events-auto"
          />
        </FloatingElement>
      </Floating>
    </div>
  )
}
