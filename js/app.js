/* ═══════════════════════════════════════════
   GLOBAL STATE
═══════════════════════════════════════════ */
let project = loadProject() || createEmptyProject();
let pickerOpen = false;
let dragSrc = null;   // { id, fromZone }  zone: 'unplaced'|'main'|'side'

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
function init() {
  bindInfoFields();
  bindTabs();
  bindStyleControls();
  renderAll();
}

/* ═══════════════════════════════════════════
   TABS
═══════════════════════════════════════════ */
function bindTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

/* ═══════════════════════════════════════════
   PERSONAL INFO
═══════════════════════════════════════════ */
function bindInfoFields() {
  document.querySelectorAll('[data-field]').forEach(el => {
    el.value = project.info[el.dataset.field] || '';
    el.addEventListener('input', () => {
      project.info[el.dataset.field] = el.value;
      save(); refreshPreview();
    });
  });
}

/* ═══════════════════════════════════════════
   MODULE CRUD
═══════════════════════════════════════════ */
function addModule(type) {
  const mod = createModule(type);
  project.modules.push(mod);
  pickerOpen = false;
  save();
  renderModuleList();
  renderLayoutTab();
  refreshPreview();
  // Scroll to new card
  requestAnimationFrame(() => {
    const el = document.querySelector(`[data-mod-id="${mod.id}"]`);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'nearest' });
  });
}

function deleteModule(id) {
  project.modules  = project.modules.filter(m => m.id !== id);
  project.layout.main = project.layout.main.filter(x => x !== id);
  project.layout.side = project.layout.side.filter(x => x !== id);
  save();
  renderModuleList();
  renderLayoutTab();
  refreshPreview();
}

function toggleModuleOpen(id) {
  const mod = project.modules.find(m => m.id === id);
  if (mod) { mod._open = !mod._open; renderModuleList(); }
}

function updateModuleField(id, field, value) {
  const mod = project.modules.find(m => m.id === id);
  if (mod) { mod[field] = value; save(); refreshPreview(); updateModCardTitle(id); }
}

function updateModCardTitle(id) {
  const mod = project.modules.find(m => m.id === id);
  if (!mod) return;
  const el = document.querySelector(`[data-mod-id="${id}"] .mod-card-title`);
  if (!el) return;
  const t = moduleTitle(mod);
  el.textContent = t || `(${MODULE_TYPES[mod.type]?.label})`;
  el.classList.toggle('placeholder', !t);
  // also update layout chips
  document.querySelectorAll(`.layout-chip[data-chip-id="${id}"] .layout-chip-title`).forEach(e => {
    e.textContent = t || MODULE_TYPES[mod.type]?.label;
  });
}

/* ═══════════════════════════════════════════
   RENDER MODULE LIST  (내 이야기 탭)
═══════════════════════════════════════════ */
function renderModuleList() {
  const container = document.getElementById('module-list');
  const picker    = document.getElementById('module-type-picker');

  if (project.modules.length === 0) {
    container.innerHTML = `<div class="module-list-empty">아직 모듈이 없습니다.<br>아래 <strong>+ 모듈 추가</strong> 버튼으로 이야기를 시작하세요.</div>`;
  } else {
    container.innerHTML = project.modules.map(mod => buildModCard(mod)).join('');
    // bind events
    container.querySelectorAll('[data-mod-id]').forEach(card => {
      const id = card.dataset.modId;
      card.querySelector('.mod-toggle')?.addEventListener('click', () => toggleModuleOpen(id));
      card.querySelector('.mod-delete')?.addEventListener('click', (e) => { e.stopPropagation(); deleteModule(id); });
      card.querySelectorAll('[data-f]').forEach(inp => {
        inp.addEventListener('input', () => updateModuleField(id, inp.dataset.f, inp.value));
      });
    });
  }

  // Picker toggle
  picker.classList.toggle('open', pickerOpen);
  document.querySelector('.add-module-toggle').textContent = pickerOpen ? '✕ 닫기' : '+ 모듈 추가';
}

function buildModCard(mod) {
  const type   = MODULE_TYPES[mod.type];
  const title  = moduleTitle(mod);
  const isOpen = mod._open;

  return `
  <div class="mod-card" data-mod-id="${mod.id}" data-type="${mod.type}">
    <div class="mod-card-head mod-toggle">
      <span class="mod-type-badge">${type.icon} ${type.label}</span>
      <span class="mod-card-title ${!title?'placeholder':''}">${title || `(${type.label})`}</span>
      <div class="mod-head-actions">
        <button class="icon-btn mod-delete danger" title="삭제">✕</button>
        <button class="icon-btn mod-toggle" title="${isOpen?'접기':'펼치기'}">${isOpen?'▲':'▼'}</button>
      </div>
    </div>
    ${isOpen ? buildModForm(mod) : ''}
  </div>`;
}

function buildModForm(mod) {
  const f = (field, placeholder, tag='input', extra='') =>
    tag === 'textarea'
      ? `<div><label class="field-label">${placeholder}</label>
           <textarea class="field-textarea" data-f="${field}" placeholder="${placeholder}">${esc(mod[field]||'')}</textarea>
         </div>`
      : `<div><label class="field-label">${placeholder}</label>
           <input class="field-input" data-f="${field}" placeholder="${placeholder}" value="${esc(mod[field]||'')}" ${extra}>
         </div>`;

  let inner = '';
  switch (mod.type) {
    case 'summary':
      inner = `<div>${f('text','소개 문장을 자유롭게 적어주세요','textarea')}</div>`;
      break;
    case 'experience':
      inner = `
        <div class="form-row two">${f('company','회사 / 기관명')}${f('role','직책 / 역할')}</div>
        <div class="form-row">${f('period','기간  예) 2021 – 현재')}</div>
        ${f('bullets','주요 업무 (한 줄에 하나씩)','textarea')}
        <div class="field-hint">- 로 시작하는 줄은 자동으로 불릿으로 변환됩니다</div>`;
      break;
    case 'project':
      inner = `
        <div class="form-row">${f('title','프로젝트 이름')}</div>
        <div class="form-row two">${f('stack','기술 스택  예) Swift · SwiftUI')}${f('team','팀 구성  예) 3인 팀 · 8주')}</div>
        <div class="form-row">${f('link','GitHub / 링크 (선택)')}</div>
        ${f('bullets','주요 내용 (한 줄에 하나씩)','textarea')}`;
      break;
    case 'skills':
      inner = `
        <div class="form-row">${f('group','그룹 이름  예) iOS & Apple, 언어, 툴')}</div>
        ${f('skills','기술 목록 (쉼표 또는 줄바꿈으로 구분)','textarea')}`;
      break;
    case 'education':
      inner = `
        <div class="form-row">${f('school','학교 이름')}</div>
        <div class="form-row two">${f('degree','전공 / 학위')}${f('period','기간')}</div>`;
      break;
    case 'activity':
      inner = `
        <div class="form-row">${f('title','활동 / 수상명')}</div>
        <div class="form-row two">${f('desc','내용 한 줄 요약')}${f('period','기간')}</div>`;
      break;
    case 'custom':
      inner = `
        <div class="form-row">${f('heading','섹션 제목  예) 자격증, 언어, 링크')}</div>
        ${f('items','항목들 (한 줄에 하나씩)','textarea')}
        <div class="field-hint">칩(chip) 형태로 나열됩니다</div>`;
      break;
  }
  return `<div class="mod-form">${inner}</div>`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ═══════════════════════════════════════════
   ADD MODULE PICKER
═══════════════════════════════════════════ */
function togglePicker() {
  pickerOpen = !pickerOpen;
  const picker = document.getElementById('module-type-picker');
  picker.classList.toggle('open', pickerOpen);
  document.querySelector('.add-module-toggle').textContent = pickerOpen ? '✕ 닫기' : '+ 모듈 추가';
}

/* ═══════════════════════════════════════════
   LAYOUT TAB
═══════════════════════════════════════════ */
function renderLayoutTab() {
  const unplaced = project.modules.filter(
    m => !project.layout.main.includes(m.id) && !project.layout.side.includes(m.id)
  );

  const poolEl = document.getElementById('unplaced-pool');
  const mainEl = document.getElementById('col-main');
  const sideEl = document.getElementById('col-side');

  poolEl.innerHTML = unplaced.length
    ? unplaced.map(m => chipHTML(m, 'unplaced')).join('')
    : `<span style="font-size:10px;color:var(--dim);padding:4px 6px;">모든 모듈이 배치됐습니다 ✓</span>`;

  mainEl.innerHTML = project.layout.main
    .map(id => project.modules.find(m => m.id === id))
    .filter(Boolean)
    .map(m => chipHTML(m, 'main')).join('')
    || `<div style="font-size:10px;color:var(--dim);padding:8px;text-align:center;">모듈을 여기로 이동하세요</div>`;

  sideEl.innerHTML = project.layout.side
    .map(id => project.modules.find(m => m.id === id))
    .filter(Boolean)
    .map(m => chipHTML(m, 'side')).join('')
    || `<div style="font-size:10px;color:var(--dim);padding:8px;text-align:center;">모듈을 여기로 이동하세요</div>`;

  bindLayoutEvents();
}

function chipHTML(mod, zone) {
  const type  = MODULE_TYPES[mod.type];
  const title = moduleTitle(mod) || type.label;
  const isPlaced = zone !== 'unplaced';
  return `
  <div class="layout-chip" data-type="${mod.type}" data-chip-id="${mod.id}" data-zone="${zone}"
       draggable="true">
    <span style="font-size:12px;">${type.icon}</span>
    <span class="layout-chip-title">${esc(title)}</span>
    ${isPlaced ? `
      <div class="layout-chip-move">
        <button class="icon-btn" onclick="moveChipUp('${mod.id}','${zone}')" title="위로">↑</button>
        <button class="icon-btn" onclick="moveChipDown('${mod.id}','${zone}')" title="아래로">↓</button>
        <button class="icon-btn danger" onclick="unplaceChip('${mod.id}')" title="배치 해제">✕</button>
      </div>` : `
      <div style="display:flex;gap:3px;">
        <button class="icon-btn" style="font-size:9px;padding:0 5px;width:auto;" onclick="placeChip('${mod.id}','main')">메인→</button>
        <button class="icon-btn" style="font-size:9px;padding:0 5px;width:auto;" onclick="placeChip('${mod.id}','side')">사이드→</button>
      </div>`}
  </div>`;
}

/* ── Placement actions ── */
function placeChip(id, zone) {
  project.layout.main = project.layout.main.filter(x => x !== id);
  project.layout.side = project.layout.side.filter(x => x !== id);
  project.layout[zone].push(id);
  save(); renderLayoutTab(); refreshPreview();
}

function unplaceChip(id) {
  project.layout.main = project.layout.main.filter(x => x !== id);
  project.layout.side = project.layout.side.filter(x => x !== id);
  save(); renderLayoutTab(); refreshPreview();
}

function moveChipUp(id, zone) {
  const arr = project.layout[zone];
  const i = arr.indexOf(id);
  if (i > 0) { [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; }
  save(); renderLayoutTab(); refreshPreview();
}

function moveChipDown(id, zone) {
  const arr = project.layout[zone];
  const i = arr.indexOf(id);
  if (i < arr.length - 1) { [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; }
  save(); renderLayoutTab(); refreshPreview();
}

/* ── Drag-and-drop ── */
function bindLayoutEvents() {
  // Drag source
  document.querySelectorAll('.layout-chip').forEach(chip => {
    chip.addEventListener('dragstart', e => {
      dragSrc = { id: chip.dataset.chipId, from: chip.dataset.zone };
      chip.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    chip.addEventListener('dragend', () => {
      chip.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      dragSrc = null;
    });
  });

  // Drop zones
  const zones = {
    'unplaced-pool': 'unplaced',
    'col-main':      'main',
    'col-side':      'side',
  };
  Object.entries(zones).forEach(([elId, zone]) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drag-over');
      if (!dragSrc || dragSrc.from === zone) return;
      // Remove from source
      project.layout.main = project.layout.main.filter(x => x !== dragSrc.id);
      project.layout.side = project.layout.side.filter(x => x !== dragSrc.id);
      // Add to target (unplaced = just remove from both)
      if (zone !== 'unplaced') project.layout[zone].push(dragSrc.id);
      save(); renderLayoutTab(); refreshPreview();
    });
  });
}

/* ═══════════════════════════════════════════
   STYLE CONTROLS
═══════════════════════════════════════════ */
function bindStyleControls() {
  renderStylePresets();
  renderRatioButtons();
}

function renderStylePresets() {
  const container = document.getElementById('bg-presets');
  container.innerHTML = BG_PRESETS.map(p => `
    <div class="color-preset ${p.id === project.layout.bgPreset ? 'active' : ''}"
         style="background:${p.bg}" title="${p.label}"
         onclick="selectBgPreset('${p.id}')">
      <span class="color-preset-label">${p.label}</span>
    </div>`).join('');
}

function renderRatioButtons() {
  const container = document.getElementById('ratio-btns');
  container.innerHTML = RATIO_OPTIONS.map(r => `
    <button class="ratio-btn ${r.id === project.layout.ratio ? 'active' : ''}"
            onclick="selectRatio('${r.id}')">${r.label}</button>`).join('');
}

function selectBgPreset(id) {
  project.layout.bgPreset = id;
  save(); renderStylePresets(); refreshPreview();
}

function selectRatio(id) {
  project.layout.ratio = id;
  save(); renderRatioButtons(); refreshPreview();
}

/* ═══════════════════════════════════════════
   PREVIEW
═══════════════════════════════════════════ */
function refreshPreview() {
  const canvas = document.getElementById('resume-canvas');
  canvas.style.animation = 'none';
  canvas.offsetHeight;
  canvas.style.animation = 'fadeUp 0.25s ease';
  canvas.innerHTML = renderResume(project);
}

/* ═══════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════ */
function exportPDF() {
  const canvas = document.getElementById('resume-canvas');
  const preset = BG_PRESETS.find(p => p.id === project.layout.bgPreset) || BG_PRESETS[0];
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing:border-box; margin:0; padding:0; }
      body { background:#fff; font-family:'Noto Sans KR',sans-serif; }
      @page { size:A4; margin:0; }
      @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
    </style>
  </head><body>${canvas.innerHTML}</body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 600);
}

function exportMD() {
  const md  = projectToMarkdown(project);
  const name = (project.info.name || 'resume').replace(/\s+/g, '_');
  const blob = new Blob([md], { type:'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${name}_resume.md`; a.click();
  URL.revokeObjectURL(url);
}

/* ── Clear project ── */
function clearProject() {
  if (!confirm('전체 내용을 초기화하시겠습니까? 복구할 수 없습니다.')) return;
  project = createEmptyProject();
  save();
  // re-sync info fields
  document.querySelectorAll('[data-field]').forEach(el => { el.value = ''; });
  renderAll();
}

/* ═══════════════════════════════════════════
   FULL RENDER
═══════════════════════════════════════════ */
function renderAll() {
  renderModuleList();
  renderLayoutTab();
  renderStylePresets();
  renderRatioButtons();
  refreshPreview();
}

/* ═══════════════════════════════════════════
   SAVE
═══════════════════════════════════════════ */
function save() { saveProject(project); }

/* ═══════════════════════════════════════════
   START
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
