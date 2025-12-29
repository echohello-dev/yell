import { NextResponse } from 'next/server';
import { checkApiRateLimit } from './rateLimit';

/**
 * Wide event for canonical log line logging (https://loggingsucks.com/)
 * Accumulates request, user, business, infrastructure, error, and performance context
 * Emitted once per request with all debugging information attached
 */
interface WideEventBase {
  timestamp: string;
  request_id: string;
  startTime?: number;

  // Request context
  method: string;
  path: string;
  status_code?: number;
  duration_ms?: number;

  // Infrastructure context
  ip: string;
  service: string;
  version: string;

  // Rate limiting context
  rate_limit_checked?: boolean;
  rate_limit_passed?: boolean;

  // Error context
  error?: {
    type: string;
    message: string;
    code?: string;
  };
}

/**
 * Business context fields added during request processing
 * Route handlers extend WideEventBase with these
 */
interface BusinessContext {
  // Session/Quiz context
  session_id?: string;
  quiz_id?: string;
  join_code?: string;
  prize_mode?: string;

  // Counts
  quizzes_count?: number;
  sessions_count?: number;
  questions_count?: number;
  players_count?: number;
  error_field_count?: number;

  // Query context
  query_type?: string;
  error_type?: string;
}

export type WideEvent = WideEventBase & BusinessContext;

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Emit a wide event (canonical log line) with all context
 * One comprehensive event per request instead of scattered log statements
 */
function logWideEvent(event: WideEvent): void {
  console.log(JSON.stringify(event));
}

/**
 * Extract client IP from request headers
 * Checks x-forwarded-for first (for proxied requests), falls back to unknown
 */
export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for') || 'unknown';
}

/**
 * Check rate limit and return error response if exceeded
 * Returns null if check passes, error response if check fails
 */
export async function checkRateLimitOrRespond(
  ip: string,
  event: WideEvent,
): Promise<NextResponse | null> {
  const allowed = await checkApiRateLimit(ip);

  // Enrich event with rate limit context
  event.rate_limit_checked = true;
  event.rate_limit_passed = allowed;

  if (!allowed) {
    // Add error context
    event.status_code = 429;
    event.error = {
      type: 'RateLimitError',
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
    };

    // Emit wide event on rate limit failure
    event.duration_ms = 1;
    logWideEvent(event);

    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  return null;
}

/**
 * Format error response with proper status code and logging
 * Enriches wide event with error context before emitting
 */
export function errorResponse(
  error: unknown,
  event: WideEvent,
  status: number = 500,
): NextResponse {
  // Extract error information
  let errorType = 'UnknownError';
  let errorMessage = 'An unexpected error occurred';
  let errorCode: string | undefined;

  if (error instanceof Error) {
    errorType = error.name || 'Error';
    errorMessage = error.message;
    errorCode = (error as any).code;
  }

  // Enrich event with error context
  event.status_code = status;
  event.error = {
    type: errorType,
    message: errorMessage,
    code: errorCode,
  };

  const statusText =
    status === 400 ? 'Bad Request' : status === 404 ? 'Not Found' : 'Internal Server Error';

  // Emit wide event with error context
  logWideEvent(event);

  return NextResponse.json({ error: statusText }, { status });
}

/**
 * Create a wide event for a request
 * Initialize with request and infrastructure context
 * Call at the beginning of request handlers
 */
export function createWideEvent(request: Request, ip: string): WideEvent {
  const url = new URL(request.url);

  return {
    timestamp: new Date().toISOString(),
    request_id: generateRequestId(),
    method: request.method,
    path: url.pathname,
    ip,
    service: 'yell-api',
    version: process.env.VERSION || '0.0.1',
    startTime: Date.now(),
  };
}

/**
 * Finalize and emit a wide event after request completes
 * Calculates duration and logs the complete event with all context
 */
export function finalizeWideEvent(event: WideEvent, statusCode: number = 200): void {
  event.duration_ms = Date.now() - (event.startTime ?? Date.now());
  if (!event.status_code) {
    event.status_code = statusCode;
  }

  logWideEvent(event);
}
