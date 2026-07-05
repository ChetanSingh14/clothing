"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Tag, Clock, ShoppingBag, CheckCircle, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/utils/api";
import { useCartStore } from "@/store/useCartStore";

interface ClaimData {
  discountAmount: number;
  isUsed: boolean;
  claimedAt: string;
}

export default function OfferPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { checkOfferStatus } = useCartStore();

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "error" | "unauthorized">("loading");
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: number; delay: number; color: string; size: number }>>([]);

  // Generate confetti on mount
  useEffect(() => {
    const colors = ["#556B4E", "#C2B29B", "#2D221A", "#F5E1D0", "#EAD8C8", "#b09f87"];
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
    }));
    setConfettiPieces(pieces);
  }, []);

  // Claim offer logic
  const claimOffer = async () => {
    setStatus("loading");
    try {
      const res = await apiFetch("/offer/claim", { method: "POST" });
      
      if (res.success) {
        setClaimData(res.data);
        setSuccessMessage(res.message);
        setStatus("valid");
        checkOfferStatus(); // Update global cart store
      } else {
        setErrorMessage(res.message || "Failed to claim offer");
        setStatus("error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      setStatus("unauthorized");
      return;
    }

    // User is logged in, attempt to claim
    claimOffer();
  }, [user, initialized]);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-green selection:text-brand-bg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-brand-tan/20 blur-[100px] rounded-full pointer-events-none" />

      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-grow flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            
            {/* STATE: UNAUTHORIZED */}
            {status === "unauthorized" && (
              <motion.div
                key="unauthorized"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-brand-gray/40 backdrop-blur-md rounded-3xl p-8 sm:p-10 text-center border border-brand-charcoal/10 shadow-2xl relative overflow-hidden group"
              >
                <div className="w-20 h-20 mx-auto bg-brand-charcoal rounded-full flex items-center justify-center mb-6 shadow-xl relative">
                  <Gift className="h-10 w-10 text-brand-bg" />
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-green"></span>
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl font-serif font-bold text-brand-charcoal tracking-tight mb-3">
                  Secret Offer Found!
                </h1>
                
                <p className="text-sm text-brand-charcoal/60 mb-8 font-medium">
                  You've unlocked a secret packaging offer! Please log in to your account to claim your random discount (₹30-₹40).
                </p>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-4 px-6 text-sm font-bold tracking-wider hover:bg-brand-charcoal/90 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center gap-2"
                >
                  Log In to Claim Offer
                </button>
              </motion.div>
            )}

            {/* STATE: LOADING */}
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-brand-charcoal/10 border-t-brand-green rounded-full animate-spin"></div>
                  <Gift className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-brand-charcoal/50" />
                </div>
                <p className="mt-6 text-sm font-semibold tracking-widest uppercase text-brand-charcoal/50 animate-pulse">
                  Unwrapping your offer...
                </p>
              </motion.div>
            )}

            {/* STATE: ERROR / INVALID */}
            {(status === "error" || status === "invalid") && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-gray/30 rounded-3xl p-8 text-center border border-rose-500/10 shadow-lg"
              >
                <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-5">
                  <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <h2 className="text-xl font-bold font-serif text-brand-charcoal mb-2">Oops!</h2>
                <p className="text-sm text-brand-charcoal/60 mb-6">{errorMessage}</p>
                
                <button
                  onClick={() => router.push("/")}
                  className="bg-brand-bg border border-brand-charcoal/10 text-brand-charcoal px-6 py-3 rounded-xl text-xs font-bold tracking-wider hover:bg-brand-charcoal hover:text-brand-bg transition-colors"
                >
                  Back to Store
                </button>
              </motion.div>
            )}

            {/* STATE: VALID (CLAIMED) */}
            {status === "valid" && claimData && (
              <motion.div
                key="valid"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-brand-bg rounded-3xl overflow-hidden border border-brand-charcoal/10 shadow-2xl relative"
              >
                {/* Confetti Animation Layer */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                  {confettiPieces.map((piece) => (
                    <motion.div
                      key={piece.id}
                      initial={{ y: -20, opacity: 1, x: `${piece.left}%` }}
                      animate={{ 
                        y: ["0%", "1000%"],
                        rotate: [0, 360, 720],
                        x: [`${piece.left}%`, `${piece.left + (Math.random() * 20 - 10)}%`]
                      }}
                      transition={{ 
                        duration: Math.random() * 2 + 3,
                        ease: "linear",
                        repeat: Infinity,
                        delay: piece.delay
                      }}
                      className="absolute top-0 w-2 h-2 rounded-sm"
                      style={{ 
                        backgroundColor: piece.color,
                        width: piece.size,
                        height: piece.size * 1.5,
                      }}
                    />
                  ))}
                </div>

                <div className="p-8 sm:p-10 relative z-10 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-green/10 text-brand-green rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="h-3.5 w-3.5" />
                    Offer Unlocked
                  </div>

                  <h1 className="text-4xl font-serif font-black text-brand-charcoal mb-2">
                    ₹{claimData.discountAmount} <span className="text-2xl font-bold opacity-50">OFF</span>
                  </h1>
                  
                  <p className="text-sm font-medium text-brand-charcoal/60 mb-8">
                    {successMessage}
                  </p>

                  <div className="bg-brand-gray/30 rounded-2xl p-5 mb-8 border border-brand-charcoal/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-charcoal/50 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Minimum Order</span>
                      <span className="font-bold text-brand-charcoal">₹499</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-brand-charcoal/5 pt-3">
                      <span className="text-brand-charcoal/50 flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Status</span>
                      <span className="font-bold text-brand-green">Auto-Applied at Checkout</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/")}
                    className="w-full bg-brand-green text-white rounded-xl py-4 px-6 text-sm font-bold tracking-wider hover:bg-brand-green-dark hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    Start Shopping
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={() => {}} />
    </div>
  );
}
