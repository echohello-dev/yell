import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

declare global {
  var storage: {
    quizzes: Map<string, any>;
    sessions: Map<string, any>;
    players: Map<string, any>;
  };
}

export async function GET() {
  const quizzes = Array.from(global.storage.quizzes.values());
  return NextResponse.json({ quizzes });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const quiz = {
    id: uuidv4(),
    title: body.title,
    description: body.description,
    questions: body.questions || [],
    createdBy: body.createdBy || 'anonymous',
    createdAt: new Date(),
    isPremium: body.isPremium || false
  };
  
  global.storage.quizzes.set(quiz.id, quiz);
  
  return NextResponse.json({ quiz }, { status: 201 });
}
