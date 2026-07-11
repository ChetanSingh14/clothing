import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/utils/api";
import { useCartStore } from "./useCartStore";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  state?: string;
  city?: string;
  createdAt: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, otp: string, otpToken: string) => Promise<boolean>;
  signupOtp: (email: string) => Promise<{ success: boolean; otpToken?: string; message?: string }>;
  googleLogin: (idToken: string) => Promise<boolean>;
  sendPhoneOtp: () => Promise<{ success: boolean; otpToken?: string; message?: string }>;
  verifyPhoneOtp: (otp: string, otpToken: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: (force?: boolean) => Promise<void>;
  setError: (msg: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      initialized: false,

      setError: (msg) => set({ error: msg }),

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          if (res.success && res.data) {
            set({ user: res.data.user, token: res.data.token, loading: false });
            return true;
          }
          return false;
        } catch (err: any) {
          set({ error: err.message || "Login failed", loading: false });
          return false;
        }
      },

      signupOtp: async (email) => {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch("/auth/signup-otp", {
            method: "POST",
            body: JSON.stringify({ email }),
          });
          set({ loading: false });
          if (res.success && res.data) {
            return { success: true, otpToken: res.data.otpToken };
          }
          return { success: false, message: res.message || "Failed to send OTP" };
        } catch (err: any) {
          set({ error: err.message || "Failed to send OTP", loading: false });
          return { success: false, message: err.message || "Failed to send OTP" };
        }
      },

      signup: async (name, email, password, otp, otpToken) => {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch("/auth/signup", {
            method: "POST",
            body: JSON.stringify({ name, email, password, otp, otpToken }),
          });
          if (res.success && res.data) {
            set({ user: res.data.user, token: res.data.token, loading: false });
            return true;
          }
          return false;
        } catch (err: any) {
          set({ error: err.message || "Signup failed", loading: false });
          return false;
        }
      },

      googleLogin: async (idToken) => {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch("/auth/google", {
            method: "POST",
            body: JSON.stringify({ idToken }),
          });
          if (res.success && res.data) {
            set({ user: res.data.user, token: res.data.token, loading: false });
            return true;
          }
          return false;
        } catch (err: any) {
          set({ error: err.message || "Google login failed", loading: false });
          return false;
        }
      },

      sendPhoneOtp: async () => {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch("/user/phone-otp", {
            method: "POST"
          });
          set({ loading: false });
          if (res.success && res.data) {
            return { success: true, otpToken: res.data.otpToken };
          }
          return { success: false, message: res.message || "Failed to send OTP" };
        } catch (err: any) {
          set({ error: err.message || "Failed to send OTP", loading: false });
          return { success: false, message: err.message || "Failed to send OTP" };
        }
      },

      verifyPhoneOtp: async (otp, otpToken, phone) => {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch("/user/phone-verify", {
            method: "POST",
            body: JSON.stringify({ otp, otpToken, phone })
          });
          if (res.success && res.data) {
            set({ user: res.data, loading: false });
            return true;
          }
          return false;
        } catch (err: any) {
          set({ error: err.message || "Phone verification failed", loading: false });
          return false;
        }
      },

      logout: async () => {
        // Prevent re-entrant logout calls that cause infinite reload loops
        const { token: currentToken } = get();
        if (!currentToken && !get().user) return; // Already logged out, skip

        // Clear state FIRST to prevent any further API calls or socket events from re-triggering
        useCartStore.getState().clearCart();
        set({ user: null, token: null, error: null });

        // Attempt backend logout (fire-and-forget, don't block)
        try {
          await apiFetch("/auth/logout", { method: "POST" });
        } catch (err) {
          // Expected to fail if token is already invalid — that's fine
        }

        // Redirect only if not already on homepage
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/";
        }
      },

      fetchMe: async (force = false) => {
        const { initialized, loading, token } = get();
        if (loading) return;
        if (initialized && !force) return;

        if (!token) {
          set({ initialized: true });
          return;
        }

        set({ loading: true, error: null });
        try {
          const res = await apiFetch("/user/me");
          if (res.success && res.data) {
            set({ user: res.data, initialized: true, loading: false });
          } else {
            set({ user: null, token: null, initialized: true, loading: false });
          }
        } catch (err) {
          set({ user: null, token: null, initialized: true, loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

if (typeof window !== "undefined") {
  let currentToken: string | null = null;
  let syncScheduled = false;
  
  const syncSocket = (token: string | null) => {
    if (syncScheduled) return;
    syncScheduled = true;

    // Use requestIdleCallback / setTimeout to debounce and avoid hot-path re-renders
    setTimeout(() => {
      syncScheduled = false;
      import("@/utils/socket").then(({ getSocket, disconnectSocket }) => {
        if (token) {
          getSocket();
        } else {
          disconnectSocket();
        }
      });
    }, 100);
  };

  // Run once on startup after Zustand has recovered the persisted store
  setTimeout(() => {
    const token = useAuthStore.getState().token;
    currentToken = token;
    if (token) syncSocket(token);
  }, 500);

  // Subscribe to token changes only
  useAuthStore.subscribe((state) => {
    if (state.token !== currentToken) {
      currentToken = state.token;
      syncSocket(state.token);
    }
  });
}
