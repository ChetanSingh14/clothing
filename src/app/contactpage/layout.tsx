import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - MDFK CLOTHING CO.",
  description: "Get in touch with the MDFK Clothing Co. team for support, orders, or inquiries.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
