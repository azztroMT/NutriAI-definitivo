
import { createClient } from '@supabase/supabase-js';
import { NutritionAnalysis } from '../types';

const supabaseUrl = 'https://xgfzvqdcolrjysfqxqfm.supabase.co';
const supabaseAnonKey = 'sb_publishable_O5N997Cs1xun3vtKfF8VZg_WEdrinf3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const saveAnalysis = async (userName: string, analysis: NutritionAnalysis) => {
  try {
    const { data, error } = await supabase
      .from('nutrition_history')
      .insert([
        {
          user_name: userName,
          plate_name: analysis.plateName,
          total_calories: analysis.totalCalories,
          macros: analysis.macros,
          ingredients: analysis.ingredients,
          positive_points: analysis.positivePoints,
          attention_points: analysis.attentionPoints,
          improvement_suggestion: analysis.improvementSuggestion
        }
      ]);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erro ao salvar no Supabase:", err);
    return null;
  }
};

export const getUserHistory = async (userName: string) => {
  try {
    const { data, error } = await supabase
      .from('nutrition_history')
      .select('*')
      .eq('user_name', userName)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    return [];
  }
};
