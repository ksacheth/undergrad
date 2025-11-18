import type { GenerateQuestionsRequest, EvaluateAnswerRequest } from "./types";

/**
 * Sanitize user input to prevent prompt injection
 * Removes quotes, newlines, and control characters
 */
function sanitize(input: string | null | undefined): string {
  if (input == null) return "";
  return input
    .replace(/["'\n\r\t\v\f\0]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate prompt for creating exam questions
 */
export function createQuestionGenerationPrompt(
  config: GenerateQuestionsRequest
): string {
  const {
    subject,
    topic,
    questionType,
    difficulty,
    numQuestions,
    examStyle,
    marksPattern,
    styleSummary,
  } = config;

  // Sanitize user inputs to prevent prompt injection
  const safeSubject = sanitize(subject);
  const safeTopic = sanitize(topic);
  const safeExamStyle = sanitize(examStyle);
  const safeMarksPattern = sanitize(marksPattern);
  const safeStyleSummary = styleSummary
    ? sanitize(JSON.stringify(styleSummary))
    : null;

  return `You are an exam setter for UNDERGRADUATE courses.

Generate ${numQuestions} new exam questions for the subject "${safeSubject}" and topic "${safeTopic}".

Question type: ${questionType}.

Difficulty: ${difficulty} at UNDERGRAD level (not school, not research).

Exam style: ${safeExamStyle || "generic undergrad exam"}.

${safeMarksPattern ? `Marks pattern (if provided): ${safeMarksPattern}.` : ""}

${
  safeStyleSummary
    ? `If a style summary is provided, mimic its phrasing without copying any actual questions:

Style summary: ${safeStyleSummary}.`
    : ""
}

Return ONLY valid JSON in the following format and nothing else:

{
  "questions": [
    { "id": "q1", "text": "question text here", "marks": 10 },
    { "id": "q2", "text": "question text here", "marks": 10 }
  ]
}

IMPORTANT:
- Generate exactly ${numQuestions} questions
- Each question must have a unique id (q1, q2, q3, etc.)
- Questions should be clear, unambiguous, and appropriate for undergraduate level
- For numerical questions, include specific values and units
- For subjective questions, ask for explanations, analysis, or discussions
- Assign appropriate marks to each question (typically 5-15 marks)
- Return ONLY the JSON, no additional text or formatting`;
}

/**
 * Generate prompt for evaluating student answers
 */
export function createAnswerEvaluationPrompt(
  request: EvaluateAnswerRequest
): string {
  const { subject, questionText, studentAnswer, difficulty, marks } = request;

  // Sanitize user inputs to prevent prompt injection
  const safeSubject = sanitize(subject);
  const safeQuestionText = sanitize(questionText);
  const safeStudentAnswer = sanitize(studentAnswer);

  const maxScore = marks || 10;

  return `You are an experienced examiner for UNDERGRADUATE exams in ${safeSubject}.

Evaluate the student's answer to the following question.

Question:
"${safeQuestionText}"

Student answer:
"${safeStudentAnswer}"

Assume difficulty level: ${difficulty} (undergrad).

Maximum marks for this question: ${maxScore}.

Your tasks:
1. Decide a score from 0 to ${maxScore}.
2. Explain what the student did well (strengths).
3. Explain what is missing, incorrect, or unclear (weaknesses).
4. Provide a concise but complete IDEAL ANSWER.
5. Identify key concepts and mark each as "covered", "partial", "missing", or "wrong".

Respond ONLY with JSON in this format:

{
  "score": number,
  "maxScore": ${maxScore},
  "verdict": "Fully correct" | "Mostly correct" | "Partially correct" | "Incorrect" | "Off-topic",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "idealAnswer": "complete ideal answer here",
  "conceptComparison": [
    { "concept": "concept name", "status": "covered" | "partial" | "missing" | "wrong" }
  ]
}

IMPORTANT:
- Be fair but rigorous in evaluation
- Award partial marks for partially correct answers
- Strengths and weaknesses should be specific and actionable
- The ideal answer should be comprehensive but concise
- Identify at least 2-5 key concepts for comparison
- Return ONLY the JSON, no additional text or formatting`;
}
