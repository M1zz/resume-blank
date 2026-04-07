/* ═══════════════════════════════════════════
   RESUME RENDERER
   renderResume(project) → HTML string
═══════════════════════════════════════════ */

function renderResume(project) {
  const { info, modules, layout } = project;
  const preset  = BG_PRESETS.find(p => p.id === layout.bgPreset) || BG_PRESETS[0];
  const ratio   = RATIO_OPTIONS.find(r => r.id === layout.ratio) || RATIO_OPTIONS[0];
  const hl      = preset.accent;

  const hasInfo = info.name || info.title;
  const hasMain = layout.main.length > 0;
  const hasSide = layout.side.length > 0;

  if (!hasInfo && !hasMain && !hasSide) {
    return `<div class="resume-empty">
      <div class="icon">📄</div>
      <p><strong>왼쪽에서 모듈을 만들고 배치하세요</strong><br>
      ① 내 이야기 탭에서 경력·프로젝트·기술 등 모듈 작성<br>
      ② 레이아웃 탭에서 메인/사이드 컬럼에 배치<br>
      ③ PDF 또는 MD로 저장</p>
    </div>`;
  }

  const mainHTML = layout.main
    .map(id => modules.find(m => m.id === id))
    .filter(Boolean)
    .map(m => renderModule(m, hl))
    .join('');

  const sideHTML = layout.side
    .map(id => modules.find(m => m.id === id))
    .filter(Boolean)
    .map(m => renderModule(m, hl))
    .join('');

  return `
  <div style="font-family:'Noto Sans KR',sans-serif;color:#1c1814;font-size:11px;">

    <!-- HEADER -->
    <div style="background:${preset.bg};color:#fff;padding:40px 46px 32px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;">
        <div style="flex:1;">
          ${info.name ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:2px;line-height:1;color:#fff;">${info.name}</div>` : ''}
          ${info.title ? `<div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${hl};margin-top:7px;font-weight:600;">${info.title}</div>` : ''}
        </div>
        <div style="text-align:right;font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.45);line-height:2.3;flex-shrink:0;padding-top:4px;">
          ${info.email    ? `<div style="color:rgba(255,255,255,0.85);">${info.email}</div>` : ''}
          ${info.phone    ? `<div>${info.phone}</div>` : ''}
          ${info.location ? `<div>${info.location}</div>` : ''}
          ${info.website  ? `<div style="color:${hl};">${info.website}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- BODY -->
    <div style="padding:28px 46px;display:grid;grid-template-columns:${ratio.cols};gap:24px 36px;">
      <div>${mainHTML || emptyCol('메인 컬럼이 비어 있습니다')}</div>
      <div>${sideHTML || emptyCol('사이드 컬럼이 비어 있습니다')}</div>
    </div>

  </div>`;
}

function emptyCol(msg) {
  return `<div style="padding:20px;border:1.5px dashed #e8e4de;border-radius:6px;text-align:center;color:#b8b0a6;font-size:10px;">${msg}</div>`;
}

/* ── Section title ── */
function sTitle(label, hl) {
  return `<div style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:${hl};margin-bottom:11px;padding-bottom:5px;border-bottom:1.5px solid ${hl}20;">${label}</div>`;
}

/* ── Bullets parser (one per line) ── */
function bullets(text, color) {
  if (!text?.trim()) return '';
  return `<ul style="margin:6px 0 0 15px;padding:0;color:#3a3530;">
    ${text.trim().split('\n').filter(l=>l.trim()).map(l =>
      `<li style="margin-bottom:3px;line-height:1.65;font-size:11px;">${l.trim().replace(/^[-·•]\s*/,'')}</li>`
    ).join('')}
  </ul>`;
}

/* ── Items parser (used in custom / skills) ── */
function items(text) {
  return text?.trim().split('\n').map(l => l.trim()).filter(Boolean) || [];
}

/* ═══════════════════════════════════════════
   MODULE RENDERERS
═══════════════════════════════════════════ */
function renderModule(mod, hl) {
  switch (mod.type) {
    case 'summary':    return renderSummary(mod, hl);
    case 'experience': return renderExperience(mod, hl);
    case 'project':    return renderProject(mod, hl);
    case 'skills':     return renderSkills(mod, hl);
    case 'education':  return renderEducation(mod, hl);
    case 'activity':   return renderActivity(mod, hl);
    case 'custom':     return renderCustom(mod, hl);
    default:           return '';
  }
}

function renderSummary(mod, hl) {
  if (!mod.text?.trim()) return '';
  return `<div style="margin-bottom:22px;padding-bottom:20px;border-bottom:1px solid #f0ede8;">
    <div style="font-family:'Source Serif 4',serif;font-style:italic;color:#3a3530;line-height:1.85;font-size:12px;">${mod.text.trim()}</div>
  </div>`;
}

function renderExperience(mod, hl) {
  if (!mod.company && !mod.role) return '';
  return `<div style="margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid #f0ede8;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
      <div>
        ${mod.company ? `<div style="font-weight:700;font-size:12px;color:#1c1814;">${mod.company}</div>` : ''}
        ${mod.role    ? `<div style="color:${hl};font-size:10px;margin-top:2px;font-weight:600;">${mod.role}</div>` : ''}
      </div>
      ${mod.period ? `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#9a8e84;white-space:nowrap;margin-top:2px;">${mod.period}</div>` : ''}
    </div>
    ${bullets(mod.bullets, hl)}
  </div>`;
}

function renderProject(mod, hl) {
  if (!mod.title) return '';
  return `<div style="margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid #f0ede8;">
    <div style="font-weight:700;font-size:12px;color:#1c1814;margin-bottom:5px;">${mod.title}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:4px;">
      ${mod.stack ? `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:${hl};background:${hl}14;padding:2px 7px;border-radius:3px;">${mod.stack}</span>` : ''}
      ${mod.team  ? `<span style="font-size:9px;color:#9a8e84;">${mod.team}</span>` : ''}
      ${mod.link  ? `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#b8b0a6;text-decoration:underline;">${mod.link}</span>` : ''}
    </div>
    ${bullets(mod.bullets, hl)}
  </div>`;
}

function renderSkills(mod, hl) {
  if (!mod.skills?.trim()) return '';
  const chips = mod.skills.split(/[\n,]/).map(s=>s.trim()).filter(Boolean);
  return `<div style="margin-bottom:16px;">
    ${mod.group ? sTitle(mod.group, hl) : ''}
    <div style="display:flex;flex-wrap:wrap;gap:4px;">
      ${chips.map(s=>`<span style="font-size:9.5px;padding:2px 9px;border-radius:3px;background:#f0ede8;color:#3a3530;border:1px solid #ddd8d0;">${s}</span>`).join('')}
    </div>
  </div>`;
}

function renderEducation(mod, hl) {
  if (!mod.school) return '';
  return `<div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f0ede8;">
    <div style="font-weight:700;font-size:11.5px;color:#1c1814;">${mod.school}</div>
    ${mod.degree ? `<div style="font-size:10px;color:#6a6258;margin-top:2px;">${mod.degree}</div>` : ''}
    ${mod.period ? `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#9a8e84;margin-top:2px;">${mod.period}</div>` : ''}
  </div>`;
}

function renderActivity(mod, hl) {
  if (!mod.title) return '';
  return `<div style="display:grid;grid-template-columns:80px 1fr;gap:0 12px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #f5f2ee;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#9a8e84;padding-top:2px;line-height:1.5;">${mod.period||''}</div>
    <div>
      <div style="font-weight:700;font-size:11px;color:#1c1814;">${mod.title}</div>
      ${mod.desc ? `<div style="font-size:10px;color:#6a6258;margin-top:1px;">${mod.desc}</div>` : ''}
    </div>
  </div>`;
}

function renderCustom(mod, hl) {
  if (!mod.heading && !mod.items?.trim()) return '';
  const lines = items(mod.items);
  return `<div style="margin-bottom:18px;">
    ${mod.heading ? sTitle(mod.heading, hl) : ''}
    ${lines.length > 0
      ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${lines.map(l => `<span style="font-size:10px;padding:3px 9px;border-radius:3px;background:#f7f5f2;color:#3a3530;border:1px solid #e8e4de;">${l}</span>`).join('')}
        </div>`
      : ''}
  </div>`;
}

/* ═══════════════════════════════════════════
   MARKDOWN EXPORT
═══════════════════════════════════════════ */
function projectToMarkdown(project) {
  const { info, modules, layout } = project;
  let md = '';

  if (info.name)  md += `# ${info.name}\n`;
  if (info.title) md += `**${info.title}**\n\n`;

  const contacts = [info.email, info.phone, info.location, info.website].filter(Boolean);
  if (contacts.length) md += contacts.join(' | ') + '\n\n---\n\n';

  const allIds   = [...layout.main, ...layout.side];
  const ordered  = allIds.map(id => modules.find(m => m.id === id)).filter(Boolean);

  for (const mod of ordered) {
    switch (mod.type) {
      case 'summary':
        md += `## 소개\n\n${mod.text}\n\n`;
        break;
      case 'experience':
        md += `### ${mod.company}${mod.role ? ` — ${mod.role}` : ''}\n`;
        if (mod.period) md += `*${mod.period}*\n\n`;
        if (mod.bullets) mod.bullets.split('\n').filter(Boolean).forEach(b => md += `- ${b.trim().replace(/^[-·•]\s*/,'')}\n`);
        md += '\n';
        break;
      case 'project':
        md += `### ${mod.title}\n`;
        if (mod.stack) md += `\`${mod.stack}\``;
        if (mod.team)  md += ` · ${mod.team}`;
        if (mod.link)  md += ` · ${mod.link}`;
        md += '\n\n';
        if (mod.bullets) mod.bullets.split('\n').filter(Boolean).forEach(b => md += `- ${b.trim().replace(/^[-·•]\s*/,'')}\n`);
        md += '\n';
        break;
      case 'skills':
        if (mod.group) md += `## ${mod.group}\n\n`;
        if (mod.skills) md += mod.skills.split(/[\n,]/).map(s=>s.trim()).filter(Boolean).map(s=>`\`${s}\``).join('  ') + '\n\n';
        break;
      case 'education':
        md += `## 학력\n\n- **${mod.school}**`;
        if (mod.degree) md += ` — ${mod.degree}`;
        if (mod.period) md += ` (${mod.period})`;
        md += '\n\n';
        break;
      case 'activity':
        md += `- **${mod.title}**${mod.desc ? ` — ${mod.desc}` : ''}${mod.period ? ` *(${mod.period})*` : ''}\n`;
        break;
      case 'custom':
        if (mod.heading) md += `## ${mod.heading}\n\n`;
        if (mod.items) mod.items.split('\n').filter(Boolean).forEach(l => md += `- ${l.trim()}\n`);
        md += '\n';
        break;
    }
  }

  return md;
}
