"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Package, Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OrdersPage() {
  const { user, fetchMe, initialized } = useAuthStore();
  const { orders, loading, fetchMyOrders, cancelOrder } = useOrderStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (initialized) {
      if (user) {
        fetchMyOrders();
      } else {
        setIsAuthModalOpen(true);
      }
    }
  }, [user, initialized]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "BOOKED":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "DELIVERED":
        return <CheckCircle2 className="h-5 w-5 text-brand-green" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <Package className="h-5 w-5 text-brand-charcoal/50" />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main className="flex-grow py-16 px-6 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <Link href="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-brand-charcoal/50 hover:text-brand-charcoal transition-colors mb-4">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Shop
              </Link>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl font-serif">
                Your Orders
              </h1>
            </div>
          </div>

          {!user ? (
            <div className="bg-brand-gray/30 rounded-3xl p-12 text-center border border-brand-charcoal/5">
              <h3 className="text-lg font-serif font-semibold text-brand-charcoal">Please log in to view your orders.</h3>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-brand-gray/30 rounded-3xl p-12 text-center border border-brand-charcoal/5">
              <Package className="h-10 w-10 text-brand-charcoal/20 mx-auto mb-4" />
              <h3 className="text-lg font-serif font-semibold text-brand-charcoal">No orders found</h3>
              <p className="text-sm text-brand-charcoal/50 mt-2">You haven't placed any orders yet.</p>
              <Link href="/#catalog" className="inline-block mt-6 px-6 py-3 bg-brand-charcoal text-brand-bg rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-charcoal/90 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id} 
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-charcoal/5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-charcoal/5 pb-4 mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">
                        Order #{order.id}
                      </span>
                      <p className="text-xs text-brand-charcoal/60 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-brand-gray px-3 py-1.5 rounded-full">
                        {getStatusIcon(order.status)}
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                          {order.status}
                        </span>
                      </div>
                      
                      {order.status === "BOOKED" && (
                        <button 
                          onClick={async () => {
                            if (confirm("Are you sure you want to cancel this order?")) {
                              await cancelOrder(order.id);
                            }
                          }}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-brand-gray border border-brand-charcoal/5 flex-shrink-0">
                          {item.image && <img src={item.image} alt={item.title} className="object-cover h-full w-full" />}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-semibold text-brand-charcoal">{item.title}</h4>
                          <p className="text-[11px] text-brand-charcoal/60 capitalize mt-0.5">
                            Size: {item.size} • Color: 
                            <span className="inline-block w-2.5 h-2.5 rounded-full border border-brand-charcoal/20 align-middle ml-1" style={{ backgroundColor: item.color }} />
                          </p>
                          <p className="text-xs font-medium text-brand-charcoal mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-bold font-serif text-brand-charcoal">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-brand-charcoal/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs text-brand-charcoal/60 uppercase tracking-wider font-semibold">Payment Method</p>
                      <p className="text-sm font-medium text-brand-charcoal mt-0.5">{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</p>
                      {order.status === "DELIVERED" && (
                        <p className="text-[10px] text-brand-green font-semibold mt-2">✓ Eligible for 7 Days easy return.</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-brand-charcoal/60 uppercase tracking-wider font-semibold">Total Amount</p>
                      <p className="text-2xl font-bold font-serif text-brand-charcoal mt-0.5">${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartDrawer />
    </div>
  );
}
