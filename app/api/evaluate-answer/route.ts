import { NextRequest, NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { createAnswerEvaluationPrompt } from "@/lib/prompts";
import type {
  EvaluateAnswerRequest,
  EvaluateAnswerResponse,
} from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: EvaluateAnswerRequest = await request.json();

    // Validate required fields
    if (
      !body.subject ||
      !body.topic ||
      !body.questionId ||
      !body.questionText ||
      !body.studentAnswer ||
      !body.difficulty
    ) {
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

    // Validate response - check all required fields
    if (typeof response.score !== "number") {
      throw new Error("Invalid response: score must be a number");
    }
    if (typeof response.maxScore !== "number") {
      throw new Error("Invalid response: maxScore must be a number");
    }
    if (!response.verdict) {
      throw new Error("Invalid response: verdict is required");
    }
    if (!response.idealAnswer) {
      throw new Error("Invalid response: idealAnswer is required");
    }
    if (!Array.isArray(response.strengths) || response.strengths.length === 0) {
      throw new Error("Invalid response: strengths must be a non-empty array");
    }
    if (!response.strengths.every((s) => typeof s === "string")) {
      throw new Error("Invalid response: all strengths must be strings");
    }
    if (
      !Array.isArray(response.weaknesses) ||
      response.weaknesses.length === 0
    ) {
      throw new Error("Invalid response: weaknesses must be a non-empty array");
    }
    if (!response.weaknesses.every((w) => typeof w === "string")) {
      throw new Error("Invalid response: all weaknesses must be strings");
    }
    if (
      !Array.isArray(response.conceptComparison) ||
      response.conceptComparison.length === 0
    ) {
      throw new Error(
        "Invalid response: conceptComparison must be a non-empty array"
      );
    }
    if (
      !response.conceptComparison.every(
        (c) =>
          c && typeof c.concept === "string" && typeof c.status === "string"
      )
    ) {
      throw new Error(
        "Invalid response: all conceptComparison items must have concept and status strings"
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in evaluate-answer API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to evaluate answer",
      },
      { status: 500 }
    );
  }
}
