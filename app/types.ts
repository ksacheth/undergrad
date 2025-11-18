export type QuestionType = 'subjective' | 'numerical' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ConceptStatus = 'covered' | 'partial' | 'missing' | 'wrong';

export interface Question {
  id: string;
  text: string;
  marks?: number;
  difficulty: Difficulty;
}

export interface GenerateQuestionsRequest {
  subject: string;
  topic: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  numQuestions: number;
  examStyle?: string;
  marksPattern?: string;
  paperStyleSummary?: PaperStyleSummary;
}

export interface GenerateQuestionsResponse {
  questions: Question[];
  sessionId: string;
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

export interface ConceptComparisonItem {
  concept: string;
  status: ConceptStatus;
}

export interface EvaluateAnswerResponse {
  questionId: string;
  score: number;
  maxScore: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  conceptComparison: ConceptComparisonItem[];
}

export interface PaperStyleSummary {
  commonVerbs: string[];
  averageMarksPerQuestion: number;
  typicalDifficulty: Difficulty;
}

export interface UploadPapersResponse {
  styleSummary: PaperStyleSummary;
  fileCount: number;
  fileNames: string[];
}

export interface UploadedPaperInfo {
  fileName: string;
  status: 'processing' | 'processed' | 'failed';
}

export interface StudentAnswer {
  questionId: string;
  answer: string;
  evaluation?: EvaluateAnswerResponse;
  isEvaluating?: boolean;
}
