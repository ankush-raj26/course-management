import type { ReactNode } from 'react';

type Tone = 'gray' | 'green' | 'red' | 'blue';

const toneStyle: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
};

export default function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${toneStyle[tone]}`}>
      {children}
    </span>
  );
}
