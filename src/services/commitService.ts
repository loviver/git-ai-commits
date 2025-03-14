import * as vscode from 'vscode';
import { getGitBranch, getGitDiff } from './gitService';
import { sanitizeDiff } from './sanitizeService';

import prompt from '../prompts/general_prompt_commits.txt';
import style_conventional_prompt from '../prompts/style_conventional.txt';
import style_emojis_prompt from '../prompts/style_emojis.txt';

import AppConfig from './app-config';
import { AgentManager } from './ai-agent';
import { replacePlaceholders } from '../utils/replace-placeholders';

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
  const convention = config.get<string>('convention', 'conventional');

  let style = getCommitStyle(convention, config);

  const improvedPrompt = replacePlaceholders(prompt, {
    lang: langCommits.trim(),
    style: style.trim(),
    style_name: convention.trim()
  });

  console.log(`prompt`, improvedPrompt, convention);

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

function getCommitStyle(convention: string, config: vscode.WorkspaceConfiguration): string {
  switch (convention) {
    case 'gitmoji':
      return style_emojis_prompt;
    case 'custom':
      return config.get<string>('customConvention', '{type}: {message}');
    default:
      return style_conventional_prompt;
  }
}