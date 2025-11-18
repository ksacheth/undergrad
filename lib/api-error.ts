import { NextResponse } from "next/server";

/**
 * Generates a unique error ID for correlation between client and server logs
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handles API errors by logging full details server-side and returning
 * a generic error response to the client to avoid leaking internal details.
 *
 * @param error - The error object to handle
 * @param contextMessage - A context message describing where the error occurred (e.g., "Error generating questions")
 * @param clientMessage - The generic message to return to the client (e.g., "Failed to generate questions")
 * @returns NextResponse with generic error and error ID
 */
export function handleApiError(
  error: unknown,
  contextMessage: string,
  clientMessage: string
): NextResponse {
  // Generate unique error ID for correlation
  const errorId = generateErrorId();

  // Log full error details server-side with error ID
  console.error(`[${errorId}] ${contextMessage}:`, error);
  if (error instanceof Error && error.stack) {
    console.error(`[${errorId}] Stack trace:`, error.stack);
  }

  // Return generic error to client without exposing internal details
  return NextResponse.json(
    {
      error: clientMessage,
      errorId,
    },
    { status: 500 }
  );
}
