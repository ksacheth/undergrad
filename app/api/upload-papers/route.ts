import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // For MVP, we're stubbing the PDF extraction
    // Return a mock styleSummary based on file count
    const styleSummary = {
      commonVerbs: [
        "analyze",
        "explain",
        "calculate",
        "derive",
        "prove",
        "discuss",
      ],
      averageMarksPerQuestion: 10,
      typicalDifficulty: "medium" as const,
      totalMarks: 100,
      questionCount: Math.floor(Math.random() * 5) + 8,
      styleNotes: `Style extracted from ${files.length} exam paper(s)`,
    };

    return NextResponse.json({ styleSummary });
  } catch (error) {
    console.error("Error uploading papers:", error);
    return NextResponse.json(
      {
        error: "Failed to upload papers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
