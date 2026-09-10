import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { root, scanRepository } from './catalog.mjs'

const output = join(root, '.generated/site')
const { chapters, index, stats } = scanRepository()

function write(path, content) {
  const target = join(output, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, content.trimStart().replace(/\s*$/, '\n'))
}

function yamlString(value) {
  return JSON.stringify(value)
}

function fenced(source, language) {
  let marker = '```'
  while (source.includes(marker)) marker += '`'
  return `${marker}${language}\n${source.replace(/\s*$/, '')}\n${marker}`
}

function entryPage(chapter, entry) {
  const source = entry.empty ? '' : readFileSync(join(root, entry.path), 'utf8')
  const frontmatter = `---\ntitle: ${yamlString(entry.title)}\ndescription: ${yamlString(`${chapter.title} · ${entry.name}`)}\noutline: [2, 4]\n---`
  const meta = `<div class="entry-meta"><span>${chapter.title}</span><span>${entry.name}</span><span>${entry.empty ? '待补充' : '已有内容'}</span></div>`
  const sourceLink = `[在 GitHub 查看源文件](${entry.sourceUrl})`

  if (entry.empty) {
    return `${frontmatter}\n\n# ${entry.title}\n\n${meta}\n\n> [!WARNING] 内容待补充\n> 此文件目前为空。页面与导航已经建立；向 \`${entry.path}\` 写入内容后，下次构建会自动更新。\n\n${sourceLink}\n`
  }

  if (entry.extension === '.md') {
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').replace(/^#\s+.+\r?\n?/, '')
    return `${frontmatter}\n\n# ${entry.title}\n\n${meta}\n\n${sourceLink}\n\n${body}\n`
  }

  const language = extname(entry.name) === '.hpp' ? 'cpp' : 'cpp'
  return `${frontmatter}\n\n# ${entry.title}\n\n${meta}\n\n${sourceLink}\n\n## 模板代码\n\n${fenced(source, language)}\n`
}

rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })

write('index.md', `
---
layout: home
title: Template XCPC

hero:
  name: Template XCPC
  text: 竞赛算法模板库
  tagline: 目录就是章节，文件就是条目；填入内容，自动成站。
  image:
    src: /logo.svg
    alt: Template XCPC
  actions:
    - theme: brand
      text: 浏览模板
      link: /catalog
    - theme: alt
      text: 下载 PDF
      link: /export
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/AngleBeatrowcolum/Template

features:
  - icon: 📚
    title: ${stats.chapters} 个章节
    details: 自动扫描现有编号目录，无需手工维护导航。
  - icon: 🧩
    title: ${stats.entries} 个模板条目
    details: C++、头文件和 Markdown 使用同一套页面结构。
  - icon: 🔍
    title: 本地全文搜索
    details: 静态搜索索引随网站构建，桌面端与移动端均可使用。
  - icon: 📄
    title: 一键导出
    details: 构建整本手册和分章节 PDF，支持在线预览与下载。
---

<div class="home-status">
  <strong>当前进度</strong>
  <span>${stats.completed} 个条目已有内容</span>
  <span>${stats.pending} 个空白条目待补充</span>
</div>
`)

write('catalog.md', `
---
title: 算法目录
description: Template XCPC 全部章节
aside: false
---

# 算法目录

当前共收录 **${stats.chapters}** 个章节、**${stats.entries}** 个条目。空文件会保留为“待补充”页面。

${index}

<div class="chapter-grid">
${chapters.map(chapter => `<a class="chapter-card" href="./${chapter.slug}/"><span class="chapter-icon">${chapter.icon}</span><strong>${chapter.title}</strong><small>${chapter.completed}/${chapter.entries.length} 已完成</small><p>${chapter.description}</p></a>`).join('\n')}
</div>
`)

write('about.md', `
---
title: 关于项目
---

# 关于项目

Template XCPC 是一个以源文件为核心的竞赛算法模板库。编号目录决定章节顺序，目录中的 Markdown、C++ 和头文件会自动生成文档页面。

## 内容状态

- 章节：${stats.chapters}
- 条目：${stats.entries}
- 已有内容：${stats.completed}
- 待补充：${stats.pending}

## 更新方式

直接编辑仓库中已有的占位文件即可。推送到 \`main\` 分支后，GitHub Actions 会重新生成页面、搜索索引和 PDF，并发布到 GitHub Pages。
`)

write('export.md', `
---
title: 下载中心
aside: false
pageClass: export-page
---

# 下载中心

<ExportCenter />
`)

for (const chapter of chapters) {
  const list = chapter.entries.map(entry => `- [${entry.title}](./${entry.slug}) <span class="status ${entry.empty ? 'pending' : 'ready'}">${entry.empty ? '待补充' : '已有内容'}</span>`).join('\n')
  write(`${chapter.slug}/index.md`, `
---
title: ${yamlString(chapter.title)}
description: ${yamlString(chapter.description)}
---

# ${chapter.icon} ${chapter.title}

${chapter.description}

${chapter.intro || `> [!NOTE]\n> 本章说明文档目前为空。已有的文件名已转换为可浏览目录。`}

## 模板条目

本章共 **${chapter.entries.length}** 个条目，其中 **${chapter.completed}** 个已有内容。

${list || '_本章暂时没有可收录条目。_'}
`)

  for (const entry of chapter.entries) {
    write(`${chapter.slug}/${entry.slug}.md`, entryPage(chapter, entry))
  }
}

const placeholderManifest = {
  generatedAt: new Date().toISOString(),
  targets: [
    { id: 'all', type: 'site', title: '整本手册', available: false },
    ...chapters.map(chapter => ({ id: chapter.slug, type: 'chapter', title: chapter.title, available: false }))
  ]
}
write('public/pdfs/manifest.json', JSON.stringify(placeholderManifest, null, 2))

write('public/logo.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Template XCPC">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5b8cff"/><stop offset="1" stop-color="#7157d9"/></linearGradient></defs>
  <rect x="20" y="20" width="216" height="216" rx="54" fill="url(#g)"/>
  <path d="M72 78h112v24H140v92h-24v-92H72z" fill="white"/>
  <path d="M68 122h28l18 24-18 24H68l18-24zM188 122h-28l-18 24 18 24h28l-18-24z" fill="#dfe7ff"/>
</svg>
`)

console.log(`Generated ${stats.entries} pages in ${stats.chapters} chapters (${stats.pending} placeholders).`)
