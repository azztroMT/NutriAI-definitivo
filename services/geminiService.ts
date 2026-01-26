
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis } from "../types";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzePlate = async (
  base64Image: string, 
  keyIndex: number = 0, 
  attempt: number = 0
): Promise<NutritionAnalysis> => {
  
  // Lista de chaves injetadas via vite.config.ts
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_SECONDARY,
    process.env.API_KEY_TERTIARY
  ].filter(k => k && k !== 'undefined' && k !== 'null' && k !== '');

  if (keys.length === 0) {
    throw new Error("Nenhuma chave de API configurada.");
  }

  if (keyIndex >= keys.length) {
    throw new Error("Limite de requisições excedido em todas as contas.");
  }

  const currentKey = keys[keyIndex];
  const ai = new GoogleGenAI({ apiKey: currentKey });
  const base64Data = base64Image.split(',')[1] || base64Image;

  const prompt = `
    Como um nutricionista especialista em visão computacional, analise esta imagem de refeição.
    Forneça um relatório nutricional rigoroso em PORTUGUÊS (Brasil).
    
    INSTRUÇÕES:
    1. Identifique todos os itens visíveis.
    2. Estime o peso em gramas e a medida caseira.
    3. Calcule calorias e macronutrientes (Proteínas, Carbos, Gorduras).
    4. Forneça insights comportamentais e sugestões de melhoria.

    O retorno deve ser APENAS um JSON válido seguindo estritamente o esquema fornecido.
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
    if (!text) throw new Error("A IA retornou um conteúdo vazio.");
    
    return JSON.parse(text) as NutritionAnalysis;

  } catch (error: any) {
    const errorMsg = (error.message || "").toLowerCase();
    const isQuotaError = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("limit");

    if (isQuotaError && keyIndex < keys.length - 1) {
      return analyzePlate(base64Image, keyIndex + 1, 0);
    }

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY * (attempt + 1));
      return analyzePlate(base64Image, keyIndex, attempt + 1);
    }

    throw error;
  }
};
