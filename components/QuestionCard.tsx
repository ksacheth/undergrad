"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

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

interface QuestionCardProps {
  questionNumber: number;
  question: QuestionWithAnswer;
  onAnswerChange: (questionId: string, answer: string) => void;
  onEvaluateAnswer: (questionId: string) => void;
}

function getVerdictColor(
  verdict: string
): "green" | "blue" | "yellow" | "red" | "gray" {
  switch (verdict) {
    case "Fully correct":
      return "green";
    case "Mostly correct":
      return "blue";
    case "Partially correct":
      return "yellow";
    case "Incorrect":
    case "Off-topic":
      return "red";
    default:
      return "gray";
  }
}

function getConceptStatusIcon(
  status: "covered" | "partial" | "missing" | "wrong"
): string {
  switch (status) {
    case "covered":
      return "✅";
    case "partial":
      return "⚠️";
    case "missing":
    case "wrong":
      return "❌";
    default:
      return "•";
  }
}

function MarkdownAnswer({ content }: { content?: string }) {
  if (!content) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500 italic">
        No answer provided.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3 overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function QuestionCard({
  questionNumber,
  question,
  onAnswerChange,
  onEvaluateAnswer,
}: QuestionCardProps) {
  const verdictColor = question.evaluation
    ? getVerdictColor(question.evaluation.verdict)
    : null;

  const verdictColorClass = {
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    gray: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
  };

  const verdictTextColor = {
    green: "text-green-800 dark:text-green-200",
    blue: "text-blue-800 dark:text-blue-200",
    yellow: "text-yellow-800 dark:text-yellow-200",
    red: "text-red-800 dark:text-red-200",
    gray: "text-gray-800 dark:text-gray-200",
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Question Header */}
      <div className="bg-zinc-50 dark:bg-zinc-800 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Q{questionNumber}
            </h3>
            <p className="text-zinc-800 dark:text-zinc-200 mt-2 leading-relaxed">
              {question.text}
            </p>
          </div>
          {question.marks && (
            <div className="shrink-0 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium whitespace-nowrap">
              {question.marks} marks
            </div>
          )}
        </div>
      </div>

      {/* Answer Input */}
      <div className="px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Your Answer:
        </label>
        <textarea
          value={question.studentAnswer || ""}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          placeholder="Enter your answer here..."
          className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white min-h-32 resize-vertical"
          disabled={question.isEvaluating}
        />
      </div>

      {/* Action Button */}
      <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => onEvaluateAnswer(question.id)}
          disabled={!question.studentAnswer || question.isEvaluating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center gap-2"
        >
          {question.isEvaluating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Evaluating...
            </>
          ) : (
            "Validate this Answer"
          )}
        </button>
      </div>

      {/* Evaluation Results */}
      {question.evaluation && (
        <div
          className={`px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 ${
            verdictColorClass[verdictColor!]
          }`}
        >
          {/* Score and Verdict */}
          <div className="mb-4 pb-4 border-b border-zinc-300 dark:border-zinc-600">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h4 className="font-semibold text-zinc-900 dark:text-white">
                Evaluation Result
              </h4>
              <span
                className={`text-2xl font-bold ${
                  verdictTextColor[verdictColor!]
                }`}
              >
                {question.evaluation.score}/{question.evaluation.maxScore}
              </span>
            </div>
            <p className={`font-medium ${verdictTextColor[verdictColor!]}`}>
              {question.evaluation.verdict}
            </p>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-zinc-300 dark:border-zinc-600">
            <div>
              <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                ✓ What You Did Well
              </h5>
              <ul className="space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
                {question.evaluation.strengths.map((strength, i) => (
                  <li key={i} className="flex gap-2">
                    <span>•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                ✗ What You Missed
              </h5>
              <ul className="space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
                {question.evaluation.weaknesses.map((weakness, i) => (
                  <li key={i} className="flex gap-2">
                    <span>•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Concept Comparison */}
          <div className="mb-4 pb-4 border-b border-zinc-300 dark:border-zinc-600">
            <h5 className="font-semibold text-zinc-900 dark:text-white mb-2">
              Concepts Covered
            </h5>
            <div className="flex flex-wrap gap-2">
              {question.evaluation.conceptComparison.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-700 rounded-full text-sm border border-zinc-200 dark:border-zinc-600"
                >
                  <span>{getConceptStatusIcon(item.status)}</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.concept}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Answer Comparison */}
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Your Answer
              </h5>
              <MarkdownAnswer content={question.studentAnswer} />
            </div>
            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Ideal Answer
              </h5>
              <MarkdownAnswer content={question.evaluation.idealAnswer} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
