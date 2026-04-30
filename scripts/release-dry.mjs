import semanticRelease from "semantic-release";

const result = await semanticRelease(
	{
		branches: ["main"],
		dryRun: true,
		ci: false,
		plugins: [
			"@semantic-release/commit-analyzer",
			"@semantic-release/release-notes-generator",
			[
				"@semantic-release/changelog",
				{
					changelogFile: "CHANGELOG.md",
				},
			],
		],
	},
	{
		cwd: process.cwd(),
		env: process.env,
	},
);

if (!result) {
	console.log("[release-dry] No release triggered for current commits.");
} else {
	console.log(`[release-dry] Next release: ${result.nextRelease.version}`);
}
