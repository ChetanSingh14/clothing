"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Package, Clock, CheckCircle2, XCircle, ArrowLeft, Truck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PageLoader from "@/components/PageLoader";
import MediaRenderer from "@/components/MediaRenderer";
import Link from "next/link";
import { useAlertStore } from "@/store/useAlertStore";
import { apiFetch } from "@/utils/api";

export default function OrdersPage() {
  const { user, fetchMe, initialized } = useAuthStore();
  const { orders, loading, fetchMyOrders, cancelOrder } = useOrderStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [trackingLoadingAWB, setTrackingLoadingAWB] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, any>>({});
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const handleTrackLiveStatus = async (waybill: string) => {
    if (!waybill) return;
    setTrackingLoadingAWB(waybill);
    setTrackingError(null);
    try {
      const res = await apiFetch(`/shipping/track/${waybill}`);
      if (res.success && res.data) {
        setTrackingData(prev => ({
          ...prev,
          [waybill]: res.data
        }));
      } else {
        setTrackingError("No tracking updates available yet. Please check back later.");
      }
    } catch (err: any) {
      console.error("Failed to query live tracking:", err);
      setTrackingError(err.message || "Failed to load tracking updates.");
    } finally {
      setTrackingLoadingAWB(null);
    }
  };

  const getActiveStep = (status: string): number => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered") || s.includes("dlvd")) return 4;
    if (s.includes("out for delivery") || s.includes("outfordelivery") || s.includes("ud") || s.includes("undelivered")) return 3;
    if (s.includes("in transit") || s.includes("intransit") || s.includes("dispatched") || s.includes("shipped")) return 2;
    if (s.includes("manifested") || s.includes("booked") || s.includes("pending_pickup")) return 1;
    return 1;
  };

  const getTrackingStatus = (waybill: string, orderShipmentStatus: string) => {
    const data = trackingData[waybill];
    if (data && data.ShipmentData && data.ShipmentData[0]?.Shipment?.Status) {
      const statusObj = data.ShipmentData[0].Shipment.Status;
      return {
        status: statusObj.Status || orderShipmentStatus || "pending_pickup",
        instructions: statusObj.Instructions || "",
        dateTime: statusObj.StatusDateTime ? new Date(statusObj.StatusDateTime).toLocaleString() : ""
      };
    }
    return {
      status: orderShipmentStatus || "pending_pickup",
      instructions: "",
      dateTime: ""
    };
  };

  const renderStepper = (waybill: string, orderShipmentStatus: string) => {
    const trackingInfo = getTrackingStatus(waybill, orderShipmentStatus);
    const activeStep = getActiveStep(trackingInfo.status);
    
    const steps = [
      { label: "Booked & Manifested", desc: "AWB Generated & Pending Pickup" },
      { label: "Dispatched", desc: "In Transit with Delhivery" },
      { label: "Out for Delivery", desc: "Arrival at delivery hub" },
      { label: "Delivered", desc: "Handed over to consignee" }
    ];

    return (
      <div className="mt-6 pt-6 border-t border-brand-charcoal/5 space-y-6">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/50">Milestone Stepper</h4>
        
        <div className="relative pl-6 space-y-6 border-l border-brand-charcoal/10 ml-3">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = activeStep > stepNum;
            const isActive = activeStep === stepNum;
            
            return (
              <div key={idx} className="relative">
                <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? "bg-brand-green border-brand-green text-white" 
                    : isActive 
                      ? "bg-brand-bg border-brand-charcoal animate-pulse text-brand-charcoal" 
                      : "bg-brand-bg border-brand-charcoal/20 text-brand-charcoal/20"
                }`}>
                  {isCompleted && (
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                <div>
                  <p className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? "text-brand-charcoal" : isCompleted ? "text-brand-charcoal/80" : "text-brand-charcoal/30"
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-brand-charcoal/40 font-light mt-0.5">
                    {isActive && trackingInfo.dateTime 
                      ? `Updated: ${trackingInfo.dateTime}` 
                      : isActive && trackingInfo.instructions 
                        ? trackingInfo.instructions 
                        : step.desc
                    }
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {trackingData[waybill]?.ShipmentData?.[0]?.Shipment?.Scans && (
          <div className="bg-brand-gray/30 p-4 rounded-2xl border border-brand-charcoal/5">
            <h5 className="text-[9px] font-bold uppercase tracking-wider text-brand-charcoal/50 mb-2">Detailed Scan History</h5>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {trackingData[waybill].ShipmentData[0].Shipment.Scans.map((scanItem: any, scanIdx: number) => {
                const scan = scanItem.Scan;
                return (
                  <div key={scanIdx} className="text-[11px] flex justify-between gap-4 border-b border-brand-charcoal/5 pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-brand-charcoal">{scan.Instructions || scan.StatusDescription || "Scan update"}</p>
                      <p className="text-[9px] text-brand-charcoal/40 mt-0.5">{scan.Location || "Hub Facility"}</p>
                    </div>
                    <div className="text-right text-[9px] text-brand-charcoal/50 whitespace-nowrap">
                      {scan.Date ? new Date(scan.Date).toLocaleString() : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

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
                          {order.status}
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
                            Size: {item.size} • Color: 
                            <span className="inline-block w-2.5 h-2.5 rounded-full border border-brand-charcoal/20 align-middle ml-1" style={{ backgroundColor: item.color }} />
                          </p>
                          <p className="text-xs font-medium text-brand-charcoal mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-bold font-serif text-brand-charcoal">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.delhivery_waybill && (
                    <div className="mt-4 p-4 bg-brand-gray/30 border border-brand-charcoal/5 rounded-2xl flex flex-col justify-between gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-brand-charcoal/60" />
                          <div className="text-xs">
                            <span className="font-semibold text-brand-charcoal/60 uppercase tracking-wider">Tracking (Delhivery)</span>
                            <div className="mt-1 text-brand-charcoal">
                              AWB: <span className="font-semibold">{order.delhivery_waybill}</span> • Status: <span className="font-bold text-brand-green capitalize">{order.shipment_status || "pending_pickup"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleTrackLiveStatus(order.delhivery_waybill!)}
                            disabled={trackingLoadingAWB === order.delhivery_waybill}
                            className="text-xs font-bold uppercase text-brand-charcoal underline hover:text-brand-green transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {trackingLoadingAWB === order.delhivery_waybill ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Loading...
                              </>
                            ) : trackingData[order.delhivery_waybill] ? (
                              "Refresh Tracking"
                            ) : (
                              "Track Live Status"
                            )}
                          </button>
                          <a
                            href={`https://track.delhivery.com/tracking/${order.delhivery_waybill}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold uppercase text-brand-charcoal/40 hover:text-brand-charcoal transition-colors cursor-pointer"
                          >
                            Carrier Link ↗
                          </a>
                        </div>
                      </div>
                      
                      {trackingError && trackingLoadingAWB === order.delhivery_waybill && (
                        <p className="text-[10px] text-rose-500 font-medium italic mt-1">{trackingError}</p>
                      )}
                      
                      {(trackingData[order.delhivery_waybill] || trackingLoadingAWB === order.delhivery_waybill) && (
                        renderStepper(order.delhivery_waybill, order.shipment_status || "pending_pickup")
                      )}
                    </div>
                  )}

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
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartDrawer />
    </div>
  );
}
