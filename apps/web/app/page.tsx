import Link from 'next/link';

import { BrandMark } from '../components/BrandMark';
import { GamePinForm } from '../components/GamePinForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <header className="flex items-center justify-between gap-6">
          <BrandMark size="md" tagline="Live quiz platform" />
          <nav className="hidden sm:flex items-center gap-2 text-sm text-muted">
            <Link
              href="/demo"
              className="yell-transition rounded-full px-4 py-2 hover:bg-surface-2"
            >
              Demo
            </Link>
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
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
            <section className="yell-card rounded-3xl p-7 sm:p-10">
              <h1 className="yell-brand text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]">
                Join in.
              </h1>
              <p className="mt-3 text-lg text-subtle leading-relaxed">
                Enter the game pin to jump into the live session.
              </p>

              <div className="mt-8">
                <GamePinForm />
              </div>
            </section>

            <aside className="space-y-4">
              <div className="yell-card rounded-3xl p-6">
                <div className="text-sm font-semibold tracking-wide text-muted">
                  Create your own
                </div>
                <div className="mt-2 text-lg font-semibold tracking-tight">
                  Hosting? Build a quiz in minutes.
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href="/host"
                    className="yell-focus-ring yell-transition inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Create a quiz
                  </Link>
                  <Link
                    href="/join"
                    className="yell-focus-ring yell-transition inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-border bg-surface hover:bg-surface-2"
                  >
                    I have a pin
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
