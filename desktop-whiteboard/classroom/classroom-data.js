import * as firebase from './firebase.js';
import {authTrace} from './auth-flow.js';
export function seoulDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'}).format(now);
}
export const message = error => {
  const code = error?.code || error?.details?.code || '';
  if (error?.kind === 'session') return 'Firebase 인증 연결을 확인하지 못했습니다. 다시 로그인해 주세요.';
  if (error?.kind === 'ownership') return '학급 소유권을 확인하지 못했습니다. 내 학급을 다시 선택해 주세요.';
  if (error?.kind === 'read') return '학급 데이터를 읽지 못했습니다. 다시 연결해 주세요.';
  if (code === 'auth/timeout') return '로그인이 완료되지 않았습니다. 다시 시도해 주세요.';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return '로그인이 취소되었습니다. 다시 로그인해 주세요.';
  if (code.startsWith('auth/')) return `로그인에 실패했습니다. 다시 시도해 주세요. (${code})`;
  if (code === 'group-score/conflict') return '다른 화면에서 점수가 바뀌었습니다. 최신 점수를 확인한 후 다시 눌러 주세요.';
  if (code === 'group-score/insufficient') return '0점 아래로 차감할 수 없습니다.';
  if (code === 'permission-denied' || code === 'functions/permission-denied') return '학급 데이터를 읽을 권한을 확인하지 못했습니다. 다시 연결해 주세요.';
  if (code === 'unavailable') return '연결되지 않았습니다. 인터넷 연결을 확인해 주세요.';
  return error?.message || '요청을 처리하지 못했습니다.';
};

export class Classroom {
  constructor(render) {
    this.render = render; this.epoch = 0; this.shopSequence = 0; this.stops = []; this.pending = new Set();
    this.state = {user: null, classes: [], classId: '', students: [], roles: [], settings: [], groups: [], scores: [], requests: [], balances: [], error: '', shopError: '', connecting: false, ready: false, date: seoulDate()};
    this.stopAuth = firebase.watchAuth(user => this.authChanged(user));
  }
  emit() { this.render(this.state, this.pending); }
  stop() { this.epoch++; this.stops.forEach(stop => stop()); this.stops = []; clearTimeout(this.timer); }
  clearData() { for (const key of ['students', 'roles', 'settings', 'groups', 'scores', 'requests', 'balances']) this.state[key] = []; this.state.ready = false; }
  async authChanged(user) {
    this.state.connectionFailure = null;
    this.stop(); this.clearData(); this.state.classId = ''; this.state.classes = [];
    this.state.user = user ? {uid: user.uid, name: user.displayName || '선생님'} : null;
    this.state.error = ''; this.state.shopError = ''; this.state.connecting = Boolean(user); this.emit();
    if (!user) return;
    const epoch = this.epoch;
    let loadTimer;
    try {
      authTrace('CLASS_LOAD_START');
      const classes = await Promise.race([firebase.ownedClasses(), new Promise((_, reject) => {
        loadTimer = setTimeout(() => reject(Error('학급을 불러오지 못했습니다. 다시 연결해 주세요.')), 30000);
      })]);
      if (epoch !== this.epoch) return;
      this.state.classes = classes;
      authTrace('CLASS_LOAD_SUCCESS');
      // A saved id is a preference only; membership is verified again on selection.
      const saved = await window.whiteboard.savedClass();
      if (epoch !== this.epoch) return;
      this.state.preferredClass = classes.some(c => c.id === saved) ? saved : '';
    } catch (error) { authTrace('CLASS_LOAD_FAILED', error); if (epoch === this.epoch) { this.state.connectionFailure = {kind: error.kind || 'read', stage: error.stage || 'OWNED_CLASSES'}; this.state.error = message(error); } }
    finally { clearTimeout(loadTimer); if (epoch === this.epoch) { this.state.connecting = false; this.emit(); } }
  }
  async select(classId) {
    if (this.pending.size) return;
    this.state.connectionFailure = null;
    this.stop(); this.clearData(); this.state.classId = ''; this.state.error = ''; this.state.shopError = '';
    if (!classId) { this.emit(); return; }
    if (!this.state.user || !this.state.classes.some(c => c.id === classId)) { this.state.error = '자기 학급만 선택할 수 있습니다.'; this.emit(); return; }
    this.state.connecting = true; this.emit(); const epoch = this.epoch;
    try {
      await firebase.verifyOwner(classId);
      if (epoch !== this.epoch) return;
      this.state.classId = classId; this.state.date = seoulDate();
      const {pointError} = await firebase.readConnection(classId, this.state.date);
      if (epoch !== this.epoch) return;
      this.state.shopError = pointError ? message(pointError) : '';
      await window.whiteboard.saveClass(classId);
      if (epoch !== this.epoch) return;
      const failed = error => { if (epoch !== this.epoch) return; this.stop(); this.clearData(); this.state.connectionFailure = {kind: error.kind || 'read', stage: error.stage || 'CLASS_SUBSCRIPTION'}; this.state.error = message(error); this.state.connecting = false; this.emit(); };
      this.stops.push(firebase.watchOwner(classId, () => {}, failed));
      const loaded = new Set();
      for (const [name, key] of [['students', 'students'], ['dailyRoleAssignments', 'roles'], ['roleSettings', 'settings'], ['groups', 'groups'], ['groupScoreStates', 'scores'], ['studentPointStates', 'balances']]) {
        this.stops.push(firebase.watchClass(classId, name, rows => {
          if (epoch !== this.epoch) return;
          if (!loaded.has(key)) authTrace(`CLASS_${key.toUpperCase()}_READ_SUCCESS`);
          this.state[key] = rows; loaded.add(key); this.state.ready = loaded.size === 6; this.emit();
        }, error => { if (epoch === this.epoch) authTrace(`CLASS_${key.toUpperCase()}_READ_FAILED`, error); failed(error); }, key === 'roles' ? this.state.date : undefined));
      }
      this.poll(epoch);
    } catch (error) { if (epoch === this.epoch) { this.clearData(); this.state.connectionFailure = {kind: error.kind || 'read', stage: error.stage || 'CLASS_CONNECTION'}; this.state.error = message(error); } }
    finally { if (epoch === this.epoch) { this.state.connecting = false; this.emit(); } }
  }
  async refreshShop(epoch = this.epoch) {
    const sequence = ++this.shopSequence;
    try {
      const result = await firebase.getShop(this.state.classId);
      if (epoch !== this.epoch || sequence !== this.shopSequence) return;
      this.state.requests = (result.requests || []).filter(r => r.date === seoulDate());
      this.state.shopError = '';
    } catch (error) {
      if (epoch !== this.epoch || sequence !== this.shopSequence) return;
      this.state.requests = []; this.state.shopError = message(error);
    }
    if (epoch === this.epoch) this.emit();
  }
  async poll(epoch) {
    if (epoch !== this.epoch) return;
    if (this.state.date !== seoulDate() && !this.pending.size) { await this.select(this.state.classId); return; }
    await this.refreshShop(epoch);
    if (epoch === this.epoch) this.timer = setTimeout(() => this.poll(epoch), 4000);
  }
  async mutate(key, action) {
    if (this.pending.has(key) || !this.state.ready || this.state.error || !this.state.user) return;
    const epoch = this.epoch; this.pending.add(key); this.state.notice = ''; this.emit();
    try { await action(); }
    catch (error) { if (epoch === this.epoch) this.state.notice = message(error); }
    finally { this.pending.delete(key); if (epoch === this.epoch) this.emit(); }
  }
  async group(id, amount) {
    const group = this.state.groups.find(row => row.id === id && row.active !== false);
    const score = this.state.scores.find(row => row.id === id)?.score;
    if (!group || ![1, -1].includes(amount) || !Number.isInteger(score) || score + amount < 0) return;
    const epoch = this.epoch, classId = this.state.classId;
    await this.mutate(`group:${id}`, async () => {
      const result = await firebase.changeGroup(classId, {...group, score}, amount);
      if (epoch === this.epoch) {
        const row = this.state.scores.find(row => row.id === id);
        if (row && row.score === score) row.score = result.scoreAfter;
      }
    });
  }
  async resolve(id, decision) {
    if (!['approve', 'reject'].includes(decision) || this.state.shopError ||
        !this.state.requests.some(r => r.id === id && r.status === 'pending' && r.date === seoulDate())) return;
    const epoch = this.epoch, classId = this.state.classId;
    await this.mutate(`point:${id}`, async () => {
      try {
        const result = await firebase.resolveShop(classId, id, decision);
        if (epoch === this.epoch) { const row = this.state.requests.find(r => r.id === id); if (row) row.status = result.status; }
      } finally { if (epoch === this.epoch) await this.refreshShop(epoch); }
    });
  }
  dispose() { this.stop(); this.stopAuth(); }
}
