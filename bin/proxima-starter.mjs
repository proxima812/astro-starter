#!/usr/bin/env node

import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
	FEATURE_FLAGS,
	FEATURE_KEYS,
	formatFeatureList,
	getFeatureDisplayRows,
	getFeatureDefinition,
	normalizeFeatureArgs,
} from "./feature-registry.mjs";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const templatePackageJsonPath = path.join(packageRoot, "scaffold", "package-template.json");
const cwd = process.cwd();

const baseEntries = [
	".gitignore",
	".vscode",
	".lighthouserc.json",
	"astro.config.mjs",
	"main.config.ts",
	"public",
	"scripts",
	"src",
	"tsconfig.json",
];

const managedUpdateEntries = [
	".gitignore",
	".vscode",
	".lighthouserc.json",
	"scripts/generate-favicons.mjs",
	"src/components/SEO",
	"src/integrations/robotsTxt.ts",
	"tsconfig.json",
];

const baseExcludes = new Set([
	".DS_Store",
	"scripts/validate-seo.mjs",
	"src/integrations/aiTxt.ts",
	"src/integrations/indexNow.ts",
	"src/integrations/llmsTxt.ts",
	"src/pages/site.webmanifest.ts",
]);

const astroImportMarker = "// proxima:feature-imports";
const astroIntegrationMarker = "\t// proxima:feature-integrations";

main().catch((error) => {
	console.error(`\n[proxima-starter] ${error.message}`);
	process.exit(1);
});

async function main() {
	const [command, ...restArgs] = process.argv.slice(2);

	if (!command || command === "help" || command === "--help" || command === "-h") {
		printHelp();
		return;
	}

	if (command === "init") {
		await initProject();
		return;
	}

	if (command === "add") {
		await addFeatures(restArgs);
		return;
	}

	if (command === "remove" || command === "rm") {
		await removeFeatures(restArgs);
		return;
	}

	if (command === "list" || command === "status") {
		await showFeatureStatus();
		return;
	}

	if (command === "update" || command === "upgrade" || command === "sync") {
		await updateStarter(restArgs);
		return;
	}

	throw new Error(`Unknown command: ${command}`);
}

async function initProject() {
	if (!(await hasAstroProject(cwd))) {
		await runCommand("bun", [
			"create",
			"astro@latest",
			".",
			"--template",
			"minimal",
			"--install",
			"--yes",
		], cwd);
	}

	await copyBaseTemplate(cwd);
	await mergePackageJson(cwd);
	await runCommand("bun", ["update"], cwd);

	console.log("[proxima-starter] Project initialized.");
}

async function addFeatures(rawArgs) {
	if (!(await hasAstroProject(cwd))) {
		throw new Error("Run this command inside an Astro project.");
	}

	await ensureFeatureFlags(cwd);
	await syncAstroConfig(cwd);

	const requested = normalizeFeatureArgs(rawArgs);

	if (!requested.length) {
		throw new Error(`Specify at least one feature: ${FEATURE_KEYS.join(", ")}.`);
	}

	for (const featureName of requested) {
		const feature = getFeatureDefinition(featureName);

		if (!feature) {
			throw new Error(`Unsupported feature: ${featureName}`);
		}

		await copyFeatureFiles(cwd, feature.files);
		await enableFeatureFlag(cwd, feature.configFlag);
	}

	await syncAstroConfig(cwd);

	await mergePackageJson(cwd);
	await runCommand("bun", ["update"], cwd);

	console.log(`[proxima-starter] Added: ${requested.join(", ")}.`);
}

async function removeFeatures(rawArgs) {
	if (!(await hasAstroProject(cwd))) {
		throw new Error("Run this command inside an Astro project.");
	}

	await ensureFeatureFlags(cwd);

	const requested = normalizeFeatureArgs(rawArgs);

	if (!requested.length) {
		throw new Error(`Specify at least one feature: ${FEATURE_KEYS.join(", ")}.`);
	}

	for (const featureName of requested) {
		const feature = getFeatureDefinition(featureName);

		if (!feature) {
			throw new Error(`Unsupported feature: ${featureName}`);
		}

		await disableFeatureFlag(cwd, feature.configFlag);
		await removeFeatureFiles(cwd, feature.files);
		await applyFeatureManagedCleanup(cwd, feature);
	}

	await applyDisabledFeatureCleanup(cwd);
	await syncAstroConfig(cwd);
	await runCommand("bun", ["update"], cwd);

	console.log(`[proxima-starter] Removed: ${requested.join(", ")}.`);
}

async function updateStarter(rawArgs) {
	if (!(await hasAstroProject(cwd))) {
		throw new Error("Run this command inside an Astro project.");
	}

	await copyEntries(cwd, managedUpdateEntries);
	await ensureFeatureFlags(cwd);
	await syncAstroConfig(cwd);

	const currentEnabled = await getEnabledFeatures(cwd);
	const requested = normalizeFeatureArgs(rawArgs);
	const featuresToSync = [...new Set([...currentEnabled, ...requested])];

	for (const featureName of featuresToSync) {
		const feature = getFeatureDefinition(featureName);

		if (!feature) {
			throw new Error(`Unsupported feature: ${featureName}`);
		}

		await copyFeatureFiles(cwd, feature.files);
		await enableFeatureFlag(cwd, feature.configFlag);
	}

	await applyDisabledFeatureCleanup(cwd);
	await syncAstroConfig(cwd);

	await mergePackageJson(cwd);
	await runCommand("bun", ["update"], cwd);

	const syncedLabel = featuresToSync.length ? ` Features: ${featuresToSync.join(", ")}.` : "";
	console.log(`[proxima-starter] Starter updated.${syncedLabel}`);
}

function printHelp() {
	console.log(`Usage:

  bunx proxima-starter@latest init
  bunx proxima-starter@latest add llms ai indexNow manifest
  bunx proxima-starter@latest remove llms ai
  bunx proxima-starter@latest status
  bunx proxima-starter@latest update
  bunx proxima-starter@latest update llms ai

Features:

  ${formatFeatureList()}`);
}

async function showFeatureStatus() {
	if (!(await hasAstroProject(cwd))) {
		throw new Error("Run this command inside an Astro project.");
	}

	await ensureFeatureFlags(cwd);

	const mode = await detectProjectMode(cwd);
	const enabled = new Set(await getEnabledFeatures(cwd));
	const rows = [];

	for (const feature of getFeatureDisplayRows()) {
		const existingFiles = await countExistingFiles(cwd, feature.files);
		rows.push(
			`${enabled.has(feature.key) ? "enabled " : "disabled"}  ${feature.cliName}  files:${existingFiles}/${feature.files.length}  ${feature.description}`,
		);
	}

	console.log(`mode: ${mode}\n${rows.join("\n")}`);
}

async function copyBaseTemplate(targetDir) {
	await copyEntries(targetDir, baseEntries);
}

async function copyEntries(targetDir, entries) {
	for (const entry of entries) {
		const sourcePath = path.join(packageRoot, entry);
		const targetPath = path.join(targetDir, entry);

		await cp(sourcePath, targetPath, {
			recursive: true,
			force: true,
			filter: (source) => shouldCopyPath(source),
		});
	}
}

function shouldCopyPath(sourcePath) {
	const relativePath = path.relative(packageRoot, sourcePath);
	if (!relativePath) return true;

	if (path.basename(relativePath) === ".DS_Store") return false;
	if (relativePath.includes("node_modules")) return false;
	if (relativePath.includes(".astro")) return false;

	return !baseExcludes.has(relativePath);
}

async function copyFeatureFiles(targetDir, files) {
	for (const file of files) {
		const sourcePath = path.join(packageRoot, file);
		const targetPath = path.join(targetDir, file);

		await mkdir(path.dirname(targetPath), { recursive: true });
		await cp(sourcePath, targetPath, { force: true });
	}
}

async function removeFeatureFiles(targetDir, files) {
	for (const file of files) {
		const targetPath = path.join(targetDir, file);

		try {
			await Bun.file(targetPath).delete();
		} catch {}
	}
}

async function countExistingFiles(targetDir, files) {
	let count = 0;

	for (const file of files) {
		const targetPath = path.join(targetDir, file);
		if (await exists(targetPath)) count += 1;
	}

	return count;
}

async function mergePackageJson(targetDir) {
	const template = JSON.parse(await readFile(templatePackageJsonPath, "utf-8"));
	const targetPackageJsonPath = path.join(targetDir, "package.json");
	const target = JSON.parse(await readFile(targetPackageJsonPath, "utf-8"));

	const next = {
		...target,
		type: template.type,
		scripts: sortObject({ ...(target.scripts ?? {}), ...(template.scripts ?? {}) }),
		dependencies: sortObject({ ...(target.dependencies ?? {}), ...(template.dependencies ?? {}) }),
		devDependencies: sortObject({
			...(target.devDependencies ?? {}),
			...(template.devDependencies ?? {}),
		}),
	};

	await writeJson(targetPackageJsonPath, next);
}

async function ensureFeatureFlags(targetDir) {
	const configPath = path.join(targetDir, "main.config.ts");
	let source = await readFile(configPath, "utf-8");

	if (source.includes("features:")) {
		for (const flagName of FEATURE_FLAGS) {
			const regex = new RegExp(`(^\\s*${flagName}:\\s*)(true|false)(,?)`, "m");
			if (!regex.test(source)) {
				source = source.replace(/features:\s*{/, `features: {\n\t\t${flagName}: false,`);
			}
		}
	} else {
		source = source.replace(
			/export const config = \{/,
			`export const config = {\n\tfeatures: {\n${FEATURE_FLAGS.map((flagName) => `\t\t${flagName}: false,`).join("\n")}\n\t},`,
		);
	}

	await writeFile(configPath, source);
}

async function enableFeatureFlag(targetDir, flagName) {
	const configPath = path.join(targetDir, "main.config.ts");
	let source = await readFile(configPath, "utf-8");
	const needle = new RegExp(`(${flagName}:\\s*)false`);

	if (!needle.test(source)) return;

	source = source.replace(needle, `$1true`);
	await writeFile(configPath, source);
}

async function disableFeatureFlag(targetDir, flagName) {
	const configPath = path.join(targetDir, "main.config.ts");
	let source = await readFile(configPath, "utf-8");
	const needle = new RegExp(`(${flagName}:\\s*)true`);

	if (!needle.test(source)) return;

	source = source.replace(needle, `$1false`);
	await writeFile(configPath, source);
}

async function syncAstroConfig(targetDir) {
	const configPath = path.join(targetDir, "astro.config.mjs");
	let source = await readFile(configPath, "utf-8");
	const enabledFeatures = await getEnabledFeatures(targetDir);
	const enabledDefinitions = enabledFeatures.map((featureName) => getFeatureDefinition(featureName));
	const featureImports = enabledDefinitions
		.filter((feature) => feature.astroConfig?.importLine)
		.map((feature) => feature.astroConfig.importLine)
		.join("\n");
	const featureIntegrations = enabledDefinitions
		.filter((feature) => feature.astroConfig?.integrationLines?.length)
		.map((feature) => feature.astroConfig.integrationLines.join("\n"))
		.join("\n");

	source = ensureImport(source, 'import { config } from "./main.config";');
	source = ensureImport(source, 'import robotsTxt from "./src/integrations/robotsTxt";');
	source = ensureFeatureImportMarker(source);
	source = ensureOptionalIntegrationsBlock(source);
	source = ensureIntegrationEntry(source, "robotsTxt()");
	source = ensureIntegrationEntry(source, "...optionalIntegrations");
	source = replaceMarkedSection(source, astroImportMarker, featureImports);
	source = replaceMarkedSection(source, astroIntegrationMarker, featureIntegrations);

	await writeFile(configPath, source);
}

async function applyDisabledFeatureCleanup(targetDir) {
	const enabled = new Set(await getEnabledFeatures(targetDir));

	for (const featureName of FEATURE_KEYS) {
		if (enabled.has(featureName)) continue;
		await applyFeatureManagedCleanup(targetDir, getFeatureDefinition(featureName));
	}
}

async function applyFeatureManagedCleanup(targetDir, feature) {
	for (const rule of feature.managedCleanup ?? []) {
		const targetPath = path.join(targetDir, rule.file);
		if (!(await exists(targetPath))) continue;

		const source = await readFile(targetPath, "utf-8");
		if (!source.includes(rule.find)) continue;

		await writeFile(targetPath, source.replaceAll(rule.find, rule.replace ?? ""));
	}
}

function ensureImport(source, importLine) {
	if (source.includes(importLine)) return source;

	const lines = source.split("\n");
	let insertIndex = -1;

	for (let index = lines.length - 1; index >= 0; index -= 1) {
		if (lines[index].startsWith("import ")) {
			insertIndex = index + 1;
			break;
		}
	}

	lines.splice(Math.max(insertIndex, 0), 0, importLine);
	return lines.join("\n");
}

function ensureFeatureImportMarker(source) {
	if (source.includes(astroImportMarker)) return source;

	const anchor = 'import robotsTxt from "./src/integrations/robotsTxt";';
	if (source.includes(anchor)) {
		return source.replace(anchor, `${anchor}\n${astroImportMarker}`);
	}

	return `${astroImportMarker}\n${source}`;
}

function ensureOptionalIntegrationsBlock(source) {
	if (source.includes("const optionalIntegrations = [")) return source;

	return source.replace(
		/export default defineConfig\(\{/,
		`const optionalIntegrations = [\n${astroIntegrationMarker}\n];\n\nexport default defineConfig({`,
	);
}

function ensureIntegrationEntry(source, entry) {
	if (source.includes(entry)) return source;

	return source.replace(/integrations:\s*\[/, (match) => `${match}\n\t\t${entry},`);
}

function replaceMarkedSection(source, marker, body) {
	const escapedMarker = escapeRegExp(marker);
	const regex = new RegExp(`${escapedMarker}\\n[\\s\\S]*?${escapedMarker}`);
	const content = body ? `${marker}\n${body}\n${marker}` : `${marker}\n${marker}`;

	if (regex.test(source)) {
		return source.replace(regex, content);
	}

	return source.replace(marker, content);
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function hasAstroProject(targetDir) {
	try {
		const astroConfig = path.join(targetDir, "astro.config.mjs");
		const packageJson = path.join(targetDir, "package.json");
		await stat(astroConfig);
		await stat(packageJson);
		return true;
	} catch {
		return false;
	}
}

async function exists(targetPath) {
	try {
		await stat(targetPath);
		return true;
	} catch {
		return false;
	}
}

async function detectProjectMode(targetDir) {
	if (targetDir === packageRoot) return "starter-source";

	const packageJsonPath = path.join(targetDir, "package.json");
	const localBinPath = path.join(targetDir, "bin", "proxima-starter.mjs");

	if (await exists(packageJsonPath)) {
		const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
		if (packageJson.name === "proxima-starter" && (await exists(localBinPath))) {
			return "starter-source";
		}
	}

	return "generated-project";
}

async function getEnabledFeatures(targetDir) {
	const configPath = path.join(targetDir, "main.config.ts");
	const source = await readFile(configPath, "utf-8");
	const enabled = [];

	for (const cliName of FEATURE_KEYS) {
		const feature = getFeatureDefinition(cliName);
		const regex = new RegExp(`${feature.configFlag}:\\s*true`);
		if (regex.test(source)) {
			enabled.push(cliName);
		}
	}

	return enabled;
}

async function runCommand(command, args, workdir) {
	const proc = Bun.spawn([command, ...args], {
		cwd: workdir,
		stdout: "inherit",
		stderr: "inherit",
		stdin: "inherit",
	});

	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		throw new Error(`Command failed: ${command} ${args.join(" ")}`);
	}
}

async function writeJson(filePath, value) {
	await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sortObject(value) {
	return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}
