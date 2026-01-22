
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis } from "../types";

const MAX_RETRIES = 4;
const RETRY_DELAY = 2000; // 2 segundos base

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzePlate = async (base64Image: string, attempt: number = 0): Promise<NutritionAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = base64Image.split(',')[1] || base64Image;

  const prompt = `
    Como um nutricionista especialista em visão computacional, analise esta imagem de refeição.
    Forneça um relatório nutricional rigoroso em PORTUGUÊS (Brasil).
    
    INSTRUÇÕES:
    1. Identifique todos os itens visíveis.
    2. Estime o peso em gramas e a medida caseira (ex: "2 colheres de servir", "1 unidade média").
    3. Calcule calorias e macronutrientes (Proteínas, Carbos, Gorduras) com base em tabelas nutricionais padrão (TACO/USDA).
    4. Forneça insights comportamentais e sugestões de melhoria.

    O retorno deve ser APENAS um JSON válido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plateName: { type: Type.STRING },
            totalCalories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER }
              },
              required: ["protein", "carbs", "fats"]
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  weightGrams: { type: Type.NUMBER },
                  householdMeasure: { type: Type.STRING }
                },
                required: ["name", "weightGrams", "householdMeasure"]
              }
            },
            positivePoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            attentionPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            improvementSuggestion: { type: Type.STRING }
          },
          required: ["plateName", "totalCalories", "macros", "ingredients", "positivePoints", "attentionPoints", "improvementSuggestion"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as NutritionAnalysis;

  } catch (error) {
    if (attempt < MAX_RETRIES) {
      // Espera um tempo progressivo (2s, 4s, 6s...) antes de tentar de novo
      await sleep(RETRY_DELAY * (attempt + 1));
      return analyzePlate(base64Image, attempt + 1);
    }
    console.error("Erro final após retentativas:", error);
    throw new Error("Sistema em alta demanda. Por favor, tente capturar novamente em instantes.");
  }
};
