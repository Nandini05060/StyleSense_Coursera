import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon: Icon
}) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-[11px] px-2.5 py-1 tracking-wider',
    lg: 'text-xs px-3 py-1.5 tracking-widest',
  };

  const variantClasses = {
    neutral: 'bg-ivory-200 text-charcoal border border-taupe-border/50',
    charcoal: 'bg-charcoal text-white',
    burgundy: 'bg-burgundy text-white font-medium',
    score: 'bg-burgundy-50 text-burgundy-700 border border-burgundy-300 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    outline: 'bg-transparent text-charcoal border border-charcoal/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans uppercase font-medium rounded-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
