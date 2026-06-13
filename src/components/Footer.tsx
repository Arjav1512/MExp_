import { Instagram, Mail, Facebook, Youtube } from 'lucide-react';
import type { Page } from '../lib/router';

interface FooterProps {
  navigate: (page: Page) => void;
}

export function Footer({ navigate }: FooterProps) {
  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-surface-container-low border-t border-surface-container-high mt-8">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <button
              className="font-headline font-black text-xl text-primary tracking-tighter hover:opacity-70 transition-opacity"
              onClick={() => { navigate('home'); window.scrollTo({ top: 0 }); }}
            >
              Makhana Express
            </button>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
              Sourced directly from the traditional water bodies of Bihar, our makhana is carefully harvested and packed fresh to retain its natural quality and nutritional value.
            </p>
            <div className="flex gap-2.5 pt-1">
              <a
                className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-200"
                href="https://www.instagram.com/makhanaexpress?igsh=MWRjbHR5Z3doM3BqMg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-200"
                href="https://www.facebook.com/makhanaexpress"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-200"
                href="https://www.youtube.com/@makhanaexpress"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-200"
                href="mailto:info@makhana-express.com"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-[13px] text-on-surface uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Our Story', action: () => { navigate('mission'); window.scrollTo({ top: 0 }); } },
                { label: 'Farm-to-Bag', action: () => handleScroll('heritage') },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    className="text-on-surface-variant hover:text-primary transition-colors text-sm"
                    onClick={item.action}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-[13px] text-on-surface uppercase tracking-wider">Community</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors text-sm"
                  onClick={() => handleScroll('community')}
                >
                  Join the Community
                </button>
              </li>
              <li>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors text-sm"
                  onClick={() => handleScroll('newsletter')}
                >
                  Subscribe for 20% Off
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-surface-container-high flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-on-surface-variant text-[13px]">
            © 2026 Makhana Express. From the ❤️ of Bihar.
          </p>
          <p className="text-on-surface-variant text-[13px]">
            <a href="mailto:info@makhana-express.com" className="hover:text-primary transition-colors">
              info@makhana-express.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
