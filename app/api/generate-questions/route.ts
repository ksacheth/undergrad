import { NextResponse } from "next/server";

import { callGeminiJSON } from "@/lib/gemini";
import { buildQuestionPrompt } from "@/lib/prompts";
import { GeneratedQuestion, PracticeConfig, StyleSummary } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PracticeConfig & {
      styleSummary?: StyleSummary | null;
    };

    if (!body.subject || !body.topic) {
      return NextResponse.json(
        { error: "Subject and topic are required" },
        { status: 400 }
      );
    }

    if (!body.numQuestions || body.numQuestions < 1 || body.numQuestions > 20) {
      return NextResponse.json(
        { error: "Number of questions must be between 1 and 20" },
        { status: 400 }
      );
    }

    const prompt = buildQuestionPrompt(body);
    const geminiResponse = await callGeminiJSON({ prompt });

    const questions = Array.isArray(geminiResponse?.questions)
      ? (geminiResponse.questions as GeneratedQuestion[])
      : [];

    if (!questions.length) {
      throw new Error("Gemini did not return any questions");
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("/api/generate-questions error", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
