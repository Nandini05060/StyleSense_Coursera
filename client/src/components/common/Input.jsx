import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = 'text',
    className = '',
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-sans font-semibold uppercase tracking-wider text-charcoal/80"
        >
          {label} {required && <span className="text-burgundy">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`w-full bg-white border px-4 py-2.5 text-sm text-charcoal placeholder-taupe-muted transition-colors duration-200 focus:outline-none ${
          error
            ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
            : 'border-taupe-border focus:border-burgundy focus:ring-1 focus:ring-burgundy'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 font-sans mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-taupe-muted font-sans mt-1">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
