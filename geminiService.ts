
import { GoogleGenAI } from "@google/genai";

// NOTE: This assumes the API key is set in the environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Provides AI-powered services using the Gemini API.
 */
export const geminiService = {
  /**
   * Analyzes the current battle situation and returns tactical advice.
   * @param monsterName The name of the monster.
   * @param monsterHp The current HP of the monster.
   * @param maxMonsterHp The maximum HP of the monster.
   * @param partyHp The average current HP of the party.
   * @param maxPartyHp The average maximum HP of the party.
   * @returns A string containing tactical advice.
   */
  async getBattleAnalysis(
    monsterName: string,
    monsterHp: number,
    maxMonsterHp: number,
    partyHp: number,
    maxPartyHp: number
  ): Promise<string> {
    try {
      const monsterHpPercentage = Math.round((monsterHp / maxMonsterHp) * 100);
      const partyHpPercentage = Math.round((partyHp / maxPartyHp) * 100);

      const prompt = `
      You are a master tactician in a fantasy world named 'Vowborne'. Your commander is in a battle and has asked for your analysis.
      Provide a short, insightful, and encouraging piece of tactical advice.
      The advice must be in Korean, under 60 characters, and delivered in a slightly dramatic and cool tone befitting a seasoned strategist.

      Current Situation:
      - Enemy: ${monsterName} (Health: approximately ${monsterHpPercentage}%)
      - Our Party's average health: approximately ${partyHpPercentage}%

      Generate the tactical advice now.
      `;

      // FIX: Use correct model name 'gemini-2.5-flash'
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
      });
      
      // FIX: Use response.text to get the generated content.
      return response.text;
    } catch (error) {
      console.error("Error getting battle analysis:", error);
      return "분석 중 오류가 발생했습니다. 전장의 안개가 너무 짙은 것 같습니다.";
    }
  },
};