import { create } from "zustand";
import { apiFetch } from "@/utils/api";
import { useAlertStore } from "@/store/useAlertStore";

export interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  productId: number;
  createdAt: string;
}

export interface ProductItem {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  maleColors?: string[];
  femaleColors?: string[];
  maleSizes?: string[];
  femaleSizes?: string[];
  rating: number;
  createdAt: string;
  reviews?: ProductReview[];
  modelUrl?: string;
}

interface ProductState {
  products: ProductItem[];
  wishlist: ProductItem[];
  selectedCategory: string;
  activeProduct: ProductItem | null;
  loading: boolean;
  wishlistLoading: boolean;
  error: string | null;
  fetchProducts: (category?: string) => Promise<void>;
  fetchProductDetails: (id: number) => Promise<ProductItem | null>;
  setSelectedCategory: (cat: string) => void;
  submitReview: (productId: number, userName: string, rating: number, comment: string) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  togglingWishlistId: number | null;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  wishlist: [],
  selectedCategory: "All",
  activeProduct: null,
  loading: false,
  wishlistLoading: false,
  error: null,

  setSelectedCategory: (cat) => {
    set({ selectedCategory: cat });
    get().fetchProducts(cat === "All" ? undefined : cat);
  },

  fetchProducts: async (category) => {
    set({ loading: true, error: null });
    try {
      const endpoint = category ? `/products?category=${encodeURIComponent(category)}` : "/products";
      const res = await apiFetch(endpoint);
      if (res.success && res.data) {
        set({ products: res.data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch products", loading: false });
    }
  },

  fetchProductDetails: async (id) => {
    set({ loading: true, error: null, activeProduct: null });
    try {
      const res = await apiFetch(`/products/${id}`);
      if (res.success && res.data) {
        set({ activeProduct: res.data, loading: false });
        return res.data;
      }
      set({ loading: false });
      return null;
    } catch (err: any) {
      set({ error: err.message || "Failed to load product details", loading: false });
      return null;
    }
  },

  submitReview: async (productId, userName, rating, comment) => {
    try {
      const res = await apiFetch(`/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ userName, rating, comment }),
      });
      if (res.success && res.data) {
        await get().fetchProductDetails(productId);
        await get().fetchProducts(get().selectedCategory === "All" ? undefined : get().selectedCategory);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to submit review:", err);
      return false;
    }
  },

  fetchWishlist: async () => {
    set({ wishlistLoading: true });
    try {
      const res = await apiFetch("/wishlist");
      if (res.success && res.data) {
        set({ wishlist: res.data });
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      set({ wishlistLoading: false });
    }
  },

  togglingWishlistId: null,

  toggleWishlist: async (productId) => {
    const { wishlist, togglingWishlistId } = get();
    if (togglingWishlistId === productId) return false;
    
    set({ togglingWishlistId: productId });
    const isWishlisted = wishlist.some(p => p.id === productId);
    
    // Optimistic removal to make UI feel instant on Wishlist page
    if (isWishlisted) {
      set({ wishlist: wishlist.filter(p => p.id !== productId) });
    }

    try {
      const res = await apiFetch(`/wishlist/${productId}`, {
        method: "POST",
      });
      if (res.success) {
        // Fetch in background to sync state (especially for additions)
        get().fetchWishlist();
        set({ togglingWishlistId: null });
        return true;
      }
      // Revert if failed
      if (isWishlisted) {
        set({ wishlist });
      }
      set({ togglingWishlistId: null });
      return false;
    } catch (err: any) {
      console.error("Failed to toggle wishlist:", err);
      // Suppress UI crash but inform user
      if (typeof window !== "undefined") {
        useAlertStore.getState().showAlert("Action failed due to server error. Please try again later.");
      }
      if (isWishlisted) {
        set({ wishlist });
      }
      set({ togglingWishlistId: null });
      return false;
    }
  },
}));
