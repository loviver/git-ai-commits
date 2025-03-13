import * as vscode from 'vscode';
import { getGitBranch, getGitDiff } from './gitService';
import { sanitizeDiff } from './sanitizeService';

import prompt from '../prompt.txt';

import AppConfig from './app-config';
import { AgentManager } from './ai-agent';

let agentManager: AgentManager = new AgentManager();

export async function generateCommitMessages(
  extensionContext: vscode.ExtensionContext,
  request?: vscode.ChatRequest, 
  chatContext?: vscode.ChatContext, 
  stream?: vscode.ChatResponseStream, 
  token?: vscode.CancellationToken
): Promise<string[] | null> {

  agentManager.initializeAgent();

  const branchName = await getGitBranch();
  let diff = await getGitDiff();

  if (!diff) {
    return [];
  }

  diff = sanitizeDiff(diff);

  const config = vscode.workspace.getConfiguration(AppConfig.name);
  const langCommits = config.get<string>("lang") || "english";

  let improvedPrompt = prompt.replace(`{lang}`, langCommits);

  const response = await agentManager.askQuestion(
    `Task:
      - Analyze the following diff
  
    Context:
      - You are on the branch (${branchName})
  
    \`\`\`
    ${diff}
    \`\`\`
    `,
    {
      system: improvedPrompt
    },
    extensionContext
  );
  

  if(response === null) {
    return null;
  }

  return response || [];
}
