import { Difficulty, PracticeConfig, StyleSummary } from "./types";

type QuestionPromptArgs = PracticeConfig & { styleSummary?: StyleSummary | null };

export function buildQuestionPrompt(args: QuestionPromptArgs) {
  const {
    subject,
    topic,
    questionType,
    difficulty,
    numQuestions,
    examStyle,
    marksPattern,
    styleSummary,
  } = args;
  return `You are an exam setter for UNDERGRADUATE courses.\n\nGenerate ${numQuestions} new exam questions for the subject "${subject}" and topic "${topic}".\n\nQuestion type: ${questionType}.\n\nDifficulty: ${difficulty} at UNDERGRAD level (not school, not research).\n\nExam style: ${examStyle || "generic undergrad exam"}.\n\nMarks pattern: ${
    marksPattern || "use reasonable marks based on difficulty"
  }.\n\nIf a style summary is provided, mimic its phrasing without copying questions.\n\nStyle summary: ${
    styleSummary ? JSON.stringify(styleSummary) : "none"
  }.\n\nReturn ONLY valid JSON in the following format and nothing else:\n{\n  "questions": [\n    { "id": "q1", "text": "question text here", "marks": 10 }\n  ]\n}`;
}

type EvaluationPromptArgs = {
  subject: string;
  questionText: string;
  studentAnswer: string;
  difficulty: Difficulty;
  marks?: number;
};

export function buildEvaluationPrompt(args: EvaluationPromptArgs) {
  const maxScore = args.marks ?? 10;
  return `You are an experienced examiner for UNDERGRADUATE exams in ${args.subject}.\n\nEvaluate the student's answer to the following question.\n\nQuestion:\n"${args.questionText}"\n\nStudent answer:\n"${args.studentAnswer || "(no answer provided)"}"\n\nAssume difficulty level: ${args.difficulty} (undergrad).\nMaximum marks for this question: ${maxScore}.\n\nYour tasks:\n1. Decide a score from 0 to maxScore.\n2. Explain what the student did well (strengths).\n3. Explain what is missing, incorrect, or unclear (weaknesses).\n4. Provide a concise but complete IDEAL ANSWER.\n5. Identify key concepts and mark each as "covered", "partial", "missing", or "wrong".\n\nRespond ONLY with JSON in this format:\n{\n  "score": number,\n  "maxScore": number,\n  "verdict": "Fully correct" | "Mostly correct" | "Partially correct" | "Incorrect" | "Off-topic",\n  "strengths": string[],\n  "weaknesses": string[],\n  "idealAnswer": string,\n  "conceptComparison": [\n    { "concept": string, "status": "covered" | "partial" | "missing" | "wrong" }\n  ]\n}`;
}
