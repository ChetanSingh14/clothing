"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { UploadCloud, X, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAlertStore } from "@/store/useAlertStore";
import { apiFetch } from "@/utils/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CustomDesignPage() {
  const { user } = useAuthStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Form State
  const [fileBase64, setFileBase64] = useState<string>("");
  const [formData, setFormData] = useState({
    designNotes: "",
    color: "Black",
    size: "M",
    quantity: 1,
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    landmark: user?.landmark || "",
    pincode: user?.pincode || "",
    state: user?.state || "",
    city: user?.city || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert("File is too large (max 10MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!fileBase64) {
      showAlert("Please upload a custom design image first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        designImageUrl: fileBase64,
        quantity: Number(formData.quantity)
      };

      await apiFetch("/custom-orders", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showAlert("Custom order submitted successfully! We will review it shortly.");
      router.push("/profile"); // Assuming there's a profile or orders page
    } catch (err: any) {
      showAlert(err.message || "Failed to submit custom order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-grow pt-28 pb-16 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl tracking-tight text-brand-charcoal mb-4"
          >
            Bring Your Vision to Life
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-charcoal/70 max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed"
          >
            Upload your custom design, specify your preferences, and our team will print it on our premium streetwear tees.
          </motion.p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          onSubmit={handleSubmit} 
          className="bg-white/80 backdrop-blur-xl border border-brand-charcoal/5 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-12 relative overflow-hidden"
        >
          {/* Subtle Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          
          {/* LEFT: Upload Section */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-3 border-b border-brand-charcoal/10 pb-4">
               <div className="w-8 h-8 rounded-full bg-brand-charcoal text-white flex items-center justify-center font-bold text-sm">1</div>
               <h2 className="text-2xl font-bold tracking-tight text-brand-charcoal font-serif">Your Design</h2>
            </div>
            
            <div className="relative">
              {fileBase64 ? (
                <div className="relative w-full aspect-square md:aspect-[4/5] rounded-2xl border-2 border-brand-charcoal/10 overflow-hidden bg-brand-gray group flex items-center justify-center">
                  <img src={fileBase64} alt="Custom Design Preview" className="object-contain w-full h-full p-4" />
                  <button
                    type="button"
                    onClick={() => setFileBase64("")}
                    className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] border-2 border-dashed border-brand-charcoal/20 hover:border-brand-green/60 bg-brand-charcoal/[0.02] hover:bg-brand-green/5 transition-all duration-300 flex flex-col items-center justify-center text-center p-8 cursor-pointer overflow-hidden group">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud size={28} strokeWidth={1.5} className="text-brand-charcoal" />
                  </div>
                  <p className="font-bold text-brand-charcoal mb-2 text-lg">Click to Upload Design</p>
                  <p className="text-xs text-brand-charcoal/50 mb-6">PNG, JPG or JPEG (Max 10MB)</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green px-4 py-2 bg-brand-green/10 rounded-full">Transparent backgrounds preferred</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Design Notes</label>
                <textarea
                  name="designNotes"
                  value={formData.designNotes}
                  onChange={handleInputChange}
                  placeholder="E.g., Print size, placement (front/back), or any special requests..."
                  rows={3}
                  className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all resize-none shadow-inner"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">T-Shirt Color</label>
                  <select name="color" value={formData.color} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium cursor-pointer">
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Navy">Navy Blue</option>
                    <option value="Grey">Heather Grey</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Size</label>
                  <select name="size" value={formData.size} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium cursor-pointer">
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">Double XL (XXL)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Details & Shipping */}
          <div className="flex-1 space-y-8 md:pl-4">
            <div className="flex items-center gap-3 border-b border-brand-charcoal/10 pb-4">
               <div className="w-8 h-8 rounded-full bg-brand-charcoal text-white flex items-center justify-center font-bold text-sm">2</div>
               <h2 className="text-2xl font-bold tracking-tight text-brand-charcoal font-serif">Shipping Details</h2>
            </div>
            
            {!user ? (
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-48">
                <p className="text-sm font-medium text-amber-800 mb-4">You need to log in to place a custom order.</p>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-brand-charcoal text-white text-sm font-bold py-3 px-8 rounded-full hover:bg-black transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Log In to Continue
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Full Name *</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Phone Number *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Complete Address *</label>
                  <textarea required name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all resize-none shadow-inner font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Landmark</label>
                    <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Pincode *</label>
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">City *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">State *</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-brand-bg/30 border border-brand-charcoal/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner font-medium" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 mt-8 border-t border-brand-charcoal/10">
              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full flex items-center justify-center gap-3 bg-brand-green text-brand-charcoal font-bold py-5 px-6 rounded-full hover:bg-white hover:shadow-[0_4px_20px_rgba(205,255,100,0.3)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed group uppercase tracking-widest text-sm"
              >
                {isSubmitting ? "Submitting Request..." : "Submit Custom Order"}
                {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />}
              </button>
              <p className="text-[10px] text-brand-charcoal/50 text-center mt-3">
                By submitting this form, you request a custom print. Our team will review the design and contact you regarding pricing and confirmation.
              </p>
            </div>

          </div>
        </motion.form>
      </main>

      <Footer />
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}
