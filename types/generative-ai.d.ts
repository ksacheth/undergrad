declare module "@google/generative-ai" {
  export interface ContentPart {
    text?: string;
  }

  export interface Content {
    role?: string;
    parts: ContentPart[];
  }

  export interface GenerateContentRequest {
    contents: Content[];
    generationConfig?: Record<string, unknown>;
  }

  export interface GenerateContentResult {
    response: {
      text(): string;
    };
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): {
      generateContent(request: GenerateContentRequest): Promise<GenerateContentResult>;
    };
  }
}
