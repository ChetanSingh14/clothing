"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAlertStore } from "@/store/useAlertStore";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowLeft, AlertCircle, Tag, CheckCircle } from "lucide-react";
import MediaRenderer from "./MediaRenderer";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { apiFetch } from "@/utils/api";
import { CreditCard, Lock, Loader2 } from "lucide-react";

import { useState, useEffect } from "react";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getSubtotal, getCartTotal, clearCart, checkout, appliedOffer, offerLoading, offerError, checkOfferStatus } = useCartStore();
  const { user, fetchMe, sendPhoneOtp, verifyPhoneOtp } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "payment">("cart");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  // Phone verification state
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpToken, setPhoneOtpToken] = useState("");
  const [phoneVerifyError, setPhoneVerifyError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Delhivery shipping states
  const [isCodAllowed, setIsCodAllowed] = useState(true);
  const [checkingServiceability, setCheckingServiceability] = useState(false);
  const [serviceabilityError, setServiceabilityError] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [codHandlingCharge, setCodHandlingCharge] = useState(0);
  const [fetchingRate, setFetchingRate] = useState(false);

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

  const checkPincodeServiceability = async (pincode: string) => {
    if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
      setIsCodAllowed(true);
      setServiceabilityError("");
      setShippingFee(0);
      setCodHandlingCharge(0);
      return;
    }

    setCheckingServiceability(true);
    setServiceabilityError("");
    try {
      const res = await apiFetch(`/shipping/serviceability?pincode=${pincode}`);
      if (res.success && res.data) {
        const { serviceable, cod } = res.data;
        if (!serviceable) {
          setIsCodAllowed(false);
          setServiceabilityError("Delivery is not available for this pincode.");
          setPaymentMethod("CARD");
          setShippingFee(0);
          setCodHandlingCharge(0);
        } else {
          const isCod = !(cod === "N" || cod === "n");
          if (!isCod) {
            setIsCodAllowed(false);
            setServiceabilityError("Cash on Delivery (COD) is not available for this pincode. Please pay online.");
            setPaymentMethod("CARD");
          } else {
            setIsCodAllowed(true);
            setServiceabilityError("");
          }

          // Fetch real-time rate from backend
          setFetchingRate(true);
          try {
            const quantity = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
            const weight = Math.max(280, quantity * 280);
            const rateRes = await apiFetch(`/shipping/rate?pincode=${pincode}&weight=${weight}&subtotal=${getSubtotal()}`);
            if (rateRes.success && rateRes.data) {
              setShippingFee(rateRes.data.shippingFee);
              setCodHandlingCharge(rateRes.data.codHandlingCharge);
            }
          } catch (rateErr) {
            console.error("Failed to fetch shipping rate:", rateErr);
            // Fallback estimation
            setShippingFee(90);
            setCodHandlingCharge(50);
          } finally {
            setFetchingRate(false);
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to verify pincode serviceability:", err);
      setIsCodAllowed(true);
      setServiceabilityError("");
      setShippingFee(90);
      setCodHandlingCharge(50);
    } finally {
      setCheckingServiceability(false);
    }
  };

  useEffect(() => {
    if (addressDetails.pincode && addressDetails.pincode.length === 6) {
      checkPincodeServiceability(addressDetails.pincode);
    } else {
      setIsCodAllowed(true);
      setServiceabilityError("");
    }
  }, [addressDetails.pincode]);

  // Reset to cart step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setCheckoutStep("cart"), 300); // Wait for exit animation
    }
  }, [isOpen]);

  const completeCheckout = async () => {
    setIsCheckingOut(true);
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
    setIsCheckingOut(false);
    if (success) {
      useAlertStore.getState().showAlert("Thank you for your order! Your garments are recorded in the system and being prepared for dispatch.");
      clearCart();
      setIsOpen(false);
    } else {
      useAlertStore.getState().showAlert("Checkout failed. Please ensure you have items in your bag and are logged in.");
    }
  };

  const handleCheckout = async () => {
    if (!addressDetails.fullName || !addressDetails.phone || !addressDetails.address || !addressDetails.pincode) {
       useAlertStore.getState().showAlert("Please fill in all required address fields.");
       return;
    }

    const isPhoneChanged = addressDetails.phone && addressDetails.phone !== (user?.phone || "");
    if (isPhoneChanged) {
      setIsCheckingOut(true);
      try {
        const res = await sendPhoneOtp();
        if (res.success && res.otpToken) {
          setPhoneOtpToken(res.otpToken);
          setPhoneOtp("");
          setPhoneVerifyError("");
          setIsPhoneModalOpen(true);
        } else {
          useAlertStore.getState().showAlert(res.message || "Failed to send verification OTP");
        }
      } catch (err: any) {
        useAlertStore.getState().showAlert(err.message || "Failed to send verification OTP");
      } finally {
        setIsCheckingOut(false);
      }
      return;
    }

    if (paymentMethod === "CARD") {
      setCheckoutStep("payment");
    } else {
      await completeCheckout();
    }
  };

  const handlePhoneVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneVerifyError("");
    setIsCheckingOut(true);
    try {
      const success = await verifyPhoneOtp(phoneOtp, phoneOtpToken, addressDetails.phone);
      if (success) {
        setIsPhoneModalOpen(false);
        if (paymentMethod === "CARD") {
          setCheckoutStep("payment");
        } else {
          await completeCheckout();
        }
      } else {
        setPhoneVerifyError("Invalid or expired verification code.");
      }
    } catch (err: any) {
      setPhoneVerifyError(err.message || "Verification failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = getSubtotal();
  const cartTotal = getCartTotal();
  const discount = appliedOffer ? appliedOffer.discountAmount : 0;
  const deliveryFee = shippingFee + (paymentMethod === "COD" && isCodAllowed ? codHandlingCharge : 0);
  const total = cartTotal + deliveryFee;

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
                  {checkoutStep !== "cart" ? (
                    <button 
                      onClick={() => setCheckoutStep(checkoutStep === "payment" ? "address" : "cart")}
                      className="p-1 -ml-1 mr-1 rounded-full hover:bg-brand-charcoal/5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-5 w-5 text-brand-charcoal" />
                    </button>
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-brand-charcoal" />
                  )}
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    {checkoutStep === "address" ? "Shipping Details" : checkoutStep === "payment" ? "Secure Payment" : "Shopping Bag"}
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
                  {/* Offer Status Section */}
                  <div className="space-y-2">
                    {appliedOffer ? (
                      <div className="flex items-center justify-between bg-brand-green/10 border border-brand-green/20 rounded-xl px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green" />
                          <span className="text-xs font-bold text-brand-green tracking-wider">QR Offer Applied</span>
                          <span className="text-[10px] text-brand-green/70">(-₹{appliedOffer.discountAmount})</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-brand-charcoal/5 rounded-xl border border-brand-charcoal/10">
                        <Tag className="h-4 w-4 text-brand-charcoal/40" />
                        <span className="text-xs text-brand-charcoal/60">No active offers. Scan packaging QR to unlock!</span>
                      </div>
                    )}
                    
                    {offerError && (
                      <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {offerError}
                      </p>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2 pt-2 border-t border-brand-charcoal/5">
                    <div className="flex items-center justify-between text-brand-charcoal">
                      <span className="text-sm font-medium tracking-wide">Subtotal</span>
                      <span className="text-sm font-semibold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    {appliedOffer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-center justify-between text-brand-green"
                      >
                        <span className="text-sm font-medium tracking-wide">Offer Discount</span>
                        <span className="text-sm font-semibold">-₹{discount.toFixed(2)}</span>
                      </motion.div>
                    )}

                    {shippingFee > 0 && (
                      <div className="flex items-center justify-between text-brand-charcoal">
                        <span className="text-sm font-medium tracking-wide">Delivery Fee</span>
                        <span className="text-sm font-semibold">₹{shippingFee.toFixed(2)}</span>
                      </div>
                    )}

                    {paymentMethod === "COD" && isCodAllowed && codHandlingCharge > 0 && (
                      <div className="flex items-center justify-between text-brand-charcoal">
                        <span className="text-sm font-medium tracking-wide">COD Handling Fee</span>
                        <span className="text-sm font-semibold">₹{codHandlingCharge.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-brand-charcoal pt-2 border-t border-brand-charcoal/5">
                      <span className="text-sm font-semibold tracking-wide">Total</span>
                      <span className="text-lg font-bold font-serif">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-brand-charcoal/5">
                    <label className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-2.5 text-xs focus:border-brand-green focus:outline-none cursor-pointer"
                    >
                      {isCodAllowed && <option value="COD">Cash on Delivery (COD)</option>}
                      <option value="CARD">Credit / Debit Card (Soon)</option>
                    </select>
                    {serviceabilityError && (
                      <p className="text-[10px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{serviceabilityError}</span>
                      </p>
                    )}
                    {checkingServiceability && (
                      <p className="text-[10px] text-brand-charcoal/50 italic">Checking shipping serviceability...</p>
                    )}
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
              ) : checkoutStep === "address" ? (
                <div className="flex-1 overflow-y-auto flex flex-col justify-between">
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
                      {serviceabilityError && (
                        <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-600 text-xs">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[10px] uppercase tracking-wider">Shipping Serviceability</p>
                            <p className="mt-0.5 leading-normal">{serviceabilityError}</p>
                          </div>
                        </div>
                      )}
                      {checkingServiceability && (
                        <p className="text-[10px] text-brand-charcoal/50 italic mt-1 ml-1">Checking serviceability with Delhivery...</p>
                      )}
                    </div>
                    )}
                  </div>
                  
                  <div className="px-6 py-6 border-t border-brand-charcoal/5 bg-brand-gray/30 space-y-4">
                    {/* Show discount in address step too */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-brand-charcoal">
                        <span className="text-sm font-medium tracking-wide">Subtotal</span>
                        <span className="text-sm">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {appliedOffer && (
                        <div className="flex items-center justify-between text-brand-green">
                          <span className="text-xs font-medium tracking-wide flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            QR Offer Applied
                          </span>
                          <span className="text-xs font-semibold">-₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      {shippingFee > 0 && (
                        <div className="flex items-center justify-between text-brand-charcoal">
                          <span className="text-xs font-medium tracking-wide">Delivery Fee</span>
                          <span className="text-xs">₹{shippingFee.toFixed(2)}</span>
                        </div>
                      )}
                      {paymentMethod === "COD" && isCodAllowed && codHandlingCharge > 0 && (
                        <div className="flex items-center justify-between text-brand-charcoal">
                          <span className="text-xs font-medium tracking-wide">COD Handling Fee</span>
                          <span className="text-xs">₹{codHandlingCharge.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-brand-charcoal pt-1 border-t border-brand-charcoal/5">
                        <span className="text-sm font-semibold tracking-wide">Total to Pay</span>
                        <span className="text-lg font-bold font-serif">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-4 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 cursor-pointer"
                    >
                      Confirm Booking ({paymentMethod})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto flex flex-col justify-between">
                  <div className="p-6 space-y-6">
                    <div className="bg-brand-gray/30 p-4 rounded-xl border border-brand-charcoal/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">Amount to Pay</span>
                        <p className="text-xl font-bold font-serif text-brand-charcoal">₹{total.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-brand-green font-bold bg-brand-green/10 border border-brand-green/20 px-3 py-1.5 rounded-full">
                        <Lock className="h-3.5 w-3.5" /> SECURE
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={addressDetails.fullName}
                          readOnly
                          className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg/50 px-3 py-2 text-sm text-brand-charcoal/60 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Card Number *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="1234 5678 1234 5678"
                            maxLength={19}
                            className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 pl-10 text-sm focus:border-brand-green focus:outline-none"
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                              const matches = value.match(/\d{4,16}/g);
                              const match = (matches && matches[0]) || "";
                              const parts = [];
                              for (let i = 0, len = match.length; i < len; i += 4) {
                                parts.push(match.substring(i, i + 4));
                              }
                              if (parts.length > 0) {
                                e.target.value = parts.join(" ");
                              } else {
                                e.target.value = value;
                              }
                            }}
                          />
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-brand-charcoal/30" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">Expiry Date *</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^0-9]/g, "");
                              if (value.length > 2) {
                                value = value.substring(0, 2) + "/" + value.substring(2, 4);
                              }
                              e.target.value = value;
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-brand-charcoal/50 ml-1">CVV *</label>
                          <input
                            type="password"
                            required
                            placeholder="•••"
                            maxLength={3}
                            className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
                            onChange={(e) => {
                              e.target.value = e.target.value.replace(/[^0-9]/g, "");
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-brand-gray/30 rounded-xl border border-brand-charcoal/5 text-xs text-brand-charcoal/50 space-y-1.5">
                      <p className="flex items-center gap-1.5 font-semibold text-brand-charcoal">
                        <Lock className="h-3.5 w-3.5 text-brand-green" /> Simulated Payment Sandbox
                      </p>
                      <p className="leading-relaxed">This is a secure checkout simulation. Fill in any mock credit card details to complete payment simulation.</p>
                    </div>
                  </div>

                  <div className="px-6 py-6 border-t border-brand-charcoal/5 bg-brand-gray/30">
                    <button
                      onClick={async () => {
                        setIsCheckingOut(true);
                        setTimeout(async () => {
                          const success = await checkout(paymentMethod, addressDetails);
                          setIsCheckingOut(false);
                          if (success) {
                            useAlertStore.getState().showAlert("Payment successful! Your order has been placed successfully.");
                            clearCart();
                            setIsOpen(false);
                          } else {
                            useAlertStore.getState().showAlert("Checkout failed. Please try again.");
                          }
                        }, 2000);
                      }}
                      disabled={isCheckingOut}
                      className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-4 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing Secure Payment...
                        </>
                      ) : (
                        `Pay ₹${total.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Phone OTP Verification Modal */}
            <AnimatePresence>
              {isPhoneModalOpen && (
                <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsPhoneModalOpen(false)}
                    className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
                  />

                  {/* Modal Container */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-brand-bg p-8 shadow-2xl border border-brand-charcoal/5 z-10"
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => setIsPhoneModalOpen(false)}
                      className="absolute top-6 right-6 text-brand-charcoal/40 hover:text-brand-charcoal p-1.5 rounded-full hover:bg-brand-charcoal/5 transition-all duration-200 cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <h2 className="text-xl font-bold font-serif text-brand-charcoal tracking-tight">
                      Verify Phone Number
                    </h2>
                    <p className="mt-2 text-xs text-brand-charcoal/50 font-light">
                      Please enter the verification code sent to your email to verify phone number <strong>{addressDetails.phone}</strong>.
                    </p>

                    <form onSubmit={handlePhoneVerifySubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/50" htmlFor="phone-verify-otp">
                          Verification Code (OTP)
                        </label>
                        <input
                          type="text"
                          id="phone-verify-otp"
                          required
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="mt-1.5 w-full rounded-2xl border border-brand-charcoal/10 bg-brand-bg px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-all duration-200"
                        />
                      </div>

                      {phoneVerifyError && (
                        <div className="flex gap-2.5 items-center bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl p-3.5 text-xs font-medium">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>{phoneVerifyError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isCheckingOut}
                        className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-3.5 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isCheckingOut ? "Verifying..." : "Verify & Complete Booking"}
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
