import { NextRequest, NextResponse } from 'next/server';
import type {
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  Question,
} from '@/app/types';

const SAMPLE_QUESTIONS: Record<string, Record<string, string[]>> = {
  'Data Structures': {
    'AVL Trees': [
      'Explain what an AVL tree is and why it is used in computer science.',
      'Describe the rotation operations in AVL trees. How do single and double rotations differ?',
      'Prove that the height of an AVL tree is O(log n) where n is the number of nodes.',
      'What is the time complexity of insertion, deletion, and search operations in an AVL tree? Explain why.',
      'Compare and contrast AVL trees with Red-Black trees.',
    ],
    'Hash Tables': [
      'Explain how hash tables work and describe the role of a hash function.',
      'What is hash collision? Describe two methods to handle collisions in hash tables.',
      'Analyze the time complexity of hash table operations under ideal and worst-case scenarios.',
      'How does load factor affect hash table performance?',
      'Describe linear probing, quadratic probing, and separate chaining as collision resolution techniques.',
    ],
    'Linked Lists': [
      'What are the advantages and disadvantages of linked lists compared to arrays?',
      'Explain the difference between singly linked lists, doubly linked lists, and circular linked lists.',
      'How would you detect a cycle in a linked list? Discuss the time and space complexity.',
      'Describe how to reverse a linked list. What is the time complexity?',
      'How would you implement a linked list in your programming language of choice?',
    ],
  },
  Thermodynamics: {
    'First Law': [
      'State the first law of thermodynamics and explain its physical meaning.',
      'For an ideal gas, derive the relationship between internal energy and temperature.',
      'Explain the difference between internal energy, heat, and work. How do they relate through the first law?',
      'A gas undergoes an adiabatic process. What can you say about the heat transfer? How does internal energy change?',
      'For a closed system, Q = 50 J and W = 30 J. Calculate the change in internal energy.',
    ],
    'Second Law': [
      'State the second law of thermodynamics using entropy. What does it tell us about natural processes?',
      'Explain the concept of entropy and why it always increases in an isolated system.',
      'What is a reversible process and an irreversible process? How do they differ in terms of entropy change?',
      'Prove that for a Carnot cycle, the entropy change of the universe is zero.',
      'Explain why perpetual motion machines of the second kind are impossible.',
    ],
  },
};

function generateQuestionText(
  subject: string,
  topic: string,
  difficulty: string,
  index: number
): string {
  const questionBank =
    SAMPLE_QUESTIONS[subject]?.[topic] || [
      `${topic} question ${index + 1}`,
      `Explain the key concepts of ${topic}`,
      `Analyze ${topic} in the context of ${subject}`,
      `Discuss the applications of ${topic}`,
      `Compare and contrast different aspects of ${topic}`,
    ];

  const selectedQuestion = questionBank[index % questionBank.length];

  const difficultyPrefix: Record<string, string> = {
    easy: 'Simply ',
    medium: 'Thoroughly ',
    hard: 'Critically analyze and ',
  };

  return (difficultyPrefix[difficulty] || '') + selectedQuestion;
}

function generateMarks(difficulty: string): number {
  const marksMap: Record<string, number> = {
    easy: 5,
    medium: 10,
    hard: 15,
  };
  return marksMap[difficulty] || 10;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await request.json();

    const {
      subject,
      topic,
      difficulty,
      numQuestions,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      examStyle,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      marksPattern,
    } = body;

    if (!subject || !topic || !difficulty || !numQuestions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const questions: Question[] = [];

    // TODO: Replace with actual LLM call (e.g., OpenAI API)
    // Prompt: "Generate {numQuestions} UNDERGRADUATE-LEVEL exam-style questions on {topic} in {subject}.
    // Question type: {questionType}. Difficulty: {difficulty}. Exam style: {examStyle}.
    // Marks pattern: {marksPattern}. Do not exceed typical undergraduate depth."
    // For now, examStyle and marksPattern are captured but not used in mock implementation

    for (let i = 0; i < numQuestions; i++) {
      const questionText = generateQuestionText(subject, topic, difficulty, i);
      const marks = generateMarks(difficulty);

      questions.push({
        id: `q${i + 1}`,
        text: questionText,
        marks,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
      });
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response: GenerateQuestionsResponse = {
      questions,
      sessionId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
