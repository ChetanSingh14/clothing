"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AnimatedHero from "@/components/AnimatedHero";
import BentoGrid from "@/components/BentoGrid";
// import Testimonials from "@/components/Testimonials";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import CinematicVideoHero from "@/components/CinematicVideoHero";
import PageLoader from "@/components/PageLoader";
import MediaRenderer from "@/components/MediaRenderer";
import { useAuthStore } from "@/store/useAuthStore";
import { useProductStore } from "@/store/useProductStore";
import { Star, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const { user, fetchMe } = useAuthStore();
  const { products, loading, fetchProducts, selectedCategory, setSelectedCategory } = useProductStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync user and product listings on load
  useEffect(() => {
    fetchMe();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleStartClick = () => {
    const element = document.getElementById("catalog");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Build dynamic categories list (always including T-Shirts and Hoodies)
  const defaultCategories = ["All"];
  const uniqueProductCategories = Array.from(new Set(products.map((p) => p.category)))
    .filter((cat) => cat && !["All"].includes(cat));
  const categoriesList = [...defaultCategories, ...uniqueProductCategories];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green selection:text-brand-bg">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main className="flex-grow">
        {user ? (
          <>
            <CinematicVideoHero onStartClick={handleStartClick} />
          </>
        ) : (
          <>
            <AnimatedHero onStartClick={handleStartClick} />
            <BentoGrid />
            {/* <Testimonials /> */}
          </>
        )}

        <section id="catalog" className="py-10 bg-brand-bg px-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Headings */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-semibold tracking-widest text-brand-green uppercase">
                  curated catalog
                </span>
                <h2 className="text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl font-serif mt-2">
                  Signature Collections
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mt-6 md:mt-0 border-b border-brand-charcoal/5 pb-2 md:pb-0 md:border-none">
                {categoriesList.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                      selectedCategory === category
                        ? "bg-brand-charcoal text-brand-bg"
                        : "text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-charcoal/5"
                    }`}
                  >
                    {category.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <PageLoader />
            ) : products.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold font-serif">No products found</h3>
                <p className="text-sm text-brand-charcoal/50 mt-1">Please try another category or upload in admin dashboard.</p>
              </div>
            ) : (
              /* Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group flex flex-col rounded-3xl bg-brand-gray/30 overflow-hidden border border-brand-charcoal/5 shadow-xs relative"
                  >
                    {/* Image Frame */}
                    <div className="relative aspect-[4/5] w-full bg-brand-gray overflow-hidden">
                      <MediaRenderer
                        src={product.images[0] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop"}
                        alt={product.title}
                        className="object-cover h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Soft overlay */}
                      <div className="absolute inset-0 bg-brand-charcoal/5 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                      
                      {/* Floating Price */}
                      <div className="absolute top-4 right-4 bg-brand-bg/95 backdrop-blur-md border border-brand-charcoal/5 px-3.5 py-1.5 rounded-full shadow-xs">
                        <span className="text-xs font-bold font-serif text-brand-charcoal">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Info Details */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-charcoal/70">
                            <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                            <span>{product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-brand-charcoal tracking-tight mt-2 font-serif group-hover:text-brand-green transition-colors leading-tight">
                          {product.title}
                        </h3>
                        
                        <p className="text-xs text-brand-charcoal/60 mt-2 font-light line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Link Detail Action */}
                      <div className="mt-6 pt-4 border-t border-brand-charcoal/5 flex items-center justify-between text-brand-charcoal">
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-charcoal/70 group-hover:text-brand-green transition-colors">
                          view details
                        </span>
                        <div className="h-8 w-8 rounded-full border border-brand-charcoal/10 flex items-center justify-center group-hover:border-brand-green group-hover:bg-brand-green group-hover:text-brand-bg transition-all duration-300">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Full card clickable link */}
                    <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
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
