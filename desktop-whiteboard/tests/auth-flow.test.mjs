import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLoginFlow} from '../classroom/auth-flow.js';

function fixture(overrides = {}) {
  const state = {starts: 0, ends: [], listener: null};
  state.login = createLoginFlow({
    begin: async () => 1,
    start: () => { state.starts++; return new Promise(() => {}); },
    end: id => { state.ends.push(id); },
    subscribe: listener => { state.listener = listener; return () => { state.listener = null; }; },
    timeoutMs: 20, ...overrides
  });
  return state;
}
test('pending login times out, closes popup, unlocks retry and deduplicates clicks', async () => {
  const f = fixture();
  const first = f.login(); assert.equal(f.login(), first);
  await assert.rejects(first, {code: 'auth/timeout'});
  assert.equal(f.starts, 1); assert.deepEqual(f.ends, [1]); assert.equal(f.listener, null);
  await assert.rejects(f.login(), {code: 'auth/timeout'}); assert.equal(f.starts, 2);
});
test('blocked navigation and network errors settle login immediately', async () => {
  for (const code of ['auth/navigation-blocked', 'auth/network-request-failed', 'auth/popup-blocked']) {
    const f = fixture(); const result = f.login(); await Promise.resolve();
    f.listener({attempt: 1, code}); await assert.rejects(result, {code});
    assert.deepEqual(f.ends, [1]);
  }
});
test('Firebase success and popup cancellation both clean up', async () => {
  const result = {user: {uid: 'test-only'}};
  const success = fixture({start: async () => result}); assert.equal(await success.login(), result);
  const cancel = fixture({start: async () => { throw Object.assign(Error('cancelled'), {code: 'auth/popup-closed-by-user'}); }});
  await assert.rejects(cancel.login(), {code: 'auth/popup-closed-by-user'});
  assert.deepEqual(success.ends, [1]); assert.deepEqual(cancel.ends, [1]);
});
test('late begin after timeout never starts an orphaned popup', async () => {
  let begin;
  const f = fixture({begin: () => new Promise(resolve => { begin = resolve; })});
  await assert.rejects(f.login(), {code: 'auth/timeout'});
  begin(1); await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.starts, 0); assert.deepEqual(f.ends, [1]);
});
test('cleanup IPC failure does not prevent retry', async () => {
  const f = fixture({end: () => new Promise(() => {})});
  await assert.rejects(f.login(), {code: 'auth/timeout'});
  await assert.rejects(f.login(), {code: 'auth/timeout'});
});
