import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green/20 selection:text-brand-charcoal">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 sm:px-8 py-24 md:py-32">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-charcoal tracking-tight mb-8">Return Policy</h1>
        
        <div className="prose prose-sm md:prose-base prose-stone max-w-none text-brand-charcoal/80 space-y-6">
          <p>
            We want you to be completely satisfied with your purchase from mdfkclothing.com, which is legally owned and operated by MADE DIFFERENT FK.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Returns</h2>
          <p>
            Our policy lasts 7 days. If 7 days have gone by since your purchase, unfortunately we can’t offer you a refund or exchange.
          </p>
          <p>
            To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Refunds (if applicable)</h2>
          <p>
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
          </p>
          
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-8 mb-4">Shipping</h2>
          <p>
            To return your product, you should mail your product to the address provided by our support team.
            You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
