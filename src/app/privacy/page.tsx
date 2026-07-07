import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - MDFK CLOTHING CO.",
  description: "Learn about how MADE DIFFERENT FK (mdfkclothing.com) collects, uses, and protects your personal and order information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green/20 selection:text-brand-charcoal">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 sm:px-8 py-24 md:py-32">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-charcoal tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-sm md:prose-base prose-stone max-w-none text-brand-charcoal/80 space-y-8">
          <section>
            <p className="text-lg leading-relaxed">
              At <strong>MADE DIFFERENT FK</strong> (mdfkclothing.com), your privacy is our priority. This policy outlines how we collect, use, and protect your personal information when you visit our site or make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Device Information:</strong> We automatically collect details about your device, browser, IP address, and cookies to improve your browsing experience.</li>
              <li><strong>Order Information:</strong> When you make a purchase, we collect necessary details such as your name, billing/shipping address, payment information, and email to process your order.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Fulfill and manage your orders, process payments, and provide order confirmations.</li>
              <li>Communicate with you regarding your order or customer service inquiries.</li>
              <li>Screen for potential risk or fraud.</li>
              <li>Improve and optimize our website for a better shopping experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">3. Sharing Your Information</h2>
            <p>
              We respect your privacy and will never sell your personal data. We only share information with trusted third parties (like payment processors and shipping partners) strictly when necessary to fulfill your orders and operate our business effectively.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-charcoal mb-4">4. Policy Updates</h2>
            <p>
              We may update this privacy policy periodically to reflect changes in our practices or for legal and regulatory reasons. The latest version will always be available on this page.
            </p>
          </section>
          
          <section className="pt-4 border-t border-brand-charcoal/10">
            <p className="font-medium text-brand-charcoal">
              For any privacy-related questions, please contact our support team. <br/>
              mdfkclothing.com is legally owned and operated by MADE DIFFERENT FK.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
