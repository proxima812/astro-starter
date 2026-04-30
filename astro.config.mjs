import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import metaTags from "astro-meta-tags";
import { defineConfig } from "astro/config";
import { config } from "./main.config";
import robotsTxt from "./src/integrations/robotsTxt";
// proxima:feature-imports

const optionalIntegrations = [
	// proxima:feature-integrations
];

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
		...optionalIntegrations,
	],

	output: "static",
});
