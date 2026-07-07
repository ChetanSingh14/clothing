import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green selection:text-brand-bg">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-24 max-w-xl mx-auto space-y-8">
        <div className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 rounded-full px-4.5 py-1.5 inline-block">
            Error 404
          </span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-brand-charcoal leading-none">
            Lost in <br className="sm:hidden" />
            <span className="text-brand-green">Transit.</span>
          </h1>
          <p className="text-sm sm:text-base text-brand-charcoal/70 tracking-wide font-light leading-relaxed max-w-md mx-auto pt-2">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable. Let's get you back to the collection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-brand-charcoal text-brand-bg text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-full hover:bg-brand-charcoal/90 hover:scale-102 transition-all shadow-md group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
