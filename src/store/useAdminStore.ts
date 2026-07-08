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
  adminUpdateUser: (id: number, data: any) => Promise<boolean>;
  updateOrderStatus: (id: number, status: string) => Promise<boolean>;
  nimbusShipOrder: (id: number) => Promise<{ success: boolean; message?: string }>;
  nimbusCancelOrder: (id: number) => Promise<{ success: boolean; message?: string }>;
  nimbusTrackOrder: (id: number) => Promise<{ success: boolean; data?: any; message?: string }>;
  exchangeOrders: any[];
  fetchExchangeOrders: () => Promise<void>;
  updateExchangeOrderStatus: (id: number, status: string) => Promise<boolean>;
  nimbusShipExchangeOrder: (id: number) => Promise<{ success: boolean; message?: string }>;
  nimbusCancelExchangeOrder: (id: number) => Promise<{ success: boolean; message?: string }>;
  nimbusTrackExchangeOrder: (id: number) => Promise<{ success: boolean; data?: any; message?: string }>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  users: [],
  orders: [],
  exchangeOrders: [],
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

  adminUpdateUser: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/user/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchUsers();
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || "Failed to update user", loading: false });
      return false;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/orders/admin/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchOrders();
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || "Failed to update order status", loading: false });
      return false;
    }
  },

  nimbusShipOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/orders/admin/${id}/nimbus-ship`, {
        method: "POST",
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchOrders();
        return { success: true, message: res.message || "Shipped with Nimbuspost successfully" };
      }
      return { success: false, message: res.message || "Failed to ship" };
    } catch (err: any) {
      set({ error: err.message || "Failed to ship order", loading: false });
      return { success: false, message: err.message || "Failed to ship order" };
    }
  },

  nimbusCancelOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/orders/admin/${id}/nimbus-cancel`, {
        method: "POST",
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchOrders();
        return { success: true, message: res.message || "Shipment cancelled successfully" };
      }
      return { success: false, message: res.message || "Failed to cancel shipment" };
    } catch (err: any) {
      set({ error: err.message || "Failed to cancel shipment", loading: false });
      return { success: false, message: err.message || "Failed to cancel shipment" };
    }
  },

  nimbusTrackOrder: async (id) => {
    try {
      const res = await apiFetch(`/orders/${id}/nimbus-track`);
      if (res.success) {
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || "Failed to track" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to track shipment" };
    }
  },

  fetchExchangeOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch("/orders/admin/exchanges");
      if (res.success && res.data) {
        set({ exchangeOrders: res.data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load admin exchange orders", loading: false });
    }
  },

  updateExchangeOrderStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/orders/admin/exchanges/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchExchangeOrders();
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || "Failed to update exchange order status", loading: false });
      return false;
    }
  },

  nimbusShipExchangeOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/orders/admin/exchanges/${id}/nimbus-ship`, {
        method: "POST",
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchExchangeOrders();
        return { success: true, message: res.message || "Shipped exchange with Nimbuspost successfully" };
      }
      return { success: false, message: res.message || "Failed to ship exchange" };
    } catch (err: any) {
      set({ error: err.message || "Failed to ship exchange order", loading: false });
      return { success: false, message: err.message || "Failed to ship exchange order" };
    }
  },

  nimbusCancelExchangeOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiFetch(`/orders/admin/exchanges/${id}/nimbus-cancel`, {
        method: "POST",
      });
      if (res.success) {
        set({ loading: false });
        await get().fetchExchangeOrders();
        return { success: true, message: res.message || "Exchange shipment cancelled successfully" };
      }
      return { success: false, message: res.message || "Failed to cancel exchange shipment" };
    } catch (err: any) {
      set({ error: err.message || "Failed to cancel exchange shipment", loading: false });
      return { success: false, message: err.message || "Failed to cancel exchange shipment" };
    }
  },

  nimbusTrackExchangeOrder: async (id) => {
    try {
      const res = await apiFetch(`/orders/admin/exchanges/${id}/nimbus-track`);
      if (res.success) {
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || "Failed to track exchange" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to track exchange shipment" };
    }
  },
}));
