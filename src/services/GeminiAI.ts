type GeminiResponse = {
  candidates: {
      content: {
      parts: [ any ],
      role: string
      };
  }[];
};
  
class GeminiAI {
  private readonly apiKey: string | undefined;
  private context: Record<string, unknown>;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    this.context = {};
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
  }

  setContext(context: Record<string, unknown>): void {
    this.context = context;
  }

  addContext(additionalContext: Record<string, unknown>): void {
    this.context = { ...this.context, ...additionalContext };
  }

  async askQuestion(
      prompt: string,
      customContext?: Record<string, unknown>
  ): Promise<any> {
    if(!this.apiKey) {
      throw new Error('API Key no configurada');
    }
    
    const contextToUse = customContext || this.context;
    const finalPrompt = this.buildPrompt(prompt, contextToUse);

    const requestBody = {
      contents: [
        {parts: [{text: finalPrompt}]}
      ]
    };

    console.log(`geminirequest time: ${new Date().toISOString()}`);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
      }

      const data: GeminiResponse = (await response.json()) as GeminiResponse;

      let res = data.candidates[0].content.parts[0].text;

      const match = res.match(/```json\n([\s\S]*?)\n```/);
      
      if (match) {
        try {
          res = match[1].replace(/^```json\n/, '').replace(/\n```$/, '');

          return JSON.parse(res);
        } catch (error) {

        }
      }

      return res;
    } catch (error) {
      throw new Error(`Error al procesar la solicitud: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildPrompt(prompt: string, context: Record<string, unknown>): string {
    if (Object.keys(context).length > 0) {
        return `Contexto actual: ${JSON.stringify(context)}\n\n${prompt}`;
    }
    return prompt;
  }
}

export default GeminiAI;
  