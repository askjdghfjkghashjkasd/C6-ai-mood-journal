// app.js — 应用状态与交互（MoodLens · AI 情绪日记）
import { analyze, load } from './ai.js';
import { trend, distribution } from './charts.js';

const KEY = 'moodlens.entries.v1';
let entries = loadEntries();
let pending = null; // 已分析、待保存的条目

const $ = (id) => document.getElementById(id);
const input = $('entryInput'), analyzeBtn = $('analyzeBtn'), saveBtn = $('saveBtn');
const resultBox = $('resultBox'), emotionTag = $('emotionTag'), confidence = $('confidence'), reflection = $('reflection');
const badge = $('modelBadge');

function loadEntries() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function persist() { localStorage.setItem(KEY, JSON.stringify(entries)); }
const today = () => new Date().toISOString().slice(0, 10);

function computeStreak() {
  if (!entries.length) return 0;
  const days = new Set(entries.map((e) => e.date));
  let s = 0; const d = new Date();
  while (days.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

function dominant() {
  const c = { pos: 0, neu: 0, neg: 0 };
  entries.forEach((e) => { c[e.cls] = (c[e.cls] || 0) + 1; });
  if (!c.pos && !c.neu && !c.neg) return '—';
  const order = [['pos', '积极'], ['neg', '消极'], ['neu', '中性']];
  return order.reduce((a, b) => (c[b[0]] > c[a[0]] ? b : a), order[0])[1];
}

function render() {
  $('statCount').textContent = entries.length;
  $('statMood').textContent = dominant();
  $('statStreak').textContent = computeStreak();
  $('trendChart').innerHTML = trend(entries.slice().reverse());
  $('distChart').innerHTML = distribution(entries);
  $('emptyHint').style.display = entries.length ? 'none' : 'block';
  const list = $('entryList');
  list.innerHTML = '';
  entries.forEach((e, i) => {
    const li = document.createElement('li');
    const meta = document.createElement('div'); meta.className = 'entry-meta';
    const tag = document.createElement('span'); tag.className = 'emotion-tag ' + e.cls; tag.textContent = e.zh || e.label;
    const date = document.createElement('span'); date.className = 'entry-date';
    date.textContent = e.date + (e.score != null ? ' · 置信 ' + Math.round(e.score * 100) + '%' : '');
    const del = document.createElement('button'); del.className = 'btn ghost danger'; del.textContent = '删除';
    del.onclick = () => { entries.splice(i, 1); persist(); render(); };
    meta.append(tag, date, del);
    const text = document.createElement('div'); text.className = 'entry-text'; text.textContent = e.text;
    li.append(meta, text);
    list.appendChild(li);
  });
}

async function doAnalyze() {
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  analyzeBtn.disabled = true; analyzeBtn.textContent = 'AI 分析中…';
  saveBtn.disabled = true;
  badge.textContent = 'AI 模型加载中…'; badge.classList.remove('err', 'ready');
  try {
    const r = await analyze(text);
    pending = { text, label: r.label, zh: r.zh, cls: r.cls, sign: r.sign, score: r.score, date: today(), ts: Date.now() };
    emotionTag.textContent = r.zh; emotionTag.className = 'emotion-tag ' + r.cls;
    confidence.textContent = '置信度 ' + Math.round(r.score * 100) + '%';
    reflection.textContent = r.prompt;
    resultBox.classList.remove('hidden');
    saveBtn.disabled = false;
    badge.textContent = 'AI 模型就绪 ✓'; badge.classList.add('ready');
  } catch (err) {
    badge.textContent = 'AI 加载失败，请刷新重试'; badge.classList.add('err');
    emotionTag.textContent = '失败'; emotionTag.className = 'emotion-tag neu';
    confidence.textContent = '';
    reflection.textContent = '分析失败：需能访问 hf-mirror.com（首次会下载模型，约数十 MB）。请检查网络后重试。';
    resultBox.classList.remove('hidden');
  } finally {
    analyzeBtn.disabled = false; analyzeBtn.textContent = '✨ AI 情绪分析';
  }
}

function doSave() {
  if (!pending) return;
  entries.unshift(pending); pending = null;
  persist(); render();
  input.value = ''; resultBox.classList.add('hidden'); saveBtn.disabled = true;
}

function doExport() {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'moodlens-backup-' + today() + '.json';
  a.click(); URL.revokeObjectURL(a.href);
}

function doImport(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const data = JSON.parse(rd.result);
      if (!Array.isArray(data)) throw new Error('bad');
      entries = data.concat(entries); persist(); render();
    } catch (e) { alert('导入失败：文件格式不正确'); }
  };
  rd.readAsText(file);
}

function doClear() {
  if (!entries.length) return;
  if (confirm('确定清空全部 ' + entries.length + ' 条日记吗？此操作不可撤销。')) {
    entries = []; persist(); render();
  }
}

// 静默预加载模型，让首次点击更快
load().then(() => { badge.textContent = 'AI 模型就绪 ✓'; badge.classList.add('ready'); })
  .catch(() => { /* 首次点击时再报错 */ });

analyzeBtn.addEventListener('click', doAnalyze);
saveBtn.addEventListener('click', doSave);
$('exportBtn').addEventListener('click', doExport);
$('importBtn').addEventListener('click', () => $('importFile').click());
$('importFile').addEventListener('change', (e) => { if (e.target.files[0]) doImport(e.target.files[0]); e.target.value = ''; });
$('clearBtn').addEventListener('click', doClear);
input.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') doAnalyze(); });

render();
