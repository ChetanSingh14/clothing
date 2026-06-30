"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { apiFetch } from "@/utils/api";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check login state on startup
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await apiFetch("/user/me");
        if (res.success && res.data) {
          setUser(res.data);
        }
      } catch (err) {
        // Token is invalid/expired
        localStorage.removeItem("authToken");
        setUser(null);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
    }
  };

  const handleStartClick = () => {
    if (user) {
      alert(`Welcome back, ${user.name}! You are already logged in.`);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <Header 
        user={user} 
        onAuthClick={() => setIsAuthModalOpen(true)} 
        onLogout={handleLogout} 
      />
      <main className="flex-grow">
        <Hero 
          user={user} 
          onStartClick={handleStartClick} 
        />
        <BentoGrid />
        <Testimonials />
      </main>
      <Footer />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={(newUser) => setUser(newUser)}
      />
    </>
  );
}
