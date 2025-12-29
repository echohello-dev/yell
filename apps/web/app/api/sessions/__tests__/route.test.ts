import { describe, it, expect, beforeEach } from 'vitest';

// Mock the global storage
declare global {
  var storage: {
    quizzes: Map<string, any>;
    sessions: Map<string, any>;
    players: Map<string, any>;
  };
}

describe('POST /api/sessions', () => {
  // Use valid UUID for test quiz
  const TEST_QUIZ_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const INVALID_QUIZ_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d470';

  beforeEach(() => {
    // Setup global storage mock
    global.storage = {
      quizzes: new Map(),
      sessions: new Map(),
      players: new Map(),
    };

    // Add a test quiz with valid UUID
    global.storage.quizzes.set(TEST_QUIZ_ID, {
      id: TEST_QUIZ_ID,
      title: 'Test Quiz',
      questions: [],
    });
  });

  it('should create a session with default prizeMode as top_score', async () => {
    // Import the route handler
    const { POST } = await import('../route');

    const request = new Request('http://localhost/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        quizId: TEST_QUIZ_ID,
        hostId: 'host-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.session).toBeDefined();
    expect(data.session.prizeMode).toBe('top_score');
  });

  it('should use provided prizeMode when specified', async () => {
    const { POST } = await import('../route');

    const request = new Request('http://localhost/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        quizId: TEST_QUIZ_ID,
        hostId: 'host-123',
        prizeMode: 'random_raffle',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.session.prizeMode).toBe('random_raffle');
  });

  it('should support spin_wheel prize mode', async () => {
    const { POST } = await import('../route');

    const request = new Request('http://localhost/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        quizId: TEST_QUIZ_ID,
        hostId: 'host-123',
        prizeMode: 'spin_wheel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.session.prizeMode).toBe('spin_wheel');
  });

  it('should support none prize mode', async () => {
    const { POST } = await import('../route');

    const request = new Request('http://localhost/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        quizId: TEST_QUIZ_ID,
        hostId: 'host-123',
        prizeMode: 'none',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.session.prizeMode).toBe('none');
  });

  it('should return 404 if quiz does not exist', async () => {
    const { POST } = await import('../route');

    const request = new Request('http://localhost/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        quizId: INVALID_QUIZ_ID,
        hostId: 'host-123',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
  });

  it('should initialize session with correct default values', async () => {
    const { POST } = await import('../route');

    const request = new Request('http://localhost/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        quizId: TEST_QUIZ_ID,
        hostId: 'host-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.session).toMatchObject({
      quizId: TEST_QUIZ_ID,
      hostId: 'host-123',
      status: 'waiting',
      currentQuestionIndex: -1,
      players: [],
      prizeMode: 'top_score',
    });
    expect(data.session.id).toBeDefined();
    expect(data.session.joinCode).toBeDefined();
    expect(data.session.createdAt).toBeDefined();
  });

  it('should store session in global storage', async () => {
    const { POST } = await import('../route');

    const request = new Request('http://localhost/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        quizId: TEST_QUIZ_ID,
        hostId: 'host-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(global.storage.sessions.has(data.session.id)).toBe(true);

    const storedSession = global.storage.sessions.get(data.session.id);
    expect(storedSession.id).toBe(data.session.id);
    expect(storedSession.quizId).toBe(data.session.quizId);
    expect(storedSession.hostId).toBe(data.session.hostId);
    expect(storedSession.prizeMode).toBe(data.session.prizeMode);
    expect(storedSession.status).toBe(data.session.status);
  });
});
