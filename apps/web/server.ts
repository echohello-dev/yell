import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import {
  calculateScore,
  calculateLeaderboard,
  selectRandomWinners,
} from '../../packages/shared/dist/utils.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory storage (replace with database in production)
const sessions = new Map<string, any>();
const players = new Map<string, any>();
const quizzes = new Map<string, any>();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url ?? '/', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join session room
    socket.on('join:session', ({ sessionId, playerId, playerName, isHost }) => {
      socket.join(sessionId);

      const session = sessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      if (!isHost) {
        // Add player to session
        const player = {
          id: playerId,
          sessionId,
          name: playerName,
          score: 0,
          answers: [],
          reactions: [],
          joinedAt: new Date(),
        };

        players.set(playerId, player);
        session.players.push(player);

        // Notify all clients in the session
        io.to(sessionId).emit('player:joined', { player });
      }

      socket.emit('session:joined', { session });
    });

    // Start session
    socket.on('session:start', ({ sessionId }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      session.status = 'started';
      io.to(sessionId).emit('session:started', { session });
    });

    // Start question
    socket.on('question:start', ({ sessionId, questionIndex }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      const quiz = quizzes.get(session.quizId);
      const question = quiz.questions[questionIndex];

      session.currentQuestionIndex = questionIndex;
      session.status = 'question_active';

      io.to(sessionId).emit('question:started', {
        question,
        questionIndex,
        totalQuestions: quiz.questions.length,
      });
    });

    // Submit answer
    socket.on('answer:submit', ({ sessionId, playerId, questionId, answer, timeTaken }) => {
      const session = sessions.get(sessionId);
      const player = players.get(playerId);

      if (!session || !player) {
        socket.emit('error', { message: 'Session or player not found' });
        return;
      }

      const quiz = quizzes.get(session.quizId);
      const question = quiz.questions.find((q: any) => q.id === questionId);

      if (!question) {
        socket.emit('error', { message: 'Question not found' });
        return;
      }

      // Calculate if answer is correct
      let isCorrect = false;
      if (question.type === 'multiple_choice') {
        isCorrect = answer === question.correctAnswer;
      } else if (question.type === 'numeric_guess') {
        const numAnswer = parseFloat(answer);
        const correct = parseFloat(question.correctAnswer);
        isCorrect = Math.abs(numAnswer - correct) < 0.01;
      }

      // Calculate score
      const points = isCorrect
        ? calculateScore(isCorrect, question.timeLimit || 30, timeTaken, question.points || 1000)
        : 0;

      // Store answer
      const answerObj = {
        questionId,
        answer,
        answeredAt: new Date(),
        isCorrect,
        points,
      };

      player.answers.push(answerObj);
      player.score += points;

      socket.emit('answer:submitted', { isCorrect, points });

      // Notify host of answer received (without revealing correctness to other players)
      io.to(sessionId).emit('answer:received', { playerId, playerName: player.name });
    });

    // End question and show results
    socket.on('question:end', ({ sessionId, questionIndex }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      session.status = 'question_results';

      // Calculate leaderboard
      const leaderboard = calculateLeaderboard(session.players);

      io.to(sessionId).emit('question:ended', {
        questionIndex,
        leaderboard,
      });
    });

    // Send reaction
    socket.on('reaction:send', ({ sessionId, playerId, type }) => {
      const player = players.get(playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      const reaction = {
        type,
        timestamp: new Date(),
      };

      player.reactions.push(reaction);

      io.to(sessionId).emit('reaction:sent', {
        playerId,
        playerName: player.name,
        type,
      });
    });

    // End session
    socket.on('session:end', ({ sessionId }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      session.status = 'ended';
      session.endedAt = new Date();

      // Calculate final leaderboard
      const leaderboard = calculateLeaderboard(session.players);

      // Determine winners based on prize mode
      let winners: any[] = [];
      if (session.prizeMode === 'top_score') {
        winners = leaderboard.slice(0, 3);
      } else if (session.prizeMode === 'random_raffle') {
        winners = selectRandomWinners(session.players, 1);
      } else if (session.prizeMode === 'spin_wheel') {
        winners = selectRandomWinners(session.players, 1);
      }

      io.to(sessionId).emit('session:ended', {
        leaderboard,
        winners,
        prizeMode: session.prizeMode,
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make storage available to API routes
  global.storage = {
    sessions,
    players,
    quizzes,
  };

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
