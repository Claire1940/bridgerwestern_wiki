import { MetadataRoute } from 'next'
import { getAllContent, CONTENT_TYPES, type ContentType } from '@/lib/content'
import { routing, type Locale } from '@/i18n/routing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bridgerwestern.wiki'

// 内容类型优先级配置
const contentTypePriority: Record<string, number> = {
	'guide': 0.9,
	'stands': 0.8,
	'weapons': 0.8,
	'locations-and-npcs': 0.8,
	'progression': 0.7,
	'scripts-and-automation': 0.7,
	'community-resources': 0.6,
	'unlocks-and-collectibles': 0.7,
}

// 内容更新频率配置
const contentTypeChangeFrequency: Record<string, 'daily' | 'weekly' | 'monthly'> = {
	'guide': 'weekly',
	'stands': 'weekly',
	'weapons': 'weekly',
	'locations-and-npcs': 'weekly',
	'progression': 'weekly',
	'scripts-and-automation': 'monthly',
	'community-resources': 'monthly',
	'unlocks-and-collectibles': 'weekly',
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const sitemap: MetadataRoute.Sitemap = []

	// 1. 首页（所有语言版本）
	for (const locale of routing.locales) {
		sitemap.push({
			url: locale === 'en' ? BASE_URL : `${BASE_URL}/${locale}`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1.0,
		})
	}

	// 2. 所有 MDX 文章（所有语言版本和内容类型）
	for (const locale of routing.locales) {
		for (const contentType of CONTENT_TYPES) {
			try {
				const articles = await getAllContent(contentType as ContentType, locale as Locale, {
					includeFallback: false,
				})

				for (const article of articles) {
					const articleUrl =
						locale === 'en'
							? `${BASE_URL}/${contentType}/${article.slug}`
							: `${BASE_URL}/${locale}/${contentType}/${article.slug}`

					const priority = contentTypePriority[contentType] || 0.7
					const changeFrequency = contentTypeChangeFrequency[contentType] || 'weekly'

					sitemap.push({
						url: articleUrl,
						lastModified: article.frontmatter.date
							? new Date(article.frontmatter.date)
							: new Date(),
						changeFrequency: changeFrequency,
						priority: priority,
					})
				}
			} catch (error) {
				console.warn(`Failed to load content for ${locale}/${contentType}:`, error)
			}
		}
	}

	return sitemap
}
