# Template XCPC

面向 XCPC 竞赛的算法模板仓库。仓库中的编号目录是唯一内容源；网站构建时会自动扫描 Markdown、C++ 和头文件，生成章节导航、算法页面、全文搜索与 PDF 下载中心。

## 本地预览

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm preview
```

生成整本及分章节 PDF 需要 Typst：

```bash
pnpm setup:fonts
pnpm prebuild:pdf
```

推送到 `main` 后，GitHub Actions 会构建并发布到：

<https://anglebeatrowcolum.github.io/Template/>

空文件是合法的内容占位符。网站会保留其目录位置并显示“内容待补充”；填入内容后无需修改站点配置。
