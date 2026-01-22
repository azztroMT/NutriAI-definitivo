
export interface Ingredient {
  name: string;
  weightGrams: number;
  householdMeasure: string;
}

export interface NutritionAnalysis {
  plateName: string;
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  ingredients: Ingredient[];
  positivePoints: string[];
  attentionPoints: string[];
  improvementSuggestion: string;
}

export interface User {
  name: string;
  isLoggedIn: boolean;
}
