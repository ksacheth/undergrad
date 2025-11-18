"use client";

import { useEffect, useRef, useState } from "react";

interface PaperStyleSummary {
  commonVerbs: string[];
  averageMarksPerQuestion: number;
  typicalDifficulty: string;
}

interface UploadedPaper {
  id: string;
  name: string;
  status: "uploading" | "processed" | "error";
}

interface Question {
  id: string;
  text: string;
  marks?: number;
  difficulty?: string;
}

interface EvaluationResult {
  score: number;
  maxScore: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  conceptComparison: { concept: string; status: string }[];
}

interface FormState {
  subject: string;
  topic: string;
  questionType: "subjective" | "numerical" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  examStyle?: string;
  marksPattern?: string;
}

const defaultFormState: FormState = {
  subject: "",
  topic: "",
  questionType: "subjective",
  difficulty: "medium",
  numQuestions: 5,
  examStyle: "",
  marksPattern: "",
};

export default function Home() {
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionEvaluations, setQuestionEvaluations] = useState<
    Record<string, EvaluationResult>
  >({});
  const [evaluationLoading, setEvaluationLoading] = useState<Record<string, boolean>>({});
  const [uploadedPapers, setUploadedPapers] = useState<UploadedPaper[]>([]);
  const [styleSummary, setStyleSummary] = useState<PaperStyleSummary | null>(null);
  const practiceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (questions.length > 0 && practiceRef.current) {
      practiceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [questions]);

  const handleInputChange = (
    field: keyof FormState,
    value: string | number | undefined
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: field === "numQuestions" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!formState.subject.trim()) nextErrors.subject = "Subject is required.";
    if (!formState.topic.trim()) nextErrors.topic = "Topic is required.";
    if (!formState.questionType) nextErrors.questionType = "Choose a question type.";
    if (!formState.numQuestions || formState.numQuestions < 1)
      nextErrors.numQuestions = "Provide between 1 and 20 questions.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerateQuestions = async () => {
    if (!validateForm()) return;
    setIsGenerating(true);
    setQuestions([]);
    setQuestionEvaluations({});
    setAnswers({});

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          paperStyleSummary: styleSummary,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data.questions ?? []);
      setAnswers(
        (data.questions ?? []).reduce(
          (acc: Record<string, string>, question: Question) => ({
            ...acc,
            [question.id]: "",
          }),
          {}
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const evaluateAnswer = async (question: Question) => {
    const studentAnswer = answers[question.id];
    if (!studentAnswer?.trim()) return;

    setEvaluationLoading((prev) => ({ ...prev, [question.id]: true }));
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formState.subject,
          topic: formState.topic,
          questionId: question.id,
          questionText: question.text,
          studentAnswer,
          difficulty: formState.difficulty,
          marks: question.marks,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");

      const data = await response.json();
      setQuestionEvaluations((prev) => ({ ...prev, [question.id]: data }));
    } catch (error) {
      console.error(error);
    } finally {
      setEvaluationLoading((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const evaluateAll = async () => {
    for (const question of questions) {
      await evaluateAnswer(question);
    }
  };

  const handlePaperUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const newEntries: UploadedPaper[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      status: "uploading",
    }));
    setUploadedPapers((prev) => [...prev, ...newEntries]);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("papers", file));

    try {
      const response = await fetch("/api/upload-papers", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setStyleSummary(data.styleSummary);
      setUploadedPapers((prev) =>
        prev.map((entry) =>
          newEntries.find((n) => n.id === entry.id)
            ? { ...entry, status: "processed" }
            : entry
        )
      );
    } catch (error) {
      console.error(error);
      setUploadedPapers((prev) =>
        prev.map((entry) =>
          newEntries.find((n) => n.id === entry.id)
            ? { ...entry, status: "error" }
            : entry
        )
      );
    }
  };

  return (
    <div className="space-y-12 pb-16">
      <header className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
          UNDERGRAD mastery lab
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
          Generate practice questions, write your answers, and get AI-ready feedback.
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Configure an exam-style drill for any subject. We use mock APIs now, but
          the architecture is ready for real LLM calls that stay within
          undergraduate depth.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Practice configuration</h2>
            {styleSummary && (
              <span className="text-xs font-medium text-slate-500">
                Upload style locked in ({styleSummary.typicalDifficulty} difficulty)
              </span>
            )}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject / Course *</label>
              <input
                type="text"
                value={formState.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Data Structures, Thermodynamics, ..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
              {errors.subject && (
                <p className="text-sm text-rose-500">{errors.subject}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic / Concept *</label>
              <input
                type="text"
                value={formState.topic}
                onChange={(e) => handleInputChange("topic", e.target.value)}
                placeholder="AVL Trees, First law of thermodynamics, ..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
              {errors.topic && <p className="text-sm text-rose-500">{errors.topic}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Question type *</label>
              <select
                value={formState.questionType}
                onChange={(e) =>
                  handleInputChange("questionType", e.target.value as FormState["questionType"])
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="subjective">Subjective</option>
                <option value="numerical">Numerical / Problem-solving</option>
                <option value="mixed">Mixed</option>
              </select>
              {errors.questionType && (
                <p className="text-sm text-rose-500">{errors.questionType}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty *</label>
              <select
                value={formState.difficulty}
                onChange={(e) =>
                  handleInputChange("difficulty", e.target.value as FormState["difficulty"])
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of questions *</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formState.numQuestions}
                onChange={(e) => handleInputChange("numQuestions", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
              {errors.numQuestions && (
                <p className="text-sm text-rose-500">{errors.numQuestions}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exam style (optional)</label>
              <select
                value={formState.examStyle}
                onChange={(e) => handleInputChange("examStyle", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="">Generic</option>
                <option value="Mid-sem style">Mid-sem style</option>
                <option value="End-sem style">End-sem style</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Marks pattern (optional)</label>
              <input
                type="text"
                value={formState.marksPattern}
                onChange={(e) => handleInputChange("marksPattern", e.target.value)}
                placeholder="2×5 marks, 3×10 marks"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? "Generating..." : "Generate Questions"}
          </button>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Previous papers (optional)</h3>
          <p className="mt-2 text-sm text-slate-600">
            Upload PDFs so we can learn wording patterns. The server action returns a
            mock summary for now.
          </p>
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 hover:border-sky-400">
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(event) => handlePaperUpload(event.target.files)}
            />
            <span className="font-semibold text-slate-700">Drop PDFs or click to upload</span>
            <span className="text-xs">We only store style hints in-memory.</span>
          </label>
          <div className="mt-4 space-y-2">
            {uploadedPapers.length === 0 && (
              <p className="text-sm text-slate-400">No uploads yet.</p>
            )}
            {uploadedPapers.map((paper) => (
              <div
                key={paper.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-700">{paper.name}</span>
                <span
                  className={`text-xs font-semibold ${
                    paper.status === "processed"
                      ? "text-emerald-600"
                      : paper.status === "error"
                      ? "text-rose-500"
                      : "text-slate-400"
                  }`}
                >
                  {paper.status === "processed"
                    ? "Processed"
                    : paper.status === "error"
                    ? "Error"
                    : "Uploading..."}
                </span>
              </div>
            ))}
          </div>
          {styleSummary && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">Style summary (mock)</p>
              <p className="mt-1">Common verbs: {styleSummary.commonVerbs.join(", ")}</p>
              <p>Avg marks: {styleSummary.averageMarksPerQuestion}</p>
              <p>Difficulty: {styleSummary.typicalDifficulty}</p>
            </div>
          )}
        </div>
      </section>

      <section ref={practiceRef} className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Practice session</h2>
          <p className="text-sm text-slate-500">
            Answer each question and validate to see feedback. Everything resets when you reload.
          </p>
        </div>
        {questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            Configure the session above and generate questions to begin practicing.
          </div>
        )}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <article key={question.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Q{index + 1}
                </div>
                <span className="text-sm text-slate-500">
                  {formState.difficulty.charAt(0).toUpperCase() + formState.difficulty.slice(1)}
                </span>
                {question.marks && (
                  <span className="text-sm text-slate-500">{question.marks} marks</span>
                )}
              </div>
              <p className="mt-4 text-lg font-medium text-slate-900">{question.text}</p>
              <textarea
                value={answers[question.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                }
                rows={5}
                placeholder="Type your response..."
                className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => evaluateAnswer(question)}
                  disabled={!answers[question.id]?.trim() || evaluationLoading[question.id]}
                  className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {evaluationLoading[question.id] ? "Validating..." : "Validate this answer"}
                </button>
              </div>

              {questionEvaluations[question.id] && (
                <div className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Score: {questionEvaluations[question.id].score} / {" "}
                      {questionEvaluations[question.id].maxScore}
                    </p>
                    <span className="text-sm text-slate-500">
                      {questionEvaluations[question.id].verdict}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-emerald-600">
                        What you did well
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {questionEvaluations[question.id].strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-rose-600">
                        What you missed
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {questionEvaluations[question.id].weaknesses.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {questionEvaluations[question.id].conceptComparison.map((concept) => (
                      <span
                        key={concept.concept}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          concept.status === "covered"
                            ? "bg-emerald-100 text-emerald-700"
                            : concept.status === "partial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {concept.status === "covered"
                          ? "✅"
                          : concept.status === "partial"
                          ? "⚠️"
                          : "❌"}
                        {concept.concept}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Your answer
                      </p>
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-white p-3 text-sm text-slate-700">
                        {answers[question.id]}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Ideal answer
                      </p>
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-white p-3 text-sm text-slate-700">
                        {questionEvaluations[question.id].idealAnswer}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
        {questions.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={evaluateAll}
              className="inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Validate all answers
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
