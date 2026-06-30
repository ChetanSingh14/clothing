"use client";

// import { Twitter, Github, Linkedin, Instagram } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // const socials = [
  //   { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  //   { icon: Github, href: "https://github.com", label: "GitHub" },
  //   { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  //   { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  // ];

  return (
    <footer className="w-full bg-brand-bg py-12 px-6 sm:px-8 border-t border-brand-charcoal/5">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Copyright & Brand Statement */}
        <div className="text-center md:text-left space-y-1.5">
          <p className="text-sm font-semibold text-brand-charcoal font-serif tracking-wide">
            Flowbox
          </p>
          <p className="text-xs text-brand-charcoal/50 font-light tracking-wide">
            © {currentYear} Flowbox Inc. Streamlining work processes for modern remote creative teams.
          </p>
        </div>

        {/* Right Side: Social Media Icons */}
        <div className="flex items-center space-x-6">
          {/* {socials.map((social, idx) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                whileHover={{ y: -3, scale: 1.05 }}
                className="text-brand-charcoal/70 hover:text-brand-charcoal transition-colors duration-200 cursor-pointer"
              >
                <Icon className="h-5 w-5" />
              </motion.a>
            );
          })} */}
        </div>

      </div>
    </footer>
  );
}
