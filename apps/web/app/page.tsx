import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Yell</h1>
        <p className="text-2xl text-white/90 mb-8">Interactive Live Quizzes with a Spin!</p>
        <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
          Create engaging quizzes, polls, and interactive sessions for your classroom, team
          meetings, or events. Join with QR codes, compete on leaderboards, and win prizes!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/host"
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Host a Quiz
          </Link>
          <Link
            href="/join"
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Join a Quiz
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-4xl mb-2">📱</div>
            <h3 className="text-xl font-semibold mb-2">Cross-Platform</h3>
            <p className="text-white/80">Works on web, iOS, and Android</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Real-Time</h3>
            <p className="text-white/80">Live reactions and instant results</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-4xl mb-2">🎁</div>
            <h3 className="text-xl font-semibold mb-2">Prize Modes</h3>
            <p className="text-white/80">Leaderboards, raffles, and spin wheels</p>
          </div>
        </div>
      </div>
    </div>
  );
}
