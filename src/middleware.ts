import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

const legacySlugMap: Record<string, string> = {
	'/guide/Bridger-Western-Update-1.6': '/guide/Bridger-Western-Update-1-6',
	'/guide/bridger-western-vampire-mask-guide': '/guide/bridger-western-vampire-quest',
	'/guide/is-bridger-western-on-mobile': '/guide/bridger-western-mobile-guide',
	'/locations-and-npcs/bridger-western-riverside-ranch': '/locations-and-npcs/bridger-western-corpse-part-spawn-locations',
	'/unlocks-and-collectibles/bridger-western-ball-head-guide': '/unlocks-and-collectibles/bridger-western-all-arrow-shard-locations',
	'/unlocks-and-collectibles/bridger-western-golden-headband-guide': '/guide/golden-experience-requiem-bridger-western',
	'/unlocks-and-collectibles/bridger-western-requiem-arrow-guide': '/unlocks-and-collectibles/bridger-western-all-arrow-shard-locations',
	'/unlocks-and-collectibles/corpse-spawns-in-bridger-western': '/guide/corpse-part-spawns-bridger-western',
	'/unlocks-and-collectibles/how-to-get-saint-arm-in-bridger-western': '/unlocks-and-collectibles/saint-corpse-part-bridger-western',
	'/unlocks-and-collectibles/how-to-get-tusks-in-bridger-western': '/guide/how-to-get-tusk-in-bridger-western',
}

const localePrefixes = routing.locales
	.slice()
	.sort((a, b) => b.length - a.length)
	.map(locale => `/${locale}`)

export default function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const localePrefix = localePrefixes.find(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
	const localizedPath = localePrefix ? pathname.slice(localePrefix.length) || '/' : pathname
	const rewriteTarget = legacySlugMap[localizedPath]

	if (rewriteTarget) {
		const locale = localePrefix ? localePrefix.slice(1) : routing.defaultLocale
		const url = request.nextUrl.clone()
		url.pathname = `/${locale}${rewriteTarget}`
		return NextResponse.rewrite(url)
	}

	return handleI18nRouting(request)
}

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|js|css|map|woff|woff2|html)$).*)',
		'/',
	],
}
