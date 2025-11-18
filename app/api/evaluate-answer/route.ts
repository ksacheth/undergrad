import { NextRequest, NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { createEvaluateAnswerPrompt } from "@/lib/prompts";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  // Parse JSON with specific error handling for malformed input
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid JSON in request body",
      },
      { status: 400 }
    );
  }

  try {
    const {
      subject,
      topic,
      questionId,
      questionText,
      studentAnswer,
      difficulty,
      marks,
    } = body;

    // Validate required fields
    if (!subject || !topic || !questionText || !studentAnswer || !difficulty) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: subject, topic, questionText, studentAnswer, difficulty",
        },
        { status: 400 }
      );
    }

    // Create prompt
    const prompt = createEvaluateAnswerPrompt({
      subject,
      topic,
      questionId: questionId || "unknown",
      questionText,
      studentAnswer,
      difficulty,
      marks,
    });

    // Call Gemini
    const result = await callGeminiJSON(prompt);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(
      error,
      "Error evaluating answer",
      "Failed to evaluate answer"
    );
  }
}
