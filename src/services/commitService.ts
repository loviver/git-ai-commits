import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import GeminiAI from './GeminiAI';
import { getGitDiff } from './gitService';
import { sanitizeDiff } from './sanitizeService';

let agentAI: GeminiAI | null = null;

function initializeAgent() {
  const config = vscode.workspace.getConfiguration("gitAiCommits");
  const apiKey = config.get<string>("apiKey") || "";

  if (!apiKey) {
    vscode.window.showErrorMessage("No API Key found. Please set 'gitAiCommits.apiKey' in settings.");
    return;
  }
  agentAI = new GeminiAI(apiKey);
}

export async function generateCommitMessages(context: vscode.ExtensionContext): Promise<string[]> {
  if (!agentAI) {
    initializeAgent();
  }
  if (!agentAI) {
    return [];
  }

  let diff = await getGitDiff();
  if (!diff) {
    return [];
  }

  diff = sanitizeDiff(diff);

  const config = vscode.workspace.getConfiguration("gitAiCommits");
  const langCommits = config.get<string>("lang") || "english";
  const promptPath = path.join(context.extensionPath, 'dist', 'prompt.txt');

  let prompt = fs.readFileSync(promptPath, 'utf-8');
  prompt = prompt.replace(`{lang}`, langCommits);

  const response = await agentAI.askQuestion(`
    analiza el siguiente diff y genera la lista de commits en formato JSON válido:

    \`\`\`
    ${diff}
    \`\`\`
  `, {
    system: prompt,
  });

  return response || [];
}
