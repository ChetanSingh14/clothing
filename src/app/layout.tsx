import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
  title: "Flowbox - Streamline Your Team, Supercharge Your Workflow",
  description: "An all-in-one platform to plan, collaborate, and deliver — faster and smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-brand-bg text-brand-charcoal font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
