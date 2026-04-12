import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white border-transparent',
  secondary:
    'bg-transparent hover:bg-slate-800 active:bg-slate-700 text-slate-200 border-slate-700',
  ghost:
    'bg-transparent hover:bg-slate-800/50 active:bg-slate-700/50 text-slate-300 border-transparent',
  danger:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
};

/**
 * Primary interactive control for all Moore Tires surfaces.
 * Accepts all native button attributes. Server state should be reflected
 * through the `isLoading` prop rather than disabling.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-md border font-semibold',
          'tracking-wide transition-colors duration-150 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
