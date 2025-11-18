"use client";

import { useState } from "react";

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

interface ConfigFormProps {
  onGenerateQuestions: (config: ConfigData) => void;
  isLoading: boolean;
}

export default function ConfigForm({
  onGenerateQuestions,
  isLoading,
}: ConfigFormProps) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questionType, setQuestionType] = useState<
    "subjective" | "numerical" | "mixed"
  >("subjective");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [numQuestions, setNumQuestions] = useState(5);
  const [examStyle, setExamStyle] = useState("");
  const [marksPattern, setMarksPattern] = useState("");
  const [styleSummary, setStyleSummary] = useState<StyleSummary | null>(null);
  const [isUploadingPapers, setIsUploadingPapers] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPapers(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch("/api/upload-papers", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload papers");
      }

      const data = await response.json() as { styleSummary: StyleSummary };
      setStyleSummary(data.styleSummary);
    } catch (error) {
      console.error("Error uploading papers:", error);
      alert("Failed to upload papers");
    } finally {
      setIsUploadingPapers(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !topic.trim()) {
      alert("Please fill in subject and topic");
      return;
    }

    const config: ConfigData = {
      subject,
      topic,
      questionType,
      difficulty,
      numQuestions,
      examStyle: examStyle || undefined,
      marksPattern: marksPattern || undefined,
      styleSummary: styleSummary || undefined,
    };
    onGenerateQuestions(config);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 mb-8 border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">
        Configure Your Practice Session
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Subject / Course <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Physics, Chemistry, Mathematics"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Topic / Concept <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Thermodynamics, Stoichiometry"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) =>
                setQuestionType(
                  e.target.value as "subjective" | "numerical" | "mixed"
                )
              }
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white"
              disabled={isLoading}
            >
              <option value="subjective">Subjective</option>
              <option value="numerical">Numerical</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "medium" | "hard")
              }
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white"
              disabled={isLoading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Number of Questions (1-20)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* Exam Style */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Exam Style (Optional)
            </label>
            <select
              value={examStyle}
              onChange={(e) => setExamStyle(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white"
              disabled={isLoading}
            >
              <option value="">Generic</option>
              <option value="mid-semester">Mid-semester Style</option>
              <option value="end-semester">End-semester Style</option>
            </select>
          </div>
        </div>

        {/* Marks Pattern */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Marks Pattern (Optional)
          </label>
          <input
            type="text"
            value={marksPattern}
            onChange={(e) => setMarksPattern(e.target.value)}
            placeholder="e.g., 2×5 marks, 3×10 marks"
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white"
            disabled={isLoading}
          />
        </div>

        {/* Upload Papers */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Upload Previous Year Papers (Optional)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isLoading || isUploadingPapers}
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:text-white"
            />
            {isUploadingPapers && (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            )}
          </div>
          {styleSummary && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              ✓ Style summary extracted from {styleSummary.questionCount || "?"} questions
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isUploadingPapers}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
        >
          {isLoading ? "Generating Questions..." : "Generate Questions"}
        </button>
      </form>
    </div>
  );
}
