import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Hero />
        <BentoGrid />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
