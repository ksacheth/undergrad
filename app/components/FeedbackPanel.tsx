'use client';

import type { EvaluateAnswerResponse } from '@/app/types';

interface FeedbackPanelProps {
  evaluation: EvaluateAnswerResponse;
  studentAnswer: string;
}

export default function FeedbackPanel({
  evaluation,
  studentAnswer,
}: FeedbackPanelProps) {
  const getConceptIcon = (status: string) => {
    switch (status) {
      case 'covered':
        return '✅';
      case 'partial':
        return '⚠️';
      case 'missing':
      case 'wrong':
        return '❌';
      default:
        return '○';
    }
  };

  return (
    <div className="px-6 py-4 space-y-6">
      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div>
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <span className="text-lg">✓</span> What you did well
          </h4>
          <ul className="space-y-2">
            {evaluation.strengths.map((strength, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 bg-green-50 border-l-4 border-green-400 px-3 py-2 rounded"
              >
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div>
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <span className="text-lg">✕</span> What you missed
          </h4>
          <ul className="space-y-2">
            {evaluation.weaknesses.map((weakness, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 bg-red-50 border-l-4 border-red-400 px-3 py-2 rounded"
              >
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Concept Coverage */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Concept Coverage</h4>
        <div className="flex flex-wrap gap-2">
          {evaluation.conceptComparison.map((concept, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-800"
            >
              {getConceptIcon(concept.status)} {concept.concept}
            </span>
          ))}
        </div>
      </div>

      {/* Answer Comparison */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Answer Comparison</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Student Answer */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Your Answer</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {studentAnswer}
              </p>
            </div>
          </div>

          {/* Ideal Answer */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ideal Answer</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {evaluation.idealAnswer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
