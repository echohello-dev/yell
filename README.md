# Yell - Interactive Live Quiz Platform

A cross-platform live quiz application similar to Kahoot/Menti, built with Expo (iOS/Android) and Next.js (web). Create engaging quizzes with multiple question types, live reactions, real-time leaderboards, and exciting prize modes!

## Features

### Core Features (Open Source)

- 🎯 **Multiple Question Types**: Multiple choice, polls, scale ratings, and numeric guesses
- 📱 **Cross-Platform**: Web (Next.js), iOS & Android (Expo)
- 🔗 **Easy Join**: Join via memorable word-pair codes (e.g., "happy-tiger") or QR codes
- 👥 **Named Players**: Players can set their display names
- 👍 **Live Reactions**: Send thumbs up reactions in real-time
- 🏆 **Leaderboards**: Real-time scoring and rankings
- 🎁 **Prize Modes**: Top score, random raffle, and spin wheel
- ⚡ **Real-Time**: WebSocket-powered live updates

### Premium Features (SaaS)

- 📊 **Analytics**: Detailed session analytics and insights
- 🎨 **Custom Branding**: Logo, colors, and custom domains
- 📝 **Session History**: Store and review past sessions
- 🚀 **Higher Limits**: More players, questions, and sessions
- 🆓 **Free Tier Trial**: Hook users to register and upgrade

## Architecture

```
yell/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # Expo mobile application
└── packages/
    └── shared/       # Shared types and utilities
```

## Tech Stack

- **Frontend (Web)**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Frontend (Mobile)**: Expo, React Native, TypeScript
- **Backend**: Next.js API Routes, Socket.IO for real-time communication
- **Database**: In-memory storage (can be extended to PostgreSQL/MongoDB)

## Getting Started

### Prerequisites

- Node.js 24+
- bun
- For mobile development: Expo CLI

### Installation

1. Clone the repository:

```bash
git clone https://github.com/echohello-dev/yell.git
cd yell
```

2. Install dependencies:

```bash
bun install
```

3. Build the shared package:

```bash
cd packages/shared
bun install
bun run build
cd ../..
```

### Running the Applications

#### Web Application

```bash
bun run dev:web
```

The web app will be available at `http://localhost:3000`

#### Mobile Application

```bash
bun run dev:mobile
```

Then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

## Usage Guide

### Creating a Quiz (Host)

1. Navigate to the home page
2. Click "Host a Quiz"
3. Enter a quiz title and select a prize mode
4. Add questions with different types:
   - **Multiple Choice**: Add options and select the correct answer
   - **Poll**: Add options (no correct answer)
   - **Scale**: Set min/max values for rating scales
   - **Numeric Guess**: Set the correct numeric answer
5. Configure time limits and points for each question
6. Click "Start Quiz" to begin

### Joining a Quiz (Player)

#### On Web:

1. Go to the home page
2. Click "Join a Quiz"
3. Enter the join code (e.g., "happy-tiger")
4. Enter your name
5. Click "Join Quiz"

#### On Mobile:

1. Open the Yell app
2. Choose "Join with Code" or "Scan QR Code"
3. Enter the join code or scan the QR code
4. Enter your name
5. Start playing!

### During the Quiz

**Host View:**

- See all connected players
- Start/end questions
- View real-time answers
- Show leaderboards after each question
- Award prizes at the end

**Player View:**

- Answer questions as they appear
- See immediate feedback (correct/incorrect)
- Send live reactions
- View your rank and score
- Celebrate if you win!

## Prize Modes

- **Top Score**: Top 3 players win based on points
- **Random Raffle**: Random winner selected from all players
- **Spin Wheel**: Random winner with visual spin animation
- **None**: No prizes, just for fun!

## API Endpoints

### POST /api/quizzes

Create a new quiz

```json
{
  "title": "Quiz Title",
  "description": "Optional description",
  "questions": [...]
}
```

### POST /api/sessions

Create a new session

```json
{
  "quizId": "quiz-id",
  "prizeMode": "top_score"
}
```

### GET /api/sessions?joinCode=ABC123

Get session by join code

## WebSocket Events

### Client → Server

- `join:session` - Join a session as host or player
- `session:start` - Start the session
- `question:start` - Start a question
- `question:end` - End a question
- `answer:submit` - Submit an answer
- `reaction:send` - Send a reaction
- `session:end` - End the session

### Server → Client

- `session:joined` - Confirmation of joining
- `player:joined` - New player joined
- `session:started` - Session started
- `question:started` - Question started
- `answer:submitted` - Answer confirmed
- `question:ended` - Question ended with results
- `reaction:sent` - Reaction broadcast
- `session:ended` - Session ended with final results

## User Tiers

### Free Tier

- Up to 50 players per session
- Up to 10 questions per quiz
- 5 sessions per month
- 7-day session history
- Basic features

### Premium Tier

- Up to 500 players per session
- Up to 100 questions per quiz
- Unlimited sessions
- 1-year session history
- Analytics dashboard
- Custom branding

### Enterprise Tier

- Unlimited players
- Unlimited questions
- Unlimited sessions
- Unlimited history
- Advanced analytics
- White-label support
- Priority support

## Development

### Project Structure

```
apps/web/
├── app/
│   ├── api/          # API routes
│   ├── host/         # Quiz creation page
│   ├── join/         # Join page
│   ├── play/[id]/    # Player view
│   └── session/[id]/ # Host control panel
├── hooks/            # React hooks
└── server.js         # Custom Next.js server with Socket.IO

apps/mobile/
└── App.tsx          # Main mobile app

packages/shared/
└── src/
    ├── types.ts     # TypeScript types
    └── utils.ts     # Shared utilities
```

### Adding New Features

1. Update types in `packages/shared/src/types.ts`
2. Rebuild shared package: `cd packages/shared && npm run build`
3. Implement backend logic in `apps/web/server.js` or API routes
4. Update frontend components in web and/or mobile apps

## Deployment

### Web (Vercel/Netlify)

```bash
cd apps/web
npm run build
```

### Mobile (Expo)

```bash
cd apps/mobile
expo build:ios
expo build:android
```

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions and support:

- GitHub Issues: https://github.com/echohello-dev/yell/issues
- Documentation: See this README

## Roadmap

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication (OAuth, email/password)
- [ ] Premium subscription management
- [ ] Advanced analytics dashboard
- [ ] Custom branding UI
- [ ] Session history and replay
- [ ] Export results to CSV/PDF
- [ ] Team/organization management
- [ ] Question bank and templates
- [ ] Integration with LMS platforms

## Credits

Created by the Yell team. Inspired by Kahoot and Mentimeter.
