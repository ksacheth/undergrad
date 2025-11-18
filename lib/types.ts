export type QuestionType = "subjective" | "numerical" | "mixed";
export type Difficulty = "easy" | "medium" | "hard";

export interface StyleSummary {
  commonVerbs: string[];
  averageMarksPerQuestion: number;
  typicalDifficulty: Difficulty;
}

export interface PracticeConfig {
  subject: string;
  topic: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  numQuestions: number;
  examStyle?: string;
  marksPattern?: string;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  marks?: number;
}

export interface QuestionEvaluation {
  score: number;
  maxScore: number;
  verdict: "Fully correct" | "Mostly correct" | "Partially correct" | "Incorrect" | "Off-topic";
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  conceptComparison: Array<{
    concept: string;
    status: "covered" | "partial" | "missing" | "wrong";
  }>;
}
