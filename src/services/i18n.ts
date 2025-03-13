import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class I18n {
  private translations: Record<string, string> = {};
  private static instance: I18n;

  private constructor() {
      this.loadTranslations();
  }

  public static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }

  private loadTranslations() {
    const lang = vscode.env.language || "en";
    const langFilePath = path.join(__dirname, "..", ".lang", `${lang}.json`);

    if (fs.existsSync(langFilePath)) {
      this.translations = JSON.parse(fs.readFileSync(langFilePath, "utf8"));
    } else {
      console.warn(`Language file for '${lang}' not found. Falling back to English.`);
      this.translations = JSON.parse(fs.readFileSync(path.join(__dirname, "..", ".lang", "en.json"), "utf8"));
    }
  }

  public t(key: string, variables: Record<string, string> = {}): string {
    let message: string = this.translations[key] || key;

    Object.entries(variables).forEach(([varKey, value]) => {
      message = message.replace(new RegExp(`\\{${varKey}\\}|\\$\\{${varKey}\\}`, "g"), value);
    });

    return message;
  }

}

export const i18n = I18n.getInstance();