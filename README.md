# Undergrad Practice Studio

A Next.js 14 (App Router) playground that helps undergraduate students drill subjects by generating mock exam questions, answering them, and receiving instant feedback powered by LLM-ready stubs.

## Tech stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS v4
- Mock API routes that can later call real LLMs (OpenAI, etc.)

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to try the flow:

1. Configure the subject, topic, difficulty, and exam style.
2. (Optional) Upload PDF question papers – the `/api/upload-papers` route extracts a mock `styleSummary` and keeps it in memory.
3. Generate questions via `/api/generate-questions` and answer them in the UI.
4. Validate answers individually or in bulk – the `/api/evaluate-answer` route runs a deterministic heuristic to mimic an LLM verdict.

## Where to plug in real AI logic

- `app/api/generate-questions/route.ts` – replace the placeholder question builder with a real LLM call. Keep prompts constrained to **UNDERGRADUATE** exam depth.
- `app/api/evaluate-answer/route.ts` – swap the heuristic evaluator with your preferred LLM for grading, using the same response schema.
- `app/api/upload-papers/route.ts` – integrate PDF parsing (e.g., LangChain + cloud storage) to build richer `styleSummary` data.

All data currently lives in client state, so feel free to add a database (Prisma + Postgres, Supabase, etc.) when you are ready to persist sessions.
