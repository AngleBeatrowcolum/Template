import { withBase } from 'vitepress'

export interface PdfTarget {
  id: string
  type: 'site' | 'chapter'
  title: string
  available: boolean
  pdf?: { url: string; bytes: number }
}

export interface PdfManifest {
  generatedAt: string
  targets: PdfTarget[]
}

let cache: Promise<PdfManifest | null> | null = null

export function loadManifest(): Promise<PdfManifest | null> {
  cache ??= fetch(withBase('/pdfs/manifest.json'))
    .then(response => response.ok ? response.json() as Promise<PdfManifest> : null)
    .catch(() => null)
  return cache
}

export function pdfUrl(target: PdfTarget): string {
  return target.pdf?.url ? withBase('/' + target.pdf.url) : ''
}

export function fmtBytes(bytes = 0): string {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}
