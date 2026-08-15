import { useEffect, useState } from 'react';
import { TrustpilotWidget } from './TrustpilotWidget';
import { AmazonReviews } from './AmazonReviews';
import { CustomerReviews } from './CustomerReviews';
import { InstagramShowcase } from './InstagramShowcase';
import { fetchFeaturedProduct, type Product } from '../../lib/commerce';

export function SocialProof() {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;
    fetchFeaturedProduct().then((p) => {
      if (active) setProduct(p);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <TrustpilotWidget />
      {product && <AmazonReviews productName={product.name} productImage={product.image_url} />}
      <CustomerReviews productSlug={product?.slug} />
      <InstagramShowcase />
    </>
  );
}
