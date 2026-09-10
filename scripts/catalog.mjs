import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const chapterMeta = {
  '00_PrintNotebook': ['print-notebook', '打印手册', '用于比赛打印与快速查阅的整合手册。', '📘'],
  '01_BasicAlgorithms': ['basic-algorithms', '基础算法', '竞赛常用头文件、工具函数与基础算法。', '⚡'],
  '02_TreeAlgorithms': ['tree-algorithms', '树上算法', '树的结构、查询、分治与动态维护。', '🌳'],
  '03_DataStructures': ['data-structures', '数据结构', '区间查询、并查集、平衡树及高级数据结构。', '🧱'],
  '04_GraphTheory': ['graph-theory', '图论', '最短路、生成树、连通性、匹配与割。', '🕸️'],
  '05_NetworkFlow': ['network-flow', '网络流', '最大流、最小割、费用流及建模。', '🌊'],
  '06_Mathematics': ['mathematics', '数学', '数论、组合、线性代数、多项式与计算几何。', '∑'],
  '07_Strings': ['strings', '字符串', '字符串匹配、自动机、后缀结构与哈希。', '🔤'],
  '08_ArbitraryPrecision': ['arbitrary-precision', '高精度', '大整数、定点数、十进制数和进制转换。', '🔢'],
  '09_Miscellaneous': ['miscellaneous', '杂项', '莫队、分治、随机化及实用竞赛技巧。', '🧰'],
  '10_DynamicProgramming': ['dynamic-programming', '动态规划', '背包、状态设计、优化与经典 DP。', '🧩']
}

const contentExtensions = new Set(['.cpp', '.hpp', '.md'])
const ignoredNames = new Set(['README.md'])

export function naturalCompare(a, b) {
  return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })
}

export function slugify(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function titleFromFilename(name) {
  const stem = basename(name, extname(name))
  const withoutOrder = stem.replace(/^\d+[A-Z]*_?/, '') || stem
  return withoutOrder
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sourceUrl(path) {
  return `https://github.com/AngleBeatrowcolum/Template/blob/main/${path.split('/').map(encodeURIComponent).join('/')}`
}

export function scanRepository(repoRoot = root) {
  const indexPath = join(repoRoot, 'TemplateIndex.md')
  const index = existsSync(indexPath) ? readFileSync(indexPath, 'utf8').trim() : ''
  const chapters = Object.entries(chapterMeta)
    .filter(([dir]) => existsSync(join(repoRoot, dir)))
    .map(([dir, [slug, title, description, icon]], chapterIndex) => {
      const absolute = join(repoRoot, dir)
      const files = readdirSync(absolute, { withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
        .filter(name => contentExtensions.has(extname(name).toLowerCase()))
        .filter(name => !ignoredNames.has(name) && !/Notes\.md$/i.test(name))
        .sort(naturalCompare)
        .map((name, index) => {
          const path = relative(repoRoot, join(absolute, name)).replaceAll('\\', '/')
          const bytes = statSync(join(repoRoot, path)).size
          const empty = readFileSync(join(repoRoot, path), 'utf8').trim().length === 0
          return {
            name,
            path,
            slug: slugify(name),
            title: titleFromFilename(name),
            extension: extname(name).toLowerCase(),
            bytes,
            empty,
            order: index + 1,
            sourceUrl: sourceUrl(path)
          }
        })

      const introCandidates = ['README.md', `${titleFromFilename(dir)}Notes.md`]
      const introName = introCandidates.find(name => existsSync(join(absolute, name)))
        ?? readdirSync(absolute).find(name => /Notes\.md$/i.test(name))
      const introPath = introName ? join(absolute, introName) : null
      const intro = introPath && statSync(introPath).size > 0 ? readFileSync(introPath, 'utf8') : ''

      const rootEntries = dir === '01_BasicAlgorithms'
        ? readdirSync(repoRoot, { withFileTypes: true })
            .filter(entry => entry.isFile() && ['.cpp', '.hpp'].includes(extname(entry.name).toLowerCase()))
            .sort((a, b) => naturalCompare(a.name, b.name))
            .map((entry, index) => {
              const path = entry.name
              const source = readFileSync(join(repoRoot, path), 'utf8')
              return {
                name: entry.name,
                path,
                slug: `root-${slugify(entry.name)}`,
                title: titleFromFilename(entry.name),
                extension: extname(entry.name).toLowerCase(),
                bytes: Buffer.byteLength(source),
                empty: source.trim().length === 0,
                order: files.length + index + 1,
                sourceUrl: sourceUrl(path)
              }
            })
        : []

      const entries = [...files, ...rootEntries]

      return {
        dir,
        slug,
        title,
        description,
        icon,
        order: chapterIndex + 1,
        intro,
        entries,
        completed: entries.filter(file => !file.empty).length
      }
    })

  const entries = chapters.flatMap(chapter => chapter.entries)
  return {
    chapters,
    index,
    stats: {
      chapters: chapters.length,
      entries: entries.length,
      completed: entries.filter(entry => !entry.empty).length,
      pending: entries.filter(entry => entry.empty).length
    }
  }
}
