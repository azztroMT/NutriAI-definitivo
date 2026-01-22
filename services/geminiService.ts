
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis } from "../types";

export const analyzePlate = async (base64Image: string): Promise<NutritionAnalysis> => {
  // Inicializa o cliente com a chave de ambiente do Netlify
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const base64Data = base64Image.split(',')[1] || base64Image;

  const prompt = `
    Analise esta imagem de comida e forneça um relatório nutricional detalhado em PORTUGUÊS (Brasil).
    O retorno deve ser APENAS um JSON válido seguindo exatamente a estrutura do schema fornecido.
    
    A análise deve ser baseada no que é visível na imagem.
    - plateName: Nome do prato.
    - totalCalories: Calorias totais (número).
    - macros: protein, carbs, fats (números).
    - ingredients: lista com name, weightGrams e householdMeasure.
    - positivePoints: 2 a 3 pontos positivos.
    - attentionPoints: pontos de atenção.
    - improvementSuggestion: uma dica para melhorar a refeição.
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
    if (!text) throw new Error("Resposta vazia da IA");
    return JSON.parse(text) as NutritionAnalysis;
  } catch (error: any) {
    console.error("Erro NutriAI:", error);
    throw new Error("Erro na análise. Verifique sua conexão ou API KEY.");
  }
};
