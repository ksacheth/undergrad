'use client';

import { useState, useRef } from 'react';
import QuestionForm from './components/QuestionForm';
import QuestionCard from './components/QuestionCard';
import type { Question, StudentAnswer, EvaluateAnswerResponse, Difficulty } from './types';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [sessionData, setSessionData] = useState<{
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>({
    subject: '',
    topic: '',
    difficulty: 'medium',
  });
  const practiceRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoadingQuestions(true);
    setFormErrors({});

    try {
      const subject = formData.get('subject') as string;
      const topic = formData.get('topic') as string;
      const questionType = formData.get('questionType') as string;
      const difficulty = formData.get('difficulty') as string;
      const numQuestions = parseInt(formData.get('numQuestions') as string);
      const examStyle = formData.get('examStyle') as string;
      const marksPattern = formData.get('marksPattern') as string;

      const requestBody = {
        subject,
        topic,
        questionType,
        difficulty,
        numQuestions,
        examStyle: examStyle || undefined,
        marksPattern: marksPattern || undefined,
      };

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        setFormErrors({ submit: error.error || 'Failed to generate questions' });
        return;
      }

      const data = await response.json();
      setQuestions(data.questions);
      setSessionData({ 
        subject, 
        topic, 
        difficulty: difficulty as Difficulty
      });

      // Initialize student answers
      const answers: StudentAnswer[] = data.questions.map(
        (q: Question) => ({
          questionId: q.id,
          answer: '',
        })
      );
      setStudentAnswers(answers);

      // Scroll to practice section
      setTimeout(() => {
        practiceRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setFormErrors({
        submit:
          error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setStudentAnswers((prev) =>
      prev.map((sa) =>
        sa.questionId === questionId ? { ...sa, answer } : sa
      )
    );
  };

  const handleValidateSingleAnswer = async (questionId: string) => {
    const answerData = studentAnswers.find(
      (sa) => sa.questionId === questionId
    );
    const question = questions.find((q) => q.id === questionId);

    if (!answerData || !question) return;

    setStudentAnswers((prev) =>
      prev.map((sa) =>
        sa.questionId === questionId ? { ...sa, isEvaluating: true } : sa
      )
    );

    try {
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: sessionData.subject,
          topic: sessionData.topic,
          questionId,
          questionText: question.text,
          studentAnswer: answerData.answer,
          difficulty: question.difficulty,
          marks: question.marks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const evaluation: EvaluateAnswerResponse = await response.json();

      setStudentAnswers((prev) =>
        prev.map((sa) =>
          sa.questionId === questionId
            ? {
                ...sa,
                evaluation,
                isEvaluating: false,
              }
            : sa
        )
      );
    } catch (error) {
      console.error('Error validating answer:', error);
      setStudentAnswers((prev) =>
        prev.map((sa) =>
          sa.questionId === questionId
            ? { ...sa, isEvaluating: false }
            : sa
        )
      );
    }
  };

  const handleValidateAllAnswers = async () => {
    const unansweredQuestions = studentAnswers.filter(
      (sa) => !sa.answer.trim()
    );

    if (unansweredQuestions.length > 0) {
      setFormErrors({
        validateAll: `Please answer all ${unansweredQuestions.length} question(s) before validating`,
      });
      return;
    }

    setStudentAnswers((prev) =>
      prev.map((sa) => ({ ...sa, isEvaluating: true }))
    );

    try {
      const evaluationPromises = studentAnswers.map(async (answerData) => {
        const question = questions.find((q) => q.id === answerData.questionId);
        if (!question) return null;

        const response = await fetch('/api/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: sessionData.subject,
            topic: sessionData.topic,
            questionId: answerData.questionId,
            questionText: question.text,
            studentAnswer: answerData.answer,
            difficulty: question.difficulty,
            marks: question.marks,
          }),
        });

        if (!response.ok) throw new Error('Failed to evaluate');
        return response.json();
      });

      const evaluations = await Promise.all(evaluationPromises);

      setStudentAnswers((prev) =>
        prev.map((sa, idx) => ({
          ...sa,
          evaluation: evaluations[idx],
          isEvaluating: false,
        }))
      );
    } catch (error) {
      console.error('Error validating all answers:', error);
      setStudentAnswers((prev) =>
        prev.map((sa) => ({ ...sa, isEvaluating: false }))
      );
    }
  };

  const allAnswersEvaluated = studentAnswers.every((sa) => sa.evaluation);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Configuration Section */}
      <section className="mb-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Configure Your Practice Session
          </h2>
          <QuestionForm
            onSubmit={handleFormSubmit}
            isLoading={isLoadingQuestions}
            errors={formErrors}
          />
          {formErrors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{formErrors.submit}</p>
            </div>
          )}
        </div>
      </section>

      {/* Practice Session Section */}
      {questions.length > 0 && (
        <section
          ref={practiceRef}
          className="space-y-6"
          scroll-margin-top="100px"
        >
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Practice Session: {sessionData.topic}
            </h2>
            <p className="text-gray-600">
              Answer all {questions.length} question(s) and get AI-powered feedback
            </p>
            {allAnswersEvaluated && (
              <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg inline-block">
                <span>✓</span>
                <span className="font-medium">All answers evaluated!</span>
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question, idx) => {
              const answerData = studentAnswers.find(
                (sa) => sa.questionId === question.id
              );
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  studentAnswer={answerData?.answer || ''}
                  onAnswerChange={(answer) =>
                    handleAnswerChange(question.id, answer)
                  }
                  onValidate={() => handleValidateSingleAnswer(question.id)}
                  evaluation={answerData?.evaluation}
                  isEvaluating={answerData?.isEvaluating}
                  index={idx}
                />
              );
            })}
          </div>

          {/* Global Validation Button */}
          {studentAnswers.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 flex justify-center">
              <button
                onClick={handleValidateAllAnswers}
                disabled={
                  studentAnswers.some((sa) => sa.isEvaluating) ||
                  studentAnswers.some((sa) => !sa.answer.trim())
                }
                className="px-8 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              >
                Validate All Answers
              </button>
            </div>
          )}

          {formErrors.validateAll && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">{formErrors.validateAll}</p>
            </div>
          )}
        </section>
      )}

      {/* Empty State */}
      {questions.length === 0 && !isLoadingQuestions && (
        <section className="text-center py-12">
          <p className="text-lg text-gray-500">
            👈 Fill out the form above to generate practice questions
          </p>
        </section>
      )}
    </div>
  );
}
