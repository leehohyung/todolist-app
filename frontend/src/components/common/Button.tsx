import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'success' | 'danger' | 'ghost' | 'outline' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98]',
  success: 'bg-success text-white hover:bg-green-700 active:scale-[0.98]',
  danger:  'bg-danger text-white hover:bg-red-700 active:scale-[0.98]',
  ghost:   'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
  outline: 'border border-border-strong text-text-primary hover:bg-bg-tertiary',
  subtle:  'bg-bg-tertiary text-text-primary hover:bg-bg-secondary border border-transparent hover:border-border',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs min-h-[32px]',
  md: 'px-4 py-2 text-sm min-h-[36px]',
  lg: 'px-5 py-2.5 text-sm min-h-[42px]',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-all duration-150 select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || isLoading ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {isLoading ? '처리 중...' : children}
    </button>
  );
};

export default Button;
