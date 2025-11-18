# Undergrad Practice Studio

A Next.js 14 (App Router) MVP that helps UNDERGRAD students drill exam-style questions with Google Gemini. Students configure a session, optionally upload previous exam PDFs, and get instant feedback plus AI grading for every response.

## Getting started

1. Install dependencies:

```bash
npm install
```

> The project depends on `@google/generative-ai`. If you are working offline, install dependencies once you regain network connectivity.

2. Provide your Gemini API key (server side only) by creating `.env.local`:

```
GEMINI_API_KEY=your_key_here
```

3. Run the dev server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Key files

| Location | Purpose |
| --- | --- |
| `app/page.tsx` | Single-page experience with the configuration form, question list, and evaluation UI. |
| `app/api/generate-questions/route.ts` | Server route that builds the Gemini prompt for question generation. |
| `app/api/evaluate-answer/route.ts` | Server route for grading student answers. |
| `app/api/upload-papers/route.ts` | Multipart endpoint (stub) that produces a mock `styleSummary` for uploaded PDFs. |
| `lib/prompts.ts` | Centralized prompt builders for generation and evaluation. Update prompt language here. |
| `lib/gemini.ts` | Secure server-side helper that calls Gemini (prefers the official Node SDK and falls back to REST). |
| `lib/types.ts` | Shared TypeScript contracts for configs, questions, and grading responses. |

## Gemini usage

All calls to Gemini happen server-side via `lib/gemini.ts`. The helper:

- Loads `@google/generative-ai` when available (preferred path).
- Falls back to the official HTTPS endpoint when the SDK cannot be loaded (e.g., offline development).
- Cleans the text output and safely parses strict JSON responses.

## Upload flow

The `/api/upload-papers` route currently stubs PDF processing and returns a lightweight `styleSummary`. The UI displays this summary and forwards it to Gemini so you can later plug in a real PDF parser or a database-backed workflow without touching the front-end.

## Styling

Tailwind CSS (v4) is used via `@import "tailwindcss";` in `app/globals.css`. No extra configuration is required—utility classes are written inline throughout the App Router files.
