"use client"

import React, { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { apiFetch } from "@/utils/api"

const MEDIAS = [
  { url: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1920&auto=format&fit=crop", label: "Summer Drop" },
  { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1920&auto=format&fit=crop", label: "Heavyweight" },
  { url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1920&auto=format&fit=crop", label: "Essentials" },
  { url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1920&auto=format&fit=crop", label: "Original Prints" },
]

export default function CinematicVideoHero({ onStartClick }: { onStartClick?: () => void }) {
  const [activeMedia, setActiveMedia] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [cinematicMedias, setCinematicMedias] = useState(MEDIAS);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await apiFetch("/cinematic-hero");
        if (res.success && res.data && res.data.length > 0) {
          setCinematicMedias(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchImages();
  }, []);

  const handleMediaSwitch = (index: number) => {
    if (activeMedia === index || isTransitioning) return
    setActiveMedia(index)
    setIsTransitioning(true)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)
  }

  // Auto-rotate every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setActiveMedia((prev) => (prev + 1) % cinematicMedias.length);
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 1000);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isTransitioning]);

  return (
    <section className="relative w-full h-[calc(100dvh-4.5rem)] sm:h-[calc(100dvh-5rem)] md:h-[calc(100dvh-5.5rem)] overflow-hidden bg-brand-charcoal font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        .liquid-glass {
          background: rgba(245, 225, 208, 0.05); /* brand-bg tinted */
          background-blend-mode: luminosity;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(245, 225, 208, 0.2);
          position: relative;
          overflow: hidden;
        }
        .liquid-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(180deg,
            rgba(245,225,208,0.4) 0%, rgba(245,225,208,0.1) 20%,
            rgba(245,225,208,0) 40%, rgba(245,225,208,0) 60%,
            rgba(245,225,208,0.1) 80%, rgba(245,225,208,0.4) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        @keyframes train-bob {
          0%, 100% { transform: translateY(0) scale(1.03); }
          50% { transform: translateY(-6px) scale(1.03); }
        }
        .animate-train-bob {
          animation: train-bob 4s ease-in-out infinite;
        }
        @keyframes ken-burns {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
        .animate-ken-burns {
          animation: ken-burns 20s ease-out forwards;
        }
      `}} />

      {/* Background Images with Ken Burns effect */}
      {cinematicMedias.map((media, index) => (
        <div 
          key={media.url}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            activeMedia === index ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <img
            src={media.url}
            className={`w-full h-full object-cover ${activeMedia === index ? 'animate-ken-burns' : ''}`}
            alt={media.label}
          />
          {/* Brand-colored overlay to ensure text readability */}
          <div className="absolute inset-0 bg-brand-charcoal/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-transparent to-brand-charcoal/30" />
        </div>
      ))}

      {/* Removed train window overlay for cleaner streetwear aesthetic */}

      {/* Content Layer */}
      <div className="relative z-[2] flex flex-col w-full h-full px-6 py-6 md:px-12 md:py-8 text-brand-bg">
        
        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center flex-1 text-center transition-colors duration-700 ease-in-out">
          <div className="liquid-glass border border-brand-bg/20 rounded-full px-4 py-2 mb-6 inline-flex">
            <span className="text-xs md:text-sm tracking-wide font-medium text-brand-bg/90">
              Make In India  🇮🇳 
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.1] max-w-4xl tracking-tight drop-shadow-md">
            Not For Everyone. <br /> Just For The Ones Who Get It.
          </h1>

          {/* <p className="mt-4 text-sm md:text-lg max-w-xl leading-relaxed mx-auto font-light text-brand-bg/80 drop-shadow">
            Rise above the chaos of fast fashion and endless micro-trends. Discover premium heavyweight cottons crafted for longevity, fit, and unapologetic style.
          </p> */}

          <div className="mt-8 liquid-glass border border-brand-bg/20 rounded-full p-2 flex items-center justify-between max-w-[320px] w-full sm:max-w-sm mx-auto shadow-xl">
            <input
              type="text"
              placeholder="Search catalog..."
              className="bg-transparent outline-none px-4 w-full text-sm text-brand-bg placeholder-brand-bg/60"
            />
            <button 
              onClick={onStartClick}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95 shrink-0 bg-brand-bg text-brand-charcoal"
            >
              Explore
            </button>
          </div>

          <div className="mt-8 mb-4 md:mb-6 flex flex-wrap justify-center gap-6 md:gap-10">
            {cinematicMedias.map((media, index) => (
              <button
                key={media.label}
                onClick={() => handleMediaSwitch(index)}
                className={`text-xs sm:text-sm font-medium tracking-wide uppercase transition-all duration-300 pb-1 border-b-2 ${
                  activeMedia === index
                    ? "text-brand-bg border-brand-bg"
                    : "text-brand-bg/50 border-transparent hover:text-brand-bg/80"
                }`}
              >
                {media.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        {/* <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-3 mt-auto pb-6 text-xs sm:text-sm text-brand-bg/70 font-sans tracking-wide drop-shadow">
          <span>280GSM Heavyweight</span>
          <span className="hidden md:inline">|</span>
          <span>12,000+ Customers</span>
          <span className="hidden md:inline">|</span>
          <span>4.9/5 User Satisfaction</span>
          <span className="hidden md:inline">|</span>
          <span>Fit-First Design</span>
        </div> */}

      </div>
    </section>
  )
}
