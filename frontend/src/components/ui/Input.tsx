import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, className = '', id, 'aria-describedby': describedBy, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
          } ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            [describedBy, error || helperText ? `${inputId}-message` : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...props}
        />
        {error ? (
          <p id={`${inputId}-message`} role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-message`} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
