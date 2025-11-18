"use client";

import QuestionCard from "./QuestionCard";

interface Question {
  id: string;
  text: string;
  marks?: number;
  type?: string;
}

interface Evaluation {
  score: number;
  maxScore: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  conceptComparison: Array<{
    concept: string;
    status: "covered" | "partial" | "missing" | "wrong";
  }>;
}

interface QuestionWithAnswer extends Question {
  studentAnswer?: string;
  evaluation?: Evaluation;
  isEvaluating?: boolean;
}

interface QuestionsListProps {
  questions: QuestionWithAnswer[];
  onAnswerChange: (questionId: string, answer: string) => void;
  onEvaluateAnswer: (questionId: string) => void;
}

export default function QuestionsList({
  questions,
  onAnswerChange,
  onEvaluateAnswer,
}: QuestionsListProps) {
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          questionNumber={index + 1}
          question={question}
          onAnswerChange={onAnswerChange}
          onEvaluateAnswer={onEvaluateAnswer}
        />
      ))}
    </div>
  );
}
