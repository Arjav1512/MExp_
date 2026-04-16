import { ShoppingBag, Leaf, Zap } from 'lucide-react';

interface ConversionCloserProps {
  onShopCTA: () => void;
}

const pillars = [
  { icon: Leaf, text: 'No preservatives. Ever.' },
  { icon: Zap, text: 'Fresh batches made weekly.' },
  { icon: ShoppingBag, text: 'Delivered sealed, straight from Bihar.' },
];

export function ConversionCloser({ onShopCTA }: ConversionCloserProps) {
  return (
    <section className="py-20 md:py-24 px-6 md:px-8">
      <div className="max-w-[800px] mx-auto text-center space-y-8">
        <div className="space-y-4">
          <span className="section-label">The decision is easy</span>
          <h2
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em' }}
            className="font-headline font-black text-primary leading-[1.0]"
          >
            Ready to snack better?
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-md mx-auto">
            Clean, crunchy, and made fresh for you. No compromise on ingredients.
            No regret after eating.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-center">
          {pillars.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container border border-surface-container-high">
              <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-on-surface">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <button
            onClick={onShopCTA}
            className="inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary font-black text-base px-12 py-4 rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
            style={{ boxShadow: '0 6px 28px rgba(21,66,18,0.38), 0 1px 4px rgba(21,66,18,0.2)' }}
          >
            <ShoppingBag className="w-5 h-5" />
            Order Your Pack
          </button>
          <p className="text-[11px] text-on-surface-variant/60 font-medium">
            Fresh batches made weekly · Sealed at source · 100% natural
          </p>
        </div>
      </div>
    </section>
  );
}
