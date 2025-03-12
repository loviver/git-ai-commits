# Git AI Commits

Git AI Commits es una extensión de VS Code que utiliza inteligencia artificial para analizar los cambios en tu repositorio y generar mensajes de commit relevantes. Ahora incluye ofuscación del código y mejoras en la seguridad.

## 🚀 Características

- 📜 **Análisis inteligente de cambios en Git**: Obtiene el `git diff` de los archivos modificados.
- 🤖 **Generación de commits con IA**: Usa un modelo de IA para sugerir mensajes de commit basados en los cambios.
- 🔒 **Ofuscación opcional**: Protege información sensible antes de generar commits.
- 🛠 **Integración con VS Code**: Se ejecuta como un comando dentro del editor.

## 📦 Requisitos

Asegúrate de tener instalado:

- **Node.js** (>=14.0.0)
- **Git**
- **VS Code**

Instala las dependencias con:

```sh
npm install
```

## ⚙️ Instalación y Uso

### 🔹 Instalación desde VSIX

Si ya tienes el archivo `.vsix`, instálalo con:

```sh
code --install-extension git-ai-commits-x.x.x.vsix
```

### 🔹 Instalación desde código fuente

Clona este repositorio:

```sh
git clone https://github.com/tu-usuario/git-ai-commits.git
```

Ingresa a la carpeta del proyecto:

```sh
cd git-ai-commits
```

Instala las dependencias:

```sh
npm install
```

Empaqueta la extensión con `vsce`:

```sh
vsce package
```

Instala el archivo `.vsix` generado:

```sh
code --install-extension git-ai-commits-x.x.x.vsix
```

### 🔹 Uso

Ejecuta el comando desde la paleta de comandos (`Ctrl+Shift+P` en Windows/Linux, `Cmd+Shift+P` en macOS):

```sh
Git AI Commits: Sugerir mensaje de commit
```

La extensión analizará los cambios y sugerirá un mensaje de commit basado en IA. 🚀

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

## 🐞 Problemas conocidos

- Puede tardar en generar commits si el `diff` es muy grande.
- Requiere una conexión a internet para procesar los cambios con IA.

## 📜 Notas de versión

### v1.0.0

- Primera versión funcional 🎉
- Integración con IA
- Nueva funcionalidad de ofuscación de código

## 📝 Contribuir

Si quieres mejorar la extensión, ¡las contribuciones son bienvenidas! 🤗

1. Haz un fork del repo.
2. Crea una nueva rama:
   ```sh
   git checkout -b feature/nueva-funcionalidad
   ```
3. Sube tus cambios:
   ```sh
   git commit -m "Añadida nueva funcionalidad"
   ```
4. Haz un push a tu fork:
   ```sh
   git push origin feature/nueva-funcionalidad
   ```
5. Abre un pull request.

¡Gracias por usar Git AI Commits! 🚀

