import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-sans font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2';

  const sizeClasses = {
    sm: 'text-[11px] px-3.5 py-2 gap-1.5',
    md: 'text-xs px-5 py-2.5 gap-2',
    lg: 'text-xs px-7 py-3.5 gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-charcoal text-white hover:bg-burgundy shadow-sm',
    burgundy: 'bg-burgundy text-white hover:bg-burgundy-700 shadow-sm',
    secondary: 'bg-transparent border border-charcoal text-charcoal hover:bg-charcoal hover:text-white',
    outline: 'bg-transparent border border-taupe-border text-charcoal hover:border-charcoal hover:bg-white',
    ghost: 'bg-transparent text-charcoal hover:bg-taupe-light/50',
    danger: 'bg-red-700 text-white hover:bg-red-800',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
