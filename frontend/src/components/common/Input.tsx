import { type InputHTMLAttributes, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

const Input = ({ label, error, required, hint, id: idProp, className = '', ...props }: InputProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
          {required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`
          w-full rounded-md px-3 py-2.5 text-sm text-text-primary bg-white
          border transition-all duration-150
          placeholder:text-text-placeholder
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error
            ? 'border-danger/60 focus:ring-danger/30 focus:border-danger'
            : 'border-border focus:ring-accent/20 focus:border-accent'
          }
          ${className}
        `}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-text-muted">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger flex items-center gap-1">
          <svg className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
