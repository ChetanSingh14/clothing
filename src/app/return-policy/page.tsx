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
            We want you to have the perfect fit. mdfkclothing.com, which is legally owned and operated by MADE DIFFERENT FK, provides an exchange-only policy.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">No Return or Refund Policy</h2>
          <p>
            We do **not** offer returns, refunds only exchange . All sales are final.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Size Exchanges</h2>
          <p>
            We support size exchanges within **5 days** of order delivery. If 5 days have gone by since the delivery of your package, unfortunately we cannot offer you an exchange.
          </p>
          <p>
            To be eligible for an exchange, the garment must be unused, unwashed, and in the same pristine condition that you received it. It must also be in its original packaging.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Logistics & Shipping</h2>
          <p>
            To initiate an exchange, go to your Orders history page, select the order, and choose **Exchange Order**. 
            You will be asked whether the package should be picked up from your original delivery address or a different address.
            Our automated courier system will schedule a pickup, and once inspected, we will dispatch the requested size replacement to you.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
