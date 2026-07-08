"use client";

import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/useSettingsStore";
import { shallow } from "zustand/shallow";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const companyName = useSettingsStore((state) => state.companyName);
  
  const socials = [
    {
      name: "Gmail",
      href: "mailto:clothing.mdfk@gmail.com",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/clothing.mdfk/",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    }
  ];

  return (
    <footer className="w-full bg-brand-brown py-12 px-6 sm:px-8 border-t border-brand-bg/5 text-brand-bg">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Copyright & Brand Statement */}
        <div className="text-center md:text-left space-y-1.5">
          <p className="text-sm font-semibold text-brand-tan font-serif tracking-widest uppercase">
            {companyName}
          </p>
          <p className="text-xs text-brand-bg/60 font-light tracking-wide">
            © {currentYear} {companyName}. Bold graphic tees for the culture. No cap.
          </p>
        </div>

        {/* Right Side: Social Media Icons & Links */}
        <div className="flex flex-col items-center md:items-end space-y-4">
          <div className="flex items-center space-x-6">
            {socials.map((social, idx) => {
              return (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="text-brand-bg/70 hover:text-brand-tan transition-colors duration-200 cursor-pointer"
                >
                  {social.icon}
                </motion.a>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-brand-bg/50">
            <Link href="/privacy" className="hover:text-brand-tan transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-tan transition-colors">Terms of Service</Link>
            <Link href="/return-policy" className="hover:text-brand-tan transition-colors">Exchange Policy</Link>
          </div>
        </div>
      </div>
      
      {/* Legal Footer */}
      <div className="mx-auto max-w-7xl mt-12 pt-6 border-t border-brand-bg/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] text-brand-bg/40 font-mono text-center md:text-left">
        <div>
          Your Main Domain: Build your store on <a href="https://mdfkclothing.com" className="text-brand-tan/80 hover:text-brand-tan transition-colors">mdfkclothing.com</a>.
        </div>
        <div>
          mdfkclothing.com is legally owned and operated by MADE DIFFERENT FK.
        </div>
      </div>
    </footer>
  );
}
