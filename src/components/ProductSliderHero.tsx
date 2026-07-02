"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductItem } from "@/store/useProductStore";
import PageLoader from "./PageLoader";
import "./CinematicIntro.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface CinematicIntroProps {
  brandName?: string;
  featuredProduct?: ProductItem;
  logoLightSrc?: string; // white wordmark, for dark scenes
  logoDarkSrc?: string; // black wordmark, for light scenes
}

type Scene = {
  type: "texture" | "curve" | "product" | "cta";
  eyebrow: string;
  headline: string;
  sub?: string;
};

const TICKER_ITEMS = ["New season", "Clothing co.", "Limited drop", "Made to move", "Est. quality"];

export default function CinematicIntro({
  brandName = "MQFK",
  featuredProduct,
  logoLightSrc = "/logo-light.png",
  logoDarkSrc = "/logo-dark.png",
}: CinematicIntroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [loading, setLoading] = useState(true);

  const swatches = featuredProduct?.colors?.length
    ? featuredProduct.colors.slice(0, 4)
    : ["#556B4E", "#C2B29B", "#2D221A", "#DCC3AC"];

  const scenes: Scene[] = [
    { type: "texture", eyebrow: "New season", headline: "Cut for movement." },
    { type: "curve", eyebrow: "Materials", headline: "Heavyweight cotton, cut to drape." },
    {
      type: "product",
      eyebrow: featuredProduct?.category || "Bestseller",
      headline: featuredProduct?.title || "The signature tee",
      sub: featuredProduct ? `₹${featuredProduct.price.toFixed(2)}` : undefined,
    },
    { type: "cta", eyebrow: brandName, headline: "Shop the full collection" },
  ];

  // Loader: wait for initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll-scrubbed scene sequence, hard-cut through the flash overlay.
  useGSAP(
    () => {
      if (loading) return;

      const total = scenes.length;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: `+=${total * 100}%`,
          scrub: 0.6,
          pin: true,
        },
      });

      sceneRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: i === 0 ? 1 : 0 });
      });
      gsap.set(flashRef.current, { opacity: 0 });

      scenes.forEach((_, i) => {
        if (i === 0) return;
        const t = i - 1;

        tl.to(flashRef.current, { opacity: 1, duration: 0.25, ease: "power1.in" }, t + 0.55)
          .to(".cine-flash-logo", { scale: 1.08, duration: 0.25, ease: "power1.in" }, t + 0.55)
          .call(
            () => {
              if (counterRef.current) {
                counterRef.current.textContent = String(i + 1).padStart(2, "0");
              }
            },
            undefined,
            t + 0.68
          )
          .to(sceneRefs.current[i - 1], { opacity: 0, scale: 1.04, duration: 0.2 }, t + 0.6)
          .set(sceneRefs.current[i], { opacity: 0, scale: 0.97 }, t + 0.78)
          .to(flashRef.current, { opacity: 0, duration: 0.3, ease: "power1.out" }, t + 0.8)
          .to(".cine-flash-logo", { scale: 1, duration: 0.3, ease: "power1.out" }, t + 0.8)
          .to(sceneRefs.current[i], { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }, t + 0.82);
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { dependencies: [loading], scope: wrapperRef }
  );

  return (
    <>
      {loading && <PageLoader logoLightSrc={logoLightSrc} brandName={brandName} />}

      <div ref={wrapperRef} className="cine-wrapper">
        <div className="cine-viewport">
          {/* Persistent decorative layers, sit above every scene */}
          <div className="cine-corner cine-corner-tl" />
          <div className="cine-corner cine-corner-tr" />
          <div className="cine-corner cine-corner-bl" />
          <div className="cine-corner cine-corner-br" />

          <img src={logoLightSrc} alt="" aria-hidden="true" className="cine-watermark" />

          <div className="cine-particles">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="cine-particle"
                style={{
                  left: `${(i * 37) % 100}%`,
                  animationDelay: `${(i % 8) * 0.9}s`,
                  animationDuration: `${9 + (i % 5)}s`,
                }}
              />
            ))}
          </div>

          {scenes.map((scene, i) => (
            <div
              key={i}
              ref={(el) => {
                sceneRefs.current[i] = el;
              }}
              className={`cine-scene cine-scene-${scene.type}`}
            >
              <div className="cine-grain" />

              {scene.type === "texture" && (
                <>
                  <div className="cine-texture-shape" />
                  <svg className="cine-tee-icon" viewBox="0 0 100 100" aria-hidden="true">
                    <path d="M28,18 L42,8 Q50,16 58,8 L72,18 L66,32 L60,28 L60,88 L40,88 L40,28 L34,32 Z" />
                  </svg>
                </>
              )}

              {scene.type === "curve" && (
                <>
                  <svg className="cine-curve" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
                    <circle cx="400" cy="900" r="480" />
                  </svg>
                  <div className="cine-nodes">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span
                        key={i}
                        className="cine-node"
                        style={{ left: `${20 + i * 12}%`, top: `${58 + (i % 3) * 8}%` }}
                      />
                    ))}
                  </div>
                </>
              )}

              {scene.type === "product" && (
                <>
                  {featuredProduct?.images?.[0] && (
                    <img className="cine-product-img" src={featuredProduct.images[0]} alt={scene.headline} />
                  )}
                  <div className="cine-swatches">
                    {swatches.map((c, idx) => (
                      <span key={idx} className="cine-swatch" style={{ background: c }} />
                    ))}
                  </div>
                  {scene.sub && <div className="cine-tag">{scene.sub}</div>}
                </>
              )}

              {scene.type === "cta" && (
                <div className="cine-mark-card">
                  <img src={logoLightSrc} alt={brandName} className="cine-mark-logo" />
                </div>
              )}

              <div className="cine-scene-copy">
                <span className="cine-eyebrow">{scene.eyebrow}</span>
                <h2 className="cine-headline">{scene.headline}</h2>
                {scene.type === "cta" && (
                  <Link href="#catalog" className="cine-cta">
                    Browse shop <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          ))}

          <div ref={flashRef} className="cine-flash">
            <img src={logoLightSrc} alt={brandName} className="cine-flash-logo" />
            <span ref={counterRef} className="cine-flash-count">01</span>
          </div>

          <div className="cine-ticker">
            <div className="cine-ticker-track">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="cine-ticker-item">
                  {item}
                  <span className="cine-ticker-dot" />
                </span>
              ))}
            </div>
          </div>

          <div className="cine-scene-index">
            {scenes.map((_, i) => (
              <span key={i} className="cine-scene-dot" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}