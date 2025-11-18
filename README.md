# UNDERGRAD - Exam Practice App

A responsive web application that helps undergraduate students practice exam-style questions using Google's Gemini API for intelligent question generation and answer evaluation.

## Features

- **AI-Powered Question Generation**: Generate custom exam questions using Google's Gemini 1.5 Pro model
- **Intelligent Answer Evaluation**: Get detailed feedback on your answers with scores, strengths, weaknesses, and concept coverage
- **Flexible Configuration**: Customize subject, topic, difficulty, question type, and exam style
- **Interactive Practice Sessions**: Answer questions and receive instant AI-powered feedback
- **Side-by-side Comparison**: Compare your answers with ideal answers
- **Concept Coverage Analysis**: See which concepts you covered, partially covered, or missed
- **Batch Validation**: Validate all answers at once for quick assessment
- **PDF Upload Support**: Upload previous year papers to influence question style (MVP stub)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (gemini-1.5-pro)
- **Runtime**: Node.js 20+
- **Package Manager**: npm (or bun)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd undergrad
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit your `.env.local` file or expose your API key to the client.

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Configure your practice session:
   - Enter subject (e.g., "Data Structures")
   - Enter topic (e.g., "Binary Trees")
   - Select question type (subjective, numerical, or mixed)
   - Choose difficulty level (easy, medium, or hard)
   - Set number of questions (1-20)
   - Optionally set exam style and marks pattern

4. Click "Generate Questions" to create questions

5. Answer the questions in the provided textareas

6. Click "Validate this answer" for individual questions or "Validate All Answers" for batch evaluation

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
undergrad/
├── app/
│   ├── api/
│   │   ├── generate-questions/
│   │   │   └── route.ts          # Question generation API
│   │   ├── evaluate-answer/
│   │   │   └── route.ts          # Answer evaluation API
│   │   └── upload-papers/
│   │       └── route.ts          # PDF upload stub API
│   ├── layout.tsx                # Global layout with header
│   ├── page.tsx                  # Main application page
│   └── globals.css               # Global styles
├── lib/
│   ├── gemini.ts                 # Gemini API wrapper
│   ├── prompts.ts                # Centralized prompt templates
│   └── types.ts                  # TypeScript type definitions
├── public/                       # Static assets
├── .env.local                    # Environment variables (not committed)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Customization

### Adjusting Prompts

All AI prompts are centralized in `lib/prompts.ts`. You can modify:

- **Question Generation**: Edit `createQuestionGenerationPrompt()` to change how questions are generated
- **Answer Evaluation**: Edit `createAnswerEvaluationPrompt()` to change grading criteria

### Changing the AI Model

In `lib/gemini.ts`, you can change the model:
```typescript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
// Change to: "gemini-1.5-flash" for faster, cheaper responses
```

### Adding a Database

The current implementation stores all state in memory (client-side). To add persistence:

1. Install Prisma:
```bash
npm install @prisma/client
npm install -D prisma
```

2. Initialize Prisma with PostgreSQL:
```bash
npx prisma init
```

3. Define your schema in `prisma/schema.prisma`

4. Create migrations and generate client:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Update API routes to save/load data from the database

## API Endpoints

### POST /api/generate-questions

Generates exam questions based on configuration.

**Request Body**:
```json
{
  "subject": "string",
  "topic": "string",
  "questionType": "subjective" | "numerical" | "mixed",
  "difficulty": "easy" | "medium" | "hard",
  "numQuestions": number,
  "examStyle": "string" (optional),
  "marksPattern": "string" (optional),
  "styleSummary": object (optional)
}
```

**Response**:
```json
{
  "questions": [
    {
      "id": "string",
      "text": "string",
      "marks": number
    }
  ]
}
```

### POST /api/evaluate-answer

Evaluates a student's answer to a question.

**Request Body**:
```json
{
  "subject": "string",
  "topic": "string",
  "questionId": "string",
  "questionText": "string",
  "studentAnswer": "string",
  "difficulty": "easy" | "medium" | "hard",
  "marks": number (optional)
}
```

**Response**:
```json
{
  "score": number,
  "maxScore": number,
  "verdict": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "idealAnswer": "string",
  "conceptComparison": [
    {
      "concept": "string",
      "status": "covered" | "partial" | "missing" | "wrong"
    }
  ]
}
```

### POST /api/upload-papers

Stub API for uploading previous year papers (PDF).

**Response**:
```json
{
  "styleSummary": {
    "commonVerbs": ["string"],
    "averageMarksPerQuestion": number,
    "typicalDifficulty": "easy" | "medium" | "hard"
  }
}
```

## Security Considerations

- ✅ API key is stored server-side only (never exposed to client)
- ✅ All Gemini calls are made from API routes (server-side)
- ✅ Input validation on all API endpoints
- ✅ Error handling to prevent information leakage
- ⚠️ No authentication/authorization (add for production)
- ⚠️ No rate limiting (add for production)

## Troubleshooting

### "GEMINI_API_KEY is not configured" error

Make sure you have created a `.env.local` file with your API key:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

Restart the development server after adding the environment variable.

### Build fails with font errors

If you encounter issues with Google Fonts, the app has been configured to use system fonts instead.

### Questions don't match the specified format

The AI model may occasionally return responses in a different format. The app attempts to parse JSON from markdown code blocks, but if issues persist, check the prompts in `lib/prompts.ts`.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Google Gemini API](https://ai.google.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
