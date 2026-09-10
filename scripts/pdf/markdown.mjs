import MarkdownIt from 'markdown-it'
import math from 'markdown-it-mathjax3'

const parser = new MarkdownIt({ html: false }).use(math)

function escapeTypst(text) {
  return text.replace(/[\\#$@\[\]*_`<>~]/g, character => `\\${character}`)
}

function rawInline(code) {
  let marker = '`'
  while (code.includes(marker)) marker += '`'
  return `${marker}${code}${marker}`
}

export function rawBlock(code, language = 'text') {
  let marker = '```'
  while (code.includes(marker)) marker += '`'
  return `${marker}${language}\n${code.replace(/\s*$/, '')}\n${marker}\n`
}

function formula(name, source) {
  const escaped = source.trim().replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  return `#${name}("${escaped}")`
}

function renderInline(tokens = []) {
  let output = ''
  for (const token of tokens) {
    switch (token.type) {
      case 'text': output += escapeTypst(token.content); break
      case 'code_inline': output += rawInline(token.content); break
      case 'math_inline': output += formula('mi', token.content); break
      case 'softbreak': output += '\n'; break
      case 'hardbreak': output += ' \\ \n'; break
      case 'strong_open': output += '*'; break
      case 'strong_close': output += '*'; break
      case 'em_open': output += '_'; break
      case 'em_close': output += '_'; break
      case 's_open': output += '#strike['; break
      case 's_close': output += ']'; break
      case 'link_open': output += `#link(${JSON.stringify(token.attrGet('href') ?? '')})[`; break
      case 'link_close': output += ']'; break
      case 'image': output += `[图片：${escapeTypst(token.content || token.attrGet('alt') || '')}]`; break
      default: break
    }
  }
  return output
}

export function markdownToTypst(source, headingOffset = 0) {
  source = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const tokens = parser.parse(source, {})
  const output = []

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    switch (token.type) {
      case 'heading_open': {
        const level = Math.min(6, Number(token.tag.slice(1)) + headingOffset)
        output.push(`${'='.repeat(level)} ${renderInline(tokens[index + 1].children)}\n`)
        index += 2
        break
      }
      case 'paragraph_open': if (!token.hidden) output.push('\n'); break
      case 'paragraph_close': if (!token.hidden) output.push('\n'); break
      case 'inline': output.push(renderInline(token.children)); break
      case 'math_block': output.push(`\n${formula('mitex', token.content)}\n`); break
      case 'fence': output.push(`\n${rawBlock(token.content, token.info.trim().split(/\s+/)[0] || 'text')}`); break
      case 'code_block': output.push(`\n${rawBlock(token.content)}`); break
      case 'bullet_list_open': output.push('\n#list(\n'); break
      case 'ordered_list_open': output.push('\n#enum(\n'); break
      case 'bullet_list_close':
      case 'ordered_list_close': output.push(')\n'); break
      case 'list_item_open': output.push('['); break
      case 'list_item_close': output.push('],\n'); break
      case 'blockquote_open': output.push('\n#quote(block: true)[\n'); break
      case 'blockquote_close': output.push(']\n'); break
      case 'hr': output.push('\n#line(length: 100%, stroke: .5pt)\n'); break
      default: break
    }
  }

  return output.join('').replace(/\n{3,}/g, '\n\n').trim()
}

export { escapeTypst }
