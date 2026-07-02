"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProductStore } from "@/store/useProductStore";
import { Heart, ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import PageLoader from "@/components/PageLoader";

export default function WishlistPage() {
  const { user, fetchMe, initialized } = useAuthStore();
  const { wishlist, fetchWishlist, toggleWishlist, wishlistLoading } = useProductStore();
  const { addItem, setIsOpen: setCartOpen } = useCartStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (initialized) {
      if (user) {
        fetchWishlist();
      } else {
        setIsAuthModalOpen(true);
      }
    }
  }, [user, initialized]);

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || "",
      color: product.colors?.[0] || "Default",
      size: product.sizes?.[0] || "M",
    });
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main className="flex-grow py-16 px-6 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <Link href="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-brand-charcoal/50 hover:text-brand-charcoal transition-colors mb-4">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Shop
              </Link>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl font-serif">
                Your Wishlist
              </h1>
            </div>
          </div>

          {!initialized ? (
            <PageLoader />
          ) : !user ? (
            <div className="bg-brand-gray/30 rounded-3xl p-12 text-center border border-brand-charcoal/5">
              <h3 className="text-lg font-serif font-semibold text-brand-charcoal">Please log in to view your wishlist.</h3>
            </div>
          ) : wishlistLoading ? (
            <PageLoader />
          ) : wishlist.length === 0 ? (
            <div className="bg-brand-gray/30 rounded-3xl p-12 text-center border border-brand-charcoal/5">
              <Heart className="h-10 w-10 text-brand-charcoal/20 mx-auto mb-4" />
              <h3 className="text-lg font-serif font-semibold text-brand-charcoal">Your wishlist is empty</h3>
              <p className="text-sm text-brand-charcoal/50 mt-2">Save items you love by clicking the heart icon.</p>
              <Link href="/#catalog" className="inline-block mt-6 px-6 py-3 bg-brand-charcoal text-brand-bg rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-charcoal/90 transition-colors">
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wishlist.map((product) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={product.id} 
                  className="bg-white rounded-3xl p-5 border border-brand-charcoal/5 shadow-sm flex flex-col sm:flex-row gap-5 relative group"
                >
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-4 right-4 p-2 bg-brand-bg/80 backdrop-blur rounded-full text-rose-500 hover:bg-rose-50 transition-colors z-10 cursor-pointer"
                  >
                    <Heart className="h-4 w-4 fill-rose-500" />
                  </button>

                  <div className="relative h-32 w-full sm:w-28 rounded-xl overflow-hidden bg-brand-gray border border-brand-charcoal/5 flex-shrink-0">
                    <img src={product.images[0]} alt={product.title} className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
                        {product.category}
                      </span>
                      <h4 className="text-sm font-semibold text-brand-charcoal mt-1 line-clamp-1">
                        {product.title}
                      </h4>
                      <div className="text-sm font-bold font-serif text-brand-charcoal mt-1">
                        ₹{product.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Link 
                        href={`/products/${product.id}`}
                        className="flex-1 text-center py-2 border border-brand-charcoal/10 rounded-xl text-xs font-semibold text-brand-charcoal hover:bg-brand-charcoal/5 transition-colors"
                      >
                        View
                      </Link>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-brand-charcoal text-brand-bg py-2 rounded-xl text-xs font-semibold hover:bg-brand-charcoal/90 transition-colors flex justify-center items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartDrawer />
    </div>
  );
}
