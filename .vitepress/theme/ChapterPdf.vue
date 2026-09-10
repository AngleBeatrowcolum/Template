<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { fmtBytes, loadManifest, pdfUrl, type PdfManifest } from './manifest'

const route = useRoute()
const { site } = useData()
const manifest = ref<PdfManifest | null>(null)

onMounted(async () => { manifest.value = await loadManifest() })

const chapter = computed(() => {
  const base = site.value.base
  const path = base !== '/' && route.path.startsWith(base)
    ? route.path.slice(base.length)
    : route.path.replace(/^\//, '')
  const slug = path.replace(/\.html$/, '').split('/')[0]
  return manifest.value?.targets.find(target => target.type === 'chapter' && target.id === slug)
})
</script>

<template>
  <div v-if="chapter" class="chapter-pdf">
    <strong>本章 PDF</strong>
    <template v-if="chapter.available && chapter.pdf">
      <a :href="pdfUrl(chapter)" download>下载 · {{ fmtBytes(chapter.pdf.bytes) }}</a>
      <a class="muted" :href="`${withBase('/export')}?target=${chapter.id}`">在线预览 →</a>
    </template>
    <span v-else>首次发布后提供下载</span>
  </div>
</template>
