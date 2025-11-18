import { NextRequest, NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { createQuestionGenerationPrompt } from "@/lib/prompts";
import type { GenerateQuestionsRequest, GenerateQuestionsResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateQuestionsRequest = await request.json();

    // Validate required fields
    if (!body.subject || !body.topic || !body.questionType || !body.difficulty || !body.numQuestions) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate numQuestions range
    if (body.numQuestions < 1 || body.numQuestions > 20) {
      return NextResponse.json(
        { error: "Number of questions must be between 1 and 20" },
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
    const prompt = createQuestionGenerationPrompt(body);

    // Call Gemini API
    const response = await callGeminiJSON<GenerateQuestionsResponse>(prompt);

    // Validate response
    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from Gemini");
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in generate-questions API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate questions" },
      { status: 500 }
    );
  }
}
