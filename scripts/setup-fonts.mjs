import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './catalog.mjs'

const targetDir = join(root, '.cache/fonts')
const fonts = JSON.parse(readFileSync(new URL('./fonts.json', import.meta.url), 'utf8'))
const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex')

mkdirSync(targetDir, { recursive: true })
for (const font of fonts) {
  const target = join(targetDir, font.name)
  if (existsSync(target) && digest(target) === font.sha256) continue
  const temporary = `${target}.download`
  try {
    execFileSync('curl', [
      '--fail', '--location', '--silent', '--show-error', '--retry', '3',
      '--output', temporary, font.url
    ], { stdio: 'inherit' })
    if (digest(temporary) !== font.sha256) throw new Error(`Font checksum mismatch: ${font.name}`)
    renameSync(temporary, target)
    console.log(`Installed ${font.name}`)
  } finally {
    rmSync(temporary, { force: true })
  }
}

console.log(`Fonts ready: ${targetDir}`)
