'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { BrandMark } from '../../components/BrandMark';

export default function JoinClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code') || searchParams.get('joinCode');
    if (code) setJoinCode(code.toLowerCase());
  }, [searchParams]);

  const handleJoin = async () => {
    if (!joinCode || !playerName) {
      setError('Please enter both join code and your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions?joinCode=${joinCode.toLowerCase()}`);

      if (!response.ok) {
        setError('Session not found. Please check your code.');
        setLoading(false);
        return;
      }

      const { session } = await response.json();

      // Generate player ID and navigate to play page
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      router.push(
        `/play/${session.id}?playerId=${playerId}&playerName=${encodeURIComponent(playerName)}`,
      );
    } catch (error) {
      console.error('Error joining session:', error);
      setError('Error joining session. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full yell-card rounded-3xl p-7 sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <BrandMark size="sm" />
          <Link href="/" className="yell-transition text-sm text-muted hover:text-fg">
            ← Home
          </Link>
        </div>

        <h1 className="yell-brand text-3xl font-black tracking-tight mt-8">Join</h1>
        <p className="text-subtle mt-2">Enter the game pin, then your name.</p>

        {error && <div className="mt-5 text-sm font-semibold text-red-600">{error}</div>}

        <div className="space-y-4 mt-7">
          <div>
            <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
              Game Pin
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toLowerCase())}
              onKeyPress={handleKeyPress}
              placeholder="e.g., happy-tiger"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4 text-center text-2xl font-bold lowercase placeholder:text-subtle"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name"
              className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4 placeholder:text-subtle"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="yell-focus-ring yell-transition w-full px-6 py-4 text-white rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? 'Joining...' : 'Join Quiz'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-sm text-subtle mb-2">Prefer a scan?</p>
          <p className="text-center text-sm font-semibold text-muted">
            Use the mobile app QR join.
          </p>
        </div>
      </div>
    </div>
  );
}
