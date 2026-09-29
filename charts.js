// charts.js — 轻量 SVG 图表（零第三方依赖）
const W = 320, H = 90, PAD = 6;

function color(v) { return v > 0 ? '#34d399' : v < 0 ? '#f87171' : '#f59e0b'; }

export function trend(entries) {
  if (!entries || entries.length < 2) return '<div class="chart-empty">记录满 2 条后显示趋势</div>';
  const last = entries.slice(-30);
  const min = Math.min(...last.map((e) => e.sign));
  const max = Math.max(...last.map((e) => e.sign));
  const range = (max - min) || 1;
  const n = last.length;
  const stepX = (W - PAD * 2) / (n - 1);
  const pts = last.map((e, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - ((e.sign - min) / range) * (H - PAD * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (H - PAD) + ' L' + pts[0][0].toFixed(1) + ' ' + (H - PAD) + ' Z';
  const dots = pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${color(last[i].sign)}"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="情绪趋势">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c8cff" stop-opacity=".35"/><stop offset="1" stop-color="#6c8cff" stop-opacity="0"/></linearGradient></defs>
    <line x1="${PAD}" y1="${H - PAD}" x2="${W - PAD}" y2="${H - PAD}" stroke="#2a2f40"/>
    <line x1="${PAD}" y1="${H / 2}" x2="${W - PAD}" y2="${H / 2}" stroke="#2a2f40" stroke-dasharray="3 3"/>
    <path d="${area}" fill="url(#g)"/><path d="${path}" fill="none" stroke="#6c8cff" stroke-width="2" stroke-linejoin="round"/>${dots}</svg>`;
}

export function distribution(entries) {
  const count = { pos: 0, neu: 0, neg: 0 };
  entries.forEach((e) => { count[e.cls] = (count[e.cls] || 0) + 1; });
  const total = entries.length || 1;
  const items = [
    { k: 'pos', zh: '积极', c: '#34d399' },
    { k: 'neu', zh: '中性', c: '#f59e0b' },
    { k: 'neg', zh: '消极', c: '#f87171' },
  ];
  return '<div class="dist">' + items.map((it) => {
    const v = count[it.k] || 0;
    const pct = Math.round(v / total * 100);
    return `<div class="dist-row"><span class="dist-label">${it.zh}</span>
      <div class="dist-bar"><div class="dist-fill" style="width:${pct}%;background:${it.c}"></div></div>
      <span class="dist-val">${v} · ${pct}%</span></div>`;
  }).join('') + '</div>';
}
