import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure this module is only used server-side
if (typeof window !== "undefined") {
  throw new Error("This module can only be used server-side");
}

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Generic wrapper for calling Gemini API and expecting JSON response
 * @param prompt - The prompt to send to Gemini
 * @returns Parsed JSON response from Gemini
 */
export async function callGeminiJSON<T = unknown>(prompt: string): Promise<T> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = result.response.text();
    
    // Clean up the response text to extract JSON
    // Gemini might return markdown code blocks or extra text
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
    }
    
    // Parse and return JSON
    return JSON.parse(jsonText.trim()) as T;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to generate response from Gemini: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
