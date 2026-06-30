"use client";

import { useState } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/utils/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        localStorage.setItem("authToken", res.data.token);
        onSuccess(res.data.user);
        onClose();
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-brand-bg p-8 shadow-2xl border border-brand-charcoal/5 z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-brand-charcoal/40 hover:text-brand-charcoal p-1.5 rounded-full hover:bg-brand-charcoal/5 transition-all duration-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-2 bg-brand-tan/10 text-brand-tan-dark px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>flowbox members</span>
            </div>

            <h2 className="text-3xl font-bold font-serif text-brand-charcoal tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-2 text-sm text-brand-charcoal/50 font-light">
              {isLogin ? "Log in to streamline your work processes." : "Join Flowbox today and supercharge your team."}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="mt-1.5 w-full rounded-2xl border border-brand-charcoal/10 bg-brand-bg px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-all duration-200"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="mt-1.5 w-full rounded-2xl border border-brand-charcoal/10 bg-brand-bg px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-2xl border border-brand-charcoal/10 bg-brand-bg px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Error messages */}
              {error && (
                <div className="flex gap-2.5 items-center bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl p-3.5 text-xs font-medium">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-3.5 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
              </button>
            </form>

            {/* Selector footer link */}
            <div className="mt-6 text-center text-xs text-brand-charcoal/50">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsLogin(!isLogin);
                }}
                className="font-bold text-brand-green hover:underline cursor-pointer"
              >
                {isLogin ? "Sign up here" : "Log in here"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
