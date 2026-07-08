"use client";

import { useState, useEffect } from "react";
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
  const [frontImageBase64, setFrontImageBase64] = useState<string>("");
  const [backImageBase64, setBackImageBase64] = useState<string>("");
  const [logoImageBase64, setLogoImageBase64] = useState<string>("");
  const [formData, setFormData] = useState({
    designNotes: "",
    color: "Black",
    size: "M",
    quantity: 3,
    fullName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    pincode: "",
    state: "",
    city: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync user details to form when loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
        landmark: prev.landmark || user.landmark || "",
        pincode: prev.pincode || user.pincode || "",
        state: prev.state || user.state || "",
        city: prev.city || user.city || ""
      }));
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, position: 'front' | 'back' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert("File is too large (max 10MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (position === 'front') setFrontImageBase64(base64);
      else if (position === 'back') setBackImageBase64(base64);
      else if (position === 'logo') setLogoImageBase64(base64);
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

    const uploadedImages = [frontImageBase64, backImageBase64, logoImageBase64].filter(Boolean);

    if (uploadedImages.length === 0) {
      showAlert("Please upload at least one design image (Front, Back, or Logo).");
      return;
    }

    if (Number(formData.quantity) < 3) {
      showAlert("Minimum order quantity for custom design is 3.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        designImageUrl: uploadedImages,
        quantity: Number(formData.quantity)
      };

      await apiFetch("/custom-orders", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showAlert("Custom order submitted successfully! Our design team will review it and connect with you shortly.");
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

        {/* Process Explanation Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-2xl p-5 space-y-2">
            <span className="text-lg">👕</span>
            <h3 className="font-serif font-semibold text-brand-charcoal">Minimum 3 Orders</h3>
            <p className="text-[11px] text-brand-charcoal/75 leading-relaxed font-light">Custom designs require a minimum order of 3 tees. Enjoy premium, bespoke streetwear printing.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-2xl p-5 space-y-2">
            <span className="text-lg">🎨</span>
            <h3 className="font-serif font-semibold text-brand-charcoal">Mix Sizes & Colors</h3>
            <p className="text-[11px] text-brand-charcoal/75 leading-relaxed font-light">Mix any sizes (S-XXL) and fabric colors (Black, White, Navy, Grey) under the same custom design print.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-2xl p-5 space-y-2">
            <span className="text-lg">💬</span>
            <h3 className="font-serif font-semibold text-brand-charcoal">Personal Contact</h3>
            <p className="text-[11px] text-brand-charcoal/75 leading-relaxed font-light">Our team will connect with you via WhatsApp & Email within 24 hours to show digital mockups before printing.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-2xl p-5 space-y-2">
            <span className="text-lg">💳</span>
            <h3 className="font-serif font-semibold text-brand-charcoal">Advance Payment</h3>
            <p className="text-[11px] text-brand-charcoal/75 leading-relaxed font-light">Custom tees are custom-made; order creation starts only after the advance payment is confirmed ("pay advance seen").</p>
          </div>
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
            
            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Upload Graphics (PNG/JPG, Max 10MB)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Front Graphic */}
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-brand-charcoal/15 hover:border-brand-green/60 bg-brand-charcoal/[0.01] hover:bg-brand-green/[0.03] transition-all duration-300 flex flex-col items-center justify-center text-center p-4 cursor-pointer overflow-hidden group">
                  {frontImageBase64 ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={frontImageBase64} alt="Front Design" className="object-contain w-full h-full" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFrontImageBase64(""); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-20"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <UploadCloud size={20} className="text-brand-charcoal/60 mb-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-[10px] font-bold text-brand-charcoal block leading-tight">Front Graphic *</span>
                      <span className="text-[8px] text-brand-charcoal/40 block mt-1">Recommended</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'front')}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                    </div>
                  )}
                </div>

                {/* Back Graphic */}
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-brand-charcoal/15 hover:border-brand-green/60 bg-brand-charcoal/[0.01] hover:bg-brand-green/[0.03] transition-all duration-300 flex flex-col items-center justify-center text-center p-4 cursor-pointer overflow-hidden group">
                  {backImageBase64 ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={backImageBase64} alt="Back Design" className="object-contain w-full h-full" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setBackImageBase64(""); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-20"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <UploadCloud size={20} className="text-brand-charcoal/60 mb-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-[10px] font-bold text-brand-charcoal block leading-tight">Back Graphic</span>
                      <span className="text-[8px] text-brand-charcoal/40 block mt-1">Optional</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'back')}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                    </div>
                  )}
                </div>

                {/* Logo Graphic */}
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-brand-charcoal/15 hover:border-brand-green/60 bg-brand-charcoal/[0.01] hover:bg-brand-green/[0.03] transition-all duration-300 flex flex-col items-center justify-center text-center p-4 cursor-pointer overflow-hidden group">
                  {logoImageBase64 ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={logoImageBase64} alt="Logo Design" className="object-contain w-full h-full" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setLogoImageBase64(""); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-20"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <UploadCloud size={20} className="text-brand-charcoal/60 mb-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-[10px] font-bold text-brand-charcoal block leading-tight">Logo / Sleeve</span>
                      <span className="text-[8px] text-brand-charcoal/40 block mt-1">Optional</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Design Notes</label>
                <textarea
                  name="designNotes"
                  value={formData.designNotes}
                  onChange={handleInputChange}
                  placeholder="E.g., Print size, placement (front/back), sizing mix details, or any special requests..."
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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 mb-2">Quantity * (Minimum 3)</label>
                <input
                  type="number"
                  name="quantity"
                  min="3"
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
                By submitting this form, you request a custom print. Our team will review the design and contact you. Note: Custom order creation starts only after the advance payment is confirmed ("pay advance seen").
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
