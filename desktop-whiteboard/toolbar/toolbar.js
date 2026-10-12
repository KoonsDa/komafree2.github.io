import {Classroom, message} from '../classroom/classroom-data.js';
import {login, logout} from '../classroom/firebase.js';
const $ = selector => document.querySelector(selector);
let board, activeTab = 'roles', loginBusy = false, authError = '', classroom;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const iconPaths = {
  draw: '<path d="M4 3h12v6 M4 3v18h9 M11 18l3-1 7-7-2-2-7 7Z"/>',
  pen: '<path d="m4 20 4-1L20 7l-3-3L5 16Z M14 7l3 3"/>',
  cursor: '<path d="m5 3 14 10-7 1-4 7Z"/>',
  eraser: '<path d="m3 14 9-10 9 8-8 9H9Z M7 10l9 8 M13 21h8"/>',
  line: '<path d="M4 20 20 4"/>', triangle: '<path d="M12 3 22 21H2Z"/>',
  rectangle: '<rect x="2" y="5" width="20" height="14" rx="1"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="1"/>',
  circle: '<circle cx="12" cy="12" r="9"/>', ellipse: '<ellipse cx="12" cy="12" rx="10" ry="6"/>',
  undo: '<path d="M9 4 3 10l6 6 M3 10h11a6 6 0 0 1 0 12"/>',
  clear: '<path d="M3 6h18 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7"/>'
};
const compactItems = [
  ['mode','draw','필기 모드','draw'],['mode','interact','컴퓨터 화면 조작','cursor'],
  ['tool','pen','자유 필기 펜','pen'],['tool','eraser','지우개','eraser'],['undo',undefined,'실행 취소','undo'],
  ...[['line','직선'],['triangle','삼각형'],['rectangle','직사각형'],['square','정사각형'],['circle','원'],['ellipse','타원']].map(([v,label])=>['tool',v,label,v]),
  ...[['#111111','검정'],['#d52b38','빨강'],['#2164df','파랑'],['#ffffff','흰색']].map(([v,label])=>['color',v,label+' 펜 색',null]),
  ...[3,6,10].map(v=>['width',String(v),'펜 굵기 '+v,null]),['clear',undefined,'현재 판서 전체 지우기','clear']
];
const toolGroups = new Map();
for (const [id,label] of [['drawing','필기 · 화면'],['shapes','도형'],['colors','색'],['widths','굵기'],['editing','편집']]) {
  const section=document.createElement('section');section.className='icon-group';section.dataset.group=id;
  const heading=document.createElement('h2');heading.textContent=label;section.append(heading);
  const buttons=document.createElement('div');buttons.className='group-buttons';section.append(buttons);
  $('#compact-buttons').append(section);toolGroups.set(id,buttons);
}
for (const [key,value,label,icon] of compactItems) {
  const button=document.createElement('button'); button.dataset.command=key;
  if(value!==undefined) button.dataset.value=value;
  button.title=label; button.setAttribute('aria-label',label);
  if(icon) button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+iconPaths[icon]+'</svg>';
  else if(key==='color') {
    const swatch=document.createElement('span'); swatch.className='color-swatch'; swatch.style.backgroundColor=value;button.append(swatch);
  } else button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16" stroke-width="'+value+'"/></svg>';
  const group=key==='mode'||(key==='tool'&&['pen','eraser'].includes(value)) ? 'drawing' : key==='tool' ? 'shapes' : key==='color' ? 'colors' : key==='width' ? 'widths' : 'editing';
  toolGroups.get(group).append(button);
}
$('#compact-background').innerHTML=$('#backgrounds').innerHTML;
$('#compact-spacing').innerHTML=$('#spacing').innerHTML;
function receive(state) {
  document.body.dataset.layout=state.toolbarLayout || 'side';
  $('#toolbar-layout').value=state.toolbarLayout || 'side';
  board = state; document.body.classList.toggle('collapsed', state.collapsed);
  const monitors = $('#monitors');
  const displays = state.displays || [];
  const options = displays.map((display, index) => `<option value="${display.id}">🖥 모니터 ${index + 1}${display.label ? ' · ' + escape(display.label) : ''}</option>`).join('');
  if (monitors.innerHTML !== options) monitors.innerHTML = options;
  monitors.value = String(state.displayId);
  $('#compact-monitor').innerHTML=options; $('#compact-monitor').value=String(state.displayId);
  $('#compact-monitor-label').hidden=displays.length<2;
  $('#monitor-picker').hidden = displays.length < 2;
  $('#backgrounds').value = state.background || 'desktop';
  $('#compact-background').value=state.background || 'desktop';
  $('#compact-spacing').value=String(state.spacing || 48);
  $('#compact-spacing').disabled=['desktop','white','black'].includes(state.background || 'desktop');
  $('#compact-grid').checked=Boolean(state.gridLabels);
  $('#compact-grid').disabled=!['grid','dots'].includes(state.background);
  $('#spacing').value = String(state.spacing || 48);
  $('#spacing-label').hidden = ['desktop', 'white', 'black'].includes(state.background || 'desktop');
  $('#grid-labels-label').hidden = !['grid', 'dots'].includes(state.background);
  $('#grid-labels').checked = Boolean(state.gridLabels);
  $('#collapse').textContent = state.collapsed ? '↗' : '접기';
  $('#collapse').title=state.collapsed ? '전체 패널 펼치기' : '아이콘 도구막대로 접기';
  $('#quit').textContent=state.collapsed ? '×' : '종료'; $('#quit').title='프로그램 종료';
  $('#collapse').setAttribute('aria-label', state.collapsed ? '패널 펼치기' : '패널 접기');
  $('#mode-status').textContent = state.mode === 'draw' ? '필기 중 · ESC로 컴퓨터 화면 보기' : '뒤 화면을 조작할 수 있어요';
  document.querySelectorAll('[data-command]').forEach(button => {
    const key = button.dataset.command;
    if (['mode', 'tool', 'color', 'width'].includes(key)) button.setAttribute('aria-pressed', String(state[key]) === button.dataset.value ? 'true' : 'false');
  });
}
let liveStateReceived = false;
window.whiteboard.onState(next => { liveStateReceived = true; receive(next); });
window.whiteboard.state().then(next => { if (!liveStateReceived) receive(next); });
async function command(key, value) {
  try { await window.whiteboard.command(key, value); }
  catch { $('#mode-status').textContent = '도구를 변경하지 못했습니다.'; }
}
document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => {
  const {command: key, value} = button.dataset; command(key, key === 'width' ? Number(value) : value);
}));
$('#compact-background').onchange=event=>command('background',event.target.value);
$('#compact-spacing').onchange=event=>command('spacing',Number(event.target.value));
$('#compact-grid').onchange=event=>command('gridLabels',event.target.checked);
$('#compact-monitor').onchange=event=>command('display',Number(event.target.value));
$('#toolbar-layout').onchange=event=>command('toolbarLayout',event.target.value);
$('#collapse').onclick = () => command('collapse');
$('#quit').onclick = () => command('quit');
$('#backgrounds').onchange = event => command('background', event.target.value);
$('#spacing').onchange = event => command('spacing', Number(event.target.value));
$('#grid-labels').onchange = event => command('gridLabels', event.target.checked);
$('#monitors').onchange = event => command('display', Number(event.target.value));
window.addEventListener('keydown', event => { if (event.key === 'Escape') command('escape'); });

function render(state, pending) {
  if (state.user) authError = '';
  $('#login').hidden = Boolean(state.user); $('#logout').hidden = !state.user;
  $('#login').disabled = loginBusy; $('#logout').disabled = pending.size > 0;
  $('#login').textContent = loginBusy ? '로그인 확인 중…' : authError ? '다시 로그인' : '교사 로그인';
  $('#teacher').textContent = state.user ? `${state.user.name} 로그인됨` : '';
  $('#class-label').hidden = !state.user;
  const select = $('#classes');
  const options = `<option value="">학급 선택</option>` + state.classes.map(c => `<option value="${escape(c.id)}">${escape(c.className || '이름 없는 학급')}${c.id === state.preferredClass ? ' (최근)' : ''}</option>`).join('');
  if (select.innerHTML !== options) select.innerHTML = options;
  select.value = state.classId;
  select.disabled = state.connecting || pending.size > 0;
  $('#connection').textContent = authError || state.error || state.notice || (state.connecting ? '학급 연결 중…' :
    !state.user ? '학급을 연결하려면 교사 로그인이 필요합니다.' : !state.classes.length ? '이 계정이 소유한 학급이 없습니다.' :
    !state.classId ? '사용할 내 학급을 선택해 주세요.' : state.ready ? `${state.date} · 학급 현황 연결됨` : '학급 현황을 불러오는 중…');
  $('#reconnect').hidden = !state.user || !state.error;
  $('#reconnect').disabled = pending.size > 0;
  document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-selected', button.dataset.tab === activeTab ? 'true' : 'false'));
  const content = $('#class-content');
  if (!state.classId || !state.ready || state.error) { content.innerHTML = '<p class="empty">교사 로그인과 학급 연결 후 실제 현황이 표시됩니다.</p>'; return; }
  const student = id => state.students.find(s => s.id === id);
  const studentName = id => { const s = student(id); return s ? `${s.number || ''}번 ${s.name || ''}` : '학생 정보 없음'; };
  let html = '';
  if (activeTab === 'roles') {
    const roles = state.roles.filter(r => r.date === state.date && ['waiting','completed'].includes(r.status)).sort((a,b) =>
      Number(a.status === 'completed') - Number(b.status === 'completed') || (student(a.studentId)?.number || 0) - (student(b.studentId)?.number || 0));
    html = '<p class="hint">완료와 포인트 지급은 기존 웹 교사 화면에서 처리해 주세요.</p>';
    html += roles.map(row => `<article class="card"><strong>${escape(studentName(row.studentId))}</strong><span class="detail">${escape(row.roleSnapshot?.name || state.settings.find(s => s.id === 'current')?.currentRoles?.find(r => r.id === row.roleId)?.name || '역할')}</span><span class="status">${row.status === 'waiting' ? '신청 대기' : '완료'}</span></article>`).join('') || '<p class="empty">오늘 역할 신청이 없습니다.</p>';
  } else if (activeTab === 'points') {
    if (state.shopError) html = `<p class="empty">${escape(state.shopError)}</p>`;
    else {
      const statuses = {pending:'승인 대기',completed:'사용 완료',rejected:'거절',cancelled:'취소'};
      html = [...state.requests].filter(r => r.date === state.date).sort((a,b) => Number(a.status !== 'pending') - Number(b.status !== 'pending')).map(row => {
        const balance = state.balances.find(b => b.id === row.studentId)?.points;
        return `<article class="card"><strong>${escape(studentName(row.studentId))}</strong><span class="detail">${escape(row.itemName)} · ${escape(row.price)}P</span><span class="status">${escape(statuses[row.status] || row.status)}</span><div class="hint">현재 잔액 ${Number.isInteger(balance) ? balance + 'P' : '확인 중'}</div>${row.status === 'pending' ? `<div class="actions"><button data-resolve="approve" data-id="${escape(row.id)}" ${pending.has('point:'+row.id) ? 'disabled' : ''}>승인</button><button data-resolve="reject" data-id="${escape(row.id)}" ${pending.has('point:'+row.id) ? 'disabled' : ''}>거절</button></div>` : ''}</article>`;
      }).join('') || '<p class="empty">오늘 포인트 상품 신청이 없습니다.</p>';
    }
  } else {
    html = state.groups.filter(g => g.active !== false).sort((a,b) => (a.order || 0) - (b.order || 0)).map(group => {
      const score = state.scores.find(s => s.id === group.id)?.score;
      const disabled = !Number.isInteger(score) || score < 0 || pending.has('group:'+group.id);
      return `<article class="card group-card"><strong>${escape(group.name)}</strong><div class="score">${Number.isInteger(score) ? score+'점' : '점수 미연결'}</div><div class="actions"><button data-group="${escape(group.id)}" data-delta="-1" ${disabled || score === 0 ? 'disabled' : ''}>-1</button><button data-group="${escape(group.id)}" data-delta="1" ${disabled ? 'disabled' : ''}>+1</button></div></article>`;
    }).join('') || '<p class="empty">활성 모둠이 없습니다.</p>';
  }
  // Only replace when data changes; polling must not interrupt a touch in progress.
  if (content.innerHTML !== html) content.innerHTML = html;
}
classroom = new Classroom(render);
$('#login').onclick = async () => {
  if (loginBusy) return;
  loginBusy = true; authError = ''; classroom.emit();
  try { await command('mode', 'interact'); await login(); }
  catch (error) { authError = message(error); }
  finally { loginBusy = false; classroom.emit(); }
};
$('#logout').onclick = async () => { if (classroom.pending.size) return; try { await logout(); authError = ''; } catch (error) { authError = message(error); } classroom.emit(); };
$('#classes').onchange = event => classroom.select(event.target.value);
$('#reconnect').onclick = () => classroom.state.classId ? classroom.select(classroom.state.classId) : classroom.authChanged(classroom.state.user && {uid: classroom.state.user.uid, displayName: classroom.state.user.name});
document.querySelectorAll('[data-tab]').forEach(button => button.onclick = () => { activeTab = button.dataset.tab; classroom.emit(); });
$('#class-content').onclick = event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.group) classroom.group(button.dataset.group, Number(button.dataset.delta));
  if (button.dataset.resolve) classroom.resolve(button.dataset.id, button.dataset.resolve);
};
window.addEventListener('beforeunload', () => classroom.dispose());
