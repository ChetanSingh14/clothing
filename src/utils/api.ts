import { useAuthStore } from "@/store/useAuthStore";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const API_URL ="https://apis.mdfkclothing.com/api/v1";
// const API_URL ="http://localhost:4000/api/v1";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  console.log("SENDING TOKEN:", token);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (response.status === 401 && endpoint !== "/auth/logout" && token) {
    // Only act on 401 if user was actually logged in (had a token).
    // Public pages (products, about, contact) are accessible without auth —
    // unauthenticated 401s from endpoints like wishlist should just throw, not redirect.
    const { useCartStore } = await import("@/store/useCartStore");
    useCartStore.getState().clearCart();
    useAuthStore.setState({ user: null, token: null, error: null });

    // Only redirect if not already on homepage to prevent reload loops
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.href = "/";
    }
    throw new Error(data.message || "Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};
