import * as vscode from 'vscode';
import { getGitBranch, getGitDiff } from './git-service';
import { codeOfuscator } from './ofuscator-service';

import AppConfig from './app-config';
import { AgentManager } from './ai-agent';
import { replacePlaceholders } from '../utils/replace-placeholders';

import generalCommitsPromptDefault from '../prompts/prompt-commits.txt';
import styleConventionalPromptDefault from '../prompts/style-conventional.txt';
import styleEmojisPromptDefault from '../prompts/style-emojis.txt';

import Logger from "./logger";

let agentManager: AgentManager = new AgentManager();

export async function generateCommitMessages(
  extensionContext: vscode.ExtensionContext,
  request?: vscode.ChatRequest, 
  chatContext?: vscode.ChatContext, 
  stream?: vscode.ChatResponseStream, 
  token?: vscode.CancellationToken,
): Promise<string[] | null> {

  agentManager.initializeAgent();

  const branchName = await getGitBranch();
  let diff = await getGitDiff();

  if (!diff || (diff && diff.trim() === "")) {
    return null;
  }

  let ofuscatedCode = codeOfuscator(diff);

  Logger.logJson('diff', {
    diff,
    ofuscatedCode
  });

  const config = vscode.workspace.getConfiguration(AppConfig.name);
  const autoUpdatePrompt = config.get<boolean>('autoUpdatePrompt', true);
  const langCommits = config.get<string>('lang', 'english');
  const conventionName = config.get<string>('convention', 'conventional');
  const customStyle = config.get<string>('customConvention', '{type}: {message}');

  let generalCommitsPrompt = generalCommitsPromptDefault;
  let styleConventionalPrompt = styleConventionalPromptDefault;
  let styleEmojisPrompt = styleEmojisPromptDefault;

  if (autoUpdatePrompt) {
    try {
      const [generalRemote, conventionalRemote, emojisRemote] = await Promise.all([
        fetchPrompt("prompt-commits.txt"),
        fetchPrompt("style-conventional.txt"),
        fetchPrompt("style-emojis.txt"),
      ]);

      generalCommitsPrompt = generalRemote ?? generalCommitsPrompt;
      styleConventionalPrompt = conventionalRemote ?? styleConventionalPrompt;
      styleEmojisPrompt = emojisRemote ?? styleEmojisPrompt;
    } catch (error) {
      Logger.error("Error al obtener los prompts remotos", error);
    }
  }

  const promptStyle = getCommitStyle({
    conventionName,
    promptsToUse: {
      styleConventionalPrompt,
      styleCustomPrompt: customStyle,
      styleEmojisPrompt,
    },
  });

  const improvedPrompt = replacePlaceholders(generalCommitsPrompt, {
    lang: langCommits.trim(),
    style: promptStyle.trim(),
    style_name: conventionName.trim(),
  });

  const response = await agentManager.askQuestion(
    `Task:
      - You are on the branch (${branchName})
      - Analyze the following diff
  
    \`\`\`
    ${ofuscatedCode}
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

async function fetchPrompt(promptName: string): Promise<string | null> {
  const baseUrl = "https://raw.githubusercontent.com/loviver/git-ai-commits-prompts/refs/heads/main/";
  const url = `${baseUrl}${promptName}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

    const responseText = await response.text();
    
    Logger.logJson('fetchPrompt', {
      promptName,
      response: responseText
    });
    
    return responseText;
  } catch (error) {
    vscode.window.showErrorMessage(`⚠️ No se pudo obtener el prompt: ${promptName}`);
    return null;
  }
}
interface GetCommitStyleProps {
  conventionName: string;
  promptsToUse: {
    styleConventionalPrompt: string;
    styleCustomPrompt: string;
    styleEmojisPrompt: string;
  }
}

function getCommitStyle({ 
  conventionName,
  promptsToUse
}: GetCommitStyleProps): string {
  switch (conventionName) {
    case 'gitmoji':
      return promptsToUse.styleEmojisPrompt;
    case 'custom':
      return promptsToUse.styleCustomPrompt;
    default:
      return promptsToUse.styleConventionalPrompt;
  }
}