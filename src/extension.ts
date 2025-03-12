import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import GeminiAI from './services/GeminiAI';
import fs from 'fs';
import path from 'path';

const config = vscode.workspace.getConfiguration("gitAiCommits");

const apiKey = config.get<string>("apiKey") || "";

let agentAI: GeminiAI | null = null;

if (!apiKey) {
    vscode.window.showErrorMessage("No API Key found. Please set 'gitAiCommits.apiKey' in settings.");
} else {
    agentAI = new GeminiAI(apiKey);
}

async function getGitDiff(): Promise<string> {
	const git = simpleGit(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '');

	// Obtiene la lista de archivos en staging
	const stagedFiles = (await git.diff(['--name-only', '--cached']))
		.split('\n')
		.map(file => file.trim())
		.filter(file => file.length > 0);

	if (stagedFiles.length === 0) {
		vscode.window.showErrorMessage("No hay archivos en staging.");
		return "";
	}

	// Obtiene el diff de archivos en staging con solo líneas modificadas
	const rawDiff = await git.diff(['--cached', '--unified=0']);

	// Filtrar solo líneas añadidas/eliminadas sin mostrar todo el contexto
	const filteredDiff = rawDiff
		.split('\n')
		.filter(line => line.startsWith('+') || line.startsWith('-')) // Solo líneas modificadas
		.join('\n');

	return sanitizeDiff(filteredDiff.trim());
}

function sanitizeDiff(diff: string): string {
	const config = vscode.workspace.getConfiguration("gitAiCommits");
	const obfuscateWords = config.get<string[]>("obfuscateWords") || [];
	
	if (obfuscateWords.length > 0) {
		const obfuscateRegex = new RegExp(`\\b(${obfuscateWords.join("|")})\\b`, "gi");
		diff = diff.replace(obfuscateRegex, 'PLACEHOLDER_VALUE');
	}

	return diff
		.replace(/(API_KEY|SECRET|TOKEN|PASSWORD|ACCESS_KEY|PRIVATE_KEY)\s*=\s*['"][^'"]+['"]/gi, '$1=REDACTED')
		.replace(/[\w.-]+@[\w.-]+\.\w+/gi, '[EMAIL_REDACTED]')
		.replace(/(https?:\/\/)[\w\-._~:/?#[\]@!$&'()*+,;=%]+/gi, 'PLACEHOLDER_URL')
		.replace(/\b\d{12,}\b/g, 'PLACEHOLDER_NUMBER')
		.replace(/https?:\/\/[^\s]+/g, 'https://api.placeholder.com')
		.replace(/\/api\/v[0-9]+\/[a-zA-Z0-9_-]+/g, '/api/vX/ENDPOINT_NAME')
		
		.replace(/\[\s*([^\]]+)\s*\]/g, '[...]') // Acortar arrays
		.replace(/\{[^{}]{20,}\}/g, '{ ... }') // Acortar objetos JSON

		.replace(/\b[A-Z_]{2,}\b/g, 'CONSTANT_NAME') // Constantes en mayúsculas
		.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, 'VAR_NAME') // Variables genéricas
		.replace(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, 'function FUNC_NAME')
		.replace(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, 'class CLASS_NAME')
	;
}

async function generateCommitMessage(context: vscode.ExtensionContext): Promise<string[]> {
	const diff = await getGitDiff();

	if (!diff) {
		return [];
	}

	if (!agentAI) {
		return [];
	}

	console.log(diff, context);
		
	const promptPath = path.join(context.extensionPath, 'dist', 'prompt.txt');
	const prompt = fs.readFileSync(promptPath, 'utf-8');

	const response = await agentAI.askQuestion(`
		analiza el siguiente diff y genera la lista de commits en formato JSON válido:

		\`\`\`
		${diff}
		\`\`\`
	`, {
		system: prompt,
	});

	console.log(response);

	return response || [];
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('git-ai-commits.requestSuggestions', () => requestCommitSuggestions(context)),
		vscode.commands.registerCommand('git-ai-commits.openSettings', () => openExtensionSettings())
	);
}

async function requestCommitSuggestions(context: vscode.ExtensionContext) {
	try {
			const commitMessages = await generateCommitMessage(context);

			if (!commitMessages || commitMessages.length === 0) {
					vscode.window.showWarningMessage("No se pudieron generar mensajes de commit. Intenta de nuevo.");
					return;
			}

			const selectedMessage = await vscode.window.showQuickPick(commitMessages, {
					placeHolder: "Selecciona un mensaje de commit",
					canPickMany: false
			});

			const config = vscode.workspace.getConfiguration("gitAiCommits");
			const autoCommit = config.get<string[]>("autoCommit") || [];
			
			if (selectedMessage) {
				if(autoCommit) {
					const git = simpleGit(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "");
					try {
							await git.commit(selectedMessage);
							vscode.window.showInformationMessage("Cambios confirmados con éxito.");
					} catch (error) {
							vscode.window.showErrorMessage(`Error al hacer commit: ${error}`);
					}
				}
				else {
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
