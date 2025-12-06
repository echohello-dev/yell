'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useSocket } from '@/hooks/useSocket';
import QRCode from 'qrcode';

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
  timeLimit: number;
  points: number;
}

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { socket, isConnected } = useSocket();
  const [session, setSession] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (socket && isConnected) {
      // Join session as host
      socket.emit('join:session', { sessionId, isHost: true });

      // Listen for session joined
      socket.on('session:joined', async ({ session: joinedSession }) => {
        setSession(joinedSession);
        setPlayers(joinedSession.players || []);
        
        // Fetch quiz details
        const res = await fetch('/api/quizzes');
        const { quizzes } = await res.json();
        const sessionQuiz = quizzes.find((q: any) => q.id === joinedSession.quizId);
        setQuiz(sessionQuiz);

        // Generate QR code
        const joinUrl = `${window.location.origin}/join?code=${joinedSession.joinCode}`;
        const qr = await QRCode.toDataURL(joinUrl);
        setQrCodeUrl(qr);
      });

      // Listen for players joining
      socket.on('player:joined', ({ player }) => {
        setPlayers((prev) => [...prev, player]);
      });

      // Listen for question ended
      socket.on('question:ended', ({ leaderboard: newLeaderboard }) => {
        setLeaderboard(newLeaderboard);
        setShowResults(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      });

      // Listen for session ended
      socket.on('session:ended', ({ leaderboard: finalLeaderboard, winners: sessionWinners }) => {
        setLeaderboard(finalLeaderboard);
        setWinners(sessionWinners);
      });

      return () => {
        socket.off('session:joined');
        socket.off('player:joined');
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
        
        if (remaining === 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
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
      setSession((prev: any) => ({ ...prev, status: 'started' }));
    }
  };

  const startQuestion = (index: number) => {
    if (socket) {
      socket.emit('question:start', { sessionId, questionIndex: index });
      setCurrentQuestionIndex(index);
      setQuestionStartTime(Date.now());
      setShowResults(false);
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
      setSession((prev: any) => ({ ...prev, status: 'ended' }));
    }
  };

  if (!session || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
              <p className="text-gray-600">
                Session Status: <span className="font-semibold capitalize">{session.status.replace('_', ' ')}</span>
              </p>
            </div>
            {session.status === 'waiting' && (
              <button
                onClick={startSession}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Start Session
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Join Info */}
          {session.status === 'waiting' && (
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Join Information</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <p className="text-gray-600 mb-2">Join Code:</p>
                  <p className="text-5xl font-bold text-purple-600 tracking-widest">{session.joinCode}</p>
                  <p className="text-gray-600 mt-4 mb-2">Or visit:</p>
                  <p className="text-lg text-purple-600 font-semibold">{window.location.origin}/join</p>
                </div>
                {qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Scan QR Code:</p>
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Question or Results */}
          {(session.status === 'started' || session.status === 'question_active' || session.status === 'question_results') && (
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              {currentQuestionIndex >= 0 && !showResults ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </h2>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">{timeRemaining}s</div>
                      <div className="text-sm text-gray-600">remaining</div>
                    </div>
                  </div>
                  <p className="text-xl text-gray-700 mb-4">{quiz.questions[currentQuestionIndex].title}</p>
                  <button
                    onClick={endQuestion}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    End Question
                  </button>
                </div>
              ) : showResults ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Question Results</h2>
                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Leaderboard</h3>
                    <div className="space-y-2">
                      {leaderboard.slice(0, 5).map((entry) => (
                        <div key={entry.playerId} className="flex justify-between items-center bg-white p-2 rounded">
                          <span>#{entry.rank} {entry.playerName}</span>
                          <span className="font-bold">{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button
                      onClick={() => startQuestion(currentQuestionIndex + 1)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={endSession}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      End Session
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start</h2>
                  <button
                    onClick={() => startQuestion(0)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                  >
                    Start First Question
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Final Results */}
          {session.status === 'ended' && (
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Session Ended</h2>
              
              {winners.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">🎉 Winners 🎉</h3>
                  <div className="space-y-2">
                    {winners.map((winner, index) => (
                      <div key={index} className="text-xl font-semibold text-purple-600">
                        {winner.playerName}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-800 mb-4">Final Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div key={entry.playerId} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="font-semibold">#{entry.rank} {entry.playerName}</span>
                    <span className="font-bold text-purple-600">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Players List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Players ({players.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {players.map((player) => (
                <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{player.name}</span>
                  <span className="text-sm text-gray-600">{player.score}</span>
                </div>
              ))}
              {players.length === 0 && (
                <p className="text-gray-500 text-center py-4">No players yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quiz.questions.map((question: Question, index: number) => (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  index === currentQuestionIndex
                    ? 'border-purple-600 bg-purple-50'
                    : index < currentQuestionIndex
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-purple-600 uppercase">
                    {question.type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">Q{index + 1}</span>
                </div>
                <p className="font-medium text-gray-800 mb-2">{question.title}</p>
                <p className="text-sm text-gray-600">
                  {question.timeLimit}s • {question.points} pts
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
