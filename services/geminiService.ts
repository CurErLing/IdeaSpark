import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedWord } from "../types";

const apiKey = process.env.API_KEY;
// Initialize safely, assuming apiKey exists as per instructions
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateRelatedWords = async (word: string): Promise<GeneratedWord[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return [];
  }

  try {
    const model = "gemini-3-flash-preview";
    
    const prompt = `Generate 6 to 8 functional, practical, creative, divergent, or associative product vocabulary related to the concept of "${word}".
The output must be in Chinese (Simplified).
Return a JSON array.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "The generated related word in Chinese" }
                },
                required: ["text"]
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsed = JSON.parse(jsonText);
    return parsed.items || [];

  } catch (error) {
    console.error("Error generating words:", error);
    return [];
  }
};

export const generatePRD = async (keywords: string[]): Promise<string> => {
  if (!apiKey) return "Error: API Key missing";

  try {
    const model = "gemini-3-pro-preview"; // Use Pro model for complex writing
    const keywordsList = keywords.join(", ");
    
    const prompt = `
      You are an expert Product Manager.
      Create a creative and structured Project Requirement Document (PRD) for a theoretical application or product that combines the following concepts/keywords:
      [${keywordsList}]

      **IMPORTANT: The output must be in Simplified Chinese (简体中文).**

      The output should be in Markdown format.
      Please start the document with a level 1 header (#) containing the Creative Project Name.

      Structure:
      1. **Project Name (项目名称)** (Make this the H1 title)
      2. **Executive Summary (项目摘要)**: What is this product?
      3. **Core Philosophy (核心理念)**: How do these keywords connect conceptually?
      4. **Target Audience (目标用户)**: Who is it for?
      5. **Key Features (核心功能)**: Detailed functional requirements derived from the keywords.
      6. **User Interface (UI) Direction (视觉风格)**: Suggestions for visual style.
      
      Keep it concise, professional, yet inspiring.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Failed to generate PRD.";
  } catch (error) {
    console.error("Error generating PRD:", error);
    return "生成内容出错，请重试。";
  }
};