import { describe, it, expect } from 'vitest';
import {
  QuestionSchema,
  QuizSchema,
  SessionSchema,
  JoinSessionSchema,
  AnswerSubmitSchema,
} from '../schemas';

describe('Zod Validation Schemas', () => {
  describe('QuestionSchema', () => {
    it('should validate a valid question', () => {
      const validQuestion = {
        id: '1',
        type: 'multiple_choice' as const,
        title: 'What is 2+2?',
        timeLimit: 30,
        points: 10,
        options: ['3', '4', '5'],
        correctAnswer: 1,
      };

      const result = QuestionSchema.safeParse(validQuestion);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidQuestion = {
        id: '1',
        type: 'multiple_choice' as const,
        title: '',
        timeLimit: 30,
        points: 10,
      };

      const result = QuestionSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('should reject title exceeding 500 characters', () => {
      const invalidQuestion = {
        id: '1',
        type: 'multiple_choice' as const,
        title: 'a'.repeat(501),
        timeLimit: 30,
        points: 10,
      };

      const result = QuestionSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('should reject invalid timeLimit (< 5)', () => {
      const invalidQuestion = {
        id: '1',
        type: 'multiple_choice' as const,
        title: 'Valid Question',
        timeLimit: 4,
        points: 10,
      };

      const result = QuestionSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('should reject invalid timeLimit (> 300)', () => {
      const invalidQuestion = {
        id: '1',
        type: 'multiple_choice' as const,
        title: 'Valid Question',
        timeLimit: 301,
        points: 10,
      };

      const result = QuestionSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('should validate all question types', () => {
      const types = ['multiple_choice', 'poll', 'scale', 'numeric_guess'] as const;

      types.forEach((type) => {
        const question = {
          id: '1',
          type,
          title: 'Test Question',
          timeLimit: 30,
          points: 10,
        };

        const result = QuestionSchema.safeParse(question);
        expect(result.success).toBe(true);
      });
    });

    it('should reject options with strings exceeding 200 characters', () => {
      const invalidQuestion = {
        id: '1',
        type: 'multiple_choice' as const,
        title: 'Valid Question',
        timeLimit: 30,
        points: 10,
        options: ['a'.repeat(201)],
      };

      const result = QuestionSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });
  });

  describe('QuizSchema', () => {
    it('should validate a valid quiz', () => {
      const validQuiz = {
        title: 'Math Quiz',
        description: 'Test your math skills',
        questions: [
          {
            id: '1',
            type: 'multiple_choice' as const,
            title: 'What is 2+2?',
            timeLimit: 30,
            points: 10,
          },
        ],
      };

      const result = QuizSchema.safeParse(validQuiz);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidQuiz = {
        title: '',
        questions: [
          {
            id: '1',
            type: 'multiple_choice' as const,
            title: 'Question',
            timeLimit: 30,
            points: 10,
          },
        ],
      };

      const result = QuizSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it('should reject title exceeding 200 characters', () => {
      const invalidQuiz = {
        title: 'a'.repeat(201),
        questions: [
          {
            id: '1',
            type: 'multiple_choice' as const,
            title: 'Question',
            timeLimit: 30,
            points: 10,
          },
        ],
      };

      const result = QuizSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it('should reject description exceeding 1000 characters', () => {
      const invalidQuiz = {
        title: 'Valid Title',
        description: 'a'.repeat(1001),
        questions: [
          {
            id: '1',
            type: 'multiple_choice' as const,
            title: 'Question',
            timeLimit: 30,
            points: 10,
          },
        ],
      };

      const result = QuizSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it('should reject quiz with no questions', () => {
      const invalidQuiz = {
        title: 'Valid Title',
        questions: [],
      };

      const result = QuizSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it('should reject quiz with more than 100 questions', () => {
      const questions = Array(101)
        .fill(null)
        .map((_, i) => ({
          id: String(i),
          type: 'multiple_choice' as const,
          title: 'Question',
          timeLimit: 30,
          points: 10,
        }));

      const invalidQuiz = {
        title: 'Valid Title',
        questions,
      };

      const result = QuizSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });
  });

  describe('SessionSchema', () => {
    it('should validate a valid session', () => {
      const validSession = {
        quizId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        hostId: 'host-123',
        prizeMode: 'top_score' as const,
      };

      const result = SessionSchema.safeParse(validSession);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for quizId', () => {
      const invalidSession = {
        quizId: 'not-a-uuid',
        hostId: 'host-123',
      };

      const result = SessionSchema.safeParse(invalidSession);
      expect(result.success).toBe(false);
    });

    it('should validate all prize modes', () => {
      const modes = ['none', 'top_score', 'random_raffle', 'spin_wheel'] as const;

      modes.forEach((mode) => {
        const session = {
          quizId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          prizeMode: mode,
        };

        const result = SessionSchema.safeParse(session);
        expect(result.success).toBe(true);
      });
    });

    it('should accept session without optional fields', () => {
      const minimalSession = {
        quizId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      };

      const result = SessionSchema.safeParse(minimalSession);
      expect(result.success).toBe(true);
    });
  });

  describe('JoinSessionSchema', () => {
    it('should validate a valid join session request', () => {
      const validJoin = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        playerName: 'Alice',
      };

      const result = JoinSessionSchema.safeParse(validJoin);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for sessionId', () => {
      const invalidJoin = {
        sessionId: 'invalid-id',
        playerName: 'Alice',
      };

      const result = JoinSessionSchema.safeParse(invalidJoin);
      expect(result.success).toBe(false);
    });

    it('should reject empty playerName', () => {
      const invalidJoin = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        playerName: '',
      };

      const result = JoinSessionSchema.safeParse(invalidJoin);
      expect(result.success).toBe(false);
    });

    it('should reject playerName exceeding 100 characters', () => {
      const invalidJoin = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        playerName: 'a'.repeat(101),
      };

      const result = JoinSessionSchema.safeParse(invalidJoin);
      expect(result.success).toBe(false);
    });

    it('should allow playerName with special characters', () => {
      const validJoin = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        playerName: 'Alice-123_🎉',
      };

      const result = JoinSessionSchema.safeParse(validJoin);
      expect(result.success).toBe(true);
    });
  });

  describe('AnswerSubmitSchema', () => {
    it('should validate string answer', () => {
      const validAnswer = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        questionId: 'q1',
        answer: 'option-a',
      };

      const result = AnswerSubmitSchema.safeParse(validAnswer);
      expect(result.success).toBe(true);
    });

    it('should validate number answer', () => {
      const validAnswer = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        questionId: 'q1',
        answer: 42,
      };

      const result = AnswerSubmitSchema.safeParse(validAnswer);
      expect(result.success).toBe(true);
    });

    it('should validate array answer', () => {
      const validAnswer = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        questionId: 'q1',
        answer: ['option-a', 'option-b'],
      };

      const result = AnswerSubmitSchema.safeParse(validAnswer);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for sessionId', () => {
      const invalidAnswer = {
        sessionId: 'invalid-id',
        questionId: 'q1',
        answer: 'option-a',
      };

      const result = AnswerSubmitSchema.safeParse(invalidAnswer);
      expect(result.success).toBe(false);
    });

    it('should reject missing questionId', () => {
      const invalidAnswer = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        answer: 'option-a',
      };

      const result = AnswerSubmitSchema.safeParse(invalidAnswer);
      expect(result.success).toBe(false);
    });

    it('should reject missing answer', () => {
      const invalidAnswer = {
        sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        questionId: 'q1',
      };

      const result = AnswerSubmitSchema.safeParse(invalidAnswer);
      expect(result.success).toBe(false);
    });
  });
});
