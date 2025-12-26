import { NextResponse } from 'next/server';

declare global {
  var storage: {
    quizzes: Map<string, any>;
    sessions: Map<string, any>;
    players: Map<string, any>;
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { sessionId, playerId, playerName } = body;

  const session = global.storage?.sessions?.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const player = {
    id: playerId,
    sessionId,
    name: playerName,
    score: 0,
    answers: [],
    reactions: [],
    joinedAt: new Date(),
  };

  global.storage.players.set(playerId, player);
  session.players.push(player);

  return NextResponse.json({ player }, { status: 201 });
}
