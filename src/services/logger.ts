import * as vscode from "vscode";
import AppConfig from "./app-config";

class Logger {
  private static outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(AppConfig.name);

  static log(message: string) {
    this.outputChannel.appendLine(`ℹ️ ${message}`);
  }

  static error(message: string, error?: unknown) {
    this.outputChannel.appendLine(`❌ Error: ${message}`);
    if (error) this.outputChannel.appendLine(`Detalles: ${String(error)}`);
  }

  static logJson(label: string, json: unknown) {
    this.outputChannel.appendLine(`📦 ${label}:\n${JSON.stringify(json, null, 2)}`);
  }

  static dispose() {
    this.outputChannel.dispose();
  }
}

export default Logger;