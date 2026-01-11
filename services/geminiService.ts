
import { GoogleGenAI, Type } from "@google/genai";
import { Player, GameMessage, DialogueItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePlayerDialogue = async (
  alivePlayers: Player[],
  lastEvents: string[],
  dayCount: number
): Promise<DialogueItem[]> => {
  const model = 'gemini-3-flash-preview';
  
  const playersInfo = alivePlayers.map(p => 
    `Player ${p.id} (${p.name}): ${p.isUser ? 'Human User' : 'AI Agent'}`
  ).join('\n');

  const prompt = `
    You are the game master for a "Mafia" social deduction game set in a Neon Noir world.
    Day: ${dayCount}.
    Events so far: ${lastEvents.join(', ')}.
    Alive players:
    ${playersInfo}

    Task: Generate 3 short, punchy chat messages from 3 DIFFERENT AI players (excluding the User).
    Characters should have personality (gritty, paranoid, calm, or aggressive). 
    They should express suspicion based on the events or just general vibes.
    Keep messages under 15 words.

    Return the dialogue as a JSON array of objects with 'playerId' and 'text'.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              playerId: { type: Type.NUMBER },
              text: { type: Type.STRING }
            },
            required: ["playerId", "text"]
          }
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Dialogue Error:", error);
    return [];
  }
};
