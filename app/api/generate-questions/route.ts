import { NextRequest, NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { createGenerateQuestionsPrompt } from "@/lib/prompts";
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
      questionType,
      difficulty,
      numQuestions,
      examStyle,
      marksPattern,
      styleSummary,
    } = body;

    // Validate required fields
    if (!subject || !topic || !questionType || !difficulty || !numQuestions) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: subject, topic, questionType, difficulty, numQuestions",
        },
        { status: 400 }
      );
    }

    // Create prompt
    const prompt = createGenerateQuestionsPrompt({
      subject,
      topic,
      questionType,
      difficulty,
      numQuestions,
      examStyle,
      marksPattern,
      styleSummary,
    });

    // Call Gemini
    const result = await callGeminiJSON(prompt);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(
      error,
      "Error generating questions",
      "Failed to generate questions"
    );
  }
}
