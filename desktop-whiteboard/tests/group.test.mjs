import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sharedSource} from '../tools/shared-source.mjs';
const shared = await import('data:text/javascript;base64,' + Buffer.from(await sharedSource()).toString('base64'));
function setup(initial, uid = 'teacher') {
  let score=initial, version=0, history=[];
  const runTransaction = async (_db, callback) => {
    for (;;) {
      const readVersion=version, readScore=score, writes=[];
      const result = await callback({get: async()=>({exists:()=>true,data:()=>({score:readScore})}),set:(ref,value)=>writes.push([ref,value])});
      if(readVersion!==version)continue;
      for(const [ref,value] of writes){if(ref.includes('groupScoreStates'))score=value.score;else history.push(value);}
      version++; return result;
    }
  };
  const mutation = shared.existingGroupMutation({auth:{currentUser:uid?{uid}:null},db:{},activeClassId:'owned',doc:(_db,...parts)=>parts.join('/'),runTransaction,serverTimestamp:()=>0});
  const apply = (amount,expectedScore,id) => mutation({groupId:'g',amount,expectedScore,transaction:{id,groupName:'1모둠',createdAt:'2026-09-09T00:00:00Z'}});
  return {apply,values:()=>({score,history})};
}
test('actual web transaction: 0 cannot become negative',async()=>{
  const db=setup(0);await assert.rejects(db.apply(-1,0,'one'),e=>e.code==='group-score/insufficient');assert.equal(db.values().score,0);assert.equal(db.values().history.length,0);
});
test('actual web transaction: sequential accepted taps each change exactly one',async()=>{
  const db=setup(0);for(let i=0;i<10;i++)await db.apply(1,i,'tap'+i);assert.equal(db.values().score,10);assert.equal(db.values().history.length,10);
  await db.apply(-1,10,'minus');assert.equal(db.values().score,9);
});
test('actual web transaction: concurrent stale score fails safely, no double update',async()=>{
  const db=setup(0);const results=await Promise.allSettled([db.apply(1,0,'a'),db.apply(1,0,'b')]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.code,'group-score/conflict');assert.equal(db.values().score,1);
});
test('actual web transaction requires teacher auth',async()=>{
  const db=setup(0,null);await assert.rejects(db.apply(1,0,'a'));assert.equal(db.values().score,0);
});
