import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export interface MoodAnalysisResult {
  genres: string[];
  keywords: string[];
}

export async function analyzeMood(moodText: string): Promise<MoodAnalysisResult> {
  try {
    const systemPrompt = `You are a music expert specializing in mood analysis. 
Analyze the given mood/feeling and provide 5 music genres or keywords that best match this mood.
Consider the emotional tone, energy level, and musical preferences that would complement this mood.
Respond with JSON in this exact format: 
{"genres": ["genre1", "genre2", "genre3", "genre4", "genre5"]}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            genres: {
              type: "array",
              items: { type: "string" },
              minItems: 5,
              maxItems: 5
            }
          },
          required: ["genres"],
        },
      },
      contents: moodText,
    });

    const rawJson = response.text;
    
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return {
        genres: data.genres,
        keywords: data.genres
      };
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Failed to analyze mood:", error);
    // Fallback to generic keywords
    return {
      genres: ["pop", "indie", "electronic", "rock", "alternative"],
      keywords: ["pop", "indie", "electronic", "rock", "alternative"]
    };
  }
}
