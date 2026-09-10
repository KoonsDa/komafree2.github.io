import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createDisplaySelection} from '../display-selection.cjs';
const display=(id,x,width,scaleFactor,label='')=>({id,label,bounds:{x,y:0,width,height:1080},workArea:{x,y:0,width,height:1040},scaleFactor});
function fixture() {
  const screen=new EventEmitter(); let displays=[display(1,0,1920,1),display(2,-2048,2048,1.25),display(3,1920,2560,1.5)];
  screen.getAllDisplays=()=>displays;screen.getPrimaryDisplay=()=>displays[0];
  let bounds, state;
  const selection=createDisplaySelection(screen,{setBounds:value=>{bounds={...value};}},value=>{state=value;});
  return {screen,selection,get bounds(){return bounds;},get state(){return state;},set displays(value){displays=value;}};
}
test('all monitors including empty labels, negative origins and mixed DPI are represented',()=>{
  const f=fixture();assert.equal(f.state.displays.length,3);
  for(const id of [2,3,1]) {
    f.selection.select(id);assert.equal(f.state.displayId,id);
    assert.deepEqual(f.bounds,f.state.displays.find(d=>d.id===id).bounds);
  }
  assert.throws(()=>f.selection.select(999));assert.throws(()=>f.selection.select('1'));
  f.selection.dispose();
});
test('unplug selected monitor falls back; additions and DPI changes refresh safely',()=>{
  const f=fixture();f.selection.select(2);
  f.displays=[display(1,0,1920,1)];f.screen.emit('display-removed');assert.equal(f.state.displayId,1);
  f.displays=[display(1,0,1920,1),display(2,-2560,2560,1.5)];f.screen.emit('display-added');
  assert.equal(f.state.displays.length,2);f.selection.select(2);
  const revision=f.state.displayRevision;
  f.displays=[display(1,0,1920,1),display(2,-2048,2048,1.25)];f.screen.emit('display-metrics-changed');
  assert.equal(f.bounds.width,2048);assert(f.state.displayRevision>revision);
  f.displays=[];assert.doesNotThrow(()=>f.screen.emit('display-removed'));
  f.selection.dispose();assert.equal(f.screen.eventNames().length,0);
});
