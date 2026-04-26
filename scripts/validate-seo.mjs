import fs from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");
const htmlFiles = [];
const errors = [];
const warnings = [];

async function exists(targetPath) {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

async function walk(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			await walk(fullPath);
			continue;
		}

		if (entry.isFile() && entry.name.endsWith(".html")) {
			htmlFiles.push(fullPath);
		}
	}
}

function getMatches(content, regex) {
	return [...content.matchAll(regex)];
}

function addError(file, message) {
	errors.push(`${file}: ${message}`);
}

function addWarning(file, message) {
	warnings.push(`${file}: ${message}`);
}

function isAbsoluteHttpUrl(value) {
	return /^https?:\/\//i.test(value);
}

if (!(await exists(distDir))) {
	console.error("[seo-validator] dist directory is missing. Run `bun run build` first.");
	process.exit(1);
}

await walk(distDir);

for (const htmlFile of htmlFiles) {
	const relativeFile = path.relative(distDir, htmlFile) || "index.html";
	const content = await fs.readFile(htmlFile, "utf8");

	const titleMatches = getMatches(content, /<title>(.*?)<\/title>/gis);
	const descriptionMatches = getMatches(
		content,
		/<meta\s+name=["']description["'][^>]*\scontent(?:=(["'])(.*?)\1)?[^>]*>/gis,
	);
	const canonicalMatches = getMatches(
		content,
		/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gis,
	);
	const ogUrlMatches = getMatches(
		content,
		/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["'][^>]*>/gis,
	);
	const ogImageMatches = getMatches(
		content,
		/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["'][^>]*>/gis,
	);
	const twitterCardMatches = getMatches(
		content,
		/<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["'][^>]*>/gis,
	);
	const jsonLdMatches = getMatches(
		content,
		/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gis,
	);

	if (titleMatches.length !== 1) {
		addError(relativeFile, `expected exactly 1 <title>, found ${titleMatches.length}`);
	} else if (!titleMatches[0][1].trim()) {
		addError(relativeFile, "title is empty");
	}

	if (descriptionMatches.length !== 1) {
		addError(
			relativeFile,
			`expected exactly 1 meta description, found ${descriptionMatches.length}`,
		);
	} else if (!(descriptionMatches[0][2] ?? "").trim()) {
		addError(relativeFile, "meta description is empty");
	}

	if (canonicalMatches.length !== 1) {
		addError(relativeFile, `expected exactly 1 canonical link, found ${canonicalMatches.length}`);
	} else if (!isAbsoluteHttpUrl(canonicalMatches[0][1])) {
		addError(relativeFile, "canonical URL must be absolute");
	}

	if (ogUrlMatches.length !== 1) {
		addError(relativeFile, `expected exactly 1 og:url, found ${ogUrlMatches.length}`);
	} else if (!isAbsoluteHttpUrl(ogUrlMatches[0][1])) {
		addError(relativeFile, "og:url must be absolute");
	}

	if (ogImageMatches.length !== 1) {
		addError(relativeFile, `expected exactly 1 og:image, found ${ogImageMatches.length}`);
	} else if (!isAbsoluteHttpUrl(ogImageMatches[0][1])) {
		addError(relativeFile, "og:image must be absolute");
	}

	if (twitterCardMatches.length !== 1) {
		addError(relativeFile, `expected exactly 1 twitter:card, found ${twitterCardMatches.length}`);
	}

	if (content.includes("• TITLE") || content.includes("• DESCRIPTION")) {
		addError(relativeFile, "placeholder SEO text is still present");
	}

	if (!jsonLdMatches.length) {
		addError(relativeFile, "missing JSON-LD schema");
	}

	for (const match of jsonLdMatches) {
		try {
			JSON.parse(match[1]);
		} catch {
			addError(relativeFile, "JSON-LD contains invalid JSON");
		}
	}

	const isArticle = /<meta\s+property=["']og:type["']\s+content=["']article["'][^>]*>/i.test(
		content,
	);

	if (isArticle) {
		if (
			!/<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["'][^>]*>/i.test(
				content,
			)
		) {
			addError(relativeFile, "article page is missing article:published_time");
		}

		if (
			!/"@type"\s*:\s*"BlogPosting"/i.test(content) &&
			!/"@type"\s*:\s*\["BlogPosting"/i.test(content)
		) {
			addError(relativeFile, "article page is missing BlogPosting JSON-LD");
		}
	}

	if (
		!/<meta\s+property=["']og:image:alt["'][^>]*\scontent(?:=(["'])(.*?)\1)?[^>]*>/i.test(
			content,
		)
	) {
		addWarning(relativeFile, "og:image:alt is missing");
	}
}

if (warnings.length) {
	console.warn("[seo-validator] warnings:");
	for (const warning of warnings) {
		console.warn(`- ${warning}`);
	}
}

if (errors.length) {
	console.error("[seo-validator] errors:");
	for (const error of errors) {
		console.error(`- ${error}`);
	}
	process.exit(1);
}

console.log(`[seo-validator] OK: checked ${htmlFiles.length} HTML files`);
