import { execFile } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { root, scanRepository } from './catalog.mjs'
import { escapeTypst, markdownToTypst, rawBlock } from './pdf/markdown.mjs'

const run = promisify(execFile)
const { chapters } = scanRepository()
const buildDir = join(root, '.cache/pdf-build')
const outputDir = join(root, '.generated/site/public/pdfs')
const template = readFileSync(join(root, 'scripts/pdf/template.typ'), 'utf8')
const only = process.argv[2]

function renderEntry(entry) {
  const title = `== ${escapeTypst(entry.title)}\n`
  const sourceMeta = `#text(8pt, fill: luma(100))[源文件：${escapeTypst(entry.path)}]\n`
  if (entry.empty) return `${title}${sourceMeta}\n_内容待补充。_\n`
  const source = readFileSync(join(root, entry.path), 'utf8')
  if (entry.extension === '.md') return `${title}${sourceMeta}\n${markdownToTypst(source, 2)}\n`
  return `${title}${sourceMeta}\n${rawBlock(source, 'cpp')}\n`
}

function renderChapter(chapter) {
  const intro = chapter.intro ? `\n${markdownToTypst(chapter.intro, 1)}\n` : ''
  return `= ${escapeTypst(chapter.title)}\n${escapeTypst(chapter.description)}\n${intro}\n${chapter.entries.map(renderEntry).join('\n')}`
}

async function compile(target, selectedChapters) {
  const typPath = join(buildDir, `${target.id}.typ`)
  const pdfPath = join(outputDir, `${target.id}.pdf`)
  writeFileSync(typPath, `${template}\n\n${selectedChapters.map(renderChapter).join('\n\n')}`)
  const args = [
    'compile', '--root', root, '--font-path', join(root, '.cache/fonts'),
    ...(target.type === 'site' ? ['--input', 'cover=1'] : []),
    typPath, pdfPath
  ]
  const { stderr } = await run(process.env.TYPST_PATH || 'typst', args, { maxBuffer: 8 * 1024 * 1024 })
  if (stderr.trim()) console.warn(stderr.trim())
  target.available = true
  target.pdf = { url: `pdfs/${target.id}.pdf`, bytes: statSync(pdfPath).size }
  console.log(`Generated ${target.title}`)
}

rmSync(buildDir, { recursive: true, force: true })
mkdirSync(buildDir, { recursive: true })
mkdirSync(outputDir, { recursive: true })

const targets = [
  { id: 'all', type: 'site', title: '整本手册', available: false, chapters },
  ...chapters.map(chapter => ({ id: chapter.slug, type: 'chapter', title: chapter.title, available: false, chapters: [chapter] }))
].filter(target => !only || target.id === only)

if (targets.length === 0) throw new Error(`Unknown PDF target: ${only}`)

for (const target of targets) await compile(target, target.chapters)

const manifestTargets = targets.map(({ chapters: _chapters, ...target }) => target)
writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  targets: manifestTargets
}, null, 2) + '\n')
