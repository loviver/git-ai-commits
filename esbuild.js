const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");
import textPlugin from "esbuild-plugin-text";

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

function copyPromptFile() {
	const srcPath = path.resolve(__dirname, 'src/prompt.txt');
	const destPath = path.resolve(__dirname, 'dist/prompt.txt');

	if (fs.existsSync(srcPath)) {
		fs.copyFileSync(srcPath, destPath);
		console.log(`✅ prompt.txt copiado a dist/`);
	} else {
		console.warn(`⚠️ Archivo prompt.txt no encontrado en src/`);
	}
}

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
			textPlugin(),
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
		//copyPromptFile();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
