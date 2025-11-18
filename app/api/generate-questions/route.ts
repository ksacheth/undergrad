import { NextRequest, NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { createGenerateQuestionsPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
          error: "Missing required fields: subject, topic, questionType, difficulty, numQuestions",
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
    console.error("Error generating questions:", error);
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
