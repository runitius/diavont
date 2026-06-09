import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Collections from '@/components/Collections';
import FeaturedPiece from '@/components/FeaturedPiece';
import Craftsmanship from '@/components/Craftsmanship';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Navigation />
      <main>
        <Hero />
        <Marquee />
        <Collections />
        <FeaturedPiece />
        <Craftsmanship />
      </main>
      <Footer />
    </>
  );
}
