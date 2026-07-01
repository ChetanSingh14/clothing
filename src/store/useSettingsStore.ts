import { create } from "zustand";
import { apiFetch } from "@/utils/api";

interface SettingsState {
  companyName: string;
  logoUrl: string;
  loading: boolean;
  initialized: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: { companyName?: string; logoUrl?: string }) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  companyName: "MDFK CLOTHING CO.",
  logoUrl: "/logo.jpg",
  loading: false,
  initialized: false,

  fetchSettings: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await apiFetch("/settings");
      if (res.success && res.data) {
        set({
          companyName: res.data.companyName,
          logoUrl: res.data.logoUrl,
          initialized: true,
          loading: false,
        });
      } else {
        set({ loading: false, initialized: true });
      }
    } catch (err) {
      console.error("Failed to load settings from server:", err);
      set({ loading: false, initialized: true });
    }
  },

  updateSettings: async (data) => {
    set({ loading: true });
    try {
      const res = await apiFetch("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (res.success && res.data) {
        set({
          companyName: res.data.companyName,
          logoUrl: res.data.logoUrl,
          loading: false,
        });
        return true;
      }
      set({ loading: false });
      return false;
    } catch (err) {
      console.error("Failed to update settings:", err);
      set({ loading: false });
      return false;
    }
  },
}));
