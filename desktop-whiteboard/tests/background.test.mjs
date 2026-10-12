import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawBackground} from '../overlay/background.js';
const setup = () => {
  const calls = [];
  const ctx = new Proxy({}, {get: (_, key) => (...args) => calls.push([key, ...args]), set: (_, key, value) => {calls.push([key, value]); return true;}});
  return {canvas: {getContext: () => ctx}, calls};
};
test('desktop stays transparent; each board scales at mixed DPI', () => {
  for (const ratio of [1, 1.25, 1.5, 2]) for (const background of ['desktop','white','black','grid','dots','music','english','korean']) {
    const {canvas, calls} = setup();
    drawBackground(canvas, 1280, 720, ratio, {background});
    assert.equal(canvas.width, Math.round(1280 * ratio));
    assert.equal(canvas.height, Math.round(720 * ratio));
    assert.equal(calls.some(c => c[0] === 'fillRect'), background !== 'desktop');
  }
});
test('music has complete five-line staves and English has four-line groups', () => {
  for (const [background, count] of [['music',5],['english',4]]) {
    const {canvas,calls}=setup(); drawBackground(canvas,1280,720,1,{background,spacing:48});
    const lines = calls.filter(c=>c[0]==='moveTo');
    assert(lines.length > 0); assert.equal(lines.length % count,0);
    assert(lines.every(c=>c[1]===48));
  }
});
test('grid numbers are optional teaching units and spacing changes density', () => {
  const small=setup(), large=setup();
  drawBackground(small.canvas,1280,720,1,{background:'grid',spacing:24,gridLabels:true});
  drawBackground(large.canvas,1280,720,1,{background:'grid',spacing:96});
  assert(small.calls.filter(c=>c[0]==='stroke').length > large.calls.filter(c=>c[0]==='stroke').length);
  assert(small.calls.some(c=>c[0]==='fillText'&&c[1]==='0'));
  assert(!large.calls.some(c=>c[0]==='fillText'));
});
test('grid origin is viewport center with signed x and upward-positive y at all spacings',()=>{
  for(const spacing of [24,48,72,96]){
    const {canvas,calls}=setup();drawBackground(canvas,1280,720,1.5,{background:'grid',spacing,gridLabels:true});
    assert(calls.some(c=>c[0]==='moveTo'&&c[1]===640&&c[2]===0));
    assert(calls.some(c=>c[0]==='moveTo'&&c[1]===0&&c[2]===360));
    assert(calls.some(c=>c[0]==='fillText'&&c[1]==='0'&&c[2]===630&&c[3]===380));
    assert(calls.some(c=>c[0]==='fillText'&&c[1]==='-1'&&c[2]===640-spacing&&c[3]===380));
    assert(calls.some(c=>c[0]==='fillText'&&c[1]==='1'&&c[2]===630&&c[3]===360-spacing+5));
  }
});
