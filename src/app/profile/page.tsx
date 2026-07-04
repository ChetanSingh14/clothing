"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAlertStore } from "@/store/useAlertStore";
import { apiFetch } from "@/utils/api";
import { User, MapPin, Phone, Mail, Loader2, Camera, Package, ChevronRight, LogOut, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";

export default function ProfilePage() {
  const { user, loading: authLoading, fetchMe, logout, sendPhoneOtp, verifyPhoneOtp } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Phone verification state
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpToken, setPhoneOtpToken] = useState("");
  const [phoneVerifyError, setPhoneVerifyError] = useState("");

  // Cropper state
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  // Logout state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        landmark: user.landmark || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      });
    }
  }, [user]);

  const submitProfileUpdate = async (data: typeof formData) => {
    setLoading(true);
    try {
      const res = await apiFetch("/user/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (res.success) {
        useAlertStore.getState().showAlert("Profile updated successfully");
        await fetchMe(true);
        setIsEditing(false);
      } else {
        useAlertStore.getState().showAlert(res.message || "Failed to update profile");
      }
    } catch (err: any) {
      useAlertStore.getState().showAlert(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isPhoneChanged = formData.phone && formData.phone !== (user?.phone || "");
    if (isPhoneChanged) {
      setLoading(true);
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
        setLoading(false);
      }
      return;
    }

    await submitProfileUpdate(formData);
  };

  const handlePhoneVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneVerifyError("");
    setLoading(true);
    try {
      const success = await verifyPhoneOtp(phoneOtp, phoneOtpToken, formData.phone);
      if (success) {
        setIsPhoneModalOpen(false);
        await submitProfileUpdate({
          ...formData,
          phone: formData.phone
        });
      } else {
        setPhoneVerifyError("Invalid or expired verification code.");
      }
    } catch (err: any) {
      setPhoneVerifyError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      useAlertStore.getState().showAlert("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setIsCropping(true);
    };
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    
    setLoading(true);
    try {
      const base64String = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      const uploadRes = await apiFetch("/user/upload", {
        method: "POST",
        body: JSON.stringify({ image: base64String }),
      });

      if (uploadRes.success && uploadRes.url) {
        const updateRes = await apiFetch("/user/profile", {
          method: "PUT",
          body: JSON.stringify({ ...formData, profileImage: uploadRes.url }),
        });
        
        if (updateRes.success) {
          useAlertStore.getState().showAlert("Profile image updated successfully");
          await fetchMe(true);
        } else {
          useAlertStore.getState().showAlert("Failed to update profile image");
        }
      } else {
        useAlertStore.getState().showAlert(uploadRes.message || "Failed to upload image");
      }
    } catch (err: any) {
      useAlertStore.getState().showAlert(err.message || "Failed to crop or upload image");
    } finally {
      setLoading(false);
      setIsCropping(false);
      setImageToCrop(null);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-charcoal" />
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-brand-charcoal font-semibold text-lg">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans text-brand-charcoal">
      <Header />
      
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12 md:py-20 mt-16">
        <div className="flex items-center justify-between mb-8 border-b border-brand-charcoal/10 pb-6">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Area of My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-brand-charcoal text-brand-bg px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-charcoal/90 transition-colors cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / Avatar */}
          <div className="col-span-1 space-y-6">
            <div className="bg-brand-gray/30 p-6 rounded-3xl border border-brand-charcoal/5 flex flex-col items-center text-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-brand-gray border border-brand-charcoal/10 mb-4 group cursor-pointer">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-charcoal/20">
                    <User className="w-12 h-12" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-brand-charcoal/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-brand-bg" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold font-serif">{user?.name}</h2>
              <p className="text-xs text-brand-charcoal/60 mt-1">{user?.email}</p>
              <div className="mt-4 inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-bold uppercase rounded-full border border-brand-green/20">
                {user?.role}
              </div>
            </div>
            
            <div className="bg-brand-gray/30 p-4 rounded-3xl border border-brand-charcoal/5">
              <nav className="flex flex-col gap-2">
                <Link href="/profile" className="flex items-center justify-between p-3 rounded-xl bg-white border border-brand-charcoal/10 text-brand-charcoal font-semibold text-sm shadow-sm">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-brand-charcoal/70" />
                    My Profile
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-charcoal/40" />
                </Link>
                <Link href="/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:border hover:border-brand-charcoal/10 text-brand-charcoal/70 font-semibold text-sm transition-all">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-brand-charcoal/70" />
                    My Orders
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-charcoal/40" />
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 hover:border hover:border-red-100 text-red-600/80 font-semibold text-sm transition-all w-full text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-red-600/70" />
                    Logout
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-600/40" />
                </button>
              </nav>
            </div>
          </div>

          {/* Form Details */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-brand-bg p-8 rounded-3xl border border-brand-charcoal/10 shadow-sm">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold border-b border-brand-charcoal/5 pb-2 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-charcoal/50" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5">Username</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/30 px-4 py-2.5 text-sm focus:border-brand-green focus:bg-brand-bg focus:outline-none disabled:opacity-70 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/30 px-4 py-2.5 text-sm focus:border-brand-green focus:bg-brand-bg focus:outline-none disabled:opacity-70 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> Email (Read Only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/50 px-4 py-2.5 text-sm text-brand-charcoal/60 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> Phone
                      </label>
                      <input
                        type="tel"
                        disabled={!isEditing}
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/30 px-4 py-2.5 text-sm focus:border-brand-green focus:bg-brand-bg focus:outline-none disabled:opacity-70 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-bold border-b border-brand-charcoal/5 pb-2 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-charcoal/50" />
                    Permanent Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5">Street Address</label>
                      <textarea
                        rows={2}
                        disabled={!isEditing}
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/30 px-4 py-2.5 text-sm focus:border-brand-green focus:bg-brand-bg focus:outline-none disabled:opacity-70 transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5">Landmark</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={formData.landmark}
                          onChange={e => setFormData({...formData, landmark: e.target.value})}
                          className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/30 px-4 py-2.5 text-sm focus:border-brand-green focus:bg-brand-bg focus:outline-none disabled:opacity-70 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5">City</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={formData.city}
                          onChange={e => setFormData({...formData, city: e.target.value})}
                          className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/30 px-4 py-2.5 text-sm focus:border-brand-green focus:bg-brand-bg focus:outline-none disabled:opacity-70 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5">State</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={formData.state}
                          onChange={e => setFormData({...formData, state: e.target.value})}
                          className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/30 px-4 py-2.5 text-sm focus:border-brand-green focus:bg-brand-bg focus:outline-none disabled:opacity-70 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-brand-charcoal/60 uppercase ml-1 block mb-1.5">Pincode</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={formData.pincode}
                          onChange={e => setFormData({...formData, pincode: e.target.value})}
                          className="w-full rounded-xl border border-brand-charcoal/10 bg-brand-gray/30 px-4 py-2.5 text-sm focus:border-brand-green focus:bg-brand-bg focus:outline-none disabled:opacity-70 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-3 pt-6 border-t border-brand-charcoal/10">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 rounded-xl text-sm font-semibold border border-brand-charcoal/10 hover:bg-brand-gray/50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green/90 transition-colors flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-sm">
          <div className="bg-brand-bg rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-brand-charcoal/10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-serif text-brand-charcoal mb-3">Confirm Logout</h3>
            <p className="text-sm text-brand-charcoal/70 mb-8">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-brand-charcoal/10 hover:bg-brand-gray/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {isCropping && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-sm">
          <div className="bg-brand-bg rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
            <div className="p-4 border-b border-brand-charcoal/10 flex justify-between items-center bg-white">
              <h3 className="font-bold font-serif text-lg">Crop Profile Picture</h3>
              <button onClick={() => { setIsCropping(false); setImageToCrop(null); }} className="text-brand-charcoal/50 hover:text-brand-charcoal">
                Cancel
              </button>
            </div>
            
            <div className="relative flex-grow bg-black/5">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            
            <div className="p-4 bg-white border-t border-brand-charcoal/10 flex items-center justify-between gap-4">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-1/2 accent-brand-green"
              />
              <button
                onClick={handleCropSave}
                disabled={loading}
                className="px-6 py-2.5 bg-brand-green text-white rounded-xl text-sm font-semibold hover:bg-brand-green/90 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Picture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone OTP Verification Modal */}
      <AnimatePresence>
        {isPhoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-brand-bg p-8 shadow-2xl border border-brand-charcoal/5 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="absolute top-6 right-6 text-brand-charcoal/40 hover:text-brand-charcoal p-1.5 rounded-full hover:bg-brand-charcoal/5 transition-all duration-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-2xl font-bold font-serif text-brand-charcoal tracking-tight">
                Verify Phone Number
              </h2>
              <p className="mt-2 text-sm text-brand-charcoal/50 font-light">
                An email containing a verification code has been sent to your email to verify phone number <strong>{formData.phone}</strong>.
              </p>

              <form onSubmit={handlePhoneVerifySubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="phone-otp">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    id="phone-otp"
                    required
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="mt-1.5 w-full rounded-2xl border border-brand-charcoal/10 bg-brand-bg px-4 py-3 text-sm focus:border-brand-green focus:outline-none transition-all duration-200"
                  />
                </div>

                {phoneVerifyError && (
                  <div className="flex gap-2.5 items-center bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl p-3.5 text-xs font-medium">
                    <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{phoneVerifyError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-charcoal text-brand-bg rounded-2xl py-3.5 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Save Phone Number"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
