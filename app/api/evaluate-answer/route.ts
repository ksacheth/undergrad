import { NextResponse } from "next/server";

import { callGeminiJSON } from "@/lib/gemini";
import { buildEvaluationPrompt } from "@/lib/prompts";
import { Difficulty, QuestionEvaluation } from "@/lib/types";

interface EvaluationRequestBody {
  subject: string;
  topic: string;
  questionId: string;
  questionText: string;
  studentAnswer: string;
  difficulty: Difficulty;
  marks?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvaluationRequestBody;

    if (!body.questionId || !body.questionText) {
      return NextResponse.json(
        { error: "Question id and text are required" },
        { status: 400 }
      );
    }

    const prompt = buildEvaluationPrompt({
      subject: body.subject,
      questionText: body.questionText,
      studentAnswer: body.studentAnswer,
      difficulty: body.difficulty,
      marks: body.marks,
    });

    const evaluation = (await callGeminiJSON({ prompt })) as QuestionEvaluation;

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("/api/evaluate-answer error", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
