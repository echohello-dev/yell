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

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}

const ANSWER_COLORS = [
  'yell-answer-red',
  'yell-answer-blue',
  'yell-answer-gold',
  'yell-answer-green',
];
const ANSWER_SHAPES = ['▲', '◆', '●', '■'];

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const searchParams = useSearchParams();
  const playerName = searchParams.get('playerName');

  const { socket, isConnected } = useSocket();
  const [playerId, setPlayerId] = useState<string>('');
  const [gameState, setGameState] = useState<
    'waiting' | 'question' | 'answered' | 'results' | 'ended'
  >('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; points?: number } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);

  useEffect(() => {
    if (socket && isConnected && playerName) {
      socket.emit('join:session', { sessionId, playerName, isHost: false });

      // Listen for session joined event to get playerId from server
      socket.on('session:joined', ({ playerId: serverId }) => {
        if (serverId) {
          setPlayerId(serverId);
        }
        setGameState('waiting');
      });

      socket.on('question:started', ({ question }: { question: Question }) => {
        setCurrentQuestion(question);
        setGameState('question');
        setSelectedAnswer(null);
        setFeedback(null);
        setQuestionStartTime(performance.now());
        setTimeRemaining(question.timeLimit || 20);
      });

      socket.on(
        'answer:submitted',
        ({ isCorrect, points }: { isCorrect: boolean; points: number }) => {
          setFeedback({ isCorrect, points });
          setGameState('answered');
          if (isCorrect) {
            setMyScore((prev) => prev + points);
          }
        },
      );

      socket.on(
        'question:ended',
        ({ leaderboard: newLeaderboard }: { leaderboard: LeaderboardEntry[] }) => {
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
        ({ leaderboard: finalLeaderboard }: { leaderboard: LeaderboardEntry[] }) => {
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

  useEffect(() => {
    if (gameState === 'question' && currentQuestion) {
      const interval = setInterval(() => {
        const elapsed = (performance.now() - questionStartTime) / 1000;
        const remaining = Math.max(0, (currentQuestion.timeLimit || 20) - elapsed);
        setTimeRemaining(remaining);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameState, currentQuestion, questionStartTime]);

  const submitAnswer = (answer: number | string) => {
    if (socket && currentQuestion && gameState === 'question' && playerId) {
      setSelectedAnswer(answer);
      socket.emit('answer:submit', {
        sessionId,
        playerId,
        questionId: currentQuestion.id,
        answer,
      });
      setGameState('answered');
    }
  };

  if (!playerName) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="yell-card rounded-3xl p-8 text-center">
          <p className="text-xl text-answer-red font-semibold">Invalid player information</p>
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

  const timerPercentage = currentQuestion
    ? (timeRemaining / (currentQuestion.timeLimit || 20)) * 100
    : 100;
  const timerClass = timerPercentage < 20 ? 'danger' : timerPercentage < 40 ? 'warning' : '';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Playing as</p>
            <p className="text-lg font-bold">{playerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Score</p>
            <p className="text-3xl font-black text-accent">{myScore}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {gameState === 'waiting' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="yell-card rounded-3xl p-8 text-center max-w-md w-full">
              <BrandMark size="sm" className="justify-center mb-6" />
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center animate-pulse-slow">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="yell-brand text-3xl font-black tracking-tight mb-2">
                You&apos;re in, {playerName}!
              </h2>
              <p className="text-lg text-subtle mb-6">Get ready to play...</p>
              <div className="flex justify-center gap-2 text-3xl">
                <span className="animate-bounce-slow" style={{ animationDelay: '0s' }}>
                  🔥
                </span>
                <span className="animate-bounce-slow" style={{ animationDelay: '0.1s' }}>
                  ⚡
                </span>
                <span className="animate-bounce-slow" style={{ animationDelay: '0.2s' }}>
                  🎯
                </span>
                <span className="animate-bounce-slow" style={{ animationDelay: '0.3s' }}>
                  💥
                </span>
              </div>
            </div>
          </div>
        )}

        {gameState === 'question' && currentQuestion && (
          <div className="flex-1 flex flex-col">
            {/* Timer Bar */}
            <div className="p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-muted uppercase">Time remaining</span>
                  <span className="text-2xl font-black text-accent">
                    {Math.ceil(timeRemaining)}s
                  </span>
                </div>
                <div className="yell-timer-bar">
                  <div
                    className={`yell-timer-fill ${timerClass}`}
                    style={{ width: `${timerPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="px-4 py-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="yell-brand text-2xl sm:text-3xl font-black tracking-tight">
                  {currentQuestion.title}
                </h2>
              </div>
            </div>

            {/* Answer Options */}
            <div className="flex-1 p-4">
              <div className="max-w-4xl mx-auto h-full">
                {(currentQuestion.type === 'multiple_choice' ||
                  currentQuestion.type === 'poll') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
                    {currentQuestion.options?.slice(0, 4).map((option, index) => (
                      <button
                        key={index}
                        onClick={() => submitAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`yell-answer ${ANSWER_COLORS[index]} ${
                          selectedAnswer === index ? 'selected' : ''
                        } ${selectedAnswer !== null && selectedAnswer !== index ? 'faded' : ''}`}
                      >
                        <span className="yell-answer-shape">{ANSWER_SHAPES[index]}</span>
                        <span className="flex-1 text-center">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'scale' && (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
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
                      className="w-full max-w-md h-4 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between w-full max-w-md text-muted">
                      <span>{currentQuestion.scaleMin}</span>
                      <span className="text-4xl font-black text-accent">
                        {typeof selectedAnswer === 'number' ? selectedAnswer : '?'}
                      </span>
                      <span>{currentQuestion.scaleMax}</span>
                    </div>
                    <button
                      onClick={() => selectedAnswer !== null && submitAnswer(selectedAnswer)}
                      disabled={selectedAnswer === null}
                      className="yell-focus-ring yell-transition px-12 py-4 bg-accent text-black rounded-2xl font-bold text-lg disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </div>
                )}

                {currentQuestion.type === 'numeric_guess' && (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <input
                      type="number"
                      value={selectedAnswer || ''}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      placeholder="???"
                      className="yell-focus-ring yell-transition text-5xl font-black text-center w-48 p-4 rounded-2xl border-2 border-border bg-bg"
                    />
                    <button
                      onClick={() => selectedAnswer && submitAnswer(selectedAnswer)}
                      disabled={!selectedAnswer}
                      className="yell-focus-ring yell-transition px-12 py-4 bg-accent text-black rounded-2xl font-bold text-lg disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {gameState === 'answered' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="yell-card rounded-3xl p-8 text-center max-w-md w-full">
              {feedback?.isCorrect !== undefined ? (
                <>
                  <div
                    className={`text-7xl mb-4 ${feedback.isCorrect ? 'animate-bounce-slow' : 'animate-shake'}`}
                  >
                    {feedback.isCorrect ? '✅' : '❌'}
                  </div>
                  <h2 className="yell-brand text-4xl font-black tracking-tight mb-2">
                    {feedback.isCorrect ? 'Nailed it!' : 'Not quite!'}
                  </h2>
                  {feedback.isCorrect && feedback.points && (
                    <div className="inline-block px-6 py-2 bg-accent text-black rounded-full font-bold text-xl mt-2">
                      +{feedback.points} pts
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-7xl mb-4 animate-pulse-slow">⏳</div>
                  <h2 className="yell-brand text-3xl font-black tracking-tight">
                    Answer locked in!
                  </h2>
                  <p className="text-subtle mt-2">Waiting for results...</p>
                </>
              )}
            </div>
          </div>
        )}

        {gameState === 'results' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="yell-card rounded-3xl p-8 max-w-lg w-full">
              <h2 className="yell-brand text-3xl font-black tracking-tight mb-6 text-center">
                Leaderboard
              </h2>

              {/* My Position */}
              <div className="mb-6 p-6 bg-surface rounded-2xl text-center border-2 border-accent">
                <p className="text-sm text-muted uppercase tracking-wide">Your Position</p>
                <p className="text-5xl font-black text-accent">#{myRank}</p>
                <p className="text-xl font-semibold">{myScore} pts</p>
              </div>

              {/* Top Players */}
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div
                    key={entry.playerId}
                    className={`flex justify-between items-center p-3 rounded-xl ${
                      entry.playerId === playerId ? 'bg-accent text-black' : 'bg-surface'
                    }`}
                  >
                    <span className="font-bold">
                      <span className={entry.rank <= 3 ? 'mr-2' : ''}>
                        {entry.rank === 1
                          ? '🥇'
                          : entry.rank === 2
                            ? '🥈'
                            : entry.rank === 3
                              ? '🥉'
                              : `#${entry.rank}`}
                      </span>
                      {entry.playerName}
                    </span>
                    <span className="font-black">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'ended' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="yell-card rounded-3xl p-8 max-w-lg w-full text-center">
              <h2 className="yell-brand text-4xl font-black tracking-tight mb-6">Game Over!</h2>

              {/* Podium for top 3 */}
              {leaderboard.length >= 3 && (
                <div className="yell-podium mb-6">
                  {/* 2nd Place */}
                  <div className="yell-podium-place">
                    <span className="text-3xl">🥈</span>
                    <div className="yell-podium-bar yell-podium-2">
                      <span className="text-2xl font-black">#2</span>
                    </div>
                    <p className="yell-podium-name">{leaderboard[1]?.playerName}</p>
                    <p className="text-sm text-muted">{leaderboard[1]?.score} pts</p>
                  </div>

                  {/* 1st Place */}
                  <div className="yell-podium-place">
                    <span className="text-4xl">🥇</span>
                    <div className="yell-podium-bar yell-podium-1">
                      <span className="text-3xl font-black">#1</span>
                    </div>
                    <p className="yell-podium-name text-accent font-bold">
                      {leaderboard[0]?.playerName}
                    </p>
                    <p className="text-sm text-muted">{leaderboard[0]?.score} pts</p>
                  </div>

                  {/* 3rd Place */}
                  <div className="yell-podium-place">
                    <span className="text-3xl">🥉</span>
                    <div className="yell-podium-bar yell-podium-3">
                      <span className="text-2xl font-black">#3</span>
                    </div>
                    <p className="yell-podium-name">{leaderboard[2]?.playerName}</p>
                    <p className="text-sm text-muted">{leaderboard[2]?.score} pts</p>
                  </div>
                </div>
              )}

              {/* My Final Position */}
              <div className="mb-6 p-6 bg-surface rounded-2xl border-2 border-accent">
                <p className="text-sm text-muted uppercase tracking-wide">Your Final Position</p>
                <p className="text-6xl font-black text-accent">#{myRank}</p>
                <p className="text-2xl font-semibold">{myScore} pts</p>
                {myRank <= 3 && (
                  <p className="text-xl font-bold text-accent mt-2">
                    {myRank === 1 ? '🏆 Champion!' : myRank === 2 ? '🎉 Runner-up!' : '🎊 Bronze!'}
                  </p>
                )}
              </div>

              <Link
                href="/"
                className="yell-focus-ring yell-transition inline-block px-8 py-4 bg-accent text-black rounded-2xl font-bold text-lg"
              >
                Play Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
