export const exampleFeature = {
	cliName: "newFeature",
	description: "Short one-line explanation of the feature",
	configFlag: "newFeature",
	files: ["src/integrations/newFeature.ts"],
	astroConfig: {
		importLine: 'import newFeature from "./src/integrations/newFeature";',
		integrationLines: ["\tnewFeature(),"],
	},
	managedCleanup: [
		{
			file: "src/components/SEO/SEO.astro",
			find: '<link rel="alternate" href="/new-feature.txt" />\n',
			replace: "",
		},
	],
};
