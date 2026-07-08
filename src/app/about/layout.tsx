import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | MDFK CLOTHING CO.",
  description: "Learn more about MDFK Clothing Co., our sustainable practices, and our mission to bridge physical garment artistry with Gen-Z digital lifestyles.",
  alternates: {
    canonical: '/about',
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
