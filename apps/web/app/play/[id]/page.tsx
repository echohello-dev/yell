'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

import { BrandMark } from '../../../components/BrandMark';

interface Question {
  id: string;
  type: 'multiple_choice' | 'poll' | 'scale' | 'numeric_guess';
  title: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  timeLimit: number;
}

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const searchParams = useSearchParams();
  const playerId = searchParams.get('playerId');
  const playerName = searchParams.get('playerName');

  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState<
    'waiting' | 'question' | 'answered' | 'results' | 'ended'
  >('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; points?: number } | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    { playerId: string; playerName: string; score: number; rank: number }[]
  >([]);
  const [myRank, setMyRank] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);

  useEffect(() => {
    if (socket && isConnected && playerId && playerName) {
      socket.emit('join:session', { sessionId, playerId, playerName, isHost: false });

      socket.on('session:started', () => {
        setGameState('waiting');
      });

      socket.on('question:started', ({ question }) => {
        setCurrentQuestion(question);
        setGameState('question');
        setSelectedAnswer(null);
        setFeedback(null);
        setQuestionStartTime(Date.now());
      });

      socket.on('answer:submitted', ({ isCorrect, points }) => {
        setFeedback({ isCorrect, points });
        setGameState('answered');
        if (isCorrect) {
          setMyScore((prev) => prev + points);
        }
      });

      socket.on(
        'question:ended',
        ({
          leaderboard: newLeaderboard,
        }: {
          leaderboard: { playerId: string; playerName: string; score: number; rank: number }[];
        }) => {
          setLeaderboard(newLeaderboard);
          const myEntry = newLeaderboard.find((e) => e.playerId === playerId);
          if (myEntry) {
            setMyRank(myEntry.rank);
            setMyScore(myEntry.score);
          }
          setGameState('results');
        },
      );

      socket.on(
        'session:ended',
        ({
          leaderboard: finalLeaderboard,
        }: {
          leaderboard: { playerId: string; playerName: string; score: number; rank: number }[];
        }) => {
          setLeaderboard(finalLeaderboard);
          const myEntry = finalLeaderboard.find((e) => e.playerId === playerId);
          if (myEntry) {
            setMyRank(myEntry.rank);
            setMyScore(myEntry.score);
          }
          setGameState('ended');
        },
      );

      return () => {
        socket.off('session:started');
        socket.off('question:started');
        socket.off('answer:submitted');
        socket.off('question:ended');
        socket.off('session:ended');
      };
    }
  }, [socket, isConnected, sessionId, playerId, playerName]);

  const submitAnswer = () => {
    if (socket && currentQuestion && selectedAnswer !== null) {
      const timeTaken = (Date.now() - questionStartTime) / 1000;
      socket.emit('answer:submit', {
        sessionId,
        playerId,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        timeTaken,
      });
      setGameState('answered');
    }
  };

  const sendReaction = () => {
    if (socket) {
      socket.emit('reaction:send', {
        sessionId,
        playerId,
        type: 'thumbs_up',
      });
    }
  };

  if (!playerId || !playerName) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="yell-card rounded-3xl p-8 text-center">
          <p className="text-xl text-red-500 font-semibold">Invalid player information</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-muted hover:text-fg yell-transition"
          >
            ← Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted">Playing as</p>
            <p className="text-lg font-bold">{playerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold tracking-wide text-muted">Score</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
              {myScore}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {gameState === 'waiting' && (
            <div className="yell-card rounded-3xl p-8 text-center">
              <BrandMark size="sm" className="justify-center mb-6" />
              <h2 className="yell-brand text-3xl font-black tracking-tight mb-4">Get Ready!</h2>
              <p className="text-lg text-subtle mb-6">Waiting for host to start the quiz...</p>
              <div className="text-6xl animate-pulse">⏳</div>
            </div>
          )}

          {gameState === 'question' && currentQuestion && (
            <div className="yell-card rounded-3xl p-8">
              <h2 className="yell-brand text-2xl font-black tracking-tight mb-6">
                {currentQuestion.title}
              </h2>

              {currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'poll' ? (
                <div className="space-y-3 mb-6">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(index)}
                      className={`yell-focus-ring yell-transition w-full p-4 rounded-2xl text-left font-semibold border ${
                        selectedAnswer === index
                          ? 'border-accent bg-surface-2 scale-[1.02]'
                          : 'border-border bg-surface hover:bg-surface-2'
                      }`}
                      style={
                        selectedAnswer === index ? { borderColor: 'var(--accent)' } : undefined
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : currentQuestion.type === 'scale' ? (
                <div className="mb-6">
                  <input
                    type="range"
                    min={currentQuestion.scaleMin}
                    max={currentQuestion.scaleMax}
                    value={
                      typeof selectedAnswer === 'number'
                        ? selectedAnswer
                        : currentQuestion.scaleMin || 1
                    }
                    onChange={(e) => setSelectedAnswer(parseInt(e.target.value))}
                    className="w-full h-3 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-subtle">{currentQuestion.scaleMin}</span>
                    <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                      {typeof selectedAnswer === 'number'
                        ? selectedAnswer
                        : currentQuestion.scaleMin}
                    </span>
                    <span className="text-subtle">{currentQuestion.scaleMax}</span>
                  </div>
                </div>
              ) : currentQuestion.type === 'numeric_guess' ? (
                <div className="mb-6">
                  <input
                    type="number"
                    value={selectedAnswer || ''}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="yell-focus-ring yell-transition w-full p-4 text-2xl text-center rounded-2xl border border-border bg-bg placeholder:text-subtle"
                  />
                </div>
              ) : null}

              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="yell-focus-ring yell-transition w-full px-6 py-4 text-white rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Submit Answer
              </button>
            </div>
          )}

          {gameState === 'answered' && (
            <div className="yell-card rounded-3xl p-8 text-center">
              {feedback?.isCorrect !== undefined ? (
                <>
                  <div className={`text-6xl mb-4 ${feedback.isCorrect ? 'animate-bounce' : ''}`}>
                    {feedback.isCorrect ? '✅' : '❌'}
                  </div>
                  <h2 className="yell-brand text-3xl font-black tracking-tight mb-2">
                    {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                  </h2>
                  {feedback.isCorrect && feedback.points && (
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                      +{feedback.points} points
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="yell-brand text-3xl font-black tracking-tight mb-4">
                    Answer Submitted!
                  </h2>
                  <p className="text-xl text-subtle">Waiting for results...</p>
                </>
              )}

              <button
                onClick={sendReaction}
                className="yell-focus-ring yell-transition mt-6 px-6 py-3 rounded-full font-semibold text-lg border border-border bg-surface hover:bg-surface-2"
              >
                👍 Send Reaction
              </button>
            </div>
          )}

          {gameState === 'results' && (
            <div className="yell-card rounded-3xl p-8">
              <h2 className="yell-brand text-3xl font-black tracking-tight mb-4 text-center">
                Leaderboard
              </h2>
              <div className="mb-6 p-4 bg-surface rounded-2xl text-center">
                <p className="text-sm text-muted">Your Position</p>
                <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
                  #{myRank}
                </p>
                <p className="text-xl">{myScore} points</p>
              </div>

              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((entry) => (
                  <div
                    key={entry.playerId}
                    className={`flex justify-between items-center p-3 rounded-xl ${
                      entry.playerId === playerId
                        ? 'bg-surface-2 border border-accent'
                        : 'bg-surface'
                    }`}
                    style={
                      entry.playerId === playerId ? { borderColor: 'var(--accent)' } : undefined
                    }
                  >
                    <span className="font-semibold">
                      #{entry.rank} {entry.playerName}
                    </span>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState === 'ended' && (
            <div className="yell-card rounded-3xl p-8 text-center">
              <h2 className="yell-brand text-4xl font-black tracking-tight mb-4">Quiz Ended!</h2>

              <div className="mb-6 p-6 bg-surface rounded-2xl">
                <p className="text-sm text-muted mb-2">Final Position</p>
                <p className="text-6xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
                  #{myRank}
                </p>
                <p className="text-2xl font-semibold">{myScore} points</p>
              </div>

              {myRank <= 3 && (
                <div className="mb-6">
                  <p className="text-3xl mb-2">
                    {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : '🥉'}
                  </p>
                  <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                    {myRank === 1 ? 'Champion!' : myRank === 2 ? 'Runner-up!' : 'Bronze Medal!'}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <p className="text-subtle mb-4">Thanks for playing!</p>
                <Link
                  href="/"
                  className="yell-focus-ring yell-transition inline-block px-6 py-3 text-white rounded-2xl font-semibold"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Play Another Quiz
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
