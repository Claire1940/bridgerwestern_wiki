import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { CONTENT_TYPES as CONFIG_CONTENT_TYPES } from '@/config/navigation'
import { routing, type Locale } from '@/i18n/routing'

function fileNameToSlug(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function findFileBySlug(dir: string, slug: string, basePath: string[] = []): string | null {
  if (!fs.existsSync(dir)) return null
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const result = findFileBySlug(fullPath, slug, [...basePath, entry.name])
      if (result) return result
    } else if (entry.name.endsWith('.mdx')) {
      const fileName = entry.name.replace('.mdx', '')
      const entrySlug = [...basePath, fileNameToSlug(fileName)].join('/')
      if (entrySlug === slug) {
        return [...basePath, fileName].join('/')
      }
    }
  }
  return null
}

export interface ContentFrontmatter {
  title: string
  description: string
  category?: string
  image?: string
  date?: string
  lastModified?: string
  author?: string
  themeColor?: string
  backgroundText?: string
  rarity?: string
  type?: string
  code?: string
}

export const CONTENT_TYPES = CONFIG_CONTENT_TYPES
export type ContentType = typeof CONTENT_TYPES[number]
export type Language = Locale

export interface ContentItem {
  slug: string
  frontmatter: ContentFrontmatter
}

export interface ContentData {
  content: string
  frontmatter: ContentFrontmatter
}

function getContentFilePath(contentType: ContentType, language: Language, slug: string): string | null {
  const contentDir = path.join(process.cwd(), 'content', language, contentType)
  const realSlug = findFileBySlug(contentDir, slug)
  if (!realSlug) return null
  return path.join(contentDir, `${realSlug}.mdx`)
}

function isContentFrontmatter(value: Partial<ContentFrontmatter> | null | undefined): value is ContentFrontmatter {
  return Boolean(value?.title && value?.description)
}

function parseMetadataExport(source: string): ContentFrontmatter | null {
  const match = source.match(/export\s+const\s+metadata\s*=\s*(\{[\s\S]*?\n\})/)
  if (!match) return null

  try {
    const metadata = Function(`"use strict"; return (${match[1]})`)() as Partial<ContentFrontmatter>
    return isContentFrontmatter(metadata) ? metadata : null
  } catch {
    return null
  }
}

function readFrontmatter(filePath: string): ContentFrontmatter | null {
  const source = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(source)

  if (isContentFrontmatter(data as Partial<ContentFrontmatter>)) {
    return data as ContentFrontmatter
  }

  return parseMetadataExport(source)
}

export function getContentFrontmatter(contentType: ContentType, language: Language, slug: string): ContentFrontmatter | null {
  const filePath = getContentFilePath(contentType, language, slug)

  if (filePath) {
    const frontmatter = readFrontmatter(filePath)
    if (frontmatter) return frontmatter
  }

  if (language !== 'en') {
    const fallbackPath = getContentFilePath(contentType, 'en', slug)
    if (fallbackPath) return readFrontmatter(fallbackPath)
  }

  return null
}

function getSlugsFromDirectory(dir: string, basePath: string[] = []): string[] {
  if (!fs.existsSync(dir)) return []

  const slugs: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      slugs.push(...getSlugsFromDirectory(fullPath, [...basePath, entry.name]))
    } else if (entry.name.endsWith('.mdx')) {
      const fileName = entry.name.replace('.mdx', '')
      slugs.push([...basePath, fileNameToSlug(fileName)].join('/'))
    }
  }

  return slugs
}

export async function getAllContent(contentType: ContentType, language: Language): Promise<ContentItem[]> {
  const items: ContentItem[] = []
  const contentDir = path.join(process.cwd(), 'content', language, contentType)
  let slugs = getSlugsFromDirectory(contentDir)

  if (language !== 'en') {
    const enContentDir = path.join(process.cwd(), 'content', 'en', contentType)
    const enSlugs = getSlugsFromDirectory(enContentDir)
    slugs = [...new Set([...slugs, ...enSlugs])]
  }

  for (const slug of slugs) {
    const frontmatter = getContentFrontmatter(contentType, language, slug)
    if (!frontmatter) continue
    items.push({ slug, frontmatter })
  }

  return items.sort((a, b) => {
    if (!a.frontmatter || !b.frontmatter) {
      console.warn('Missing frontmatter in content item:', { a: a.slug, b: b.slug })
      return 0
    }
    if (!a.frontmatter.date || !b.frontmatter.date) return 0
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  })
}

export async function getAllContentPaths(): Promise<string[][]> {
  const paths: string[][] = []

  for (const contentType of CONTENT_TYPES) {
    const contentDir = path.join(process.cwd(), 'content', 'en', contentType)
    const scanDirectory = (dir: string, basePath: string[] = []) => {
      if (!fs.existsSync(dir)) return
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanDirectory(fullPath, [...basePath, entry.name])
        } else if (entry.name.endsWith('.mdx')) {
          const fileName = entry.name.replace('.mdx', '')
          paths.push([contentType, ...basePath, fileNameToSlug(fileName)])
        }
      }
    }
    scanDirectory(contentDir)
  }

  return paths
}

export async function getAllContentSlugs(contentType: ContentType, language: Language): Promise<string[]> {
  const items = await getAllContent(contentType, language)
  return items.map(item => item.slug)
}

export function isValidContentType(type: string): type is ContentType {
  return CONTENT_TYPES.includes(type as ContentType)
}

export function isValidLanguage(lang: string): lang is Language {
  return routing.locales.includes(lang as Language)
}

export function getDefaultLanguage(): Language {
  return 'en'
}
