"use server";

import { cache } from "react";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

type GenerateArgs = {
  prompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
};

type GeminiContentPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiContentPart[];
  };
};

const loadClient = cache(async () => {
  try {
    const mod = await import("@google/generative-ai");
    const { GoogleGenerativeAI } = mod as typeof import("@google/generative-ai");
    return GoogleGenerativeAI;
  } catch (error) {
    console.warn("Failed to load @google/generative-ai. Falling back to REST fetch.", error);
    return null;
  }
});

function ensureApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return apiKey;
}

function extractJsonPayload(text: string) {
  if (!text) {
    throw new Error("Gemini response was empty");
  }
  const fencedMatch = text.match(/```(?:json)?([\s\S]*?)```/i);
  const cleaned = fencedMatch ? fencedMatch[1] : text;
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini response did not contain JSON");
  }
  const jsonSlice = cleaned.slice(start, end + 1);
  return jsonSlice;
}

async function callWithOfficialClient(args: GenerateArgs) {
  const apiKey = ensureApiKey();
  const GoogleGenerativeAI = await loadClient();
  if (!GoogleGenerativeAI) {
    return null;
  }
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: args.model ?? DEFAULT_MODEL,
  });
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: args.prompt }],
      },
    ],
    generationConfig: {
      temperature: args.temperature ?? 0.6,
      maxOutputTokens: args.maxOutputTokens ?? 2048,
    },
  });
  const text = result.response.text();
  return text;
}

async function callWithRest(args: GenerateArgs) {
  const apiKey = ensureApiKey();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${
      args.model ?? `${DEFAULT_MODEL}`
    }:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: args.prompt }],
          },
        ],
        generationConfig: {
          temperature: args.temperature ?? 0.6,
          maxOutputTokens: args.maxOutputTokens ?? 2048,
        },
      }),
    }
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini REST call failed: ${response.status} ${detail}`);
  }
  const data = (await response.json()) as {
    candidates?: GeminiCandidate[];
  };
  const text = data?.candidates?.map((candidate) => {
    const parts = candidate?.content?.parts ?? [];
    return parts.map((part) => part.text ?? "").join("\n");
  });
  return text?.join("\n\n") ?? "";
}

export async function callGeminiJSON(args: GenerateArgs) {
  const text =
    (await callWithOfficialClient(args)) ?? (await callWithRest(args));
  const jsonPayload = extractJsonPayload(text);
  return JSON.parse(jsonPayload);
}
