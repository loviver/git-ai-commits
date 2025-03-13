import * as vscode from 'vscode';
import simpleGit from 'simple-git';

export async function getGitDiff(): Promise<string> {
  const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
  const git = simpleGit(workspacePath);

  const stagedFiles = (await git.diff(['--name-only', '--cached']))
    .split('\n')
    .map(file => file.trim())
    .filter(file => file.length > 0);

  if (stagedFiles.length === 0) {
    vscode.window.showErrorMessage("No hay archivos en staging.");
    return "";
  }

  const rawDiff = await git.diff(['--cached', '--unified=0']);

  const filteredDiff = rawDiff
    .split('\n')
    .filter(line => line.startsWith('+') || line.startsWith('-'))
    .join('\n');

  return filteredDiff.trim();
}
