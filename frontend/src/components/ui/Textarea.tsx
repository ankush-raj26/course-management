import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({ label, error, id, className = '', ...rest }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none ${className}`}
        {...rest}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
