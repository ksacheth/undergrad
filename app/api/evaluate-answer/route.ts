import { NextRequest, NextResponse } from "next/server";

interface EvaluateAnswerRequest {
  subject: string;
  topic: string;
  questionId: string;
  questionText: string;
  studentAnswer: string;
  difficulty: "easy" | "medium" | "hard";
  marks?: number;
}

interface EvaluationResponse {
  score: number;
  maxScore: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  conceptComparison: { concept: string; status: "covered" | "partial" | "missing" }[];
}

const verdictFromScore = (ratio: number) => {
  if (ratio > 0.85) return "Excellent";
  if (ratio > 0.6) return "Mostly correct";
  if (ratio > 0.4) return "Partial understanding";
  return "Needs work";
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EvaluateAnswerRequest;
    if (!body.studentAnswer?.trim()) {
      return NextResponse.json({ message: "Answer required" }, { status: 400 });
    }

    const maxScore = body.marks ?? 10;
    const answer = body.studentAnswer.trim();
    const wordCount = answer.split(/\s+/).length;
    const keywordHits = [body.topic, body.subject]
      .filter(Boolean)
      .map((value) => (value ? value.toLowerCase() : ""))
      .reduce((acc, keyword) => (answer.toLowerCase().includes(keyword) ? acc + 1 : acc), 0);

    const lengthScore = Math.min(wordCount / 50, 1) * 0.5;
    const keywordScore = (keywordHits / 2) * 0.3;
    const clarityScore = Math.min(answer.length / 400, 1) * 0.2;
    const finalScore = Math.max(1, Math.round((lengthScore + keywordScore + clarityScore) * maxScore));

    const strengths: string[] = [];
    if (wordCount > 60) strengths.push("Provided a detailed narrative.");
    if (keywordHits > 0) strengths.push("Referenced the core subject/topic.");
    if (answer.includes("balance") || answer.includes("derive")) strengths.push("Used appropriate academic language.");
    if (strengths.length === 0) strengths.push("Answer is concise and to the point.");

    const weaknesses: string[] = [];
    if (wordCount < 40) weaknesses.push("Expand your reasoning with more supporting details.");
    if (keywordHits === 0) weaknesses.push(`Explicitly mention ${body.topic} or related terminology.`);
    weaknesses.push("Include numeric values or diagrams where relevant (mock hint).");

    const conceptComparison: EvaluationResponse["conceptComparison"] = [
      { concept: "Definition", status: wordCount > 30 ? "covered" : "partial" },
      { concept: "Key steps", status: wordCount > 60 ? "covered" : "partial" },
      { concept: "Applications", status: keywordHits > 0 ? "covered" : "missing" },
    ];

    const response: EvaluationResponse = {
      score: Math.min(finalScore, maxScore),
      maxScore,
      verdict: verdictFromScore(finalScore / maxScore),
      strengths,
      weaknesses,
      idealAnswer: `An undergraduate-appropriate answer should define ${body.topic}, explain how it operates within ${body.subject}, mention why rotations/balance/assumptions matter, and end with complexity or application remarks.`,
      conceptComparison,
    };

    // TODO: Replace heuristic evaluator with a real UNDERGRADUATE-level LLM call.
    return NextResponse.json(response);
  } catch (error) {
    console.error("evaluate-answer", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
