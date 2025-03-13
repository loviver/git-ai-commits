import * as vscode from 'vscode';
import AppConfig from './app-config';

import GeminiAI from './agents/GeminiAI';

import { i18n } from "./i18n";
import CopilotAI from './agents/CopilotAI';

export class AgentManager {
  private agentAI: GeminiAI | null = null;
  private currentProvider: string | null = null;

  public async initializeAgent(apiParamKey?: string): Promise<boolean> {
    const config = vscode.workspace.getConfiguration(AppConfig.name);
    
    this.currentProvider = config.get<string>("aiProvider") || AppConfig.defaultAiModel;

    const apiKey = !apiParamKey ? (config.get<string>("apiKey") || null) : apiParamKey;

    if(!apiKey) {
      vscode.window.showErrorMessage(i18n.t("error.noApiKey", { key: AppConfig.name }));
      return false;
    }

    this.agentAI = this.currentProvider === "gemini" ? new GeminiAI(apiKey) : new CopilotAI(apiKey);
    return true;
  }

  public async askQuestion(
    prompt: string,
    customContext?: Record<string, unknown>,
    extensionContext?: vscode.ExtensionContext
  ): Promise<any> {
    if (!this.agentAI) {
      await this.initializeAgent();
    }

    const [
      providerName,
      providerFamily
    ] = (this.currentProvider || "").split("+");
    
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generando commits con ${providerName ?? '[no provider]'} [${providerFamily ?? "unique"}]...`,
        cancellable: false
      },
      async (progress) => {
        try {
          return await this.agentAI?.askQuestion(prompt, customContext, extensionContext, providerFamily ?? providerName);
        } catch (error: any) {
          console.log(error.response?.data)

          const errorMessage = error.response?.data?.error?.message || error.message || "Error no clasificado";

          if(errorMessage.includes("exceeds the limit of")) {
            vscode.window.showErrorMessage(`Tu staged area es muy grande, intenta hacer commits más pequeños`);
          }
          else {
            
            vscode.window.showErrorMessage("Error generando commits: " + errorMessage);
          }
          return null;
        }
      }
    );
  }

  public async getAgent(): Promise<GeminiAI | null> {
    if (!this.agentAI) {
      await this.initializeAgent();
    }
    return this.agentAI;
  }

  public getCurrentProvider(): string | null {
    return this.currentProvider;
  }
}

export default new AgentManager();