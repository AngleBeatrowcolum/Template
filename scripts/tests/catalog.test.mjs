import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { root, scanRepository, slugify, titleFromFilename } from '../catalog.mjs'

test('catalog scans numbered source directories and produces unique routes', () => {
  const catalog = scanRepository()
  assert.equal(catalog.chapters.length, 11)
  assert.ok(catalog.stats.entries > 250)
  const routes = catalog.chapters.flatMap(chapter => chapter.entries.map(entry => `${chapter.slug}/${entry.slug}`))
  assert.equal(new Set(routes).size, routes.length)
  assert.equal(catalog.stats.completed + catalog.stats.pending, catalog.stats.entries)
})

test('filenames become readable stable metadata', () => {
  assert.equal(slugify('01A_TreeDiameter.cpp'), '01-a-tree-diameter')
  assert.equal(titleFromFilename('01A_TreeDiameter.cpp'), 'Tree Diameter')
})

test('generated site keeps empty files visible as placeholders', () => {
  const page = join(root, '.generated/site/tree-algorithms/01-tree-diameter.md')
  assert.ok(existsSync(page))
  assert.match(readFileSync(page, 'utf8'), /内容待补充/)
})
