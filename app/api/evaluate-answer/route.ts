import { NextRequest, NextResponse } from 'next/server';
import type { EvaluateAnswerRequest, EvaluateAnswerResponse } from '@/app/types';

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

function calculateScore(
  studentAnswer: string,
  difficulty: string,
  maxScore: number
): number {
  // Mock scoring logic based on answer length and keywords
  const wordCount = countWords(studentAnswer);
  const difficultyMultiplier: Record<string, number> = {
    easy: 30,
    medium: 50,
    hard: 80,
  };

  const expectedMinWords = difficultyMultiplier[difficulty] || 50;
  const scoreFraction = Math.min(wordCount / expectedMinWords, 1);

  // Award 60-90% of max score based on length
  const baseScore = Math.floor(maxScore * (0.6 + scoreFraction * 0.3));

  // Simulate keyword bonuses for higher scores
  const hasComplexTerms =
    studentAnswer.toLowerCase().includes('because') ||
    studentAnswer.toLowerCase().includes('analysis') ||
    studentAnswer.toLowerCase().includes('compare');
  const keywordBonus = hasComplexTerms ? 1 : 0;

  return Math.min(baseScore + keywordBonus, maxScore);
}

function generateMockFeedback(
  subject: string,
  topic: string,
  questionText: string,
  studentAnswer: string,
  difficulty: string
): Omit<EvaluateAnswerResponse, 'questionId'> {
  const maxScore = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
  const score = calculateScore(studentAnswer, difficulty, maxScore);

  // Generic mock evaluations
  const strengthsPool = [
    'Clear explanation of the concept',
    'Mentioned key terminology correctly',
    'Provided relevant examples',
    'Explained the underlying principles',
    'Good understanding of the basics',
    'Covered the main points',
  ];

  const weaknessesPool = [
    'Missing detailed explanation of the mechanism',
    'Did not discuss edge cases',
    'Lacked examples or case studies',
    'Did not mention related concepts',
    'Explanation could be more rigorous',
    'Missing formal mathematical notation',
    'Did not discuss time or space complexity',
    'Incomplete analysis of the topic',
  ];

  const conceptsPool = [
    { concept: 'Definition', status: 'covered' as const },
    { concept: 'Core Principles', status: 'covered' as const },
    { concept: 'Applications', status: 'partial' as const },
    { concept: 'Advanced Analysis', status: 'missing' as const },
    { concept: 'Complexity Analysis', status: 'missing' as const },
  ];

  // Select strengths and weaknesses based on score
  const strengthCount = Math.max(1, Math.floor((score / maxScore) * 3));
  const weaknessCount = Math.max(1, Math.floor(((maxScore - score) / maxScore) * 3));

  const strengths = strengthsPool.slice(0, strengthCount);
  const weaknesses = weaknessesPool.slice(0, weaknessCount);

  // Adjust concept status based on score
  const concepts = conceptsPool.map((c) => {
    if (score / maxScore > 0.8) {
      return { ...c, status: 'covered' as const };
    } else if (score / maxScore > 0.5) {
      return c;
    } else {
      return { ...c, status: 'missing' as const };
    }
  });

  const verdict =
    score / maxScore > 0.8
      ? 'Excellent'
      : score / maxScore > 0.6
        ? 'Good'
        : score / maxScore > 0.4
          ? 'Satisfactory'
          : 'Needs improvement';

  // TODO: Replace with actual LLM call (e.g., OpenAI API)
  // Prompt: "Evaluate this UNDERGRADUATE-LEVEL exam answer for {topic} in {subject}.
  // Question: {questionText}
  // Student Answer: {studentAnswer}
  // Difficulty: {difficulty}
  // Provide structured feedback with strengths, weaknesses, ideal answer, and concept coverage.
  // Do not assess beyond typical undergraduate depth."

  const idealAnswerTemplates: Record<string, string> = {
    'AVL Trees':
      'An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees of any node is at most 1. It maintains O(log n) time complexity for insertion, deletion, and search through rotation operations (single and double rotations). This balancing is crucial to prevent degeneration to linked list behavior.',
    'Hash Tables':
      'A hash table uses a hash function to map keys to indices in an array. It provides O(1) average-case time for insertion, deletion, and lookup. Collisions (when different keys hash to the same index) are handled through techniques like separate chaining (using linked lists) or open addressing (linear/quadratic probing).',
    'Linked Lists':
      'A linked list is a linear data structure where elements (nodes) are connected via pointers. Unlike arrays, linked lists provide O(1) insertion/deletion at known positions but require O(n) access time. They are memory-efficient for sparse data and flexible for dynamic sizing.',
  };

  const idealAnswer =
    idealAnswerTemplates[topic] ||
    `An ideal answer should comprehensively explain ${topic}, covering definition, principles, applications, and complexity analysis relevant to undergraduate level. It should include examples and discuss edge cases or limitations.`;

  return {
    score,
    maxScore,
    verdict,
    strengths,
    weaknesses,
    idealAnswer,
    conceptComparison: concepts,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluateAnswerRequest = await request.json();

    const {
      questionId,
      questionText,
      studentAnswer,
      difficulty,
      subject,
      topic,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      marks = 10,
    } = body;

    if (!questionId || !studentAnswer || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const feedback = generateMockFeedback(
      subject,
      topic,
      questionText,
      studentAnswer,
      difficulty
    );

    const response: EvaluateAnswerResponse = {
      questionId,
      ...feedback,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
