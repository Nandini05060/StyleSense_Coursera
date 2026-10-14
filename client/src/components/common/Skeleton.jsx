import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-taupe-light/60 rounded-none ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-taupe-light/60 p-4 space-y-4">
      <Skeleton className="w-full aspect-[3/4]" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="pt-2 flex gap-2">
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
