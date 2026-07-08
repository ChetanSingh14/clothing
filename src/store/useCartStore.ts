import { create } from "zustand";
import { apiFetch } from "@/utils/api";

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

export interface AppliedOffer {
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedOffer: AppliedOffer | null;
  offerLoading: boolean;
  offerError: string | null;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number, color: string, size: string) => void;
  updateQuantity: (productId: number, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getCartTotal: () => number;
  getCartCount: () => number;
  loadCart: () => void;
  checkOfferStatus: () => Promise<void>;
  checkout: (paymentMethod?: string, details?: any) => Promise<boolean>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  appliedOffer: null,
  offerLoading: false,
  offerError: null,

  setIsOpen: (open) => set({ isOpen: open }),

  loadCart: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mdfk_cart");
      if (stored) {
        try {
          set({ items: JSON.parse(stored) });
        } catch (_) {
          localStorage.removeItem("mdfk_cart");
        }
      }
    }
    // Also check offer status when loading cart
    get().checkOfferStatus();
  },

  addItem: (newItem) => {
    const { items } = get();
    const existingIdx = items.findIndex(
      (i) => i.productId === newItem.productId && i.color === newItem.color && i.size === newItem.size
    );

    let updatedItems = [...items];
    if (existingIdx > -1) {
      updatedItems[existingIdx].quantity += 1;
    } else {
      updatedItems.push({ ...newItem, quantity: 1 });
    }

    set({ items: updatedItems });
    if (typeof window !== "undefined") {
      localStorage.setItem("mdfk_cart", JSON.stringify(updatedItems));
    }
  },

  removeItem: (productId, color, size) => {
    const { items } = get();
    const updatedItems = items.filter(
      (i) => !(i.productId === productId && i.color === color && i.size === size)
    );
    set({ items: updatedItems });
    if (typeof window !== "undefined") {
      localStorage.setItem("mdfk_cart", JSON.stringify(updatedItems));
    }
  },

  updateQuantity: (productId, color, size, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, color, size);
      return;
    }
    const { items } = get();
    const updatedItems = items.map((i) =>
      i.productId === productId && i.color === color && i.size === size ? { ...i, quantity } : i
    );
    set({ items: updatedItems });
    if (typeof window !== "undefined") {
      localStorage.setItem("mdfk_cart", JSON.stringify(updatedItems));
    }
  },

  clearCart: () => {
    set({ items: [], appliedOffer: null, offerError: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("mdfk_cart");
    }
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCartTotal: () => {
    const subtotal = get().getSubtotal();
    const { appliedOffer } = get();
    // Assuming minimum order of ₹499 for the offer to apply
    if (appliedOffer && subtotal >= 499) {
      return Math.max(0, subtotal - appliedOffer.discountAmount);
    }
    return subtotal;
  },

  getCartCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  checkOfferStatus: async () => {
    // Only check if user is logged in (we assume they are if we have a token or just try it)
    if (typeof window === "undefined" || !localStorage.getItem("token")) return;
    
    set({ offerLoading: true, offerError: null });
    try {
      const res = await apiFetch("/offer/status");
      
      if (res.success && res.data?.hasOffer) {
        set({ 
          appliedOffer: { discountAmount: res.data.discountAmount }, 
          offerLoading: false, 
          offerError: null 
        });
      } else {
        set({ appliedOffer: null, offerLoading: false });
      }
    } catch (err: any) {
      set({ offerLoading: false, offerError: err.message || "Failed to check offer status" });
    }
  },

  checkout: async (paymentMethod = "COD", details = {}) => {
    const { items, getSubtotal, clearCart, appliedOffer } = get();
    if (items.length === 0) return false;

    const { shippingCharges, codCharges, rtoCharges, ...cleanDetails } = details;

    try {
      const res = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          totalAmount: getSubtotal(), // Send subtotal, backend will validate & apply offer discount
          items: items,
          paymentMethod,
          details: cleanDetails,
          applyOffer: !!appliedOffer,
          shippingCharges: shippingCharges || 0,
          codCharges: codCharges || 0,
          rtoCharges: rtoCharges || 0,
        }),
      });
      if (res.success) {
        clearCart();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Checkout request failed:", err);
      return false;
    }
  },
}));
