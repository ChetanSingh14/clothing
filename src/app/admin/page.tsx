"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useProductStore } from "@/store/useProductStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAlertStore } from "@/store/useAlertStore";
import { shallow } from "zustand/shallow";
import { Plus, Trash2, Tag, Star, Package, Users, Layers, UploadCloud, Loader2, RefreshCw, BarChart2, UserCheck, Shield, ShoppingBag, DollarSign, Calendar, Edit, Settings, Eye, X, Image as ImageIcon, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Lightbox from "@/components/Lightbox";
import PageLoader from "@/components/PageLoader";
import ColorPickerModal from "@/components/ColorPickerModal";
import MediaRenderer from "@/components/MediaRenderer";
import { formatColor } from "@/utils/color";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { 
    stats, 
    users, 
    orders, 
    reviews, 
    loading, 
    fetchStats, 
    fetchUsers, 
    fetchOrders, 
    fetchReviews, 
    deleteReview, 
    createProduct, 
    deleteProduct, 
    updateProduct,
    uploadProductImage,
    adminUpdateUser,
    updateOrderStatus,
    nimbusShipOrder,
    nimbusCancelOrder
  } = useAdminStore();
  
  const { products, fetchProducts } = useProductStore();

  const categories = useSettingsStore((state) => state.categories) || ["T-Shirts", "Couple"];
  const uniqueProductCategories = Array.from(new Set(products.map((p) => p.category)))
    .filter((cat) => cat && !categories.includes(cat));
  const adminCategoriesList = [...categories, ...uniqueProductCategories];

  const companyName = useSettingsStore((state) => state.companyName);
  const logoUrl = useSettingsStore((state) => state.logoUrl);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, products, reviews, orders, users, settings

  // Brand customize states
  const [tempCompanyName, setTempCompanyName] = useState("");
  const [tempLogoUrl, setTempLogoUrl] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Edit user account states
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [editPassword, setEditPassword] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [modelUrl, setModelUrl] = useState<string>("");
  const [modelThumbnailUrl, setModelThumbnailUrl] = useState<string>("");
  
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<'default' | 'male' | 'female'>('default');

  // Form states for Product Upload
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("T-Shirts");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [colorsInput, setColorsInput] = useState("#8B5A2B, #4A3B32, #A0522D");
  const [maleColorsInput, setMaleColorsInput] = useState("#000000, #FFFFFF");
  const [femaleColorsInput, setFemaleColorsInput] = useState("#FFC0CB, #FFFFFF");
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L"]);
  const [selectedMaleSizes, setSelectedMaleSizes] = useState<string[]>(["M", "L", "XL"]);
  const [selectedFemaleSizes, setSelectedFemaleSizes] = useState<string[]>(["S", "M", "L"]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedModelUrl, setUploadedModelUrl] = useState("");
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  // Custom Orders States
  const [customOrders, setCustomOrders] = useState<any[]>([]);

  const fetchCustomOrders = async () => {
    try {
      const res = await apiFetch("/custom-orders/admin");
      if (res.success) setCustomOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch custom orders", err);
    }
  };

  const handleCustomOrderStatusUpdate = async (orderId: number, status: string) => {
    try {
      await apiFetch(`/custom-orders/admin/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      useAlertStore.getState().showAlert(`Custom order #${orderId} status updated.`);
      fetchCustomOrders();
    } catch (err: any) {
      useAlertStore.getState().showAlert(err.message || "Failed to update custom order status");
    }
  };

  // Hero Gallery States
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);

  const fetchGalleryImages = async () => {
    try {
      const res = await apiFetch("/gallery");
      if (res.success) setGalleryImages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadGalleryImage = async (file: File) => {
    try {
      setUploadingGalleryImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const res = await apiFetch("/gallery", {
          method: "POST",
          body: JSON.stringify({ url: base64Data }),
        });
        if (res.success) {
          useAlertStore.getState().showAlert("Image uploaded to gallery!");
          fetchGalleryImages();
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  const deleteGalleryImage = async (id: number) => {
    try {
      const res = await apiFetch(`/gallery/${id}`, { method: "DELETE" });
      if (res.success) {
        useAlertStore.getState().showAlert("Image deleted!");
        fetchGalleryImages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cinematic Hero States
  const [cinematicImages, setCinematicImages] = useState<any[]>([]);
  const [uploadingCinematicImage, setUploadingCinematicImage] = useState(false);
  const [cinematicLabel, setCinematicLabel] = useState("");

  const fetchCinematicImages = async () => {
    try {
      const res = await apiFetch("/cinematic-hero");
      if (res.success) setCinematicImages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadCinematicImage = async (file: File) => {
    if (!cinematicLabel) {
      useAlertStore.getState().showAlert("Please enter a label for the image!");
      return;
    }
    try {
      setUploadingCinematicImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const res = await apiFetch("/cinematic-hero", {
          method: "POST",
          body: JSON.stringify({ url: base64Data, label: cinematicLabel }),
        });
        if (res.success) {
          useAlertStore.getState().showAlert("Image uploaded to cinematic hero!");
          setCinematicLabel("");
          fetchCinematicImages();
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingCinematicImage(false);
    }
  };

  const deleteCinematicImage = async (id: number) => {
    try {
      const res = await apiFetch(`/cinematic-hero/${id}`, { method: "DELETE" });
      if (res.success) {
        useAlertStore.getState().showAlert("Cinematic image deleted!");
        fetchCinematicImages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const availableSizesList = ["S", "M", "L", "XL", "XXL", "7", "8", "9", "10", "11"];

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (companyName) setTempCompanyName(companyName);
    if (logoUrl) setTempLogoUrl(logoUrl);
  }, [companyName, logoUrl]);

  useEffect(() => {
    if (initialized && !user) {
      setIsAuthModalOpen(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    if (activeTab === "gallery") {
      fetchGalleryImages();
    }
    if (activeTab === "cinematic") {
      fetchCinematicImages();
    }
    if (activeTab === "custom-orders") {
      fetchCustomOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (initialized) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
      } else {
        syncData();
      }
    }
  }, [user, initialized]);

  if (!initialized || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <PageLoader />
        <Footer />
      </div>
    );
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const url = await uploadProductImage(base64Data);
      if (url) {
        setUploadedImageUrl(url);
      } else {
        useAlertStore.getState().showAlert("Failed to upload image. Make sure server is running.");
      }
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleColorImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, color: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingColor(color);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const url = await uploadProductImage(base64Data);
      if (url) {
        setColorImages(prev => ({
          ...prev,
          [color]: [...(prev[color] || []), url]
        }));
      } else {
        useAlertStore.getState().showAlert("Failed to upload image. Make sure server is running.");
      }
      setUploadingColor(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const uploadPromise = new Promise<string | null>((resolve) => {
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const url = await uploadProductImage(base64Data);
          resolve(url);
        };
        reader.readAsDataURL(file);
      });
      const url = await uploadPromise;
      if (url) {
        setImages(prev => [...prev, url]);
      } else {
        useAlertStore.getState().showAlert(`Failed to upload ${file.name}`);
      }
    }
    setUploadingGallery(false);
  };

  const handleModelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingModel(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const url = await uploadProductImage(base64Data);
      if (url) {
        setUploadedModelUrl(url);
      } else {
        useAlertStore.getState().showAlert("Failed to upload 3D model. Make sure server is running.");
      }
      setUploadingModel(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleMaleSizeToggle = (size: string) => {
    if (selectedMaleSizes.includes(size)) {
      setSelectedMaleSizes(selectedMaleSizes.filter((s) => s !== size));
    } else {
      setSelectedMaleSizes([...selectedMaleSizes, size]);
    }
  };

  const handleFemaleSizeToggle = (size: string) => {
    if (selectedFemaleSizes.includes(size)) {
      setSelectedFemaleSizes(selectedFemaleSizes.filter((s) => s !== size));
    } else {
      setSelectedFemaleSizes([...selectedFemaleSizes, size]);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !uploadedImageUrl) {
      useAlertStore.getState().showAlert("Please fill all required fields and upload a main image.");
      return;
    }

    const colors = colorsInput.split(",").map((c) => c.trim()).filter((c) => c !== "");
    const maleColors = maleColorsInput.split(",").map((c) => c.trim()).filter((c) => c !== "");
    const femaleColors = femaleColorsInput.split(",").map((c) => c.trim()).filter((c) => c !== "");
    
    const imagesToSubmit = [uploadedImageUrl];
    
    if (category.toLowerCase().includes("couple")) {
      images.forEach((url) => {
        imagesToSubmit.push(url);
      });
    } else {
      Object.entries(colorImages).forEach(([color, urls]) => {
        urls.forEach(url => {
          imagesToSubmit.push(`${url}#color=${encodeURIComponent(color)}`);
        });
      });
    }

    if (uploadedModelUrl) {
      imagesToSubmit.push(uploadedModelUrl);
    }

    const payload = {
      title,
      description,
      price: Number(price),
      category,
      images: imagesToSubmit,
      colors: category.toLowerCase().includes("couple") 
        ? Array.from(new Set([...maleColors, ...femaleColors]))
        : colors,
      sizes: selectedSizes,
      maleColors: category.toLowerCase().includes("couple") ? maleColors : [],
      femaleColors: category.toLowerCase().includes("couple") ? femaleColors : [],
      maleSizes: category.toLowerCase().includes("couple") ? selectedMaleSizes : [],
      femaleSizes: category.toLowerCase().includes("couple") ? selectedFemaleSizes : [],
    };

    let success = false;
    if (editingProductId) {
      success = await updateProduct(editingProductId, payload);
    } else {
      success = await createProduct(payload);
    }

    if (success) {
      setEditingProductId(null);
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("T-Shirts");
      setIsCustomCategory(false);
      setUploadedImageUrl("");
      setUploadedModelUrl("");
      setColorImages({});
      setImages([]);
      setFormSuccess(true);
      await fetchProducts(); // reload products listing
      await fetchStats(); // reload stats
      setTimeout(() => setFormSuccess(false), 3000);
    }
  };

  const handleEditProductClick = (prod: any) => {
    setEditingProductId(prod.id);
    setTitle(prod.title);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setCategory(prod.category);
    setIsCustomCategory(false);
    setColorsInput(prod.colors?.join(", ") || "");
    setMaleColorsInput(prod.maleColors?.join(", ") || "");
    setFemaleColorsInput(prod.femaleColors?.join(", ") || "");
    setSelectedSizes(prod.sizes || ["S", "M", "L"]);
    setSelectedMaleSizes(prod.maleSizes || ["M", "L", "XL"]);
    setSelectedFemaleSizes(prod.femaleSizes || ["S", "M", "L"]);
    
    // Parse images array
    if (prod.images && prod.images.length > 0) {
      setUploadedImageUrl(prod.images[0]); // Primary image
      
      const parsedColorImages: Record<string, string[]> = {};
      const parsedGalleryImages: string[] = [];
      let modelFound = "";
      
      const isCouple = prod.category?.toLowerCase().includes("couple");
      
      prod.images.slice(1).forEach((img: string) => {
        if (img.endsWith(".glb") || img.endsWith(".gltf")) {
          modelFound = img;
        } else {
          if (img.includes("#color=")) {
            const [url, hash] = img.split("#color=");
            const color = decodeURIComponent(hash);
            if (!parsedColorImages[color]) parsedColorImages[color] = [];
            parsedColorImages[color].push(url);
          } else {
            parsedGalleryImages.push(img);
          }
        }
      });
      
      setColorImages(parsedColorImages);
      setImages(parsedGalleryImages);
      setUploadedModelUrl(modelFound);
    } else {
      setUploadedImageUrl("");
      setUploadedModelUrl("");
      setColorImages({});
      setImages([]);
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: number) => {
    useAlertStore.getState().showConfirm("Are you sure you want to delete this product?", async () => {
      const success = await deleteProduct(id);
      if (success) {
        await fetchProducts();
        await fetchStats();
      }
    });
  };

  const handleOrderStatusUpdate = async (orderId: number, status: string) => {
    const success = await updateOrderStatus(orderId, status);
    if (success) {
      useAlertStore.getState().showAlert(`Order #${orderId} status updated to ${status}`);
    } else {
      useAlertStore.getState().showAlert("Failed to update order status.");
    }
  };

  const handleNimbusShip = async (orderId: number) => {
    const res = await nimbusShipOrder(orderId);
    if (res.success) {
      useAlertStore.getState().showAlert(res.message || "Shipped via Nimbuspost");
    } else {
      useAlertStore.getState().showAlert(res.message || "Failed to ship");
    }
  };

  const handleNimbusCancel = async (orderId: number) => {
    useAlertStore.getState().showConfirm("Are you sure you want to cancel the Nimbuspost shipment?", async () => {
      const res = await nimbusCancelOrder(orderId);
      if (res.success) {
        useAlertStore.getState().showAlert(res.message || "Shipment cancelled");
      } else {
        useAlertStore.getState().showAlert(res.message || "Failed to cancel shipment");
      }
    });
  };

  const handleDeleteReview = async (id: number) => {
    useAlertStore.getState().showConfirm("Are you sure you want to delete this review?", async () => {
      const success = await deleteReview(id);
      if (success) {
        useAlertStore.getState().showAlert("Review deleted successfully.");
      }
    });
  };

  const syncData = async () => {
    await fetchStats();
    await fetchProducts();
    await fetchUsers();
    await fetchOrders();
    await fetchReviews();
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green selection:text-brand-bg">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-grow py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Dashboard Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-charcoal/5 pb-6 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-green uppercase">
              back-office management
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-charcoal font-serif mt-2">
              Atelier Dashboard
            </h1>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={syncData}
              className="flex items-center gap-1.5 rounded-xl border border-brand-charcoal/10 bg-brand-bg px-4 py-2.5 text-xs text-brand-charcoal/60 hover:bg-brand-charcoal/5 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Sync Server Data</span>
            </button>
          </div>
        </div>

        {/* Sidebar + Content Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-brand-gray border border-brand-charcoal/5 p-4 rounded-3xl space-y-1.5 shadow-xs">
              <span className="px-4 py-2 block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">
                Menu Navigator
              </span>
              {[
                { id: "overview", label: "Dashboard Overview", icon: BarChart2 },
                { id: "products", label: "Products Inventory", icon: Package },
                { id: "reviews", label: "Reviews Manager", icon: Star },
                { id: "orders", label: "Sales & Orders", icon: ShoppingBag },
                { id: "custom-orders", label: "Custom Orders", icon: Paintbrush },
                { id: "users", label: "Customer Accounts", icon: Users },
                { id: "gallery", label: "Hero Gallery", icon: ImageIcon },
                { id: "cinematic", label: "Cinematic Hero", icon: Layers },
                { id: "settings", label: "Brand Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-charcoal text-brand-bg shadow-xs"
                        : "text-brand-charcoal/55 hover:text-brand-charcoal hover:bg-brand-charcoal/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="flex-grow w-full">
            
            {/* -------------------- TAB CONTENT: OVERVIEW -------------------- */}
            {activeTab === "overview" && (
              <div className="space-y-12">
                {/* Stats Grid */}
                {stats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        label: "total active items",
                        value: stats.totalProducts,
                        icon: Package,
                        color: "text-brand-brown bg-brand-brown/10 border-brand-brown/20",
                      },
                      {
                        label: "gross revenue",
                        value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
                        icon: DollarSign,
                        color: "text-brand-green bg-brand-green/10 border-brand-green/20",
                      },
                      {
                        label: "feedbacks collected",
                        value: stats.totalReviews,
                        icon: Star,
                        color: "text-amber-600 bg-amber-50 border-amber-100",
                      },
                      {
                        label: "total sales checkout",
                        value: stats.totalOrders || 0,
                        icon: ShoppingBag,
                        color: "text-purple-600 bg-purple-50 border-purple-100",
                      },
                    ].map((card, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={card.label}
                        className="p-6 rounded-2xl border border-brand-charcoal/5 flex flex-col justify-between min-h-32 bg-brand-bg"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">
                            {card.label}
                          </span>
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.color}`}>
                            <card.icon className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold font-serif text-brand-charcoal mt-4">
                          {card.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Quick Logs */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  {/* Recent Customer Sign-Ups */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold font-serif text-brand-charcoal">
                        Recent Sign-Ups
                      </h3>
                      <button
                        onClick={() => setActiveTab("users")}
                        className="text-xs font-bold text-brand-green hover:underline cursor-pointer"
                      >
                        View Directory
                      </button>
                    </div>
                    
                    <div className="border border-brand-charcoal/5 rounded-2xl bg-brand-bg divide-y divide-brand-charcoal/5 overflow-hidden shadow-xs">
                      {users.slice(0, 5).map((u) => (
                        <div key={u.id} className="p-4 flex items-center justify-between text-xs hover:bg-brand-gray/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center text-xs uppercase">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-brand-charcoal">{u.name}</h4>
                              <p className="text-[10px] text-brand-charcoal/40 font-light mt-0.5">{u.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-brand-charcoal/40 font-light">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <div className="p-8 text-center text-xs text-brand-charcoal/40 italic">
                          No users registered yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Orders Log */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold font-serif text-brand-charcoal">
                        Recent Sales Orders
                      </h3>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-bold text-brand-green hover:underline cursor-pointer"
                      >
                        View Orders
                      </button>
                    </div>
                    
                    <div className="border border-brand-charcoal/5 rounded-2xl bg-brand-bg divide-y divide-brand-charcoal/5 overflow-hidden shadow-xs">
                      {orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} className="p-4 flex items-center justify-between text-xs hover:bg-brand-gray/20 transition-colors">
                          <div>
                            <h4 className="font-semibold text-brand-charcoal">Order #{ord.id}</h4>
                            <p className="text-[10px] text-brand-charcoal/40 mt-0.5">By {ord.user.name}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-brand-charcoal font-serif">₹{ord.totalAmount.toFixed(2)}</div>
                            <span className="text-[9px] text-brand-charcoal/40 font-light">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="p-8 text-center text-xs text-brand-charcoal/40 italic">
                          No checkout orders logged.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: PRODUCTS -------------------- */}
            {activeTab === "products" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Form */}
                <div className="xl:col-span-5 bg-brand-gray/30 p-8 rounded-3xl border border-brand-charcoal/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-serif font-bold text-brand-charcoal">
                      {editingProductId ? "Edit Product" : "Upload New Product"}
                    </h3>
                    {editingProductId && (
                      <button 
                        onClick={() => {
                          setEditingProductId(null);
                          setTitle("");
                          setDescription("");
                          setPrice("");
                          setCategory("T-Shirts");
                          setIsCustomCategory(false);
                          setUploadedImageUrl("");
                          setUploadedModelUrl("");
                          setColorImages({});
                        }}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pTitle">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        id="pTitle"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Minimalist Wool Coat"
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pDesc">
                        Detailed Description *
                      </label>
                      <textarea
                        id="pDesc"
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Specify clothing weights, tailored linings details, wool percentage..."
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pPrice">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          id="pPrice"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="245.00"
                          className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pCat">
                          Category *
                        </label>
                        <select
                          id="pCat"
                          value={isCustomCategory ? "custom" : category}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "custom") {
                              setIsCustomCategory(true);
                              setCategory("");
                            } else {
                              setIsCustomCategory(false);
                              setCategory(val);
                            }
                          }}
                          className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none cursor-pointer"
                        >
                          {adminCategoriesList.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="custom">Custom...</option>
                        </select>
                        {isCustomCategory && (
                          <input
                            type="text"
                            placeholder="Enter custom category..."
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                            required
                          />
                        )}
                        {(!isCustomCategory && category?.toLowerCase().includes("couple")) && (
                          <p className="text-[10px] text-brand-charcoal/60 mt-1.5 italic">
                            💡 "Couple" category items will automatically split sizes and colors into Male and Female selections on the product page!
                          </p>
                        )}
                      </div>
                    </div>

                    {category?.toLowerCase().includes("couple") ? (
                      <>
                        {/* Male Colors */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                              Male Colors Hex Codes (Comma separated)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setColorPickerTarget('male');
                                setIsColorPickerOpen(true);
                              }}
                              className="text-[10px] font-bold uppercase tracking-wider text-brand-green hover:text-brand-green/80 flex items-center gap-1 bg-brand-green/10 px-2 py-1 rounded-md"
                            >
                              <Plus className="h-3 w-3" />
                              Pick Colors
                            </button>
                          </div>

                          {maleColorsInput.trim() !== "" && (
                            <div className="mt-2 mb-2 flex flex-wrap gap-2">
                              {maleColorsInput.split(",").map(c => c.trim()).filter(Boolean).map((hex, i) => (
                                <div key={i} className="flex items-center gap-1.5 bg-brand-bg px-2.5 py-1.5 rounded-full border border-brand-charcoal/10 shadow-sm">
                                  <div className="w-3.5 h-3.5 rounded-full shadow-sm border border-brand-charcoal/10" style={{ backgroundColor: hex }} />
                                  <span className="text-[10px] font-mono text-brand-charcoal uppercase">{hex}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const currentColors = maleColorsInput.split(",").map(c => c.trim()).filter(Boolean);
                                      currentColors.splice(i, 1);
                                      setMaleColorsInput(currentColors.join(", "));
                                    }}
                                    className="ml-1 text-brand-charcoal/40 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <input
                            type="text"
                            value={maleColorsInput}
                            onChange={(e) => setMaleColorsInput(e.target.value)}
                            placeholder="#000000, #333333 (Or use the picker)"
                            className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                          />
                        </div>

                        {/* Female Colors */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                              Female Colors Hex Codes (Comma separated)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setColorPickerTarget('female');
                                setIsColorPickerOpen(true);
                              }}
                              className="text-[10px] font-bold uppercase tracking-wider text-brand-green hover:text-brand-green/80 flex items-center gap-1 bg-brand-green/10 px-2 py-1 rounded-md"
                            >
                              <Plus className="h-3 w-3" />
                              Pick Colors
                            </button>
                          </div>

                          {femaleColorsInput.trim() !== "" && (
                            <div className="mt-2 mb-2 flex flex-wrap gap-2">
                              {femaleColorsInput.split(",").map(c => c.trim()).filter(Boolean).map((hex, i) => (
                                <div key={i} className="flex items-center gap-1.5 bg-brand-bg px-2.5 py-1.5 rounded-full border border-brand-charcoal/10 shadow-sm">
                                  <div className="w-3.5 h-3.5 rounded-full shadow-sm border border-brand-charcoal/10" style={{ backgroundColor: hex }} />
                                  <span className="text-[10px] font-mono text-brand-charcoal uppercase">{hex}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const currentColors = femaleColorsInput.split(",").map(c => c.trim()).filter(Boolean);
                                      currentColors.splice(i, 1);
                                      setFemaleColorsInput(currentColors.join(", "));
                                    }}
                                    className="ml-1 text-brand-charcoal/40 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <input
                            type="text"
                            value={femaleColorsInput}
                            onChange={(e) => setFemaleColorsInput(e.target.value)}
                            placeholder="#FFC0CB, #FFFFFF (Or use the picker)"
                            className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                          />
                        </div>
                        {/* Male Sizes */}
                        <div>
                          <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                            Available Male Sizes
                          </label>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {availableSizesList.map((size) => {
                              const isChecked = selectedMaleSizes.includes(size);
                              return (
                                <button
                                  type="button"
                                  key={size}
                                  onClick={() => handleMaleSizeToggle(size)}
                                  className={`h-7 min-w-8 px-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                    isChecked
                                      ? "bg-brand-charcoal border-brand-charcoal text-brand-bg"
                                      : "border-brand-charcoal/10 bg-brand-bg text-brand-charcoal/60 hover:border-brand-charcoal"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Female Sizes */}
                        <div>
                          <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                            Available Female Sizes
                          </label>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {availableSizesList.map((size) => {
                              const isChecked = selectedFemaleSizes.includes(size);
                              return (
                                <button
                                  type="button"
                                  key={size}
                                  onClick={() => handleFemaleSizeToggle(size)}
                                  className={`h-7 min-w-8 px-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                    isChecked
                                      ? "bg-brand-charcoal border-brand-charcoal text-brand-bg"
                                      : "border-brand-charcoal/10 bg-brand-bg text-brand-charcoal/60 hover:border-brand-charcoal"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Default Colors */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pColors">
                              Colors Hex Codes (Comma separated)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setColorPickerTarget('default');
                                setIsColorPickerOpen(true);
                              }}
                              className="text-[10px] font-bold uppercase tracking-wider text-brand-green hover:text-brand-green/80 flex items-center gap-1 bg-brand-green/10 px-2 py-1 rounded-md"
                            >
                              <Plus className="h-3 w-3" />
                              Pick Colors
                            </button>
                          </div>
                          
                          {colorsInput.trim() !== "" && (
                            <div className="mt-2 mb-2 flex flex-wrap gap-2">
                              {colorsInput.split(",").map(c => c.trim()).filter(Boolean).map((hex, i) => (
                                <div key={i} className="flex items-center gap-1.5 bg-brand-bg px-2.5 py-1.5 rounded-full border border-brand-charcoal/10 shadow-sm">
                                  <div className="w-3.5 h-3.5 rounded-full shadow-sm border border-brand-charcoal/10" style={{ backgroundColor: hex }} />
                                  <span className="text-[10px] font-mono text-brand-charcoal uppercase">{hex}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const currentColors = colorsInput.split(",").map(c => c.trim()).filter(Boolean);
                                      currentColors.splice(i, 1);
                                      setColorsInput(currentColors.join(", "));
                                    }}
                                    className="ml-1 text-brand-charcoal/40 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <input
                            type="text"
                            id="pColors"
                            value={colorsInput}
                            onChange={(e) => setColorsInput(e.target.value)}
                            placeholder="#8B5A2B, #4A3B32 (Or use the picker)"
                            className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                          />
                        </div>

                        {/* Default Sizes */}
                        <div>
                          <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                            Available Sizes
                          </label>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {availableSizesList.map((size) => {
                              const isChecked = selectedSizes.includes(size);
                              return (
                                <button
                                  type="button"
                                  key={size}
                                  onClick={() => handleSizeToggle(size)}
                                  className={`h-7 min-w-8 px-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                    isChecked
                                      ? "bg-brand-charcoal border-brand-charcoal text-brand-bg"
                                      : "border-brand-charcoal/10 bg-brand-bg text-brand-charcoal/60 hover:border-brand-charcoal"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                        Product Image *
                      </label>
                      {uploadedImageUrl ? (
                        <div className="mt-1.5 relative w-32 h-32 group rounded-xl border border-brand-charcoal/20 overflow-hidden bg-brand-gray">
                          <MediaRenderer src={uploadedImageUrl} alt="Product upload preview" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => setUploadedImageUrl("")}
                            className="absolute top-1.5 right-1.5 bg-red-500/90 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1.5 relative border border-dashed border-brand-charcoal/20 rounded-xl bg-brand-bg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-charcoal/5 transition-colors">
                          <UploadCloud className="h-6 w-6 text-brand-charcoal/40 mb-1.5" />
                          <span className="text-[10px] font-semibold text-brand-charcoal/60">
                            {uploadingImage ? "Uploading file..." : "Attach high-res photo"}
                          </span>
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/webm,video/x-m4v,video/quicktime"
                            disabled={uploadingImage}
                            onChange={handleImageFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                          Product Gallery Media (Up to 15 items)
                        </label>
                          <div className="relative">
                            <button
                              type="button"
                              className="text-[10px] bg-brand-charcoal text-brand-bg px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-charcoal/80 cursor-pointer"
                            >
                              {uploadingGallery ? "Uploading..." : "Upload Media"}
                            </button>
                            <input
                              type="file"
                              multiple
                              accept="image/*,video/mp4,video/webm,video/x-m4v,video/quicktime"
                              disabled={uploadingGallery}
                              onChange={handleGalleryImagesUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                        </div>
                        <div className="space-y-3 mt-2 mb-6">
                          {images.length > 0 ? (
                            <div className="flex flex-wrap gap-2 bg-brand-charcoal/5 p-3 rounded-xl border border-brand-charcoal/10">
                              {images.map((url, imgIdx) => (
                                <div 
                                  key={imgIdx} 
                                  className="relative h-16 w-12 bg-brand-gray rounded-md overflow-hidden border border-brand-charcoal/10 cursor-pointer group"
                                >
                                  <MediaRenderer src={url} alt={`Gallery ${imgIdx}`} className="object-cover h-full w-full" onClick={() => openLightbox(images, imgIdx)} />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setImages(prev => prev.filter((_, i) => i !== imgIdx));
                                    }}
                                    className="absolute top-0 right-0 bg-red-500/90 text-white rounded-bl-md p-[2px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 border border-dashed border-brand-charcoal/20 rounded-xl text-brand-charcoal/50 text-[10px] uppercase font-bold">
                              No gallery media uploaded yet.
                            </div>
                          )}
                        </div>
                      </div>
                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                        Color-Specific Media (Up to 8 per color)
                      </label>
                      <div className="space-y-3 mt-2 mb-6">
                        {(() => {
                          const isCouple = category?.toLowerCase().includes("couple");
                          let activeSlots: { gender: string, color: string, key: string }[] = [];
                          
                          if (isCouple) {
                            const maleSlots = maleColorsInput.split(",").map(c => c.trim()).filter(Boolean).map(color => ({ gender: "Male", color, key: `Male:${color}` }));
                            const femaleSlots = femaleColorsInput.split(",").map(c => c.trim()).filter(Boolean).map(color => ({ gender: "Female", color, key: `Female:${color}` }));
                            activeSlots = [...maleSlots, ...femaleSlots];
                          } else {
                            activeSlots = colorsInput.split(",").map(c => c.trim()).filter(Boolean).map(color => ({ gender: "", color, key: color }));
                          }
                          
                          return activeSlots.map((slot, idx) => {
                              const uploadedImages = colorImages[slot.key] || [];
                              const uploadedCount = uploadedImages.length;
                              return (
                                <div key={idx} className="flex flex-col gap-3 bg-brand-charcoal/5 p-3 rounded-xl border border-brand-charcoal/10">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="h-6 w-6 rounded-full border border-brand-charcoal/20" style={{ backgroundColor: slot.color }}></span>
                                      <span className="text-xs font-semibold text-brand-charcoal">
                                        {slot.gender ? `${slot.gender} - ` : ""}{slot.color}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] text-brand-charcoal/50 font-bold uppercase">{uploadedCount}/8 items</span>
                                      {uploadedCount < 8 && (
                                        <div className="relative">
                                          <button type="button" className="text-[10px] bg-brand-charcoal text-brand-bg px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-charcoal/80 cursor-pointer">
                                            {uploadingColor === slot.key ? "Uploading..." : "Upload"}
                                          </button>
                                          <input
                                            type="file"
                                            accept="image/*,video/mp4,video/webm,video/x-m4v,video/quicktime"
                                            disabled={uploadingColor !== null}
                                            onChange={(e) => handleColorImageFileChange(e, slot.key)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {uploadedImages.length > 0 && (
                                    <div className="flex gap-2">
                                      {uploadedImages.map((url, imgIdx) => (
                                        <div 
                                          key={imgIdx} 
                                          className="relative h-12 w-10 bg-brand-gray rounded-md overflow-hidden border border-brand-charcoal/10 cursor-pointer group"
                                        >
                                          <MediaRenderer src={url} alt={`Preview ${imgIdx}`} className="object-cover h-full w-full" onClick={() => openLightbox(uploadedImages, imgIdx)} />
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setColorImages(prev => ({
                                                ...prev,
                                                [slot.key]: prev[slot.key].filter((_, i) => i !== imgIdx)
                                              }));
                                            }}
                                            className="absolute top-0 right-0 bg-red-500/90 text-white rounded-bl-md p-[2px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                          >
                                            <X size={10} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            });
                          })()}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                        3D Model (.glb) [Optional]
                      </label>
                      <div className="mt-1.5 relative border border-dashed border-brand-charcoal/20 rounded-xl bg-brand-bg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-charcoal/5 transition-colors">
                        <UploadCloud className="h-6 w-6 text-brand-charcoal/40 mb-1.5" />
                        <span className="text-[10px] font-semibold text-brand-charcoal/60">
                          {uploadingModel ? "Uploading model..." : uploadedModelUrl ? "Model uploaded ✓" : "Attach .glb file (Max 10MB)"}
                        </span>
                        <input
                          type="file"
                          accept=".glb"
                          disabled={uploadingModel}
                          onChange={handleModelFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    </div>

                    {formSuccess && (
                      <div className="text-xs text-brand-green font-semibold bg-brand-green/10 border border-brand-green/20 rounded-xl p-3">
                        ✓ Product published on live catalog successfully!
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || uploadingImage || uploadingModel}
                      className="w-full bg-brand-charcoal text-brand-bg rounded-xl py-3.5 text-xs font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
                    >
                      {loading ? "Publishing product..." : editingProductId ? "Update Product" : "Publish Product"}
                    </button>
                  </form>
                </div>

                {/* Inventory List */}
                <div className="xl:col-span-7 space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Active  Products Inventory ({products.length})
                  </h2>

                  <div className="border border-brand-charcoal/5 rounded-3xl overflow-hidden bg-brand-bg shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-brand-gray/50 border-b border-brand-charcoal/5 text-[10px] uppercase font-bold text-brand-charcoal/50 tracking-wider">
                            <th className="py-4.5 px-6">Garment</th>
                            <th className="py-4.5 px-6">Category</th>
                            <th className="py-4.5 px-6 text-right">Price</th>
                            <th className="py-4.5 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-charcoal/5 text-xs">
                          {products.map((prod) => (
                            <tr key={prod.id} className="hover:bg-brand-gray/20 transition-colors">
                              <td className="py-4 px-6 flex items-center gap-3">
                                <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-brand-gray flex-shrink-0">
                                  <MediaRenderer src={prod.images[0]} alt={prod.title} className="object-cover h-full w-full" />
                                </div>
                                <span className="font-semibold text-brand-charcoal leading-tight max-w-[160px] truncate">
                                  {prod.title}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-brand-charcoal/60 capitalize">
                                {prod.category}
                              </td>
                              <td className="py-4 px-6 font-bold text-right font-serif text-brand-charcoal">
                                ₹{prod.price.toFixed(2)}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Link
                                    href={`/admin/products/${prod.id}`}
                                    className="p-2 text-brand-charcoal/40 hover:text-brand-green rounded-full hover:bg-brand-green/10 transition-all cursor-pointer inline-flex items-center justify-center"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleEditProductClick(prod)}
                                    className="px-3 py-1.5 border border-brand-charcoal text-brand-charcoal rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-brand-charcoal hover:text-brand-bg transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-2 text-brand-charcoal/30 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-all cursor-pointer inline-flex items-center justify-center"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: REVIEWS -------------------- */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Feedbacks & Reviews Log
                  </h2>
                  <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-200">
                    {reviews.length} customer feedback(s)
                  </span>
                </div>

                <div className="border border-brand-charcoal/5 rounded-3xl overflow-hidden bg-brand-bg shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-brand-gray/50 border-b border-brand-charcoal/5 text-[10px] uppercase font-bold text-brand-charcoal/50 tracking-wider">
                          <th className="py-4.5 px-6">Product</th>
                          <th className="py-4.5 px-6">Customer</th>
                          <th className="py-4.5 px-6">Rating</th>
                          <th className="py-4.5 px-6">Comment</th>
                          <th className="py-4.5 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-charcoal/5 text-xs">
                        {reviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-brand-gray/20 transition-colors">
                            <td className="py-4.5 px-6 font-semibold text-brand-charcoal max-w-[150px] truncate">
                              {rev.product?.title || "Unknown Product"}
                            </td>
                            <td className="py-4.5 px-6 text-brand-charcoal/70">
                              {rev.userName}
                            </td>
                            <td className="py-4.5 px-6">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-brand-charcoal/10"}`} />
                                ))}
                              </div>
                            </td>
                            <td className="py-4.5 px-6 text-brand-charcoal/60 italic max-w-sm truncate">
                              "{rev.comment}"
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="p-2 text-brand-charcoal/30 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-all cursor-pointer inline-flex items-center justify-center"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {reviews.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-xs text-brand-charcoal/40 italic">
                              No customer reviews logged.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: ORDERS -------------------- */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Sales Order Logs
                  </h2>
                  <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold border border-purple-200">
                    {orders.length} order(s) processed
                  </span>
                </div>

                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div key={ord.id} className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-6 shadow-xs relative overflow-hidden">
                      {/* Header bar of order card */}
                      <div className="flex flex-col sm:flex-row justify-between border-b border-brand-charcoal/5 pb-4 mb-4 text-xs gap-3">
                        <div>
                          <div className="font-bold text-brand-charcoal text-sm flex items-center gap-2">
                            <span>Order #{ord.id}</span>
                            <select 
                              value={ord.status || "BOOKED"}
                              onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide outline-none cursor-pointer ${
                                ord.status === 'DELIVERED' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 
                                ord.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-200' : 
                                ord.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              <option value="BOOKED">Booked</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                          <div className="text-[10px] text-brand-charcoal/40 font-light mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(ord.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                          </div>
                          {ord.nimbuspostAwb && (
                            <div className="text-[10px] mt-2 bg-brand-charcoal/5 p-1 rounded font-medium inline-block">
                              AWB: {ord.nimbuspostAwb}
                              {ord.nimbuspostLabel && (
                                <a href={ord.nimbuspostLabel} target="_blank" rel="noreferrer" className="text-blue-500 ml-2 hover:underline">View Label</a>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="sm:text-right flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">Buyer profile</span>
                          <div className="font-semibold text-brand-charcoal">{ord.user.name}</div>
                          <div className="text-[10px] text-brand-charcoal/50 mb-2">{ord.user.email}</div>
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="text-xs bg-brand-charcoal text-brand-bg px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-charcoal/90 transition-all cursor-pointer inline-flex items-center gap-1 mt-auto"
                          >
                            <Eye className="h-3 w-3" />
                            View Full Details
                          </button>
                          
                          <div className="mt-2 flex gap-2 justify-end">
                            {!ord.nimbuspostAwb && ord.status === 'BOOKED' && (
                              <button
                                onClick={() => handleNimbusShip(ord.id)}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 cursor-pointer"
                              >
                                Ship with Nimbuspost
                              </button>
                            )}
                            {ord.nimbuspostAwb && ord.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleNimbusCancel(ord.id)}
                                className="text-[10px] text-red-500 underline cursor-pointer"
                              >
                                Cancel Shipment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Shipping Details */}
                      {ord.address && (
                        <div className="mt-4 p-4 rounded-2xl bg-brand-gray/30 border border-brand-charcoal/5 text-xs text-brand-charcoal/70">
                          <div className="font-semibold text-brand-charcoal mb-1 flex items-center justify-between">
                            <span>Shipping Address</span>
                            {ord.phone && <span className="text-[10px] font-mono">Ph: {ord.phone}</span>}
                          </div>
                          <div>{ord.fullName || ord.user.name}</div>
                          <div>{ord.address}</div>
                          {ord.landmark && <div>Landmark: {ord.landmark}</div>}
                          <div>{ord.city}, {ord.state} - {ord.pincode}</div>
                        </div>
                      )}

                      {/* Items details list */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-charcoal/40 block">Purchased Garments ({ord.items.length})</span>
                        <div className="divide-y divide-brand-charcoal/5">
                          {ord.items.map((item: any, idx: number) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <div className="relative h-10 w-8 rounded bg-brand-gray overflow-hidden flex-shrink-0">
                                    <MediaRenderer src={item.image} alt={item.title} className="object-cover h-full w-full" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold text-brand-charcoal">{item.title}</h4>
                                  <div className="flex items-center gap-2 text-[10px] text-brand-charcoal/50 font-light mt-0.5">
                                    <span className="uppercase">size: {item.size}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      color:{" "}
                                      {item.color.includes("M:") ? (
                                        <span className="font-semibold text-brand-charcoal/80 text-[10px] lowercase">{formatColor(item.color)}</span>
                                      ) : (
                                        <>
                                          <span className="font-semibold text-brand-charcoal/80 text-[10px] lowercase">{formatColor(item.color)}</span>
                                          <span className="h-2 w-2 rounded-full border border-brand-charcoal/10 inline-block" style={{ backgroundColor: item.color }} />
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-semibold text-brand-charcoal">₹{item.price.toFixed(2)}</div>
                                <div className="text-[10px] text-brand-charcoal/40 font-light">Qty: {item.quantity}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer total bar */}
                      <div className="mt-4 border-t border-brand-charcoal/5 pt-4 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-wider">Gross Total</span>
                        <div className="text-xl font-bold font-serif text-brand-charcoal">₹{ord.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-12 text-center text-xs text-brand-charcoal/40 italic">
                      No customer orders recorded.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: CUSTOM ORDERS -------------------- */}
            {activeTab === "custom-orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Custom Design Orders
                  </h2>
                  <span className="text-xs bg-brand-charcoal text-white px-3 py-1 rounded-full font-bold">
                    {customOrders.length} custom order(s)
                  </span>
                </div>
                
                <div className="space-y-6">
                  {customOrders.length === 0 ? (
                    <p className="text-brand-charcoal/50 text-sm">No custom orders found.</p>
                  ) : (
                    customOrders.map((ord: any) => (
                       <div key={ord.id} className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-6 shadow-xs flex flex-col md:flex-row gap-6">
                         <div className="md:w-1/3">
                            <div className="grid grid-cols-2 gap-2">
                              {ord.designImageUrl?.split(',').filter(Boolean).map((imgUrl: string, idx: number) => (
                                <div key={idx} className="w-full aspect-square bg-brand-gray rounded-xl overflow-hidden border border-brand-charcoal/10 relative group flex items-center justify-center">
                                  <img src={imgUrl} alt={`Custom Design ${idx + 1}`} className="object-contain w-full h-full p-1" />
                                  <span className="absolute bottom-1 left-1 text-[8px] bg-brand-charcoal/70 text-brand-bg px-1.5 py-0.5 rounded-md font-semibold font-sans">
                                    {idx === 0 ? "Front" : idx === 1 ? "Back" : "Logo"}
                                  </span>
                                </div>
                              ))}
                            </div>
                         </div>
                        <div className="md:w-2/3 space-y-4">
                           <div className="flex justify-between items-start">
                             <div>
                               <h3 className="font-bold text-lg">Order #{ord.id}</h3>
                               <p className="text-xs text-brand-charcoal/60 mt-1">Submitted: {new Date(ord.createdAt).toLocaleDateString()}</p>
                             </div>
                             <select 
                               value={ord.status || "PENDING"}
                               onChange={(e) => handleCustomOrderStatusUpdate(ord.id, e.target.value)}
                               className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide outline-none cursor-pointer ${
                                 ord.status === "DELIVERED" || ord.status === "PROCESSED" ? "bg-green-100 text-green-800 border-green-200" :
                                 ord.status === "CANCELLED" || ord.status === "REJECTED" ? "bg-red-100 text-red-800 border-red-200" :
                                 "bg-amber-100 text-amber-800 border-amber-200"
                               }`}
                             >
                               <option value="PENDING">PENDING</option>
                               <option value="APPROVED">APPROVED</option>
                               <option value="REJECTED">REJECTED</option>
                               <option value="PROCESSED">PROCESSED</option>
                               <option value="DELIVERED">DELIVERED</option>
                             </select>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-brand-charcoal/5">
                             <div>
                               <span className="block text-[10px] uppercase font-bold text-brand-charcoal/50">Customer</span>
                               <p className="font-semibold">{ord.fullName}</p>
                               <p className="text-xs">{ord.email}</p>
                               <p className="text-xs">{ord.phone}</p>
                             </div>
                             <div>
                               <span className="block text-[10px] uppercase font-bold text-brand-charcoal/50">Preferences</span>
                               <p className="font-semibold">{ord.color} - Size {ord.size}</p>
                               <p className="text-xs">Qty: {ord.quantity}</p>
                             </div>
                           </div>

                           <div className="bg-white p-4 rounded-xl border border-brand-charcoal/5 text-sm">
                             <span className="block text-[10px] uppercase font-bold text-brand-charcoal/50">Design Notes</span>
                             <p className="mt-1">{ord.designNotes || "No additional notes provided."}</p>
                           </div>

                           <div className="bg-white p-4 rounded-xl border border-brand-charcoal/5 text-sm">
                             <span className="block text-[10px] uppercase font-bold text-brand-charcoal/50">Shipping Address</span>
                             <p className="mt-1 text-xs">{ord.address}, {ord.landmark && `${ord.landmark},`} {ord.city}, {ord.state} - {ord.pincode}</p>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: USERS -------------------- */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Customer Accounts Directory
                  </h2>
                  <span className="text-xs bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-bold border border-brand-green/20">
                    {users.length} customer(s) registered
                  </span>
                </div>

                <div className="border border-brand-charcoal/5 rounded-3xl overflow-hidden bg-brand-bg shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-brand-gray/50 border-b border-brand-charcoal/5 text-[10px] uppercase font-bold text-brand-charcoal/50 tracking-wider">
                          <th className="py-4.5 px-6">ID</th>
                          <th className="py-4.5 px-6">Customer Profile</th>
                          <th className="py-4.5 px-6">Email Address</th>
                          <th className="py-4.5 px-6">Security Authorization Role</th>
                          <th className="py-4.5 px-6">Password Hash</th>
                          <th className="py-4.5 px-6 text-right">Registration Date</th>
                          <th className="py-4.5 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-charcoal/5 text-xs">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-brand-gray/20 transition-colors">
                            <td className="py-4.5 px-6 font-mono font-bold text-brand-charcoal/60">
                              #{u.id}
                            </td>
                            <td className="py-4.5 px-6 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center text-xs uppercase">
                                {u.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-brand-charcoal">{u.name}</span>
                            </td>
                            <td className="py-4.5 px-6 text-brand-charcoal/60 font-mono">
                              {u.email}
                            </td>
                            <td className="py-4.5 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold rounded-md uppercase border ${
                                u.role === "ADMIN" 
                                  ? "bg-purple-100 text-purple-700 border-purple-200" 
                                  : "bg-brand-gray text-brand-charcoal/60 border-brand-charcoal/10"
                              }`}>
                                <Shield className="h-2.5 w-2.5" />
                                <span>{u.role}</span>
                              </span>
                            </td>
                            <td className="py-4.5 px-6 font-mono text-[10px] text-brand-charcoal/40 truncate max-w-[120px]" title={u.password}>
                              {u.password || "********"}
                            </td>
                            <td className="py-4.5 px-6 text-right text-brand-charcoal/50 font-light">
                              {new Date(u.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditName(u.name);
                                  setEditRole(u.role);
                                  setEditPassword("");
                                }}
                                className="px-3 py-1.5 rounded-lg border border-brand-charcoal/10 bg-brand-bg hover:bg-brand-charcoal/5 font-semibold text-xs tracking-wide transition-all cursor-pointer inline-flex items-center gap-1 text-brand-charcoal/80"
                              >
                                <Edit className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: SETTINGS -------------------- */}
            {activeTab === "gallery" && (
              <div className="max-w-5xl bg-brand-gray/30 p-8 rounded-3xl border border-brand-charcoal/5 space-y-8">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Hero Gallery Management
                  </h2>
                  <p className="text-xs text-brand-charcoal/50 mt-1 font-light">
                    Upload and manage dynamic images that appear in the floating gallery hero section on the homepage. At least 8 images are recommended for the best visual experience.
                  </p>
                </div>

                <div className="relative border border-dashed border-brand-charcoal/20 rounded-xl bg-brand-bg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-charcoal/5 transition-colors">
                  <UploadCloud className="h-8 w-8 text-brand-charcoal/40 mb-2" />
                  <span className="text-sm font-semibold text-brand-charcoal">
                    {uploadingGalleryImage ? "Uploading image..." : "Upload new gallery image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingGalleryImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadGalleryImage(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-brand-charcoal/10 shadow-sm bg-brand-bg">
                      <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-brand-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => deleteGalleryImage(img.id)}
                          className="bg-brand-red text-white p-2 rounded-full hover:scale-110 transition-transform cursor-pointer shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {galleryImages.length === 0 && (
                    <div className="col-span-full py-12 text-center text-xs text-brand-charcoal/50">
                      No images in the gallery yet. Start by uploading one!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: CINEMATIC HERO -------------------- */}
            {activeTab === "cinematic" && (
              <div className="max-w-5xl bg-brand-gray/30 p-8 rounded-3xl border border-brand-charcoal/5 space-y-8">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Cinematic Hero Management
                  </h2>
                  <p className="text-xs text-brand-charcoal/50 mt-1 font-light">
                    Upload images and set labels for the desktop Cinematic Video Hero slider.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-brand-charcoal mb-2">Image Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Summer Drop"
                      value={cinematicLabel}
                      onChange={(e) => setCinematicLabel(e.target.value)}
                      className="w-full bg-brand-bg rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-charcoal/20 border border-brand-charcoal/10 shadow-sm transition-all"
                    />
                  </div>
                  <div className="relative border border-dashed border-brand-charcoal/20 rounded-xl bg-brand-bg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-charcoal/5 transition-colors">
                    <UploadCloud className="h-8 w-8 text-brand-charcoal/40 mb-2" />
                    <span className="text-sm font-semibold text-brand-charcoal">
                      {uploadingCinematicImage ? "Uploading image..." : "Select image to upload (label required)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingCinematicImage || !cinematicLabel}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadCinematicImage(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cinematicImages.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video border border-brand-charcoal/10 shadow-sm bg-brand-bg flex flex-col">
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover flex-1" />
                      <div className="p-2 bg-brand-charcoal text-brand-bg text-center text-xs font-bold shrink-0 truncate">
                        {img.label}
                      </div>
                      <div className="absolute inset-0 bg-brand-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pb-8">
                        <button
                          onClick={() => deleteCinematicImage(img.id)}
                          className="bg-brand-red text-white p-2 rounded-full hover:scale-110 transition-transform cursor-pointer shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cinematicImages.length === 0 && (
                    <div className="col-span-full py-12 text-center text-xs text-brand-charcoal/50">
                      No images in the cinematic hero yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: SETTINGS -------------------- */}
            {activeTab === "settings" && (
              <div className="max-w-2xl bg-brand-gray/30 p-8 rounded-3xl border border-brand-charcoal/5 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Brand Customization Settings
                  </h2>
                  <p className="text-xs text-brand-charcoal/50 mt-1 font-light">
                    Update your brand logo image and set the company name dynamically across all components.
                  </p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setUpdatingSettings(true);
                  const success = await updateSettings({
                    companyName: tempCompanyName,
                    logoUrl: tempLogoUrl
                  });
                  if (success) {
                    useAlertStore.getState().showAlert("Brand settings updated successfully!");
                  } else {
                    useAlertStore.getState().showAlert("Failed to save settings.");
                  }
                  setUpdatingSettings(false);
                }} className="space-y-6 text-xs">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="sName">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="sName"
                      required
                      value={tempCompanyName}
                      onChange={(e) => setTempCompanyName(e.target.value)}
                      placeholder="e.g. MDFK CLOTHING CO."
                      className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                      Company Logo Graphic
                    </label>
                    <div className="mt-2 flex items-center gap-6">
                      <div className="relative h-16 w-36 overflow-hidden rounded-xl border border-brand-charcoal/10 bg-brand-gray flex items-center justify-center p-2">
                        {tempLogoUrl ? (
                          <img src={tempLogoUrl} alt="Preview logo" className="object-contain h-full w-full" />
                        ) : (
                          <span className="text-[10px] text-brand-charcoal/40 font-bold">NO LOGO</span>
                        )}
                      </div>
                      <div className="relative flex-grow border border-dashed border-brand-charcoal/20 rounded-xl bg-brand-bg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-charcoal/5 transition-colors">
                        <UploadCloud className="h-6 w-6 text-brand-charcoal/40 mb-1.5" />
                        <span className="text-[10px] font-semibold text-brand-charcoal/60">
                          {uploadingImage ? "Uploading file..." : "Upload new brand logo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/mp4,video/webm,video/x-m4v,video/quicktime"
                          disabled={uploadingImage}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setUploadingImage(true);
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64Data = reader.result as string;
                              setTempLogoUrl(base64Data);
                              setUploadingImage(false);
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingSettings || uploadingImage}
                    className="w-full bg-brand-charcoal text-brand-bg rounded-xl py-3.5 text-xs font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
                  >
                    {updatingSettings ? "Saving settings..." : "Save Settings"}
                  </button>
                </form>

                {/* Manage Categories Section */}
                <div className="mt-8 pt-8 border-t border-brand-charcoal/10">
                  <h3 className="text-lg font-semibold tracking-tight text-brand-charcoal font-serif">
                    Product Categories Management
                  </h3>
                  <p className="text-xs text-brand-charcoal/50 mt-1 font-light mb-4">
                    Add or remove product categories displayed in the dropdown menu when uploading or editing items.
                  </p>
                  
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="e.g. Hoodies, Accessories"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      className="flex-grow rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none text-brand-charcoal"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const trimmed = newCategoryInput.trim();
                        if (!trimmed) return;
                        if (categories.includes(trimmed)) {
                          useAlertStore.getState().showAlert("Category already exists.");
                          return;
                        }
                        const updated = [...categories, trimmed];
                        const success = await updateSettings({ categories: updated });
                        if (success) {
                          setNewCategoryInput("");
                          useAlertStore.getState().showAlert("Category added successfully!");
                        }
                      }}
                      className="bg-brand-charcoal text-brand-bg px-4 py-2 rounded-xl text-xs font-semibold hover:bg-brand-charcoal/90 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center gap-1.5 bg-brand-bg px-3.5 py-2 rounded-full border border-brand-charcoal/10 shadow-sm">
                        <span className="text-xs font-medium text-brand-charcoal">{cat}</span>
                        {cat !== "T-Shirts" && cat !== "Couple" && (
                          <button
                            type="button"
                            onClick={async () => {
                              const updated = categories.filter((c) => c !== cat);
                              const success = await updateSettings({ categories: updated });
                              if (success) {
                                useAlertStore.getState().showAlert(`Category "${cat}" removed.`);
                              }
                            }}
                            className="text-brand-charcoal/40 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal Dialog Overlay */}
            {editingUser && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal/60 backdrop-blur-md p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-md bg-brand-bg rounded-3xl p-8 border border-brand-charcoal/10 shadow-2xl relative text-brand-charcoal"
                >
                  <h3 className="text-xl font-bold font-serif text-brand-charcoal mb-2">Edit User Account</h3>
                  <p className="text-xs text-brand-charcoal/50 mb-6">Manage settings for user ID #{editingUser.id} ({editingUser.email})</p>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const updateData: any = { name: editName, role: editRole };
                    if (editPassword) {
                      updateData.password = editPassword;
                    }
                    const success = await adminUpdateUser(editingUser.id, updateData);
                    if (success) {
                      setEditingUser(null);
                      useAlertStore.getState().showAlert("User details updated successfully!");
                    } else {
                      useAlertStore.getState().showAlert("Failed to update user details.");
                    }
                  }} className="space-y-4 text-xs text-left">
                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="uName">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="uName"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="uRole">
                        System Role
                      </label>
                      <select
                        id="uRole"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none cursor-pointer"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="uPassword">
                        New Password (leave empty to keep current)
                      </label>
                      <input
                        type="password"
                        id="uPassword"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Enter new plain text password"
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3 mt-6 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="flex-1 rounded-xl border border-brand-charcoal/10 bg-brand-bg py-3 text-xs font-semibold hover:bg-brand-charcoal/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-brand-charcoal text-brand-bg rounded-xl py-3 text-xs font-semibold hover:bg-brand-charcoal/90 transition-all cursor-pointer"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* View Full Order Details Modal Overlay */}
            {selectedOrder && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal/60 backdrop-blur-md p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-brand-bg rounded-3xl p-6 md:p-10 border border-brand-charcoal/10 shadow-2xl relative text-brand-charcoal custom-scrollbar"
                >
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-brand-charcoal/5 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5 text-brand-charcoal/60 hover:text-brand-charcoal" />
                  </button>

                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold font-serif text-brand-charcoal">Order #{selectedOrder.id}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                      selectedOrder.status === 'DELIVERED' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 
                      selectedOrder.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-200' : 
                      selectedOrder.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {selectedOrder.status || "BOOKED"}
                    </span>
                  </div>
                  <p className="text-xs text-brand-charcoal/50 mb-8 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Customer Info */}
                    <div className="p-5 rounded-2xl bg-brand-gray/30 border border-brand-charcoal/5 text-sm space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 mb-3 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" /> Customer Details
                      </h4>
                      <div><span className="text-brand-charcoal/50 inline-block w-20">Name:</span> <span className="font-semibold">{selectedOrder.user.name}</span></div>
                      <div><span className="text-brand-charcoal/50 inline-block w-20">Email:</span> <span className="font-semibold">{selectedOrder.user.email}</span></div>
                      {selectedOrder.phone && <div><span className="text-brand-charcoal/50 inline-block w-20">Phone:</span> <span className="font-semibold">{selectedOrder.phone}</span></div>}
                    </div>

                    {/* Shipping Info */}
                    <div className="p-5 rounded-2xl bg-brand-gray/30 border border-brand-charcoal/5 text-sm space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" /> Shipping Address
                      </h4>
                      {selectedOrder.address ? (
                        <>
                          <div className="font-semibold">{selectedOrder.fullName || selectedOrder.user.name}</div>
                          <div className="text-brand-charcoal/80 leading-relaxed">
                            {selectedOrder.address}<br />
                            {selectedOrder.landmark && <>{selectedOrder.landmark}<br /></>}
                            {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                          </div>
                        </>
                      ) : (
                        <div className="text-brand-charcoal/50 italic">No shipping details provided.</div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 mb-4 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" /> Purchased Garments
                    </h4>
                    <div className="border border-brand-charcoal/5 rounded-2xl overflow-hidden divide-y divide-brand-charcoal/5 bg-brand-bg">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 flex items-center gap-4">
                          {item.image ? (
                            <div className="h-16 w-14 rounded-lg bg-brand-gray overflow-hidden flex-shrink-0 border border-brand-charcoal/5">
                              <MediaRenderer src={item.image} alt={item.title} className="object-cover h-full w-full" />
                            </div>
                          ) : (
                            <div className="h-16 w-14 rounded-lg bg-brand-gray/50 border border-brand-charcoal/5 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-brand-charcoal/20" />
                            </div>
                          )}
                          <div className="flex-grow">
                            <h5 className="font-semibold text-brand-charcoal text-sm">{item.title}</h5>
                            <div className="flex items-center gap-3 text-[11px] text-brand-charcoal/60 mt-1">
                              <span className="uppercase">Size: <span className="font-semibold">{item.size}</span></span>
                              <span className="flex items-center gap-1.5">
                                Color:{" "}
                                {item.color.includes("M:") ? (
                                  <span className="font-semibold text-brand-charcoal/80 text-xs lowercase">{formatColor(item.color)}</span>
                                ) : (
                                  <>
                                    <span className="font-semibold text-brand-charcoal/80 text-xs lowercase">{formatColor(item.color)}</span>
                                    <span className="h-3 w-3 rounded-full border border-brand-charcoal/10 inline-block shadow-sm" style={{ backgroundColor: item.color }} />
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-brand-charcoal text-sm">₹{item.price.toFixed(2)}</div>
                            <div className="text-[11px] text-brand-charcoal/50 mt-1">Qty: {item.quantity}</div>
                            <div className="text-xs font-bold text-brand-charcoal mt-1">₹{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Totals */}
                  <div className="flex justify-end pt-6 border-t border-brand-charcoal/10">
                    <div className="w-full max-w-xs space-y-3">
                      <div className="flex justify-between items-center text-sm text-brand-charcoal/60">
                        <span>Subtotal</span>
                        <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-brand-charcoal/60">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-brand-charcoal/5">
                        <span className="font-bold text-brand-charcoal uppercase text-xs tracking-wider">Gross Total</span>
                        <span className="text-2xl font-bold font-serif text-brand-charcoal">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Actions */}
                  <div className="mt-8 pt-6 border-t border-brand-charcoal/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-wider">
                      Update Order Status
                    </div>
                    <div className="flex gap-2">
                      {['BOOKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                        <button
                          key={status}
                          onClick={async () => {
                            await handleOrderStatusUpdate(selectedOrder.id, status);
                            setSelectedOrder({...selectedOrder, status}); // Optimistically update modal
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedOrder.status === status 
                              ? 'bg-brand-charcoal text-brand-bg shadow-md' 
                              : 'bg-brand-gray/50 text-brand-charcoal/60 border border-brand-charcoal/10 hover:bg-brand-charcoal/5 hover:text-brand-charcoal'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      <Lightbox 
        images={lightboxImages} 
        currentIndex={lightboxIndex} 
        isOpen={isLightboxOpen} 
        onClose={() => setIsLightboxOpen(false)} 
        onNavigate={setLightboxIndex} 
      />

      <ColorPickerModal 
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        selectedColors={
          colorPickerTarget === 'male'
            ? maleColorsInput.split(",").map(c => c.trim()).filter(Boolean)
            : colorPickerTarget === 'female'
            ? femaleColorsInput.split(",").map(c => c.trim()).filter(Boolean)
            : colorsInput.split(",").map(c => c.trim()).filter(Boolean)
        }
        onColorsChange={(colors) => {
          if (colorPickerTarget === 'male') {
            setMaleColorsInput(colors.join(", "));
          } else if (colorPickerTarget === 'female') {
            setFemaleColorsInput(colors.join(", "));
          } else {
            setColorsInput(colors.join(", "));
          }
        }}
      />
    </div>
  );
}
