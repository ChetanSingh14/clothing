import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green/20 selection:text-brand-charcoal">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 sm:px-8 py-24 md:py-32">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-charcoal tracking-tight mb-8">Terms of Service</h1>
        
        <div className="prose prose-sm md:prose-base prose-stone max-w-none text-brand-charcoal/80 space-y-6">
          <p>
            Welcome to mdfkclothing.com. This website is legally owned and operated by MADE DIFFERENT FK.
            By accessing or using our website, you agree to be bound by these Terms of Service.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Intellectual Property</h2>
          <p>
            All content included on this site, such as text, graphics, logos, button icons, images, and software, is the property of MADE DIFFERENT FK or its content suppliers and protected by international copyright laws.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Governing Law</h2>
          <p>
            These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the jurisdiction in which MADE DIFFERENT FK operates.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Changes to Terms of Service</h2>
          <p>
            You can review the most current version of the Terms of Service at any time at this page.
            We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
