"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProductStore, ProductItem } from "@/store/useProductStore";
import { ArrowLeft } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";
import AuthModal from "@/components/AuthModal";

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchProductDetails } = useProductStore();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    const id = Number(params.id);
    if (!id) return;
    
    fetchProductDetails(id).then(data => {
      setProduct(data);
      setLoading(false);
    });
  }, [params.id, fetchProductDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center flex-col gap-4">
        <p className="text-brand-charcoal/50">Product not found.</p>
        <button onClick={() => router.push("/admin")} className="text-brand-charcoal hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Group images by color
  const colorImages: Record<string, string[]> = {};
  
  // Extract images with `#color=` tags
  product.images.forEach(imgUrl => {
    const hashIndex = imgUrl.indexOf("#color=");
    if (hashIndex !== -1) {
      const color = decodeURIComponent(imgUrl.substring(hashIndex + 7));
      if (!colorImages[color]) colorImages[color] = [];
      colorImages[color].push(imgUrl);
    }
  });

  return (
    <main className="min-h-screen bg-brand-bg text-brand-charcoal selection:bg-brand-green/30 font-sans flex flex-col">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <div className="flex-1 pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <button 
          onClick={() => router.push("/admin")}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-charcoal/60 hover:text-brand-charcoal transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main details column */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-charcoal tracking-tight mb-2">
                {product.title}
              </h1>
              <p className="text-xl text-brand-charcoal/60 font-serif mb-6">₹{product.price.toFixed(2)}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-brand-charcoal/5 text-brand-charcoal rounded-full text-xs font-bold uppercase tracking-wide">
                  {product.category}
                </span>
                {product.sizes.map(s => (
                  <span key={s} className="px-3 py-1 bg-brand-charcoal text-brand-bg rounded-full text-xs font-bold uppercase tracking-wide">
                    {s}
                  </span>
                ))}
              </div>

              <div className="border-t border-brand-charcoal/10 pt-6">
                <h3 className="font-semibold text-xs font-serif uppercase tracking-wider text-brand-charcoal/50 mb-3">Description</h3>
                <p className="text-sm font-light text-brand-charcoal/80 leading-relaxed font-sans">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Color sections column */}
          <div className="lg:col-span-2 space-y-12">
            <h2 className="text-2xl font-serif border-b border-brand-charcoal/10 pb-4">Color Variants Overview</h2>
            
            {product.colors.length === 0 && (
              <p className="text-brand-charcoal/50 italic">No colors assigned to this product.</p>
            )}

            {product.colors.map(color => {
              const imagesForColor = colorImages[color] || [];
              
              return (
                <div key={color} className="bg-white/50 border border-brand-charcoal/10 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-12 h-12 rounded-full shadow-sm border border-brand-charcoal/20"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <h3 className="font-bold text-lg">{color}</h3>
                      <p className="text-xs font-semibold text-brand-charcoal/50 uppercase tracking-widest">{imagesForColor.length} images assigned</p>
                    </div>
                  </div>

                  {imagesForColor.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {imagesForColor.map((url, i) => (
                        <div 
                          key={i} 
                          className="aspect-[3/4] bg-brand-charcoal/5 rounded-xl overflow-hidden group cursor-pointer"
                          onClick={() => openLightbox(imagesForColor.map(u => u.split('#color=')[0]), i)}
                        >
                          <img 
                            src={url.split('#color=')[0]} 
                            alt={`${color} view ${i + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl border border-dashed border-brand-charcoal/20 flex items-center justify-center bg-brand-charcoal/5 text-brand-charcoal/40 text-sm font-medium">
                      No specific images for this color
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />

      <Lightbox 
        images={lightboxImages} 
        currentIndex={lightboxIndex} 
        isOpen={isLightboxOpen} 
        onClose={() => setIsLightboxOpen(false)} 
        onNavigate={setLightboxIndex} 
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />
    </main>
  );
}
