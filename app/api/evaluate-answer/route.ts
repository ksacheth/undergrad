import { NextRequest, NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { createEvaluateAnswerPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
    if (
      !subject ||
      !topic ||
      !questionText ||
      !studentAnswer ||
      !difficulty
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: subject, topic, questionText, studentAnswer, difficulty",
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
    console.error("Error evaluating answer:", error);
    return NextResponse.json(
      {
        error: "Failed to evaluate answer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
