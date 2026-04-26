import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { access } from "node:fs/promises";

const publicDir = path.resolve(process.cwd(), "public");
const sourceCandidates = [
	path.join(publicDir, "favicon-180x180.svg"),
	path.join(publicDir, "favicon.svg"),
];

const sourcePath = await findFirstExisting(sourceCandidates);

if (!sourcePath) {
	console.log("[favicons] Skip: source SVG not found in public/");
	process.exit(0);
}

const pngTargets = [
	{ size: 16, filename: "favicon-16x16.png" },
	{ size: 32, filename: "favicon-32x32.png" },
	{ size: 180, filename: "apple-touch-icon.png" },
	{ size: 48, filename: "favicon-48x48.png", internalOnly: true },
];

const copiedSvgTarget = path.join(publicDir, "favicon.svg");
const icoTarget = path.join(publicDir, "favicon.ico");
const trackedOutputs = [
	...pngTargets.map((target) => path.join(publicDir, target.filename)),
	copiedSvgTarget,
	icoTarget,
];

const sourceStats = await stat(sourcePath);
const isFresh = await areOutputsFresh(trackedOutputs, sourceStats.mtimeMs);

if (isFresh) {
	console.log(`[favicons] Up to date: ${path.basename(sourcePath)}`);
	process.exit(0);
}

await mkdir(publicDir, { recursive: true });

for (const target of pngTargets) {
	await renderPng(sourcePath, path.join(publicDir, target.filename), target.size);
}

if (sourcePath !== copiedSvgTarget) {
	await copyFile(sourcePath, copiedSvgTarget);
}

const icoBuffers = await Promise.all(
	[16, 32, 48].map((size) =>
		readFile(path.join(publicDir, `favicon-${size}x${size}.png`)),
	),
);

await writeFile(icoTarget, createIco(icoBuffers));
console.log(`[favicons] Generated from ${path.basename(sourcePath)}`);

async function findFirstExisting(paths) {
	for (const candidate of paths) {
		try {
			await access(candidate, fsConstants.F_OK);
			return candidate;
		} catch {}
	}

	return null;
}

async function areOutputsFresh(paths, sourceMtimeMs) {
	for (const outputPath of paths) {
		try {
			const outputStats = await stat(outputPath);
			if (outputStats.mtimeMs < sourceMtimeMs) {
				return false;
			}
		} catch {
			return false;
		}
	}

	return true;
}

async function renderPng(inputPath, outputPath, size) {
	const proc = Bun.spawn([
		"sips",
		"-s",
		"format",
		"png",
		"-z",
		String(size),
		String(size),
		inputPath,
		"--out",
		outputPath,
	]);

	const exitCode = await proc.exited;

	if (exitCode !== 0) {
		const stderr = await new Response(proc.stderr).text();
		throw new Error(
			`Failed to render ${path.basename(outputPath)} with sips.\n${stderr}`,
		);
	}
}

function createIco(pngBuffers) {
	const headerSize = 6;
	const directoryEntrySize = 16;
	const imageDataOffset = headerSize + directoryEntrySize * pngBuffers.length;
	const iconDir = Buffer.alloc(headerSize);

	iconDir.writeUInt16LE(0, 0);
	iconDir.writeUInt16LE(1, 2);
	iconDir.writeUInt16LE(pngBuffers.length, 4);

	let currentOffset = imageDataOffset;
	const directoryEntries = pngBuffers.map((pngBuffer) => {
		const width = normalizeIcoSize(readUInt32BE(pngBuffer, 16));
		const height = normalizeIcoSize(readUInt32BE(pngBuffer, 20));
		const entry = Buffer.alloc(directoryEntrySize);

		entry.writeUInt8(width, 0);
		entry.writeUInt8(height, 1);
		entry.writeUInt8(0, 2);
		entry.writeUInt8(0, 3);
		entry.writeUInt16LE(1, 4);
		entry.writeUInt16LE(32, 6);
		entry.writeUInt32LE(pngBuffer.length, 8);
		entry.writeUInt32LE(currentOffset, 12);

		currentOffset += pngBuffer.length;
		return entry;
	});

	return Buffer.concat([iconDir, ...directoryEntries, ...pngBuffers]);
}

function readUInt32BE(buffer, offset) {
	return buffer.readUInt32BE(offset);
}

function normalizeIcoSize(size) {
	return size >= 256 ? 0 : size;
}
