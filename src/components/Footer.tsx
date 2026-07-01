"use client";

import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/useSettingsStore";
import { shallow } from "zustand/shallow";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const companyName = useSettingsStore((state) => state.companyName);
  
  const socials = [
    {
      name: "Twitter",
      href: "https://twitter.com",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      )
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
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
    },
    {
      name: "TikTok",
      href: "https://tiktok.com",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
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

        {/* Right Side: Social Media Icons */}
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

      </div>
    </footer>
  );
}
