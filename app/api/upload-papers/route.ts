import { NextRequest, NextResponse } from "next/server";

interface UploadResponse {
  styleSummary: {
    commonVerbs: string[];
    averageMarksPerQuestion: number;
    typicalDifficulty: string;
  };
  files: { name: string; size: number }[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("papers")
      .filter((file): file is File => file instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    const verbsPool = ["Explain", "State and prove", "Derive", "Compare", "Discuss"];
    const derivedVerbs = verbsPool.slice(0, Math.min(files.length + 2, verbsPool.length));

    const styleSummary: UploadResponse["styleSummary"] = {
      commonVerbs: derivedVerbs,
      averageMarksPerQuestion: 6 + files.length * 2,
      typicalDifficulty: files.length > 2 ? "medium" : "easy",
    };

    const response: UploadResponse = {
      styleSummary,
      files: files.map((file) => ({ name: file.name, size: file.size })),
    };

    // TODO: Replace stub with PDF parsing + UNDERGRADUATE exam-style extraction.
    return NextResponse.json(response);
  } catch (error) {
    console.error("upload-papers", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
