import * as vscode from 'vscode';

import { AIModel } from "./AIModel";
import axios from 'axios';
import { doesPromptExceedLimit, ModelsList } from '../token-counter';

class CopilotAI extends AIModel {

  constructor(apiKey?: string) {
    super(apiKey, ``);
    
    this.baseUrl = 'https://api.githubcopilot.com/chat/completions';
  }

  async getToken(access_token: string): Promise<{ token: string; expiresAt: number } | null> {
    if(access_token.length === 0) {
      return null;
    }
    
    const response = await fetch('https://api.github.com/copilot_internal/v2/token', {
      headers: { 'authorization': `token ${access_token}` }
    });
    
    const data = await response.json() as any;
  
    if (!data.token || !data.expires_at) {
      throw new Error("Error al obtener el token de GitHub Copilot");
    }
  
    return { token: data.token, expiresAt: data.expires_at };
  }

  private buildMessages(userQuery: string, context?: Record<string, unknown>): any[] {
    const messages: any[] = [];
    
    if (context && Object.keys(context).length > 0) {
      messages.push({
        role: 'system',
        content: `Contexto actual: ${JSON.stringify(context)}`
      });
    }
    
    // Mensaje principal
    messages.push({
      role: 'user',
      content: `${userQuery}`
    });
    
    return messages;
  }

  async getValidToken(extensionContext: vscode.ExtensionContext): Promise<string | null> {
    const storedToken = await extensionContext.secrets.get("githubToken");
    const storedExpiresAt = await extensionContext.secrets.get("githubTokenExpiresAt");
    const storedTokenAccess = await extensionContext.secrets.get("githubTokenAccess");

    const now = Math.floor(Date.now() / 1000); // Timestamp actual en segundos

    if (storedToken && storedExpiresAt) {
      const expiresAt = parseInt(storedExpiresAt, 10);

      if (expiresAt > now + 300) { // Si el token aún es válido (5 min antes de expirar)
        console.log("🔹 Token aún válido, reutilizando...");
        return storedToken;
      } else {
        console.log("⚠️ Token expirado, obteniendo uno nuevo...");
      }
    } else {
      console.log("ℹ️ No hay token guardado, obteniendo uno nuevo...");
    }

    let tokenAccess = storedTokenAccess;
    if (!tokenAccess) {
      const accessSession = await vscode.authentication.getSession("github", ["repo"], { createIfNone: true });

      tokenAccess = accessSession.accessToken;
      await extensionContext.secrets.store("githubTokenAccess", tokenAccess);
    }

    const tokenResponse = await this.getToken(tokenAccess);

    if (!tokenResponse) {
      return null;
    }

    const { token, expiresAt } = tokenResponse;

    await extensionContext.secrets.store("githubToken", token);
    await extensionContext.secrets.store("githubTokenExpiresAt", expiresAt.toString());

    return token;
  }

  async askQuestion(
    prompt: string, 
    customContext?: Record<string, unknown>, 
    extensionContext?: vscode.ExtensionContext,
    providerFamily?: string
  ): Promise<any> {
    const contextToUse = { ...this.context, ...customContext };
    
    let token: string | null = null;

    if (extensionContext) {
      token = await this.getValidToken(extensionContext);
    }

    if(token === null) {
      throw new Error('No se pudo obtener el token de autenticación');
    }

    const messages = this.buildMessages(prompt, contextToUse);

    if(providerFamily) {
      const limitExceed = doesPromptExceedLimit(JSON.stringify(messages), providerFamily as ModelsList);
      if(limitExceed) {
        throw new Error('El prompt excede el límite de tokens para el modelo');
      }
    }
  
    const response = await axios.post(
      this.baseUrl,
      {
        "model": providerFamily || "gpt-4o-mini",
        "messages": messages,
        "toolsChoice": "auto"
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Editor-Version': `vscode/${vscode.version}`
        }
      }
    );
    
    console.log(response);
    
    let res = (response.data as any).choices[0].message.content;

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

export default CopilotAI;