import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis } from "../types";

export const analyzePlate = async (base64Image: string): Promise<NutritionAnalysis> => {
  // Inicializa o cliente com a chave de ambiente injetada pelo Vite/Netlify
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
    if (!text) throw new Error("A IA não retornou dados.");
    return JSON.parse(text) as NutritionAnalysis;
  } catch (error: any) {
    console.error("Erro NutriAI:", error);
    throw new Error("Não foi possível analisar a imagem. Verifique a API KEY ou a qualidade da foto.");
  }
};