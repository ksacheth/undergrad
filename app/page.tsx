"use client";

import { useMemo, useState } from "react";

import type {
  Difficulty,
  PracticeConfig,
  QuestionEvaluation,
  QuestionType,
  StyleSummary,
} from "@/lib/types";

type QuestionWithState = {
  id: string;
  text: string;
  marks?: number;
  answer: string;
  difficulty: Difficulty;
  isEvaluating: boolean;
  evaluation?: QuestionEvaluation;
  error?: string;
};

const defaultConfig: PracticeConfig = {
  subject: "Engineering Mathematics",
  topic: "Fourier Series",
  questionType: "mixed",
  difficulty: "medium",
  numQuestions: 5,
  examStyle: "Generic",
};

const questionTypeOptions: Array<{ label: string; value: QuestionType }> = [
  { label: "Subjective", value: "subjective" },
  { label: "Numerical", value: "numerical" },
  { label: "Mixed", value: "mixed" },
];

const difficultyOptions: Array<{ label: string; value: Difficulty }> = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const examStyles = ["Generic", "Mid-sem style", "End-sem style"];

export default function Home() {
  const [config, setConfig] = useState<PracticeConfig>(defaultConfig);
  const [fileList, setFileList] = useState<File[]>([]);
  const [styleSummary, setStyleSummary] = useState<StyleSummary | null>(null);
  const [questions, setQuestions] = useState<QuestionWithState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [validateAllLoading, setValidateAllLoading] = useState(false);

  const totalMarks = useMemo(
    () => questions.reduce((acc, q) => acc + (q.marks ?? 0), 0),
    [questions]
  );

  const handleConfigChange = (
    field: keyof PracticeConfig,
    value: string | number
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setFileList(nextFiles);
  };

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);
    setGlobalError(null);
    setStyleSummary(null);
    setQuestions([]);

    try {
      let summary: StyleSummary | null = null;
      if (fileList.length) {
        const uploadForm = new FormData();
        fileList.forEach((file) => uploadForm.append("files", file));
        const uploadResponse = await fetch("/api/upload-papers", {
          method: "POST",
          body: uploadForm,
        });
        if (!uploadResponse.ok) {
          throw new Error("Failed to analyze uploaded papers");
        }
        const uploadJson = await uploadResponse.json();
        summary = uploadJson.styleSummary ?? null;
        setStyleSummary(summary);
      }

      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...config,
          styleSummary: summary,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to generate questions");
      }

      const payload = await response.json();
      const nextQuestions: QuestionWithState[] = (payload.questions || []).map(
        (question: QuestionWithState, index: number) => ({
          id: question.id || `q${index + 1}`,
          text: question.text,
          marks: question.marks,
          answer: "",
          difficulty: config.difficulty,
          isEvaluating: false,
        })
      );

      setQuestions(nextQuestions);
    } catch (error) {
      setGlobalError((error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateAnswer = (questionId: string, value: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, answer: value } : question
      )
    );
  };

  const evaluateQuestion = async (questionId: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, isEvaluating: true, error: undefined }
          : question
      )
    );

    try {
      const current = questions.find((question) => question.id === questionId);
      if (!current) return;
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: config.subject,
          topic: config.topic,
          questionId: current.id,
          questionText: current.text,
          studentAnswer: current.answer,
          difficulty: current.difficulty,
          marks: current.marks,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gemini could not evaluate the answer");
      }

      const evaluation: QuestionEvaluation = await response.json();
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === questionId
            ? { ...question, evaluation, isEvaluating: false }
            : question
        )
      );
    } catch (error) {
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === questionId
            ? {
                ...question,
                isEvaluating: false,
                error: (error as Error).message,
              }
            : question
        )
      );
    }
  };

  const validateAll = async () => {
    if (!questions.length) return;
    setValidateAllLoading(true);
    try {
      for (const question of questions) {
        await evaluateQuestion(question.id);
      }
    } finally {
      setValidateAllLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="flex flex-col gap-3 pb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Configure session
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Tell Gemini what to create
          </h2>
          <p className="text-base text-slate-300">
            Provide subject context, pick difficulty, and optionally upload past
            papers to nudge the tone. All Gemini calls run on the server to keep
            your API key private.
          </p>
        </div>
        <form className="grid gap-6" onSubmit={handleGenerate}>
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Subject / Course
              <input
                type="text"
                required
                value={config.subject}
                onChange={(event) => handleConfigChange("subject", event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., Signals & Systems"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Topic / Concept
              <input
                type="text"
                required
                value={config.topic}
                onChange={(event) => handleConfigChange("topic", event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="e.g., Laplace transforms"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Question type
              <select
                value={config.questionType}
                onChange={(event) =>
                  handleConfigChange(
                    "questionType",
                    event.target.value as QuestionType
                  )
                }
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white"
              >
                {questionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Difficulty
              <select
                value={config.difficulty}
                onChange={(event) =>
                  handleConfigChange(
                    "difficulty",
                    event.target.value as Difficulty
                  )
                }
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Number of questions
              <input
                type="number"
                min={1}
                max={20}
                value={config.numQuestions}
                onChange={(event) =>
                  handleConfigChange("numQuestions", Number(event.target.value))
                }
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Exam style (optional)
              <select
                value={config.examStyle}
                onChange={(event) =>
                  handleConfigChange("examStyle", event.target.value)
                }
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white"
              >
                {examStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200 lg:col-span-2">
              Marks pattern (optional)
              <input
                type="text"
                value={config.marksPattern ?? ""}
                onChange={(event) =>
                  handleConfigChange("marksPattern", event.target.value)
                }
                placeholder="e.g., 2×5 marks, 3×10 marks"
                className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-white placeholder:text-slate-500"
              />
            </label>
            <div className="lg:col-span-2">
              <p className="text-sm font-medium text-slate-200">
                Upload previous year PDFs (optional)
              </p>
              <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-dashed border-white/20 bg-slate-900/40 p-4">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFilesChange}
                  className="text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-200"
                />
                {fileList.length > 0 ? (
                  <p className="text-sm text-slate-300">
                    {fileList.length} file(s) selected
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Add PDF papers to let Gemini mimic that phrasing.
                  </p>
                )}
              </div>
            </div>
          </div>
          {globalError && (
            <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {globalError}
            </p>
          )}
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-cyan-500/40 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? "Generating questions…" : "Generate Questions"}
          </button>
        </form>
      </section>

      {styleSummary && (
        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
          <h3 className="text-xl font-semibold text-cyan-200">Style summary from uploads</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-200">
                Common verbs
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {styleSummary.commonVerbs.map((verb) => (
                  <span
                    key={verb}
                    className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-100"
                  >
                    {verb}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-200">
                Avg. marks
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {styleSummary.averageMarksPerQuestion}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-200">
                Typical difficulty
              </p>
              <p className="mt-2 text-2xl font-semibold capitalize text-white">
                {styleSummary.typicalDifficulty}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
              Practice session
            </p>
            <h2 className="text-3xl font-semibold text-white">
              {questions.length ? "Start answering" : "Waiting for questions"}
            </h2>
            {questions.length > 0 && (
              <p className="text-sm text-slate-400">
                {questions.length} question(s) · {totalMarks || "?"} total marks
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={validateAll}
            disabled={!questions.length || validateAllLoading}
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {validateAllLoading ? "Validating all…" : "Validate all answers"}
          </button>
        </div>

        {questions.length === 0 && !isGenerating && (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-slate-400">
            Generate questions to start a fresh session.
          </div>
        )}

        <div className="space-y-6">
          {questions.map((question, index) => (
            <article
              key={question.id}
              className="rounded-3xl border border-white/10 bg-slate-900/60 p-6"
            >
              <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Question {index + 1}</p>
                  <p className="text-lg font-semibold text-white">{question.text}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {question.marks && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
                      {question.marks} marks
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 capitalize text-emerald-200">
                    {question.difficulty}
                  </span>
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Your answer
                <textarea
                  value={question.answer}
                  onChange={(event) => updateAnswer(question.id, event.target.value)}
                  rows={5}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  placeholder="Write your solution here"
                />
              </label>
              {question.error && (
                <p className="mt-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {question.error}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => evaluateQuestion(question.id)}
                  disabled={question.isEvaluating}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {question.isEvaluating ? "Validating…" : "Validate this answer"}
                </button>
              </div>

              {question.evaluation && (
                <div className="mt-6 space-y-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-emerald-200">
                        Score & verdict
                      </p>
                      <p className="text-2xl font-semibold text-white">
                        {question.evaluation.score} / {question.evaluation.maxScore}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-4 py-1 text-sm font-semibold text-emerald-100">
                      {question.evaluation.verdict}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FeedbackList
                      title="What you did well"
                      items={question.evaluation.strengths}
                      variant="positive"
                    />
                    <FeedbackList
                      title="What you missed"
                      items={question.evaluation.weaknesses}
                      variant="neutral"
                    />
                  </div>
                  <ConceptPills data={question.evaluation.conceptComparison} />
                  <div className="grid gap-4 lg:grid-cols-2">
                    <AnswerPanel
                      title="Your answer"
                      body={question.answer || "No answer provided"}
                    />
                    <AnswerPanel
                      title="Ideal answer"
                      body={question.evaluation.idealAnswer}
                      highlight
                    />
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeedbackList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "positive" | "neutral";
}) {
  if (!items?.length) return null;
  return (
    <div>
      <p
        className={`text-sm font-semibold uppercase tracking-wide ${
          variant === "positive" ? "text-emerald-200" : "text-amber-200"
        }`}
      >
        {title}
      </p>
      <ul className="mt-2 space-y-2 text-sm text-slate-100">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="flex items-start gap-2 rounded-xl bg-white/10 px-3 py-2"
          >
            <span>{variant === "positive" ? "✅" : "⚠️"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConceptPills({
  data,
}: {
  data: QuestionEvaluation["conceptComparison"];
}) {
  if (!data?.length) return null;
  const colorMap: Record<string, string> = {
    covered: "bg-emerald-500/20 text-emerald-100",
    partial: "bg-amber-500/20 text-amber-100",
    missing: "bg-rose-500/20 text-rose-100",
    wrong: "bg-rose-500/20 text-rose-100",
  };
  const iconMap: Record<string, string> = {
    covered: "✅",
    partial: "⚠️",
    missing: "❌",
    wrong: "🚫",
  };
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Concept coverage
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {data.map((concept) => (
          <span
            key={concept.concept}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${colorMap[concept.status]}`}
          >
            <span>{iconMap[concept.status]}</span>
            {concept.concept}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnswerPanel({
  title,
  body,
  highlight,
}: {
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        highlight
          ? "border-emerald-400/30 bg-slate-950/50"
          : "border-white/10 bg-slate-950/30"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 whitespace-pre-line text-slate-100">{body}</p>
    </div>
  );
}
