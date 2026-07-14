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
import { Plus, Trash2, Tag, Star, Package, Users, Layers, UploadCloud, Loader2, RefreshCw, BarChart2, UserCheck, Shield, ShoppingBag, DollarSign, Calendar, Edit, Settings, Eye, X, Image as ImageIcon, Paintbrush, Search, Filter, ChevronDown, User, Printer } from "lucide-react";
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
    nimbusCancelOrder,
    nimbusTrackOrder,
    exchangeOrders,
    fetchExchangeOrders,
    updateExchangeOrderStatus,
    nimbusShipExchangeOrder,
    nimbusCancelExchangeOrder,
    nimbusTrackExchangeOrder,
    adminCreateOrder,
    updateAdminOrder,
    deleteAdminOrder
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
  const [activeTab, setActiveTab] = useState("overview"); // overview, products, reviews, orders, exchange-orders, users, settings

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
  const [enableMaleSection, setEnableMaleSection] = useState(true);
  const [enableFemaleSection, setEnableFemaleSection] = useState(true);
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

  // Order Status Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  // Create Order Modal States
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [coIsCustomUser, setCoIsCustomUser] = useState(false);
  const [coUserSearch, setCoUserSearch] = useState("");
  const [coSelectedUserId, setCoSelectedUserId] = useState<number | null>(null);
  const [coSelectedUserLabel, setCoSelectedUserLabel] = useState("");
  const [coShowUserDropdown, setCoShowUserDropdown] = useState(false);
  const [coCustomName, setCoCustomName] = useState("");
  const [coCustomEmail, setCoCustomEmail] = useState("");
  const [coCustomPhone, setCoCustomPhone] = useState("");
  const [coSelectedItemsList, setCoSelectedItemsList] = useState<any[]>([]);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [psSearch, setPsSearch] = useState("");
  const [psSelectedProduct, setPsSelectedProduct] = useState<any>(null);
  const [psColor, setPsColor] = useState("");
  const [psSize, setPsSize] = useState("");
  const [psQuantity, setPsQuantity] = useState(1);
  const [psPriceOverride, setPsPriceOverride] = useState("");

  const [coTotalAmount, setCoTotalAmount] = useState("");
  const [coPaymentMethod, setCoPaymentMethod] = useState("COD");
  const [coShippingCharges, setCoShippingCharges] = useState("");
  const [coCodCharges, setCoCodCharges] = useState("");

  useEffect(() => {
    const subtotal = coSelectedItemsList.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    const shipping = Number(coShippingCharges) || 0;
    const cod = Number(coCodCharges) || 0;
    setCoTotalAmount((subtotal + shipping + cod).toString());
  }, [coSelectedItemsList, coShippingCharges, coCodCharges]);
  const [coFullName, setCoFullName] = useState("");
  const [coPhone, setCoPhone] = useState("");
  const [coAddress, setCoAddress] = useState("");
  const [coLandmark, setCoLandmark] = useState("");
  const [coPincode, setCoPincode] = useState("");
  const [coState, setCoState] = useState("");
  const [coCity, setCoCity] = useState("");
  const [coStatus, setCoStatus] = useState("BOOKED");
  const [coSubmitting, setCoSubmitting] = useState(false);

  // Edit Order Modal States
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [eoOrderId, setEoOrderId] = useState<number | null>(null);
  const [eoFullName, setEoFullName] = useState("");
  const [eoPhone, setEoPhone] = useState("");
  const [eoEmail, setEoEmail] = useState("");
  const [eoAddress, setEoAddress] = useState("");
  const [eoLandmark, setEoLandmark] = useState("");
  const [eoPincode, setEoPincode] = useState("");
  const [eoCity, setEoCity] = useState("");
  const [eoState, setEoState] = useState("");
  const [eoTotalAmount, setEoTotalAmount] = useState("");
  const [eoShippingCharges, setEoShippingCharges] = useState("");
  const [eoCodCharges, setEoCodCharges] = useState("");
  const [eoPaymentMethod, setEoPaymentMethod] = useState("COD");
  const [eoStatus, setEoStatus] = useState("BOOKED");
  const [eoItems, setEoItems] = useState("");
  const [eoSubmitting, setEoSubmitting] = useState(false);

  // Invoice Editor Modal States
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invOrderId, setInvOrderId] = useState<number | null>(null);
  const [invFullName, setInvFullName] = useState("");
  const [invAddressDetails, setInvAddressDetails] = useState("");
  const [invDate, setInvDate] = useState("");
  const [invPaymentMethod, setInvPaymentMethod] = useState("");
  const [invItems, setInvItems] = useState<any[]>([]);
  const [invShippingCharges, setInvShippingCharges] = useState(0);
  const [invCodCharges, setInvCodCharges] = useState(0);
  const [invTotalAmount, setInvTotalAmount] = useState(0);
  const [invCompanyName, setInvCompanyName] = useState("");
  const [invDiscount, setInvDiscount] = useState(0);
  const [invDeduction, setInvDeduction] = useState(0);
  const [invDeductionLabel, setInvDeductionLabel] = useState("Other Deductions");

  useEffect(() => {
    if (isInvoiceOpen) {
      const subtotal = invItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
      const calculatedTotal = subtotal + invShippingCharges + invCodCharges - invDiscount - invDeduction;
      setInvTotalAmount(Math.max(0, calculatedTotal));
    }
  }, [invItems, invShippingCharges, invCodCharges, invDiscount, invDeduction, isInvoiceOpen]);

  // Edit Custom Order Modal States
  const [isEditCustomOrderOpen, setIsEditCustomOrderOpen] = useState(false);
  const [ecoOrderId, setEcoOrderId] = useState<number | null>(null);
  const [ecoFullName, setEcoFullName] = useState("");
  const [ecoPhone, setEcoPhone] = useState("");
  const [ecoEmail, setEcoEmail] = useState("");
  const [ecoAddress, setEcoAddress] = useState("");
  const [ecoLandmark, setEcoLandmark] = useState("");
  const [ecoPincode, setEcoPincode] = useState("");
  const [ecoCity, setEcoCity] = useState("");
  const [ecoState, setEcoState] = useState("");
  const [ecoPrice, setEcoPrice] = useState("");
  const [ecoQuantity, setEcoQuantity] = useState("");
  const [ecoTotalAmount, setEcoTotalAmount] = useState("");
  const [ecoShippingCharges, setEcoShippingCharges] = useState("");
  const [ecoCodCharges, setEcoCodCharges] = useState("");
  const [ecoPaymentMethod, setEcoPaymentMethod] = useState("COD");
  const [ecoStatus, setEcoStatus] = useState("PENDING");
  const [ecoDesignNotes, setEcoDesignNotes] = useState("");
  const [ecoColor, setEcoColor] = useState("");
  const [ecoSize, setEcoSize] = useState("");
  const [ecoSubmitting, setEcoSubmitting] = useState(false);

  useEffect(() => {
    const price = Number(ecoPrice) || 0;
    const qty = Number(ecoQuantity) || 1;
    const shipping = Number(ecoShippingCharges) || 0;
    const cod = Number(ecoCodCharges) || 0;
    setEcoTotalAmount((price * qty + shipping + cod).toString());
  }, [ecoPrice, ecoQuantity, ecoShippingCharges, ecoCodCharges]);


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
    if (activeTab === "exchange-orders") {
      fetchExchangeOrders();
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
        ? Array.from(new Set([
            ...(enableMaleSection ? maleColors : []),
            ...(enableFemaleSection ? femaleColors : [])
          ]))
        : colors,
      sizes: selectedSizes,
      maleColors: (category.toLowerCase().includes("couple") && enableMaleSection) ? maleColors : [],
      femaleColors: (category.toLowerCase().includes("couple") && enableFemaleSection) ? femaleColors : [],
      maleSizes: (category.toLowerCase().includes("couple") && enableMaleSection) ? selectedMaleSizes : [],
      femaleSizes: (category.toLowerCase().includes("couple") && enableFemaleSection) ? selectedFemaleSizes : [],
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
      setEnableMaleSection(true);
      setEnableFemaleSection(true);
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
    
    const hasMale = Array.isArray(prod.maleColors) && prod.maleColors.length > 0;
    const hasFemale = Array.isArray(prod.femaleColors) && prod.femaleColors.length > 0;
    if (prod.category?.toLowerCase().includes("couple")) {
      setEnableMaleSection(hasMale || (!hasMale && !hasFemale));
      setEnableFemaleSection(hasFemale || (!hasMale && !hasFemale));
    } else {
      setEnableMaleSection(true);
      setEnableFemaleSection(true);
    }
    
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

  const handleExchangeOrderStatusUpdate = async (exchangeId: number, status: string) => {
    const success = await updateExchangeOrderStatus(exchangeId, status);
    if (success) {
      useAlertStore.getState().showAlert(`Exchange Order #${exchangeId} status updated to ${status}`);
    } else {
      useAlertStore.getState().showAlert("Failed to update exchange order status.");
    }
  };

  const handleExchangeNimbusShip = async (exchangeId: number) => {
    const res = await nimbusShipExchangeOrder(exchangeId);
    if (res.success) {
      useAlertStore.getState().showAlert(res.message || "Shipped via Nimbuspost");
    } else {
      useAlertStore.getState().showAlert(res.message || "Failed to ship");
    }
  };

  const handleExchangeNimbusCancel = async (exchangeId: number) => {
    useAlertStore.getState().showConfirm("Are you sure you want to cancel the Nimbuspost shipment for this exchange?", async () => {
      const res = await nimbusCancelExchangeOrder(exchangeId);
      if (res.success) {
        useAlertStore.getState().showAlert(res.message || "Shipment cancelled");
      } else {
        useAlertStore.getState().showAlert(res.message || "Failed to cancel shipment");
      }
    });
  };

  const handleExchangeNimbusTrack = async (exchangeId: number) => {
    const res = await nimbusTrackExchangeOrder(exchangeId);
    if (res.success && res.data) {
      const d = res.data;
      const history = d.history || [];
      const latestStatus = history.length > 0 ? history[history.length - 1] : null;
      const statusText = latestStatus
        ? `${latestStatus.status_body || latestStatus.event_type || "Unknown"} (${latestStatus.event_time || latestStatus.timestamp || ""})\nLocation: ${latestStatus.event_location || latestStatus.location || "N/A"}`
        : `Status: ${d.current_status || d.status || "In Transit"}`;
      useAlertStore.getState().showAlert(`📦 Tracking for AWB ${d.awb || ""}\n\n${statusText}`);
    } else {
      useAlertStore.getState().showAlert(res.message || "Failed to get tracking info");
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

  const handleNimbusTrack = async (orderId: number) => {
    const res = await nimbusTrackOrder(orderId);
    if (res.success && res.data) {
      const d = res.data;
      const history = d.history || [];
      const latestStatus = history.length > 0 ? history[history.length - 1] : null;
      const statusText = latestStatus
        ? `${latestStatus.status_body || latestStatus.event_type || "Unknown"} (${latestStatus.event_time || latestStatus.timestamp || ""})\nLocation: ${latestStatus.event_location || latestStatus.location || "N/A"}`
        : `Status: ${d.current_status || d.status || "In Transit"}`;
      useAlertStore.getState().showAlert(`📦 Tracking for AWB ${d.awb || ""}\n\n${statusText}`);
    } else {
      useAlertStore.getState().showAlert(res.message || "Failed to get tracking info");
    }
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
    await fetchExchangeOrders();
    await fetchReviews();
  };

  const filteredOrders = orderStatusFilter === "ALL"
    ? orders
    : orders.filter((o: any) => o.status === orderStatusFilter);

  const resetCreateOrderForm = () => {
    setCoIsCustomUser(false);
    setCoUserSearch("");
    setCoSelectedUserId(null);
    setCoSelectedUserLabel("");
    setCoShowUserDropdown(false);
    setCoCustomName("");
    setCoCustomEmail("");
    setCoCustomPhone("");
    setCoSelectedItemsList([]);
    setCoTotalAmount("");
    setCoPaymentMethod("COD");
    setCoShippingCharges("");
    setCoCodCharges("");
    setCoFullName("");
    setCoPhone("");
    setCoAddress("");
    setCoLandmark("");
    setCoPincode("");
    setCoState("");
    setCoCity("");
    setCoStatus("BOOKED");
  };

  const handleCreateOrderSubmit = async () => {
    if (coSelectedItemsList.length === 0) {
      useAlertStore.getState().showAlert("Please add at least one garment/item to the order.");
      return;
    }
    setCoSubmitting(true);
    try {
      const payload: any = {
        items: coSelectedItemsList,
        totalAmount: coTotalAmount ? Number(coTotalAmount) : 0,
        paymentMethod: coPaymentMethod,
        shippingCharges: coShippingCharges ? Number(coShippingCharges) : 0,
        codCharges: coCodCharges ? Number(coCodCharges) : 0,
        status: coStatus,
        fullName: coFullName || undefined,
        phone: coPhone || undefined,
        address: coAddress || undefined,
        landmark: coLandmark || undefined,
        pincode: coPincode || undefined,
        state: coState || undefined,
        city: coCity || undefined,
      };

      if (!coIsCustomUser && coSelectedUserId) {
        payload.userId = coSelectedUserId;
      } else if (coIsCustomUser) {
        payload.fullName = coCustomName || coFullName || undefined;
        payload.email = coCustomEmail || undefined;
        payload.phone = coCustomPhone || coPhone || undefined;
      }

      const res = await adminCreateOrder(payload);
      if (res.success) {
        useAlertStore.getState().showAlert(res.message || "Order created!");
        resetCreateOrderForm();
        setIsCreateOrderOpen(false);
      } else {
        useAlertStore.getState().showAlert(res.message || "Failed to create order.");
      }
    } catch (err: any) {
      useAlertStore.getState().showAlert(err.message || "Error creating order.");
    } finally {
      setCoSubmitting(false);
    }
  };

  const coFilteredUsers = users.filter((u: any) => {
    const q = coUserSearch.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const handleEditOrderClick = (ord: any) => {
    setEoOrderId(ord.id);
    setEoFullName(ord.fullName || ord.user?.name || "");
    setEoPhone(ord.phone || "");
    setEoEmail(ord.email || ord.user?.email || "");
    setEoAddress(ord.address || "");
    setEoLandmark(ord.landmark || "");
    setEoPincode(ord.pincode || "");
    setEoCity(ord.city || "");
    setEoState(ord.state || "");
    setEoTotalAmount(ord.totalAmount?.toString() || "");
    setEoShippingCharges(ord.shippingCharges?.toString() || "0");
    setEoCodCharges(ord.codCharges?.toString() || "0");
    setEoPaymentMethod(ord.paymentMethod || "COD");
    setEoStatus(ord.status || "BOOKED");
    setEoItems(JSON.stringify(ord.items || [], null, 2));
    setIsEditOrderOpen(true);
  };

  const handleEditOrderSubmit = async () => {
    if (!eoOrderId) return;
    setEoSubmitting(true);
    try {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(eoItems);
      } catch {
        useAlertStore.getState().showAlert("Invalid items JSON format.");
        setEoSubmitting(false);
        return;
      }

      const payload = {
        fullName: eoFullName,
        phone: eoPhone,
        email: eoEmail,
        address: eoAddress,
        landmark: eoLandmark,
        pincode: eoPincode,
        city: eoCity,
        state: eoState,
        totalAmount: Number(eoTotalAmount),
        shippingCharges: Number(eoShippingCharges),
        codCharges: Number(eoCodCharges),
        paymentMethod: eoPaymentMethod,
        status: eoStatus,
        items: parsedItems
      };

      const res = await updateAdminOrder(eoOrderId, payload);
      if (res.success) {
        useAlertStore.getState().showAlert(res.message || "Order updated successfully!");
        setIsEditOrderOpen(false);
      } else {
        useAlertStore.getState().showAlert(res.message || "Failed to update order.");
      }
    } catch (err: any) {
      useAlertStore.getState().showAlert(err.message || "Error updating order.");
    } finally {
      setEoSubmitting(false);
    }
  };

  const handleEditCustomOrderClick = (ord: any) => {
    setEcoOrderId(ord.id);
    setEcoFullName(ord.fullName || ord.user?.name || "");
    setEcoPhone(ord.phone || "");
    setEcoEmail(ord.email || ord.user?.email || "");
    setEcoAddress(ord.address || "");
    setEcoLandmark(ord.landmark || "");
    setEcoPincode(ord.pincode || "");
    setEcoCity(ord.city || "");
    setEcoState(ord.state || "");
    setEcoPrice(ord.price?.toString() || "0");
    setEcoQuantity(ord.quantity?.toString() || "1");
    setEcoTotalAmount(ord.totalAmount?.toString() || "0");
    setEcoShippingCharges(ord.shippingCharges?.toString() || "0");
    setEcoCodCharges(ord.codCharges?.toString() || "0");
    setEcoPaymentMethod(ord.paymentMethod || "COD");
    setEcoStatus(ord.status || "PENDING");
    setEcoDesignNotes(ord.designNotes || "");
    setEcoColor(ord.color || "");
    setEcoSize(ord.size || "");
    setIsEditCustomOrderOpen(true);
  };

  const handleEditCustomOrderSubmit = async () => {
    if (!ecoOrderId) return;
    setEcoSubmitting(true);
    try {
      const payload = {
        fullName: ecoFullName,
        phone: ecoPhone,
        email: ecoEmail,
        address: ecoAddress,
        landmark: ecoLandmark,
        pincode: ecoPincode,
        city: ecoCity,
        state: ecoState,
        price: Number(ecoPrice),
        quantity: Number(ecoQuantity),
        totalAmount: Number(ecoTotalAmount),
        shippingCharges: Number(ecoShippingCharges),
        codCharges: Number(ecoCodCharges),
        paymentMethod: ecoPaymentMethod,
        status: ecoStatus,
        designNotes: ecoDesignNotes,
        color: ecoColor,
        size: ecoSize,
      };

      const res = await apiFetch(`/custom-orders/admin/${ecoOrderId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        useAlertStore.getState().showAlert("Custom order updated successfully!");
        setIsEditCustomOrderOpen(false);
        fetchCustomOrders();
      } else {
        useAlertStore.getState().showAlert(res.message || "Failed to update custom order.");
      }
    } catch (err: any) {
      useAlertStore.getState().showAlert(err.message || "Error updating custom order.");
    } finally {
      setEcoSubmitting(false);
    }
  };

  const handleDeleteOrderClick = (orderId: number) => {
    useAlertStore.getState().showConfirm("Are you sure you want to permanently delete this order?", async () => {
      try {
        const res = await deleteAdminOrder(orderId);
        if (res.success) {
          useAlertStore.getState().showAlert(res.message || "Order deleted successfully.");
        } else {
          useAlertStore.getState().showAlert(res.message || "Failed to delete order.");
        }
      } catch (err: any) {
        useAlertStore.getState().showAlert(err.message || "Error deleting order.");
      }
    });
  };

  const handleInvoiceClick = (ord: any) => {
    setInvOrderId(ord.id);
    setInvFullName(ord.fullName || ord.user?.name || "Customer");
    setInvAddressDetails(`${ord.address || ""}, ${ord.landmark ? ord.landmark + ", " : ""}${ord.city || ""}, ${ord.state || ""} - ${ord.pincode || ""}`);
    
    const formattedDate = new Date(ord.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    setInvDate(formattedDate);
    setInvPaymentMethod(ord.paymentMethod || "COD");
    
    // items lists - support both custom order and standard order
    const ordItems = Array.isArray(ord.items) 
      ? ord.items 
      : [
          {
            title: `Custom Design Garment #${ord.id}`,
            price: ord.price || 0,
            quantity: ord.quantity || 1,
            size: ord.size || "N/A",
            color: ord.color || "N/A",
            image: ord.designImageUrl ? ord.designImageUrl.split(',')[0] : "",
          }
        ];
    setInvItems(ordItems);
    
    const shipping = ord.shippingCharges || 0;
    const cod = ord.codCharges || 0;
    setInvShippingCharges(shipping);
    setInvCodCharges(cod);
    setInvTotalAmount(ord.totalAmount || 0);
    setInvCompanyName(companyName || "MDFK CLOTHING CO.");

    // Compute automatic pre-applied discount if subtotal + shipping + cod is greater than the total amount
    const subtotal = ordItems.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    const expectedRawTotal = subtotal + shipping + cod;
    const preAppliedDiscount = expectedRawTotal > ord.totalAmount ? (expectedRawTotal - ord.totalAmount) : 0;
    
    setInvDiscount(preAppliedDiscount);
    setInvDeduction(0);
    setInvDeductionLabel("Other Deductions");
    setIsInvoiceOpen(true);
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
                { id: "exchange-orders", label: "Size Exchange Log", icon: RefreshCw },
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
                        {/* Gender Toggles */}
                        <div className="bg-brand-gray/30 p-4 rounded-2xl border border-brand-charcoal/5 flex flex-col sm:flex-row gap-6 mb-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-charcoal">
                            <input
                              type="checkbox"
                              checked={enableMaleSection}
                              onChange={(e) => setEnableMaleSection(e.target.checked)}
                              className="accent-brand-green h-4 w-4 rounded cursor-pointer"
                            />
                            <span>Include Male Selection (Sizes/Colors)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-charcoal">
                            <input
                              type="checkbox"
                              checked={enableFemaleSection}
                              onChange={(e) => setEnableFemaleSection(e.target.checked)}
                              className="accent-brand-green h-4 w-4 rounded cursor-pointer"
                            />
                            <span>Include Female Selection (Sizes/Colors)</span>
                          </label>
                        </div>

                        {/* Male Colors */}
                        {enableMaleSection && (
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
                        )}

                        {/* Female Colors */}
                        {enableFemaleSection && (
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
                        )}

                        {/* Male Sizes */}
                        {enableMaleSection && (
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
                        )}

                        {/* Female Sizes */}
                        {enableFemaleSection && (
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
                        )}
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
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                      Sales Order Logs
                    </h2>
                    <span className="text-xs text-brand-charcoal/40 mt-1 block">
                      {filteredOrders.length} of {orders.length} order(s) shown
                    </span>
                  </div>
                  <button
                    onClick={() => { resetCreateOrderForm(); setIsCreateOrderOpen(true); }}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-charcoal text-brand-bg px-4 py-2.5 text-xs font-semibold hover:bg-brand-charcoal/90 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Order
                  </button>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "ALL", label: "All", color: "bg-brand-charcoal/5 text-brand-charcoal border-brand-charcoal/10" },
                    { key: "BOOKED", label: "Booked", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                    { key: "SHIPPED", label: "Shipped", color: "bg-blue-50 text-blue-600 border-blue-200" },
                    { key: "DELIVERED", label: "Delivered", color: "bg-brand-green/10 text-brand-green border-brand-green/20" },
                    { key: "CANCELLED", label: "Cancelled", color: "bg-red-50 text-red-600 border-red-200" },
                    { key: "RETURN_PENDING", label: "Return Pending", color: "bg-orange-50 text-orange-600 border-orange-200" },
                  ].map((pill) => {
                    const isActive = orderStatusFilter === pill.key;
                    const count = pill.key === "ALL" ? orders.length : orders.filter((o: any) => o.status === pill.key).length;
                    return (
                      <button
                        key={pill.key}
                        onClick={() => setOrderStatusFilter(pill.key)}
                        className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? `${pill.color} ring-2 ring-offset-1 ring-brand-charcoal/15 shadow-xs`
                            : "bg-brand-bg text-brand-charcoal/40 border-brand-charcoal/10 hover:text-brand-charcoal/70"
                        }`}
                      >
                        {pill.label}
                        <span className={`text-[9px] rounded-full px-1.5 py-0.5 font-bold ${isActive ? "bg-white/50" : "bg-brand-charcoal/5"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Order List */}
                <div className="space-y-6">
                  {filteredOrders.map((ord: any) => (
                    <div key={ord.id} className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-6 shadow-xs relative overflow-hidden">
                      {/* Header bar of order card */}
                      <div className="flex flex-col sm:flex-row justify-between border-b border-brand-charcoal/5 pb-4 mb-4 text-xs gap-3">
                        <div>
                          <div className="font-bold text-brand-charcoal text-sm flex items-center gap-2">
                            <span>Order #{ord.id}</span>
                            <button
                              onClick={() => handleDeleteOrderClick(ord.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all cursor-pointer inline-flex items-center justify-center"
                              title="Delete Order"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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
                          
                          <div className="flex gap-2 mt-auto flex-wrap justify-end">
                            {ord.status === "DELIVERED" && (
                              <button
                                onClick={() => handleInvoiceClick(ord)}
                                className="text-xs bg-brand-green text-brand-bg px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-green/90 transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <Printer className="h-3 w-3" />
                                Invoice Editor
                              </button>
                            )}
                            <button
                              onClick={() => handleEditOrderClick(ord)}
                              className="text-xs border border-brand-charcoal/20 text-brand-charcoal px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-charcoal/5 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit Info
                            </button>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="text-xs bg-brand-charcoal text-brand-bg px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-charcoal/90 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View Details
                            </button>
                          </div>
                          
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
                                onClick={() => handleNimbusTrack(ord.id)}
                                className="text-[10px] text-blue-500 underline cursor-pointer"
                              >
                                Track Shipment
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
                  {filteredOrders.length === 0 && (
                    <div className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-12 text-center text-xs text-brand-charcoal/40 italic">
                      {orderStatusFilter === "ALL" ? "No customer orders recorded." : `No ${orderStatusFilter.toLowerCase().replace("_", " ")} orders found.`}
                    </div>
                  )}
                </div>
              </div>
            )}

                {/* ===== CREATE ORDER MODAL ===== */}
                {isCreateOrderOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
                      onClick={() => setIsCreateOrderOpen(false)}
                    />
                    {/* Modal Container */}
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.97 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="relative bg-brand-bg rounded-3xl border border-brand-charcoal/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
                    >
                      {/* Modal Header */}
                      <div className="sticky top-0 bg-brand-bg/95 backdrop-blur-md border-b border-brand-charcoal/5 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                        <div>
                          <h3 className="text-lg font-semibold font-serif text-brand-charcoal">Create Order</h3>
                          <p className="text-[10px] text-brand-charcoal/40 mt-0.5">All fields are optional. Fill in what you need.</p>
                        </div>
                        <button
                          onClick={() => setIsCreateOrderOpen(false)}
                          className="h-8 w-8 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-charcoal/50 hover:bg-brand-charcoal/10 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 space-y-6">
                        {/* ── User Selection ── */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50 flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              Assign User
                            </label>
                            <label className="flex items-center gap-2 text-[11px] text-brand-charcoal/60 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={coIsCustomUser}
                                onChange={(e) => {
                                  setCoIsCustomUser(e.target.checked);
                                  if (e.target.checked) {
                                    setCoSelectedUserId(null);
                                    setCoSelectedUserLabel("");
                                  }
                                }}
                                className="rounded border-brand-charcoal/20 accent-brand-charcoal"
                              />
                              Custom User
                            </label>
                          </div>

                          {!coIsCustomUser ? (
                            <div className="relative">
                              {/* Search Input */}
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-charcoal/30" />
                                <input
                                  type="text"
                                  placeholder={coSelectedUserLabel || "Search by name or email..."}
                                  value={coUserSearch}
                                  onChange={(e) => { setCoUserSearch(e.target.value); setCoShowUserDropdown(true); }}
                                  onFocus={() => setCoShowUserDropdown(true)}
                                  className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 focus:ring-1 focus:ring-brand-charcoal/10 outline-none transition-all ${coSelectedUserLabel ? "text-brand-charcoal font-semibold" : ""}`}
                                />
                                {coSelectedUserLabel && (
                                  <button
                                    onClick={() => { setCoSelectedUserId(null); setCoSelectedUserLabel(""); setCoUserSearch(""); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-charcoal/30 hover:text-brand-charcoal/60 cursor-pointer"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Dropdown */}
                              {coShowUserDropdown && (
                                <div className="absolute z-50 mt-1 w-full bg-brand-bg border border-brand-charcoal/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                  {coFilteredUsers.length === 0 ? (
                                    <div className="px-4 py-3 text-xs text-brand-charcoal/40 italic">No users found</div>
                                  ) : (
                                    coFilteredUsers.slice(0, 20).map((u: any) => (
                                      <button
                                        key={u.id}
                                        onClick={() => {
                                          setCoSelectedUserId(u.id);
                                          setCoSelectedUserLabel(`${u.name} (${u.email})`);
                                          setCoUserSearch("");
                                          setCoShowUserDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-brand-charcoal/5 cursor-pointer flex items-center gap-3 transition-colors ${coSelectedUserId === u.id ? "bg-brand-green/5" : ""}`}
                                      >
                                        <div className="h-7 w-7 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                                          {u.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-semibold text-brand-charcoal truncate">{u.name}</div>
                                          <div className="text-[10px] text-brand-charcoal/40 truncate">{u.email}</div>
                                        </div>
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <input type="text" placeholder="Name" value={coCustomName} onChange={(e) => setCoCustomName(e.target.value)}
                                className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                              <input type="email" placeholder="Email" value={coCustomEmail} onChange={(e) => setCoCustomEmail(e.target.value)}
                                className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                              <input type="tel" placeholder="Phone" value={coCustomPhone} onChange={(e) => setCoCustomPhone(e.target.value)}
                                className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            </div>
                          )}
                        </div>

                        {/* ── Order Details ── */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Total (₹)</label>
                            <input type="number" placeholder="0" value={coTotalAmount} onChange={(e) => setCoTotalAmount(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Shipping (₹)</label>
                            <input type="number" placeholder="0" value={coShippingCharges} onChange={(e) => setCoShippingCharges(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">COD Charges</label>
                            <input type="number" placeholder="0" value={coCodCharges} onChange={(e) => setCoCodCharges(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Payment</label>
                            <select value={coPaymentMethod} onChange={(e) => setCoPaymentMethod(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none cursor-pointer">
                              <option value="COD">COD</option>
                              <option value="PREPAID">Prepaid</option>
                            </select>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Order Status</label>
                          <select value={coStatus} onChange={(e) => setCoStatus(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none cursor-pointer">
                            <option value="BOOKED">Booked</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>

                        {/* ── Shipping Address ── */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">Shipping Address</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="text" placeholder="Full Name" value={coFullName} onChange={(e) => setCoFullName(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="tel" placeholder="Phone" value={coPhone} onChange={(e) => setCoPhone(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <textarea placeholder="Address" value={coAddress} onChange={(e) => setCoAddress(e.target.value)} rows={2}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none resize-none" />
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <input type="text" placeholder="Landmark" value={coLandmark} onChange={(e) => setCoLandmark(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="Pincode" value={coPincode} onChange={(e) => setCoPincode(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="City" value={coCity} onChange={(e) => setCoCity(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="State" value={coState} onChange={(e) => setCoState(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                        </div>

                        {/* ── Items List ── */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">Purchased Garments ({coSelectedItemsList.length})</label>
                            <button
                              type="button"
                              onClick={() => {
                                setPsSearch("");
                                setPsSelectedProduct(null);
                                setPsColor("");
                                setPsSize("");
                                setPsQuantity(1);
                                setPsPriceOverride("");
                                setIsProductSelectorOpen(true);
                              }}
                              className="text-[10px] bg-brand-charcoal text-brand-bg px-2.5 py-1 rounded-lg font-semibold hover:bg-brand-charcoal/90 cursor-pointer shadow-xs"
                            >
                              + Add Garment
                            </button>
                          </div>

                          {coSelectedItemsList.length === 0 ? (
                            <div className="border border-dashed border-brand-charcoal/10 rounded-2xl p-6 text-center text-xs text-brand-charcoal/40 italic">
                              No garments added. Click "+ Add Garment" to select from inventory.
                            </div>
                          ) : (
                            <div className="border border-brand-charcoal/5 rounded-2xl overflow-hidden divide-y divide-brand-charcoal/5 bg-brand-bg text-xs">
                              {coSelectedItemsList.map((item, idx) => (
                                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    {item.image && (
                                      <div className="h-10 w-8 rounded bg-brand-gray overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.title} className="object-cover h-full w-full" />
                                      </div>
                                    )}
                                    <div>
                                      <h5 className="font-semibold text-brand-charcoal">{item.title}</h5>
                                      <p className="text-[10px] text-brand-charcoal/50 mt-0.5">
                                        Size: {item.size} | Color: {item.color}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="font-semibold">₹{Number(item.price * item.quantity).toFixed(2)}</div>
                                      <div className="text-[10px] text-brand-charcoal/40 font-light">
                                        ₹{Number(item.price).toFixed(2)} x {item.quantity}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCoSelectedItemsList(coSelectedItemsList.filter((_, i) => i !== idx));
                                      }}
                                      className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="sticky bottom-0 bg-brand-bg/95 backdrop-blur-md border-t border-brand-charcoal/5 px-6 py-4 rounded-b-3xl flex items-center justify-end gap-3">
                        <button
                          onClick={() => setIsCreateOrderOpen(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-brand-charcoal/60 hover:text-brand-charcoal rounded-xl border border-brand-charcoal/10 hover:bg-brand-charcoal/5 cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateOrderSubmit}
                          disabled={coSubmitting}
                          className="px-5 py-2.5 text-xs font-semibold bg-brand-charcoal text-brand-bg rounded-xl hover:bg-brand-charcoal/90 cursor-pointer transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {coSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                          {coSubmitting ? "Creating..." : "Create Order"}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ===== EDIT ORDER MODAL ===== */}
                {isEditOrderOpen && eoOrderId && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
                      onClick={() => setIsEditOrderOpen(false)}
                    />
                    {/* Modal Container */}
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.97 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="relative bg-brand-bg rounded-3xl border border-brand-charcoal/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
                    >
                      {/* Modal Header */}
                      <div className="sticky top-0 bg-brand-bg/95 backdrop-blur-md border-b border-brand-charcoal/5 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                        <div>
                          <h3 className="text-lg font-semibold font-serif text-brand-charcoal">Edit Order #{eoOrderId}</h3>
                          <p className="text-[10px] text-brand-charcoal/40 mt-0.5">Modify any shipping, payment, or line items.</p>
                        </div>
                        <button
                          onClick={() => setIsEditOrderOpen(false)}
                          className="h-8 w-8 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-charcoal/50 hover:bg-brand-charcoal/10 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 space-y-6">
                        {/* Customer billing details */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">Customer Contact</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input type="text" placeholder="Name" value={eoFullName} onChange={(e) => setEoFullName(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="email" placeholder="Email" value={eoEmail} onChange={(e) => setEoEmail(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="tel" placeholder="Phone" value={eoPhone} onChange={(e) => setEoPhone(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                        </div>

                        {/* Charges and details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Total Amount (₹)</label>
                            <input type="number" placeholder="0" value={eoTotalAmount} onChange={(e) => setEoTotalAmount(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Shipping Fee (₹)</label>
                            <input type="number" placeholder="0" value={eoShippingCharges} onChange={(e) => setEoShippingCharges(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">COD Fee (₹)</label>
                            <input type="number" placeholder="0" value={eoCodCharges} onChange={(e) => setEoCodCharges(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Payment Method</label>
                            <select value={eoPaymentMethod} onChange={(e) => setEoPaymentMethod(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none cursor-pointer">
                              <option value="COD">COD</option>
                              <option value="PREPAID">Prepaid</option>
                            </select>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Order Status</label>
                          <select value={eoStatus} onChange={(e) => setEoStatus(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none cursor-pointer">
                            <option value="BOOKED">Booked</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">Shipping Details</label>
                          <textarea placeholder="Address" value={eoAddress} onChange={(e) => setEoAddress(e.target.value)} rows={2}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none resize-none" />
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <input type="text" placeholder="Landmark" value={eoLandmark} onChange={(e) => setEoLandmark(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="Pincode" value={eoPincode} onChange={(e) => setEoPincode(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="City" value={eoCity} onChange={(e) => setEoCity(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="State" value={eoState} onChange={(e) => setEoState(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                        </div>

                        {/* Items Array JSON */}
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50 block mb-1">Purchased Garments (JSON)</label>
                          <textarea value={eoItems} onChange={(e) => setEoItems(e.target.value)} rows={5}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none resize-none font-mono" />
                          <p className="text-[9px] text-brand-charcoal/30 mt-1">
                            Format: [{`{"title":"...", "price":0, "quantity":1, "size":"M", "color":"#000", "image":"..."}`}]
                          </p>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="sticky bottom-0 bg-brand-bg/95 backdrop-blur-md border-t border-brand-charcoal/5 px-6 py-4 rounded-b-3xl flex items-center justify-end gap-3">
                        <button
                          onClick={() => setIsEditOrderOpen(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-brand-charcoal/60 hover:text-brand-charcoal rounded-xl border border-brand-charcoal/10 hover:bg-brand-charcoal/5 cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditOrderSubmit}
                          disabled={eoSubmitting}
                          className="px-5 py-2.5 text-xs font-semibold bg-brand-charcoal text-brand-bg rounded-xl hover:bg-brand-charcoal/90 cursor-pointer transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {eoSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          {eoSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ===== EDIT CUSTOM ORDER MODAL ===== */}
                {isEditCustomOrderOpen && ecoOrderId && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
                      onClick={() => setIsEditCustomOrderOpen(false)}
                    />
                    {/* Modal Container */}
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.97 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="relative bg-brand-bg rounded-3xl border border-brand-charcoal/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
                    >
                      {/* Modal Header */}
                      <div className="sticky top-0 bg-brand-bg/95 backdrop-blur-md border-b border-brand-charcoal/5 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                        <div>
                          <h3 className="text-lg font-semibold font-serif text-brand-charcoal">Edit Custom Order #{ecoOrderId}</h3>
                          <p className="text-[10px] text-brand-charcoal/40 mt-0.5">Modify shipping details, price, quantity, color, size, and status.</p>
                        </div>
                        <button
                          onClick={() => setIsEditCustomOrderOpen(false)}
                          className="h-8 w-8 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-charcoal/50 hover:bg-brand-charcoal/10 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 space-y-6">
                        {/* Customer billing details */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">Customer Contact</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input type="text" placeholder="Name" value={ecoFullName} onChange={(e) => setEcoFullName(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="email" placeholder="Email" value={ecoEmail} onChange={(e) => setEcoEmail(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="tel" placeholder="Phone" value={ecoPhone} onChange={(e) => setEcoPhone(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                        </div>

                        {/* Preferences */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Color</label>
                            <input type="text" placeholder="Color" value={ecoColor} onChange={(e) => setEcoColor(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Size</label>
                            <input type="text" placeholder="Size" value={ecoSize} onChange={(e) => setEcoSize(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Quantity</label>
                            <input type="number" placeholder="1" value={ecoQuantity} onChange={(e) => setEcoQuantity(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                        </div>

                        {/* Charges and details */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Unit Price (₹)</label>
                            <input type="number" placeholder="0" value={ecoPrice} onChange={(e) => setEcoPrice(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Shipping Fee (₹)</label>
                            <input type="number" placeholder="0" value={ecoShippingCharges} onChange={(e) => setEcoShippingCharges(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">COD Fee (₹)</label>
                            <input type="number" placeholder="0" value={ecoCodCharges} onChange={(e) => setEcoCodCharges(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Total (₹)</label>
                            <input type="number" disabled value={ecoTotalAmount}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-gray/50 outline-none font-bold" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Payment Method</label>
                            <select value={ecoPaymentMethod} onChange={(e) => setEcoPaymentMethod(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none cursor-pointer">
                              <option value="COD">COD</option>
                              <option value="PREPAID">Prepaid</option>
                            </select>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40 block mb-1">Order Status</label>
                          <select value={ecoStatus} onChange={(e) => setEcoStatus(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none cursor-pointer">
                            <option value="PENDING">PENDING</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PROCESSED">PROCESSED</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">Shipping Details</label>
                          <textarea placeholder="Address" value={ecoAddress} onChange={(e) => setEcoAddress(e.target.value)} rows={2}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none resize-none" />
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <input type="text" placeholder="Landmark" value={ecoLandmark} onChange={(e) => setEcoLandmark(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="Pincode" value={ecoPincode} onChange={(e) => setEcoPincode(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="City" value={ecoCity} onChange={(e) => setEcoCity(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                            <input type="text" placeholder="State" value={ecoState} onChange={(e) => setEcoState(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none" />
                          </div>
                        </div>

                        {/* Design Notes */}
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50 block mb-1">Design Notes</label>
                          <textarea value={ecoDesignNotes} onChange={(e) => setEcoDesignNotes(e.target.value)} rows={3}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none resize-none" />
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="sticky bottom-0 bg-brand-bg/95 backdrop-blur-md border-t border-brand-charcoal/5 px-6 py-4 rounded-b-3xl flex items-center justify-end gap-3">
                        <button
                          onClick={() => setIsEditCustomOrderOpen(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-brand-charcoal/60 hover:text-brand-charcoal rounded-xl border border-brand-charcoal/10 hover:bg-brand-charcoal/5 cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditCustomOrderSubmit}
                          disabled={ecoSubmitting}
                          className="px-5 py-2.5 text-xs font-semibold bg-brand-charcoal text-brand-bg rounded-xl hover:bg-brand-charcoal/90 cursor-pointer transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {ecoSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          Save Changes
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ===== INVOICE EDITOR & DOWNLOAD MODAL ===== */}
                {isInvoiceOpen && invOrderId && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
                      onClick={() => setIsInvoiceOpen(false)}
                    />
                    {/* Modal Container */}
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.97 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="relative bg-brand-bg rounded-3xl border border-brand-charcoal/10 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10"
                    >
                      {/* Modal Header */}
                      <div className="sticky top-0 bg-brand-bg/95 backdrop-blur-md border-b border-brand-charcoal/5 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                        <div>
                          <h3 className="text-lg font-semibold font-serif text-brand-charcoal">Tax Invoice Editor</h3>
                          <p className="text-[10px] text-brand-charcoal/40 mt-0.5">Customize client fields, date, or items below, then click Print.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const printContent = document.getElementById("invoice-print-area")?.innerHTML;
                              const printWindow = window.open("", "_blank");
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Invoice_Order_${invOrderId}</title>
                                      <style>
                                        body {
                                          background: #ffffff;
                                          color: #000000;
                                          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                          margin: 40px;
                                          padding: 0;
                                          -webkit-print-color-adjust: exact;
                                          print-color-adjust: exact;
                                        }
                                        .invoice-container { max-width: 800px; margin: 0 auto; }
                                        .header-row { display: flex; justify-content: space-between; border-bottom: 2px solid #222; padding-bottom: 20px; margin-bottom: 20px; }
                                        .logo-section h2 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; }
                                        .logo-section p { margin: 4px 0 0 0; font-size: 11px; color: #555; text-transform: uppercase; }
                                        .invoice-section { text-align: right; }
                                        .invoice-section h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #111; }
                                        .invoice-section p { margin: 5px 0 0 0; font-size: 12px; color: #444; }
                                        .billing-row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 25px; }
                                        .bill-to { width: 50%; font-size: 13px; line-height: 1.5; }
                                        .bill-to h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 1px; }
                                        .meta-details { width: 40%; text-align: right; font-size: 13px; line-height: 1.5; }
                                        .meta-details h4 { margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 1px; }
                                        .meta-details p { margin: 0 0 12px 0; }
                                        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 25px; }
                                        th { font-size: 11px; text-transform: uppercase; color: #555; border-bottom: 2px solid #222; padding: 10px 5px; text-align: left; letter-spacing: 1px; }
                                        td { padding: 12px 5px; border-bottom: 1px solid #eee; font-size: 13px; }
                                        .text-right { text-align: right; }
                                        .text-center { text-align: center; }
                                        .totals-wrapper { display: flex; justify-content: flex-end; margin-top: 15px; }
                                        .totals-table { width: 280px; margin: 0; }
                                        .totals-table td { padding: 6px 0; border: none; font-size: 13px; }
                                        .totals-table tr.grand-total td { border-top: 2px solid #222; font-weight: bold; font-size: 15px; padding-top: 12px; }
                                        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                                      </style>
                                    </head>
                                    <body onload="window.print();">
                                      <div class="invoice-container">
                                        <div class="header-row">
                                          <div class="logo-section">
                                            <h2>${invCompanyName}</h2>
                                            <p style="margin:2px 0 0 0;font-size:10px;color:#777;text-transform:none;">Operated by MADE DIFFERENT FK</p>
                                            <p style="margin:4px 0 0 0;">Official Tax Statement</p>
                                          </div>
                                          <div class="invoice-section">
                                            <h1>INVOICE</h1>
                                            <p>Order Reference: #${invOrderId}</p>
                                          </div>
                                        </div>
                                        <div class="billing-row">
                                          <div class="bill-to">
                                            <h4>Billed To</h4>
                                            <strong>${invFullName}</strong><br>
                                            ${invAddressDetails.replace(/\n/g, "<br>")}
                                          </div>
                                          <div class="meta-details">
                                            <h4>Invoice Date</h4>
                                            <p>${invDate}</p>
                                            <h4>Payment Type</h4>
                                            <p>${invPaymentMethod}</p>
                                          </div>
                                        </div>
                                        <table>
                                          <thead>
                                            <tr>
                                              <th>Garment Description</th>
                                              <th class="text-center">Qty</th>
                                              <th class="text-right">Price</th>
                                              <th class="text-right">Total</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${invItems.map(item => `
                                              <tr>
                                                <td>
                                                  <strong>${item.title || "Garment Line Item"}</strong><br>
                                                  <span style="font-size:11px;color:#666;">Size: ${item.size || "N/A"} | Color: ${item.color || "N/A"}</span>
                                                </td>
                                                <td class="text-center">${item.quantity || 1}</td>
                                                <td class="text-right">₹${Number(item.price || 0).toFixed(2)}</td>
                                                <td class="text-right">₹${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
                                              </tr>
                                            `).join("")}
                                          </tbody>
                                        </table>
                                        <div class="totals-wrapper">
                                          <table class="totals-table">
                                            <tr>
                                              <td>Subtotal</td>
                                              <td class="text-right">₹${invItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0).toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                              <td>Shipping Fee</td>
                                              <td class="text-right">₹${Number(invShippingCharges).toFixed(2)}</td>
                                            </tr>
                                            ${invCodCharges > 0 ? `
                                              <tr>
                                                <td>COD Charges</td>
                                                <td class="text-right">₹${Number(invCodCharges).toFixed(2)}</td>
                                              </tr>
                                            ` : ""}
                                            ${invDiscount > 0 ? `
                                              <tr>
                                                <td>Discount</td>
                                                <td class="text-right">-₹${Number(invDiscount).toFixed(2)}</td>
                                              </tr>
                                            ` : ""}
                                            ${invDeduction > 0 ? `
                                              <tr>
                                                <td>${invDeductionLabel || "Other Deductions"}</td>
                                                <td class="text-right">-₹${Number(invDeduction).toFixed(2)}</td>
                                              </tr>
                                            ` : ""}
                                            <tr class="grand-total">
                                              <td>Total Paid</td>
                                              <td class="text-right">₹${Number(invTotalAmount).toFixed(2)}</td>
                                            </tr>
                                          </table>
                                        </div>
                                        <div class="footer">
                                          <p>Thank you for purchasing from ${invCompanyName}!</p>
                                          <p style="margin:5px 0 0 0;font-size:10px;color:#888;">MDFK is operated by MADE DIFFERENT FK</p>
                                          <p>© 2026 ${invCompanyName}. All Rights Reserved.</p>
                                        </div>
                                      </div>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              }
                            }}
                            className="bg-brand-charcoal text-brand-bg px-4 py-2 text-xs font-semibold rounded-xl hover:bg-brand-charcoal/90 flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print / PDF
                          </button>
                          <button
                            onClick={() => setIsInvoiceOpen(false)}
                            className="h-8 w-8 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-charcoal/50 hover:bg-brand-charcoal/10 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 space-y-6">
                        {/* Interactive Edit Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-gray/30 p-4 rounded-2xl border border-brand-charcoal/5">
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">Invoice Settings & Client Details</h4>
                            <div>
                              <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Company Name</label>
                              <input type="text" value={invCompanyName} onChange={(e) => setInvCompanyName(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                            </div>
                            <div>
                              <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Billing Client Name</label>
                              <input type="text" value={invFullName} onChange={(e) => setInvFullName(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                            </div>
                            <div>
                              <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Billing Address Text</label>
                              <textarea value={invAddressDetails} onChange={(e) => setInvAddressDetails(e.target.value)} rows={2}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none resize-none" />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">Invoice Meta & Charges</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Invoice Date</label>
                                <input type="text" value={invDate} onChange={(e) => setInvDate(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                              </div>
                              <div>
                                <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Payment Type</label>
                                <input type="text" value={invPaymentMethod} onChange={(e) => setInvPaymentMethod(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Shipping (₹)</label>
                                <input type="number" value={invShippingCharges} onChange={(e) => setInvShippingCharges(Number(e.target.value))}
                                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                              </div>
                              <div>
                                <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">COD Charges</label>
                                <input type="number" value={invCodCharges} onChange={(e) => setInvCodCharges(Number(e.target.value))}
                                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                              </div>
                              <div>
                                <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Total Paid (₹)</label>
                                <input type="number" value={invTotalAmount} onChange={(e) => setInvTotalAmount(Number(e.target.value))}
                                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none font-bold text-brand-charcoal" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Discount (₹)</label>
                                <input type="number" value={invDiscount} onChange={(e) => setInvDiscount(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                              </div>
                              <div>
                                <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Deduction (₹)</label>
                                <input type="number" value={invDeduction} onChange={(e) => setInvDeduction(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] text-brand-charcoal/50 block mb-0.5">Deduction Label</label>
                              <input type="text" value={invDeductionLabel} onChange={(e) => setInvDeductionLabel(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-brand-charcoal/10 bg-brand-bg outline-none" />
                            </div>
                          </div>
                        </div>

                        {/* Interactive Items Table editor */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">Modify Items List Rows</h4>
                            <button
                              onClick={() => {
                                setInvItems([...invItems, { title: "New Custom Garment", price: 0, quantity: 1, size: "M", color: "#000" }]);
                              }}
                              className="text-[10px] bg-brand-charcoal/5 text-brand-charcoal border border-brand-charcoal/15 px-2.5 py-1 rounded-lg font-semibold hover:bg-brand-charcoal/10 cursor-pointer"
                            >
                              + Add Item Row
                            </button>
                          </div>
                          
                          <div className="border border-brand-charcoal/5 rounded-2xl overflow-hidden divide-y divide-brand-charcoal/5 bg-brand-bg text-xs">
                            {invItems.map((item, index) => (
                              <div key={index} className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                <div className="sm:col-span-5">
                                  <input
                                    type="text"
                                    value={item.title || ""}
                                    onChange={(e) => {
                                      const updated = [...invItems];
                                      updated[index].title = e.target.value;
                                      setInvItems(updated);
                                    }}
                                    placeholder="Garment title"
                                    className="w-full px-2.5 py-1 text-xs border border-brand-charcoal/10 rounded bg-brand-bg outline-none"
                                  />
                                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                                    <input
                                      type="text"
                                      value={item.size || ""}
                                      onChange={(e) => {
                                        const updated = [...invItems];
                                        updated[index].size = e.target.value;
                                        setInvItems(updated);
                                      }}
                                      placeholder="Size"
                                      className="px-2 py-0.5 text-[10px] border border-brand-charcoal/10 rounded bg-brand-bg outline-none"
                                    />
                                    <input
                                      type="text"
                                      value={item.color || ""}
                                      onChange={(e) => {
                                        const updated = [...invItems];
                                        updated[index].color = e.target.value;
                                        setInvItems(updated);
                                      }}
                                      placeholder="Color code"
                                      className="px-2 py-0.5 text-[10px] border border-brand-charcoal/10 rounded bg-brand-bg outline-none"
                                    />
                                  </div>
                                </div>
                                
                                <div className="sm:col-span-2">
                                  <label className="text-[8px] text-brand-charcoal/40 block sm:hidden">Qty</label>
                                  <input
                                    type="number"
                                    value={item.quantity || 1}
                                    onChange={(e) => {
                                      const updated = [...invItems];
                                      updated[index].quantity = Number(e.target.value);
                                      setInvItems(updated);
                                    }}
                                    className="w-full px-2 py-1 text-xs border border-brand-charcoal/10 rounded bg-brand-bg outline-none"
                                  />
                                </div>

                                <div className="sm:col-span-3">
                                  <label className="text-[8px] text-brand-charcoal/40 block sm:hidden">Rate (₹)</label>
                                  <input
                                    type="number"
                                    value={item.price || 0}
                                    onChange={(e) => {
                                      const updated = [...invItems];
                                      updated[index].price = Number(e.target.value);
                                      setInvItems(updated);
                                    }}
                                    className="w-full px-2 py-1 text-xs border border-brand-charcoal/10 rounded bg-brand-bg outline-none"
                                  />
                                </div>

                                <div className="sm:col-span-2 text-right">
                                  <button
                                    onClick={() => {
                                      setInvItems(invItems.filter((_, idx) => idx !== index));
                                    }}
                                    className="text-[10px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hidden preview structure copied to iframe during window print */}
                        <div id="invoice-print-area" className="hidden">
                          <div className="invoice-container">
                            <div className="header-row">
                              <div className="logo-section">
                                <h2>{invCompanyName}</h2>
                                <p>Official Tax Statement</p>
                              </div>
                              <div className="invoice-section">
                                <h1>INVOICE</h1>
                                <p>Order Reference: #{invOrderId}</p>
                              </div>
                            </div>

                            <div className="billing-row">
                              <div className="bill-to">
                                <h4>Billed To</h4>
                                <strong>{invFullName}</strong><br />
                                {invAddressDetails.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}
                              </div>
                              <div className="meta-details">
                                <h4>Invoice Date</h4>
                                <p>{invDate}</p>
                                <h4>Payment Type</h4>
                                <p>{invPaymentMethod}</p>
                              </div>
                            </div>

                            <table>
                              <thead>
                                <tr>
                                  <th>Garment Description</th>
                                  <th className="text-center">Qty</th>
                                  <th className="text-right">Price</th>
                                  <th className="text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invItems.map((item, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <strong>{item.title || "Garment Line Item"}</strong><br />
                                      <span style={{ fontSize: "11px", color: "#666" }}>Size: {item.size || "N/A"} | Color: {item.color || "N/A"}</span>
                                    </td>
                                    <td className="text-center">{item.quantity || 1}</td>
                                    <td className="text-right">₹{Number(item.price || 0).toFixed(2)}</td>
                                    <td className="text-right">₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div className="totals-wrapper">
                              <table className="totals-table">
                                <tbody>
                                  <tr>
                                    <td>Subtotal</td>
                                    <td className="text-right">₹{invItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0).toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td>Shipping Fee</td>
                                    <td className="text-right">₹{Number(invShippingCharges).toFixed(2)}</td>
                                  </tr>
                                  {invCodCharges > 0 && (
                                    <tr>
                                      <td>COD Charges</td>
                                      <td className="text-right">₹{Number(invCodCharges).toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {invDiscount > 0 && (
                                    <tr>
                                      <td>Discount</td>
                                      <td className="text-right">-₹{Number(invDiscount).toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {invDeduction > 0 && (
                                    <tr>
                                      <td>{invDeductionLabel || "Other Deductions"}</td>
                                      <td className="text-right">-₹{Number(invDeduction).toFixed(2)}</td>
                                    </tr>
                                  )}
                                  <tr className="grand-total">
                                    <td>Total Paid</td>
                                    <td className="text-right">₹{Number(invTotalAmount).toFixed(2)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="footer">
                              <p>Thank you for purchasing from {invCompanyName}!</p>
                              <p>© 2026 {invCompanyName}. All Rights Reserved.</p>
                            </div>
                          </div>
                        </div>

                        {/* Printable UI Mockup for view in the Modal */}
                        <div className="border border-brand-charcoal/10 rounded-2xl bg-white p-6 sm:p-8 text-black shadow-xs font-sans text-xs">
                          <div className="flex justify-between border-b-2 border-black pb-4 mb-4">
                            <div>
                              <h2 className="text-xl font-black tracking-wider text-black">{invCompanyName}</h2>
                              <p className="text-[9px] text-gray-500 mt-0.5">operated by MADE DIFFERENT FK</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">official tax invoice</p>
                            </div>
                            <div className="text-right">
                              <h1 className="text-lg font-black tracking-widest text-black">INVOICE</h1>
                              <p className="text-[10px] text-gray-600 mt-1 font-semibold">REF: #{invOrderId}</p>
                            </div>
                          </div>

                          <div className="flex justify-between border-b border-gray-100 pb-4 mb-6">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Billed To</span>
                              <strong className="text-sm font-bold">{invFullName}</strong>
                              <p className="text-gray-600 leading-relaxed mt-1 font-light whitespace-pre-line">{invAddressDetails}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Invoice Details</span>
                              <strong className="block">{invDate}</strong>
                              <span className="text-[10px] text-gray-500 block mt-1">{invPaymentMethod} Payment</span>
                            </div>
                          </div>

                          <table className="w-full border-collapse mb-6">
                            <thead>
                              <tr className="border-b-2 border-black">
                                <th className="text-left py-2 text-[9px] tracking-wider text-gray-500 font-bold">GARMENT DESCRIPTION</th>
                                <th className="text-center py-2 text-[9px] tracking-wider text-gray-500 font-bold w-16">QTY</th>
                                <th className="text-right py-2 text-[9px] tracking-wider text-gray-500 font-bold w-24">PRICE</th>
                                <th className="text-right py-2 text-[9px] tracking-wider text-gray-500 font-bold w-24">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-3">
                                    <strong className="text-gray-900 font-bold block">{item.title || "Garment Line Item"}</strong>
                                    <span className="text-[10px] text-gray-500 mt-0.5 block">Size: {item.size || "N/A"} | Color: {item.color || "N/A"}</span>
                                  </td>
                                  <td className="text-center py-3">{item.quantity || 1}</td>
                                  <td className="text-right py-3">₹{Number(item.price || 0).toFixed(2)}</td>
                                  <td className="text-right py-3">₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="flex justify-end">
                            <table className="w-64 text-xs">
                              <tbody>
                                <tr>
                                  <td className="py-1 border-none text-gray-500">Subtotal</td>
                                  <td className="text-right py-1 border-none font-semibold">₹{invItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td className="py-1 border-none text-gray-500">Shipping Fee</td>
                                  <td className="text-right py-1 border-none font-semibold">₹{Number(invShippingCharges).toFixed(2)}</td>
                                </tr>
                                {invCodCharges > 0 && (
                                  <tr>
                                    <td className="py-1 border-none text-gray-500">COD Surcharge</td>
                                    <td className="text-right py-1 border-none font-semibold">₹{Number(invCodCharges).toFixed(2)}</td>
                                  </tr>
                                )}
                                {invDiscount > 0 && (
                                  <tr>
                                    <td className="py-1 border-none text-gray-500">Discount</td>
                                    <td className="text-right py-1 border-none font-semibold text-brand-green">-₹{Number(invDiscount).toFixed(2)}</td>
                                  </tr>
                                )}
                                {invDeduction > 0 && (
                                  <tr>
                                    <td className="py-1 border-none text-gray-500">{invDeductionLabel || "Other Deductions"}</td>
                                    <td className="text-right py-1 border-none font-semibold text-red-500">-₹{Number(invDeduction).toFixed(2)}</td>
                                  </tr>
                                )}
                                <tr className="border-t-2 border-black font-bold text-sm">
                                  <td className="py-3 border-none">Total Paid</td>
                                  <td className="text-right py-3 border-none font-black text-black">₹{Number(invTotalAmount).toFixed(2)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="text-center border-t border-gray-100 pt-6 mt-6 text-[10px] text-gray-400 font-light">
                            <p>Thank you for choosing {invCompanyName}!</p>
                            <p className="mt-1 text-[9px] text-gray-400">MDFK is operated by MADE DIFFERENT FK</p>
                            <p className="mt-1">© 2026 {invCompanyName} All rights reserved.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ===== PRODUCT SELECTOR MODAL ===== */}
                {isProductSelectorOpen && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-charcoal/60 backdrop-blur-md p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full max-w-2xl bg-brand-bg rounded-3xl p-6 border border-brand-charcoal/10 shadow-2xl relative text-brand-charcoal max-h-[85vh] flex flex-col"
                    >
                      {/* Modal Header */}
                      <div className="flex justify-between items-center border-b border-brand-charcoal/5 pb-4 mb-4">
                        <h3 className="text-lg font-semibold font-serif">Select Garment from Inventory</h3>
                        <button
                          onClick={() => setIsProductSelectorOpen(false)}
                          className="text-brand-charcoal/50 hover:text-brand-charcoal text-xl font-light cursor-pointer"
                        >
                          ×
                        </button>
                      </div>

                      {/* Search Bar (Only visible when no product is selected yet) */}
                      {!psSelectedProduct && (
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-charcoal/30" />
                          <input
                            type="text"
                            placeholder="Search products by title or category..."
                            value={psSearch}
                            onChange={(e) => setPsSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none"
                          />
                        </div>
                      )}

                      {/* Modal Content - Scrollable area */}
                      <div className="flex-grow overflow-y-auto pr-1 space-y-4">
                        {!psSelectedProduct ? (
                          // Grid list of products
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {products
                              .filter((p: any) => {
                                const q = psSearch.toLowerCase();
                                return p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
                              })
                              .map((prod: any) => (
                                <div
                                  key={prod.id}
                                  onClick={() => {
                                    setPsSelectedProduct(prod);
                                    setPsColor(prod.colors?.[0] || "");
                                    setPsSize(prod.sizes?.[0] || "");
                                    setPsQuantity(1);
                                    setPsPriceOverride(prod.price?.toString() || "");
                                  }}
                                  className="border border-brand-charcoal/5 rounded-2xl p-3 cursor-pointer hover:bg-brand-charcoal/5 transition-all text-left flex flex-col justify-between"
                                >
                                  <div className="aspect-[3/4] bg-brand-gray rounded-xl overflow-hidden mb-2 relative flex items-center justify-center">
                                    {prod.images?.[0] ? (
                                      <img src={prod.images[0]} alt={prod.title} className="object-cover w-full h-full" />
                                    ) : (
                                      <Package className="h-6 w-6 text-brand-charcoal/20" />
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-xs text-brand-charcoal truncate">{prod.title}</h5>
                                    <p className="text-[10px] text-brand-charcoal/40 uppercase tracking-wider mt-0.5">{prod.category}</p>
                                    <p className="text-xs font-bold text-brand-green mt-1">₹{Number(prod.price).toFixed(2)}</p>
                                  </div>
                                </div>
                              ))}
                            {products.filter((p: any) => {
                              const q = psSearch.toLowerCase();
                              return p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
                            }).length === 0 && (
                              <div className="col-span-full py-12 text-center text-xs text-brand-charcoal/40 italic">
                                No products matching search query found.
                              </div>
                            )}
                          </div>
                        ) : (
                          // Configure Product Options before adding
                          <div className="space-y-6 text-xs text-left">
                            <div className="flex gap-4 items-center bg-brand-gray/30 p-4 rounded-2xl border border-brand-charcoal/5">
                              <div className="h-20 w-16 bg-brand-gray rounded-xl overflow-hidden flex-shrink-0">
                                {psSelectedProduct.images?.[0] ? (
                                  <img src={psSelectedProduct.images[0]} alt={psSelectedProduct.title} className="object-cover w-full h-full" />
                                ) : (
                                  <Package className="h-6 w-6 text-brand-charcoal/20" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm">{psSelectedProduct.title}</h4>
                                <p className="text-[10px] text-brand-charcoal/40 uppercase mt-0.5">{psSelectedProduct.category}</p>
                                <p className="font-bold text-brand-green mt-1.5">Original Price: ₹{Number(psSelectedProduct.price).toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Colors */}
                              <div>
                                <label className="font-semibold text-brand-charcoal block mb-1.5">Select Color</label>
                                {psSelectedProduct.colors && psSelectedProduct.colors.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {psSelectedProduct.colors.map((c: string) => (
                                      <button
                                        key={c}
                                        type="button"
                                        onClick={() => setPsColor(c)}
                                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                          psColor === c
                                            ? "bg-brand-charcoal text-brand-bg border-brand-charcoal"
                                            : "border-brand-charcoal/10 hover:bg-brand-charcoal/5"
                                        }`}
                                      >
                                        {!c.includes("M:") && !c.includes("F:") && (
                                          <span className="h-2 w-2 rounded-full border border-brand-charcoal/10" style={{ backgroundColor: c }} />
                                        )}
                                        {formatColor(c)}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={psColor}
                                    onChange={(e) => setPsColor(e.target.value)}
                                    placeholder="Enter custom color"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:outline-none"
                                  />
                                )}
                              </div>

                              {/* Sizes */}
                              <div>
                                <label className="font-semibold text-brand-charcoal block mb-1.5">Select Size</label>
                                {psSelectedProduct.sizes && psSelectedProduct.sizes.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {psSelectedProduct.sizes.map((s: string) => (
                                      <button
                                        key={s}
                                        type="button"
                                        onClick={() => setPsSize(s)}
                                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                          psSize === s
                                            ? "bg-brand-charcoal text-brand-bg border-brand-charcoal"
                                            : "border-brand-charcoal/10 hover:bg-brand-charcoal/5"
                                        }`}
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={psSize}
                                    onChange={(e) => setPsSize(e.target.value)}
                                    placeholder="Enter custom size"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:outline-none"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {/* Price Override */}
                              <div>
                                <label className="font-semibold text-brand-charcoal block mb-1.5">Order Unit Price (₹)</label>
                                <input
                                  type="number"
                                  value={psPriceOverride}
                                  onChange={(e) => setPsPriceOverride(e.target.value)}
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none"
                                />
                              </div>

                              {/* Quantity */}
                              <div>
                                <label className="font-semibold text-brand-charcoal block mb-1.5">Quantity</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={psQuantity}
                                  onChange={(e) => setPsQuantity(Math.max(1, Number(e.target.value)))}
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-charcoal/10 bg-brand-bg focus:border-brand-charcoal/30 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modal Footer */}
                      <div className="flex justify-between items-center border-t border-brand-charcoal/5 pt-4 mt-4">
                        {psSelectedProduct ? (
                          <button
                            type="button"
                            onClick={() => setPsSelectedProduct(null)}
                            className="px-4 py-2 text-xs font-semibold text-brand-charcoal/60 hover:text-brand-charcoal border border-brand-charcoal/10 rounded-xl hover:bg-brand-charcoal/5 cursor-pointer"
                          >
                            ← Back to List
                          </button>
                        ) : (
                          <div />
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsProductSelectorOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-brand-charcoal/60 hover:text-brand-charcoal rounded-xl border border-brand-charcoal/10 hover:bg-brand-charcoal/5 cursor-pointer"
                          >
                            Close
                          </button>
                          {psSelectedProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!psColor) {
                                  useAlertStore.getState().showAlert("Please select a color.");
                                  return;
                                }
                                if (!psSize) {
                                  useAlertStore.getState().showAlert("Please select a size.");
                                  return;
                                }
                                const newItem = {
                                  title: psSelectedProduct.title,
                                  price: Number(psPriceOverride) || 0,
                                  quantity: psQuantity || 1,
                                  size: psSize,
                                  color: psColor,
                                  image: psSelectedProduct.images?.[0] || "",
                                };
                                setCoSelectedItemsList([...coSelectedItemsList, newItem]);
                                setIsProductSelectorOpen(false);
                              }}
                              className="bg-brand-charcoal text-brand-bg px-4 py-2 rounded-xl text-xs font-semibold hover:bg-brand-charcoal/90 transition-all cursor-pointer shadow-xs"
                            >
                              Add to Order
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

            {/* -------------------- TAB CONTENT: EXCHANGE ORDERS -------------------- */}
            {activeTab === "exchange-orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Size Exchange Log
                  </h2>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold border border-indigo-200">
                    {exchangeOrders ? exchangeOrders.length : 0} exchange(s) processed
                  </span>
                </div>

                <div className="space-y-6">
                  {exchangeOrders && exchangeOrders.map((ord: any) => (
                    <div key={ord.id} className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-6 shadow-xs relative overflow-hidden">
                      {/* Header bar of order card */}
                      <div className="flex flex-col sm:flex-row justify-between border-b border-brand-charcoal/5 pb-4 mb-4 text-xs gap-3">
                        <div>
                          <div className="font-bold text-brand-charcoal text-sm flex items-center gap-2">
                            <span>Exchange #{ord.id}</span>
                            <span className="text-[10px] bg-brand-charcoal/5 text-brand-charcoal/60 px-2 py-0.5 rounded font-mono">Original: #{ord.originalOrderId}</span>
                            <select 
                              value={ord.status || "BOOKED"}
                              onChange={(e) => handleExchangeOrderStatusUpdate(ord.id, e.target.value)}
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
                          <div className="font-semibold text-brand-charcoal">{ord.user?.name || ord.fullName}</div>
                          <div className="text-[10px] text-brand-charcoal/50 mb-2">{ord.user?.email || ord.email}</div>
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
                                onClick={() => handleExchangeNimbusShip(ord.id)}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 cursor-pointer"
                              >
                                Ship with Nimbuspost
                              </button>
                            )}
                            {ord.nimbuspostAwb && ord.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleExchangeNimbusTrack(ord.id)}
                                className="text-[10px] text-blue-500 underline cursor-pointer"
                              >
                                Track Shipment
                              </button>
                            )}
                            {ord.nimbuspostAwb && ord.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleExchangeNimbusCancel(ord.id)}
                                className="text-[10px] text-red-500 underline cursor-pointer"
                              >
                                Cancel Shipment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pickup Address & Exchange Notes Alert Box */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {ord.pickupAddress && (
                          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-brand-charcoal/80">
                            <span className="font-bold text-indigo-700 block mb-1">📦 Return Pickup Address</span>
                            <div>{ord.pickupAddress}</div>
                          </div>
                        )}
                        {ord.exchangeNotes && (
                          <div className="p-3.5 rounded-2xl bg-yellow-50/50 border border-yellow-100 text-xs text-brand-charcoal/80">
                            <span className="font-bold text-yellow-700 block mb-1">💬 Size Exchange Request Details</span>
                            <div className="italic font-medium">"{ord.exchangeNotes}"</div>
                          </div>
                        )}
                      </div>

                      {/* Shipping Details */}
                      {ord.address && (
                        <div className="mt-2 p-4 rounded-2xl bg-brand-gray/30 border border-brand-charcoal/5 text-xs text-brand-charcoal/70">
                          <div className="font-semibold text-brand-charcoal mb-1 flex items-center justify-between">
                            <span>Replacement Delivery Address</span>
                            {ord.phone && <span className="text-[10px] font-mono">Ph: {ord.phone}</span>}
                          </div>
                          <div>{ord.fullName || (ord.user && ord.user.name)}</div>
                          <div>{ord.address}</div>
                          {ord.landmark && <div>Landmark: {ord.landmark}</div>}
                          <div>{ord.city}, {ord.state} - {ord.pincode}</div>
                        </div>
                      )}

                      {/* Items details list */}
                      <div className="space-y-3 mt-4">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-charcoal/40 block">Original Purchased Garments ({ord.items ? ord.items.length : 0})</span>
                        <div className="divide-y divide-brand-charcoal/5">
                          {ord.items && ord.items.map((item: any, idx: number) => (
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
                                    <span className="uppercase">Size: {item.size}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      Color:{" "}
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
                    </div>
                  ))}
                  {(!exchangeOrders || exchangeOrders.length === 0) && (
                    <div className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-12 text-center text-xs text-brand-charcoal/40 italic">
                      No size exchange requests recorded.
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
                           
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-white p-4 rounded-xl border border-brand-charcoal/5">
                             <div>
                               <span className="block text-[10px] uppercase font-bold text-brand-charcoal/50">Customer</span>
                               <p className="font-semibold">{ord.fullName}</p>
                               <p className="text-xs">{ord.email}</p>
                               <p className="text-xs">{ord.phone}</p>
                             </div>
                             <div>
                               <span className="block text-[10px] uppercase font-bold text-brand-charcoal/50">Preferences</span>
                               <p className="font-semibold">{ord.color || "No color"} - Size {ord.size || "N/A"}</p>
                               <p className="text-xs">Qty: {ord.quantity || 1}</p>
                             </div>
                             <div>
                               <span className="block text-[10px] uppercase font-bold text-brand-charcoal/50">Pricing & Billing</span>
                               <p className="font-semibold">Unit Price: ₹{Number(ord.price || 0).toFixed(2)}</p>
                               <p className="text-xs text-brand-charcoal/60">Subtotal: ₹{((ord.price || 0) * (ord.quantity || 1)).toFixed(2)}</p>
                               {((ord.shippingCharges || 0) > 0 || (ord.codCharges || 0) > 0) && (
                                 <p className="text-[10px] text-brand-charcoal/40">
                                   Ship: ₹{ord.shippingCharges || 0} | COD: ₹{ord.codCharges || 0}
                                 </p>
                               )}
                               <p className="font-bold text-brand-green mt-0.5 font-sans">Total Paid: ₹{Number(ord.totalAmount || 0).toFixed(2)}</p>
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

                           <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-charcoal/5 justify-end">
                             <button
                               onClick={() => handleInvoiceClick(ord)}
                               className="bg-brand-charcoal/5 text-brand-charcoal border border-brand-charcoal/10 hover:bg-brand-charcoal/10 px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                             >
                               <Printer className="h-3.5 w-3.5" />
                               Invoice Editor
                             </button>
                             <button
                               onClick={() => handleEditCustomOrderClick(ord)}
                               className="bg-brand-charcoal text-brand-bg hover:bg-brand-charcoal/90 px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                             >
                               <Edit className="h-3.5 w-3.5" />
                               Edit Info
                             </button>
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
                        <span>Items Subtotal</span>
                        <span>₹{(selectedOrder.totalAmount - (selectedOrder.shippingCharges || 0) - (selectedOrder.codCharges || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-brand-charcoal/60">
                        <span>Shipping</span>
                        <span>₹{(selectedOrder.shippingCharges || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-brand-charcoal/60">
                        <span>COD Charges</span>
                        <span>₹{(selectedOrder.codCharges || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-brand-charcoal/60">
                        <span>RTO Charges (Return Est.)</span>
                        <span>₹{(selectedOrder.rtoCharges || 0).toFixed(2)}</span>
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
