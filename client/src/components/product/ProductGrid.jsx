import React from 'react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { Sparkles } from 'lucide-react';

export default function ProductGrid({
  products = [],
  loading = false,
  showScore = false,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search query, price range, or category filter.',
  onResetFilters,
  className = '',
}) {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 ${className}`}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          showScore={showScore}
          score={product.recommendationScore}
          matchExplanation={product.matchExplanation}
        />
      ))}
    </div>
  );
}
