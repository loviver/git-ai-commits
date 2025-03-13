export class AIModel {
  protected readonly apiKey: string | undefined;
  protected baseUrl: string;
  protected context: Record<string, unknown>;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || '';
    this.context = {};
  }

  setContext(context: Record<string, unknown>): void {
    this.context = context;
  }

  addContext(additionalContext: Record<string, unknown>): void {
    this.context = { ...this.context, ...additionalContext };
  }
  protected async makeRequest(
    body: Record<string, unknown>,
    extraHeaders: Record<string, string> = {}
  ): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API Key no configurada');
    }
  
    console.log(`Request time: ${new Date().toISOString()}`);

    console.log(this.baseUrl, extraHeaders);
  
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          ...extraHeaders, // Agrega los headers opcionales
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
      }
  
      return response;
    } catch (error) {
      throw new Error(
        `Error al procesar la solicitud: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  public buildPrompt(prompt: string, context: Record<string, unknown>): string {
    if (Object.keys(context).length > 0) {
        return `Contexto actual: ${JSON.stringify(context)}\n\n${prompt}`;
    }
    return prompt;
  }
}