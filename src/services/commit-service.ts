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
  commitIdeas?: string
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

  if(autoUpdatePrompt) {
    try {
      const promptFiles = [
        { key: "generalCommitsPrompt", file: "prompt-commits.txt" },
        { key: "styleConventionalPrompt", file: "style-conventional.txt" },
        { key: "styleEmojisPrompt", file: "style-emojis.txt" },
      ];
    
      const prompts: Record<string, string> = {};
    
      const responses = await Promise.all(
        promptFiles.map(({ file }) => fetchPrompt(file))
      );
    
      responses.forEach((response: any, index) => {
        const { key, file } = promptFiles[index];
        
        if (response.status === "success") {
          prompts[key] = response.data;
        } else {
          Logger.error(`Error al obtener ${file}:`, response.error);
        }
      });

      if(prompts.generalCommitsPrompt) {
        generalCommitsPrompt = prompts.generalCommitsPrompt;
        Logger.logJson(`Prompt 'generalCommitsPrompt' actualizado.`, generalCommitsPrompt);
      }
      if(prompts.styleConventionalPrompt) {
        styleConventionalPrompt = prompts.styleConventionalPrompt;
        Logger.log(`Prompt 'styleConventionalPrompt' actualizado.`);
      }
      if(prompts.styleEmojisPrompt) {
        styleEmojisPrompt = prompts.styleEmojisPrompt;
        Logger.log(`Prompt 'styleEmojisPrompt' actualizado.`);
      }
    } catch (error) {
      Logger.error("Error general al obtener los prompts remotos", error);
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
      ${commitIdeas ? `- You have my following commit idea: ${commitIdeas}` : ''}
  
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

async function fetchPrompt(promptName: string): Promise<{
  status: string,
  data: any
}> {
  const baseUrl = "https://raw.githubusercontent.com/loviver/git-ai-commits-prompts/refs/heads/main/";
  const url = `${baseUrl}${promptName}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const responseText = await response.text();

    return {
      status: 'success',
      data: responseText,
    };
  } catch (error: any) {
    return {
      status: 'error',
      data: error.message || 'Error desconocido',
    };
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