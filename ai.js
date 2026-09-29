// ai.js — AI 情绪分析模块（transformers.js 在浏览器本地推理，不上传任何文字）
import { pipeline, env } from 'https://unpkg.com/@xenova/transformers@2.17.2/dist/transformers.min.js';

// huggingface.co 在国内常不可达，改走官方镜像 hf-mirror.com；模型文件从本地浏览器缓存加载
env.remoteHost = 'https://hf-mirror.com';
env.useBrowserCache = true;

const MODEL = 'Xenova/distilbert-base-multilingual-cased-sentiments-student';

const EMOTION = {
  positive: { zh: '积极', cls: 'pos', sign: 1,  prompt: '这件让你开心/有力量的事，最关键是哪一步？下次如何复现它？' },
  neutral:  { zh: '中性', cls: 'neu', sign: 0,  prompt: '今天似乎平稳。有没有某个被忽略的小细节，其实值得记下来？' },
  negative: { zh: '消极', cls: 'neg', sign: -1, prompt: '是什么让你低落？如果给好朋友讲这件事，你会从哪一句开始？' },
};

let pipe = null;
let loading = null;

export async function load() {
  if (pipe) return pipe;
  if (loading) return loading;
  loading = pipeline('sentiment-analysis', MODEL)
    .then((p) => { pipe = p; return p; })
    .catch((err) => { loading = null; throw err; }); // 失败后可重试
  return loading;
}

export async function analyze(text) {
  const p = await load();
  const out = await p(text);
  const arr = Array.isArray(out) ? out : [out];
  const top = arr.slice().sort((a, b) => b.score - a.score)[0];
  const label = (top.label || '').toLowerCase();
  const m = EMOTION[label] || { zh: label, cls: 'neu', sign: 0, prompt: '' };
  return { label, score: top.score, zh: m.zh, cls: m.cls, sign: m.sign, prompt: m.prompt };
}

export { MODEL, EMOTION };
