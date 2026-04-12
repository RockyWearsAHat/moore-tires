import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * Accessible form input with label, error, and hint support.
 * The `label` prop is required — never render an unlabeled input.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="ml-1 text-orange-400" aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-md border bg-slate-900 px-3 py-2 text-sm text-slate-100',
            'placeholder:text-slate-600 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
            'focus:ring-offset-slate-950',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-700 hover:border-slate-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined
          }
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
