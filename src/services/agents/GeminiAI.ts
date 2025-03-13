import * as vscode from 'vscode';
import { AIModel } from "./AIModel";
import { doesPromptExceedLimit, ModelsList } from '../token-counter';

type GeminiResponse = {
  candidates: {
    content: {
      parts: [any];
      role: string;
    };
  }[];
};

class GeminiAI extends AIModel {
  constructor(apiKey?: string) {
    super(apiKey);
  }

  async askQuestion(
    prompt: string, 
    customContext?: Record<string, unknown>,
    extensionContext?: vscode.ExtensionContext,
    providerFamily?: string
  ): Promise<any> {
    const contextToUse = customContext || this.context;
    const finalPrompt = this.buildPrompt(prompt, contextToUse);

    const requestBody = {
      contents: [{ parts: [{ text: finalPrompt }] }],
    };

    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

    if(providerFamily) {
      const limitExceed = doesPromptExceedLimit(JSON.stringify(requestBody), providerFamily as ModelsList);
      if(limitExceed) {
        throw new Error('El prompt excede el límite de tokens para el modelo');
      }
    }
  
    const response = await this.makeRequest(requestBody, {
      'Content-Type': 'application/json',
    });
  
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }
  
    const data: GeminiResponse = await response.json();

    let res = data.candidates[0].content.parts[0].text;
  
    const match = res.match(/```json\n([\s\S]*?)\n```/);

    if (match) {
      try {
        res = match[1].replace(/^```json\n/, '').replace(/\n```$/, '');
        return JSON.parse(res);
      } catch (error) {
        console.error('Error al parsear JSON:', error);
      }
    }

    return res;
  }
}

export default GeminiAI;