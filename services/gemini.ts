import { GoogleGenAI } from "@google/genai";
import { ThingSpeakResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeData = async (
  data: ThingSpeakResponse,
  activeFields: string[]
): Promise<string> => {
  try {
    const channelName = data.channel.name;
    const feeds = data.feeds.slice(-20); // Analyze last 20 points to save tokens/context
    
    // Construct a concise context string
    const dataContext = feeds.map(f => {
      const entryParts = [`Time: ${f.created_at}`];
      activeFields.forEach(field => {
        // @ts-ignore - dynamic access
        const val = f[field];
        if (val !== null && val !== undefined) {
          entryParts.push(`${field}: ${val}`);
        }
      });
      return entryParts.join(', ');
    }).join('\n');

    const prompt = `
      You are an expert data analyst. 
      Analyze the following sensor data from a ThingSpeak channel named "${channelName}".
      
      Recent Data Points:
      ${dataContext}

      Provide a brief, high-level summary of the current state and any trends. 
      Identify anomalies if any. 
      If the data represents environmental metrics (temp, humidity), comment on comfort or safety.
      Keep it under 150 words. Format as Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Unable to generate insights at this time. Please check your API configuration.";
  }
};