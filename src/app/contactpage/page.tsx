"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProductStore } from "@/store/useProductStore";

export default function ContactPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { fetchMe } = useAuthStore();
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main className="flex-grow pt-10">
        <ContactSection />
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
        }}
      />
      <CartDrawer />
    </div>
  );
}
