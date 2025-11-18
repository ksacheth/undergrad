'use client';

import { useState } from 'react';
import type { Question, EvaluateAnswerResponse } from '@/app/types';
import FeedbackPanel from './FeedbackPanel';

interface QuestionCardProps {
  question: Question;
  studentAnswer: string;
  onAnswerChange: (answer: string) => void;
  onValidate: () => void;
  evaluation?: EvaluateAnswerResponse;
  isEvaluating?: boolean;
  index: number;
}

export default function QuestionCard({
  question,
  studentAnswer,
  onAnswerChange,
  onValidate,
  evaluation,
  isEvaluating,
  index,
}: QuestionCardProps) {
  const [showComparison, setShowComparison] = useState(false);

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Question Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Q{index + 1}
              {question.marks && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({question.marks} marks)
                </span>
              )}
            </h3>
            <p className="text-gray-700 mt-2 leading-relaxed">{question.text}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              difficultyColors[question.difficulty]
            }`}
          >
            {question.difficulty}
          </span>
        </div>
      </div>

      {/* Answer Section */}
      <div className="px-6 py-4 space-y-3">
        <label htmlFor={`answer-${question.id}`} className="block text-sm font-medium text-gray-700">
          Your Answer
        </label>
        <textarea
          id={`answer-${question.id}`}
          value={studentAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here. You can use multiple lines."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
        />
        <p className="text-xs text-gray-500">
          💡 Tip: LaTeX support will be available for mathematical expressions in future updates.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onValidate}
            disabled={!studentAnswer.trim() || isEvaluating}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
          >
            {isEvaluating ? 'Evaluating...' : 'Validate This Answer'}
          </button>
        </div>
      </div>

      {/* Feedback Section */}
      {evaluation && (
        <div className="border-t border-gray-200">
          <div
            className="px-6 py-3 bg-blue-50 cursor-pointer flex items-center justify-between hover:bg-blue-100 transition-colors"
            onClick={() => setShowComparison(!showComparison)}
          >
            <div>
              <p className="font-medium text-blue-900">
                Score: {evaluation.score} / {evaluation.maxScore} — {evaluation.verdict}
              </p>
            </div>
            <span className="text-blue-600">
              {showComparison ? '▼' : '▶'}
            </span>
          </div>

          {showComparison && (
            <FeedbackPanel evaluation={evaluation} studentAnswer={studentAnswer} />
          )}
        </div>
      )}
    </div>
  );
}
