import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Special Offers - MDFK CLOTHING CO.",
  description: "Check out the latest discounts and exclusive streetwear offers at MDFK Clothing Co.",
};

export default function OfferLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
