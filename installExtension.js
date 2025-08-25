const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const EXTENSION_DIR = __dirname;

const EXTENSION_ID = "loviver.git-ai-commits";

// Obtener el último archivo .vsix
function getLatestVSIX() {
  const files = fs
    .readdirSync(EXTENSION_DIR)
    .filter((file) => file.endsWith(".vsix"))
    .sort(
      (a, b) =>
        fs.statSync(path.join(EXTENSION_DIR, b)).mtime -
        fs.statSync(path.join(EXTENSION_DIR, a)).mtime
    );

  return files.length > 0 ? files[0] : null;
}

function installExtension() {
  console.log("📦 Empaquetando la extensión...");
  execSync("npx vsce package", { stdio: "inherit" });

  const latestVSIX = getLatestVSIX();
  if (!latestVSIX) {
    console.error("❌ No se encontró ningún archivo .vsix");
    return;
  }

  // Detectar si usar Cursor o VSCode
  const hasCursor = checkCommand("cursor");
  const hasVSCode = checkCommand("code");

  console.log(`📥 Instalando la extensión: ${latestVSIX}`);

  if (hasCursor) {
    console.log("🎯 Instalando en Cursor...");
    execSync(`cursor --install-extension ${latestVSIX}`, { stdio: "inherit" });
    console.log(
      "✅ Extensión instalada en Cursor. 🔄 Recarga Cursor manualmente con Ctrl+Shift+P → Reload Window"
    );
  } else if (hasVSCode) {
    console.log("📝 Instalando en VSCode...");
    execSync(`code --install-extension ${latestVSIX} --force`, {
      stdio: "inherit",
    });
    console.log(
      "✅ Extensión instalada en VSCode. 🔄 Recarga VSCode manualmente con Ctrl+Shift+P → Reload Window"
    );
  } else {
    console.error("❌ No se encontró ni Cursor ni VSCode en el PATH");
  }
}

function checkCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (process.argv.includes("--watch")) {
  console.log("👀 Modo watch activado. Observando cambios...");

  const watcher = spawn(
    "nodemon",
    ["--ext", "ts,json", "--exec", "node installExtension.js"],
    {
      stdio: "inherit",
      shell: true,
    }
  );

  watcher.on("close", (code) => {
    console.log(`🔄 Watcher finalizado con código ${code}`);
  });
} else {
  installExtension();
}
