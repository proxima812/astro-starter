export const FEATURE_REGISTRY = {
	ai: {
		cliName: "ai",
		description: "Adds /ai.txt policy route",
		configFlag: "ai",
		files: ["src/integrations/aiTxt.ts"],
		astroConfig: {
			importLine: 'import aiTxt from "./src/integrations/aiTxt";',
			integrationLines: ["\taiTxt(),"],
		},
		managedCleanup: [
			{
				file: "src/components/SEO/SEO.astro",
				find: '<link rel="alternate" type="text/plain" href="/ai.txt" title="AI usage policy" />\n',
				replace: "",
			},
		],
	},
	llms: {
		cliName: "llms",
		description: "Adds /llms.txt route",
		configFlag: "llms",
		files: ["src/integrations/llmsTxt.ts"],
		astroConfig: {
			importLine: 'import llmsTxt from "./src/integrations/llmsTxt";',
			integrationLines: ["\tllmsTxt(),"],
		},
		managedCleanup: [
			{
				file: "src/components/SEO/SEO.astro",
				find: '<link rel="alternate" type="text/plain" href="/llms.txt" title="LLMS Index" />\n',
				replace: "",
			},
		],
	},
	indexnow: {
		cliName: "indexNow",
		description: "Submits changed URLs to IndexNow after build",
		configFlag: "indexNow",
		files: ["src/integrations/indexNow.ts"],
		astroConfig: {
			importLine: 'import indexNow from "./src/integrations/indexNow";',
			integrationLines: [
				"\tindexNow({",
				"\t\tkey: config.indexNow.key,",
				"\t\tenabled: true,",
				"\t\tcollections: [\"\"],",
				"\t\tmaxUrls: 10000,",
				"\t}),",
			],
		},
	},
	manifest: {
		cliName: "manifest",
		description: "Adds generated site.webmanifest route",
		configFlag: "manifest",
		files: ["src/pages/site.webmanifest.ts"],
		managedCleanup: [
			{
				file: "src/components/SEO/SEO.astro",
				find: '<link rel="manifest" href="/site.webmanifest" />\n',
				replace: "",
			},
		],
	},
};

export const FEATURE_KEYS = Object.keys(FEATURE_REGISTRY);
export const FEATURE_FLAGS = [...new Set(FEATURE_KEYS.map((key) => FEATURE_REGISTRY[key].configFlag))];

export function getFeatureDefinition(featureName) {
	return FEATURE_REGISTRY[featureName];
}

export function normalizeFeatureArgs(rawArgs) {
	return [...new Set(
		rawArgs
			.flatMap((value) => value.split(","))
			.map((value) => value.trim())
			.filter(Boolean)
			.filter((value) => value.toLowerCase() !== "proxima")
			.map((value) => value.toLowerCase()),
	)];
}

export function formatFeatureList() {
	return FEATURE_KEYS.map((key) => FEATURE_REGISTRY[key].cliName).join("\n  ");
}

export function getFeatureDisplayRows() {
	return FEATURE_KEYS.map((key) => {
		const feature = FEATURE_REGISTRY[key];
		return {
			key,
			cliName: feature.cliName,
			description: feature.description,
			files: feature.files,
			configFlag: feature.configFlag,
		};
	});
}
