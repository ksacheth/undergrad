import { NextRequest, NextResponse } from 'next/server';
import type { UploadPapersResponse, PaperStyleSummary } from '@/app/types';

function generateMockStyleSummary(fileCount: number): PaperStyleSummary {
  // Mock style analysis based on file count (simulating different papers having different patterns)
  const verbOptions = [
    ['Explain', 'Describe', 'Discuss'],
    ['State', 'Prove', 'Derive'],
    ['Analyze', 'Compare', 'Evaluate'],
  ];

  const selectedVerbs = verbOptions[fileCount % verbOptions.length];

  // Mock average marks based on file count
  const averageMarks = 8 + ((fileCount * 2) % 7);

  // Mock typical difficulty
  const difficultyOptions: Array<'easy' | 'medium' | 'hard'> = [
    'easy',
    'medium',
    'hard',
  ];
  const typicalDifficulty = difficultyOptions[fileCount % 3];

  return {
    commonVerbs: selectedVerbs,
    averageMarksPerQuestion: averageMarks,
    typicalDifficulty,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract all file entries
    const fileEntries = formData.getAll('files');

    if (!fileEntries || fileEntries.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // TODO: Implement actual PDF parsing logic
    // Options:
    // 1. Use 'pdf-parse' npm package for text extraction
    // 2. Use 'pdfjs-dist' for more control
    // 3. Send to a Python/external service for OCR + parsing
    //
    // Current implementation stubs the parsing.
    // In production:
    // - Extract text from PDFs
    // - Analyze question patterns (verbs, marks, difficulty distribution)
    // - Return realistic styleSummary

    const fileNames: string[] = [];

    for (const file of fileEntries) {
      if (file instanceof File) {
        // Validate file type
        if (!file.type.includes('pdf')) {
          console.warn(`Skipping non-PDF file: ${file.name}`);
          continue;
        }
        fileNames.push(file.name);
      }
    }

    if (fileNames.length === 0) {
      return NextResponse.json(
        { error: 'No valid PDF files provided' },
        { status: 400 }
      );
    }

    const styleSummary = generateMockStyleSummary(fileNames.length);

    const response: UploadPapersResponse = {
      styleSummary,
      fileCount: fileNames.length,
      fileNames,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading papers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
