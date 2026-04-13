import { Instagram } from 'lucide-react';
import type { Page } from '../lib/router';

interface FooterProps {
  navigate: (page: Page) => void;
}

export function Footer({ navigate }: FooterProps) {
  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="w-full rounded-t-[3rem] mt-16 bg-stone-100">
      <div className="flex flex-col md:flex-row justify-between items-start px-12 py-14 max-w-[1200px] mx-auto gap-10">
        <div className="space-y-4 max-w-xs">
          <button
            className="text-lg font-bold text-green-900 hover:opacity-80 transition-opacity"
            onClick={() => navigate('home')}
          >
            Makhana Express
          </button>
          <p className="font-body leading-relaxed text-stone-500 text-sm">
            Sourced directly from the traditional water bodies of Bihar, our makhana is carefully
            harvested and packed fresh to retain its natural quality and nutritional value.
          </p>
          <div className="flex gap-3">
            <a
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors"
              href="https://www.instagram.com/makhanaexpress?igsh=MWRjbHR5Z3doM3BqMg=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <h4 className="font-bold text-green-900 text-sm">Explore</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  className="text-stone-500 hover:text-green-700 transition-colors text-sm"
                  onClick={() => navigate('mission')}
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  className="text-stone-500 hover:text-green-700 transition-colors text-sm"
                  onClick={() => handleScroll('heritage')}
                >
                  Farm-to-Bag
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-green-900 text-sm">Community</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  className="text-stone-500 hover:text-green-700 transition-colors text-sm"
                  onClick={() => handleScroll('community')}
                >
                  Join the Community
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0">
          <p className="font-body leading-relaxed text-stone-500 text-sm">
            © 2026 Makhana Express. From the <span aria-hidden="true">❤️</span> of Bihar.
          </p>
        </div>
      </div>
    </footer>
  );
}
