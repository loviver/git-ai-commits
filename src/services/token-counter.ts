
export type ModelsList = "gpt-4" | "gpt-4o-mini" | "gemini";

const MODEL_TOKEN_LIMITS = {
  'gpt-4': 8192,  // Límite de tokens para GPT-4
  'gpt-4o-mini': 4096,  // Límite de tokens para GPT-4o-mini
  'gemini': 4096,  // Límite aproximado para Gemini
};

export function doesPromptExceedLimit(prompt: string, model: keyof typeof MODEL_TOKEN_LIMITS): boolean {
  
  return false;
}