import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import metaTags from "astro-meta-tags";
import { defineConfig } from "astro/config";
import { config } from "./main.config";
import aiTxt from "./src/integrations/aiTxt";
import indexNow from "./src/integrations/indexNow";
import llmsTxt from "./src/integrations/llmsTxt";
import robotsTxt from "./src/integrations/robotsTxt";

export default defineConfig({
	site: config.site.url,
	prefetch: {
		defaultStrategy: "viewport",
		prefetchAll: true,
	},
	vite: {
		plugins: [tailwindcss()],
	},
	devToolbar: {
		enabled: false,
	},
	integrations: [
		mdx(),
		sitemap(),
		icon({
			include: {},
		}),
		metaTags(),
		react(),
		robotsTxt(),
		aiTxt(),
		llmsTxt(),
		indexNow({
			key: config.indexNow.key,
			// true - PROD, false - DEV
			collection: [""],
			enabled: false,
			maxUrls: 10000,
		}),
	],

	output: "static",
});
