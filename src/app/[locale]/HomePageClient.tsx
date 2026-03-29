'use client'

import { useEffect, useState, Suspense, lazy } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Coins,
  Compass,
  Crosshair,
  Eye,
  ExternalLink,
  Gem,
  Layers,
  MapPin,
  MessageCircle,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useMessages } from 'next-intl'
import { VideoFeature } from '@/components/home/VideoFeature'
import { LatestGuidesAccordion } from '@/components/home/LatestGuidesAccordion'
import { NativeBannerAd, AdBanner } from '@/components/ads'
import { scrollToSection } from '@/lib/scrollToSection'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import type { ContentItemWithType } from '@/lib/getLatestArticles'
import type { ModuleLinkMap } from '@/lib/buildModuleLinkMap'

// Lazy load heavy components
const HeroStats = lazy(() => import('@/components/home/HeroStats'))
const FAQSection = lazy(() => import('@/components/home/FAQSection'))
const CTASection = lazy(() => import('@/components/home/CTASection'))

// Loading placeholder
const LoadingPlaceholder = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`} />
)

// Conditionally render text as a link or plain span
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined
  children: React.ReactNode
  className?: string
  locale: string
}) {
  if (linkData) {
    const href = locale === 'en' ? linkData.url : `/${locale}${linkData.url}`
    return (
      <Link
        href={href}
        className={`${className || ''} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    )
  }
  return <>{children}</>
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[]
  moduleLinkMap: ModuleLinkMap
  locale: string
}

export default function HomePageClient({ latestArticles, moduleLinkMap, locale }: HomePageClientProps) {
  const t = useMessages() as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bridgerwestern.wiki'

  // Structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Bridger: WESTERN Wiki',
        description: 'Complete Bridger: WESTERN Wiki covering beginner guides, stands, guns, cards, money routes, NPC locations, and vampire progression for Roblox players.',
        image: {
          '@type': 'ImageObject',
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: 'Bridger: WESTERN - Wild West PvP Adventure with Stands and Vampires',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Bridger: WESTERN Wiki',
        alternateName: 'Bridger Western Wiki',
        url: siteUrl,
        description: 'Complete Bridger: WESTERN Wiki resource hub for stands, guns, cards, money routes, NPCs, vampires, and gear progression guides',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          '@type': 'ImageObject',
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: 'Bridger: WESTERN Wiki - Wild West PvP Adventure',
        },
        sameAs: [
          'https://www.roblox.com/games/99449877692519/bridger-WESTERN',
          'https://www.roblox.com/communities/33878547/BRIDGER-INC',
          'https://trello.com/b/bridger-western',
          'https://www.reddit.com/r/BridgerWesternRoblox/',
        ],
      },
      {
        '@type': 'VideoGame',
        name: 'Bridger: WESTERN',
        gamePlatform: ['Roblox'],
        applicationCategory: 'Game',
        genre: ['Action', 'Western', 'PvP', 'Adventure'],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 30,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: 'https://www.roblox.com/games/99449877692519/bridger-WESTERN',
        },
      },
    ],
  }

  // Module navigation config
  const moduleNavItems = [
    { id: 'beginner-guide', label: t.modules.bridgerWesternBeginnerGuide.title, icon: BookOpen },
    { id: 'progression-guide', label: t.modules.bridgerWesternProgressionGuide.title, icon: TrendingUp },
    { id: 'stand-guide', label: t.modules.bridgerWesternStandGuide.title, icon: Zap },
    { id: 'money-farming', label: t.modules.bridgerWesternMoneyFarmingGuide.title, icon: Coins },
    { id: 'weapons-tier-list', label: t.modules.bridgerWesternWeaponsTierList.title, icon: Crosshair },
    { id: 'guns-guide', label: t.modules.bridgerWesternGunsGuide.title, icon: Target },
    { id: 'cards-guide', label: t.modules.bridgerWesternCardsGuide.title, icon: Layers },
    { id: 'best-cards', label: t.modules.bridgerWesternBestCardsGuide.title, icon: Trophy },
    { id: 'accessories-guide', label: t.modules.bridgerWesternAccessoriesGuide.title, icon: Gem },
    { id: 'horse-guide', label: t.modules.bridgerWesternHorseGuide.title, icon: Compass },
    { id: 'npc-locations', label: t.modules.bridgerWesternNpcLocationsGuide.title, icon: MapPin },
    { id: 'pvp-gun-combos', label: t.modules.bridgerWesternPvpGunCombosGuide.title, icon: Swords },
  ]

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal-visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 移动端横幅 Sticky */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-6">
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-sm font-medium">{t.hero.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => scrollToSection('beginner-guide')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/99449877692519/bridger-WESTERN"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* 广告位 2: 原生横幅 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ''} />

      {/* Video Section */}
      <section className="px-4 py-12">
        <div className="scroll-reveal container mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            <VideoFeature
              videoId="Piq4lPl0BXk"
              title="Bridger: WESTERN Starter Guide"
              posterImage="/images/hero.webp"
            />
          </div>
        </div>
      </section>

      {/* Module Navigation Area - Right below video */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="scroll-reveal grid grid-cols-2 sm:grid-cols-4 gap-3">
            {moduleNavItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-border
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                >
                  <div className="w-10 h-10 rounded-lg
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors">
                    <IconComponent className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                  </div>
                  <span className="text-sm font-medium text-center leading-tight">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={30} />

      {/* 广告位 3: 标准横幅 728×90 */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      {/* Tools Grid - Navigation Cards */}
      <section className="px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.tools.title}{' '}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionIds = [
                'beginner-guide', 'progression-guide', 'stand-guide', 'money-farming',
                'weapons-tier-list', 'guns-guide', 'cards-guide', 'best-cards',
                'accessories-guide', 'horse-guide', 'npc-locations', 'pvp-gun-combos'
              ]
              const sectionId = sectionIds[index]

              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group p-6 rounded-xl border border-border
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg mb-4
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors">
                    <DynamicIcon
                      name={card.icon}
                      className="w-6 h-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 广告位 4: 方形广告 300×250 */}
      <AdBanner type="banner-300x250" adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250} />

      {/* Module 1: Bridger: WESTERN Beginner Guide */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternBeginnerGuide']} locale={locale}>
                {t.modules.bridgerWesternBeginnerGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternBeginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-4 mb-10">
            {t.modules.bridgerWesternBeginnerGuide.steps.map((step: any, index: number) => (
              <div key={index} className="flex gap-4 p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border-2 border-[hsl(var(--nav-theme)/0.5)] flex items-center justify-center">
                  <span className="text-xl font-bold text-[hsl(var(--nav-theme-light))]">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    <LinkedTitle linkData={moduleLinkMap[`bridgerWesternBeginnerGuide::steps::${index}`]} locale={locale}>
                      {step.title}
                    </LinkedTitle>
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.bridgerWesternBeginnerGuide.quickTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 5: 中型横幅 468×60 */}
      <AdBanner type="banner-468x60" adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60} />

      {/* Module 2: Bridger: WESTERN Progression Guide */}
      <section id="progression-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternProgressionGuide']} locale={locale}>
                {t.modules.bridgerWesternProgressionGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternProgressionGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-4 mb-10">
            {t.modules.bridgerWesternProgressionGuide.steps.map((step: any, index: number) => (
              <div key={index} className="flex gap-4 p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border-2 border-[hsl(var(--nav-theme)/0.5)] flex items-center justify-center">
                  <span className="text-xl font-bold text-[hsl(var(--nav-theme-light))]">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    <LinkedTitle linkData={moduleLinkMap[`bridgerWesternProgressionGuide::steps::${index}`]} locale={locale}>
                      {step.title}
                    </LinkedTitle>
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="scroll-reveal flex flex-wrap gap-3 justify-center">
            {t.modules.bridgerWesternProgressionGuide.milestones.map((m: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm">
                <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />{m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: Bridger: WESTERN Stand Guide */}
      <section id="stand-guide" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternStandGuide']} locale={locale}>
                {t.modules.bridgerWesternStandGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternStandGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-4 mb-10">
            {t.modules.bridgerWesternStandGuide.steps.map((step: any, index: number) => (
              <div key={index} className="flex gap-4 p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border-2 border-[hsl(var(--nav-theme)/0.5)] flex items-center justify-center">
                  <span className="text-xl font-bold text-[hsl(var(--nav-theme-light))]">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    <LinkedTitle linkData={moduleLinkMap[`bridgerWesternStandGuide::steps::${index}`]} locale={locale}>
                      {step.title}
                    </LinkedTitle>
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stand Examples */}
          <div className="scroll-reveal flex flex-wrap gap-3 justify-center">
            {t.modules.bridgerWesternStandGuide.standExamples.map((name: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm">
                <Zap className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />{name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />

      {/* Module 4: Bridger: WESTERN Money Farming Guide */}
      <section id="money-farming" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternMoneyFarmingGuide']} locale={locale}>
                {t.modules.bridgerWesternMoneyFarmingGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternMoneyFarmingGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-4 mb-10">
            {t.modules.bridgerWesternMoneyFarmingGuide.steps.map((step: any, index: number) => (
              <div key={index} className="flex gap-4 p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border-2 border-[hsl(var(--nav-theme)/0.5)] flex items-center justify-center">
                  <span className="text-xl font-bold text-[hsl(var(--nav-theme-light))]">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    <LinkedTitle linkData={moduleLinkMap[`bridgerWesternMoneyFarmingGuide::steps::${index}`]} locale={locale}>
                      {step.title}
                    </LinkedTitle>
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Farming Tips */}
          <div className="scroll-reveal p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-lg">Farming Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.bridgerWesternMoneyFarmingGuide.farmingTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 7: 标准横幅 728×90 */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      {/* Module 5: Bridger: WESTERN Weapons Tier List */}
      <section id="weapons-tier-list" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternWeaponsTierList']} locale={locale}>
                {t.modules.bridgerWesternWeaponsTierList.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternWeaponsTierList.intro}
            </p>
          </div>

          {/* Tier List */}
          <div className="scroll-reveal space-y-8">
            {t.modules.bridgerWesternWeaponsTierList.tiers.map((tierGroup: any) => {
              const tierColors: Record<string, string> = {
                S: 'bg-[hsl(var(--nav-theme))] text-white',
                A: 'bg-[hsl(var(--nav-theme)/0.7)] text-white',
                B: 'bg-[hsl(var(--nav-theme)/0.4)] text-foreground',
                C: 'bg-[hsl(var(--nav-theme)/0.2)] text-foreground',
              }
              return (
                <div key={tierGroup.tier}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${tierColors[tierGroup.tier] || tierColors.C}`}>
                      {tierGroup.tier}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">{tierGroup.label}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tierGroup.entries.map((entry: any) => (
                      <div key={entry.name} className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{entry.name}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] text-[hsl(var(--nav-theme-light))] font-medium">{entry.type}</span>
                        </div>
                        <p className="text-sm text-[hsl(var(--nav-theme-light))] mb-2 font-medium">{entry.bestFor}</p>
                        <p className="text-xs text-muted-foreground/70 mb-3 font-mono">{entry.stats}</p>
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 广告位 8: 方形广告 300×250 */}
      <AdBanner type="banner-300x250" adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250} />

      {/* Module 6: Bridger: WESTERN Guns Guide */}
      <section id="guns-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternGunsGuide']} locale={locale}>
                {t.modules.bridgerWesternGunsGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternGunsGuide.intro}
            </p>
          </div>

          {/* Weapon Stats Table */}
          <div className="scroll-reveal overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] border-b border-border">
                  <th className="text-left p-3 font-semibold">Weapon</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-center p-3 font-semibold">Mag</th>
                  <th className="text-center p-3 font-semibold">Head</th>
                  <th className="text-center p-3 font-semibold">Torso</th>
                  <th className="text-center p-3 font-semibold">Limbs</th>
                  <th className="text-left p-3 font-semibold hidden lg:table-cell">Special</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.bridgerWesternGunsGuide.items.map((item: any, index: number) => (
                  <tr key={item.weapon} className={`border-b border-border/50 hover:bg-[hsl(var(--nav-theme)/0.05)] transition-colors ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="p-3 font-medium text-[hsl(var(--nav-theme-light))]">{item.weapon}</td>
                    <td className="p-3 text-muted-foreground">{item.type}</td>
                    <td className="p-3 text-center">{item.magazine}</td>
                    <td className="p-3 text-center">{item.head}</td>
                    <td className="p-3 text-center">{item.torso}</td>
                    <td className="p-3 text-center">{item.limbs}</td>
                    <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">{item.special}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Stacked Cards for Special column */}
          <div className="scroll-reveal mt-6 space-y-3 lg:hidden">
            {t.modules.bridgerWesternGunsGuide.items.map((item: any) => (
              <div key={`mobile-${item.weapon}`} className="p-4 bg-white/5 border border-border rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[hsl(var(--nav-theme-light))]">{item.weapon}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)]">{item.type}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.special}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Bridger: WESTERN Cards Guide */}
      <section id="cards-guide" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternCardsGuide']} locale={locale}>
                {t.modules.bridgerWesternCardsGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternCardsGuide.intro}
            </p>
          </div>

          {/* Card Info Grid */}
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.bridgerWesternCardsGuide.items.map((item: any, index: number) => {
              const cardIcons = [Layers, Target, Coins, BookOpen, Zap, TrendingUp]
              const CardIcon = cardIcons[index % cardIcons.length]
              return (
                <div key={index} className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center">
                      <CardIcon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                    </div>
                    <h3 className="font-bold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 广告位 9: 中型横幅 468×60 */}
      <AdBanner type="banner-468x60" adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60} />

      {/* Module 8: Bridger: WESTERN Best Cards Guide */}
      <section id="best-cards" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternBestCardsGuide']} locale={locale}>
                {t.modules.bridgerWesternBestCardsGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternBestCardsGuide.intro}
            </p>
          </div>

          {/* Card Tier List */}
          <div className="scroll-reveal space-y-8">
            {t.modules.bridgerWesternBestCardsGuide.tiers.map((tierGroup: any) => {
              const tierColors: Record<string, string> = {
                S: 'bg-[hsl(var(--nav-theme))] text-white',
                A: 'bg-[hsl(var(--nav-theme)/0.7)] text-white',
                B: 'bg-[hsl(var(--nav-theme)/0.4)] text-foreground',
              }
              return (
                <div key={tierGroup.tier}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${tierColors[tierGroup.tier] || tierColors.B}`}>
                      {tierGroup.tier}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">{tierGroup.label}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tierGroup.entries.map((entry: any) => (
                      <div key={entry.name} className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                        <h3 className="font-bold text-lg mb-2">{entry.name}</h3>
                        <p className="text-sm text-[hsl(var(--nav-theme-light))] mb-3 font-medium">{entry.effect}</p>
                        <p className="text-sm text-muted-foreground">{entry.whyItMatters}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 广告位 10: 标准横幅 728×90 */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      {/* Module 9: Bridger: WESTERN Accessories Guide */}
      <section id="accessories-guide" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternAccessoriesGuide']} locale={locale}>
                {t.modules.bridgerWesternAccessoriesGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternAccessoriesGuide.intro}
            </p>
          </div>

          {/* Accessory Cards */}
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.bridgerWesternAccessoriesGuide.items.map((item: any, index: number) => {
              const accessoryIcons = [Crosshair, Shield, Target, Compass, Eye, Zap, Coins, Sparkles]
              const AccessoryIcon = accessoryIcons[index % accessoryIcons.length]
              return (
                <div key={index} className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center">
                      <AccessoryIcon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] text-[hsl(var(--nav-theme-light))] font-medium">{item.tag}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[hsl(var(--nav-theme-light))] mb-2 font-medium">{item.effect}</p>
                  <p className="text-sm text-muted-foreground">{item.bestFor}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Module 10: Bridger: WESTERN Horse Guide */}
      <section id="horse-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternHorseGuide']} locale={locale}>
                {t.modules.bridgerWesternHorseGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternHorseGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-4 mb-10">
            {t.modules.bridgerWesternHorseGuide.steps.map((step: any, index: number) => (
              <div key={index} className="flex gap-4 p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border-2 border-[hsl(var(--nav-theme)/0.5)] flex items-center justify-center">
                  <span className="text-xl font-bold text-[hsl(var(--nav-theme-light))]">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    <LinkedTitle linkData={moduleLinkMap[`bridgerWesternHorseGuide::steps::${index}`]} locale={locale}>
                      {step.title}
                    </LinkedTitle>
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Travel Tips */}
          <div className="scroll-reveal p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-lg">Travel Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.bridgerWesternHorseGuide.travelTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 11: 方形广告 300×250 */}
      <AdBanner type="banner-300x250" adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250} />

      {/* Module 11: Bridger: WESTERN NPC Locations Guide */}
      <section id="npc-locations" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternNpcLocationsGuide']} locale={locale}>
                {t.modules.bridgerWesternNpcLocationsGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternNpcLocationsGuide.intro}
            </p>
          </div>

          {/* NPC Table */}
          <div className="scroll-reveal overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] border-b border-border">
                  <th className="text-left p-3 font-semibold">NPC</th>
                  <th className="text-left p-3 font-semibold">Role</th>
                  <th className="text-left p-3 font-semibold">Location</th>
                  <th className="text-left p-3 font-semibold hidden lg:table-cell">Why It Matters</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.bridgerWesternNpcLocationsGuide.items.map((item: any, index: number) => (
                  <tr key={item.npc} className={`border-b border-border/50 hover:bg-[hsl(var(--nav-theme)/0.05)] transition-colors ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="p-3 font-medium text-[hsl(var(--nav-theme-light))]">{item.npc}</td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] text-[hsl(var(--nav-theme-light))] font-medium">{item.role}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.location}</td>
                    <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">{item.whyItMatters}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Stacked Cards for Why It Matters column */}
          <div className="scroll-reveal mt-6 space-y-3 lg:hidden">
            {t.modules.bridgerWesternNpcLocationsGuide.items.map((item: any) => (
              <div key={`mobile-${item.npc}`} className="p-4 bg-white/5 border border-border rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[hsl(var(--nav-theme-light))]">{item.npc}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)]">{item.role}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{item.location}</p>
                <p className="text-xs text-muted-foreground/70">{item.whyItMatters}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 12: 中型横幅 468×60 */}
      <AdBanner type="banner-468x60" adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60} />

      {/* Module 12: Bridger: WESTERN PvP Gun Combos Guide */}
      <section id="pvp-gun-combos" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <LinkedTitle linkData={moduleLinkMap['bridgerWesternPvpGunCombosGuide']} locale={locale}>
                {t.modules.bridgerWesternPvpGunCombosGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.bridgerWesternPvpGunCombosGuide.intro}
            </p>
          </div>

          {/* PvP Combo Cards */}
          <div className="scroll-reveal space-y-6">
            {t.modules.bridgerWesternPvpGunCombosGuide.items.map((item: any, index: number) => {
              const comboIcons = [Crosshair, Target, Swords, TrendingUp]
              const ComboIcon = comboIcons[index % comboIcons.length]
              return (
                <div key={index} className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center">
                      <ComboIcon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] text-[hsl(var(--nav-theme-light))] font-medium">{item.tag}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{item.whyItWorks}</p>
                  <div className="p-4 bg-[hsl(var(--nav-theme)/0.05)] rounded-lg mb-3">
                    <p className="text-sm font-medium text-[hsl(var(--nav-theme-light))] mb-1">Play Pattern</p>
                    <p className="text-sm text-muted-foreground">{item.playPattern}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white/[0.03] border border-border/50 rounded-lg">
                      <p className="text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-1">Primary</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.primaryStats}</p>
                    </div>
                    <div className="p-3 bg-white/[0.03] border border-border/50 rounded-lg">
                      <p className="text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-1">Secondary</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.secondaryStats}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">{t.footer.description}</p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/communities/33878547/BRIDGER-INC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.reddit.com/r/BridgerWesternRoblox/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://trello.com/b/bridger-western"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/games/99449877692519/bridger-WESTERN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t.footer.copyright}</p>
              <p className="text-xs text-muted-foreground">{t.footer.disclaimer}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
