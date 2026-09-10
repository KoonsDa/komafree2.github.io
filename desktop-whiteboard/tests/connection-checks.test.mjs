import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkSession, checkedRead} from '../classroom/connection-checks.js';

test('session diagnostics confirm same app and token without leaking values', async () => {
  const app = {}, lines = [], original = console.info;
  const user = {uid:'private-user-value',getIdToken:async ()=>'private-token-value'};
  console.info = (...parts) => lines.push(parts.join(' '));
  try {
    assert.equal(await checkSession({app,currentUser:user},{app},{app}),user);
    assert(lines.includes('[CHECK] firebaseIdTokenAvailable=true'));
    assert(lines.includes('[CHECK] authFirestoreSameApp=true'));
    assert(!lines.join('\n').includes('private-'));
  } finally { console.info = original; }
});
test('missing user, app mismatch and failed token are session failures', async () => {
  const app = {}, user = {getIdToken:async ()=>'test'};
  await assert.rejects(checkSession({app,currentUser:null},{app},{app}),{kind:'session'});
  await assert.rejects(checkSession({app,currentUser:user},{app:{}},{app}),{kind:'session'});
  await assert.rejects(checkSession({app,currentUser:user},{app},{app:{}}),{kind:'session'});
  user.getIdToken = async () => { throw Object.assign(Error('secret SDK message'),{code:'auth/network-request-failed'}); };
  await assert.rejects(checkSession({app,currentUser:user},{app},{app}),{kind:'session',code:'auth/network-request-failed',message:'교실 연결을 확인하지 못했습니다.'});
});
test('denied read retains its precise stage and safe code; hung reads time out', async () => {
  await assert.rejects(checkedRead('CLASS_SETTINGS_READ',async()=>{throw Object.assign(Error('private detail'),{code:'permission-denied'});}),
    {kind:'read',stage:'CLASS_SETTINGS_READ',code:'permission-denied',message:'교실 연결을 확인하지 못했습니다.'});
  await assert.rejects(checkedRead('CLASS_STUDENTS_READ',()=>new Promise(()=>{}),'read',5),{kind:'read',code:'deadline-exceeded'});
});
