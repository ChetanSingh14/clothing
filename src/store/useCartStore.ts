import { create } from "zustand";

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number, color: string, size: string) => void;
  updateQuantity: (productId: number, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  loadCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  setIsOpen: (open) => set({ isOpen: open }),

  loadCart: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flowbox_cart");
      if (stored) {
        try {
          set({ items: JSON.parse(stored) });
        } catch (_) {
          localStorage.removeItem("flowbox_cart");
        }
      }
    }
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
      localStorage.setItem("flowbox_cart", JSON.stringify(updatedItems));
    }
  },

  removeItem: (productId, color, size) => {
    const { items } = get();
    const updatedItems = items.filter(
      (i) => !(i.productId === productId && i.color === color && i.size === size)
    );
    set({ items: updatedItems });
    if (typeof window !== "undefined") {
      localStorage.setItem("flowbox_cart", JSON.stringify(updatedItems));
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
      localStorage.setItem("flowbox_cart", JSON.stringify(updatedItems));
    }
  },

  clearCart: () => {
    set({ items: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem("flowbox_cart");
    }
  },

  getCartTotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCartCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
