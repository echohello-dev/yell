import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateJoinCode } from '@yell/shared';

declare global {
  var storage: {
    quizzes: Map<string, any>;
    sessions: Map<string, any>;
    players: Map<string, any>;
  };
}

export async function POST(request: Request) {
  const body = await request.json();

  const quiz = global.storage.quizzes.get(body.quizId);
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  const session = {
    id: uuidv4(),
    quizId: body.quizId,
    joinCode: generateJoinCode(),
    hostId: body.hostId || 'anonymous',
    status: 'waiting',
    currentQuestionIndex: -1,
    players: [],
    createdAt: new Date(),
    prizeMode: body.prizeMode || 'none',
  };

  global.storage.sessions.set(session.id, session);

  return NextResponse.json({ session }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const joinCode = searchParams.get('joinCode');

  if (joinCode) {
    const sessions = Array.from(global.storage.sessions.values());
    const session = sessions.find((s) => s.joinCode === joinCode.toLowerCase());

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  }

  const sessions = Array.from(global.storage.sessions.values());
  return NextResponse.json({ sessions });
}
