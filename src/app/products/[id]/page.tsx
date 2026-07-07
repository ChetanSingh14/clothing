import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching product details on server:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found - MDFK CLOTHING CO.",
      description: "The product you are looking for does not exist or has been removed.",
    };
  }

  return {
    title: `${product.title} - MDFK CLOTHING CO.`,
    description: product.description,
    openGraph: {
      title: `${product.title} - MDFK CLOTHING CO.`,
      description: product.description,
      images: [
        {
          url: product.images?.[0] || "",
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient initialProduct={product} />;
}
