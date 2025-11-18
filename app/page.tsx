"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ConfigForm from "@/components/ConfigForm";
import QuestionsList from "@/components/QuestionsList";

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

interface StyleSummary {
  commonVerbs?: string[];
  averageMarksPerQuestion?: number;
  typicalDifficulty?: string;
  totalMarks?: number;
  questionCount?: number;
  styleNotes?: string;
}

interface ConfigData {
  subject: string;
  topic: string;
  questionType: "subjective" | "numerical" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  examStyle?: string;
  marksPattern?: string;
  styleSummary?: StyleSummary;
}

export default function Home() {
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [configData, setConfigData] = useState<ConfigData | null>(null);

  const handleGenerateQuestions = async (config: ConfigData) => {
    setConfigData(config);
    setIsGenerating(true);
    setQuestions([]);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(
        data.questions.map((q: Question) => ({
          ...q,
          studentAnswer: "",
          evaluation: undefined,
        }))
      );
    } catch (error) {
      console.error("Error generating questions:", error);
      alert(
        "Failed to generate questions. Please check your API key and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, studentAnswer: answer } : q
      )
    );
  };

  const handleEvaluateAnswer = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.studentAnswer) {
      alert("Please enter an answer before evaluating");
      return;
    }

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, isEvaluating: true } : q
      )
    );

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: configData?.subject,
          topic: configData?.topic,
          questionId,
          questionText: question.text,
          studentAnswer: question.studentAnswer,
          difficulty: configData?.difficulty,
          marks: question.marks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate answer");
      }

      const evaluation = await response.json();
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, evaluation, isEvaluating: false }
            : q
        )
      );
    } catch (error) {
      console.error("Error evaluating answer:", error);
      alert("Failed to evaluate answer. Please try again.");
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, isEvaluating: false } : q
        )
      );
    }
  };

  const handleValidateAll = async () => {
    const unansweredQuestions = questions.filter((q) => !q.studentAnswer);
    if (unansweredQuestions.length > 0) {
      alert("Please answer all questions before validating");
      return;
    }

    for (const question of questions) {
      if (!question.evaluation) {
        await handleEvaluateAnswer(question.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ConfigForm onGenerateQuestions={handleGenerateQuestions} isLoading={isGenerating} />

        {isGenerating && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {questions.length > 0 && !isGenerating && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Practice Session</h2>
              <button
                onClick={handleValidateAll}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                Validate All Answers
              </button>
            </div>
            <QuestionsList
              questions={questions}
              onAnswerChange={handleAnswerChange}
              onEvaluateAnswer={handleEvaluateAnswer}
            />
          </>
        )}

        {!isGenerating && questions.length === 0 && (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <p className="text-lg">
              Fill the form above and click &quot;Generate Questions&quot; to start practicing
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
