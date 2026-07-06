"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import InteractiveBentoGallery from "./ui/interactive-bento-gallery";
import { apiFetch } from "@/utils/api";

export default function BentoGrid() {
  const companyName = useSettingsStore((state) => state.companyName);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await apiFetch("/gallery");
        if (res.success && res.data) {
          setGalleryImages(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchImages();
  }, []);

  const mediaItems = [
    {
      id: 1,
      type: "image",
      title: "Graphic Drops, Raw Energy",
      desc: "280GSM heavyweight cotton — built to outlast.",
      url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
      span: "md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2 col-span-1",
    },
    {
      id: 2,
      type: "image",
      title: "Made for the Culture",
      desc: "Designed in India, worn worldwide.",
      url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-1 md:row-span-1 sm:col-span-1 sm:row-span-1 col-span-1",
    },
    {
      id: 3,
      type: "image",
      title: "Every Print Is Original",
      desc: "No repeat prints. Own your moment.",
      url: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-1 col-span-1",
    },
    {
      id: 4,
      type: "image",
      title: "Seasonal Drops",
      desc: "Exclusive streetwear capsule collections.",
      url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-1 md:row-span-1 sm:col-span-3 sm:row-span-1 col-span-1",
    },
    {
      id: 5,
      type: "image",
      title: "Raw Aesthetic",
      desc: "Street-ready silhouettes.",
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-2 md:row-span-1 sm:col-span-1 sm:row-span-2 col-span-1",
    },
    {
      id: 6,
      type: "image",
      title: "Heavyweight Cotton",
      desc: "Thick, structured, uncompromising.",
      url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-1 col-span-1",
    },
    {
      id: 7,
      type: "image",
      title: "No AI Prints",
      desc: "100% original art, zero compromises.",
      url: "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-2 md:row-span-1 sm:col-span-2 sm:row-span-1 col-span-1",
    },
  ];

  const dynamicMediaItems = mediaItems.map((item, index) => {
    if (galleryImages[index] && galleryImages[index].url) {
      return { ...item, url: galleryImages[index].url };
    }
    return item;
  });

  return (
    <section id="product" className="py-24 bg-brand-bg relative w-full">
      <InteractiveBentoGallery
        mediaItems={dynamicMediaItems}
        title="Prints That Hit Different"
        description={`Every tee from ${companyName} is a statement. Bold graphics, heavyweight cotton, drop-ready drops designed for Gen Z who refuse to blend in.`}
      />
    </section>
  );
}
