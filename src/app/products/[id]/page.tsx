"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import { useProductStore, ProductItem } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowLeft, Star, Plus, Minus, Loader2, Check, Heart, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ModelViewer from "@/components/ModelViewer";
import Lightbox from "@/components/Lightbox";

// Helper for Mock Images Based on Color to demonstrate UI capabilities
const MOCK_COLOR_IMAGES: Record<string, string[]> = {
  "#8B5A2B": [ // brown
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596755094514-f87e32f6b717?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=1000&auto=format&fit=crop",
  ],
  "#000000": [ // black
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618354691438-25bc04584c23?q=80&w=1000&auto=format&fit=crop",
  ],
  "#ffffff": [ // white
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574180045817-28982a5a098d?q=80&w=1000&auto=format&fit=crop",
  ],
  "default": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000&auto=format&fit=crop"
  ]
};

const getColorImages = (color: string, defaultImages: string[]) => {
  const backendColorImages = defaultImages.filter(img => {
    const parts = img.split('#color=');
    if (parts.length > 1) {
      try {
        const imgColor = decodeURIComponent(parts[1]);
        return imgColor === color || imgColor === color.replace('#', '');
      } catch (e) {
        return parts[1] === color;
      }
    }
    return false;
  });

  let imagesToUse = backendColorImages.length > 0 ? backendColorImages : undefined;
  if (!imagesToUse) {
    const baseImages = defaultImages.filter(img => !img.includes('#color='));
    imagesToUse = MOCK_COLOR_IMAGES[color] || (baseImages.length > 0 ? baseImages : MOCK_COLOR_IMAGES.default);
  }
  if (imagesToUse.length === 0 && defaultImages.length > 0) imagesToUse = defaultImages;

  const result = [];
  for (let i = 0; i < 4; i++) {
    result.push(imagesToUse[i % imagesToUse.length] || imagesToUse[0]);
  }
  return result;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const { user } = useAuthStore();
  const { products, fetchProducts, activeProduct, loading, fetchProductDetails, submitReview, wishlist, toggleWishlist, fetchWishlist } = useProductStore();
  const { addItem, setIsOpen } = useCartStore();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  
  // Accordion states
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  useEffect(() => {
    if (!isNaN(productId)) {
      fetchProductDetails(productId).then((prod) => {
        if (prod) {
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
        }
      });
    }
  }, [productId]);

  if (loading || !activeProduct) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-brand-green animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = activeProduct.images.filter(img => !img.toLowerCase().endsWith('.glb') && !img.toLowerCase().endsWith('.mp4'));
  const productModel = activeProduct.images.find(img => img.toLowerCase().endsWith('.glb'));
  const productVideo = activeProduct.images.find(img => img.toLowerCase().endsWith('.mp4'));
  
  const displayImages = getColorImages(selectedColor, productImages);

  // Get suggested products
  const suggestedProducts = products.filter(p => p.id !== activeProduct.id).slice(0, 4);

  const handleBuyNow = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    addItem({
      productId: activeProduct.id,
      title: activeProduct.title,
      price: activeProduct.price,
      image: displayImages[0] || "",
      color: selectedColor,
      size: selectedSize,
    });
    setIsOpen(true);
  };

  const isWishlisted = wishlist.some((w) => w.id === activeProduct.id);

  const handleWishlistToggle = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    toggleWishlist(activeProduct.id);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    const success = await submitReview(activeProduct.id, reviewName, reviewRating, reviewComment);
    if (success) {
      setReviewComment("");
      setReviewName("");
      setReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green selection:text-brand-bg">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60 hover:text-brand-charcoal transition-colors mb-6 cursor-pointer group w-fit"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Home • Product details</span>
        </button>

        {/* Top Section: Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12">
          {/* Main Large Image */}
          <div className="md:col-span-7 h-[450px] md:h-[650px] rounded-3xl md:rounded-[2rem] overflow-hidden relative group bg-brand-gray/50">
            <span className="absolute top-6 right-6 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-brand-charcoal shadow-sm z-20 capitalize">
              {activeProduct.category}
            </span>
            
            {productModel && selectedColor === activeProduct.colors?.[0] ? (
              <div className="absolute inset-0 z-10 w-full h-full">
                <ModelViewer 
                  url={productModel}
                  decalUrl={displayImages[0]} 
                  color={selectedColor || "#ffffff"} 
                />
              </div>
            ) : productVideo && selectedColor === activeProduct.colors?.[0] ? (
              <video 
                src={productVideo}
                className="w-full h-full object-cover z-10 absolute inset-0"
                autoPlay loop muted playsInline
              />
            ) : (
              <img
                src={displayImages[0]?.split('#color=')[0]}
                alt={activeProduct.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0 z-0 cursor-pointer"
                onClick={() => openLightbox(0)}
              />
            )}
          </div>

          {/* Right Image Grid */}
          <div className="md:col-span-5 grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-4 h-24 md:h-[650px] pb-0 md:pb-0 scrollbar-hide">
            <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-2 md:gap-4 md:h-1/2 w-full shrink-0 md:shrink">
              <div className="h-full rounded-2xl md:rounded-[2rem] overflow-hidden relative group bg-brand-gray/50 shrink-0 md:shrink">
                <img
                  src={displayImages[1]?.split('#color=')[0]}
                  alt="Angle 2"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                  onClick={() => openLightbox(1)}
                />
              </div>
              <div className="h-full rounded-2xl md:rounded-[2rem] overflow-hidden relative group bg-brand-gray/50 shrink-0 md:shrink">
                <img
                  src={displayImages[2]?.split('#color=')[0]}
                  alt="Angle 3"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                  onClick={() => openLightbox(2)}
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-1 md:w-full md:h-1/2 rounded-2xl md:rounded-[2rem] overflow-hidden relative group bg-brand-gray/50 shrink-0 md:shrink">
              <img
                src={displayImages[3]?.split('#color=')[0]}
                alt="Angle 4"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                onClick={() => openLightbox(3)}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section: Details & Sticky Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
          
          {/* Left Column: Info & Selectors */}
          <div className="lg:col-span-7 space-y-8 pb-20">
            {/* Title & Rating */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-brand-charcoal font-serif leading-tight">
                  {activeProduct.title}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-5 w-5 fill-amber-400 stroke-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-brand-charcoal/80">
                    {activeProduct.rating.toFixed(1)} <span className="font-light text-brand-charcoal/50">({activeProduct.reviews?.length || 0}) New Reviews</span>
                  </span>
                </div>
              </div>
              <button
                onClick={handleWishlistToggle}
                className="p-3 bg-brand-bg shadow-sm rounded-full transition-all duration-300 cursor-pointer hover:scale-110 shrink-0 border border-brand-charcoal/5"
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-brand-charcoal/60"}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Color Selector */}
              {activeProduct.colors && activeProduct.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-brand-charcoal uppercase tracking-wider">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {activeProduct.colors.map((color) => (
                      <div key={color} className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => setSelectedColor(color)}
                          className={`h-9 w-9 rounded-full border-2 transition-all cursor-pointer relative flex items-center justify-center shadow-sm ${
                            selectedColor === color ? "border-brand-charcoal scale-110" : "border-brand-bg hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {selectedColor === color && (
                            <Check className="h-4 w-4 text-white mix-blend-difference" />
                          )}
                        </button>
                        <span className="text-[10px] font-medium text-brand-charcoal/60 capitalize">
                           {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {activeProduct.sizes && activeProduct.sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-brand-charcoal uppercase tracking-wider">
                      Size
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {activeProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] px-3 py-1.5 text-xs font-bold rounded-2xl transition-all cursor-pointer uppercase ${
                          selectedSize === size
                            ? "bg-brand-charcoal text-brand-bg shadow-md"
                            : "bg-brand-bg text-brand-charcoal hover:bg-brand-charcoal/5 border border-brand-charcoal/10"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordions */}
            <div className="border-t border-brand-charcoal/10 pt-6 space-y-2">
              {/* Description Accordion */}
              <div className="border-b border-brand-charcoal/10 pb-2">
                <button 
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full flex justify-between items-center text-left py-3 cursor-pointer group"
                >
                  <span className="text-base font-semibold text-brand-charcoal group-hover:text-brand-brown transition-colors">Description</span>
                  {isDescOpen ? <ChevronUp className="h-5 w-5 text-brand-charcoal/60" /> : <ChevronDown className="h-5 w-5 text-brand-charcoal/60" />}
                </button>
                <AnimatePresence>
                  {isDescOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden text-sm text-brand-charcoal/70 font-light leading-relaxed pt-2 pb-4"
                    >
                      <p>{activeProduct.description}</p>
                      <p className="mt-2">This first iteration reduces the carbon footprint by an average of 75% when used instead of our traditional knit fleece materials. Experience unparalleled comfort without compromising on environmental sustainability.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping Accordion */}
              <div className="border-b border-brand-charcoal/10 pb-2">
                <button 
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  className="w-full flex justify-between items-center text-left py-3 cursor-pointer group"
                >
                  <span className="text-base font-semibold text-brand-charcoal group-hover:text-brand-brown transition-colors">Shipping</span>
                  {isShippingOpen ? <ChevronUp className="h-5 w-5 text-brand-charcoal/60" /> : <ChevronDown className="h-5 w-5 text-brand-charcoal/60" />}
                </button>
                <AnimatePresence>
                  {isShippingOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-2 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <div className="flex items-start gap-3 bg-brand-gray/30 p-3 rounded-2xl shadow-sm border border-brand-charcoal/5">
                        <div className="bg-brand-charcoal text-brand-bg rounded-full h-8 w-8 flex items-center justify-center shrink-0 text-sm">%</div>
                        <div>
                          <div className="text-[10px] text-brand-charcoal/60 font-semibold uppercase">Discount</div>
                          <div className="text-xs font-semibold mt-0.5 text-brand-charcoal">Free Shipping &gt; $100</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-brand-gray/30 p-3 rounded-2xl shadow-sm border border-brand-charcoal/5">
                        <div className="bg-brand-charcoal text-brand-bg rounded-full h-8 w-8 flex items-center justify-center shrink-0 text-sm">📦</div>
                        <div>
                          <div className="text-[10px] text-brand-charcoal/60 font-semibold uppercase">Package</div>
                          <div className="text-xs font-semibold mt-0.5 text-brand-charcoal">Regular Package</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-brand-gray/30 p-3 rounded-2xl shadow-sm border border-brand-charcoal/5">
                        <div className="bg-brand-charcoal text-brand-bg rounded-full h-8 w-8 flex items-center justify-center shrink-0 text-sm">🚚</div>
                        <div>
                          <div className="text-[10px] text-brand-charcoal/60 font-semibold uppercase">Delivery Time</div>
                          <div className="text-xs font-semibold mt-0.5 text-brand-charcoal">6-12 Working Days</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
          </div>

          {/* Right Column: Floating Action Box & Reviews */}
          <div className="lg:col-span-5 relative space-y-8">
            
            {/* Sticky Action Box */}
            <div className="lg:sticky lg:top-28 bg-brand-charcoal text-brand-bg rounded-3xl p-6 shadow-xl flex items-center justify-between z-10">
               <div className="text-3xl font-bold font-serif tracking-tight">
                 ${activeProduct.price.toFixed(2)}
               </div>
               <button
                 onClick={handleBuyNow}
                 className="bg-brand-bg text-brand-charcoal rounded-full px-6 py-3 text-sm font-bold tracking-wide hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm group"
               >
                 Buy Now <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
               </button>
            </div>

            {/* Reviews Section Title */}
            <div className="pt-4 flex justify-between items-center border-b border-brand-charcoal/10 pb-3">
               <h3 className="text-xl font-semibold font-serif text-brand-charcoal">
                 Reviews ({activeProduct.reviews?.length || 0})
               </h3>
               <Link href={`/products/${activeProduct.id}/reviews`} className="text-xs font-semibold text-brand-brown hover:underline">See more</Link>
            </div>
            
            {/* Reviews List */}
            <div className="space-y-4">
              {activeProduct.reviews && activeProduct.reviews.length > 0 ? (
                activeProduct.reviews.map((rev) => (
                  <div key={rev.id} className="bg-brand-gray/30 p-4 rounded-2xl shadow-sm border border-brand-charcoal/5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-brand-gray/80 rounded-full overflow-hidden shrink-0">
                         <img src={`https://ui-avatars.com/api/?name=${rev.userName}&background=random`} alt={rev.userName} className="w-full h-full" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                           <h4 className="text-xs font-semibold text-brand-charcoal">{rev.userName}</h4>
                           <span className="text-[9px] text-brand-charcoal/40 font-light">
                             {new Date(rev.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-2.5 w-2.5 ${
                                s <= rev.rating
                                  ? "fill-amber-400 stroke-amber-400"
                                  : "fill-transparent stroke-brand-charcoal/20"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-brand-charcoal/80 mt-2 font-light leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-charcoal/40 font-light italic">
                  No reviews submitted yet. Be the first to leave a review!
                </p>
              )}
            </div>

            {/* Write a review Form */}
            <div className="bg-brand-brown/5 p-5 rounded-2xl border border-brand-brown/15 mt-6">
              <h3 className="text-sm font-semibold font-serif text-brand-charcoal mb-3">
                Write a Review
              </h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            s <= reviewRating
                              ? "fill-amber-400 stroke-amber-400"
                              : "fill-transparent stroke-brand-charcoal/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full rounded-xl border border-brand-charcoal/10 shadow-sm bg-brand-bg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Review Title (Optional)"
                    className="w-full rounded-xl border border-brand-charcoal/10 shadow-sm bg-brand-bg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none"
                  />
                </div>

                <div>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts about this garment's texture, weight, and style fit..."
                    className="w-full rounded-xl border border-brand-charcoal/10 shadow-sm bg-brand-bg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-green focus:outline-none resize-none"
                  />
                </div>

                {reviewSuccess && (
                  <div className="text-[10px] text-brand-green font-semibold bg-brand-green/10 border border-brand-green/20 rounded-lg p-2">
                    ✓ Review submitted successfully!
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-brand-brown text-brand-bg rounded-xl px-6 py-2 text-xs font-semibold tracking-wide hover:bg-brand-brown-dark transition-all cursor-pointer w-fit"
                >
                  Submit Review
                </button>
              </form>
            </div>
            
          </div>

        </div>

        {/* More All You Needs - Suggested Products */}
        {suggestedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-brand-charcoal/10">
            <h2 className="text-3xl font-serif font-semibold text-brand-charcoal text-center mb-10">More All You Needs.</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {suggestedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group cursor-pointer">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-brand-gray mb-4 relative">
                    <img 
                      src={product.images[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Hover Add to cart quick action could go here */}
                  </div>
                  <h3 className="text-sm font-semibold text-brand-charcoal line-clamp-1">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-bold text-brand-charcoal">${product.price.toFixed(2)}</span>
                     <span className="text-[10px] text-brand-charcoal/50 line-through">${(product.price * 1.2).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      <CartDrawer />

      <Lightbox 
        images={displayImages.map(img => img?.split('#color=')[0]).filter(Boolean)} 
        currentIndex={lightboxIndex} 
        isOpen={isLightboxOpen} 
        onClose={() => setIsLightboxOpen(false)} 
        onNavigate={setLightboxIndex} 
      />
    </div>
  );
}
