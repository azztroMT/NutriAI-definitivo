
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis } from "../types";

/**
 * Analyzes a plate image using Gemini 3 Pro Vision capabilities.
 * Always initializes the client with process.env.API_KEY directly to ensure correct configuration.
 */
export const analyzePlate = async (base64Image: string): Promise<NutritionAnalysis> => {
  // Initialize AI client per-request as per coding guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extract base64 data without metadata prefix
  const base64Data = base64Image.split(',')[1] || base64Image;

  const prompt = `
    Analise esta imagem de comida e forneça um relatório nutricional detalhado em PORTUGUÊS (Brasil).
    O retorno deve ser APENAS um JSON válido.
    
    A análise deve ser realista com base nas porções visíveis.
    Campos necessários:
    - plateName: Nome criativo do prato.
    - totalCalories: Estimativa total de calorias (número).
    - macros: Objeto com protein (proteína), carbs (carboidratos) e fats (gorduras) em gramas.
    - ingredients: Lista de componentes com weightGrams (número) e householdMeasure (medida caseira como "1 colher de sopa", "1 concha média", etc).
    - positivePoints: Pontos fortes nutricionais (mínimo 2).
    - attentionPoints: Pontos de atenção como excesso de sódio, baixo teor de fibras, etc.
    - improvementSuggestion: Uma sugestão prática e específica para tornar esta refeição melhor.
  `;

  try {
    // Using gemini-3-pro-preview for complex nutritional reasoning and high-fidelity vision tasks.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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

    // Accessing the text property directly as per best practices.
    const text = response.text;
    if (!text) {
      throw new Error("Resposta vazia da IA");
    }

    return JSON.parse(text) as NutritionAnalysis;
  } catch (error: any) {
    console.error("Erro na análise Gemini:", error);
    throw new Error(error.message || "Não foi possível analisar a imagem.");
  }
};
