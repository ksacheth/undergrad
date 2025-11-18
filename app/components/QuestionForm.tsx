'use client';

import { useState } from 'react';
import type { QuestionType, Difficulty, UploadedPaperInfo } from '@/app/types';

interface QuestionFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

export default function QuestionForm({
  onSubmit,
  isLoading,
  errors,
}: QuestionFormProps) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('subjective');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [examStyle, setExamStyle] = useState('generic');
  const [marksPattern, setMarksPattern] = useState('');
  const [uploadedPapers, setUploadedPapers] = useState<UploadedPaperInfo[]>([]);
  const [isUploadingPapers, setIsUploadingPapers] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handlePaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    setIsUploadingPapers(true);
    setUploadError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload-papers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload papers');
      }

      const data = await response.json();

      const newPapers: UploadedPaperInfo[] = data.fileNames.map(
        (fileName: string) => ({
          fileName,
          status: 'processed' as const,
        })
      );

      setUploadedPapers((prev) => [...prev, ...newPapers]);
      e.currentTarget.value = '';
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Upload failed'
      );
    } finally {
      setIsUploadingPapers(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!topic.trim()) newErrors.topic = 'Topic is required';
    if (numQuestions < 1 || numQuestions > 20)
      newErrors.numQuestions = 'Questions must be between 1 and 20';

    if (Object.keys(newErrors).length > 0) {
      Object.entries(newErrors).forEach(([key, value]) => {
        errors[key] = value;
      });
      return;
    }

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('topic', topic);
    formData.append('questionType', questionType);
    formData.append('difficulty', difficulty);
    formData.append('numQuestions', numQuestions.toString());
    formData.append('examStyle', examStyle);
    if (marksPattern) formData.append('marksPattern', marksPattern);
    formData.append('uploadedPaperCount', uploadedPapers.length.toString());

    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject / Course <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) delete errors.subject;
            }}
            placeholder="e.g., Data Structures, Thermodynamics"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.subject ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
          )}
        </div>

        {/* Topic */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-2">
            Topic / Concept <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (errors.topic) delete errors.topic;
            }}
            placeholder="e.g., AVL Trees, First law of thermodynamics"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.topic ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.topic && (
            <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
          )}
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Question Type <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['subjective', 'numerical', 'mixed'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="questionType"
                  value={type}
                  checked={questionType === type}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Number of Questions */}
        <div>
          <label htmlFor="numQuestions" className="block text-sm font-medium mb-2">
            Number of Questions <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="numQuestions"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {numQuestions}
            </span>
          </div>
        </div>

        {/* Exam Style */}
        <div>
          <label htmlFor="examStyle" className="block text-sm font-medium mb-2">
            Exam Style (Optional)
          </label>
          <select
            id="examStyle"
            value={examStyle}
            onChange={(e) => setExamStyle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="generic">Generic</option>
            <option value="mid-sem">Mid-sem style</option>
            <option value="end-sem">End-sem style</option>
          </select>
        </div>

        {/* Marks Pattern */}
        <div>
          <label htmlFor="marksPattern" className="block text-sm font-medium mb-2">
            Marks Pattern (Optional)
          </label>
          <input
            type="text"
            id="marksPattern"
            value={marksPattern}
            onChange={(e) => setMarksPattern(e.target.value)}
            placeholder="e.g., 2×5 marks, 3×10 marks"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Paper Upload */}
        <div>
          <label htmlFor="paperUpload" className="block text-sm font-medium mb-2">
            Upload Previous Papers (Optional)
          </label>
          <input
            type="file"
            id="paperUpload"
            multiple
            accept=".pdf"
            onChange={handlePaperUpload}
            disabled={isUploadingPapers}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {uploadError && (
            <p className="text-red-500 text-sm mt-1">{uploadError}</p>
          )}

          {uploadedPapers.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Uploaded files:
              </p>
              <div className="space-y-1">
                {uploadedPapers.map((paper, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded px-3 py-2"
                  >
                    <span className="text-gray-700">{paper.fileName}</span>
                    <span className="text-green-600 text-xs font-medium">
                      ✓ {paper.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isUploadingPapers}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Generating Questions...' : 'Generate Questions'}
        </button>
      </form>
    </div>
  );
}
