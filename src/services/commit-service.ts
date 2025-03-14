import * as vscode from 'vscode';
import { getGitBranch, getGitDiff } from './git-service';
import { codeOfuscator } from './ofuscator-service';

import generalCommitsPrompt from '../prompts/prompt-commits.txt';
import styleConventionalPrompt from '../prompts/style-conventional.txt';
import styleEmojisPrompt from '../prompts/style-emojis.txt';

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

  diff = codeOfuscator(diff);

  const config = vscode.workspace.getConfiguration(AppConfig.name);
  const langCommits = config.get<string>("lang") || "english";
  const convention = config.get<string>('convention', 'conventional');

  let style = getCommitStyle(convention, config);

  const improvedPrompt = replacePlaceholders(generalCommitsPrompt, {
    lang: langCommits.trim(),
    style: style.trim(),
    style_name: convention.trim()
  });

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
      return styleEmojisPrompt;
    case 'custom':
      const custom = config.get<string>('customConvention', '{type}: {message}');
      return custom;
    default:
      return styleConventionalPrompt;
  }
}