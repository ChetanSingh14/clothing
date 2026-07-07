import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - MDFK CLOTHING CO.",
  description: "Read the terms of service of MDFK CLOTHING CO., legally owned and operated by MADE DIFFERENT FK.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green/20 selection:text-brand-charcoal">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 sm:px-8 py-24 md:py-32">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-charcoal tracking-tight mb-8">Terms of Service</h1>
        
        <div className="prose prose-sm md:prose-base prose-stone max-w-none text-brand-charcoal/80 space-y-8">
          <section>
            <p className="text-lg leading-relaxed">
              Welcome to <strong>mdfkclothing.com</strong>, legally owned and operated by <strong>MADE DIFFERENT FK</strong>. By accessing or using our website, you agree to comply with and be bound by the following terms.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">1. General Conditions</h2>
            <p>
              We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, or exploit any portion of our service or website without express written permission from us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">2. Products & Pricing</h2>
            <p>
              Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product or service at any time. We have made every effort to display the colors and images of our products as accurately as possible, but cannot guarantee that your monitor's display will be completely accurate.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">3. Intellectual Property</h2>
            <p>
              All content on this site, including text, graphics, logos, images, and software, is the exclusive property of MADE DIFFERENT FK and is protected by international copyright and trademark laws.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">4. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the applicable laws in the jurisdiction where MADE DIFFERENT FK operates, without regard to its conflict of law provisions.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">5. Modifications to Terms</h2>
            <p>
              You can review the most current version of our Terms of Service at any time on this page. We reserve the right to update, change, or replace any part of these terms by posting updates directly to our website.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
