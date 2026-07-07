import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green/20 selection:text-brand-charcoal">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 sm:px-8 py-24 md:py-32">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-charcoal tracking-tight mb-8">Exchange Policy</h1>
        
        <div className="prose prose-sm md:prose-base prose-stone max-w-none text-brand-charcoal/80 space-y-6">
          <p>
            We want to ensure your garments fit you perfectly. MDFK Clothing (mdfkclothing.com, legally owned and operated by MADE DIFFERENT FK) offers an easy size exchange policy. Please note that <strong>we do not offer returns, refunds, or cancellations</strong> once an order is placed.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">5-Day Size Exchanges</h2>
          <p>
            Our exchange window lasts <strong>5 days</strong> from the date of delivery. If 5 days have gone by since your package was delivered, unfortunately we cannot offer you a size exchange.
          </p>
          <p>
            To be eligible for an exchange, your item must be unused, unwashed, and in the same condition that you received it. It must also be in its original packaging.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">No Refunds</h2>
          <p>
            We do not issue refunds under any circumstances. If you have ordered an incorrect size, we will happily replace it with the correct size subject to availability.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Process</h2>
          <p>
            To request a size exchange, navigate to your <strong>Orders</strong> page in your account dashboard within 5 days of delivery, select the order, specify the required size changes, and submit the request. Our team will arrange a reverse pickup or contact you for further details.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
