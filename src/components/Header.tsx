"use client";

import Link from "next/link";
import { Heart, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-brand-charcoal/5 bg-brand-bg/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-brand-charcoal font-serif">
              Flowbox
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Home", "Product", "About Us", "Contact"].map((link) => (
            <Link
              key={link}
              href={`#${link.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium tracking-wide text-brand-charcoal/70 transition-colors hover:text-brand-charcoal"
            >
              {link.toLowerCase()}
            </Link>
          ))}
        </nav>

        {/* Right Side: Interaction Elements */}
        <div className="flex items-center space-x-4">
          <button
            aria-label="Wishlist"
            className="rounded-full p-2 text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 cursor-pointer"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            aria-label="Account"
            className="flex items-center space-x-1.5 rounded-full border border-brand-charcoal/10 bg-brand-bg px-3.5 py-1.5 text-sm font-medium text-brand-charcoal/80 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium tracking-wide lowercase">account</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
