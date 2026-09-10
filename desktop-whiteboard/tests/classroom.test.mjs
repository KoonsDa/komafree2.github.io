import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const fixture = {watchAuth:()=>()=>{}, calls:0, ownedClasses:async()=>[], verifyOwner:async()=>{fixture.calls++;}};
globalThis.__whiteboardFixture = fixture;
globalThis.window = {whiteboard:{savedClass:async()=>'',saveClass:async()=>{}}};
const bundle = await build({entryPoints:[new URL('../classroom/classroom-data.js',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'isolated-firebase',setup(api){
  api.onResolve({filter:/^\.\/firebase\.js$/},()=>({path:'fixture',namespace:'fixture'}));
  api.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:`const f=globalThis.__whiteboardFixture;
    export const watchAuth=(...a)=>f.watchAuth(...a), ownedClasses=(...a)=>f.ownedClasses(...a), verifyOwner=(...a)=>f.verifyOwner(...a), readConnection=(...a)=>f.readConnection(...a), watchOwner=(...a)=>f.watchOwner(...a), watchClass=(...a)=>f.watchClass(...a), getShop=(...a)=>f.getShop(...a), changeGroup=(...a)=>f.changeGroup(...a), resolveShop=(...a)=>f.resolveShop(...a);`,loader:'js'}));
}}]});
const {Classroom,seoulDate} = await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const connected = () => {
  const board=new Classroom(()=>{});board.state.user={uid:'teacher'};board.state.classId='owned';board.state.classes=[{id:'owned'}];board.state.ready=true;
  board.state.groups=[{id:'g',active:true}];board.state.scores=[{id:'g',score:1}];return board;
};
test('unowned class selection is rejected before any data read',async()=>{
  const board=connected();fixture.calls=0;await board.select('someone-else');assert.equal(fixture.calls,0);assert.equal(board.state.ready,false);assert.match(board.state.error,/자기 학급/);board.dispose();
});
test('rapid same-group taps are locked until the original write finishes',async()=>{
  const board=connected();let resolve,calls=0;fixture.changeGroup=()=>{calls++;return new Promise(r=>{resolve=r;});};
  const first=board.group('g',1);await board.group('g',1);assert.equal(calls,1);assert(board.pending.has('group:g'));
  await board.select('');assert.equal(board.state.classId,'owned');resolve({scoreAfter:2});await first;assert.equal(board.state.scores[0].score,2);assert.equal(board.pending.size,0);board.dispose();
});
test('old callable response cannot replace a newer point refresh',async()=>{
  const board=connected();const finishes=[];fixture.getShop=()=>new Promise(r=>finishes.push(r));
  const old=board.refreshShop(),fresh=board.refreshShop();
  finishes[1]({requests:[{id:'x',date:seoulDate(),status:'completed'}]});await fresh;
  finishes[0]({requests:[{id:'x',date:seoulDate(),status:'pending'}]});await old;
  assert.equal(board.state.requests[0].status,'completed');board.dispose();
});
test('point approve/reject reuses callable once; already processed rows cannot resubmit',async()=>{
  const board=connected();const row={id:'x',date:seoulDate(),status:'pending'};board.state.requests=[row];let resolve,calls=0;
  fixture.resolveShop=()=>{calls++;return new Promise(r=>resolve=r);};fixture.getShop=async()=>({requests:[{...row,status:'completed'}]});
  const first=board.resolve('x','approve');await board.resolve('x','reject');assert.equal(calls,1);
  resolve({status:'completed'});await first;await board.resolve('x','approve');assert.equal(calls,1);board.dispose();
});
test('responses after logout do not restore classroom data',async()=>{
  const board=connected();let resolve;fixture.getShop=()=>new Promise(r=>resolve=r);const request=board.refreshShop();
  await board.authChanged(null);resolve({requests:[{id:'x',date:seoulDate(),status:'pending'}]});await request;
  assert.equal(board.state.requests.length,0);assert.equal(board.state.classId,'');assert.equal(board.state.ready,false);board.dispose();
});
