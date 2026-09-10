import {authTrace} from './auth-flow.js';

const flags = new Set(['firebaseCurrentUserExists', 'firebaseIdTokenAvailable', 'authFirestoreSameApp',
  'authFunctionsSameApp', 'classDocumentReadable', 'classExists', 'classOwnerExists', 'classOwnerMatchesCurrentUser']);
export function connectionFlag(key, value) {
  if (flags.has(key)) console.info(`[CHECK] ${key}=${Boolean(value)}`);
}
export function connectionError(kind, stage, code = 'unknown') {
  return Object.assign(new Error('교실 연결을 확인하지 못했습니다.'), {kind, stage, code});
}
export async function checkedRead(stage, action, kind = 'read', timeoutMs = 15000) {
  let timer;
  authTrace(`${stage}_START`);
  try {
    const result = await Promise.race([Promise.resolve().then(action), new Promise((_, reject) => {
      timer = setTimeout(() => reject(connectionError(kind, stage, 'deadline-exceeded')), timeoutMs);
    })]);
    authTrace(`${stage}_SUCCESS`);
    return result;
  } catch (error) {
    authTrace(`${stage}_FAILED`, error);
    throw connectionError(error.kind || kind, stage, error.code || 'unknown');
  } finally { clearTimeout(timer); }
}
export async function checkSession(auth, db, functions) {
  const user = auth.currentUser;
  connectionFlag('firebaseCurrentUserExists', !!user);
  connectionFlag('authFirestoreSameApp', auth.app === db.app);
  connectionFlag('authFunctionsSameApp', auth.app === functions.app);
  if (!user || auth.app !== db.app || auth.app !== functions.app) {
    connectionFlag('firebaseIdTokenAvailable', false);
    throw connectionError('session', 'FIREBASE_SESSION');
  }
  try {
    // Inspect only presence. The SDK owns the token; it is never returned or logged.
    const available = await checkedRead('FIREBASE_TOKEN', async () => Boolean(await user.getIdToken()), 'session');
    connectionFlag('firebaseIdTokenAvailable', available);
    if (!available || auth.currentUser !== user) throw connectionError('session', 'FIREBASE_SESSION');
  } catch (error) { connectionFlag('firebaseIdTokenAvailable', false); throw error; }
  return user;
}
