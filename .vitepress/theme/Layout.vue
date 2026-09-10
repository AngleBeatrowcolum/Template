<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ChapterPdf from './ChapterPdf.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #aside-bottom>
      <ChapterPdf />
    </template>
  </DefaultTheme.Layout>
</template>
