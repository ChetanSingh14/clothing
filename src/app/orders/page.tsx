"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Package, Clock, CheckCircle2, XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "@/components/PageLoader";
import MediaRenderer from "@/components/MediaRenderer";
import Link from "next/link";
import { useAlertStore } from "@/store/useAlertStore";
import { formatColor } from "@/utils/color";

const getStepIndex = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("deliver")) return 4;
  if (s.includes("out for delivery")) return 3;
  if (s.includes("transit") || s.includes("ship")) return 2;
  if (s.includes("pick") || s.includes("dispatch")) return 1;
  return 0; // Booked
};

const getStepDate = (stepIdx: number, history: any[], status: string) => {
  if (!history || !Array.isArray(history)) return null;
  
  // Delivered is the 5th step (index 4)
  if (stepIdx === 4) {
    const ev = history.find(h => (h.message || h.status_code || "").toLowerCase().includes("deliver"));
    return ev ? ev.event_time || ev.created_at : null;
  }
  // Out for Delivery is the 4th step (index 3)
  if (stepIdx === 3) {
    const ev = history.find(h => (h.message || h.status_code || "").toLowerCase().includes("out for delivery"));
    return ev ? ev.event_time || ev.created_at : null;
  }
  // In Transit is the 3rd step (index 2)
  if (stepIdx === 2) {
    const ev = history.find(h => {
      const msg = (h.message || h.status_code || "").toLowerCase();
      return msg.includes("transit") || msg.includes("shipped");
    });
    return ev ? ev.event_time || ev.created_at : null;
  }
  // Picked Up is the 2nd step (index 1)
  if (stepIdx === 1) {
    const ev = history.find(h => {
      const msg = (h.message || h.status_code || "").toLowerCase();
      return msg.includes("pick") || msg.includes("dispatch") || msg.includes("manifest");
    });
    return ev ? ev.event_time || ev.created_at : null;
  }
  // Booked is the 1st step (index 0)
  if (stepIdx === 0) {
    if (history.length > 0) {
      const lastEv = history[history.length - 1]; // First event chronologically
      return lastEv.event_time || lastEv.created_at;
    }
  }
  return null;
};

export default function OrdersPage() {
  const { user, fetchMe, initialized } = useAuthStore();
  const { orders, loading, fetchMyOrders, cancelOrder, returnOrder, trackNimbusOrder } = useOrderStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<any>(null);
  const [pickupAddressType, setPickupAddressType] = useState<"same" | "different">("same");
  const [customPickupAddress, setCustomPickupAddress] = useState("");
  const [sizeChangeNotes, setSizeChangeNotes] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

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

    if (!sizeChangeNotes.trim()) {
      alert("Please specify the size changes you need.");
      return;
    }

    const baseAddress = pickupAddressType === "same"
      ? `${selectedOrderForReturn.address || ""}, ${selectedOrderForReturn.landmark ? selectedOrderForReturn.landmark + ", " : ""}${selectedOrderForReturn.city || ""}, ${selectedOrderForReturn.state || ""} - ${selectedOrderForReturn.pincode || ""}`
      : customPickupAddress.trim();

    if (pickupAddressType === "different" && !baseAddress) {
      alert("Please provide the pickup address.");
      return;
    }

    const finalAddress = `Pickup Address: ${baseAddress} | Size Changes: ${sizeChangeNotes.trim()}`;

    const success = await returnOrder(selectedOrderForReturn.id, finalAddress);
    if (success) {
      setSelectedOrderForReturn(null);
      setPickupAddressType("same");
      setCustomPickupAddress("");
      setSizeChangeNotes("");
      useAlertStore.getState().showAlert("Exchange request filed successfully!");
    } else {
      alert("Failed to submit exchange request.");
    }
  };

  const handleTrackOrder = async (orderId: number) => {
    const info = await trackNimbusOrder(orderId);
    if (info) {
      setTrackingInfo(info);
      setIsTrackingModalOpen(true);
    } else {
      useAlertStore.getState().showAlert("Could not fetch tracking information.");
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
                          Exchange Size
                        </button>
                      )}
                      {order.nimbuspostAwb && (
                        <button 
                          onClick={() => handleTrackOrder(order.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          Track Order
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
                        <p className="text-[10px] text-brand-green font-semibold mt-2">✓ Eligible for 5 Days easy size exchange (no returns).</p>
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

      {/* Size Exchange Request Modal */}
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
                Exchanges are permitted within 5 days of delivery for size changes only. No returns or refunds are allowed. Please select the pickup address and specify the required size changes.
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

                <div className="pt-4 border-t border-brand-charcoal/5">
                  <label className="block text-xs font-semibold text-brand-charcoal mb-2">Required Size Changes *</label>
                  <textarea
                    rows={2}
                    value={sizeChangeNotes}
                    onChange={(e) => setSizeChangeNotes(e.target.value)}
                    placeholder="Specify the items and sizes you need to change (e.g. Change M to L)"
                    className="w-full rounded-xl border border-brand-charcoal/10 bg-white p-3 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-charcoal/5">
                <button
                  onClick={() => {
                    setSelectedOrderForReturn(null);
                    setPickupAddressType("same");
                    setCustomPickupAddress("");
                    setSizeChangeNotes("");
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
        {isTrackingModalOpen && trackingInfo && (() => {
          const currentStep = getStepIndex(trackingInfo.status);
          const isCancelled = (trackingInfo.status || "").toLowerCase().includes("cancel") || 
            (orders.find(o => o.nimbuspostAwb === trackingInfo.awb_number)?.status === "CANCELLED");
          
          const steps = [
            { label: "Order Booked", desc: "Your order has been registered in our system." },
            { label: "Picked Up", desc: "Shipment picked up by courier partner." },
            { label: "In Transit", desc: "Your package is on its way to the destination." },
            { label: "Out for Delivery", desc: "The package is out for delivery in your local area." },
            { label: "Delivered", desc: "Order has been successfully delivered." }
          ];

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-brand-bg border border-brand-charcoal/10 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto text-brand-charcoal"
              >
                <div className="flex justify-between items-center mb-6 border-b border-brand-charcoal/5 pb-4">
                  <h3 className="text-lg font-serif font-semibold text-brand-charcoal">
                    Tracking Details
                  </h3>
                  <button
                    onClick={() => setIsTrackingModalOpen(false)}
                    className="text-brand-charcoal/50 hover:text-brand-charcoal"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="grid grid-cols-2 gap-4 text-xs border-b border-brand-charcoal/5 pb-4 mb-6">
                    <div>
                      <span className="block text-[9px] uppercase text-brand-charcoal/40 font-bold mb-0.5">AWB Number</span>
                      <span className="font-semibold">{trackingInfo.awb_number}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-brand-charcoal/40 font-bold mb-0.5">Status</span>
                      <span className={`font-bold uppercase ${isCancelled ? 'text-rose-500' : 'text-brand-green'}`}>
                        {isCancelled ? 'CANCELLED' : trackingInfo.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[9px] uppercase text-brand-charcoal/40 font-bold mb-0.5">Courier</span>
                      <span className="font-semibold">{trackingInfo.courier_name || "Assigned Partner"}</span>
                    </div>
                  </div>

                  {isCancelled && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 mb-6">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                      <span>This shipment has been cancelled. Please contact support if you need further help.</span>
                    </div>
                  )}

                  {/* Stepper */}
                  <div className="relative border-l border-brand-charcoal/10 pl-6 ml-3 space-y-8 my-4">
                    {steps.map((step, idx) => {
                      const isCompleted = idx < currentStep && !isCancelled;
                      const isActive = idx === currentStep && !isCancelled;
                      const stepDate = getStepDate(idx, trackingInfo.history, trackingInfo.status);

                      return (
                        <div key={idx} className="relative">
                          {/* Step Icon Node */}
                          <div className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all ${
                            isCompleted 
                              ? "bg-brand-green border-brand-green text-white"
                              : isActive
                              ? "bg-brand-charcoal border-brand-charcoal text-white animate-pulse"
                              : "bg-white border-brand-charcoal/20 text-brand-charcoal/40"
                          }`}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>

                          {/* Step Content */}
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-brand-charcoal" : "text-brand-charcoal/80"}`}>
                              {step.label}
                            </h4>
                            <p className="text-[11px] text-brand-charcoal/50 mt-0.5 font-light leading-relaxed">{step.desc}</p>
                            {stepDate && (
                              <time className="text-[9px] text-brand-charcoal/40 bg-brand-charcoal/5 px-2 py-0.5 rounded font-mono inline-block mt-1.5">
                                {new Date(stepDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                              </time>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Raw History dropdown for detailed updates */}
                  {trackingInfo.history && trackingInfo.history.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-brand-charcoal/5">
                      <details className="group cursor-pointer">
                        <summary className="flex justify-between items-center text-xs font-semibold text-brand-charcoal select-none list-none">
                          <span>View Detailed Scans History</span>
                          <span className="transition-transform group-open:rotate-180 text-[10px]">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4 pt-2">
                          {trackingInfo.history.map((hist: any, index: number) => (
                            <div key={index} className="flex gap-4 items-start text-xs border-b border-brand-charcoal/5 pb-3 last:border-0 last:pb-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-charcoal/20 mt-1.5 flex-shrink-0" />
                              <div className="flex-grow">
                                <div className="font-semibold text-brand-charcoal">{hist.message || hist.status_code}</div>
                                <div className="text-[10px] text-brand-charcoal/50 mt-0.5 font-light">{hist.location || "Location not specified"}</div>
                                <time className="text-[9px] text-brand-charcoal/40 font-mono mt-1 block">{hist.event_time}</time>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartDrawer />
    </div>
  );
}
