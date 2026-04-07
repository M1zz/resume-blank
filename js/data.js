/* ═══════════════════════════════════════════
   MODULE TYPE DEFINITIONS
═══════════════════════════════════════════ */
const MODULE_TYPES = {
  summary:    { label: '요약 · 소개',  icon: '💬', fields: ['text'] },
  experience: { label: '경력',         icon: '💼', fields: ['company','role','period','bullets'] },
  project:    { label: '프로젝트',     icon: '🛠️', fields: ['title','stack','team','bullets','link'] },
  skills:     { label: '기술 스택',    icon: '⚡', fields: ['group','skills'] },
  education:  { label: '학력',         icon: '🎓', fields: ['school','degree','period'] },
  activity:   { label: '활동 · 수상',  icon: '🏅', fields: ['title','desc','period'] },
  custom:     { label: '커스텀 블록',  icon: '✦',  fields: ['heading','items'] },
};

/* ═══════════════════════════════════════════
   HEADER BG PRESETS
═══════════════════════════════════════════ */
const BG_PRESETS = [
  { id:'navy',    label:'Navy',    bg:'linear-gradient(135deg,#0d1f3c,#1a3a6b)',  accent:'#60a5fa' },
  { id:'charcoal',label:'Ink',     bg:'linear-gradient(135deg,#111318,#252a3a)',  accent:'#f5a623' },
  { id:'forest',  label:'Forest',  bg:'linear-gradient(135deg,#061306,#0e2c0e)',  accent:'#4ade80' },
  { id:'brick',   label:'Brick',   bg:'linear-gradient(135deg,#1c0800,#3d1500)',  accent:'#fb923c' },
  { id:'plum',    label:'Plum',    bg:'linear-gradient(135deg,#150824,#2e0f52)',  accent:'#c084fc' },
  { id:'slate',   label:'Slate',   bg:'linear-gradient(135deg,#0f172a,#1e3a5f)',  accent:'#38bdf8' },
  { id:'rose',    label:'Rose',    bg:'linear-gradient(135deg,#1c0010,#3d0025)',  accent:'#f9a8d4' },
  { id:'teal',    label:'Teal',    bg:'linear-gradient(135deg,#001c18,#003d32)',  accent:'#2dd4bf' },
];

const RATIO_OPTIONS = [
  { id:'wide',    label:'메인 넓게',   cols:'2fr 1fr'   },
  { id:'balanced',label:'균형',        cols:'1.5fr 1fr' },
  { id:'equal',   label:'1:1',         cols:'1fr 1fr'   },
];

/* ═══════════════════════════════════════════
   EMPTY PROJECT TEMPLATE
═══════════════════════════════════════════ */
function createEmptyProject() {
  return {
    info: {
      name:     '',
      title:    '',
      email:    '',
      phone:    '',
      location: '',
      website:  '',
    },
    modules:  [],      // array of module objects
    layout: {
      bgPreset: 'navy',
      ratio:    'wide',
      main:     [],    // module ids
      side:     [],    // module ids
    },
  };
}

/* ═══════════════════════════════════════════
   MODULE FACTORY
═══════════════════════════════════════════ */
let _uid = Date.now();
function createModule(type) {
  const id = 'm' + (++_uid);
  const base = { id, type, _open: true };
  switch (type) {
    case 'summary':    return { ...base, text: '' };
    case 'experience': return { ...base, company: '', role: '', period: '', bullets: '' };
    case 'project':    return { ...base, title: '', stack: '', team: '', bullets: '', link: '' };
    case 'skills':     return { ...base, group: '', skills: '' };
    case 'education':  return { ...base, school: '', degree: '', period: '' };
    case 'activity':   return { ...base, title: '', desc: '', period: '' };
    case 'custom':     return { ...base, heading: '', items: '' };
    default:           return base;
  }
}

/* ═══════════════════════════════════════════
   MODULE DISPLAY TITLE  (for chips / cards)
═══════════════════════════════════════════ */
function moduleTitle(mod) {
  switch (mod.type) {
    case 'summary':    return mod.text?.slice(0, 28) || null;
    case 'experience': return mod.company || null;
    case 'project':    return mod.title || null;
    case 'skills':     return mod.group ? `기술: ${mod.group}` : null;
    case 'education':  return mod.school || null;
    case 'activity':   return mod.title || null;
    case 'custom':     return mod.heading || null;
  }
  return null;
}

/* ═══════════════════════════════════════════
   PERSISTENCE  (localStorage)
═══════════════════════════════════════════ */
const STORAGE_KEY = 'resume_blank_v1';

function saveProject(project) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); } catch(e) {}
}

function loadProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}
