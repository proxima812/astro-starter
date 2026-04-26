import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const items = defineCollection({
	// loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// loader: file("src/data/dogs.json"),

	// https://docs.astro.build/en/guides/content-collections/#the-file-loader
	schema: z.object({}),
});
export const collections = { items };
