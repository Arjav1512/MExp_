import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

// Read-only star display. Renders partial fill for fractional averages.
export function StarRating({ value, size = 16, className = '' }: StarRatingProps) {
  const rounded = Math.max(0, Math.min(5, value));
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`${rounded} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rounded - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-[#e8a000]/30" style={{ width: size, height: size }} aria-hidden="true" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="fill-[#e8a000] text-[#e8a000]" style={{ width: size, height: size }} aria-hidden="true" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
}

// Interactive rating input for the review form.
export function StarPicker({ value, onChange }: StarPickerProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-pressed={value === n}
          className="p-1 rounded-md transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none"
        >
          <Star
            className={n <= value ? 'fill-[#e8a000] text-[#e8a000]' : 'text-outline/40'}
            style={{ width: 30, height: 30 }}
          />
        </button>
      ))}
    </div>
  );
}
