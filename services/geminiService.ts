
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis } from "../types";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Realiza a análise nutricional da imagem com suporte a rotação de múltiplas chaves.
 * @param base64Image Imagem em base64
 * @param keyIndex Índice da chave de API a ser utilizada (0: primária, 1: secundária, 2: terciária)
 * @param attempt Número da tentativa atual para a chave selecionada
 */
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

  // Se o índice exceder o número de chaves disponíveis, todas falharam
  if (keyIndex >= keys.length) {
    throw new Error("Limite de requisições excedido em todas as contas (Primária, Secundária e Terciária).");
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
    if (!text) throw new Error("A IA retornou um conteúdo vazio.");
    
    return JSON.parse(text) as NutritionAnalysis;

  } catch (error: any) {
    const errorMsg = (error.message || "").toLowerCase();
    
    // Identifica erros de cota (Status 429 ou mensagens de limite atingido)
    const isQuotaError = 
      errorMsg.includes("429") || 
      errorMsg.includes("quota") || 
      errorMsg.includes("exhausted") || 
      errorMsg.includes("limit");

    // Se a cota acabou e há uma próxima chave na lista, alterna imediatamente
    if (isQuotaError && keyIndex < keys.length - 1) {
      console.warn(`[NutriAI] Chave ${keyIndex + 1} esgotada. Alternando para próxima chave disponível (Índice: ${keyIndex + 1})...`);
      return analyzePlate(base64Image, keyIndex + 1, 0);
    }

    // Para outros erros transitórios (conexão, etc), aplica retentativa na mesma chave
    if (attempt < MAX_RETRIES) {
      const waitTime = RETRY_DELAY * (attempt + 1);
      console.log(`[NutriAI] Erro na tentativa ${attempt + 1}. Retentando em ${waitTime}ms...`);
      await sleep(waitTime);
      return analyzePlate(base64Image, keyIndex, attempt + 1);
    }

    console.error("[NutriAI] Falha crítica após todas as tentativas e rotação de chaves:", error);
    throw new Error(isQuotaError ? "Cota de IA esgotada em todas as contas." : "Instabilidade técnica no serviço de IA. Tente novamente.");
  }
};
