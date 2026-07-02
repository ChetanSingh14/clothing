"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlertStore } from "@/store/useAlertStore";

export default function AlertModal() {
  const { isOpen, message, isConfirm, onConfirm, closeAlert } = useAlertStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAlert}
            className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-sm bg-brand-bg rounded-2xl shadow-xl overflow-hidden border border-brand-charcoal/10"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src="/icon.png" alt="Icon" className="w-6 h-6 rounded-sm object-cover" />
                <h3 className="font-serif font-semibold text-brand-charcoal text-lg">MDFK Clothing</h3>
              </div>
              <p className="text-brand-charcoal/80 text-sm mb-6 leading-relaxed">
                {message}
              </p>
              <div className="flex justify-end gap-3">
                {isConfirm ? (
                  <>
                    <button
                      onClick={closeAlert}
                      className="px-6 py-2 bg-transparent text-brand-charcoal border border-brand-charcoal/20 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-charcoal/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (onConfirm) onConfirm();
                        closeAlert();
                      }}
                      className="px-6 py-2 bg-brand-charcoal text-brand-bg rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-charcoal/90 transition-colors"
                    >
                      Confirm
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeAlert}
                    className="px-6 py-2 bg-brand-charcoal text-brand-bg rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-charcoal/90 transition-colors"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
