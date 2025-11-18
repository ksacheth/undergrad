# Exam Practice Web App

A responsive Next.js 14+ application that helps undergraduate students master their courses by generating exam-style questions and providing AI-powered feedback.

## Features

✅ **Question Generation** - Generate exam-style questions based on subject, topic, difficulty, and question type
✅ **Answer Validation** - Get instant feedback on your answers with scores, strengths, and weaknesses
✅ **Concept Coverage** - Track which concepts you've covered, partially covered, or missed
✅ **Answer Comparison** - See side-by-side comparison of your answer vs. the ideal answer
✅ **Paper Upload** (Optional) - Upload previous exam papers to infer exam style
✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
✅ **Type-Safe** - Built with TypeScript for full type safety

## Tech Stack

- **Next.js 14+** - React App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS 4** - Utility-first styling
- **React 19** - Latest React features
- **Geist Font** - Modern typography

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or bun

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd exam-practice

# Install dependencies
npm install
# or
yarn install
# or
bun install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── layout.tsx                    # Root layout with navbar and footer
├── page.tsx                      # Main page with form and practice session
├── globals.css                   # Global Tailwind styles
├── types.ts                      # TypeScript interfaces
├── components/
│   ├── QuestionForm.tsx          # Configuration form component
│   ├── QuestionCard.tsx          # Individual question card
│   └── FeedbackPanel.tsx         # Feedback display component
└── api/
    ├── generate-questions/
    │   └── route.ts              # Generate questions endpoint
    ├── evaluate-answer/
    │   └── route.ts              # Evaluate answers endpoint
    └── upload-papers/
        └── route.ts              # Upload and parse papers endpoint
```

## API Endpoints

### POST `/api/generate-questions`

Generates exam-style questions based on parameters.

**Request:**
```json
{
  "subject": "Data Structures",
  "topic": "AVL Trees",
  "questionType": "subjective",
  "difficulty": "medium",
  "numQuestions": 5,
  "examStyle": "mid-sem",
  "marksPattern": "2×5 marks, 3×10 marks",
  "paperStyleSummary": {} // Optional, from paper upload
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Explain what an AVL tree is...",
      "marks": 10,
      "difficulty": "medium"
    }
  ],
  "sessionId": "session_1234567890"
}
```

### POST `/api/evaluate-answer`

Evaluates a student's answer and provides feedback.

**Request:**
```json
{
  "subject": "Data Structures",
  "topic": "AVL Trees",
  "questionId": "q1",
  "questionText": "Explain what an AVL tree is...",
  "studentAnswer": "An AVL tree is...",
  "difficulty": "medium",
  "marks": 10
}
```

**Response:**
```json
{
  "questionId": "q1",
  "score": 7,
  "maxScore": 10,
  "verdict": "Good",
  "strengths": [
    "Clear explanation",
    "Mentioned key concepts"
  ],
  "weaknesses": [
    "Missing rotation types",
    "Incomplete analysis"
  ],
  "idealAnswer": "An AVL tree is a self-balancing...",
  "conceptComparison": [
    { "concept": "Definition", "status": "covered" },
    { "concept": "Rotations", "status": "partial" },
    { "concept": "Complexity", "status": "missing" }
  ]
}
```

### POST `/api/upload-papers`

Uploads previous exam papers and analyzes their style.

**Request:** multipart/form-data with multiple `files` (PDF)

**Response:**
```json
{
  "styleSummary": {
    "commonVerbs": ["Explain", "Derive", "Prove"],
    "averageMarksPerQuestion": 10,
    "typicalDifficulty": "medium"
  },
  "fileCount": 2,
  "fileNames": ["paper_2023.pdf", "paper_2022.pdf"]
}
```

## Data Flow

1. **Configuration** - Student fills out the form with subject, topic, difficulty, etc.
2. **Question Generation** - Frontend calls `/api/generate-questions` with form data
3. **Answer Input** - Student types answers in provided textareas
4. **Validation** - Student clicks "Validate" button for single or all answers
5. **Evaluation** - Frontend calls `/api/evaluate-answer` for each answer
6. **Feedback Display** - Score, strengths, weaknesses, and concept coverage shown
7. **Comparison** - Student can view their answer vs. ideal answer side-by-side

## State Management

- **React Hooks** - useState for form state, answers, and UI state
- **Client-side only** - All session data stored in React state (no database for MVP)
- **In-memory** - Questions and answers reset on page reload (by design for MVP)

## Extending with a Real Database

To add persistent storage later:

1. **Set up database** - PostgreSQL + Prisma recommended
2. **Create schema** - Users, Sessions, Questions, Answers, Evaluations
3. **Add authentication** - NextAuth.js or similar
4. **Replace in-memory logic** - Update API routes to use Prisma queries

## Integrating Real LLM

To replace mock LLM logic with real API calls:

### In `/api/generate-questions/route.ts`:

```typescript
// Replace the mock question generation with:
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'system',
      content: 'Generate UNDERGRADUATE-LEVEL exam questions. Do not exceed typical undergrad depth.',
    },
    {
      role: 'user',
      content: `Generate ${numQuestions} ${questionType} exam questions for ${topic} in ${subject} at ${difficulty} level. Format as JSON array with {id, text, marks, difficulty}.`,
    },
  ],
});

const questions = JSON.parse(response.choices[0].message.content);
```

### In `/api/evaluate-answer/route.ts`:

```typescript
// Replace the mock evaluation with:
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'system',
      content: 'Evaluate UNDERGRADUATE-LEVEL exam answers. Be rigorous but fair.',
    },
    {
      role: 'user',
      content: `Evaluate this answer to the question: "${questionText}"\n\nStudent Answer: "${studentAnswer}"\n\nProvide feedback as JSON with {score, maxScore, verdict, strengths, weaknesses, idealAnswer, conceptComparison}.`,
    },
  ],
});

const evaluation = JSON.parse(response.choices[0].message.content);
```

### Paper Parsing (in `/api/upload-papers/route.ts`):

```typescript
import pdf from 'pdf-parse';

for (const file of fileEntries) {
  if (file instanceof File) {
    const buffer = await file.arrayBuffer();
    const pdfData = await pdf(buffer);
    const text = pdfData.text;
    
    // Analyze text for style patterns
    // Extract common verbs, marks, difficulty
  }
}
```

## Undergraduate-Level Focus

This app is designed specifically for undergraduate students:

- Questions are styled and difficulty-calibrated for typical undergrad exams
- Questions cover undergrad-level depth (not research-level or advanced grad material)
- All LLM prompts include constraints to maintain undergrad level
- Evaluation feedback is supportive and educational, not overly critical

## Styling

- **Tailwind CSS 4** via PostCSS
- **Color scheme** - Professional blue/green/red with gray neutrals
- **Responsive** - Mobile-first design with sm/md/lg breakpoints
- **Dark mode ready** - Uses CSS variables (easily extensible)
- **Accessibility** - Semantic HTML, proper ARIA labels, keyboard navigation

## Performance

- **Code splitting** - Next.js automatic chunking
- **Image optimization** - Next/Image (not used in MVP, can add diagrams later)
- **API caching** - No caching by design for MVP (fresh data each session)

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Save and track progress across sessions
- [ ] Real LLM integration (OpenAI, Anthropic, etc.)
- [ ] PDF parsing and style analysis
- [ ] LaTeX/Math rendering support
- [ ] Peer discussion features
- [ ] Performance analytics dashboard
- [ ] Export answers as PDF
- [ ] Mobile app (React Native)

## License

MIT

## Contributing

Contributions are welcome! Please follow the existing code style and patterns.

## Support

For issues or questions, please create an issue on the repository.

---

**Built with ❤️ to help students master their courses.**
