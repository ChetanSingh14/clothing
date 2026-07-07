"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP States for signup
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const { login, signup, error, setError } = useAuthStore();
  const companyName = useSettingsStore((state) => state.companyName);

  // Initialize Google Auth on modal open
  useEffect(() => {
    if (!isOpen) return;

    const scriptId = "google-jssdk";
    if (document.getElementById(scriptId)) {
      initializeGoogleAuth();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleAuth();
    };
    document.body.appendChild(script);
  }, [isOpen, isLogin]);

  const initializeGoogleAuth = () => {
    try {
      const google = (window as any).google;
      if (!google) return;

      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "147294619217-kcdsm452kk3neta9bjqrfa35ik91r5r5.apps.googleusercontent.com",
        callback: handleGoogleCredentialResponse,
      });

      const btnDiv = document.getElementById("google-signin-btn");
      if (btnDiv) {
        google.accounts.id.renderButton(btnDiv, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 320,
        });
      }
    } catch (err) {
      console.error("Google Auth Init failed:", err);
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    setError(null);
    setLoading(true);
    const success = await useAuthStore.getState().googleLogin(response.credential);
    setLoading(false);
    if (success) {
      onSuccess?.(useAuthStore.getState().user);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      if (!otpSent) {
        setOtpSending(true);
        const otpRes = await useAuthStore.getState().signupOtp(email);
        setOtpSending(false);
        setLoading(false);
        if (otpRes.success && otpRes.otpToken) {
          setOtpToken(otpRes.otpToken);
          setOtpSent(true);
        } else {
          setError(otpRes.message || "Failed to send OTP verification email");
        }
        return;
      }
      success = await signup(name, email, password, otp, otpToken);
    }

    setLoading(false);

    if (success) {
      onSuccess?.(useAuthStore.getState().user);
      onClose();
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setOtp("");
      setOtpToken("");
      setOtpSent(false);
    }
  };

  const handleResetOtp = () => {
    setOtpSent(false);
    setOtp("");
    setOtpToken("");
    setError(null);
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
              <span className="uppercase tracking-widest text-[9px]">{companyName} club</span>
            </div>

            <h2 className="text-3xl font-bold font-serif text-brand-charcoal tracking-tight">
              {isLogin ? "Welcome Back" : otpSent ? "Verify Email" : "Create Account"}
            </h2>
            <p className="mt-2 text-sm text-brand-charcoal/50 font-light">
              {isLogin 
                ? "Log in to access your wishlist and shopping bag." 
                : otpSent 
                  ? `An OTP was sent to ${email} for verification.` 
                  : `Join the ${companyName} community today.`}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      disabled={otpSent}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="mt-1.5 w-full rounded-2xl border border-brand-charcoal/10 bg-brand-bg px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-all duration-200 disabled:opacity-60"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  disabled={otpSent}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="mt-1.5 w-full rounded-2xl border border-brand-charcoal/10 bg-brand-bg px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-all duration-200 disabled:opacity-60"
                />
              </div>

              {!isLogin && otpSent && (
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="otp">
                      Verification Code (OTP)
                    </label>
                    <button
                      type="button"
                      onClick={handleResetOtp}
                      className="text-xs text-brand-green hover:underline font-bold"
                    >
                      Change Details
                    </button>
                  </div>
                  <input
                    type="text"
                    id="otp"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="mt-1.5 w-full rounded-2xl border border-brand-charcoal/10 bg-brand-bg px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-all duration-200"
                  />
                </div>
              )}

              {isLogin || !otpSent ? (
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
              ) : null}

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
                disabled={loading || otpSending}
                className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-3.5 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading || otpSending 
                  ? "Please wait..." 
                  : isLogin 
                    ? "Log In" 
                    : otpSent 
                      ? "Verify & Sign Up" 
                      : "Send Verification Code"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-brand-charcoal/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-bg px-2 text-brand-charcoal/40 font-semibold tracking-wider">Or</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div className="flex justify-center w-full">
              <div id="google-signin-btn" />
            </div>

            {/* Selector footer link */}
            <div className="mt-6 text-center text-xs text-brand-charcoal/50">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsLogin(!isLogin);
                  setOtpSent(false);
                  setOtp("");
                  setOtpToken("");
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
