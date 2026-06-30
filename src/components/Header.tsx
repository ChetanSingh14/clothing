"use client";

import Link from "next/link";
import { Heart, User, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect } from "react";

interface HeaderProps {
  onAuthClick: () => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { user, logout, fetchMe } = useAuthStore();
  const { setIsOpen, getCartCount, loadCart } = useCartStore();
  const { companyName, logoUrl, fetchSettings } = useSettingsStore();

  // Load settings, cart and check user state on mount
  useEffect(() => {
    fetchSettings();
    loadCart();
    fetchMe();
  }, []);

  const cartCount = getCartCount();

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
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="relative h-6 w-6 overflow-hidden rounded bg-brand-charcoal flex items-center justify-center">
              <img src={logoUrl} alt="Logo" className="object-cover h-full w-full invert" />
            </div>
            <span className="text-sm font-black tracking-widest text-brand-charcoal uppercase font-serif">
              {companyName}
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Home", "Product", "About Us", "Contact"].map((link) => (
            <Link
              key={link}
              href={link === "Home" ? "/" : `/#${link.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium tracking-wide text-brand-charcoal/70 transition-colors hover:text-brand-charcoal"
            >
              {link.toLowerCase()}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-semibold tracking-wide text-brand-green transition-colors hover:text-brand-green-dark border-b border-brand-green/20"
            >
              admin panel
            </Link>
          )}
        </nav>

        {/* Right Side: Interaction Elements */}
        <div className="flex items-center space-x-3">
          {/* Wishlist */}
          <button
            onClick={() => {
              if (!user) {
                onAuthClick();
              } else {
                // Redirect user to catalog view
                window.location.hash = "catalog";
              }
            }}
            aria-label="Wishlist"
            className="rounded-full p-2 text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 cursor-pointer"
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* Cart Bag with dynamic badge */}
          <button
            onClick={() => {
              if (!user) {
                onAuthClick();
              } else {
                setIsOpen(true);
              }
            }}
            aria-label="Shopping Cart"
            className="relative rounded-full p-2 text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-green text-[9px] font-bold text-brand-bg shadow-sm"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-medium text-brand-charcoal/70 tracking-wide">
                hi, <span className="font-bold text-brand-charcoal">{user.name.split(" ")[0]}</span>
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-brand-charcoal/15 bg-brand-bg px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 cursor-pointer"
              >
                logout
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              aria-label="Account"
              className="flex items-center space-x-1.5 rounded-full border border-brand-charcoal/10 bg-brand-bg px-3.5 py-1.5 text-sm font-medium text-brand-charcoal/80 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium tracking-wide lowercase">account</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
