<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fmtBytes, loadManifest, pdfUrl, type PdfManifest } from './manifest'

const manifest = ref<PdfManifest | null>(null)
const failed = ref(false)
const targetId = ref('all')
const catalogOpen = ref(false)

onMounted(async () => {
  manifest.value = await loadManifest()
  if (!manifest.value) {
    failed.value = true
    return
  }
  const requested = new URLSearchParams(location.search).get('target')
  if (requested && manifest.value.targets.some(target => target.id === requested)) {
    targetId.value = requested
  }
})

const current = computed(() => manifest.value?.targets.find(target => target.id === targetId.value))
const chapters = computed(() => manifest.value?.targets.filter(target => target.type === 'chapter') ?? [])

function select(id: string) {
  targetId.value = id
  catalogOpen.value = false
  history.replaceState(null, '', `?target=${encodeURIComponent(id)}`)
}
</script>

<template>
  <div v-if="failed" class="pdf-notice">PDF 清单加载失败，请稍后重试。</div>
  <div v-else-if="!manifest" class="pdf-notice">正在加载 PDF 清单…</div>
  <div v-else class="export-center">
    <button class="catalog-toggle" @click="catalogOpen = !catalogOpen">
      {{ catalogOpen ? '收起目录' : `选择内容：${current?.title ?? ''}` }}
    </button>
    <aside class="pdf-catalog" :class="{ open: catalogOpen }">
      <button
        v-for="target in manifest.targets"
        :key="target.id"
        :class="{ active: target.id === targetId }"
        @click="select(target.id)"
      >
        <span>{{ target.title }}</span>
        <small>{{ target.available ? '可下载' : '待首次发布' }}</small>
      </button>
    </aside>
    <main class="pdf-preview">
      <div class="pdf-toolbar">
        <div>
          <strong>{{ current?.title }}</strong>
          <span v-if="current?.pdf">{{ fmtBytes(current.pdf.bytes) }}</span>
        </div>
        <a v-if="current?.available && current.pdf" :href="pdfUrl(current)" download>下载 PDF</a>
      </div>
      <iframe
        v-if="current?.available && current.pdf"
        :src="pdfUrl(current)"
        :title="`${current.title} PDF 预览`"
      />
      <div v-else class="pdf-empty">
        <span>📄</span>
        <strong>PDF 将在首次 GitHub Pages 发布时生成</strong>
        <p>空白模板也会进入目录，并在 PDF 中标记为“内容待补充”。</p>
      </div>
    </main>
  </div>
</template>
