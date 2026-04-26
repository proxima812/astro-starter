import type { APIRoute } from "astro";
import { config } from "main.config";

export const GET: APIRoute = () => {
	return new Response(
		JSON.stringify(
			{
				name: config.site.OG.site_name,
				short_name: config.site.OG.site_name,
				description: config.site.OG.description,
				lang: config.site.OG.locale,
				start_url: "/",
				scope: "/",
				display: "standalone",
				background_color: config.site.theme.colors.background,
				theme_color: config.site.theme.colors.theme,
				icons: [
					{
						src: "/favicon.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any",
					},
				],
			},
			null,
			2,
		),
		{
			headers: {
				"Content-Type": "application/manifest+json; charset=utf-8",
			},
		},
	);
};
