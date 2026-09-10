import {initializeApp} from 'firebase/app';
import {initializeAuth, inMemoryPersistence, browserPopupRedirectResolver, GoogleAuthProvider,
  signInWithPopup, signOut, onAuthStateChanged} from 'firebase/auth';
import {getFirestore, doc, collection, query, where, getDocs, getDocsFromServer, getDocFromServer,
  onSnapshot, runTransaction, serverTimestamp} from 'firebase/firestore';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {firebaseConfig, existingGroupMutation} from 'quest-shared';
import {createLoginFlow, authTrace} from './auth-flow.js';
import {checkSession, checkedRead, connectionFlag, connectionError} from './connection-checks.js';

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver});
const db = getFirestore(app); // Default memory cache, no persistent Firestore cache.
const functions = getFunctions(app, 'asia-northeast3');
const shop = httpsCallable(functions, 'getPointShopData');
const resolve = httpsCallable(functions, 'resolvePointUseRequest');
export const login = createLoginFlow({
  start: () => signInWithPopup(auth, new GoogleAuthProvider()),
  begin: () => window.whiteboard.beginAuth(),
  end: attempt => window.whiteboard.endAuth(attempt),
  subscribe: callback => window.whiteboard.onAuthProgress(callback)
});
export const logout = () => signOut(auth);
export const watchAuth = callback => onAuthStateChanged(auth, user => {
  authTrace(user ? 'FIREBASE_USER_AVAILABLE' : 'FIREBASE_USER_EMPTY');
  callback(user);
});

export async function ownedClasses() {
  const user = await checkSession(auth, db, functions);
  const snapshot = await checkedRead('OWNED_CLASSES', () => getDocs(query(collection(db, 'classes'), where('ownerUid', '==', user.uid))));
  if (auth.currentUser !== user) throw connectionError('session', 'OWNED_CLASSES');
  return snapshot.docs.map(row => ({...row.data(), id: row.id}));
}
export async function verifyOwner(classId) {
  const user = await checkSession(auth, db, functions);
  let snapshot;
  try { snapshot = await checkedRead('CLASS_DOCUMENT', () => getDocFromServer(doc(db, 'classes', classId)), 'ownership'); }
  catch (error) { connectionFlag('classDocumentReadable', false); throw error; }
  connectionFlag('classDocumentReadable', true);
  connectionFlag('classExists', snapshot.exists());
  connectionFlag('classOwnerExists', Boolean(snapshot.data()?.ownerUid));
  const matches = auth.currentUser === user && snapshot.exists() && snapshot.data().ownerUid === user.uid;
  connectionFlag('classOwnerMatchesCurrentUser', matches);
  if (!matches) throw connectionError('ownership', 'CLASS_DOCUMENT');
  return snapshot.data();
}
// One bounded, read-only connection check, in the requested order. All calls use
// the same app and SDK auth session. No IDs, returned documents or tokens are logged.
export async function readConnection(classId, date) {
  const user = auth.currentUser;
  const run = (stage, action) => checkedRead(stage, () => {
    if (!user || auth.currentUser !== user) throw connectionError('session', stage);
    return action();
  });
  await run('CLASS_STUDENTS_READ', () => getDocsFromServer(collection(db, 'classes', classId, 'students')));
  await run('CLASS_ROLES_READ', () => getDocsFromServer(query(collection(db, 'classes', classId, 'dailyRoleAssignments'), where('date', '==', date))));
  // A points-only failure must not disable otherwise readable roles and groups.
  let pointError = null;
  try { await run('CLASS_POINTS_CALLABLE', () => shop({classId, mode: 'teacher'})); }
  catch (error) { if (error.kind === 'session') throw error; pointError = error; }
  await run('CLASS_GROUPS_READ', () => getDocsFromServer(collection(db, 'classes', classId, 'groups')));
  await run('CLASS_SCORES_READ', () => getDocsFromServer(collection(db, 'classes', classId, 'groupScoreStates')));
  await run('CLASS_SETTINGS_READ', () => getDocFromServer(doc(db, 'classes', classId, 'roleSettings', 'current')));
  if (auth.currentUser !== user) throw connectionError('session', 'CLASS_READS');
  return {pointError};
}
export function watchClass(classId, collectionName, callback, error, date) {
  if (!auth.currentUser) throw Error('교사 로그인이 필요합니다.');
  // Rules allow only roleSettings/current, not a list of all settings documents.
  if (collectionName === 'roleSettings') {
    return onSnapshot(doc(db, 'classes', classId, 'roleSettings', 'current'),
      snapshot => callback(snapshot.exists() ? [{...snapshot.data(), id: snapshot.id}] : []), error);
  }
  const ref = collection(db, 'classes', classId, collectionName);
  return onSnapshot(date ? query(ref, where('date', '==', date)) : ref,
    snapshot => callback(snapshot.docs.map(row => ({...row.data(), id: row.id}))), error);
}
export function watchOwner(classId, callback, error) {
  return onSnapshot(doc(db, 'classes', classId), snapshot => {
    if (!snapshot.exists() || snapshot.data().ownerUid !== auth.currentUser?.uid) error(Error('학급 접근 권한이 변경되었습니다.'));
    else callback(snapshot.data());
  }, error);
}
export const getShop = async classId => (await shop({classId, mode: 'teacher'})).data;
export const resolveShop = async (classId, requestId, decision) => (await resolve({classId, requestId, decision})).data;
export async function changeGroup(classId, group, amount) {
  if (![1, -1].includes(amount)) throw Error('1점씩만 변경할 수 있습니다.');
  await verifyOwner(classId);
  const current = await getDocFromServer(doc(db, 'classes', classId, 'groups', group.id));
  if (!current.exists() || current.data().active === false) throw Error('활성 모둠이 아닙니다.');
  // Class id is immutable for this invocation, even if the UI changes class.
  const mutation = existingGroupMutation({auth, db, activeClassId: classId, doc, runTransaction, serverTimestamp});
  return mutation({groupId: group.id, amount, expectedScore: group.score, transaction: {
    id: crypto.randomUUID(), groupName: String(current.data().name || group.name), type: 'manual', createdAt: new Date().toISOString()
  }});
}
