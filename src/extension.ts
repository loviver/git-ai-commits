import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import { generateCommitMessages } from './services/commit-service';
import { i18n } from './services/i18n';
import Logger from './services/logger';

export async function activate(
  extensionContext: vscode.ExtensionContext,
  request: vscode.ChatRequest,
  chatContext: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {
  const commands = [
    vscode.commands.registerCommand('git-ai-commits.requestSuggestions', async () => {
      return requestCommitSuggestions(extensionContext, request, chatContext, stream, token);
    }),
    vscode.commands.registerCommand('git-ai-commits.writeCommitIdea', async () => {
      const commitIdea = await vscode.window.showInputBox({
        prompt: "Describe tu idea para el commit",
        placeHolder: "Añadir validación en el formulario...",
        ignoreFocusOut: true
      });
    
      if (!commitIdea) {
        vscode.window.showWarningMessage("No ingresaste una idea para el commit.");
        return;
      }
    
      requestCommitSuggestions(extensionContext, request, chatContext, stream, token, commitIdea);
    }),    
    vscode.commands.registerCommand('git-ai-commits.openSettings', () => openExtensionSettings())
  ];

  extensionContext.subscriptions.push(...commands);
}

async function requestCommitSuggestions(
  extensionContext: vscode.ExtensionContext,
  request: vscode.ChatRequest,
  chatContext: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  commitIdea?: string
) {
  try {
    const commitMessages = await generateCommitMessages(
      extensionContext,
      request,
      chatContext,
      stream,
      token,
      commitIdea
    );

    if (!commitMessages || (commitMessages && commitMessages.length === 0)) {
      vscode.window.showWarningMessage(i18n.t('warning.git.noStagedFiles'));
      return;
    }

    const selectedMessage = await vscode.window.showQuickPick(commitMessages, {
      placeHolder: i18n.t('info.commit.selectMessage'),
      canPickMany: false
    });

    const config = vscode.workspace.getConfiguration("gitAiCommits");
    const autoCommit = config.get<boolean>("autoCommit") || false;

    if (selectedMessage) {
      if (autoCommit) {
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
        const git = simpleGit(workspacePath);
        try {
          const commit = await git.commit(selectedMessage);

          vscode.window.showInformationMessage(i18n.t('success.commit.confirmed', { commit: commit.commit, message: selectedMessage }));
        } catch (error: any) {
          vscode.window.showErrorMessage(i18n.t('error.commit.failed', { commit: selectedMessage, error: error.message ?? error }));
          
          await vscode.env.clipboard.writeText(selectedMessage);
          vscode.window.showInformationMessage(i18n.t('success.clipboard.copied', { error: selectedMessage }));
        }
      } else {
        await vscode.env.clipboard.writeText(selectedMessage);
        vscode.window.showInformationMessage(i18n.t('success.clipboard.copied', { error: selectedMessage }));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(i18n.t('error.suggestions.generationFailed', { error: message }));
  }
}

async function openExtensionSettings() {
  try {
    await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:loviver.git-ai-commits');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(i18n.t('error.extension.configOpenFailed', { error: message }));
  }
}

export function deactivate() {
  Logger.log("Desactivando la extensión...");
  Logger.dispose();
}