interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-shimmer rounded h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
  }[size];

  return (
    <div
      className={`skeleton-shimmer rounded-full shrink-0 ${sizeClass}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonTestimonialCard({ offset = false }: { offset?: boolean }) {
  return (
    <div className={`bg-surface-container-lowest p-5 rounded-lg shadow-sm ${offset ? 'mt-0 md:mt-5' : ''}`} aria-hidden="true">
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer w-4 h-4 rounded-sm" />
        ))}
      </div>
      <SkeletonText lines={3} className="mb-5" />
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonHeroCard() {
  return (
    <div
      className="absolute w-72 h-96 bg-white rounded-2xl z-20 flex flex-col p-6"
      style={{ transform: 'rotate(-2deg) translateY(16px)', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      aria-hidden="true"
    >
      <div className="flex-grow skeleton-shimmer rounded-md mb-3" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
}
