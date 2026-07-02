import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green/20 selection:text-brand-charcoal">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 sm:px-8 py-24 md:py-32">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-charcoal tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-sm md:prose-base prose-stone max-w-none text-brand-charcoal/80 space-y-6">
          <p>
            This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from mdfkclothing.com (the "Site").
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Personal Information We Collect</h2>
          <p>
            When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Legal Entity</h2>
          <p className="font-bold">
            mdfkclothing.com is legally owned and operated by MADE DIFFERENT FK.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">How Do We Use Your Personal Information?</h2>
          <p>
            We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Changes</h2>
          <p>
            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
