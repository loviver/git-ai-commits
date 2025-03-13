import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import { generateCommitMessages } from './services/commitService';
import { i18n } from './services/i18n';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('git-ai-commits.requestSuggestions', () => requestCommitSuggestions(context)),
    vscode.commands.registerCommand('git-ai-commits.openSettings', () => openExtensionSettings())
  );
}

async function requestCommitSuggestions(context: vscode.ExtensionContext) {
  try {
    const commitMessages = await generateCommitMessages(context);

    if(!commitMessages) {
      return;
    }
    
    if (commitMessages && commitMessages.length === 0) {
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
          await git.commit(selectedMessage);
          vscode.window.showInformationMessage(i18n.t('success.commit.confirmed', { error: selectedMessage }));
        } catch (error) {
          vscode.window.showErrorMessage(i18n.t('error.commit.failed', { error: selectedMessage }));
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

export function deactivate() {}