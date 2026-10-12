const storageKey = 'ar-production-plan-v1';
const checklistItems = {
  pre: ['Define the story and audience', 'Write the script or outline', 'Confirm locations and schedule', 'Prepare equipment and crew', 'Review the storyboard and shot list'],
  shoot: ['Check batteries, cards and camera settings', 'Check framing, exposure and focus', 'Record and monitor sound', 'Capture room tone and supporting footage', 'Back up footage before clearing cards'],
  post: ['Organize and back up source footage', 'Build the rough cut', 'Review pacing and story', 'Finish sound, color and titles', 'Review the final export', 'Deliver files and archive the project']
};
const freshFrame = () => ({ id: crypto.randomUUID(), title: '', action: '', framing: 'Wide', movement: 'Static', location: '', duration: '', audio: '', image: '', done: false });
const emptyPlan = () => ({ version: 1, title: '', notes: '', frames: [freshFrame()], checks: {} });
function validatePlan(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.frames) || value.frames.length > 60) throw new Error('Use a plan exported from this toolkit (up to 60 frames).');
  const text = (v, max = 2000) => typeof v === 'string' ? v.slice(0, max) : '';
  return { version: 1, title: text(value.title, 120), notes: text(value.notes, 10000), checks: Object.fromEntries(Object.keys(checklistItems).flatMap(stage => checklistItems[stage].map((_, i) => [`${stage}-${i}`, value.checks?.[`${stage}-${i}`] === true]))), frames: value.frames.map(frame => {
    if (!frame || typeof frame !== 'object') throw new Error('One of the frames is invalid.');
    const image = text(frame.image, 2200000);
    if (image && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) throw new Error('Unsupported frame image.');
    return { id: crypto.randomUUID(), title: text(frame.title, 120), action: text(frame.action), framing: text(frame.framing, 80), movement: text(frame.movement, 80), location: text(frame.location, 200), duration: text(frame.duration, 40), audio: text(frame.audio), image, done: frame.done === true };
  }) };
}
const status = document.querySelector('#tool-status');
let plan = emptyPlan();
try { const stored = localStorage.getItem(storageKey); if (stored) plan = validatePlan(JSON.parse(stored)); } catch { status.textContent = 'Saved data could not be loaded. Start a new plan or import an exported copy.'; }
let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(plan)); status.textContent = 'Saved in this browser. Export a copy to keep or share your plan.'; }
    catch { status.textContent = 'Browser storage is full or unavailable. Export your plan to keep your changes.'; }
  }, 200);
}
const board = document.querySelector('#storyboard');
function element(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
function button(text, action) { const b = element('button', 'frame-control', text); b.type = 'button'; b.dataset.action = action; return b; }
function field(frame, key, label, options) {
  const wrap = element('div', 'frame-field'); const id = `${frame.id}-${key}`;
  const caption = element('label', '', label); caption.htmlFor = id;
  const input = element(options ? 'select' : ['action', 'audio'].includes(key) ? 'textarea' : 'input');
  input.id = id; input.dataset.field = key;
  if (options) { for (const value of new Set([...options, frame[key]].filter(Boolean))) { const option = element('option', '', value); option.value = value; input.append(option); } }
  else { input.maxLength = key === 'title' ? 120 : key === 'location' ? 200 : key === 'duration' ? 40 : 2000; if (key === 'duration') input.placeholder = 'e.g. 5 seconds'; }
  input.value = frame[key]; wrap.append(caption, input); return wrap;
}
function renderBoard(focusId) {
  board.replaceChildren();
  plan.frames.forEach((frame, index) => {
    const card = element('article', 'story-frame'); card.dataset.frameId = frame.id;
    const heading = element('div', 'frame-heading'); heading.append(element('h3', '', `Frame ${String(index + 1).padStart(2, '0')}`));
    const controls = element('div', 'frame-controls');
    const up = button('↑', 'up'); up.disabled = index === 0; up.setAttribute('aria-label', `Move frame ${index + 1} earlier`);
    const down = button('↓', 'down'); down.disabled = index === plan.frames.length - 1; down.setAttribute('aria-label', `Move frame ${index + 1} later`);
    controls.append(up, down, button('Duplicate', 'duplicate'), button('Remove', 'remove')); heading.append(controls);
    const imageArea = element('div', 'frame-image');
    if (frame.image) { const image = element('img'); image.src = frame.image; image.alt = frame.title || `Reference for frame ${index + 1}`; imageArea.append(image); }
    else imageArea.append(element('span', '', 'Add a sketch or reference image'));
    const uploadLabel = element('label', 'frame-upload', frame.image ? 'Replace image' : 'Add image');
    const upload = element('input'); upload.type = 'file'; upload.accept = 'image/png,image/jpeg,image/webp'; upload.dataset.field = 'image'; uploadLabel.append(upload);
    const imageActions = element('div', 'frame-image-actions'); imageActions.append(uploadLabel); if (frame.image) imageActions.append(button('Remove image', 'clear-image'));
    const fields = element('div', 'frame-fields');
    fields.append(field(frame, 'title', 'Shot title'), field(frame, 'location', 'Location'), field(frame, 'framing', 'Framing', ['Wide', 'Medium', 'Close-up', 'Detail', 'Over-the-shoulder']), field(frame, 'movement', 'Camera movement', ['Static', 'Pan', 'Tilt', 'Dolly', 'Handheld', 'Tracking']), field(frame, 'duration', 'Duration'), field(frame, 'action', 'Action / visual notes'), field(frame, 'audio', 'Dialogue / sound'));
    card.append(heading, imageArea, imageActions, fields); board.append(card);
  });
  if (!plan.frames.length) board.append(element('p', 'board-empty', 'Your storyboard is empty. Add a frame to start planning.'));
  document.querySelector('#add-frame').disabled = plan.frames.length >= 60;
  renderShots();
  if (focusId) board.querySelector(`[data-frame-id="${focusId}"] input[data-field="title"]`)?.focus();
}
function renderShots() {
  const tbody = document.querySelector('#shot-list'); tbody.replaceChildren();
  plan.frames.forEach((frame, index) => {
    const row = element('tr'); const done = element('td'); const check = element('input'); check.type = 'checkbox'; check.checked = frame.done; check.dataset.shotId = frame.id; check.setAttribute('aria-label', `Shot ${index + 1} captured`); done.append(check); row.append(done);
    for (const text of [`${index + 1}. ${frame.title || 'Untitled shot'}`, frame.action || '—', `${frame.framing} / ${frame.movement}`, frame.location || '—', frame.duration || '—']) row.append(element('td', '', text));
    tbody.append(row);
  });
  if (!plan.frames.length) { const row = element('tr'); const cell = element('td', '', 'Add storyboard frames to build your shot list.'); cell.colSpan = 6; row.append(cell); tbody.append(row); }
}
board.addEventListener('input', event => {
  const key = event.target.dataset.field; if (!key || key === 'image') return;
  const frame = plan.frames.find(f => f.id === event.target.closest('[data-frame-id]').dataset.frameId);
  frame[key] = event.target.value; renderShots(); save();
});
board.addEventListener('change', async event => {
  if (event.target.dataset.field !== 'image') return;
  const file = event.target.files[0]; if (!file) return;
  if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 1500000) { status.textContent = 'Choose a JPG, PNG or WebP smaller than 1.5 MB.'; event.target.value = ''; return; }
  const frame = plan.frames.find(f => f.id === event.target.closest('[data-frame-id]').dataset.frameId);
  const reader = new FileReader(); reader.onload = () => { frame.image = reader.result; renderBoard(); save(); }; reader.onerror = () => { status.textContent = 'This image could not be read. Try another file.'; }; reader.readAsDataURL(file);
});
board.addEventListener('click', event => {
  const control = event.target.closest('[data-action]'); if (!control) return;
  const index = plan.frames.findIndex(f => f.id === control.closest('[data-frame-id]').dataset.frameId); const frame = plan.frames[index];
  const action = control.dataset.action;
  if (action === 'remove') { if (!confirm(`Remove frame ${index + 1}?`)) return; plan.frames.splice(index, 1); }
  if (action === 'duplicate') { if (plan.frames.length >= 60) { status.textContent = 'This plan supports up to 60 frames.'; return; } plan.frames.splice(index + 1, 0, { ...frame, id: crypto.randomUUID(), done: false }); }
  if (action === 'clear-image') frame.image = '';
  if (action === 'up' && index > 0) [plan.frames[index - 1], plan.frames[index]] = [frame, plan.frames[index - 1]];
  if (action === 'down' && index < plan.frames.length - 1) [plan.frames[index + 1], plan.frames[index]] = [plan.frames[index + 1], frame];
  renderBoard(plan.frames[Math.min(index, plan.frames.length - 1)]?.id); save();
});
document.querySelector('#add-frame').addEventListener('click', () => { if (plan.frames.length >= 60) return; const frame = freshFrame(); plan.frames.push(frame); renderBoard(frame.id); save(); });
document.querySelector('#shot-list').addEventListener('change', event => { const frame = plan.frames.find(f => f.id === event.target.dataset.shotId); if (frame) { frame.done = event.target.checked; save(); } });
for (const [stage, items] of Object.entries(checklistItems)) {
  const target = document.querySelector(`[data-checklist="${stage}"]`);
  items.forEach((text, index) => {
    const key = `${stage}-${index}`; const label = element('label', 'checklist-row'); const check = element('input'); check.type = 'checkbox'; check.checked = Boolean(plan.checks[key]); check.dataset.checkKey = key; label.append(check, element('span', '', text)); target.append(label);
  });
  target.addEventListener('change', event => { plan.checks[event.target.dataset.checkKey] = event.target.checked; save(); });
}
for (const [id, key] of [['film-title', 'title'], ['edit-notes', 'notes']]) { const input = document.getElementById(id); input.value = plan[key]; input.addEventListener('input', () => { plan[key] = input.value; save(); }); }
function download(content, type, extension) { const url = URL.createObjectURL(new Blob([content], { type })); const a = element('a'); a.href = url; a.download = `${(plan.title || 'production-plan').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80)}.${extension}`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
document.querySelector('#export-plan').addEventListener('click', () => download(JSON.stringify(plan, null, 2), 'application/json', 'json'));
document.querySelector('#export-shots').addEventListener('click', () => {
  const cell = v => { const text = String(v); return '"' + (/^[=+@-]/.test(text) ? "'" : '') + text.replaceAll('"', '""') + '"'; };
  const rows = [['Shot', 'Title', 'Action', 'Framing', 'Movement', 'Location', 'Duration', 'Audio', 'Captured'], ...plan.frames.map((f, i) => [i + 1, f.title, f.action, f.framing, f.movement, f.location, f.duration, f.audio, f.done ? 'Yes' : 'No'])];
  download(rows.map(row => row.map(cell).join(',')).join('\r\n'), 'text/csv;charset=utf-8', 'csv');
});
document.querySelector('#print-plan').addEventListener('click', () => window.print());
document.querySelector('#import-plan').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 150000000) throw new Error('Choose a plan smaller than 150 MB.');
    const imported = validatePlan(JSON.parse(await file.text()));
    if (!confirm('Replace the current plan with this file? Export your current plan first if you want to keep it.')) return;
    plan = imported; document.querySelector('#film-title').value = plan.title; document.querySelector('#edit-notes').value = plan.notes;
    document.querySelectorAll('[data-check-key]').forEach(check => { check.checked = Boolean(plan.checks[check.dataset.checkKey]); }); renderBoard(); save();
  } catch (error) { status.textContent = `Import failed: ${error.message}`; }
  finally { event.target.value = ''; }
});
renderBoard();


window.addEventListener('beforeprint', () => {
  document.querySelector('.tool-print')?.remove();
  const report = element('section', 'tool-print');
  report.append(element('h1', '', plan.title || 'Production plan'), element('p', '', 'Storyboard · Shot list · Production checklists'), element('h2', '', 'Storyboard & shot list'));
  plan.frames.forEach((frame, index) => {
    const card = element('article', 'print-frame');
    card.append(element('h3', '', `${index + 1}. ${frame.title || 'Untitled shot'}${frame.done ? ' — Captured' : ''}`));
    if (frame.image) { const image = element('img'); image.src = frame.image; image.alt = 'Frame reference'; card.append(image); }
    card.append(element('p', '', `${frame.framing} / ${frame.movement} · Location: ${frame.location || 'Not set'} · Duration: ${frame.duration || 'Not set'}`), element('p', '', `Action: ${frame.action || '—'}`), element('p', '', `Audio: ${frame.audio || '—'}`));
    report.append(card);
  });
  for (const [stage, items] of Object.entries(checklistItems)) {
    report.append(element('h2', '', { pre: 'Pre-production', shoot: 'Production', post: 'Post-production' }[stage]));
    items.forEach((text, i) => report.append(element('p', '', `${plan.checks[`${stage}-${i}`] ? '[Done]' : '[ ]'} ${text}`)));
  }
  report.append(element('h2', '', 'Edit & delivery notes'), element('p', '', plan.notes || 'No notes yet.'));
  document.body.append(report);
});
window.addEventListener('afterprint', () => document.querySelector('.tool-print')?.remove());
