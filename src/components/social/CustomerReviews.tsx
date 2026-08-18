import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, BadgeCheck, PenLine, MessageSquareText } from 'lucide-react';
import { fetchApprovedReviews, computeStats, type CustomerReview, type ReviewStats } from '../../lib/reviews';
import { StarRating } from './StarRating';
import { SectionHeading } from './SectionHeading';
import { ReviewForm } from './ReviewForm';
import { fadeUp, staggerContainerFast, viewportOptions } from '../../lib/motion';

interface CustomerReviewsProps {
  productSlug?: string;
}

export function CustomerReviews({ productSlug }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<CustomerReview[] | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const load = () => {
    fetchApprovedReviews().then((data) => {
      setReviews(data);
      setStats(computeStats(data));
    });
  };

  useEffect(() => { load(); }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(360, el.clientWidth * 0.85), behavior: 'smooth' });
  };

  const hasReviews = reviews && reviews.length > 0;

  return (
    <section id="reviews" className="py-16 md:py-20 px-6 md:px-8 bg-surface-dim">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeading
          label="Customer Feedback"
          title="Straight from our snackers"
          description="Genuine reviews from people who ordered directly from us. Every review is checked before it appears."
        />

        {stats && stats.count > 0 && (
          <motion.div
            className="card-base p-6 md:p-8 mb-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
          >
            <div className="text-center md:border-r md:border-surface-container-high">
              <div className="font-headline font-black text-5xl text-primary leading-none mb-2">
                {stats.average.toFixed(1)}
              </div>
              <StarRating value={stats.average} size={18} className="justify-center mb-2" />
              <p className="text-sm text-on-surface-variant">
                {stats.count} verified {stats.count === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {stats.count >= 5 ? (
              <div className="space-y-2">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const n = stats.distribution[star];
                  const pct = stats.count ? Math.round((n / stats.count) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-8 text-on-surface-variant tabular-nums">{star}★</span>
                      <div className="flex-1 h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                        <motion.div
                          className="h-full bg-[#e8a000] rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="w-10 text-right text-on-surface-variant tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-start justify-center gap-3">
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  We're just getting started collecting reviews. Ordered from us? Your feedback helps other snackers.
                </p>
                <button className="btn-primary" onClick={() => setFormOpen(true)}>
                  <PenLine className="w-4 h-4" /> Write a review
                </button>
              </div>
            )}
          </motion.div>
        )}

        {reviews === null ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-base p-6 h-52 skeleton-shimmer" aria-hidden="true" />
            ))}
          </div>
        ) : hasReviews ? (
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <button className="btn-primary" onClick={() => setFormOpen(true)}>
                <PenLine className="w-4 h-4" /> Write a review
              </button>
              {reviews.length > 3 && (
                <div className="hidden md:flex items-center gap-2">
                  <CarouselButton dir="left" onClick={() => scrollBy(-1)} />
                  <CarouselButton dir="right" onClick={() => scrollBy(1)} />
                </div>
              )}
            </div>

            <motion.div
              ref={scroller}
              role="region"
              aria-label="Customer reviews, scrollable"
              tabIndex={0}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1 scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              style={{ scrollbarWidth: 'none' }}
              variants={staggerContainerFast}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOptions}
            >
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </motion.div>
          </div>
        ) : (
          <EmptyState onWrite={() => setFormOpen(true)} />
        )}
      </div>

      <ReviewForm open={formOpen} onClose={() => setFormOpen(false)} productSlug={productSlug} onSubmitted={load} />
    </section>
  );
}

function ReviewCard({ review }: { review: CustomerReview }) {
  const date = new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  return (
    <motion.article
      className="card-base p-6 flex flex-col snap-start shrink-0 w-[300px] sm:w-[340px]"
      variants={fadeUp}
      whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-3">
        <StarRating value={review.rating} size={16} />
        {review.is_verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary-fixed/50 rounded-full px-2.5 py-1">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </span>
        )}
      </div>
      {review.title && <h4 className="font-bold text-on-surface mb-1.5 leading-snug">{review.title}</h4>}
      <p className="text-[15px] text-on-surface-variant leading-relaxed flex-1 mb-5 whitespace-pre-line">{review.body}</p>
      <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
        <span className="font-bold text-sm text-on-surface">{review.customer_name}</span>
        <span className="text-xs text-on-surface-variant">{date}</span>
      </div>
    </motion.article>
  );
}

function CarouselButton({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  const Icon = dir === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'left' ? 'Previous reviews' : 'Next reviews'}
      className="w-10 h-10 rounded-full border-2 border-outline/25 flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-colors"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function EmptyState({ onWrite }: { onWrite: () => void }) {
  return (
    <motion.div
      className="card-base p-10 text-center max-w-lg mx-auto"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
    >
      <div className="w-14 h-14 rounded-full bg-primary-fixed/50 flex items-center justify-center mx-auto mb-4">
        <MessageSquareText className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-headline font-black text-xl text-primary mb-2">Be the first to review</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
        No reviews just yet. If you've tried our makhana, share your experience and help others snack with confidence.
      </p>
      <button className="btn-primary" onClick={onWrite}>
        <PenLine className="w-4 h-4" /> Write a review
      </button>
    </motion.div>
  );
}
