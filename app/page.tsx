"use client";

import { useState } from "react";
import type {
  ConfigFormData,
  QuestionState,
  StyleSummary,
  GenerateQuestionsResponse,
  EvaluateAnswerResponse,
} from "@/lib/types";

export default function Home() {
  // Configuration form state
  const [config, setConfig] = useState<ConfigFormData>({
    subject: "",
    topic: "",
    questionType: "subjective",
    difficulty: "medium",
    numQuestions: 5,
    examStyle: "Generic",
    marksPattern: "",
  });

  // Questions and session state
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidatingAll, setIsValidatingAll] = useState(false);
  const [error, setError] = useState<string>("");
  const [styleSummary, setStyleSummary] = useState<StyleSummary | undefined>();

  // Handle configuration changes
  const handleConfigChange = (field: keyof ConfigFormData, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      // For MVP, just call the stub API
      const response = await fetch("/api/upload-papers", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to upload papers");

      const data = await response.json();
      setStyleSummary(data.styleSummary);
    } catch (err) {
      console.error("Error uploading papers:", err);
      setError("Failed to process uploaded papers");
    }
  };

  // Generate questions
  const handleGenerateQuestions = async () => {
    if (!config.subject || !config.topic) {
      setError("Please fill in subject and topic");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          styleSummary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data: GenerateQuestionsResponse = await response.json();

      // Initialize question state
      const questionStates: QuestionState[] = data.questions.map((q) => ({
        ...q,
        studentAnswer: "",
        isEvaluating: false,
      }));

      setQuestions(questionStates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  // Validate a single answer
  const handleValidateAnswer = async (index: number) => {
    const question = questions[index];
    if (!question.studentAnswer.trim()) {
      setError("Please provide an answer first");
      return;
    }

    // Update evaluating state
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, isEvaluating: true } : q))
    );
    setError("");

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: config.subject,
          topic: config.topic,
          questionId: question.id,
          questionText: question.text,
          studentAnswer: question.studentAnswer,
          difficulty: config.difficulty,
          marks: question.marks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to evaluate answer");
      }

      const evaluation: EvaluateAnswerResponse = await response.json();

      // Update with evaluation
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === index ? { ...q, evaluation, isEvaluating: false } : q
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate answer");
      setQuestions((prev) =>
        prev.map((q, i) => (i === index ? { ...q, isEvaluating: false } : q))
      );
    }
  };

  // Validate all answers
  const handleValidateAll = async () => {
    const unansweredQuestions = questions.filter((q) => !q.studentAnswer.trim());
    if (unansweredQuestions.length > 0) {
      setError("Please answer all questions before validating");
      return;
    }

    setIsValidatingAll(true);
    setError("");

    // Validate each question sequentially
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].evaluation) {
        await handleValidateAnswer(i);
      }
    }

    setIsValidatingAll(false);
  };

  // Update student answer
  const handleAnswerChange = (index: number, answer: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, studentAnswer: answer } : q))
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Configuration Form */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Configure Your Practice Session
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject / Course *
              </label>
              <input
                type="text"
                value={config.subject}
                onChange={(e) => handleConfigChange("subject", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Data Structures"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic / Concept *
              </label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => handleConfigChange("topic", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Binary Trees"
              />
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type *
              </label>
              <select
                value={config.questionType}
                onChange={(e) =>
                  handleConfigChange("questionType", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="subjective">Subjective</option>
                <option value="numerical">Numerical</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                value={config.difficulty}
                onChange={(e) => handleConfigChange("difficulty", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.numQuestions}
                onChange={(e) =>
                  handleConfigChange("numQuestions", parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Exam Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Style (Optional)
              </label>
              <select
                value={config.examStyle}
                onChange={(e) => handleConfigChange("examStyle", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Generic">Generic</option>
                <option value="Mid-sem style">Mid-sem style</option>
                <option value="End-sem style">End-sem style</option>
              </select>
            </div>

            {/* Marks Pattern */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks Pattern (Optional)
              </label>
              <input
                type="text"
                value={config.marksPattern}
                onChange={(e) =>
                  handleConfigChange("marksPattern", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2×5 marks, 3×10 marks"
              />
            </div>

            {/* Upload Previous Papers */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Previous Year Papers (Optional, PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {styleSummary && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Papers processed successfully
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="mt-6 w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating Questions..." : "Generate Questions"}
          </button>
        </section>

        {/* Practice Session */}
        {questions.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Practice Session
              </h2>
              <button
                onClick={handleValidateAll}
                disabled={isValidatingAll}
                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isValidatingAll ? "Validating..." : "Validate All Answers"}
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  {/* Question Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {question.text}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      {question.marks && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full whitespace-nowrap">
                          {question.marks} marks
                        </span>
                      )}
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full whitespace-nowrap">
                        {config.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Answer Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer
                    </label>
                    <textarea
                      value={question.studentAnswer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={question.isEvaluating}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]"
                      placeholder="Type your answer here..."
                    />
                  </div>

                  {/* Validate Button */}
                  {!question.evaluation && (
                    <button
                      onClick={() => handleValidateAnswer(index)}
                      disabled={question.isEvaluating}
                      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {question.isEvaluating
                        ? "Validating..."
                        : "Validate this answer"}
                    </button>
                  )}

                  {/* Evaluation Results */}
                  {question.evaluation && (
                    <div className="mt-6 border-t pt-6">
                      {/* Score and Verdict */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-3xl font-bold text-blue-600">
                          {question.evaluation.score}/
                          {question.evaluation.maxScore}
                        </div>
                        <div className="flex-1">
                          <span
                            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                              question.evaluation.verdict === "Fully correct"
                                ? "bg-green-100 text-green-800"
                                : question.evaluation.verdict ===
                                  "Mostly correct"
                                ? "bg-blue-100 text-blue-800"
                                : question.evaluation.verdict ===
                                  "Partially correct"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {question.evaluation.verdict}
                          </span>
                        </div>
                      </div>

                      {/* Strengths and Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Strengths */}
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <span>✓</span> What you did well
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {question.evaluation.strengths.map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div>
                          <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <span>✗</span> What you missed
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {question.evaluation.weaknesses.map(
                              (weakness, i) => (
                                <li key={i}>{weakness}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Concept Comparison */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Concept Coverage
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {question.evaluation.conceptComparison.map(
                            (concept, i) => (
                              <span
                                key={i}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  concept.status === "covered"
                                    ? "bg-green-100 text-green-800"
                                    : concept.status === "partial"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {concept.status === "covered"
                                  ? "✅"
                                  : concept.status === "partial"
                                  ? "⚠️"
                                  : "❌"}{" "}
                                {concept.concept}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Side-by-side Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Student Answer */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Your Answer
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                            {question.studentAnswer}
                          </div>
                        </div>

                        {/* Ideal Answer */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Ideal Answer
                          </h4>
                          <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                            {question.evaluation.idealAnswer}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
