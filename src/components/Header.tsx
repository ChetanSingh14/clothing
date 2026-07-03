"use client";

import Link from "next/link";
import { Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect, useState } from "react";

interface HeaderProps {
  onAuthClick?: () => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { user, logout, fetchMe } = useAuthStore();
  const { setIsOpen, getCartCount, loadCart } = useCartStore();
  const companyName = useSettingsStore((state) => state.companyName);
  const logoUrl = useSettingsStore((state) => state.logoUrl);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="mx-auto flex min-h-[4rem] sm:min-h-[4.5rem] md:min-h-[5.5rem] py-2 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-28 sm:w-36 md:w-52 lg:w-60 flex items-center justify-start">
              <img src={logoUrl} alt={companyName} className="object-contain h-auto max-h-[35px] sm:max-h-[50px] md:max-h-[70px] lg:max-h-[92px] w-full" />
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Home", "Product", "About Us", "Contact"].map((link) => (
            <Link
              key={link}
              href={
                link === "Home"
                  ? "/"
                  : link === "Contact"
                  ? "/contactpage"
                  : link === "About Us"
                  ? "/about"
                  : `/#${link.toLowerCase().replace(" ", "-")}`
              }
              className="text-xs font-bold tracking-widest text-brand-charcoal/70 transition-all hover:text-brand-charcoal uppercase"
            >
              {link.toUpperCase()}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-black tracking-widest text-brand-green transition-all hover:text-brand-green-dark border-b border-brand-green/20 uppercase"
            >
              ADMIN PANEL
            </Link>
          )}
        </nav>

        {/* Right Side: Interaction Elements */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Wishlist */}
          <button
            onClick={() => {
              if (!user) {
                onAuthClick?.();
              } else {
                // Redirect user to wishlist view
                window.location.href = "/wishlist";
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
                onAuthClick?.();
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
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/profile" className="hidden sm:inline-flex items-center gap-2.5 text-xs font-medium text-brand-charcoal/70 tracking-wide hover:text-brand-charcoal transition-colors">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-brand-charcoal/20" />
                ) : (
                  <User className="w-8 h-8 rounded-full bg-brand-gray p-1.5 text-brand-charcoal/50" />
                )}
                <span>hi, <span className="font-bold text-brand-charcoal text-sm">{user.name.split(" ")[0]}</span></span>
              </Link>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              aria-label="Account"
              className="flex items-center space-x-1 sm:space-x-1.5 rounded-full border border-brand-charcoal/10 bg-brand-bg px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs sm:text-sm font-medium text-brand-charcoal/80 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium tracking-wide lowercase">account</span>
            </button>
          )}

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-full p-2 text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal transition-all duration-200 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-brand-charcoal/5 bg-brand-bg/95 backdrop-blur-md px-6 py-4 flex flex-col space-y-4"
          >
            {["Home", "Product", "About Us", "Contact"].map((link) => (
              <Link
                key={link}
                href={
                  link === "Home"
                    ? "/"
                    : link === "Contact"
                    ? "/contactpage"
                    : link === "About Us"
                    ? "/about"
                    : `/#${link.toLowerCase().replace(" ", "-")}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold tracking-widest text-brand-charcoal/70 transition-all hover:text-brand-charcoal uppercase py-1"
              >
                {link.toUpperCase()}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-black tracking-widest text-brand-green transition-all hover:text-brand-green-dark border-b border-brand-green/20 uppercase w-fit py-1"
              >
                ADMIN PANEL
              </Link>
            )}
            {/* Show user orders links on mobile dropdown directly if logged in */}
            {user && (
              <div className="pt-2 border-t border-brand-charcoal/5 flex flex-col gap-3">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-bold tracking-widest text-brand-charcoal/70 transition-all hover:text-brand-charcoal uppercase py-1"
                >
                  MY PROFILE
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
