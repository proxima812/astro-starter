import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cliPath = path.join(repoRoot, "bin", "proxima-starter.mjs");
const tempDir = await mkdtemp(path.join(tmpdir(), "proxima-starter-smoke-"));

await run("bun", [cliPath, "init"], tempDir);
await run("bun", [cliPath, "status"], tempDir);
await run("bun", [cliPath, "add", "llms", "ai", "manifest"], tempDir);
await run("bun", [cliPath, "list"], tempDir);
await run("bun", [cliPath, "remove", "ai"], tempDir);
await run("bun", [cliPath, "update", "indexNow"], tempDir);
await run("bun", ["run", "check"], tempDir);

console.log(`[smoke-cli] Passed in ${tempDir}`);

async function run(command, args, cwd) {
	const proc = Bun.spawn([command, ...args], {
		cwd,
		stdout: "inherit",
		stderr: "inherit",
		stdin: "inherit",
	});

	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		throw new Error(`Command failed: ${command} ${args.join(" ")}`);
	}
}
