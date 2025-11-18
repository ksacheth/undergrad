# Exam Practice - AI-Powered Question Generation & Evaluation

A responsive web application for undergraduate students to practice exam-style questions using Google's Gemini API. The app generates questions dynamically and provides AI-powered evaluation with detailed feedback.

## Features

- **Question Generation**: Generate exam-style questions with configurable parameters
  - Subject and topic selection
  - Question types: subjective, numerical, or mixed
  - Difficulty levels: easy, medium, hard
  - Custom marks patterns
  - Optional exam style selection (generic, mid-semester, end-semester)

- **Answer Evaluation**: Get instant AI-powered feedback on your answers
  - Score calculation based on max marks
  - Verdict classification (Fully correct, Mostly correct, Partially correct, Incorrect, Off-topic)
  - Detailed strengths and weaknesses analysis
  - Concept coverage tracking (covered, partial, missing, wrong)
  - Side-by-side comparison with ideal answers

- **Previous Papers**: Upload previous year exam papers to extract exam patterns and style

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: Node.js 20+
- **Package Manager**: Bun or npm
- **AI API**: Google Gemini API

## Prerequisites

- Node.js 20+ (or Bun)
- Google Gemini API key ([Get one here](https://ai.google.dev/))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

3. Set up environment variables:
```bash
# Create a .env.local file
echo "GEMINI_API_KEY=your_api_key_here" > .env.local
```

## Running the Application

### Development Mode
```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build
```bash
# Using Bun
bun run build
bun start

# Or using npm
npm run build
npm start
```

## How to Use

1. **Configure Your Session**:
   - Select a subject and topic
   - Choose question type (subjective, numerical, or mixed)
   - Set difficulty level (easy, medium, hard)
   - Choose number of questions (1-20)
   - Optionally set exam style and marks pattern
   - Optionally upload previous year papers

2. **Generate Questions**:
   - Click "Generate Questions" button
   - The app will call Gemini API to generate questions
   - Questions will appear below the form

3. **Answer Questions**:
   - Read each question carefully
   - Type your answer in the text area
   - Click "Validate this Answer" to get feedback

4. **Evaluate All Answers** (Optional):
   - Answer all questions
   - Click "Validate All Answers" to evaluate everything at once

## Project Structure

```
app/
├── layout.tsx                 # Root layout with metadata
├── page.tsx                   # Main page component
├── globals.css                # Global Tailwind styles
└── api/
    ├── generate-questions/
    │   └── route.ts           # API for question generation
    ├── evaluate-answer/
    │   └── route.ts           # API for answer evaluation
    └── upload-papers/
        └── route.ts           # API for paper upload

components/
├── Header.tsx                 # App header
├── ConfigForm.tsx             # Configuration form
├── QuestionsList.tsx          # Questions container
└── QuestionCard.tsx           # Individual question display

lib/
├── gemini.ts                  # Gemini API wrapper
└── prompts.ts                 # Prompt templates and generation
```

## Configuration & Customization

### Adjusting Gemini Prompts

Edit `/lib/prompts.ts` to customize:
- Question generation prompts
- Answer evaluation criteria
- Paper analysis templates

Example:
```typescript
// In lib/prompts.ts
export function createGenerateQuestionsPrompt(input: GenerateQuestionsInput): string {
  // Modify the prompt template here
}
```

### Gemini Integration

The Gemini API integration is in `/lib/gemini.ts`:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function callGeminiJSON(prompt: string): Promise<any> {
  // Uses gemini-1.5-pro model
}
```

To change the model:
```typescript
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); // Change here
```

## Environment Variables

Required:
- `GEMINI_API_KEY`: Your Google Gemini API key (server-side only, never exposed to client)

## API Routes

### POST `/api/generate-questions`
Generates exam-style questions.

**Request:**
```json
{
  "subject": "Physics",
  "topic": "Thermodynamics",
  "questionType": "subjective",
  "difficulty": "medium",
  "numQuestions": 5,
  "examStyle": "mid-semester",
  "marksPattern": "2×5 marks, 3×10 marks",
  "styleSummary": {}
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here",
      "marks": 10,
      "type": "subjective"
    }
  ]
}
```

### POST `/api/evaluate-answer`
Evaluates a student's answer.

**Request:**
```json
{
  "subject": "Physics",
  "topic": "Thermodynamics",
  "questionId": "q1",
  "questionText": "What is entropy?",
  "studentAnswer": "Student's answer here",
  "difficulty": "medium",
  "marks": 10
}
```

**Response:**
```json
{
  "score": 8,
  "maxScore": 10,
  "verdict": "Mostly correct",
  "strengths": ["Mentioned entropy definition", "Good examples"],
  "weaknesses": ["Missed thermodynamic context", "Incomplete"],
  "idealAnswer": "Full ideal answer text",
  "conceptComparison": [
    {
      "concept": "Entropy definition",
      "status": "covered"
    }
  ]
}
```

### POST `/api/upload-papers`
Uploads exam papers for style analysis (MVP - returns mock data).

**Request:** multipart/form-data with PDF files
**Response:**
```json
{
  "styleSummary": {
    "commonVerbs": ["analyze", "explain"],
    "averageMarksPerQuestion": 10,
    "typicalDifficulty": "medium"
  }
}
```

## Architecture Notes

### Server-Side Only Gemini Calls
- All Gemini API calls are made from server-side routes (`app/api/`)
- The `GEMINI_API_KEY` environment variable is never exposed to the client
- Client components use `fetch()` to communicate with API routes

### State Management
- No external state management library (uses React hooks)
- All application state is stored per-session in memory
- Designed to support database integration later (Postgres + Prisma)

### Type Safety
- Full TypeScript support with interfaces for all data structures
- Type-safe API request/response handling
- Type inference for component props

## Styling

The app uses Tailwind CSS 4 with:
- Dark mode support (respects system preferences)
- Responsive design (mobile-first)
- CSS custom properties for theming
- Geist font family for modern look

## Performance Considerations

- API calls are made only when needed
- Loading states provided for all async operations
- Questions are generated in batches (not individually)
- Large textarea content is scrollable to prevent layout issues

## Future Enhancements

- [ ] Database integration (Postgres + Prisma)
- [ ] User authentication and progress tracking
- [ ] PDF parsing for actual paper analysis
- [ ] Question bank storage and management
- [ ] Performance metrics and statistics
- [ ] Multiple question formats (MCQ, True/False, etc.)
- [ ] Answer history and revision tracking
- [ ] Custom rubrics for evaluation

## Troubleshooting

### "GEMINI_API_KEY is not set"
- Ensure `.env.local` file exists with `GEMINI_API_KEY=your_key`
- Restart the development server after adding the env variable

### API calls failing
- Check that the Gemini API key is valid
- Ensure you have API quota remaining
- Check browser console for error details
- Review server logs for detailed error information

### Questions not generating
- Verify subject and topic are filled in
- Check API rate limits on Gemini
- Wait a moment - Gemini API calls can be slow

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
