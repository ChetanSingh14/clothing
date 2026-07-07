"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Package, Clock, CheckCircle2, XCircle, ArrowLeft, RotateCcw, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "@/components/PageLoader";
import MediaRenderer from "@/components/MediaRenderer";
import Link from "next/link";
import { useAlertStore } from "@/store/useAlertStore";
import { formatColor } from "@/utils/color";

export default function OrdersPage() {
  const { user, fetchMe, initialized } = useAuthStore();
  const { orders, loading, fetchMyOrders, cancelOrder, returnOrder } = useOrderStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<any>(null);
  const [pickupAddressType, setPickupAddressType] = useState<"same" | "different">("same");
  const [customPickupAddress, setCustomPickupAddress] = useState("");
  
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [trackingDetails, setTrackingDetails] = useState<any>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

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
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case "RETURN_PENDING":
        return <Clock className="h-5 w-5 text-indigo-500" />;
      case "RETURNED":
        return <RotateCcw className="h-5 w-5 text-brand-charcoal/50" />;
      default:
        return <Package className="h-5 w-5 text-brand-charcoal/50" />;
    }
  };

  const canReturn = (order: any) => {
    if (order.status !== "DELIVERED") return false;
    const refDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.createdAt);
    const diffTime = Math.abs(new Date().getTime() - refDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 5;
  };

  const handleProceedReturn = async () => {
    if (!selectedOrderForReturn) return;
    const finalAddress = pickupAddressType === "same"
      ? `${selectedOrderForReturn.address || ""}, ${selectedOrderForReturn.landmark ? selectedOrderForReturn.landmark + ", " : ""}${selectedOrderForReturn.city || ""}, ${selectedOrderForReturn.state || ""} - ${selectedOrderForReturn.pincode || ""}`
      : customPickupAddress.trim();

    if (pickupAddressType === "different" && !finalAddress) {
      alert("Please provide the pickup address.");
      return;
    }

    const success = await returnOrder(selectedOrderForReturn.id, finalAddress);
    if (success) {
      setSelectedOrderForReturn(null);
      setPickupAddressType("same");
      setCustomPickupAddress("");
      useAlertStore.getState().showAlert("Exchange request filed successfully!");
    } else {
      alert("Failed to submit exchange request.");
    }
  };

  const handleTrackOrder = async (order: any) => {
    setTrackingOrder(order);
    setLoadingTracking(true);
    setTrackingDetails(null);
    try {
      const { apiFetch } = await import("@/utils/api");
      const res = await apiFetch(`/orders/${order.id}/track`);
      if (res.success && res.data) {
        setTrackingDetails(res.data);
      } else {
        setTrackingDetails({ error: res.message || "Failed to load tracking data" });
      }
    } catch (err: any) {
      setTrackingDetails({ error: err.message || "Failed to load tracking data" });
    } finally {
      setLoadingTracking(false);
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

          {!initialized ? (
            <PageLoader />
          ) : !user ? (
            <div className="bg-brand-gray/30 rounded-3xl p-12 text-center border border-brand-charcoal/5">
              <h3 className="text-lg font-serif font-semibold text-brand-charcoal">Please log in to view your orders.</h3>
            </div>
          ) : loading ? (
            <PageLoader />
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
                          {order.status === "RETURN_PENDING" ? "Exchange Pending" : order.status === "RETURNED" ? "Exchanged" : order.status}
                        </span>
                      </div>
                      
                      {order.awbNumber && (
                        <button 
                          onClick={() => handleTrackOrder(order)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                        >
                          Track Order
                        </button>
                      )}

                      {order.status === "BOOKED" && (
                        <button 
                          onClick={() => {
                            useAlertStore.getState().showConfirm("Are you sure you want to cancel this order?", async () => {
                              await cancelOrder(order.id);
                            });
                          }}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      
                      {canReturn(order) && (
                        <button 
                          onClick={() => setSelectedOrderForReturn(order)}
                          className="text-xs font-semibold text-brand-green hover:text-brand-green-dark underline cursor-pointer"
                        >
                          Exchange Order
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-brand-gray border border-brand-charcoal/5 flex-shrink-0">
                          {item.image && <MediaRenderer src={item.image} alt={item.title} className="object-cover h-full w-full" />}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-semibold text-brand-charcoal">{item.title}</h4>
                          <p className="text-[11px] text-brand-charcoal/60 capitalize mt-0.5">
                            Size: {item.size} • Color:{" "}
                            {item.color.includes("M:") ? (
                              <span className="font-semibold text-brand-charcoal/80 lowercase">{formatColor(item.color)}</span>
                            ) : (
                              <>
                                <span className="font-semibold text-brand-charcoal/80 lowercase">{formatColor(item.color)}</span>
                                <span className="inline-block w-2.5 h-2.5 rounded-full border border-brand-charcoal/20 align-middle ml-1" style={{ backgroundColor: item.color }} />
                              </>
                            )}
                          </p>
                          <p className="text-xs font-medium text-brand-charcoal mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-bold font-serif text-brand-charcoal">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-brand-charcoal/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs text-brand-charcoal/60 uppercase tracking-wider font-semibold">Payment Method</p>
                      <p className="text-sm font-medium text-brand-charcoal mt-0.5">{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</p>
                      {order.status === "DELIVERED" && (
                        <p className="text-[10px] text-brand-green font-semibold mt-2">✓ Eligible for 5 Days easy size exchange.</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-brand-charcoal/60 uppercase tracking-wider font-semibold">Total Amount</p>
                      <p className="text-2xl font-bold font-serif text-brand-charcoal mt-0.5">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Return Request Modal */}
      <AnimatePresence>
        {selectedOrderForReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-bg border border-brand-charcoal/10 max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <h3 className="text-lg font-serif font-semibold text-brand-charcoal mb-4">
                Request Size Exchange for Order #{selectedOrderForReturn.id}
              </h3>
              <p className="text-xs text-brand-charcoal/60 mb-6 leading-relaxed">
                Exchanges are permitted within 5 days of delivery for size issues only. Please select the pickup address for your package.
              </p>

              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pickupAddress"
                    checked={pickupAddressType === "same"}
                    onChange={() => setPickupAddressType("same")}
                    className="mt-0.5 accent-brand-charcoal"
                  />
                  <div>
                    <span className="text-xs font-semibold text-brand-charcoal">Pickup from delivery address</span>
                    <p className="text-[11px] text-brand-charcoal/50 mt-1 font-light">
                      {selectedOrderForReturn.address || "No address specified"}, {selectedOrderForReturn.landmark ? selectedOrderForReturn.landmark + ", " : ""}{selectedOrderForReturn.city || ""}, {selectedOrderForReturn.state || ""} - {selectedOrderForReturn.pincode || ""}
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pickupAddress"
                    checked={pickupAddressType === "different"}
                    onChange={() => setPickupAddressType("different")}
                    className="mt-0.5 accent-brand-charcoal"
                  />
                  <div className="flex-grow">
                    <span className="text-xs font-semibold text-brand-charcoal">Pickup from a different address</span>
                    {pickupAddressType === "different" && (
                      <textarea
                        rows={3}
                        value={customPickupAddress}
                        onChange={(e) => setCustomPickupAddress(e.target.value)}
                        placeholder="Enter the complete pickup address, landmark, city, state, and pincode..."
                        className="w-full mt-2 rounded-xl border border-brand-charcoal/10 bg-white p-3 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none resize-none"
                      />
                    )}
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-charcoal/5">
                <button
                  onClick={() => {
                    setSelectedOrderForReturn(null);
                    setPickupAddressType("same");
                    setCustomPickupAddress("");
                  }}
                  className="px-4 py-2 border border-brand-charcoal/10 rounded-xl text-xs font-semibold text-brand-charcoal/70 hover:bg-brand-charcoal/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedReturn}
                  className="px-5 py-2 bg-brand-charcoal text-brand-bg rounded-xl text-xs font-semibold hover:bg-black transition-colors shadow-sm cursor-pointer"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-bg border border-brand-charcoal/10 max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <h3 className="text-lg font-serif font-semibold text-brand-charcoal mb-2">
                Tracking Order #{trackingOrder.id}
              </h3>
              <p className="text-xs text-brand-charcoal/50 mb-4">
                AWB: <span className="font-semibold text-brand-charcoal">{trackingOrder.awbNumber}</span> ({trackingOrder.courierName})
              </p>

              <div className="flex-grow overflow-y-auto space-y-4 pr-1 my-2">
                {loadingTracking ? (
                  <p className="text-xs text-brand-charcoal/50 italic py-8 text-center">Fetching live updates from Shipmozo...</p>
                ) : trackingDetails?.error ? (
                  <p className="text-xs text-rose-500 py-4 text-center">{trackingDetails.error}</p>
                ) : trackingDetails ? (
                  <div className="space-y-6">
                    <div className="bg-brand-gray/30 p-4 rounded-2xl border border-brand-charcoal/5">
                      <p className="text-xs font-semibold text-brand-charcoal">Status: <span className="text-brand-green font-bold uppercase">{trackingDetails.current_status || "In Transit"}</span></p>
                      {trackingDetails.expected_delivery_date && (
                        <p className="text-[10px] text-brand-charcoal/50 mt-1">Expected Delivery: {trackingDetails.expected_delivery_date}</p>
                      )}
                    </div>

                    <div className="space-y-4 relative border-l border-brand-charcoal/10 ml-3 pl-5 py-1">
                      {Array.isArray(trackingDetails.scan_detail) && trackingDetails.scan_detail.length > 0 ? (
                        trackingDetails.scan_detail.map((scan: any, i: number) => (
                          <div key={i} className="relative text-xs">
                            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-brand-green border-2 border-white shadow-sm" />
                            <p className="font-semibold text-brand-charcoal">{scan.status || scan.activity}</p>
                            <p className="text-[10px] text-brand-charcoal/50 mt-0.5">{scan.location} • {scan.date || scan.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="relative text-xs">
                          <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-brand-green border-2 border-white shadow-sm" />
                          <p className="font-semibold text-brand-charcoal">Order Registered</p>
                          <p className="text-[10px] text-brand-charcoal/50 mt-0.5">Shipment is created and waiting to be picked up by the courier.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-brand-charcoal/50 italic py-8 text-center">No tracking details available.</p>
                )}
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-brand-charcoal/5 mt-4">
                <button
                  onClick={() => {
                    setTrackingOrder(null);
                    setTrackingDetails(null);
                  }}
                  className="px-6 py-2 bg-brand-charcoal text-brand-bg rounded-xl text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartDrawer />
    </div>
  );
}
