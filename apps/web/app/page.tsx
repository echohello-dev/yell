import Link from 'next/link';

import { BrandMark } from '../components/BrandMark';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <header className="flex items-center justify-between gap-6">
          <BrandMark size="md" tagline="Live quizzes, sharp energy" />
          <nav className="hidden sm:flex items-center gap-2 text-sm text-muted">
            <Link
              href="/host"
              className="yell-transition rounded-full px-4 py-2 hover:bg-surface-2"
            >
              Host
            </Link>
            <Link
              href="/join"
              className="yell-transition rounded-full px-4 py-2 hover:bg-surface-2"
            >
              Join
            </Link>
          </nav>
        </header>

        <main className="mt-14 sm:mt-18">
          <div className="max-w-3xl">
            <h1 className="yell-brand text-4xl sm:text-6xl font-black tracking-tight leading-[1.02]">
              Turn the room up.
              <span className="block text-muted mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
                Confident, real-time quizzes for classes, teams, and events.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-subtle leading-relaxed">
              Create a session, share a code or QR, and watch responses land instantly. Clean UI,
              strong hierarchy, and motion that stays out of the way.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/host"
                className="yell-focus-ring yell-transition inline-flex items-center justify-center rounded-full px-7 py-4 text-base font-semibold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Host a Quiz
              </Link>
              <Link
                href="/join"
                className="yell-focus-ring yell-transition inline-flex items-center justify-center rounded-full px-7 py-4 text-base font-semibold border border-border bg-surface hover:bg-surface-2"
              >
                Join a Quiz
              </Link>
              <div className="text-sm text-muted px-2 sm:px-0">
                Tip: mobile supports QR scanning.
              </div>
            </div>
          </div>

          <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[{
              title: 'Cross‑platform',
              body: 'Web + iOS + Android clients, same session.'
            }, {
              title: 'Real‑time',
              body: 'Instant questions, reactions, and leaderboards.'
            }, {
              title: 'Prize modes',
              body: 'Top score, raffles, and spin wheels.'
            }].map((card) => (
              <div key={card.title} className="yell-card rounded-2xl p-6">
                <div className="text-sm font-semibold tracking-wide text-muted">{card.title}</div>
                <div className="mt-2 text-lg font-semibold tracking-tight">{card.body}</div>
                <div
                  className="mt-5 h-[2px] w-14 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
