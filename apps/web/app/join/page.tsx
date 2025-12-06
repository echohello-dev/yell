'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!joinCode || !playerName) {
      setError('Please enter both join code and your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions?joinCode=${joinCode.toUpperCase()}`);
      
      if (!response.ok) {
        setError('Session not found. Please check your code.');
        setLoading(false);
        return;
      }

      const { session } = await response.json();
      
      // Generate player ID and navigate to play page
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      router.push(`/play/${session.id}?playerId=${playerId}&playerName=${encodeURIComponent(playerName)}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="mb-6">
          <Link href="/" className="text-purple-600 hover:text-purple-800 text-sm">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Join a Quiz</h1>
        <p className="text-gray-600 mb-6">Enter the join code to participate</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Join Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl font-bold tracking-widest uppercase"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Joining...' : 'Join Quiz'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm mb-2">Or scan QR code with mobile app</p>
          <p className="text-center text-purple-600 font-semibold">Available on iOS & Android</p>
        </div>
      </div>
    </div>
  );
}
