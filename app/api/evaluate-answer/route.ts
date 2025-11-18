import { NextRequest, NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { createAnswerEvaluationPrompt } from "@/lib/prompts";
import type { EvaluateAnswerRequest, EvaluateAnswerResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: EvaluateAnswerRequest = await request.json();

    // Validate required fields
    if (!body.subject || !body.topic || !body.questionId || !body.questionText || !body.studentAnswer || !body.difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Generate prompt
    const prompt = createAnswerEvaluationPrompt(body);

    // Call Gemini API
    const response = await callGeminiJSON<EvaluateAnswerResponse>(prompt);

    // Validate response
    if (typeof response.score !== "number" || !response.verdict || !response.idealAnswer) {
      throw new Error("Invalid response format from Gemini");
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in evaluate-answer API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
