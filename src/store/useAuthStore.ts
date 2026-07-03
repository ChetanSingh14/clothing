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
  signup: (name: string, email: string, password: string) => Promise<boolean>;
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

  signup: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
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

  logout: async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout backend request failed:", err);
    } finally {
      // Clear shopping cart on logout
      useCartStore.getState().clearCart();
      set({ user: null, token: null, error: null });
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
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
