export interface GenerateQuestionsInput {
  subject: string;
  topic: string;
  questionType: "subjective" | "numerical" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  examStyle?: string;
  marksPattern?: string;
  styleSummary?: object;
}

export function createGenerateQuestionsPrompt(
  input: GenerateQuestionsInput
): string {
  const {
    subject,
    topic,
    questionType,
    difficulty,
    numQuestions,
    examStyle,
    marksPattern,
    styleSummary,
  } = input;

  return `You are an exam setter for UNDERGRADUATE courses.

Generate ${numQuestions} new exam questions for the subject "${subject}" and topic "${topic}".

Question type: ${questionType}.

Difficulty: ${difficulty} at UNDERGRAD level (not school, not research).

Exam style: ${examStyle || "generic undergrad exam"}.

${marksPattern ? `Marks pattern: ${marksPattern}.` : ""}

${
  styleSummary
    ? `Style summary to mimic (without copying actual questions): ${JSON.stringify(
        styleSummary
      )}.`
    : "No previous exam papers provided."
}

For each question, assign appropriate marks (typically 5, 10, or 15 marks depending on difficulty and exam style).

Return ONLY valid JSON in the following format and nothing else:

{
  "questions": [
    {
      "id": "q1",
      "text": "question text here",
      "marks": 10,
      "type": "${questionType}"
    },
    ...
  ]
}`;
}

export interface EvaluateAnswerInput {
  subject: string;
  topic: string;
  questionId: string;
  questionText: string;
  studentAnswer: string;
  difficulty: "easy" | "medium" | "hard";
  marks?: number;
}

export function createEvaluateAnswerPrompt(input: EvaluateAnswerInput): string {
  const {
    subject,
    topic,
    questionText,
    studentAnswer,
    difficulty,
    marks: maxMarks,
  } = input;

  const actualMaxMarks = maxMarks ?? 10;

  return `You are an experienced examiner for UNDERGRADUATE exams in ${subject} (topic: ${topic}).

Evaluate the student's answer to the following question.

Question:
"${questionText}"

Student answer:
"${studentAnswer}"

Assume difficulty level: ${difficulty} (undergrad level - not school, not research).

Maximum marks for this question: ${actualMaxMarks}.

Your tasks:
1. Decide a score from 0 to ${actualMaxMarks} (must be a number).
2. Explain what the student did well (list 2-3 strengths).
3. Explain what is missing, incorrect, or unclear (list 2-3 weaknesses).
4. Provide a concise but complete IDEAL ANSWER (what a full-marks answer should contain).
5. Identify key concepts and mark each as "covered", "partial", "missing", or "wrong" (provide 3-5 concepts).

Respond ONLY with JSON in this format and nothing else:

{
  "score": 8,
  "maxScore": ${actualMaxMarks},
  "verdict": "Mostly correct",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "idealAnswer": "The ideal answer should contain...",
  "conceptComparison": [
    {
      "concept": "concept name",
      "status": "covered"
    }
  ]
}`;
}

export function createPaperAnalysisPrompt(pdfText: string): string {
  return `Analyze the following exam paper text and extract the writing style, common question patterns, and grading metrics.

Paper text:
${pdfText}

Return ONLY valid JSON in this format:

{
  "commonVerbs": ["analyze", "explain", "calculate"],
  "averageMarksPerQuestion": 10,
  "typicalDifficulty": "medium",
  "totalMarks": 100,
  "questionCount": 10,
  "styleNotes": "Description of the exam style"
}`;
}
