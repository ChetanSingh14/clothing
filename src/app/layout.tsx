import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import AlertModal from "@/components/AlertModal";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mdfkclothing.com"),
  title: "MDFK CLOTHING CO. - Printed Streetwear Tees",
  description: "Discover bold graphic tees crafted for Gen Z, featuring exclusive prints and premium cotton blends.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${playfairDisplay.variable} ${plusJakartaSans.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full bg-brand-bg text-brand-charcoal font-sans antialiased overflow-x-hidden">
        {children}
        <Chatbot />
        <AlertModal />
      </body>
    </html>
  );
}
