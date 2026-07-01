import { apiFetch } from "@/utils/api";
import { create } from "zustand";


export interface OrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

export interface OrderData {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

interface OrderState {
  orders: OrderData[];
  loading: boolean;
  fetchMyOrders: () => Promise<void>;
  cancelOrder: (orderId: number) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,

  fetchMyOrders: async () => {
    set({ loading: true });
    try {
      const res = await apiFetch("/orders/my-orders");
      if (res.success) {
        set({ orders: res.data });
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      set({ loading: false });
    }
  },

  cancelOrder: async (orderId: number) => {
    set({ loading: true });
    try {
      const res = await apiFetch(`/orders/${orderId}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.success) {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to cancel order:", err);
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
