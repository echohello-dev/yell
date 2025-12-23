'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

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
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; points?: number } | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);

  useEffect(() => {
    if (socket && isConnected && playerId && playerName) {
      // Join session as player
      socket.emit('join:session', { sessionId, playerId, playerName, isHost: false });

      // Listen for session started
      socket.on('session:started', () => {
        setGameState('waiting');
      });

      // Listen for question started
      socket.on('question:started', ({ question }) => {
        setCurrentQuestion(question);
        setGameState('question');
        setSelectedAnswer(null);
        setFeedback(null);
        setQuestionStartTime(Date.now());
      });

      // Listen for answer submitted confirmation
      socket.on('answer:submitted', ({ isCorrect, points }) => {
        setFeedback({ isCorrect, points });
        setGameState('answered');
        if (isCorrect) {
          setMyScore((prev) => prev + points);
        }
      });

      // Listen for question ended
      socket.on('question:ended', ({ leaderboard: newLeaderboard }) => {
        setLeaderboard(newLeaderboard);
        const myEntry = newLeaderboard.find((e: any) => e.playerId === playerId);
        if (myEntry) {
          setMyRank(myEntry.rank);
          setMyScore(myEntry.score);
        }
        setGameState('results');
      });

      // Listen for session ended
      socket.on('session:ended', ({ leaderboard: finalLeaderboard, winners }) => {
        setLeaderboard(finalLeaderboard);
        const myEntry = finalLeaderboard.find((e: any) => e.playerId === playerId);
        if (myEntry) {
          setMyRank(myEntry.rank);
          setMyScore(myEntry.score);
        }
        setGameState('ended');
      });

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Invalid player information</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-white">
          <div>
            <p className="text-sm opacity-80">Playing as</p>
            <p className="text-xl font-bold">{playerName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Score</p>
            <p className="text-2xl font-bold">{myScore}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {gameState === 'waiting' && (
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Get Ready!</h2>
              <p className="text-xl text-gray-600 mb-6">Waiting for host to start the quiz...</p>
              <div className="animate-pulse text-6xl">⏳</div>
            </div>
          )}

          {gameState === 'question' && currentQuestion && (
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.title}</h2>

              {currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'poll' ? (
                <div className="space-y-3 mb-6">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(index)}
                      className={`w-full p-4 rounded-lg text-left font-semibold transition-all ${
                        selectedAnswer === index
                          ? 'bg-purple-600 text-white scale-105'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
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
                    value={selectedAnswer || currentQuestion.scaleMin}
                    onChange={(e) => setSelectedAnswer(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">{currentQuestion.scaleMin}</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {selectedAnswer || currentQuestion.scaleMin}
                    </span>
                    <span className="text-gray-600">{currentQuestion.scaleMax}</span>
                  </div>
                </div>
              ) : currentQuestion.type === 'numeric_guess' ? (
                <div className="mb-6">
                  <input
                    type="number"
                    value={selectedAnswer || ''}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="w-full p-4 text-2xl text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ) : null}

              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Submit Answer
              </button>
            </div>
          )}

          {gameState === 'answered' && (
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              {feedback?.isCorrect !== undefined ? (
                <>
                  <div className={`text-6xl mb-4 ${feedback.isCorrect ? 'animate-bounce' : ''}`}>
                    {feedback.isCorrect ? '✅' : '❌'}
                  </div>
                  <h2
                    className={`text-3xl font-bold mb-2 ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                  </h2>
                  {feedback.isCorrect && feedback.points && (
                    <p className="text-2xl text-purple-600 font-bold">+{feedback.points} points</p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Answer Submitted!</h2>
                  <p className="text-xl text-gray-600">Waiting for results...</p>
                </>
              )}

              <button
                onClick={sendReaction}
                className="mt-6 px-6 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 font-semibold text-lg shadow-lg"
              >
                👍 Send Reaction
              </button>
            </div>
          )}

          {gameState === 'results' && (
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Leaderboard</h2>
              <div className="mb-6 p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Your Position</p>
                <p className="text-4xl font-bold text-purple-600">#{myRank}</p>
                <p className="text-xl text-gray-800">{myScore} points</p>
              </div>

              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((entry: any) => (
                  <div
                    key={entry.playerId}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      entry.playerId === playerId
                        ? 'bg-purple-100 border-2 border-purple-600'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold">
                      #{entry.rank} {entry.playerName}
                    </span>
                    <span className="font-bold text-purple-600">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState === 'ended' && (
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Quiz Ended!</h2>

              <div className="mb-6 p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Final Position</p>
                <p className="text-6xl font-bold text-purple-600 mb-2">#{myRank}</p>
                <p className="text-2xl text-gray-800 font-semibold">{myScore} points</p>
              </div>

              {myRank <= 3 && (
                <div className="mb-6">
                  <p className="text-3xl mb-2">
                    {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : '🥉'}
                  </p>
                  <p className="text-xl font-bold text-purple-600">
                    {myRank === 1 ? 'Champion!' : myRank === 2 ? 'Runner-up!' : 'Bronze Medal!'}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">Thanks for playing!</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
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
