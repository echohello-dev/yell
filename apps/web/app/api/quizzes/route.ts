import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { QuizSchema } from '@/lib/schemas';
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

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const event: WideEvent = createWideEvent(request, ip);

  try {
    const rateLimitError = await checkRateLimitOrRespond(ip, event);
    if (rateLimitError) return rateLimitError;

    const quizzes = Array.from(global.storage.quizzes.values());

    // Enrich event with business context before finalizing
    event.quizzes_count = quizzes.length;
    finalizeWideEvent(event, 200);

    return NextResponse.json({ quizzes });
  } catch (error) {
    return errorResponse(error, event);
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const event: WideEvent = createWideEvent(request, ip);

  try {
    const rateLimitError = await checkRateLimitOrRespond(ip, event);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const validatedData = QuizSchema.parse(body);

    const quiz = {
      id: uuidv4(),
      ...validatedData,
      createdAt: new Date(),
    };

    global.storage.quizzes.set(quiz.id, quiz);

    // Enrich event with business context
    event.quiz_id = quiz.id;
    event.questions_count = validatedData.questions.length;
    finalizeWideEvent(event, 201);

    return NextResponse.json({ quiz }, { status: 201 });
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
