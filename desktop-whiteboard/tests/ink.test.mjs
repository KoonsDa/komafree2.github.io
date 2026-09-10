import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Ink} from '../overlay/ink.js';
function setup() {
  const calls = [];
  const ctx = new Proxy({}, {get: (target, key) => key in target ? target[key] : (...args) => calls.push([key, ...args]), set: (target,key,value) => { target[key] = value; calls.push([key,value]); return true; }});
  const canvas = {getContext: () => ctx};
  return {ink: new Ink(canvas), calls, canvas};
}
test('DIP coordinates and devicePixelRatio at 1080p, 1440p, 4K / 125%, 150%', () => {
  for (const [width,height,ratio] of [[1920,1080,1],[2048,1152,1.25],[2560,1440,1.5],[2560,1440,1],[3840,2160,1]]) {
    const {ink,canvas,calls} = setup(); ink.resize(width,height,ratio);
    assert.equal(canvas.width, width*ratio); assert.equal(canvas.height,height*ratio);
    assert(calls.some(c => c[0] === 'setTransform' && c[1] === ratio));
    ink.begin({x:100,y:200},{tool:'pen',color:'#111111',width:6}); ink.finish();
    ink.resize(width,height,ratio); assert.deepEqual(ink.history[0].points[0],{x:100,y:200});
  }
});
test('eraser is transparent; undo restores pen history; clear removes everything', () => {
  const {ink,calls} = setup(); ink.resize(1000,700,1.5);
  for (const color of ['#111111','#d52b38','#2164df']) { ink.begin({x:10,y:10},{tool:'pen',color,width:3}); ink.move({x:100,y:10}); ink.finish(); }
  ink.begin({x:20,y:10},{tool:'eraser',color:'#111111',width:10}); ink.finish();
  assert.equal(ink.history.length,4); assert(calls.some(c=>c[0]==='globalCompositeOperation'&&c[1]==='destination-out'));
  ink.undo(); assert.equal(ink.history.length,3); assert(ink.history.every(s=>s.tool==='pen'));
  ink.clear(); assert.equal(ink.history.length,0); assert.equal(ink.current,null);
});
test('finishing a stroke before mode change does not join subsequent input', () => {
  const {ink} = setup(); ink.resize(1000,700,1);
  ink.begin({x:1,y:1},{tool:'pen',color:'#111111',width:6}); ink.finish(); ink.move({x:500,y:500});
  ink.begin({x:800,y:800},{tool:'pen',color:'#111111',width:10}); ink.finish();
  assert.equal(ink.history.length,2); assert.equal(ink.history[0].points.length,1); assert.equal(ink.history[1].width,10);
});
test('monitor histories, eraser and undo remain separate across DPI changes',()=>{
  const {ink,canvas}=setup();const pen={tool:'pen',color:'#111111',width:6};
  ink.selectSurface(1);ink.resize(1920,1080,1);ink.begin({x:100,y:200},pen);
  ink.selectSurface(2);ink.resize(2048,1152,1.25);assert.equal(ink.history.length,0);
  ink.begin({x:300,y:400},pen);ink.finish();
  ink.begin({x:300,y:400},{...pen,tool:'eraser'});ink.finish();ink.undo();assert.equal(ink.history.length,1);
  ink.selectSurface(1);ink.resize(1920,1080,1);assert.equal(ink.history.length,1);assert.equal(ink.history[0].points[0].x,100);
  ink.clear();ink.selectSurface(2);ink.resize(2560,1440,1.5);assert.equal(canvas.width,3840);assert.equal(ink.history[0].points[0].x,300);
  ink.selectSurface(1);assert.equal(ink.history.length,0);
});
