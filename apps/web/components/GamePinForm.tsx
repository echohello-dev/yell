'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type GamePinFormProps = {
  className?: string;
};

function normalizePin(value: string) {
  return value.trim().replace(/\s+/g, '-').toLowerCase();
}

export function GamePinForm({ className }: GamePinFormProps) {
  const router = useRouter();
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePin(pin);

    if (!normalized) {
      setError('Enter a game pin to join.');
      return;
    }

    setError(null);
    router.push(`/join?code=${encodeURIComponent(normalized)}`);
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <label className="block text-sm font-semibold tracking-wide text-muted">Game Pin</label>
      <div className="mt-3 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g., happy-tiger"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4 text-lg font-semibold tracking-tight placeholder:text-subtle"
        />
        <button
          type="submit"
          className="yell-focus-ring yell-transition rounded-2xl px-6 py-4 text-base font-semibold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Join
        </button>
      </div>

      <div className="mt-3 text-sm text-subtle">
        Ask your host for the pin. You’ll enter your name next.
      </div>
      {error ? <div className="mt-3 text-sm font-semibold text-red-600">{error}</div> : null}
    </form>
  );
}
