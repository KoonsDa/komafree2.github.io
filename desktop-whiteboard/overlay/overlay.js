import {Ink} from './ink.js';
const canvas = document.querySelector('#ink');
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
function resize() { finish(); ink.resize(innerWidth, innerHeight, devicePixelRatio || 1); }
window.addEventListener('resize', resize);
function watchPixelRatio() {
  const media = matchMedia(`(resolution: ${devicePixelRatio || 1}dppx)`);
  media.addEventListener('change', () => { resize(); watchPixelRatio(); }, {once: true});
}
watchPixelRatio();
resize();
