import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import AppConfig from './app-config';

let langConfig: any = {};

function loadLanguageConfig() {
	const config = vscode.workspace.getConfiguration(AppConfig.name);
	const lang = config.get<string>("language") || "en";

	const langFilePath = path.join(__dirname, ".lang", `${lang}.json`);
	if (fs.existsSync(langFilePath)) {
		langConfig = JSON.parse(fs.readFileSync(langFilePath, "utf-8"));
	} else {
		vscode.window.showErrorMessage(`Language file not found: ${lang}`);
	}
}

// Escuchar cambios en la configuración
vscode.workspace.onDidChangeConfiguration(event => {
	if (event.affectsConfiguration(`${AppConfig.name}.language`)) {
		loadLanguageConfig();
	}
});