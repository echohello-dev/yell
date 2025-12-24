import * as React from 'react';

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tagline?: string;
};

const sizes = {
  sm: {
    word: 'text-2xl',
    wave: 18,
    gap: 'gap-2',
  },
  md: {
    word: 'text-4xl',
    wave: 22,
    gap: 'gap-3',
  },
  lg: {
    word: 'text-6xl',
    wave: 26,
    gap: 'gap-4',
  },
} as const;

export function BrandMark({ size = 'md', className, tagline }: BrandMarkProps) {
  const s = sizes[size];

  return (
    <div className={['inline-flex items-center', s.gap, className].filter(Boolean).join(' ')}>
      <div className="relative">
        <span
          className={[
            'yell-brand font-black tracking-tight text-fg',
            s.word,
            'leading-none',
            'select-none',
          ].join(' ')}
          aria-label="YELL"
        >
          YELL
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-2 left-0 right-0 h-[2px] rounded-full"
          style={{ backgroundColor: 'var(--accent)', opacity: 0.55 }}
        />
      </div>

      {/* Subtle sound-wave motif */}
      <svg
        width={s.wave}
        height={s.wave}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="opacity-80"
      >
        <path
          d="M4 12c2.4 0 2.4-6 4.8-6s2.4 12 4.8 12S16 8 18.4 8 20.6 12 22 12"
          stroke="var(--accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {tagline ? (
        <div className="hidden sm:block">
          <div className="text-sm text-muted tracking-wide">{tagline}</div>
        </div>
      ) : null}
    </div>
  );
}
