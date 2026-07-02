"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { useState } from "react";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal, clearCart, checkout } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const handleCheckout = async () => {
    const success = await checkout(paymentMethod);
    if (success) {
      alert("Thank you for your order! Your garments are recorded in the system and being prepared for dispatch.");
      setIsOpen(false);
    } else {
      alert("Checkout failed. Please ensure you have items in your bag and are logged in.");
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
                  <ShoppingBag className="h-5 w-5 text-brand-charcoal" />
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Shopping Bag
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-brand-charcoal/40 hover:text-brand-charcoal hover:bg-brand-charcoal/5 transition-all duration-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

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
                        <img
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
                    onClick={handleCheckout}
                    className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-4 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
