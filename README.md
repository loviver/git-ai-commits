# Git AI Commits

Git AI Commits es una extensión de VS Code que utiliza inteligencia artificial para analizar los cambios en tu repositorio y generar mensajes de commit relevantes. Ahora incluye ofuscación del código y mejoras en la seguridad.

## 🚀 Características

- 📜 **Análisis inteligente de cambios en Git**: Obtiene el `git diff` de los archivos modificados.
- 🤖 **Generación de commits con IA**: Usa un modelo de IA para sugerir mensajes de commit basados en los cambios.
- 🔒 **Ofuscación opcional**: Protege información sensible antes de generar commits.
- 🛠 **Integración con VS Code**: Se ejecuta como un comando dentro del editor.

### 🔹 Uso

Ejecuta el comando desde la paleta de comandos (`Ctrl+Shift+P` en Windows/Linux, `Cmd+Shift+P` en macOS):

```sh
Generate AI-Powered Commit Suggestions
```

La extensión analizará los cambios en `stage` y sugerirá 5 commits basado en IA. 🚀

## ⚙️ Configuración

Puedes personalizar el comportamiento de la extensión con las siguientes opciones en `settings.json`:

```json
{
  "gitAiCommits.apiKey": "", // API Key para autenticarse con Gemini AI
  "gitAiCommits.autoCommit": false, // Habilitar auto-commit
  "gitAiCommits.obfuscationLevel": "medium", // Nivel de ofuscación (low, medium, high)
  "gitAiCommits.obfuscateWords": [] // Lista de palabras a ofuscar en los commits
}
```