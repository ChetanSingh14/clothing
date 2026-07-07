import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - MDFK CLOTHING CO.",
  description: "Discover our mission, story, and the three friends behind MDFK Clothing Co., creating premium printed streetwear in India.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
