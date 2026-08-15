import { lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { useRouter } from './lib/router';

const ProductShowcase = lazy(() => import('./components/ProductShowcase').then(m => ({ default: m.ProductShowcase })));
const FlavorSpectrum = lazy(() => import('./components/FlavorSpectrum').then(m => ({ default: m.FlavorSpectrum })));
const Craftsmanship = lazy(() => import('./components/Craftsmanship').then(m => ({ default: m.Craftsmanship })));
const Testimonials = lazy(() => import('./components/Testimonials').then(m => ({ default: m.Testimonials })));
const Newsletter = lazy(() => import('./components/Newsletter').then(m => ({ default: m.Newsletter })));
const ConversionCloser = lazy(() => import('./components/ConversionCloser').then(m => ({ default: m.ConversionCloser })));
const OurMission = lazy(() => import('./components/OurMission').then(m => ({ default: m.OurMission })));
const ProductPage = lazy(() => import('./components/ProductPage').then(m => ({ default: m.ProductPage })));
const CheckoutWizard = lazy(() => import('./components/CheckoutWizard').then(m => ({ default: m.CheckoutWizard })));

function App() {
  const [page, navigate] = useRouter();

  const handleShopCTA = () => navigate('product');

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <Header page={page} navigate={navigate} onShopCTA={handleShopCTA} />
      <main>
        <Suspense fallback={<div className="min-h-screen" />}>
          {page === 'mission' ? (
            <OurMission navigate={navigate} onShopCTA={handleShopCTA} />
          ) : page === 'product' ? (
            <ProductPage navigate={navigate} />
          ) : page === 'checkout' ? (
            <CheckoutWizard navigate={navigate} />
          ) : (
            <>
              <Hero navigate={navigate} onShopCTA={handleShopCTA} />
              <Suspense fallback={<div style={{ minHeight: '2400px' }} />}>
                <ProductShowcase onShopCTA={handleShopCTA} />
                <FlavorSpectrum onShopCTA={handleShopCTA} />
                <Craftsmanship />
                <Testimonials />
                <ConversionCloser onShopCTA={handleShopCTA} />
                <Newsletter />
              </Suspense>
            </>
          )}
        </Suspense>
      </main>
      <Footer navigate={navigate} />
      <CartDrawer navigate={navigate} />
    </div>
  );
}

export default App;
