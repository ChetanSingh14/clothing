"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAlertStore } from "@/store/useAlertStore";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import MediaRenderer from "./MediaRenderer";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { useState, useEffect } from "react";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal, clearCart, checkout } = useCartStore();
  const { user, fetchMe } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address">("cart");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    pincode: "",
    state: "",
    city: "",
  });

  useEffect(() => {
    if (user) {
      setAddressDetails({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        landmark: user.landmark || "",
        pincode: user.pincode || "",
        state: user.state || "",
        city: user.city || "",
      });
      if (user.address && user.phone && user.pincode) {
        setIsEditingAddress(false);
      } else {
        setIsEditingAddress(true);
      }
    }
  }, [user]);

  // Reset to cart step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setCheckoutStep("cart"), 300); // Wait for exit animation
    }
  }, [isOpen]);

  const handleCheckout = async () => {
    // Basic validation
    if (!addressDetails.fullName || !addressDetails.phone || !addressDetails.address || !addressDetails.pincode) {
       useAlertStore.getState().showAlert("Please fill in all required address fields.");
       return;
    }

    if (user) {
      try {
        const { apiFetch } = await import("@/utils/api");
        await apiFetch("/user/profile", {
          method: "PUT",
          body: JSON.stringify({
            name: addressDetails.fullName,
            phone: addressDetails.phone,
            address: addressDetails.address,
            landmark: addressDetails.landmark,
            pincode: addressDetails.pincode,
            state: addressDetails.state,
            city: addressDetails.city
          })
        });
        await fetchMe();
      } catch (error) {
        console.error("Failed to save address to user profile:", error);
      }
    }

    const success = await checkout(paymentMethod, addressDetails);
    if (success) {
      useAlertStore.getState().showAlert("Thank you for your order! Your garments are recorded in the system and being prepared for dispatch.");
      clearCart();
      setIsOpen(false);
    } else {
      useAlertStore.getState().showAlert("Checkout failed. Please ensure you have items in your bag and are logged in.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-brand-charcoal/30 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-brand-bg shadow-2xl border-l border-brand-charcoal/5 flex flex-col h-full"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-brand-charcoal/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {checkoutStep === "address" ? (
                    <button 
                      onClick={() => setCheckoutStep("cart")}
                      className="p-1 -ml-1 mr-1 rounded-full hover:bg-brand-charcoal/5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-5 w-5 text-brand-charcoal" />
                    </button>
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-brand-charcoal" />
                  )}
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    {checkoutStep === "address" ? "Shipping Details" : "Shopping Bag"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-brand-charcoal/40 hover:text-brand-charcoal hover:bg-brand-charcoal/5 transition-all duration-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {checkoutStep === "cart" ? (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="h-16 w-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="h-7 w-7 text-brand-charcoal/40" />
                    </div>
                    <h3 className="font-semibold text-brand-charcoal font-serif">Your bag is empty</h3>
                    <p className="text-xs text-brand-charcoal/50 max-w-[200px] mt-1 font-light">
                      Add some items from our catalog to get started.
                    </p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className="flex gap-4 p-3 rounded-2xl bg-brand-gray/50 border border-brand-charcoal/5"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative h-20 w-18 rounded-xl overflow-hidden bg-brand-gray border border-brand-charcoal/5 flex-shrink-0">
                        <MediaRenderer
                          src={item.image}
                          alt={item.title}
                          className="object-cover h-full w-full"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="text-sm font-semibold text-brand-charcoal leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-brand-charcoal/50 tracking-wide mt-0.5 capitalize">
                            Size: {item.size} / Color:{" "}
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full border border-brand-charcoal/10 align-middle ml-1"
                              style={{ backgroundColor: item.color }}
                            />
                          </p>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-brand-charcoal/10 rounded-full bg-brand-bg py-0.5 px-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                              className="p-1 hover:text-brand-green transition-colors cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-semibold px-2 min-w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                              className="p-1 hover:text-brand-green transition-colors cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.productId, item.color, item.size)}
                            className="p-1.5 text-brand-charcoal/30 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-sm font-bold text-brand-charcoal self-center font-serif">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer Summary */}
              {items.length > 0 && (
                <div className="px-6 py-6 border-t border-brand-charcoal/5 bg-brand-gray/30 space-y-4">
                  <div className="flex items-center justify-between text-brand-charcoal">
                    <span className="text-sm font-medium tracking-wide">Subtotal</span>
                    <span className="text-lg font-bold font-serif">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-2 border-t border-brand-charcoal/5">
                    <label className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-2.5 text-xs focus:border-brand-green focus:outline-none cursor-pointer"
                    >
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="CARD">Credit / Debit Card (Soon)</option>
                    </select>
                  </div>

                  <p className="text-[10px] text-brand-charcoal/40 font-light leading-relaxed">
                    Shipping & taxes calculated at checkout. Custom garment adjustments are free of charge. <br />
                    <span className="font-semibold text-brand-green mt-1 block">✓ 7 Days easy return policy on all delivered orders.</span>
                  </p>
                  <button
                    onClick={() => setCheckoutStep("address")}
                    className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-4 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
              </>
              ) : (
                <div className="flex-1 overflow-y-auto flex flex-col">
                  <div className="flex-1 p-6 space-y-4">
                    <p className="text-xs text-brand-charcoal/60 mb-2">Please confirm your shipping details.</p>
                    
                    {!isEditingAddress ? (
                      <div className="bg-brand-gray/30 p-4 rounded-xl border border-brand-charcoal/10 relative">
                        <button 
                          onClick={() => setIsEditingAddress(true)}
                          className="absolute top-4 right-4 text-[10px] font-bold uppercase text-brand-charcoal underline hover:text-brand-green"
                        >
                          Edit
                        </button>
                        <h3 className="text-[10px] font-bold uppercase text-brand-charcoal/50 mb-2">Delivering To:</h3>
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">{addressDetails.fullName}</p>
                          <p>{addressDetails.address}</p>
                          {addressDetails.landmark && <p>Landmark: {addressDetails.landmark}</p>}
                          <p>{addressDetails.city}, {addressDetails.state} - {addressDetails.pincode}</p>
                          <p className="pt-2 text-xs text-brand-charcoal/60 flex items-center gap-1">
                            <span className="font-semibold">Ph:</span> {addressDetails.phone}
                          </p>
                        </div>
                      </div>
                    ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Full Name *</label>
                        <input type="text" value={addressDetails.fullName} onChange={e => setAddressDetails({...addressDetails, fullName: e.target.value})} className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Email</label>
                          <input type="email" value={addressDetails.email} onChange={e => setAddressDetails({...addressDetails, email: e.target.value})} className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Phone *</label>
                          <input type="tel" value={addressDetails.phone} onChange={e => setAddressDetails({...addressDetails, phone: e.target.value})} className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Address *</label>
                        <textarea value={addressDetails.address} onChange={e => setAddressDetails({...addressDetails, address: e.target.value})} rows={2} className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Landmark</label>
                        <input type="text" value={addressDetails.landmark} onChange={e => setAddressDetails({...addressDetails, landmark: e.target.value})} className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">City</label>
                          <input type="text" value={addressDetails.city} onChange={e => setAddressDetails({...addressDetails, city: e.target.value})} className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">State</label>
                          <input type="text" value={addressDetails.state} onChange={e => setAddressDetails({...addressDetails, state: e.target.value})} className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Pincode *</label>
                          <input type="text" value={addressDetails.pincode} onChange={e => setAddressDetails({...addressDetails, pincode: e.target.value})} className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none" />
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                  
                  <div className="px-6 py-6 border-t border-brand-charcoal/5 bg-brand-gray/30 space-y-4">
                    <div className="flex items-center justify-between text-brand-charcoal">
                      <span className="text-sm font-medium tracking-wide">Total to Pay</span>
                      <span className="text-lg font-bold font-serif">₹{getCartTotal().toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-4 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 cursor-pointer"
                    >
                      Confirm Booking ({paymentMethod})
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
