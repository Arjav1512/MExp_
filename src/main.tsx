import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { CartProvider } from './lib/cart.tsx';
import { initMonitoring } from './lib/monitoring.ts';
import './index.css';

initMonitoring();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CartProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </CartProvider>
    </ErrorBoundary>
  </StrictMode>
);
