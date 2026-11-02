import {Ink} from './ink.js';
const canvas = document.querySelector('#ink');
const paper = document.querySelector('#paper');
const ink = new Ink(canvas);
let state = {mode: 'interact'};
let pointer = null;
const finish = () => {
  const previous = pointer; pointer = null;
  ink.finish();
  if (previous !== null && canvas.hasPointerCapture(previous)) canvas.releasePointerCapture(previous);
};
function receive(next) {
  finish();
  ink.selectSurface(next.displayId);
  const geometryChanged = state.displayRevision !== next.displayRevision;
  state = next;
  renderPaper();
  document.body.dataset.mode = state.mode;
  document.body.dataset.tool = state.tool;
  if (geometryChanged) requestAnimationFrame(resize);
}
window.whiteboard.onState(receive);
window.whiteboard.onInk(command => { finish(); if (command === 'undo') ink.undo(); if (command === 'clear') ink.clear(); });
window.whiteboard.state().then(receive);
const point = event => { const rect = canvas.getBoundingClientRect(); return {x: event.clientX - rect.left, y: event.clientY - rect.top}; };
canvas.addEventListener('pointerdown', event => {
  if (state.mode !== 'draw' || pointer !== null || event.button !== 0) return;
  event.preventDefault(); pointer = event.pointerId;
  canvas.setPointerCapture(pointer);
  ink.begin(point(event), state);
});
canvas.addEventListener('pointermove', event => {
  if (pointer !== event.pointerId || state.mode !== 'draw') return;
  event.preventDefault();
  const events = event.getCoalescedEvents?.();
  (events?.length ? events : [event]).forEach(value => ink.move(point(value)));
});
canvas.addEventListener('pointerup', event => { if (pointer === event.pointerId) { ink.move(point(event)); finish(); } });
canvas.addEventListener('pointercancel', event => { if (pointer === event.pointerId) finish(); });
canvas.addEventListener('lostpointercapture', event => { if (pointer === event.pointerId) finish(); });
window.addEventListener('blur', finish);
window.addEventListener('keydown', event => { if (event.key === 'Escape') window.whiteboard.command('escape'); });
function resize() { finish(); ink.resize(innerWidth, innerHeight, devicePixelRatio || 1); renderPaper(); }
function renderPaper() {
  const ratio = devicePixelRatio || 1, w = innerWidth, h = innerHeight;
  paper.width = Math.round(w * ratio); paper.height = Math.round(h * ratio);
  const ctx = paper.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const type = state.background || 'none';
  if (type === 'none') return;
  ctx.fillStyle = type === 'black' ? '#182330' : '#ffffff'; ctx.fillRect(0, 0, w, h);
  const step = state.gridSize || 40;
  ctx.strokeStyle = '#b4d3ed'; ctx.lineWidth = 1;
  const hLine = y => { ctx.beginPath(); ctx.moveTo(0, Math.round(y)+0.5); ctx.lineTo(w, Math.round(y)+0.5); ctx.stroke(); };
  const vLine = x => { ctx.beginPath(); ctx.moveTo(Math.round(x)+0.5, 0); ctx.lineTo(Math.round(x)+0.5, h); ctx.stroke(); };
  if (type === 'grid') { for (let x=0; x<=w; x+=step) vLine(x); for (let y=0; y<=h; y+=step) hLine(y); }
  if (type === 'dot') { ctx.fillStyle='#8caed2'; for (let x=step; x<w; x+=step) for (let y=step; y<h; y+=step) { ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); } }
  if (type === 'music') { const gap = Math.max(12,Math.round(step*.45)); const block=gap*7; ctx.strokeStyle='#566171'; for(let top=gap*2;top<h;top+=block) for(let i=0;i<5;i++) hLine(top+i*gap); }
  if (type === 'english') { const gap=Math.max(15,Math.round(step*.65)), block=gap*5; for(let top=gap;top<h;top+=block) for(let i=0;i<4;i++) { ctx.strokeStyle=i===2?'#d78e9d':'#a1b9d5'; ctx.setLineDash(i===1?[5,6]:[]); hLine(top+i*gap); } ctx.setLineDash([]); }
  if (type === 'korean') { const cell=Math.max(36,step*2), margin=14; ctx.strokeStyle='#bacde1'; for(let x=margin;x<w;x+=cell) vLine(x); for(let y=margin;y<h;y+=cell) hLine(y); }
}
window.addEventListener('resize', resize);
function watchPixelRatio() {
  const media = matchMedia(`(resolution: ${devicePixelRatio || 1}dppx)`);
  media.addEventListener('change', () => { resize(); watchPixelRatio(); }, {once: true});
}
watchPixelRatio();
resize();
