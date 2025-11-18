// Core types for the exam practice app

export type QuestionType = "subjective" | "numerical" | "mixed";
export type Difficulty = "easy" | "medium" | "hard";
export type ConceptStatus = "covered" | "partial" | "missing" | "wrong";
export type Verdict = "Fully correct" | "Mostly correct" | "Partially correct" | "Incorrect" | "Off-topic";

export interface Question {
  id: string;
  text: string;
  marks?: number;
}

export interface GenerateQuestionsRequest {
  subject: string;
  topic: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  numQuestions: number;
  examStyle?: string;
  marksPattern?: string;
  styleSummary?: StyleSummary;
}

export interface GenerateQuestionsResponse {
  questions: Question[];
}

export interface EvaluateAnswerRequest {
  subject: string;
  topic: string;
  questionId: string;
  questionText: string;
  studentAnswer: string;
  difficulty: Difficulty;
  marks?: number;
}

export interface ConceptComparison {
  concept: string;
  status: ConceptStatus;
}

export interface EvaluateAnswerResponse {
  score: number;
  maxScore: number;
  verdict: Verdict;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  conceptComparison: ConceptComparison[];
}

export interface StyleSummary {
  commonVerbs: string[];
  averageMarksPerQuestion: number;
  typicalDifficulty: Difficulty;
}

export interface UploadPapersResponse {
  styleSummary: StyleSummary;
}

// Client-side state types
export interface QuestionState extends Question {
  studentAnswer: string;
  evaluation?: EvaluateAnswerResponse;
  isEvaluating: boolean;
}

export interface ConfigFormData {
  subject: string;
  topic: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  numQuestions: number;
  examStyle: string;
  marksPattern: string;
}
