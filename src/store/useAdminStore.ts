import { create } from "zustand";
import { apiFetch } from "@/utils/api";

interface AdminStats {
  totalProducts: number;
  totalReviews: number;
  totalUsers: number;
  totalCategories: number;
  averageRating: number;
  totalOrders: number;
  totalRevenue: number;
}

interface AdminState {
  stats: AdminStats | null;
  users: any[];
  orders: any[];
  reviews: any[];
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchReviews: () => Promise<void>;
  deleteReview: (id: number) => Promise<boolean>;
  uploadProductImage: (base64Image: string) => Promise<string | null>;
  createProduct: (data: {
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    colors: string[];
    sizes: string[];
  }) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  updateProduct: (id: number, data: any) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  users: [],
  orders: [],
  reviews: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch("/products/admin/dashboard");
      if (res.success && res.data) {
        set({ stats: res.data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load admin stats", loading: false });
    }
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch("/products/admin/users");
      if (res.success && res.data) {
        set({ users: res.data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load admin users", loading: false });
    }
  },

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch("/orders/admin");
      if (res.success && res.data) {
        set({ orders: res.data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load admin orders", loading: false });
    }
  },

  fetchReviews: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch("/products/admin/reviews");
      if (res.success && res.data) {
        set({ reviews: res.data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load admin reviews", loading: false });
    }
  },

  deleteReview: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/products/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchReviews();
        await get().fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || "Failed to delete review", loading: false });
      return false;
    }
  },

  uploadProductImage: async (base64Image) => {
    try {
      const res = await apiFetch("/products/admin/upload", {
        method: "POST",
        body: JSON.stringify({ image: base64Image }),
      });
      if (res.success && res.url) {
        return res.url;
      }
      return null;
    } catch (err) {
      console.error("Failed to upload image:", err);
      return null;
    }
  },

  createProduct: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch("/products/admin", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || "Failed to create product", loading: false });
      return false;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/products/admin/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || "Failed to delete product", loading: false });
      return false;
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/products/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || "Failed to update product", loading: false });
      return false;
    }
  },
}));
