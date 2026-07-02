import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./PageLoader.css";

gsap.registerPlugin(useGSAP);

interface PageLoaderProps {
  logoLightSrc?: string;
  brandName?: string;
}

export default function PageLoader({ logoLightSrc = "/logo-light.png", brandName = "MQFK" }: PageLoaderProps) {
  const loaderCountRef = useRef<HTMLSpanElement>(null);
  const loaderBarRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const counter = { val: 0 };
    const tl = gsap.timeline({ repeat: -1 });
    
    tl.fromTo(".cine-loader-logo", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" });
    tl.to(
      counter,
      {
        val: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          if (loaderCountRef.current) {
            loaderCountRef.current.textContent = String(Math.round(counter.val)).padStart(3, "0");
          }
          if (loaderBarRef.current) {
            loaderBarRef.current.style.width = `${counter.val}%`;
          }
        },
      },
      "-=0.2"
    );
    tl.to(counter, { val: 100, duration: 0.5 }); // pause
  }, []);

  return (
    <div className="cine-loader">
      <div className="cine-grain" />
      <div className="cine-loader-ring">
        <img src={logoLightSrc} alt={brandName} className="cine-loader-logo" />
      </div>
      <div className="cine-loader-bar-track">
        <div ref={loaderBarRef} className="cine-loader-bar" />
      </div>
      <span ref={loaderCountRef} className="cine-loader-count">000</span>
    </div>
  );
}
