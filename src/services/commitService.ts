import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import GeminiAI from './GeminiAI';
import { getGitBranch, getGitDiff } from './gitService';
import { sanitizeDiff } from './sanitizeService';

import AppConfig from './app-config';
import { i18n } from "./i18n";

let agentAI: GeminiAI | null = null;

function initializeAgent() {
  const config = vscode.workspace.getConfiguration(AppConfig.name);
  const apiKey = config.get<string>("apiKey") || "";

  if (!apiKey) {
    vscode.window.showErrorMessage(i18n.t("error.noApiKey", { key: AppConfig.name }));
    return false;
  }
  agentAI = new GeminiAI(apiKey);
  return true;
}

export async function generateCommitMessages(context: vscode.ExtensionContext): Promise<string[] | null> {
  if (!agentAI) {
    initializeAgent();
  }

  if (!agentAI) {
    return null;
  }

  const branchName = await getGitBranch();
  let diff = await getGitDiff();

  if (!diff) {
    return [];
  }

  diff = sanitizeDiff(diff);

  const config = vscode.workspace.getConfiguration(AppConfig.name);
  const langCommits = config.get<string>("lang") || "english";
  const promptPath = path.join(context.extensionPath, 'dist', 'prompt.txt');

  let prompt = fs.readFileSync(promptPath, 'utf-8');
  prompt = prompt.replace(`{lang}`, langCommits);

  const response = await agentAI.askQuestion(`
    Task:  
      - Analyze the following diff  

    Context:  
      - You are on the branch (${branchName})  

    \`\`\`
    ${diff}
    \`\`\`
  `, {
    system: prompt,
  });

  return response || [];
}
