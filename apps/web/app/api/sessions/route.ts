import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateJoinCode } from '@yell/shared';
import { SessionSchema } from '@/lib/schemas';
import {
  getClientIp,
  checkRateLimitOrRespond,
  errorResponse,
  createWideEvent,
  finalizeWideEvent,
  type WideEvent,
} from '@/lib/api';
import { z } from 'zod';

declare global {
  var storage: {
    quizzes: Map<string, any>;
    sessions: Map<string, any>;
    players: Map<string, any>;
  };
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const event: WideEvent = createWideEvent(request, ip);

  try {
    const rateLimitError = await checkRateLimitOrRespond(ip, event);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const validatedData = SessionSchema.parse(body);

    const quiz = global.storage.quizzes.get(validatedData.quizId);
    if (!quiz) {
      // Enrich event with business context for not found error
      event.quiz_id = validatedData.quizId;
      event.error_type = 'QuizNotFound';
      event.status_code = 404;
      event.duration_ms = Date.now() - (event.startTime ?? Date.now());
      console.log(JSON.stringify(event));

      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const session = {
      id: uuidv4(),
      quizId: validatedData.quizId,
      joinCode: generateJoinCode(),
      hostId: validatedData.hostId || 'anonymous',
      status: 'waiting',
      currentQuestionIndex: -1,
      players: [],
      createdAt: new Date(),
      prizeMode: validatedData.prizeMode || 'top_score',
    };

    global.storage.sessions.set(session.id, session);

    // Enrich event with business context
    event.session_id = session.id;
    event.quiz_id = quiz.id;
    event.prize_mode = session.prizeMode;
    event.questions_count = quiz.questions.length;
    finalizeWideEvent(event, 201);

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Enrich event with validation error context
      event.error_type = 'ValidationError';
      event.error_field_count = error.issues.length;
      event.status_code = 400;
      event.duration_ms = Date.now() - (event.startTime ?? Date.now());
      console.log(JSON.stringify(event));

      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 },
      );
    }
    return errorResponse(error, event);
  }
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const event: WideEvent = createWideEvent(request, ip);

  try {
    const rateLimitError = await checkRateLimitOrRespond(ip, event);
    if (rateLimitError) return rateLimitError;

    const { searchParams } = new URL(request.url);
    const joinCode = searchParams.get('joinCode');

    if (joinCode) {
      // Validate join code input
      if (typeof joinCode !== 'string' || joinCode.length > 50) {
        event.error_type = 'InvalidJoinCode';
        event.status_code = 400;
        event.duration_ms = Date.now() - (event.startTime ?? Date.now());
        console.log(JSON.stringify(event));

        return NextResponse.json({ error: 'Invalid join code' }, { status: 400 });
      }

      const sessions = Array.from(global.storage.sessions.values());
      const session = sessions.find((s) => s.joinCode === joinCode.toLowerCase());

      if (!session) {
        event.error_type = 'SessionNotFound';
        event.join_code = joinCode;
        event.status_code = 404;
        event.duration_ms = Date.now() - (event.startTime ?? Date.now());
        console.log(JSON.stringify(event));

        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Enrich event with business context for successful lookup
      event.session_id = session.id;
      event.join_code = joinCode;
      event.players_count = session.players.length;
      finalizeWideEvent(event, 200);

      return NextResponse.json({ session });
    }

    const sessions = Array.from(global.storage.sessions.values());

    // Enrich event with business context
    event.sessions_count = sessions.length;
    event.query_type = 'list_all';
    finalizeWideEvent(event, 200);

    return NextResponse.json({ sessions });
  } catch (error) {
    return errorResponse(error, event);
  }
}
