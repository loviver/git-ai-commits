import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import { generateCommitMessages } from './services/commitService';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('git-ai-commits.requestSuggestions', () => requestCommitSuggestions(context)),
    vscode.commands.registerCommand('git-ai-commits.openSettings', () => openExtensionSettings())
  );
}

async function requestCommitSuggestions(context: vscode.ExtensionContext) {
  try {
    const commitMessages = await generateCommitMessages(context);

    if (!commitMessages || commitMessages.length === 0) {
      vscode.window.showWarningMessage("No se pudieron generar mensajes de commit. Intenta de nuevo.");
      return;
    }

    const selectedMessage = await vscode.window.showQuickPick(commitMessages, {
      placeHolder: "Selecciona un mensaje de commit",
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
          vscode.window.showInformationMessage("Cambios confirmados con éxito.");
        } catch (error) {
          vscode.window.showErrorMessage(`Error al hacer commit: ${error}`);
        }
      } else {
        await vscode.env.clipboard.writeText(selectedMessage);
        vscode.window.showInformationMessage("Mensaje copiado al portapapeles.");
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error generando sugerencias: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function openExtensionSettings() {
  try {
    await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:loviver.git-ai-commits');
  } catch (error) {
    vscode.window.showErrorMessage("No se pudo abrir la configuración de la extensión.");
  }
}

export function deactivate() {}