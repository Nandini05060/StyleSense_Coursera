import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'Try adjusting your filters or search keywords to discover more pieces.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 bg-white border border-dashed border-taupe-border/80 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 bg-ivory flex items-center justify-center text-burgundy mb-4 border border-taupe-light">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="editorial-heading text-xl text-charcoal mb-2 font-serif font-medium">
        {title}
      </h3>
      <p className="font-sans text-sm text-taupe max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
