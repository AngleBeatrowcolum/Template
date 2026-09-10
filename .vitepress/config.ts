import { defineConfig } from 'vitepress'
import { scanRepository } from '../scripts/catalog.mjs'

const { chapters } = scanRepository()

const sidebar = chapters.map(chapter => ({
  text: `${chapter.icon} ${chapter.title}`,
  link: `/${chapter.slug}/`,
  collapsed: chapter.entries.length > 24,
  items: chapter.entries.map(entry => ({
    text: entry.title,
    link: `/${chapter.slug}/${entry.slug}`
  }))
}))

export default defineConfig({
  lang: 'zh-CN',
  title: 'Template XCPC',
  description: '自动生成的 XCPC 竞赛算法模板库',
  srcDir: './.generated/site',
  base: process.env.VITEPRESS_BASE || '/',
  cleanUrls: true,
  lastUpdated: false,
  sitemap: {
    hostname: 'https://anglebeatrowcolum.github.io/Template/'
  },
  head: [
    ['meta', { name: 'theme-color', content: '#5b67d6' }],
    ['link', { rel: 'icon', href: `${process.env.VITEPRESS_BASE || '/'}logo.svg`, type: 'image/svg+xml' }]
  ],
  markdown: {
    math: true,
    lineNumbers: true
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Template XCPC',
    nav: [
      { text: '首页', link: '/' },
      { text: '算法目录', link: '/catalog' },
      { text: '下载中心', link: '/export' },
      { text: '关于', link: '/about' }
    ],
    sidebar,
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到相关内容',
            resetButtonTitle: '清除查询',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/AngleBeatrowcolum/Template' }
    ],
    outline: {
      level: [2, 4],
      label: '页面导航'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    footer: {
      message: '面向 XCPC 竞赛的算法模板库',
      copyright: 'Template XCPC'
    }
  }
})
