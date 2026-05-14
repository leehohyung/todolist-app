import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'success' | 'danger' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-blue-600 focus-visible:ring-accent',
  success:
    'bg-success text-white hover:bg-green-600 focus-visible:ring-success',
  danger:
    'bg-danger text-white hover:bg-red-600 focus-visible:ring-danger',
  ghost:
    'border border-border text-text-secondary hover:bg-bg-secondary focus-visible:ring-accent',
  outline:
    'border border-accent text-accent hover:bg-blue-50 focus-visible:ring-accent',
};

const Button = ({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${base} ${variantClasses[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}
      {isLoading ? '처리 중...' : children}
    </button>
  );
};

export default Button;
