import type { ButtonHTMLAttributes } from 'react';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'danger' | 'outline';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: Variant;
};

// pick the padding/text size based on size prop
const sizeStyle: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

// pick the colors based on variant prop
const variantStyle: Record<Variant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
};

export default function Button({
  size = 'md',
  variant = 'primary',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizeStyle[size]} ${variantStyle[variant]} ${className}`}
      {...rest}
    />
  );
}
