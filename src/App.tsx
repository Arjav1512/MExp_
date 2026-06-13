import { useState, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { useRouter } from './lib/router';

const ProductShowcase = lazy(() => import('./components/ProductShowcase').then(m => ({ default: m.ProductShowcase })));
const FlavorSpectrum = lazy(() => import('./components/FlavorSpectrum').then(m => ({ default: m.FlavorSpectrum })));
const Craftsmanship = lazy(() => import('./components/Craftsmanship').then(m => ({ default: m.Craftsmanship })));
const Testimonials = lazy(() => import('./components/Testimonials').then(m => ({ default: m.Testimonials })));
const Newsletter = lazy(() => import('./components/Newsletter').then(m => ({ default: m.Newsletter })));
const ConversionCloser = lazy(() => import('./components/ConversionCloser').then(m => ({ default: m.ConversionCloser })));
const OurMission = lazy(() => import('./components/OurMission').then(m => ({ default: m.OurMission })));
const ComingSoonModal = lazy(() => import('./components/ComingSoonModal').then(m => ({ default: m.ComingSoonModal })));

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
    }, 250);
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <Header page={page} navigate={navigate} onShopCTA={handleShopCTA} />
      <main>
        <Suspense fallback={null}>
          {page === 'mission' ? (
            <OurMission navigate={navigate} onShopCTA={handleShopCTA} />
          ) : (
            <>
              <Hero navigate={navigate} onShopCTA={handleShopCTA} />
              <ProductShowcase onShopCTA={handleShopCTA} />
              <FlavorSpectrum onShopCTA={handleShopCTA} />
              <Craftsmanship />
              <Testimonials />
              <ConversionCloser onShopCTA={handleShopCTA} />
              <Newsletter />
            </>
          )}
        </Suspense>
      </main>
      <Footer navigate={navigate} />
      {showComingSoon && (
        <Suspense fallback={null}>
          <ComingSoonModal
            onClose={() => setShowComingSoon(false)}
            onSubscribe={handleSubscribeFromModal}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
