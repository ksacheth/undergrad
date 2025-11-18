import { NextRequest, NextResponse } from "next/server";

interface GenerateQuestionsRequest {
  subject: string;
  topic: string;
  questionType: "subjective" | "numerical" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  examStyle?: string;
  marksPattern?: string;
  paperStyleSummary?: {
    commonVerbs: string[];
    averageMarksPerQuestion: number;
    typicalDifficulty: string;
  } | null;
}

interface GeneratedQuestion {
  id: string;
  text: string;
  marks?: number;
  difficulty: string;
}

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const deriveMarksList = (pattern?: string, fallbackMarks = 10) => {
  if (!pattern) return [];
  const numbers = pattern.match(/\d+/g)?.map((num) => Number(num)) ?? [];
  return numbers.length > 0 ? numbers : [fallbackMarks];
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateQuestionsRequest;

    if (!body.subject || !body.topic || !body.questionType || !body.numQuestions) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const marksList = deriveMarksList(body.marksPattern, body.paperStyleSummary?.averageMarksPerQuestion ?? 10);

    const questions: GeneratedQuestion[] = Array.from({ length: body.numQuestions }).map((_, index) => {
      const baseVerb = body.paperStyleSummary?.commonVerbs[index % (body.paperStyleSummary?.commonVerbs.length || 1)] ??
        ["Explain", "Discuss", "Derive", "Compare"][index % 4];
      const marks = marksList[index % (marksList.length || 1)];
      const styleTag = body.examStyle || "Generic";

      const questionText = `${baseVerb} how ${capitalize(body.topic)} fits within ${capitalize(
        body.subject
      )} at an undergraduate level. Highlight any ${body.questionType === "numerical" ? "calculations" : "theoretical insights"} and mimic ${styleTag.toLowerCase()} phrasing.`;

      return {
        id: `q${index + 1}`,
        text: questionText,
        marks,
        difficulty: body.difficulty,
      };
    });

    // TODO: Replace mock logic with real LLM call that follows the UNDERGRADUATE-level constraint.
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("generate-questions", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
