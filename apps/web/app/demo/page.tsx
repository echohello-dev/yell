'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

import { BrandMark } from '../../components/BrandMark';

const DEMO_QUESTIONS = [
  {
    id: 'demo-q1',
    type: 'multiple_choice',
    title: 'What is the capital of France?',
    timeLimit: 20,
    points: 1000,
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 1,
  },
  {
    id: 'demo-q2',
    type: 'multiple_choice',
    title: 'Which planet is known as the Red Planet?',
    timeLimit: 20,
    points: 1000,
    options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
    correctAnswer: 2,
  },
  {
    id: 'demo-q3',
    type: 'multiple_choice',
    title: 'What year did the first iPhone release?',
    timeLimit: 15,
    points: 1000,
    options: ['2005', '2006', '2007', '2008'],
    correctAnswer: 2,
  },
  {
    id: 'demo-q4',
    type: 'poll',
    title: 'What is your favorite programming language?',
    timeLimit: 15,
    points: 0,
    options: ['JavaScript', 'Python', 'TypeScript', 'Go'],
  },
  {
    id: 'demo-q5',
    type: 'multiple_choice',
    title: 'How many continents are there on Earth?',
    timeLimit: 15,
    points: 1000,
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
  },
];

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    sessionId: string;
    joinCode: string;
  } | null>(null);

  const startDemo = async () => {
    setLoading(true);

    try {
      const quizRes = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Demo Quiz',
          description: 'A demo quiz to try out YELL',
          questions: DEMO_QUESTIONS,
        }),
      });

      const { quiz } = await quizRes.json();

      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          prizeMode: 'top_score',
        }),
      });

      const { session } = await sessionRes.json();
      setSessionInfo({ sessionId: session.id, joinCode: session.joinCode });
    } catch (error) {
      console.error('Error creating demo:', error);
      setLoading(false);
    }
  };

  const openHostView = () => {
    if (sessionInfo) {
      window.open(`/session/${sessionInfo.sessionId}`, '_blank');
    }
  };

  const openPlayerView = () => {
    if (sessionInfo) {
      const playerId = `demo-player-${Date.now()}`;
      const playerName = `Player${Math.floor(Math.random() * 1000)}`;
      window.open(
        `/play/${sessionInfo.sessionId}?playerId=${playerId}&playerName=${encodeURIComponent(playerName)}`,
        '_blank',
      );
    }
  };

  const addBotPlayers = useCallback(
    async (count: number) => {
      if (!sessionInfo) return;

      const baseTime = performance.now();
      for (let i = 0; i < count; i++) {
        const playerId = `bot-${Math.floor(baseTime)}-${i}`;
        const playerName = `Bot${i + 1}`;

        await fetch('/api/demo/add-player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionInfo.sessionId,
            playerId,
            playerName,
          }),
        });
      }
    },
    [sessionInfo],
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <header className="flex items-center justify-between gap-6 mb-12">
          <BrandMark size="md" tagline="Demo Mode" />
          <Link href="/" className="yell-transition text-sm text-muted hover:text-fg">
            ← Home
          </Link>
        </header>

        <main>
          <h1 className="yell-brand text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]">
            Try YELL Demo
          </h1>
          <p className="mt-3 text-lg text-subtle leading-relaxed">
            Test the full quiz experience locally. Create a demo session, then open host and player
            views in separate windows.
          </p>

          {!sessionInfo ? (
            <div className="mt-10">
              <button
                onClick={startDemo}
                disabled={loading}
                className="yell-focus-ring yell-transition rounded-2xl px-8 py-4 text-lg font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {loading ? 'Creating Demo...' : 'Start Demo Session'}
              </button>

              <div className="mt-8 yell-card rounded-3xl p-6">
                <h2 className="font-semibold text-lg mb-4">Demo includes:</h2>
                <ul className="space-y-2 text-subtle">
                  <li>• 5 sample questions (multiple choice + poll)</li>
                  <li>• 15-20 second time limits per question</li>
                  <li>• Score calculation with time bonuses</li>
                  <li>• Live leaderboard updates</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              <div className="yell-card rounded-3xl p-6">
                <div className="text-sm font-semibold tracking-wide text-muted mb-2">
                  Demo Session Created
                </div>
                <div className="text-4xl font-bold text-fg lowercase">{sessionInfo.joinCode}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={openHostView}
                  className="yell-focus-ring yell-transition yell-card rounded-2xl p-6 text-left hover:bg-surface-2"
                >
                  <div className="text-2xl mb-2">🎮</div>
                  <div className="font-semibold text-lg">Open Host View</div>
                  <div className="text-sm text-subtle mt-1">
                    Control the game, show questions, see results
                  </div>
                </button>

                <button
                  onClick={openPlayerView}
                  className="yell-focus-ring yell-transition yell-card rounded-2xl p-6 text-left hover:bg-surface-2"
                >
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-semibold text-lg">Open Player View</div>
                  <div className="text-sm text-subtle mt-1">
                    Join as a player and answer questions
                  </div>
                </button>
              </div>

              <div className="yell-card rounded-3xl p-6">
                <div className="font-semibold mb-4">Add Bot Players</div>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map((count) => (
                    <button
                      key={count}
                      onClick={() => addBotPlayers(count)}
                      className="yell-focus-ring yell-transition rounded-xl px-4 py-2 text-sm font-semibold border border-border bg-surface hover:bg-surface-2"
                    >
                      +{count} Bot{count > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-subtle mt-3">
                  Bots will join but won&apos;t answer automatically. They&apos;re useful for
                  testing the lobby display.
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold mb-3">How to test:</h3>
                <ol className="space-y-2 text-subtle list-decimal list-inside">
                  <li>Click &quot;Open Host View&quot; - this opens the host control panel</li>
                  <li>Click &quot;Open Player View&quot; one or more times for player windows</li>
                  <li>
                    In the host view, click &quot;Start Session&quot; when players have joined
                  </li>
                  <li>Click &quot;Start First Question&quot; to begin</li>
                  <li>Answer in the player windows and watch scores update!</li>
                </ol>
              </div>

              <button
                onClick={() => setSessionInfo(null)}
                className="text-sm text-muted hover:text-fg yell-transition"
              >
                ← Create new demo session
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
