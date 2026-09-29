# MoodLens · AI 情绪日记

一个**真实可运行**的浏览器端 AI 情绪分析 Web 产品：写下你的日记，AI 在你本地实时分析情绪（积极 / 中性 / 消极），自动打标签、给一条反思提示，并生成情绪趋势与分布看板。**所有文字只在你的浏览器里处理，不上传任何内容。**

## ✨ 线上体验

👉 https://askjdghfjkghashjkasd.github.io/C6-ai-mood-journal/

## 功能

- **AI 情绪分析**：transformers.js 在浏览器本地运行 DistilBERT 多语言情感模型（支持中文 / English）
- **情绪看板**：情绪趋势折线、积极 / 中性 / 消极分布、连续记录天数、主导情绪
- **本地持久化**：localStorage 存储，支持 JSON 导出 / 导入 / 清空
- **隐私友好**：无后端、无账号、无 API key、零上传

## 技术栈

- 纯静态：原生 HTML / CSS / 原生 ES Modules，零构建、零框架
- AI：`@xenova/transformers`（2.17.2）+ ONNX Runtime Web（WASM 本地推理）
- 模型：`Xenova/distilbert-base-multilingual-cased-sentiments-student`（多语言情感，3 分类：positive/neutral/negative）
- 模型加载：`hf-mirror.com` 镜像（国内友好）；库从 `unpkg.com` 加载
- 图表：手写轻量 SVG（无第三方图表库）
- 部署：GitHub Pages

## 本地运行

任意静态服务器均可：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

首次点击「AI 情绪分析」会下载模型（约数十 MB），之后走浏览器缓存。

## 架构

```
index.html   页面结构
styles.css   样式
ai.js        AI 模块：模型加载 + 情绪映射 + 反思提示
charts.js    SVG 图表：趋势折线 + 分布条形
app.js       状态与交互：localStorage、渲染、导入导出
```

## 隐私与边界

所有推理均在本地浏览器完成；情绪标签来自模型的概率输出，仅供参考，不构成心理诊断。
