import { NextResponse } from "next/server";

import { Difficulty, StyleSummary } from "@/lib/types";

const fallbackVerbs = [
  "discuss",
  "derive",
  "justify",
  "compare",
  "design",
  "evaluate",
  "outline",
];

export async function POST(request: Request) {
  const formData = await request.formData();
  const fileEntries = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (fileEntries.length === 0) {
    return NextResponse.json({
      styleSummary: null,
      note: "No files supplied, skipping style summary",
    });
  }

  const totalSize = fileEntries.reduce((acc, file) => acc + file.size, 0);
  const averageMarks = Math.min(20, Math.max(2, Math.round(totalSize / fileEntries.length / 1024)));
  const typicalDifficulty: Difficulty = averageMarks > 12 ? "hard" : averageMarks > 7 ? "medium" : "easy";
  const randomVerbs = fallbackVerbs.sort(() => 0.5 - Math.random()).slice(0, 3);

  const styleSummary: StyleSummary = {
    commonVerbs: randomVerbs,
    averageMarksPerQuestion: averageMarks,
    typicalDifficulty,
  };

  return NextResponse.json({ styleSummary, uploaded: fileEntries.length });
}
