import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FlavorSpectrum } from './components/FlavorSpectrum';
import { ProductShowcase } from './components/ProductShowcase';
import { Craftsmanship } from './components/Craftsmanship';
import { Testimonials } from './components/Testimonials';
import { Newsletter } from './components/Newsletter';
import { ConversionCloser } from './components/ConversionCloser';
import { Footer } from './components/Footer';
import { OurMission } from './components/OurMission';
import { ComingSoonModal } from './components/ComingSoonModal';
import { useRouter } from './lib/router';

function App() {
  const [page, navigate] = useRouter();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleShopCTA = () => {
    setShowComingSoon(true);
  };

  const handleSubscribeFromModal = () => {
    setShowComingSoon(false);
    setTimeout(() => {
      document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <Header page={page} navigate={navigate} onShopCTA={handleShopCTA} />
      <main>
        {page === 'mission' ? (
          <OurMission navigate={navigate} onShopCTA={handleShopCTA} />
        ) : (
          <>
            <Hero navigate={navigate} onShopCTA={handleShopCTA} />
            <ProductShowcase onShopCTA={handleShopCTA} />
            <FlavorSpectrum />
            <Craftsmanship />
            <Testimonials />
            <ConversionCloser onShopCTA={handleShopCTA} />
            <Newsletter />
          </>
        )}
      </main>
      <Footer navigate={navigate} />
      {showComingSoon && (
        <ComingSoonModal
          onClose={() => setShowComingSoon(false)}
          onSubscribe={handleSubscribeFromModal}
        />
      )}
    </div>
  );
}

export default App;
