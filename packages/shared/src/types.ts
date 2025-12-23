// Question Types
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  POLL = 'poll',
  SCALE = 'scale',
  NUMERIC_GUESS = 'numeric_guess',
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  timeLimit?: number; // seconds
  points?: number;
  options?: string[]; // for MCQ and Poll
  correctAnswer?: number | string; // for MCQ and Numeric
  scaleMin?: number; // for Scale
  scaleMax?: number; // for Scale
  scaleLabels?: { min: string; max: string }; // for Scale
}

// Quiz and Session Types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  isPremium?: boolean;
}

export interface Session {
  id: string;
  quizId: string;
  joinCode: string;
  hostId: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  players: Player[];
  createdAt: Date;
  endedAt?: Date;
  prizeMode?: PrizeMode;
}

export enum SessionStatus {
  WAITING = 'waiting',
  STARTED = 'started',
  QUESTION_ACTIVE = 'question_active',
  QUESTION_RESULTS = 'question_results',
  ENDED = 'ended',
}

// Player Types
export interface Player {
  id: string;
  sessionId: string;
  name: string;
  score: number;
  answers: Answer[];
  reactions: Reaction[];
  joinedAt: Date;
}

export interface Answer {
  questionId: string;
  answer: number | string | number[]; // number for MCQ/scale, string for numeric, array for multiple selections
  answeredAt: Date;
  isCorrect?: boolean;
  points?: number;
}

// Reaction Types
export enum ReactionType {
  THUMBS_UP = 'thumbs_up',
}

export interface Reaction {
  type: ReactionType;
  timestamp: Date;
}

// Leaderboard Types
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}

// Prize Mode Types
export enum PrizeMode {
  TOP_SCORE = 'top_score',
  RANDOM_RAFFLE = 'random_raffle',
  SPIN_WHEEL = 'spin_wheel',
  NONE = 'none',
}

export interface PrizeWinner {
  playerId: string;
  playerName: string;
  prizeMode: PrizeMode;
}

// WebSocket Event Types
export enum WSEventType {
  // Session events
  SESSION_CREATED = 'session:created',
  SESSION_STARTED = 'session:started',
  SESSION_ENDED = 'session:ended',

  // Player events
  PLAYER_JOINED = 'player:joined',
  PLAYER_LEFT = 'player:left',

  // Question events
  QUESTION_STARTED = 'question:started',
  QUESTION_ENDED = 'question:ended',

  // Answer events
  ANSWER_SUBMITTED = 'answer:submitted',

  // Reaction events
  REACTION_SENT = 'reaction:sent',

  // Leaderboard events
  LEADERBOARD_UPDATED = 'leaderboard:updated',

  // Prize events
  PRIZE_WINNER_SELECTED = 'prize:winner_selected',
}

export interface WSEvent<T = any> {
  type: WSEventType;
  payload: T;
  sessionId: string;
  timestamp: Date;
}

// Premium Features Types
export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  registeredAt: Date;
  trialEndsAt?: Date;
}

export enum UserTier {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface SessionHistory {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  playersCount: number;
  startedAt: Date;
  endedAt: Date;
  analytics: SessionAnalytics;
}

export interface SessionAnalytics {
  totalPlayers: number;
  averageScore: number;
  questionStats: QuestionStats[];
  engagementRate: number;
}

export interface QuestionStats {
  questionId: string;
  answerDistribution: Record<string, number>;
  averageResponseTime: number;
  correctAnswerRate: number;
}

// Branding Types
export interface Branding {
  userId: string;
  primaryColor?: string;
  logo?: string;
  customDomain?: string;
}

// Limits by tier
export const TIER_LIMITS = {
  [UserTier.FREE]: {
    maxPlayersPerSession: 50,
    maxQuestionsPerQuiz: 10,
    maxSessionsPerMonth: 5,
    sessionHistoryDays: 7,
    analytics: false,
    branding: false,
  },
  [UserTier.PREMIUM]: {
    maxPlayersPerSession: 500,
    maxQuestionsPerQuiz: 100,
    maxSessionsPerMonth: -1, // unlimited
    sessionHistoryDays: 365,
    analytics: true,
    branding: true,
  },
  [UserTier.ENTERPRISE]: {
    maxPlayersPerSession: -1, // unlimited
    maxQuestionsPerQuiz: -1, // unlimited
    maxSessionsPerMonth: -1, // unlimited
    sessionHistoryDays: -1, // unlimited
    analytics: true,
    branding: true,
  },
};
