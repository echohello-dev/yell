'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { BrandMark } from '../../components/BrandMark';

type QuestionType = 'multiple_choice' | 'poll' | 'scale' | 'numeric_guess';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  timeLimit: number;
  points: number;
  options?: string[];
  correctAnswer?: number | string;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

export default function HostPage() {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: 'multiple_choice',
    title: '',
    timeLimit: 30,
    points: 1000,
    options: ['', ''],
  });
  const [prizeMode, setPrizeMode] = useState<'none' | 'top_score' | 'random_raffle' | 'spin_wheel'>(
    'top_score',
  );

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), ''],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = currentQuestion.options?.filter((_, i) => i !== index) || [];
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestion = () => {
    if (!currentQuestion.title) {
      alert('Please enter a question title');
      return;
    }

    const question: Question = {
      id: `q${Date.now()}`,
      type: currentQuestion.type as QuestionType,
      title: currentQuestion.title,
      timeLimit: currentQuestion.timeLimit || 30,
      points: currentQuestion.points || 1000,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      scaleMin: currentQuestion.scaleMin,
      scaleMax: currentQuestion.scaleMax,
      scaleLabels: currentQuestion.scaleLabels,
    };

    setQuestions([...questions, question]);
    setCurrentQuestion({
      type: 'multiple_choice',
      title: '',
      timeLimit: 30,
      points: 1000,
      options: ['', ''],
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const startQuiz = async () => {
    if (!quizTitle || questions.length === 0) {
      alert('Please add a title and at least one question');
      return;
    }

    try {
      // Create quiz
      const quizRes = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          questions,
        }),
      });

      const { quiz } = await quizRes.json();

      // Create session
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          prizeMode,
        }),
      });

      const { session } = await sessionRes.json();

      // Navigate to session control page
      router.push(`/session/${session.id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <header className="flex items-center justify-between gap-6">
          <BrandMark size="md" tagline="Host" />
          <Link href="/" className="yell-transition text-sm text-muted hover:text-fg">
            ← Home
          </Link>
        </header>

        <div className="mt-10 flex items-end justify-between gap-6">
          <div>
            <h1 className="yell-brand text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]">
              Create a quiz
            </h1>
            <p className="mt-2 text-subtle">
              Write questions, start a session, then share the pin.
            </p>
          </div>
          <div className="hidden sm:block text-right text-sm text-muted">
            {questions.length} question{questions.length === 1 ? '' : 's'}
          </div>
        </div>

        <main className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
          <section className="yell-card rounded-3xl p-7">
            <div className="text-sm font-semibold tracking-wide text-muted">Quiz settings</div>

            <div className="mt-6">
              <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                Quiz title
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g., Winter trivia night"
                className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4 text-lg font-semibold tracking-tight placeholder:text-subtle"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                Prize mode
              </label>
              <select
                value={prizeMode}
                onChange={(e) => setPrizeMode(e.target.value as any)}
                className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4"
              >
                <option value="none">No prizes</option>
                <option value="top_score">Top score</option>
                <option value="random_raffle">Random raffle</option>
                <option value="spin_wheel">Spin wheel</option>
              </select>
              <div className="mt-3 text-sm text-subtle">You can change prizes per session.</div>
            </div>

            <div className="mt-8">
              <button
                onClick={startQuiz}
                disabled={!quizTitle || questions.length === 0}
                className="yell-focus-ring yell-transition w-full rounded-2xl px-6 py-4 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Start session
              </button>
              <div className="mt-3 text-sm text-subtle">
                Generates a pin and opens your host control screen.
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {questions.length > 0 && (
              <div className="yell-card rounded-3xl p-7">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold tracking-tight">Questions</h2>
                  <div className="text-sm text-muted">{questions.length} total</div>
                </div>
                <div className="mt-5 space-y-3">
                  {questions.map((q, index) => (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-border bg-surface px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold tracking-wide text-muted uppercase">
                            {q.type.replace('_', ' ')}
                          </div>
                          <div className="mt-1 font-semibold tracking-tight">{q.title}</div>
                          <div className="mt-2 text-sm text-subtle">
                            {q.timeLimit}s • {q.points} pts
                          </div>
                        </div>
                        <button
                          onClick={() => removeQuestion(index)}
                          className="yell-transition text-sm font-semibold text-red-600 hover:opacity-80"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="yell-card rounded-3xl p-7">
              <h2 className="text-xl font-semibold tracking-tight">Add question</h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                    Question type
                  </label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        type: e.target.value as QuestionType,
                        options:
                          e.target.value === 'multiple_choice' || e.target.value === 'poll'
                            ? ['', '']
                            : undefined,
                      })
                    }
                    className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4"
                  >
                    <option value="multiple_choice">Multiple choice</option>
                    <option value="poll">Poll</option>
                    <option value="scale">Scale</option>
                    <option value="numeric_guess">Numeric guess</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                    Prompt
                  </label>
                  <input
                    type="text"
                    value={currentQuestion.title}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, title: e.target.value })
                    }
                    placeholder="Enter your question…"
                    className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4 placeholder:text-subtle"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                      Time limit
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.timeLimit}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          timeLimit: parseInt(e.target.value),
                        })
                      }
                      className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.points}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          points: parseInt(e.target.value),
                        })
                      }
                      className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4"
                    />
                  </div>
                </div>

                {(currentQuestion.type === 'multiple_choice' ||
                  currentQuestion.type === 'poll') && (
                  <div>
                    <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="yell-focus-ring yell-transition flex-1 rounded-2xl border border-border bg-bg px-5 py-3 placeholder:text-subtle"
                          />
                          {currentQuestion.options && currentQuestion.options.length > 2 && (
                            <button
                              onClick={() => removeOption(index)}
                              className="yell-focus-ring yell-transition rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-red-600 hover:bg-surface-2"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={addOption}
                        className="yell-focus-ring yell-transition rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold hover:bg-surface-2"
                      >
                        Add option
                      </button>

                      {currentQuestion.type === 'multiple_choice' && (
                        <div className="flex-1">
                          <select
                            value={currentQuestion.correctAnswer}
                            onChange={(e) =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                correctAnswer: parseInt(e.target.value),
                              })
                            }
                            className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-3"
                          >
                            <option value="">Correct answer…</option>
                            {currentQuestion.options?.map((_, index) => (
                              <option key={index} value={index}>
                                Option {index + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'scale' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                        Min
                      </label>
                      <input
                        type="number"
                        value={currentQuestion.scaleMin}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            scaleMin: parseInt(e.target.value),
                          })
                        }
                        placeholder="e.g., 1"
                        className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4 placeholder:text-subtle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                        Max
                      </label>
                      <input
                        type="number"
                        value={currentQuestion.scaleMax}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            scaleMax: parseInt(e.target.value),
                          })
                        }
                        placeholder="e.g., 10"
                        className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4 placeholder:text-subtle"
                      />
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'numeric_guess' && (
                  <div>
                    <label className="block text-sm font-semibold tracking-wide text-muted mb-2">
                      Correct answer
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.correctAnswer}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                      placeholder="Enter the correct numeric answer…"
                      className="yell-focus-ring yell-transition w-full rounded-2xl border border-border bg-bg px-5 py-4 placeholder:text-subtle"
                    />
                  </div>
                )}

                <button
                  onClick={addQuestion}
                  className="yell-focus-ring yell-transition w-full rounded-2xl px-6 py-4 text-white font-semibold"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Add question
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
