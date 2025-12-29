import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['multiple_choice', 'poll', 'scale', 'numeric_guess']),
  title: z.string().min(1).max(500),
  timeLimit: z.number().int().min(5).max(300),
  points: z.number().int().min(0).max(100000),
  options: z.array(z.string().max(200)).optional(),
  correctAnswer: z.union([z.number(), z.string()]).optional(),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
  scaleLabels: z.object({ min: z.string(), max: z.string() }).optional(),
});

export const QuizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(QuestionSchema).min(1).max(100),
  createdBy: z.string().optional(),
  isPremium: z.boolean().optional(),
});

export const SessionSchema = z.object({
  quizId: z.string().uuid(),
  hostId: z.string().optional(),
  prizeMode: z.enum(['none', 'top_score', 'random_raffle', 'spin_wheel']).optional(),
});

export const JoinSessionSchema = z.object({
  sessionId: z.string().uuid(),
  playerName: z.string().min(1).max(100),
});

export const AnswerSubmitSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.string())]),
});
