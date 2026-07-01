import { create } from "zustand";
import { apiFetch } from "@/utils/api";
import { useCartStore } from "./useCartStore";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
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
  fetchMe: () => Promise<void>;
  setError: (msg: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("authToken") : null,
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
        localStorage.setItem("authToken", res.data.token);
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
        localStorage.setItem("authToken", res.data.token);
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
      localStorage.removeItem("authToken");
      // Clear shopping cart on logout
      useCartStore.getState().clearCart();
      set({ user: null, token: null, error: null });
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  },

  fetchMe: async () => {
    const { token, initialized, loading } = get();
    if (loading) return;
    if (!token && initialized) return;

    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      set({ user: null, token: null, initialized: true });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await apiFetch("/user/me");
      if (res.success && res.data) {
        set({ user: res.data, token: storedToken, initialized: true, loading: false });
      } else {
        localStorage.removeItem("authToken");
        set({ user: null, token: null, initialized: true, loading: false });
      }
    } catch (err) {
      localStorage.removeItem("authToken");
      set({ user: null, token: null, initialized: true, loading: false });
    }
  },
}));
