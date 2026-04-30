const siteUrl = "https://site.kz/" as const;
const siteHost = new URL(siteUrl).hostname.replace(/^www\./, "");
const siteLocale = "ru-KZ" as const;
const siteAuthor = "site.kz" as const;
const siteName = "site.kz" as const;
const siteThemeColors = {
	maskIcon: "#0f172a",
	tile: "#0f172a",
	theme: "#f8fafc",
	background: "#f8fafc",
} as const;

export const config = {
	features: {
		manifest: false,
		ai: false,
		llms: false,
		indexNow: false,
	},
	indexNow: {
		// Генерация рандомного ключа
		// https://www.bing.com/indexnow/getstarted
		key: "",
	},
	site: {
		url: siteUrl,
		language: "ru-KZ",
		OG: {
			title: siteName,
			description: `Официальный сайт ${siteHost}`,
			author: siteAuthor,
			// Вообще нужно бы писать так:
			// — 🇷🇺 Россия → ru-RU
			// - Татарстан - ru-TT
			// — 🇰🇿 Казахстан → ru-KZ
			locale: siteLocale,
			site_name: siteName,
			// preview на всех страницах
			// 1200x630
			defaultImage: "og.png",
			imageAlt: `Превью страницы ${siteHost}`,
			// Яндекс смотрит еще
			keywords: "",
			titleSeparator: "•",
			twitterCard: "summary_large_image",
			twitterSite: "",
			twitterCreator: "",
			organizationName: siteName,
			logo: "",
		},
		theme: {
			colors: siteThemeColors,
		},
		verifications: [
			{ name_verification: "yandex-verification", content: "" }, // Подтверждение владения сайтом в Яндекс.Вебмастере
			{ name_verification: "p:domain_verify", content: "" }, // Проверка домена Pinterest
			{ name_verification: "google-site-verification", content: "" }, // Подтверждение сайта в Google Search Console
			{ name_verification: "msvalidate.01", content: "" }, // Верификация для Bing Webmaster Tools
			// ====
			// Остальное по факту, не так важно. Смотря какой проект.
			// ====
			{ name_verification: "facebook-domain-verification", content: "" }, // Верификация домена Facebook
			{ name_verification: "baidu-site-verification", content: "" }, // Подтверждение сайта в поисковике Baidu
			{ name_verification: "apple-site-verification", content: "" }, // Верификация для сервисов Apple
			{ name_verification: "norton-safeweb-site-verification", content: "" }, // Верификация сайта в Norton Safe Web
			{ name_verification: "twitter-site-verification", content: "" }, // Верификация сайта в Twitter
			{ name_verification: "linkedin-site-verification", content: "" }, // Верификация сайта в LinkedIn
			{ name_verification: "adobe-site-verification", content: "" }, // Подтверждение владения сайтом для Adobe
			{ name_verification: "mail.ru-verification", content: "" }, // Верификация для сервисов Mail.ru
			{ name_verification: "tumblr-site-verification", content: "" }, // Подтверждение домена в Tumblr
			{ name_verification: "shopify-site-verification", content: "" }, // Верификация в Shopify
			{ name_verification: "weebly-site-verification", content: "" }, // Подтверждение сайта в Weebly
			{ name_verification: "whatsapp-site-verification", content: "" }, // Верификация сайта для WhatsApp Business
			{ name_verification: "stripe-site-verification", content: "" }, // Подтверждение сайта в платёжной системе Stripe
		],
		analytics: {
			yandexMetrika: {
				enabled: false,
				counterId: "",
			},
			googleTagManager: {
				enabled: false,
				gtmId: "",
			},
		},
	},
} satisfies AppConfig;

export type SeoPageType = "website" | "article";
export type SeoKeywords = string | string[];

export interface SiteVerification {
	name_verification: string;
	content: string;
}

export interface YandexMetrikaConfig {
	enabled: boolean;
	counterId: number | `${number}` | "";
}

export interface GoogleTagManagerConfig {
	enabled: boolean;
	gtmId: number | `${number}` | "";
}

export interface SiteOpenGraphConfig {
	title: string;
	description: string;
	author: string;
	locale: `${string}-${string}`;
	site_name: string;
	defaultImage: string;
	imageAlt: string;
	keywords: SeoKeywords;
	titleSeparator: string;
	twitterCard: "summary" | "summary_large_image";
	twitterSite: string;
	twitterCreator: string;
	organizationName: string;
	logo: string;
}

export interface SiteThemeColors {
	maskIcon: `#${string}`;
	tile: `#${string}`;
	theme: `#${string}`;
	background: `#${string}`;
}

export interface SiteConfig {
	url: `http${"" | "s"}://${string}`;
	language: string;
	OG: SiteOpenGraphConfig;
	theme: {
		colors: SiteThemeColors;
	};
	verifications: SiteVerification[];
	analytics: {
		yandexMetrika: YandexMetrikaConfig;
		googleTagManager: GoogleTagManagerConfig;
	};
}

export interface AppConfig {
	features: {
		manifest: boolean;
		ai: boolean;
		llms: boolean;
		indexNow: boolean;
	};
	indexNow: {
		key: string;
	};
	site: SiteConfig;
}
