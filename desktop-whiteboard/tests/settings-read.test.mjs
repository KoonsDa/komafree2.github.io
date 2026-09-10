import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';

let nextSnapshot, lastRef, reads = [], pointDenied = false;
const failure = Object.assign(Error('denied'), {code: 'permission-denied'});
globalThis.__settingsRead = {
  read(ref) { reads.push(ref.path); return nextSnapshot; },
  points() { reads.push('callable:getPointShopData'); if (pointDenied) throw failure; return {data:{requests:[]}}; },
  listen(ref, callback, error) {
    lastRef = ref;
    // Match the existing rule's document-id restriction: listing settings is denied.
    if (ref.type !== 'doc' || ref.path !== 'classes/owned/roleSettings/current') error(failure);
    else callback(nextSnapshot);
    return () => {};
  }
};
const sources = {
  'firebase/app': 'export const initializeApp=()=>({});',
  'firebase/auth': `export const initializeAuth=app=>({app,currentUser:{uid:'teacher',getIdToken:async()=>'test-only'}}), inMemoryPersistence={}, browserPopupRedirectResolver={}, GoogleAuthProvider=class {}, signInWithPopup=()=>{}, signOut=()=>{}, onAuthStateChanged=()=>{};`,
  'firebase/functions': 'export const getFunctions=app=>({app}), httpsCallable=()=>()=>globalThis.__settingsRead.points();',
  'quest-shared': 'export const firebaseConfig={}, existingGroupMutation=()=>{};',
  'firebase/firestore': `export const getFirestore=app=>({app}), doc=(_db,...parts)=>({type:'doc',path:parts.join('/')}), collection=(_db,...parts)=>({type:'collection',path:parts.join('/')}), query=x=>x, where=()=>{}, getDocs=()=>{}, getDocsFromServer=ref=>globalThis.__settingsRead.read(ref), getDocFromServer=ref=>globalThis.__settingsRead.read(ref), onSnapshot=(...args)=>globalThis.__settingsRead.listen(...args), runTransaction=()=>{}, serverTimestamp=()=>{};`
};
const bundle = await build({entryPoints:[fileURLToPath(new URL('../classroom/firebase.js',import.meta.url))], bundle:true, write:false, format:'esm', platform:'node', plugins:[{name:'firebase-read-fixture',setup(api) {
  api.onResolve({filter:/^(firebase\/|quest-shared$)/}, args=>({path:args.path,namespace:'fixture'}));
  api.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:sources[args.path],loader:'js'}));
}}]});
const {watchClass, verifyOwner, readConnection} = await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
test('role settings reads only the permitted current document and preserves renderer array shape', () => {
  nextSnapshot = {id:'current',exists:()=>true,data:()=>({currentRoles:[{id:'role'}]})};
  let rows;
  const stop = watchClass('owned','roleSettings', value=>{rows=value;},error=>{throw error;});
  assert.deepEqual(lastRef,{type:'doc',path:'classes/owned/roleSettings/current'});
  assert.deepEqual(rows,[{id:'current',currentRoles:[{id:'role'}]}]); assert.equal(typeof stop,'function');
});
test('missing current settings document is an empty result, not a denied collection query', () => {
  nextSnapshot = {id:'current',exists:()=>false}; let rows;
  watchClass('owned','roleSettings',value=>{rows=value;},error=>{throw error;});
  assert.deepEqual(rows,[]);
});
test('class ownership rejects mismatched owners before subscriptions', async () => {
  nextSnapshot = {exists:()=>true,data:()=>({ownerUid:'other-teacher'})};
  await assert.rejects(verifyOwner('owned'),{kind:'ownership',stage:'CLASS_DOCUMENT'});
});
test('same-app connection reads run in order after owner verification', async () => {
  reads=[]; nextSnapshot = {exists:()=>true,data:()=>({ownerUid:'teacher'})};
  await verifyOwner('owned'); await readConnection('owned','2026-09-10');
  assert.deepEqual(reads,['classes/owned','classes/owned/students','classes/owned/dailyRoleAssignments',
    'callable:getPointShopData','classes/owned/groups','classes/owned/groupScoreStates','classes/owned/roleSettings/current']);
});
test('point callable denial is reported without blocking other readable panels', async () => {
  reads=[]; pointDenied=true;
  try {
    const {pointError}=await readConnection('owned','2026-09-10');
    assert.equal(pointError.stage,'CLASS_POINTS_CALLABLE'); assert.equal(pointError.code,'permission-denied');
    assert(reads.includes('classes/owned/groups'));
  } finally {pointDenied=false;}
});
