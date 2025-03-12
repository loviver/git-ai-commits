const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const EXTENSION_DIR = __dirname;

const EXTENSION_ID = "loviver.git-ai-commits";

// Obtener el último archivo .vsix
function getLatestVSIX() {
    const files = fs.readdirSync(EXTENSION_DIR)
        .filter(file => file.endsWith(".vsix"))
        .sort((a, b) => fs.statSync(path.join(EXTENSION_DIR, b)).mtime - fs.statSync(path.join(EXTENSION_DIR, a)).mtime);

    return files.length > 0 ? files[0] : null;
}

function installExtension() {
    console.log("📦 Empaquetando la extensión...");
    execSync("vsce package", { stdio: "inherit" });

    const latestVSIX = getLatestVSIX();
    if (!latestVSIX) {
        console.error("❌ No se encontró ningún archivo .vsix");
        return;
    }

    console.log(`📥 Instalando la extensión: ${latestVSIX}`);
    execSync(`code --install-extension ${latestVSIX} --force --disable-gpu --disable-extensions`, { stdio: "inherit" });

    console.log("✅ Extensión instalada correctamente. 🔄 Recarga VS Code manualmente con Ctrl+Shift+P → Reload Window");
}

if (process.argv.includes("--watch")) {
    console.log("👀 Modo watch activado. Observando cambios...");

    const watcher = spawn("nodemon", ["--ext", "ts,json", "--exec", "node installExtension.js"], {
        stdio: "inherit",
        shell: true
    });

    watcher.on("close", (code) => {
        console.log(`🔄 Watcher finalizado con código ${code}`);
    });

} else {
    installExtension();
}
