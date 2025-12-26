'use client';

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useSocket } from '@/hooks/useSocket';
import QRCode from 'qrcode';

import { BrandMark } from '../../../components/BrandMark';
import { ThemeToggle } from '../../../components/ThemeToggle';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Question {
  id: string;
  type: string;
  title: string;
  options?: string[];
  correctAnswer?: number;
  timeLimit: number;
  points: number;
}

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}

const ANSWER_COLORS = ['bg-answer-red', 'bg-answer-blue', 'bg-answer-gold', 'bg-answer-green'];
const ANSWER_SHAPES = ['▲', '◆', '●', '■'];

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { socket, isConnected } = useSocket();
  const [session, setSession] = useState<{
    id: string;
    joinCode: string;
    status: string;
    quizId: string;
    players: Player[];
  } | null>(null);
  const [quiz, setQuiz] = useState<{ title: string; questions: Question[] } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winners, setWinners] = useState<{ playerName: string }[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answersReceived, setAnswersReceived] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join:session', { sessionId, isHost: true });

      socket.on(
        'session:joined',
        async ({
          session: joinedSession,
        }: {
          session: { id: string; joinCode: string; status: string; quizId: string; players: Player[] };
        }) => {
          setSession(joinedSession);
          setPlayers(joinedSession.players || []);

          const res = await fetch('/api/quizzes');
          const { quizzes } = await res.json();
          const sessionQuiz = quizzes.find((q: { id: string }) => q.id === joinedSession.quizId);
          setQuiz(sessionQuiz);

          const joinUrl = `${window.location.origin}/join?code=${joinedSession.joinCode}`;
          const qr = await QRCode.toDataURL(joinUrl, { width: 200, margin: 2 });
          setQrCodeUrl(qr);
        },
      );

      socket.on('player:joined', ({ player }: { player: Player }) => {
        setPlayers((prev) => [...prev, player]);
      });

      socket.on('answer:received', () => {
        setAnswersReceived((prev) => prev + 1);
      });

      socket.on('question:ended', ({ leaderboard: newLeaderboard }: { leaderboard: LeaderboardEntry[] }) => {
        setLeaderboard(newLeaderboard);
        setShowResults(true);
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
        }
      });

      socket.on(
        'session:ended',
        ({
          leaderboard: finalLeaderboard,
          winners: sessionWinners,
        }: {
          leaderboard: LeaderboardEntry[];
          winners: { playerName: string }[];
        }) => {
          setLeaderboard(finalLeaderboard);
          setWinners(sessionWinners);
        },
      );

      return () => {
        socket.off('session:joined');
        socket.off('player:joined');
        socket.off('answer:received');
        socket.off('question:ended');
        socket.off('session:ended');
      };
    }
  }, [socket, isConnected, sessionId]);

  useEffect(() => {
    if (questionStartTime && currentQuestionIndex >= 0 && quiz) {
      const question = quiz.questions[currentQuestionIndex];
      const timeLimit = question.timeLimit || 30;

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0 && timerRef.current !== null) {
          clearInterval(timerRef.current);
        }
      }, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [questionStartTime, currentQuestionIndex, quiz]);

  const startSession = () => {
    if (socket) {
      socket.emit('session:start', { sessionId });
      setSession((prev) => (prev ? { ...prev, status: 'started' } : null));
    }
  };

  const startQuestion = (index: number) => {
    if (socket && quiz) {
      socket.emit('question:start', { sessionId, questionIndex: index });
      setCurrentQuestionIndex(index);
      setQuestionStartTime(Date.now());
      setShowResults(false);
      setAnswersReceived(0);
      setTimeRemaining(quiz.questions[index].timeLimit || 30);
    }
  };

  const endQuestion = () => {
    if (socket) {
      socket.emit('question:end', { sessionId, questionIndex: currentQuestionIndex });
    }
  };

  const endSession = () => {
    if (socket) {
      socket.emit('session:end', { sessionId });
      setSession((prev) => (prev ? { ...prev, status: 'ended' } : null));
    }
  };

  if (!session || !quiz) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-xl text-muted animate-pulse-slow">Loading session...</div>
      </div>
    );
  }

  const currentQuestion = currentQuestionIndex >= 0 ? quiz.questions[currentQuestionIndex] : null;
  const timerPercentage = currentQuestion ? (timeRemaining / (currentQuestion.timeLimit || 30)) * 100 : 100;
  const timerClass = timerPercentage < 20 ? 'danger' : timerPercentage < 40 ? 'warning' : '';

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-6 mb-6">
          <BrandMark size="sm" tagline="Host" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="yell-transition text-sm text-muted hover:text-fg">
              ← Home
            </Link>
          </div>
        </header>

        {/* Quiz Title Card */}
        <div className="yell-card rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="yell-brand text-3xl font-black tracking-tight mb-2">{quiz.title}</h1>
              <p className="text-subtle">
                Status: <span className="font-semibold capitalize text-accent">{session.status.replace('_', ' ')}</span>
              </p>
            </div>
            {session.status === 'waiting' && (
              <button
                onClick={startSession}
                disabled={players.length === 0}
                className="yell-focus-ring yell-transition px-6 py-3 bg-accent text-black rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Session
              </button>
            )}
          </div>
        </div>

        {/* Lobby - Join Info */}
        {session.status === 'waiting' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 yell-card rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6">Join the Game</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm text-muted uppercase tracking-wide mb-2">Game PIN</p>
                  <p className="text-6xl font-black text-accent lowercase tracking-wider">
                    {session.joinCode}
                  </p>
                  <p className="text-muted mt-4">
                    Go to <span className="text-accent font-semibold">{typeof window !== 'undefined' ? window.location.origin : ''}/join</span>
                  </p>
                </div>
                {qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-sm text-muted uppercase tracking-wide mb-2">Or scan QR</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-xl bg-white p-2" />
                  </div>
                )}
              </div>
            </div>

            {/* Players */}
            <div className="yell-card rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4">Players ({players.length})</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 bg-surface rounded-xl animate-pulse-slow"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold">{player.name}</span>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-muted text-center py-8">Waiting for players to join...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Game */}
        {(session.status === 'started' || session.status === 'question_active' || session.status === 'question_results') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 yell-card rounded-3xl overflow-hidden">
              {currentQuestionIndex >= 0 && !showResults && currentQuestion ? (
                <>
                  {/* Timer Bar */}
                  <div className="p-4 border-b border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-muted uppercase">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted">{answersReceived}/{players.length} answered</span>
                        <span className="text-3xl font-black text-accent">{timeRemaining}s</span>
                      </div>
                    </div>
                    <div className="yell-timer-bar">
                      <div className={`yell-timer-fill ${timerClass}`} style={{ width: `${timerPercentage}%` }} />
                    </div>
                  </div>

                  {/* Question */}
                  <div className="p-8">
                    <h2 className="yell-brand text-3xl font-black tracking-tight mb-8 text-center">
                      {currentQuestion.title}
                    </h2>

                    {/* Answer Options Display */}
                    {currentQuestion.options && (
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {currentQuestion.options.slice(0, 4).map((option, index) => (
                          <div
                            key={index}
                            className={`${ANSWER_COLORS[index]} p-4 rounded-xl flex items-center gap-3 text-white font-bold`}
                          >
                            <span className="text-2xl opacity-80">{ANSWER_SHAPES[index]}</span>
                            <span className="flex-1">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={endQuestion}
                      className="yell-focus-ring yell-transition px-8 py-3 bg-answer-red text-white rounded-2xl font-bold"
                    >
                      End Question
                    </button>
                  </div>
                </>
              ) : showResults && currentQuestion ? (
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Results</h2>

                  {/* Correct Answer */}
                  {currentQuestion.correctAnswer !== undefined && currentQuestion.options && (
                    <div className="mb-6">
                      <p className="text-sm text-muted uppercase tracking-wide mb-2">Correct Answer</p>
                      <div
                        className={`${ANSWER_COLORS[currentQuestion.correctAnswer]} inline-flex items-center gap-3 p-4 rounded-xl text-white font-bold`}
                      >
                        <span className="text-2xl">{ANSWER_SHAPES[currentQuestion.correctAnswer]}</span>
                        <span>{currentQuestion.options[currentQuestion.correctAnswer]}</span>
                      </div>
                    </div>
                  )}

                  {/* Leaderboard */}
                  <div className="mb-6">
                    <p className="text-sm text-muted uppercase tracking-wide mb-3">Leaderboard</p>
                    <div className="space-y-2">
                      {leaderboard.slice(0, 5).map((entry) => (
                        <div key={entry.playerId} className="flex justify-between items-center p-3 bg-surface rounded-xl">
                          <span className="font-bold">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}{' '}
                            {entry.playerName}
                          </span>
                          <span className="font-black text-accent">{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button
                      onClick={() => startQuestion(currentQuestionIndex + 1)}
                      className="yell-focus-ring yell-transition px-8 py-3 bg-accent text-black rounded-2xl font-bold"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={endSession}
                      className="yell-focus-ring yell-transition px-8 py-3 bg-accent text-black rounded-2xl font-bold"
                    >
                      End Game →
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Ready to Start</h2>
                  <p className="text-muted mb-6">{quiz.questions.length} questions • {players.length} players</p>
                  <button
                    onClick={() => startQuestion(0)}
                    className="yell-focus-ring yell-transition px-8 py-4 bg-accent text-black rounded-2xl font-bold text-lg"
                  >
                    Start First Question
                  </button>
                </div>
              )}
            </div>

            {/* Players/Leaderboard Sidebar */}
            <div className="yell-card rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4">
                {leaderboard.length > 0 ? 'Leaderboard' : 'Players'} ({players.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(leaderboard.length > 0 ? leaderboard : players.map((p, i) => ({
                  playerId: p.id,
                  playerName: p.name,
                  score: p.score,
                  rank: i + 1,
                }))).map((entry) => (
                  <div key={entry.playerId} className="flex justify-between items-center p-3 bg-surface rounded-xl">
                    <span className="font-semibold">#{entry.rank} {entry.playerName}</span>
                    <span className="font-bold text-accent">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Ended */}
        {session.status === 'ended' && (
          <div className="max-w-3xl mx-auto">
            <div className="yell-card rounded-3xl p-8 text-center">
              <h1 className="yell-brand text-4xl font-black tracking-tight mb-8">Game Over!</h1>

              {/* Podium */}
              {leaderboard.length >= 3 && (
                <div className="yell-podium mb-8">
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
                    <p className="yell-podium-name text-accent font-bold">{leaderboard[0]?.playerName}</p>
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

              {/* Winners (for raffle mode) */}
              {winners.length > 0 && (
                <div className="mb-8 p-6 bg-surface rounded-2xl">
                  <h3 className="text-2xl font-bold mb-4">🎉 Winners 🎉</h3>
                  {winners.map((winner, index) => (
                    <p key={index} className="text-xl font-bold text-accent">{winner.playerName}</p>
                  ))}
                </div>
              )}

              {/* Full Leaderboard */}
              <div className="text-left mb-8">
                <h3 className="text-xl font-bold mb-4">Final Standings</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {leaderboard.map((entry) => (
                    <div key={entry.playerId} className="flex justify-between items-center p-3 bg-surface rounded-xl">
                      <span className="font-semibold">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}{' '}
                        {entry.playerName}
                      </span>
                      <span className="font-black text-accent">{entry.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/host"
                className="yell-focus-ring yell-transition inline-block px-8 py-4 bg-accent text-black rounded-2xl font-bold text-lg"
              >
                Create New Quiz
              </Link>
            </div>
          </div>
        )}

        {/* Question List (shown during active game) */}
        {(session.status === 'started' || session.status === 'question_active' || session.status === 'question_results') && (
          <div className="yell-card rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">Questions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {quiz.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-xl border-2 ${
                    index === currentQuestionIndex
                      ? 'border-accent bg-surface-2'
                      : index < currentQuestionIndex
                        ? 'border-answer-green bg-surface opacity-60'
                        : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-accent">Q{index + 1}</span>
                    <span className="text-xs text-muted">{question.timeLimit}s</span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{question.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
