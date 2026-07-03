"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAlertStore } from "@/store/useAlertStore";
import { apiFetch } from "@/utils/api";
import { User, MapPin, Phone, Mail, Loader2, Camera } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { user, loading: authLoading, fetchMe } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/user/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      if (res.success) {
        useAlertStore.getState().showAlert("Profile updated successfully");
        await fetchMe();
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
                  <div className="absolute inset-0 bg-brand-charcoal/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-brand-bg" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold font-serif">{user?.name}</h2>
              <p className="text-xs text-brand-charcoal/60 mt-1">{user?.email}</p>
              <div className="mt-4 inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-bold uppercase rounded-full border border-brand-green/20">
                {user?.role}
              </div>
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

      <Footer />
    </div>
  );
}
