import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getGitBranch, getGitDiff } from "./git-service";
import { codeOfuscator } from "./ofuscator-service";

import AppConfig from "./app-config";
import { AgentManager } from "./ai-agent";
import { replacePlaceholders } from "../utils/replace-placeholders";

import generalCommitsPromptDefault from "../prompts/prompt-commits.txt";
import styleConventionalPromptDefault from "../prompts/style-conventional.txt";
import styleEmojisPromptDefault from "../prompts/style-emojis.txt";

import Logger from "./logger";

let agentManager: AgentManager = new AgentManager();

// Nombre del archivo de reglas personalizado
const CUSTOM_RULES_FILENAME = ".git-ai-commits.rules";

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

  /*
  Logger.logJson("diff", {
    diff,
    ofuscatedCode,
  });
  */

  const config = vscode.workspace.getConfiguration(AppConfig.name);
  const autoUpdatePrompt = config.get<boolean>("autoUpdatePrompt", true);
  const langCommits = config.get<string>("lang", "english");
  const conventionName = config.get<string>("convention", "conventional");
  const customStyle = config.get<string>(
    "customConvention",
    "{type}: {message}"
  );

  let generalCommitsPrompt = generalCommitsPromptDefault;
  let styleConventionalPrompt = styleConventionalPromptDefault;
  let styleEmojisPrompt = styleEmojisPromptDefault;

  if (autoUpdatePrompt) {
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

      if (prompts.generalCommitsPrompt) {
        generalCommitsPrompt = prompts.generalCommitsPrompt;
        /*
        Logger.logJson(
          `Prompt 'generalCommitsPrompt' actualizado.`,
          generalCommitsPrompt
        );
        */
      }
      if (prompts.styleConventionalPrompt) {
        styleConventionalPrompt = prompts.styleConventionalPrompt;
        //Logger.log(`Prompt 'styleConventionalPrompt' actualizado.`);
      }
      if (prompts.styleEmojisPrompt) {
        styleEmojisPrompt = prompts.styleEmojisPrompt;
        //Logger.log(`Prompt 'styleEmojisPrompt' actualizado.`);
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

  // Leer reglas personalizadas del proyecto (si existen)
  const customProjectRules = await readCustomProjectRules();

  let finalPrompt = replacePlaceholders(generalCommitsPrompt, {
    lang: langCommits.trim(),
    style: promptStyle.trim(),
    style_name: conventionName.trim(),
  });

  // Si existen reglas personalizadas, integrarlas con prioridad
  if (customProjectRules) {
    finalPrompt = `${finalPrompt}

## REGLAS PERSONALIZADAS DEL PROYECTO (PRIORIDAD ALTA)
${customProjectRules}

IMPORTANTE: Las reglas personalizadas del proyecto tienen prioridad absoluta sobre cualquier otra instrucción anterior. Debes seguir estas reglas específicas del proyecto por encima de todo.`;
  }

  Logger.logJson("finalPrompt", {
    finalPrompt,
    customProjectRules,
  });

  const response = await agentManager.askQuestion(
    `Task:
      - You are on the branch (${branchName})
      - Analyze the following diff
      ${
        commitIdeas ? `- You have my following commit idea: ${commitIdeas}` : ""
      }
  
    \`\`\`
    ${ofuscatedCode}
    \`\`\`
    `,
    {
      system: finalPrompt,
    },
    extensionContext
  );

  if (response === null) {
    return null;
  }

  return response || [];
}

/**
 * Detecta y lee el archivo de reglas personalizado del proyecto
 * @returns Las reglas personalizadas como string o null si no existe
 */
async function readCustomProjectRules(): Promise<string | null> {
  try {
    // Obtener el workspace root
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      Logger.log("No workspace folder found, no custom rules to load");
      return null;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const rulesFilePath = path.join(workspaceRoot, CUSTOM_RULES_FILENAME);

    // Verificar si el archivo existe
    if (!fs.existsSync(rulesFilePath)) {
      Logger.log(`Custom rules file not found: ${CUSTOM_RULES_FILENAME}`);
      return null;
    }

    // Leer el archivo
    const customRules = fs.readFileSync(rulesFilePath, "utf8").trim();

    if (!customRules) {
      Logger.log(`Custom rules file is empty: ${CUSTOM_RULES_FILENAME}`);
      return null;
    }

    Logger.log(`✅ Custom rules loaded from: ${CUSTOM_RULES_FILENAME}`);
    Logger.log(
      `📝 Custom rules will override default behavior with HIGH PRIORITY`
    );

    return customRules;
  } catch (error) {
    Logger.error(
      `Error reading custom rules file (${CUSTOM_RULES_FILENAME}):`,
      error
    );
    return null;
  }
}

async function fetchPrompt(promptName: string): Promise<{
  status: string;
  data: any;
}> {
  const baseUrl =
    "https://raw.githubusercontent.com/loviver/git-ai-commits-prompts/refs/heads/main/";
  const url = `${baseUrl}${promptName}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const responseText = await response.text();

    return {
      status: "success",
      data: responseText,
    };
  } catch (error: any) {
    return {
      status: "error",
      data: error.message || "Error desconocido",
    };
  }
}
interface GetCommitStyleProps {
  conventionName: string;
  promptsToUse: {
    styleConventionalPrompt: string;
    styleCustomPrompt: string;
    styleEmojisPrompt: string;
  };
}

function getCommitStyle({
  conventionName,
  promptsToUse,
}: GetCommitStyleProps): string {
  switch (conventionName) {
    case "gitmoji":
      return promptsToUse.styleEmojisPrompt;
    case "custom":
      return promptsToUse.styleCustomPrompt;
    default:
      return promptsToUse.styleConventionalPrompt;
  }
}
