import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are the "Advisor Agent" for AgenticAI, a tax filing platform.
Your goal is to help users with tax-related questions, explain deductions, and identify audit risks.
You are professional, empathetic, and precise.

Key Guidelines:
1. If a user asks about a specific deduction, explain IRS guidelines simply.
2. CPA Fallback: If the user's query or identified risks suggest a high level of complexity, ambiguity, or potential for significant financial impact (e.g., high-risk audit flags), you MUST explicitly suggest consulting a certified CPA. Do this *after* providing your best AI-generated explanation to ensure the user is still helpful but safe.
3. Be concise. Keep answers under 150 words unless asked for details.
4. You have access to "Memory Agent" context (simulated), so you can refer to "last year's return" generally.
5. If the user asks to file, tell them the "Filing Agent" will handle the final submission once they review.

Disclaimer: Always remind users you are an AI assistant and they should verify with a professional for legal certainty.
`;

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    // Transform internal message format to API format
    // Note: In a real app, we would maintain a ChatSession instance.
    // For this stateless demo, we construct a single turn prompt or restart.
    
    // Using generateContent for a single turn response based on context for simplicity in this demo structure
    const prompt = `
      ${SYSTEM_INSTRUCTION}

      Conversation History:
      ${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

      USER: ${newMessage}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I'm having trouble connecting to the tax knowledge base right now.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I'm currently unable to process that request. Please try again later or consult the FAQ.";
  }
};