// 카드 등급 확률입니다. 숫자의 합이 100이 되도록 수정하면 됩니다.
const CARD_RATES = { 일반: 60, 희귀: 25, 영웅: 12, 전설: 3 };
const STORAGE_KEY = "ourClassQuestDemoV1";

const FIGURES = [
  { id: "sejong", name: "세종대왕", rarity: "전설", era: "조선", achievement: "훈민정음을 창제해 우리 글을 널리 펼쳤어요." },
  { id: "sunsin", name: "이순신", rarity: "전설", era: "조선", achievement: "나라를 지키며 뛰어난 해전 전략을 펼쳤어요." },
  { id: "youngsil", name: "장영실", rarity: "영웅", era: "조선", achievement: "생활에 도움을 주는 여러 과학 기구를 만들었어요." },
  { id: "saimdang", name: "신사임당", rarity: "희귀", era: "조선", achievement: "그림과 글씨에 뛰어난 예술가였어요." },
  { id: "yakyong", name: "정약용", rarity: "영웅", era: "조선", achievement: "백성의 생활을 돕는 학문과 기술을 연구했어요." },
  { id: "heojun", name: "허준", rarity: "희귀", era: "조선", achievement: "의학 지식을 모아 동의보감을 편찬했어요." },
  { id: "jeongho", name: "김정호", rarity: "희귀", era: "조선", achievement: "우리 국토를 자세히 담은 지도를 만들었어요." },
  { id: "hongdo", name: "김홍도", rarity: "일반", era: "조선", achievement: "사람들의 일상을 생생한 그림으로 남겼어요." },
  { id: "gwansun", name: "유관순", rarity: "영웅", era: "일제강점기", achievement: "독립을 향한 굳은 뜻으로 만세 운동에 참여했어요." },
  { id: "junggeun", name: "안중근", rarity: "영웅", era: "일제강점기", achievement: "나라의 독립과 동양 평화를 위해 힘썼어요." },
  { id: "kimku", name: "김구", rarity: "희귀", era: "일제강점기", achievement: "대한민국의 독립을 위해 오랫동안 활동했어요." },
  { id: "bonggil", name: "윤봉길", rarity: "일반", era: "일제강점기", achievement: "독립 의지를 세계에 알리는 데 힘을 보탰어요." }
];

const DEFAULT_ROLES = [
  { id: "board", name: "칠판 정리", points: 10, capacity: 1, description: "수업이 끝난 뒤 칠판을 깨끗하게 정리해요." },
  { id: "books", name: "책장 정리", points: 10, capacity: 1, description: "책을 종류별로 가지런히 정리해요." },
  { id: "window", name: "창문 확인", points: 5, capacity: 1, description: "이동할 때 창문이 안전한지 확인해요." },
  { id: "lunch", name: "급식 정리 도우미", points: 15, capacity: 2, description: "급식 뒤 주변을 함께 정돈해요." },
  { id: "recycle", name: "분리수거 확인", points: 10, capacity: 2, description: "재활용품이 알맞게 나뉘었는지 살펴요." },
  { id: "clean", name: "교실 정돈", points: 15, capacity: 2, description: "교실의 흐트러진 물건을 제자리에 놓아요." }
];

const ASSIGNMENTS = [
  { title: "수학 익힘책 30쪽", subject: "수학", description: "수업 시간에 배운 내용을 복습해요.", dueOffset: 0 },
  { title: "독서 기록장", subject: "국어", description: "읽은 책의 느낌을 기록해요.", dueOffset: 3 },
  { title: "사회 조사 활동", subject: "사회", description: "우리 지역의 특징을 조사해요.", dueOffset: 7 }
];
const ASSIGNMENT_STATUSES = ["missing", "review", "submitted"];
const ASSIGNMENT_STATUS_LABELS = { missing: "미제출", review: "확인 대기", submitted: "제출 완료" };
const SUBJECTS = ["국어", "수학", "사회", "과학", "영어", "기타"];
const STUDENT_NAMES = ["학생01", "학생02", "학생03", "학생04", "학생05"];
const OBSERVATION_CATEGORIES = ["수업", "생활", "관계", "성장", "기타"];
const DEFAULT_OBSERVATION_QUICK_ITEMS = {
  수업: ["발표", "수업 참여", "집중", "질문", "협력", "과제 수행"],
  생활: ["정리정돈", "규칙 준수", "준비물", "책임감", "자기관리"],
  관계: ["배려", "협력", "갈등", "도움", "의사소통"],
  성장: ["자신감", "도전", "꾸준함", "개선", "자기주도"],
  기타: ["기타"]
};

function createDemoData() {
  const students = STUDENT_NAMES.map((name, index) => ({
    id: `s${index + 1}`, name, points: [75, 45, 95, 30, 60][index], cards: index === 0 ? { hongdo: 2, saimdang: 1 } : {},
    pointHistory: [{ id: crypto.randomUUID(), amount: [20, 10, 25, 5, 15][index], reason: "이번 주 역할 참여", date: new Date().toLocaleDateString("ko-KR") }]
  }));
  return {
    students,
    roleApplications: [
      { id: crypto.randomUUID(), studentId: "s2", roleId: "board", status: "waiting" },
      { id: crypto.randomUUID(), studentId: "s3", roleId: "lunch", status: "completed" }
    ],
    currentRoles: structuredClone(DEFAULT_ROLES),
    roleTemplates: [{ id: crypto.randomUUID(), name: "기본 1인1역", roles: structuredClone(DEFAULT_ROLES) }],
    assignments: ASSIGNMENTS.map((assignment, assignmentIndex) => ({
      id: `a${assignmentIndex + 1}`, title: assignment.title, subject: assignment.subject, description: assignment.description,
      createdAt: dateWithOffset(-assignmentIndex), dueDate: dateWithOffset(assignment.dueOffset), important: assignmentIndex === 0,
      points: 0, pointAwards: {},
      assignmentState: "active", completed: false, completedAt: null,
      statuses: STUDENT_NAMES.map((_, studentIndex) => studentIndex < 3 - assignmentIndex ? "submitted" : "missing")
    })),
    observations: [],
    observationQuickItems: structuredClone(DEFAULT_OBSERVATION_QUICK_ITEMS)
  };
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return createDemoData();
    if (!Array.isArray(saved.currentRoles)) saved.currentRoles = structuredClone(DEFAULT_ROLES);
    saved.currentRoles = saved.currentRoles.map((role) => ({ ...role, description: role.description || "" }));
    if (!Array.isArray(saved.roleTemplates)) {
      saved.roleTemplates = [{ id: crypto.randomUUID(), name: "기본 1인1역", roles: structuredClone(DEFAULT_ROLES) }];
    }
    saved.roleTemplates = saved.roleTemplates.map((template) => ({ ...template, roles: template.roles.map((role) => ({ ...role, description: role.description || "" })) }));
    saved.assignments = (Array.isArray(saved.assignments) ? saved.assignments : []).map((assignment, index) => {
      const assignmentState = ["active", "completed"].includes(assignment.assignmentState) ? assignment.assignmentState : assignment.completed ? "completed" : "active";
      const migrated = {
        ...assignment,
        subject: assignment.subject || ["수학", "국어", "사회"][index] || "기타",
        description: assignment.description || "",
        createdAt: assignment.createdAt || "",
        dueDate: assignment.dueDate || "",
        important: Boolean(assignment.important),
        points: Number.isInteger(Number(assignment.points)) && Number(assignment.points) >= 0 ? Number(assignment.points) : 0,
        pointAwards: assignment.pointAwards && typeof assignment.pointAwards === "object" && !Array.isArray(assignment.pointAwards) ? assignment.pointAwards : {},
        assignmentState,
        completed: assignmentState === "completed",
        completedAt: assignmentState === "completed" ? (assignment.completedAt || assignment.dueDate || null) : null,
        statuses: Array.isArray(assignment.statuses)
          ? dataLengthArray(assignment.statuses, "missing")
          : dataLengthArray((assignment.submitted || []).map((submitted) => submitted ? "submitted" : "missing"), "missing")
      };
      refreshAssignmentCompletion(migrated);
      return migrated;
    });
    saved.observations = (Array.isArray(saved.observations) ? saved.observations : []).map((observation) => ({
      id: observation.id || crypto.randomUUID(),
      studentId: observation.studentId || "",
      date: observation.date || todayString(),
      category: OBSERVATION_CATEGORIES.includes(observation.category) ? observation.category : "기타",
      content: observation.content || "",
      quickItems: Array.isArray(observation.quickItems) ? observation.quickItems.filter((item) => typeof item === "string") : [],
      createdAt: observation.createdAt || `${observation.date || todayString()}T00:00:00.000Z`,
      updatedAt: observation.updatedAt || observation.createdAt || `${observation.date || todayString()}T00:00:00.000Z`
    }));
    const savedQuickItems = saved.observationQuickItems && typeof saved.observationQuickItems === "object" ? saved.observationQuickItems : {};
    saved.observationQuickItems = Object.fromEntries(OBSERVATION_CATEGORIES.map((category) => [category,
      Array.isArray(savedQuickItems[category]) ? [...new Set(savedQuickItems[category].filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim().slice(0, 30)))] : [...DEFAULT_OBSERVATION_QUICK_ITEMS[category]]
    ]));
    return saved;
  }
  catch { return createDemoData(); }
}

let data = loadData();
let session = { mode: "welcome", studentId: null, view: "home" };
let editingTemplateId = null;
let assignmentFilter = "all";
let assignmentStudentView = "";
let observationFilters = { studentId: "", category: "", keyword: "" };
const assignmentSelections = {};
let toastTimer;
const app = document.querySelector("#app");

function todayString() { return new Date().toLocaleDateString("sv-SE"); }
function dateWithOffset(offset) { const date = new Date(); date.setDate(date.getDate() + offset); return date.toLocaleDateString("sv-SE"); }
function dataLengthArray(values, fallback) { return STUDENT_NAMES.map((_, index) => ASSIGNMENT_STATUSES.includes(values[index]) ? values[index] : fallback); }

function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function studentById(id) { return data.students.find((student) => student.id === id); }
function roleById(id) { return data.currentRoles.find((role) => role.id === id); }
function currentStudent() { return studentById(session.studentId); }
function cardCount(student) { return Object.values(student.cards).reduce((sum, count) => sum + count, 0); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function toast(message) { const element = document.querySelector("#toast"); element.textContent = message; element.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove("show"), 2200); }
saveData();

function renderWelcome(showStudents = false) {
  app.innerHTML = `<main class="welcome"><section class="welcome-card"><div class="brand-mark">⚔</div><h1>우리반 퀘스트</h1><p>함께 돕고, 성장하고, 역사의 주인공을 만나 보세요!</p><div class="role-choices"><button class="role-choice student" data-action="show-students">학생으로 체험하기</button><button class="role-choice teacher" data-action="enter-teacher">선생님으로 체험하기</button></div>${showStudents ? `<div class="student-picker" aria-label="체험할 학생 선택">${data.students.map((student) => `<button class="student-pick" data-action="enter-student" data-id="${student.id}">${student.name}</button>`).join("")}</div>` : ""}</section></main>`;
}

const STUDENT_NAV = [["home", "⌂", "홈"], ["roles", "✓", "오늘의 역할"], ["draw", "★", "카드 뽑기"], ["collection", "▦", "위인 도감"], ["ranking", "♛", "랭킹"]];
const TEACHER_NAV = [["dashboard", "⌂", "대시보드"], ["students", "♙", "학생 관리"], ["roles", "✓", "1인1역"], ["assignments", "▣", "과제"], ["observations", "✎", "관찰 기록"], ["points", "◆", "포인트"], ["cards", "★", "카드 관리"]];

function navHtml(items) { return items.map(([id, icon, label]) => `<button class="nav-button ${session.view === id ? "active" : ""}" data-action="navigate" data-view="${id}"><span>${icon}</span>${label}</button>`).join(""); }
function shell(content, teacher = false) {
  const student = currentStudent();
  const top = teacher ? `<span>선생님 데모</span>` : `<span>${student.name}</span>`;
  const summary = teacher ? "" : `<section class="summary-strip"><div class="summary-item">현재 포인트<strong>${student.points}P</strong></div><div class="summary-item">오늘 역할<strong>${data.roleApplications.filter((item) => item.studentId === student.id && item.status !== "cancelled").length}개</strong></div><div class="summary-item">보유 카드<strong>${cardCount(student)}장</strong></div></section>`;
  return `<div class="app-shell ${teacher ? "teacher-shell" : "student-shell"}"><header class="topbar"><div class="brand"><span class="brand-icon">⚔</span>우리반 퀘스트</div><div class="user-area">${top}<button class="ghost-button" data-action="logout">처음으로</button></div></header>${summary}<div class="layout"><nav class="side-nav">${navHtml(teacher ? TEACHER_NAV : STUDENT_NAV)}</nav><main class="content">${content}</main></div></div>`;
}

function assignmentStatusClass(status) { return { submitted: "success", review: "waiting", missing: "danger" }[status] || "danger"; }
function refreshAssignmentCompletion(assignment) {
  if (!["active", "completed"].includes(assignment.assignmentState)) assignment.assignmentState = assignment.completed ? "completed" : "active";
  assignment.completed = assignment.assignmentState === "completed";
  if (!assignment.completed) assignment.completedAt = null;
}
function isAssignmentCompleted(assignment) { return Boolean(assignment.completed); }
function sortCompletedAssignments(first, second) {
  const completedDifference = (second.completedAt || "").localeCompare(first.completedAt || "");
  return completedDifference || (second.createdAt || "").localeCompare(first.createdAt || "");
}
function formatCompletedAt(completedAt) { return completedAt ? new Date(completedAt).toLocaleDateString("ko-KR") : "기록 없음"; }
function formatDueDate(dueDate) {
  if (!dueDate) return "기한 없음";
  if (dueDate === todayString()) return "오늘까지";
  const [, month, day] = dueDate.split("-");
  return `${Number(month)}월 ${Number(day)}일까지`;
}
function studentAssignmentCard(assignment, studentIndex, closed = false) {
  const status = assignment.statuses[studentIndex] || "missing";
  const statusControl = closed
    ? `<div class="closed-assignment-status"><span class="pill">과제 종료</span><strong>내 상태: ${ASSIGNMENT_STATUS_LABELS[status]}</strong></div>`
    : status === "missing"
    ? `<button class="button assignment-request-button" data-action="open-assignment-request" data-id="${assignment.id}">🙋 제출했어요!</button>`
    : status === "review"
      ? `<button class="button secondary assignment-request-button" disabled>⏳ 선생님 확인 대기</button>`
      : `<span class="pill success assignment-finished-label">✓ 제출 완료</span>`;
  return `<article class="card student-assignment-card ${assignment.important ? "important" : ""}"><div class="assignment-card-top"><div class="assignment-labels"><span class="subject-badge">${escapeHtml(assignment.subject)}</span>${assignment.important ? `<span class="important-mark">★ 중요</span>` : ""}${assignment.points > 0 ? `<span class="pill assignment-points-badge">완료 시 +${assignment.points}P</span>` : ""}</div></div><h3>${escapeHtml(assignment.title)}</h3>${assignment.description ? `<p class="muted">${escapeHtml(assignment.description)}</p>` : ""}<div class="assignment-meta"><span>📅 ${formatDueDate(assignment.dueDate)}</span><span class="pill ${assignmentStatusClass(status)}">${ASSIGNMENT_STATUS_LABELS[status]}</span></div>${statusControl}</article>`;
}

function studentHome() {
  const student = currentStudent(); const studentIndex = data.students.findIndex((item) => item.id === student.id);
  const recent = student.pointHistory.slice(-4).reverse();
  const activeAssignments = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment));
  const completedAssignments = data.assignments.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
  return `<section class="hero"><h2>오늘도 우리 반을 위해<br>퀘스트를 완료해 보세요! ✨</h2><p>작은 도움이 모여 멋진 교실을 만들어요.</p></section><h2 class="section-title">오늘의 과제</h2>${activeAssignments.length ? `<div class="grid">${activeAssignments.map((assignment) => studentAssignmentCard(assignment, studentIndex)).join("")}</div>` : `<div class="empty">진행 중인 과제가 없어요. 멋지게 완료했어요!</div>`}${completedAssignments.length ? `<details class="completed-assignments"><summary>지난 과제 ${completedAssignments.length}개 보기</summary><div class="grid">${completedAssignments.map((assignment) => studentAssignmentCard(assignment, studentIndex, true)).join("")}</div></details>` : ""}<h2 class="section-title">최근 포인트 내역</h2>${recent.length ? `<div class="list">${recent.map((item) => pointHistoryRow(item)).join("")}</div>` : `<div class="empty">아직 포인트 기록이 없어요.</div>`}`;
}

function studentRoles() {
  const student = currentStudent();
  const ownActive = data.roleApplications.filter((item) => item.studentId === student.id && item.status !== "cancelled");
  return `<h1 class="page-heading">오늘의 1인1역</h1><p class="page-description">하루에 최대 2개까지 신청할 수 있어요. 함께 교실을 빛내 주세요!</p><div class="grid">${data.currentRoles.map((role) => {
    const applications = data.roleApplications.filter((item) => item.roleId === role.id && item.status !== "cancelled");
    const mine = applications.find((item) => item.studentId === student.id);
    const full = applications.length >= role.capacity;
    const actionButton = mine?.status === "completed"
      ? `<button class="button secondary" type="button" disabled>완료</button>`
      : mine?.status === "waiting"
        ? `<button class="button danger" type="button" data-action="open-student-cancel" data-id="${mine.id}">신청 취소</button>`
        : `<button class="button" type="button" data-action="apply-role" data-id="${role.id}" ${full || ownActive.length >= 2 ? "disabled" : ""}>${full ? "모집 완료" : ownActive.length >= 2 ? "오늘 신청 완료" : "신청하기"}</button>`;
    return `<article class="card quest-card"><div class="quest-top"><h3>${escapeHtml(role.name)}</h3><span class="points">+${role.points}P</span></div>${role.description ? `<p class="role-description">${escapeHtml(role.description)}</p>` : ""}<div><span class="pill">모집 ${applications.length} / ${role.capacity}명</span></div><div class="progress"><span style="width:${Math.min(100, applications.length / role.capacity * 100)}%"></span></div><div class="applicants">현재 신청: ${applications.length ? applications.map((item) => studentById(item.studentId).name).join(", ") : "아직 없음"}</div>${actionButton}</article>`;
  }).join("")}</div>`;
}

function studentDraw() {
  const student = currentStudent();
  return `<h1 class="page-heading">역사 위인 카드 뽑기</h1><p class="page-description">50P로 역사 속 멋진 인물을 만나 보세요.</p><section class="card draw-zone"><p>내 포인트 <strong class="points">${student.points}P</strong></p><div id="draw-card" class="draw-card"><div class="draw-card-inner"><div class="draw-face draw-back">?</div><div id="draw-result" class="draw-face draw-front"><span class="muted">카드를 뽑아 보세요!</span></div></div></div><button class="button gold" data-action="draw-card" ${student.points < 50 ? "disabled" : ""}>50P로 카드 뽑기</button>${student.points < 50 ? `<p class="muted">포인트가 부족합니다.</p>` : `<p class="muted">같은 카드도 다시 나올 수 있어요.</p>`}</section>`;
}

function rarityClass(rarity) { return { 일반: "common", 희귀: "rare", 영웅: "hero", 전설: "legend" }[rarity]; }
function studentCollection() {
  const student = currentStudent(); const unique = Object.keys(student.cards).filter((id) => student.cards[id] > 0).length;
  return `<h1 class="page-heading">위인 도감</h1><p class="page-description">수집 <strong>${unique} / ${FIGURES.length}</strong> · 역사 속 인물들을 모두 만나 보세요!</p><div class="collection">${FIGURES.map((figure) => { const count = student.cards[figure.id] || 0; return count ? `<article class="figure-card rarity-${rarityClass(figure.rarity)}">${count > 1 ? `<span class="count-badge">x${count}</span>` : ""}<span class="pill">${figure.rarity}</span><h3>${figure.name}</h3><p class="muted">${figure.era}</p><small>${figure.achievement}</small></article>` : `<article class="figure-card locked" aria-label="아직 획득하지 못한 카드">?</article>`; }).join("")}</div>`;
}

function studentRanking() {
  const rankings = [
    ["🏆", "이번 주 활동왕", [...data.students].sort((a,b) => b.pointHistory.length - a.pointHistory.length), "활동"],
    ["🤝", "역할 수행왕", [...data.students].sort((a,b) => completedCount(b.id) - completedCount(a.id)), "회"],
    ["🃏", "카드 수집왕", [...data.students].sort((a,b) => cardCount(b) - cardCount(a)), "장"]
  ];
  return `<h1 class="page-heading">우리 반 즐거운 랭킹</h1><p class="page-description">순위보다 서로의 멋진 활동을 응원해 주세요!</p><div class="grid">${rankings.map(([icon, title, students, unit]) => `<article class="card ranking-card"><div class="rank-icon">${icon}</div><div class="rank-list"><h3>${title}</h3>${students.slice(0,3).map((student, index) => `<div class="rank-line"><span>${index + 1}. ${student.name}</span><strong>${unit === "장" ? cardCount(student) : unit === "회" ? completedCount(student.id) : student.pointHistory.length}${unit}</strong></div>`).join("")}</div></article>`).join("")}</div>`;
}

function completedCount(studentId) { return data.roleApplications.filter((item) => item.studentId === studentId && item.status === "completed").length; }
function pointHistoryRow(item) { return `<div class="list-row"><div class="list-main"><strong>${escapeHtml(item.reason)}</strong><small class="muted">${item.date}</small></div><strong class="${item.amount >= 0 ? "points" : ""}">${item.amount >= 0 ? "+" : ""}${item.amount}P</strong></div>`; }

function todayIssuedPoints() {
  const today = todayString();
  const dateKey = (value) => {
    const parts = String(value || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
    return parts ? `${parts[1]}-${parts[2].padStart(2, "0")}-${parts[3].padStart(2, "0")}` : "";
  };
  return data.students.reduce((total, student) => total + (Array.isArray(student.pointHistory) ? student.pointHistory : []).reduce((studentTotal, item) => {
    const isToday = dateKey(item.date) === today;
    const isStudentSpending = item.amount < 0 && String(item.reason || "").includes("카드 뽑기");
    return studentTotal + (isToday && !isStudentSpending ? Number(item.amount) || 0 : 0);
  }, 0), 0);
}

function teacherDashboard() {
  const active = data.roleApplications.filter((item) => item.status !== "cancelled");
  const completed = active.filter((item) => item.status === "completed");
  return `<h1 class="page-heading">선생님 대시보드</h1><p class="page-description">오늘 우리 반의 활동을 한눈에 확인하세요.</p><div class="grid four"><article class="card"><span class="muted">학생 수</span><strong class="big-number">${data.students.length}명</strong></article><article class="card"><span class="muted">오늘 역할 신청</span><strong class="big-number">${active.length}건</strong></article><article class="card"><span class="muted">오늘 완료 역할</span><strong class="big-number">${completed.length}건</strong></article><article class="card"><span class="muted">오늘 지급 포인트</span><strong class="big-number">${todayIssuedPoints()}P</strong></article></div><h2 class="section-title">최근 역할 신청</h2>${teacherRoleList(active.slice(-5).reverse())}`;
}

function teacherStudents() {
  return `<h1 class="page-heading">학생 관리</h1><p class="page-description">가짜 학생 데이터로 화면 흐름을 확인하고 있습니다.</p><div class="list">${data.students.map((student) => `<div class="list-row"><div class="list-main"><strong>${student.name}</strong><small class="muted">역할 완료 ${completedCount(student.id)}회 · 카드 ${cardCount(student)}장</small></div><strong class="points">${student.points}P</strong></div>`).join("")}</div>`;
}

function teacherRoleList(items = data.roleApplications.filter((item) => item.status !== "cancelled")) {
  if (!items.length) return `<div class="empty">역할 신청이 아직 없습니다.</div>`;
  return `<div class="list">${items.map((item) => { const student = studentById(item.studentId); const role = roleById(item.roleId); if (!student || !role) return ""; const shownPoints = item.status === "completed" ? (item.awardedPoints ?? role.points) : role.points; const actions = item.status === "completed" ? `<button class="button danger" data-action="undo-complete" data-id="${item.id}">완료 취소</button>` : `<button class="button success" data-action="complete-role" data-id="${item.id}">완료</button><button class="button danger" data-action="cancel-role" data-id="${item.id}">취소</button>`; return `<div class="list-row"><div class="list-main"><strong>${student.name} / ${escapeHtml(role.name)}</strong><span class="pill ${item.status === "completed" ? "success" : "waiting"}">${item.status === "completed" ? "수행 완료" : "수행 대기"}</span> <span class="points">${shownPoints}P</span></div><div class="list-actions">${actions}</div></div>`; }).join("")}</div>`;
}

function roleEditorList(roles, scope, templateId = "") {
  if (!roles.length) return `<div class="empty">등록된 역할이 없습니다. 새 역할을 추가해 주세요.</div>`;
  return `<div class="role-editor-list">${roles.map((role, index) => `<article class="role-editor-item"><div class="role-order"><button class="icon-button" data-action="move-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}" data-direction="up" ${index === 0 ? "disabled" : ""} aria-label="${escapeHtml(role.name)} 위로 이동">↑</button><button class="icon-button" data-action="move-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}" data-direction="down" ${index === roles.length - 1 ? "disabled" : ""} aria-label="${escapeHtml(role.name)} 아래로 이동">↓</button></div><div class="role-editor-info"><strong>${escapeHtml(role.name)}</strong><span class="muted">${role.capacity}명 · ${role.points}P${role.description ? ` · ${escapeHtml(role.description)}` : ""}</span></div><div class="list-actions"><button class="button secondary compact" data-action="edit-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}">수정</button><button class="button danger compact" data-action="delete-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}">삭제</button></div></article>`).join("")}</div>`;
}

function templateEditor() {
  const template = data.roleTemplates.find((item) => item.id === editingTemplateId);
  if (!template) return "";
  return `<section class="card template-editor"><div class="section-heading"><div><span class="pill success">템플릿 수정 중</span><h2>${escapeHtml(template.name)}</h2></div><button class="button secondary" data-action="close-template-editor">닫기</button></div>${roleEditorList(template.roles, "template", template.id)}<button class="button success" data-action="add-role" data-scope="template" data-template="${template.id}">+ 템플릿 역할 추가</button><p class="muted small-note">여기에서 바꾼 내용은 이 템플릿에만 저장되며, 오늘의 역할은 자동으로 바뀌지 않습니다.</p></section>`;
}

function teacherRoles() {
  return `<h1 class="page-heading">1인1역 관리</h1><p class="page-description">오늘의 신청을 승인하고, 역할 구성과 템플릿을 관리할 수 있습니다.</p><section class="management-section"><div class="section-heading"><div><h2>오늘 신청 현황</h2><p class="muted">완료를 누르면 학생에게 포인트가 한 번만 지급됩니다.</p></div></div>${teacherRoleList()}</section><section class="card management-section"><div class="section-heading"><div><h2>오늘의 역할 수정</h2><p class="muted">여기에서 바꾼 내용은 오늘만 적용되고 저장된 템플릿은 바뀌지 않습니다.</p></div><button class="button success" data-action="add-role" data-scope="today">+ 오늘 역할 추가</button></div>${roleEditorList(data.currentRoles, "today")}</section><section class="card management-section"><h2>현재 역할을 새 템플릿으로 저장</h2><form id="template-save-form" class="inline-form"><input name="name" maxlength="40" required placeholder="예: 우리 반 기본 1인1역"><button class="button" type="submit">템플릿 저장</button></form></section><section class="management-section"><div class="section-heading"><div><h2>역할 템플릿 관리</h2><p class="muted">저장된 템플릿은 브라우저를 다시 열어도 유지됩니다.</p></div></div><div class="template-grid">${data.roleTemplates.map((template) => `<article class="card template-card"><div><h3>${escapeHtml(template.name)}</h3><p class="muted">역할 ${template.roles.length}개</p></div><div class="button-row"><button class="button success" data-action="load-template" data-id="${template.id}">오늘의 역할로 불러오기</button><button class="button secondary" data-action="edit-template" data-id="${template.id}">템플릿 수정</button><button class="button secondary" data-action="rename-template" data-id="${template.id}">이름 변경</button><button class="button secondary" data-action="duplicate-template" data-id="${template.id}">복제</button><button class="button danger" data-action="delete-template" data-id="${template.id}">삭제</button></div></article>`).join("")}</div></section>${templateEditor()}`;
}

function assignmentMatchesFilter(assignment) {
  if (assignmentFilter === "today") return assignment.dueDate <= todayString();
  if (assignmentFilter === "missing") return assignment.statuses.some((status) => status !== "submitted");
  if (assignmentFilter === "submitted") return assignment.statuses.every((status) => status === "submitted");
  return true;
}

function selectedStudentsForAssignment(assignmentId) {
  if (!assignmentSelections[assignmentId]) assignmentSelections[assignmentId] = new Set();
  return assignmentSelections[assignmentId];
}

function teacherAssignmentCard(assignment) {
  const selected = selectedStudentsForAssignment(assignment.id);
  const submittedCount = assignment.statuses.filter((status) => status === "submitted").length;
  const reviewCount = assignment.statuses.filter((status) => status === "review").length;
  const missingCount = assignment.statuses.length - submittedCount - reviewCount;
  const stateAction = assignment.assignmentState === "completed"
    ? `<button class="button secondary compact" data-action="ask-reopen-assignment" data-id="${assignment.id}">다시 열기</button>`
    : `<button class="button gold compact" data-action="ask-complete-assignment" data-id="${assignment.id}">과제 완료</button>`;
  const completedLabel = assignment.assignmentState === "completed" ? `<span class="pill success">과제 완료일 ${formatCompletedAt(assignment.completedAt)}</span>` : "";
  return `<article class="card assignment-manage-card ${assignment.important ? "important" : ""}"><div class="assignment-card-top"><div><div class="assignment-labels"><span class="subject-badge">${escapeHtml(assignment.subject)}</span>${assignment.important ? `<span class="important-mark">★ 중요</span>` : ""}${assignment.points > 0 ? `<span class="pill assignment-points-badge">${assignment.points}P</span>` : ""}<span class="pill">제출 기한 ${formatDueDate(assignment.dueDate)}</span>${completedLabel}</div><h2>${escapeHtml(assignment.title)}</h2>${assignment.description ? `<p class="muted">${escapeHtml(assignment.description)}</p>` : ""}</div><div class="list-actions">${stateAction}<button class="button secondary compact" data-action="edit-assignment" data-id="${assignment.id}">수정</button><button class="button danger compact" data-action="ask-delete-assignment" data-id="${assignment.id}">삭제</button></div></div><div class="assignment-counts"><span class="count-submitted">제출 완료 <strong>${submittedCount}명</strong></span><span class="count-review">확인 대기 <strong>${reviewCount}명</strong></span><span class="count-missing">미제출 <strong>${missingCount}명</strong></span></div><div class="assignment-student-list">${data.students.map((student, studentIndex) => { const status = assignment.statuses[studentIndex]; const reviewActions = status === "review" ? `<div class="review-actions"><button class="button success compact" data-action="review-assignment" data-assignment="${assignment.id}" data-student="${studentIndex}" data-status="submitted">제출 확인</button><button class="button danger compact" data-action="review-assignment" data-assignment="${assignment.id}" data-student="${studentIndex}" data-status="missing">반려</button></div>` : ""; return `<div class="assignment-student-row ${status === "review" ? "needs-review" : ""}"><label class="student-check"><input type="checkbox" data-action="select-assignment-student" data-assignment="${assignment.id}" data-student="${studentIndex}" ${selected.has(studentIndex) ? "checked" : ""}><span>${student.name}</span></label><div class="student-status-actions"><button class="status-button ${assignmentStatusClass(status)}" data-action="cycle-assignment-status" data-assignment="${assignment.id}" data-student="${studentIndex}">${ASSIGNMENT_STATUS_LABELS[status]}</button>${reviewActions}</div></div>`; }).join("")}</div><div class="button-row assignment-bulk-actions"><button class="button success compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="submitted" data-scope="selected" ${selected.size ? "" : "disabled"}>선택 학생 제출 처리</button><button class="button secondary compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="submitted" data-scope="all">전체 제출</button><button class="button secondary compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="missing" data-scope="all">전체 미제출</button></div></article>`;
}

function teacherStudentAssignmentView(studentId) {
  const studentIndex = data.students.findIndex((student) => student.id === studentId); const student = data.students[studentIndex];
  const submitted = data.assignments.filter((assignment) => assignment.statuses[studentIndex] === "submitted").length;
  const missing = data.assignments.filter((assignment) => assignment.statuses[studentIndex] === "missing").length;
  const review = data.assignments.length - submitted - missing;
  return `<section class="student-assignment-overview"><h2>${student.name} 과제 현황</h2><div class="grid four assignment-summary"><article class="card"><span class="muted">전체 과제</span><strong class="big-number">${data.assignments.length}개</strong></article><article class="card"><span class="muted">제출 완료</span><strong class="big-number">${submitted}개</strong></article><article class="card"><span class="muted">미제출</span><strong class="big-number">${missing}개</strong></article><article class="card"><span class="muted">확인 대기</span><strong class="big-number">${review}개</strong></article></div><div class="list">${data.assignments.map((assignment) => `<div class="list-row"><div class="list-main"><strong>${escapeHtml(assignment.title)}</strong><small class="muted">${escapeHtml(assignment.subject)} · ${formatDueDate(assignment.dueDate)}</small></div><span class="pill ${assignmentStatusClass(assignment.statuses[studentIndex])}">${ASSIGNMENT_STATUS_LABELS[assignment.statuses[studentIndex]]}</span></div>`).join("")}</div></section>`;
}

function teacherAssignments() {
  const filtered = data.assignments.filter(assignmentMatchesFilter);
  const active = filtered.filter((assignment) => !isAssignmentCompleted(assignment)); const completed = filtered.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
  return `<div class="section-heading assignment-page-heading"><div><h1 class="page-heading">과제 관리</h1><p class="page-description">학생별 제출 상태를 빠르고 편하게 관리하세요.</p></div><button class="button success" data-action="new-assignment">+ 새 과제 만들기</button></div><section class="card assignment-toolbar"><label>과제 필터<select id="assignment-filter"><option value="all" ${assignmentFilter === "all" ? "selected" : ""}>전체</option><option value="today" ${assignmentFilter === "today" ? "selected" : ""}>오늘까지</option><option value="missing" ${assignmentFilter === "missing" ? "selected" : ""}>미제출 학생 있음</option><option value="submitted" ${assignmentFilter === "submitted" ? "selected" : ""}>제출 완료</option></select></label><label>학생별 보기<select id="assignment-student-view"><option value="">학생을 선택하세요</option>${data.students.map((student) => `<option value="${student.id}" ${assignmentStudentView === student.id ? "selected" : ""}>${student.name}</option>`).join("")}</select></label></section>${assignmentStudentView ? teacherStudentAssignmentView(assignmentStudentView) : `<section><h2 class="section-title">진행 중인 과제</h2>${active.length ? `<div class="assignment-manage-list">${active.map(teacherAssignmentCard).join("")}</div>` : `<div class="empty">조건에 맞는 진행 중 과제가 없습니다.</div>`}</section><details class="completed-assignments" open><summary>완료된 과제 ${completed.length}개</summary>${completed.length ? `<div class="assignment-manage-list">${completed.map(teacherAssignmentCard).join("")}</div>` : `<div class="empty">조건에 맞는 완료된 과제가 없습니다.</div>`}</details>`}`;
}

function teacherObservations() {
  const selectedStudent = studentById(observationFilters.studentId); const keyword = observationFilters.keyword.toLocaleLowerCase("ko-KR");
  const records = data.observations.filter((item) => (!observationFilters.studentId || item.studentId === observationFilters.studentId)
    && (!observationFilters.category || item.category === observationFilters.category)
    && (!keyword || `${item.content} ${(item.quickItems || []).join(" ")}`.toLocaleLowerCase("ko-KR").includes(keyword)))
    .sort((first, second) => (second.date || "").localeCompare(first.date || "") || (second.createdAt || "").localeCompare(first.createdAt || ""));
  const recordRows = records.map((item) => {
    const student = studentById(item.studentId);
    const quickTags = (item.quickItems || []).map((quickItem) => `<span class="observation-quick-tag">${escapeHtml(quickItem)}</span>`).join("");
    return `<article class="observation-record"><div class="observation-record-head"><div><time datetime="${item.date}">${item.date}</time><strong>${escapeHtml(student?.name || "삭제된 학생")}</strong><span class="pill observation-${OBSERVATION_CATEGORIES.indexOf(item.category)}">${escapeHtml(item.category)}</span></div><div class="list-actions"><button class="button secondary compact" data-action="edit-observation" data-id="${item.id}">수정</button><button class="button danger compact" data-action="ask-delete-observation" data-id="${item.id}">삭제</button></div></div>${quickTags ? `<div class="observation-quick-tags">${quickTags}</div>` : ""}<p>${escapeHtml(item.content)}</p></article>`;
  }).join("");
  return `<div class="section-heading observation-page-heading"><div><h1 class="page-heading">관찰 기록</h1><p class="page-description">선생님만 확인할 수 있는 기록입니다.</p></div><button class="button success" data-action="new-observation">+ 새 관찰 기록</button></div><form id="observation-search-form" class="card observation-search"><label>학생<select name="studentId"><option value="">전체 학생</option>${data.students.map((student) => `<option value="${student.id}" ${observationFilters.studentId === student.id ? "selected" : ""}>${escapeHtml(student.name)}</option>`).join("")}</select></label><label>분류<select name="category"><option value="">전체 분류</option>${OBSERVATION_CATEGORIES.map((category) => `<option ${observationFilters.category === category ? "selected" : ""}>${category}</option>`).join("")}</select></label><label class="observation-search-keyword">키워드<input name="keyword" value="${escapeHtml(observationFilters.keyword)}" placeholder="내용 또는 세부 항목 검색"></label><div class="button-row"><button class="button" type="submit">검색</button><button class="button secondary" type="button" data-action="reset-observation-search">조건 초기화</button></div></form><section class="management-section"><div class="section-heading"><h2>${selectedStudent ? `${escapeHtml(selectedStudent.name)} 관찰 기록` : "전체 관찰 기록"}</h2><span class="muted">${records.length}건</span></div>${recordRows ? `<div class="observation-list">${recordRows}</div>` : `<div class="empty">조건에 맞는 관찰 기록이 없습니다.</div>`}</section>`;
}

function teacherPoints() {
  return `<h1 class="page-heading">포인트 관리</h1><p class="page-description">학생에게 포인트를 지급하거나 잘못 지급한 포인트를 차감할 수 있습니다.</p><div class="list">${data.students.map((student) => `<div class="list-row"><div class="list-main"><strong>${student.name}</strong><span class="points">${student.points}P</span></div><div class="list-actions"><button class="button success" data-action="open-points" data-id="${student.id}" data-kind="add">포인트 지급</button><button class="button danger" data-action="open-points" data-id="${student.id}" data-kind="subtract">포인트 차감</button></div></div>`).join("")}</div>`;
}

function teacherCards() {
  return `<h1 class="page-heading">카드 관리</h1><p class="page-description">위인 설명은 프로토타입용입니다. 실제 사용 전 선생님의 검토가 필요합니다.</p><div class="collection">${FIGURES.map((figure) => `<article class="figure-card rarity-${rarityClass(figure.rarity)}"><span class="pill">${figure.rarity}</span><h3>${figure.name}</h3><p class="muted">${figure.era}</p><small>${figure.achievement}</small></article>`).join("")}</div><section class="card" style="margin-top:24px"><h2>데모 설정</h2><p class="muted">모든 신청, 포인트, 카드, 관찰 기록을 처음 상태로 되돌립니다.</p><button class="button danger" data-action="reset-demo">데모 데이터 초기화</button></section>`;
}

function renderStudent() {
  const views = { home: studentHome, roles: studentRoles, draw: studentDraw, collection: studentCollection, ranking: studentRanking };
  app.innerHTML = shell((views[session.view] || studentHome)());
}
function renderTeacher() {
  const views = { dashboard: teacherDashboard, students: teacherStudents, roles: teacherRoles, assignments: teacherAssignments, observations: teacherObservations, points: teacherPoints, cards: teacherCards };
  app.innerHTML = shell((views[session.view] || teacherDashboard)(), true);
}
function render() { session.mode === "student" ? renderStudent() : session.mode === "teacher" ? renderTeacher() : renderWelcome(); }

function applyRole(roleId) {
  const active = data.roleApplications.filter((item) => item.studentId === session.studentId && item.status !== "cancelled");
  const roleApplicants = data.roleApplications.filter((item) => item.roleId === roleId && item.status !== "cancelled");
  const role = roleById(roleId);
  if (active.length >= 2) return toast("하루에 역할은 2개까지 신청할 수 있어요.");
  if (roleApplicants.length >= role.capacity) return toast("아쉽지만 이 역할은 모집이 끝났어요.");
  if (roleApplicants.some((item) => item.studentId === session.studentId)) return;
  data.roleApplications.push({ id: crypto.randomUUID(), studentId: session.studentId, roleId, status: "waiting" }); saveData(); render(); toast("역할 신청이 완료됐어요!");
}

function openStudentCancelModal(applicationId) {
  const application = data.roleApplications.find((item) => item.id === applicationId && item.studentId === session.studentId && item.status === "waiting");
  if (!application) return;
  const role = roleById(application.roleId); if (!role) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>역할 신청 취소</h2><p><strong>${escapeHtml(role.name)}</strong></p><p>이 역할 신청을 취소하시겠습니까?</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-student-cancel" data-id="${application.id}">확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function cancelOwnRole(applicationId) {
  const application = data.roleApplications.find((item) => item.id === applicationId);
  if (!application || application.studentId !== session.studentId || application.status !== "waiting") return;
  data.roleApplications = data.roleApplications.filter((item) => item.id !== application.id);
  saveData(); render(); toast("역할 신청을 취소했습니다. 다시 신청할 수도 있어요.");
}

function completeRole(id) {
  const application = data.roleApplications.find((item) => item.id === id);
  if (!application || application.status !== "waiting") return;
  const student = studentById(application.studentId); const role = roleById(application.roleId);
  if (!student || !role) return;
  application.status = "completed";
  application.awardedPoints = role.points;
  student.points += role.points;
  student.pointHistory.push({ id: crypto.randomUUID(), amount: role.points, reason: `${role.name} 완료`, date: new Date().toLocaleDateString("ko-KR") });
  saveData(); render(); toast(`${student.name}에게 ${role.points}P를 지급했습니다.`);
}

function undoCompleteRole(id) {
  const application = data.roleApplications.find((item) => item.id === id);
  if (!application || application.status !== "completed") return;
  const student = studentById(application.studentId); const role = roleById(application.roleId);
  if (!student || !role) return;
  const pointsToRecover = application.awardedPoints ?? role.points;

  if (!confirm("이 역할의 완료 처리를 취소하시겠습니까?\n지급된 포인트도 함께 회수됩니다.")) return;
  if (application.status !== "completed") return;
  if (student.points < pointsToRecover) {
    alert(`${student.name}의 현재 포인트가 ${student.points}P라서 ${pointsToRecover}P를 회수할 수 없습니다.\n학생의 포인트를 먼저 확인해 주세요.`);
    return;
  }

  student.points -= pointsToRecover;
  application.status = "waiting";
  application.awardedPoints = 0;
  student.pointHistory.push({ id: crypto.randomUUID(), amount: -pointsToRecover, reason: `${role.name} 완료 취소`, date: new Date().toLocaleDateString("ko-KR") });
  saveData(); render(); toast(`${student.name}의 역할 완료를 취소하고 ${pointsToRecover}P를 회수했습니다.`);
}

function pickRarity() {
  const value = Math.random() * 100; let total = 0;
  for (const [rarity, rate] of Object.entries(CARD_RATES)) { total += rate; if (value < total) return rarity; }
  return "일반";
}
function drawCard() {
  const student = currentStudent(); if (student.points < 50) return;
  const rarity = pickRarity(); const pool = FIGURES.filter((figure) => figure.rarity === rarity); const figure = pool[Math.floor(Math.random() * pool.length)];
  student.points -= 50; student.cards[figure.id] = (student.cards[figure.id] || 0) + 1;
  student.pointHistory.push({ id: crypto.randomUUID(), amount: -50, reason: `${figure.name} 카드 뽑기`, date: new Date().toLocaleDateString("ko-KR") }); saveData();
  const card = document.querySelector("#draw-card"); const result = document.querySelector("#draw-result");
  result.className = `draw-face draw-front rarity-${rarityClass(figure.rarity)}`;
  result.innerHTML = `<div><span class="pill">${figure.rarity}</span><h3>${figure.name}</h3><p>${figure.era}</p><small>${figure.achievement}</small></div>`;
  requestAnimationFrame(() => card.classList.add("revealed"));
  const drawButton = document.querySelector('[data-action="draw-card"]'); drawButton.disabled = student.points < 50; drawButton.textContent = student.points < 50 ? "포인트가 부족합니다" : "50P로 한 장 더 뽑기";
  toast(`${figure.rarity} 카드! ${figure.name}을(를) 만났어요.`);
}

function openPointModal(studentId, kind) {
  const student = studentById(studentId); const subtract = kind === "subtract";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="point-form" class="modal-card form" data-id="${studentId}" data-kind="${kind}"><h2>${student.name} · 포인트 ${subtract ? "차감" : "지급"}</h2><label>포인트<input name="amount" type="number" min="1" value="10" required></label><label>간단한 사유<input name="reason" required placeholder="예: 친구 도와주기"></label><div class="button-row"><button class="button ${subtract ? "danger" : "success"}" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function observationQuickSectionHtml(category, selected = [], managing = false) {
  const items = data.observationQuickItems[category] || [];
  return `<div class="observation-quick-heading"><strong>빠른 선택 항목</strong><button class="mini-text-button" type="button" data-action="toggle-observation-quick-manage">${managing ? "관리 닫기" : "항목 관리"}</button></div><div class="observation-quick-picker">${items.map((item) => `<button class="observation-quick-chip ${selected.includes(item) ? "selected" : ""}" type="button" data-action="toggle-observation-quick" data-value="${escapeHtml(item)}" aria-pressed="${selected.includes(item)}">${escapeHtml(item)}</button>`).join("") || `<span class="muted">등록된 항목이 없습니다.</span>`}</div><div class="observation-quick-add"><input id="observation-quick-new" maxlength="30" placeholder="새 항목"><button type="button" data-action="add-observation-quick">+ 추가</button></div><div class="observation-quick-manage" ${managing ? "" : "hidden"}>${items.map((item, index) => `<div><input data-quick-edit-index="${index}" maxlength="30" value="${escapeHtml(item)}"><button type="button" data-action="save-observation-quick" data-index="${index}">저장</button><button type="button" data-action="delete-observation-quick" data-index="${index}">삭제</button></div>`).join("")}</div>`;
}

function selectedObservationQuickItems() {
  return [...document.querySelectorAll('[data-action="toggle-observation-quick"].selected')].map((item) => item.dataset.value);
}

function refreshObservationQuickSection(category, selected = selectedObservationQuickItems(), managing = false) {
  const section = document.querySelector("#observation-quick-section");
  if (section) section.innerHTML = observationQuickSectionHtml(category, selected, managing);
}

function openObservationModal(observationId = "", presets = {}) {
  const observation = data.observations.find((item) => item.id === observationId);
  const selectedStudentId = observation?.studentId || presets.studentId || observationFilters.studentId || data.students[0]?.id || "";
  const selectedDate = observation?.date || presets.date || todayString();
  const selectedCategory = observation?.category || presets.category || "수업";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="observation-form" class="modal-card form observation-modal-card" data-id="${observationId}"><h2>${observation ? "관찰 기록 수정" : "새 관찰 기록"}</h2><label>학생 검색<input id="observation-student-search" type="search" placeholder="이름 또는 번호 입력 (예: 학생12)" autocomplete="off"></label><fieldset class="observation-student-picker"><legend>학생 선택</legend>${data.students.map((student, index) => `<label data-student-search="${escapeHtml(`${student.name} ${student.number || index + 1}`.toLocaleLowerCase("ko-KR"))}"><input type="radio" name="studentId" value="${student.id}" ${student.id === selectedStudentId ? "checked" : ""} required><span>${escapeHtml(student.name)}</span></label>`).join("")}</fieldset><label>날짜<input name="date" type="date" value="${selectedDate}" required></label><label>분류<select id="observation-category" name="category">${OBSERVATION_CATEGORIES.map((category) => `<option ${category === selectedCategory ? "selected" : ""}>${category}</option>`).join("")}</select></label><section id="observation-quick-section" class="observation-quick-section">${observationQuickSectionHtml(selectedCategory, observation?.quickItems || [])}</section><label>내용<textarea name="content" maxlength="1000" required placeholder="빠른 항목을 참고해 관찰 내용을 자유롭게 적어 주세요.">${observation ? escapeHtml(observation.content) : ""}</textarea></label><div class="button-row"><button class="button success" type="submit">저장</button>${observation ? "" : `<button class="button" type="submit" data-continue="true">저장 후 계속 기록</button>`}<button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
  document.querySelector("#observation-student-search")?.focus();
}

function openDeleteObservationModal(observationId) {
  const observation = data.observations.find((item) => item.id === observationId); if (!observation) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>관찰 기록 삭제</h2><p>이 관찰 기록을 삭제하시겠습니까?</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-delete-observation" data-id="${observation.id}">삭제</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openAssignmentModal(assignmentId = "") {
  const assignment = data.assignments.find((item) => item.id === assignmentId);
  const presetSubject = assignment && SUBJECTS.includes(assignment.subject) ? assignment.subject : "기타";
  const customSubject = assignment && !SUBJECTS.includes(assignment.subject) ? assignment.subject : "";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="assignment-form" class="modal-card form" data-id="${assignmentId}"><h2>${assignment ? "과제 수정" : "새 과제 만들기"}</h2><label>과제 제목<input name="title" maxlength="80" required value="${assignment ? escapeHtml(assignment.title) : ""}" placeholder="예: 수학 익힘책 30쪽"></label><label>과목<select name="subjectPreset">${SUBJECTS.map((subject) => `<option ${presetSubject === subject ? "selected" : ""}>${subject}</option>`).join("")}</select></label><label>과목 직접 입력 (선택)<input name="subjectCustom" maxlength="30" value="${escapeHtml(customSubject)}" placeholder="예: 미술"></label><label>과제 설명 (선택)<textarea name="description" maxlength="300" placeholder="과제 내용을 간단히 적어 주세요.">${assignment ? escapeHtml(assignment.description) : ""}</textarea></label><label>제출 기한<input name="dueDate" type="date" required value="${assignment?.dueDate || todayString()}"></label><label class="check-label"><input name="important" type="checkbox" ${assignment?.important ? "checked" : ""}><span>중요 과제로 표시</span></label><label class="assignment-point-field">완료 시 지급 포인트<span class="point-input-row"><input name="points" type="number" min="0" step="1" required value="${assignment?.points ?? 0}"><span>P</span></span></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function assignmentAward(assignment, studentId) {
  return assignment.pointAwards?.[studentId] || { awarded: false, amount: 0 };
}

function changeAssignmentStudentStatus(assignment, studentIndex, nextStatus) {
  const student = data.students[studentIndex]; if (!student || !ASSIGNMENT_STATUSES.includes(nextStatus)) return false;
  const previousStatus = assignment.statuses[studentIndex]; if (previousStatus === nextStatus) return true;
  if (!assignment.pointAwards || typeof assignment.pointAwards !== "object") assignment.pointAwards = {};
  const award = assignmentAward(assignment, student.id);
  if (previousStatus === "submitted" && nextStatus !== "submitted" && award.awarded && award.amount > 0) {
    if (student.points < award.amount) {
      alert(`${student.name}의 현재 포인트가 ${student.points}P라서 ${award.amount}P를 회수할 수 없습니다.\n학생의 포인트를 먼저 확인해 주세요.`);
      return false;
    }
    student.points -= award.amount;
    student.pointHistory.push({ id: crypto.randomUUID(), amount: -award.amount, reason: `${assignment.title} 제출 완료 취소`, date: new Date().toLocaleDateString("ko-KR") });
    assignment.pointAwards[student.id] = { ...award, awarded: false, revokedAt: new Date().toISOString() };
  }
  assignment.statuses[studentIndex] = nextStatus;
  if (nextStatus === "submitted" && !assignmentAward(assignment, student.id).awarded) {
    const amount = assignment.points;
    if (amount > 0) {
      student.points += amount;
      student.pointHistory.push({ id: crypto.randomUUID(), amount, reason: `${assignment.title} 제출 완료`, date: new Date().toLocaleDateString("ko-KR") });
    }
    assignment.pointAwards[student.id] = { awarded: true, amount, awardedAt: new Date().toISOString(), revokedAt: null };
  }
  refreshAssignmentCompletion(assignment);
  return true;
}

function openCancelAssignmentSubmissionModal(assignmentId, studentIndex, nextStatus) {
  const assignment = data.assignments.find((item) => item.id === assignmentId); const student = data.students[studentIndex];
  if (!assignment || !student || assignment.statuses[studentIndex] !== "submitted") return;
  const award = assignmentAward(assignment, student.id); const recovery = award.awarded && award.amount > 0 ? `<br>이 과제로 지급된 ${award.amount}P도 함께 회수됩니다.` : "";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>제출 완료 취소</h2><p class="confirm-message"><strong>${escapeHtml(student.name)}</strong>의 제출 완료를 취소하시겠습니까?${recovery}</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-cancel-assignment-submission" data-id="${assignment.id}" data-student="${studentIndex}" data-status="${nextStatus}">확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openAssignmentRequestModal(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId); const studentIndex = data.students.findIndex((student) => student.id === session.studentId);
  if (!assignment || assignment.assignmentState !== "active" || studentIndex < 0 || assignment.statuses[studentIndex] !== "missing") return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>과제 제출 확인 요청</h2><p><strong>${escapeHtml(assignment.title)}</strong></p><p class="confirm-message">이 과제를 제출했나요?<br>선생님께 확인 요청을 보냅니다.</p><div class="button-row"><button class="button success" type="button" data-action="confirm-assignment-request" data-id="${assignment.id}">확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function requestAssignmentReview(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId); const studentIndex = data.students.findIndex((student) => student.id === session.studentId);
  if (!assignment || assignment.assignmentState !== "active" || studentIndex < 0 || assignment.statuses[studentIndex] !== "missing") return;
  assignment.statuses[studentIndex] = "review"; refreshAssignmentCompletion(assignment);
  saveData(); render(); toast("선생님께 제출 확인을 요청했습니다.");
}

function openAssignmentConfirm(message, action, assignmentId, attributes = "") {
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>확인해 주세요</h2><p class="confirm-message">${message}</p><div class="button-row"><button class="button danger" type="button" data-action="${action}" data-id="${assignmentId}" ${attributes}>확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openCompleteAssignmentModal(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId && item.assignmentState === "active"); if (!assignment) return;
  const submitted = assignment.statuses.filter((status) => status === "submitted").length;
  const review = assignment.statuses.filter((status) => status === "review").length;
  const missing = assignment.statuses.length - submitted - review;
  const warning = review || missing ? `<p>현재 미제출 또는 확인 대기 학생이 있습니다.<br>그래도 이 과제를 완료하시겠습니까?</p>` : `<p>모든 학생이 제출 완료했습니다.<br>이 과제를 최종 완료하시겠습니까?</p>`;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>과제 완료</h2><p><strong>${escapeHtml(assignment.title)}</strong></p>${warning}<div class="assignment-counts modal-counts"><span class="count-submitted">제출 완료 <strong>${submitted}명</strong></span><span class="count-review">확인 대기 <strong>${review}명</strong></span><span class="count-missing">미제출 <strong>${missing}명</strong></span></div><div class="button-row"><button class="button gold" type="button" data-action="confirm-complete-assignment" data-id="${assignment.id}">과제 완료</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openReopenAssignmentModal(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId && item.assignmentState === "completed"); if (!assignment) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>과제 다시 열기</h2><p><strong>${escapeHtml(assignment.title)}</strong></p><p>이 과제를 다시 진행 중인 과제로 변경하시겠습니까?</p><div class="button-row"><button class="button success" type="button" data-action="confirm-reopen-assignment" data-id="${assignment.id}">다시 열기</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function completeAssignment(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId);
  if (!assignment || assignment.assignmentState !== "active") return;
  assignment.assignmentState = "completed"; assignment.completed = true; assignment.completedAt = new Date().toISOString();
  saveData(); render(); toast("과제를 완료된 과제로 이동했습니다.");
}

function reopenAssignment(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId);
  if (!assignment || assignment.assignmentState !== "completed") return;
  assignment.assignmentState = "active"; assignment.completed = false; assignment.completedAt = null;
  saveData(); render(); toast("과제를 다시 진행 중으로 열었습니다.");
}

function applyBulkAssignmentStatus(assignmentId, status, scope) {
  const assignment = data.assignments.find((item) => item.id === assignmentId); if (!assignment) return;
  const targets = scope === "selected" ? [...selectedStudentsForAssignment(assignmentId)] : data.students.map((_, index) => index);
  const recoveries = targets.map((studentIndex) => ({ studentIndex, student: data.students[studentIndex], award: assignmentAward(assignment, data.students[studentIndex]?.id) }))
    .filter((item) => assignment.statuses[item.studentIndex] === "submitted" && status !== "submitted" && item.award.awarded && item.award.amount > 0);
  const insufficient = recoveries.find((item) => item.student.points < item.award.amount);
  if (insufficient) { alert(`${insufficient.student.name}의 현재 포인트가 부족해 제출 완료를 취소할 수 없습니다.`); return; }
  if (recoveries.length && !confirm(`${recoveries.length}명의 제출 완료를 취소하면 지급된 과제 포인트도 함께 회수됩니다.\n계속하시겠습니까?`)) return;
  targets.forEach((studentIndex) => { changeAssignmentStudentStatus(assignment, studentIndex, status); });
  if (scope === "selected") selectedStudentsForAssignment(assignmentId).clear();
  saveData(); render(); toast(`${targets.length}명의 상태를 ${ASSIGNMENT_STATUS_LABELS[status]}로 변경했습니다.`);
}

function rolesForScope(scope, templateId) {
  if (scope === "today") return data.currentRoles;
  return data.roleTemplates.find((template) => template.id === templateId)?.roles || null;
}

function openRoleModal(scope, templateId = "", roleId = "") {
  const roles = rolesForScope(scope, templateId); if (!roles) return;
  const role = roles.find((item) => item.id === roleId);
  const title = role ? "역할 수정" : "새 역할 추가";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="role-form" class="modal-card form" data-scope="${scope}" data-template="${templateId}" data-id="${roleId}"><h2>${title}</h2><label>역할 이름<input name="name" maxlength="40" required value="${role ? escapeHtml(role.name) : ""}" placeholder="예: 칠판 정리"></label><label>모집 인원<input name="capacity" type="number" min="1" max="99" required value="${role?.capacity || 1}"></label><label>완료 시 지급 포인트<input name="points" type="number" min="0" max="999" required value="${role?.points ?? 10}"></label><label>간단한 역할 설명 (선택)<textarea name="description" maxlength="160" placeholder="학생이 이해하기 쉽게 적어 주세요.">${role ? escapeHtml(role.description || "") : ""}</textarea></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function loadTemplateForToday(templateId) {
  const template = data.roleTemplates.find((item) => item.id === templateId); if (!template) return;
  const hasApplications = data.roleApplications.some((item) => item.status !== "cancelled");
  if (hasApplications && !confirm("현재 신청 기록이 있습니다.\n새 역할을 불러오면 오늘의 신청 상태가 초기화됩니다.\n계속하시겠습니까?")) return;
  data.currentRoles = template.roles.map((role) => ({ ...role, id: crypto.randomUUID() }));
  data.roleApplications = [];
  saveData(); render(); toast(`‘${template.name}’을 오늘의 역할로 불러왔습니다.`);
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]"); if (!target) return; const action = target.dataset.action;
  if (action === "show-students") return renderWelcome(true);
  if (action === "enter-student") { session = { mode: "student", studentId: target.dataset.id, view: "home" }; return render(); }
  if (action === "enter-teacher") { session = { mode: "teacher", studentId: null, view: "dashboard" }; return render(); }
  if (action === "logout") { session = { mode: "welcome", studentId: null, view: "home" }; return render(); }
  if (action === "navigate") { session.view = target.dataset.view; return render(); }
  if (action === "apply-role") return applyRole(target.dataset.id);
  if (action === "open-student-cancel") return openStudentCancelModal(target.dataset.id);
  if (action === "confirm-student-cancel") return cancelOwnRole(target.dataset.id);
  if (action === "complete-role") return completeRole(target.dataset.id);
  if (action === "undo-complete") return undoCompleteRole(target.dataset.id);
  if (action === "cancel-role") { const item = data.roleApplications.find((entry) => entry.id === target.dataset.id); if (item && item.status === "waiting") { item.status = "cancelled"; saveData(); render(); toast("역할 신청을 취소했습니다."); } return; }
  if (action === "draw-card") return drawCard();
  if (action === "open-assignment-request") return openAssignmentRequestModal(target.dataset.id);
  if (action === "confirm-assignment-request") return requestAssignmentReview(target.dataset.id);
  if (action === "new-assignment") return openAssignmentModal();
  if (action === "edit-assignment") return openAssignmentModal(target.dataset.id);
  if (action === "ask-complete-assignment") return openCompleteAssignmentModal(target.dataset.id);
  if (action === "confirm-complete-assignment") return completeAssignment(target.dataset.id);
  if (action === "ask-reopen-assignment") return openReopenAssignmentModal(target.dataset.id);
  if (action === "confirm-reopen-assignment") return reopenAssignment(target.dataset.id);
  if (action === "cycle-assignment-status") {
    const assignment = data.assignments.find((item) => item.id === target.dataset.assignment); if (!assignment) return;
    const studentIndex = Number(target.dataset.student); const currentIndex = ASSIGNMENT_STATUSES.indexOf(assignment.statuses[studentIndex]);
    const nextStatus = ASSIGNMENT_STATUSES[(currentIndex + 1) % ASSIGNMENT_STATUSES.length];
    if (assignment.statuses[studentIndex] === "submitted") return openCancelAssignmentSubmissionModal(assignment.id, studentIndex, nextStatus);
    if (changeAssignmentStudentStatus(assignment, studentIndex, nextStatus)) { saveData(); render(); }
    return;
  }
  if (action === "review-assignment") {
    const assignment = data.assignments.find((item) => item.id === target.dataset.assignment); if (!assignment) return;
    const studentIndex = Number(target.dataset.student); if (assignment.statuses[studentIndex] !== "review") return;
    if (changeAssignmentStudentStatus(assignment, studentIndex, target.dataset.status)) { saveData(); render(); toast(target.dataset.status === "submitted" ? "제출을 확인하고 과제 포인트를 지급했습니다." : "제출 요청을 반려했습니다."); }
    return;
  }
  if (action === "confirm-cancel-assignment-submission") {
    const assignment = data.assignments.find((item) => item.id === target.dataset.id); const studentIndex = Number(target.dataset.student); if (!assignment) return;
    if (changeAssignmentStudentStatus(assignment, studentIndex, target.dataset.status)) { saveData(); render(); toast("제출 완료를 취소하고 지급 포인트를 회수했습니다."); }
    return;
  }
  if (action === "select-assignment-student") {
    const selected = selectedStudentsForAssignment(target.dataset.assignment); const studentIndex = Number(target.dataset.student);
    target.checked ? selected.add(studentIndex) : selected.delete(studentIndex); render(); return;
  }
  if (action === "ask-bulk-assignment") {
    if (target.dataset.scope === "selected") return applyBulkAssignmentStatus(target.dataset.id, target.dataset.status, "selected");
    const label = ASSIGNMENT_STATUS_LABELS[target.dataset.status];
    return openAssignmentConfirm(`모든 학생의 상태를 <strong>${label}</strong>로 변경하시겠습니까?`, "confirm-bulk-assignment", target.dataset.id, `data-status="${target.dataset.status}" data-scope="all"`);
  }
  if (action === "confirm-bulk-assignment") return applyBulkAssignmentStatus(target.dataset.id, target.dataset.status, target.dataset.scope);
  if (action === "ask-delete-assignment") return openAssignmentConfirm("이 과제를 삭제하시겠습니까?<br>학생들의 제출 기록도 함께 삭제됩니다.", "confirm-delete-assignment", target.dataset.id);
  if (action === "confirm-delete-assignment") {
    data.assignments = data.assignments.filter((assignment) => assignment.id !== target.dataset.id); delete assignmentSelections[target.dataset.id];
    saveData(); render(); toast("과제와 제출 기록을 삭제했습니다."); return;
  }
  if (action === "open-points") return openPointModal(target.dataset.id, target.dataset.kind);
  if (action === "new-observation") return openObservationModal();
  if (action === "edit-observation") return openObservationModal(target.dataset.id);
  if (action === "toggle-observation-quick") { target.classList.toggle("selected"); target.setAttribute("aria-pressed", String(target.classList.contains("selected"))); return; }
  if (action === "toggle-observation-quick-manage") {
    const panel = document.querySelector(".observation-quick-manage"); if (!panel) return;
    panel.hidden = !panel.hidden; target.textContent = panel.hidden ? "항목 관리" : "관리 닫기"; return;
  }
  if (action === "add-observation-quick") {
    const category = document.querySelector("#observation-category")?.value; if (!category) return;
    const name = document.querySelector("#observation-quick-new")?.value.trim().slice(0, 30); if (!name) return;
    if (data.observationQuickItems[category].includes(name)) { alert("이미 같은 항목이 있습니다."); return; }
    data.observationQuickItems[category].push(name); saveData(); refreshObservationQuickSection(category, selectedObservationQuickItems()); toast("빠른 선택 항목을 추가했습니다."); return;
  }
  if (action === "save-observation-quick") {
    const category = document.querySelector("#observation-category")?.value; const items = data.observationQuickItems[category] || []; const index = Number(target.dataset.index); const previous = items[index]; if (!previous) return;
    const name = document.querySelector(`[data-quick-edit-index="${index}"]`)?.value.trim().slice(0, 30); if (!name || (name !== previous && items.includes(name))) return;
    const selected = selectedObservationQuickItems().map((item) => item === previous ? name : item); items[index] = name; saveData(); refreshObservationQuickSection(category, selected, true); toast("빠른 선택 항목을 수정했습니다."); return;
  }
  if (action === "delete-observation-quick") {
    const category = document.querySelector("#observation-category")?.value; const items = data.observationQuickItems[category] || []; const index = Number(target.dataset.index); const name = items[index]; if (!name) return;
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>빠른 선택 항목 삭제</h2><p><strong>‘${escapeHtml(name)}’</strong> 항목을 삭제할까요?</p><p class="muted">이미 저장된 관찰 기록의 태그는 유지됩니다.</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-delete-observation-quick" data-category="${escapeHtml(category)}" data-index="${index}">삭제</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`); return;
  }
  if (action === "confirm-delete-observation-quick") {
    const category = target.dataset.category; const items = data.observationQuickItems[category] || []; const index = Number(target.dataset.index); const name = items[index]; if (!name) return;
    items.splice(index, 1); target.closest(".modal")?.remove(); saveData(); refreshObservationQuickSection(category, selectedObservationQuickItems().filter((item) => item !== name), true); toast("빠른 선택 항목을 삭제했습니다."); return;
  }
  if (action === "ask-delete-observation") return openDeleteObservationModal(target.dataset.id);
  if (action === "confirm-delete-observation") {
    data.observations = data.observations.filter((observation) => observation.id !== target.dataset.id);
    saveData(); render(); toast("관찰 기록을 삭제했습니다."); return;
  }
  if (action === "reset-observation-search") { observationFilters = { studentId: "", category: "", keyword: "" }; render(); return; }
  if (action === "add-role") return openRoleModal(target.dataset.scope, target.dataset.template || "");
  if (action === "edit-role") return openRoleModal(target.dataset.scope, target.dataset.template || "", target.dataset.id);
  if (action === "move-role") {
    const roles = rolesForScope(target.dataset.scope, target.dataset.template); if (!roles) return;
    const index = roles.findIndex((role) => role.id === target.dataset.id); const nextIndex = index + (target.dataset.direction === "up" ? -1 : 1);
    if (index < 0 || nextIndex < 0 || nextIndex >= roles.length) return;
    [roles[index], roles[nextIndex]] = [roles[nextIndex], roles[index]]; saveData(); render(); return;
  }
  if (action === "delete-role") {
    const roles = rolesForScope(target.dataset.scope, target.dataset.template); if (!roles) return;
    const role = roles.find((item) => item.id === target.dataset.id); if (!role) return;
    const related = target.dataset.scope === "today" && data.roleApplications.some((item) => item.roleId === role.id && item.status !== "cancelled");
    const message = related ? `‘${role.name}’에 신청 기록이 있습니다.\n역할을 삭제하면 해당 신청 상태도 지워집니다.\n계속하시겠습니까?` : `‘${role.name}’ 역할을 삭제할까요?`;
    if (!confirm(message)) return;
    roles.splice(roles.indexOf(role), 1);
    if (target.dataset.scope === "today") data.roleApplications = data.roleApplications.filter((item) => item.roleId !== role.id);
    saveData(); render(); toast("역할을 삭제했습니다."); return;
  }
  if (action === "load-template") return loadTemplateForToday(target.dataset.id);
  if (action === "edit-template") { editingTemplateId = target.dataset.id; render(); document.querySelector(".template-editor")?.scrollIntoView({ behavior: "smooth" }); return; }
  if (action === "close-template-editor") { editingTemplateId = null; render(); return; }
  if (action === "rename-template") {
    const template = data.roleTemplates.find((item) => item.id === target.dataset.id); if (!template) return;
    const name = prompt("새 템플릿 이름을 입력해 주세요.", template.name)?.trim(); if (!name) return;
    template.name = name.slice(0, 40); saveData(); render(); toast("템플릿 이름을 변경했습니다."); return;
  }
  if (action === "duplicate-template") {
    const template = data.roleTemplates.find((item) => item.id === target.dataset.id); if (!template) return;
    data.roleTemplates.push({ id: crypto.randomUUID(), name: `${template.name} 복사본`, roles: structuredClone(template.roles) }); saveData(); render(); toast("템플릿을 복제했습니다."); return;
  }
  if (action === "delete-template") {
    const template = data.roleTemplates.find((item) => item.id === target.dataset.id); if (!template || !confirm(`‘${template.name}’ 템플릿을 삭제할까요?`)) return;
    data.roleTemplates = data.roleTemplates.filter((item) => item.id !== template.id); if (editingTemplateId === template.id) editingTemplateId = null;
    saveData(); render(); toast("템플릿을 삭제했습니다."); return;
  }
  if (action === "close-modal") { target.closest(".modal")?.remove(); return; }
  if (action === "reset-demo") { if (confirm("모든 데모 데이터를 처음 상태로 되돌릴까요?")) { data = createDemoData(); saveData(); render(); toast("데모 데이터를 초기화했습니다."); } }
});

app.addEventListener("change", (event) => {
  if (event.target.id === "assignment-filter") { assignmentFilter = event.target.value; render(); }
  if (event.target.id === "assignment-student-view") { assignmentStudentView = event.target.value; render(); }
  if (event.target.id === "observation-category") refreshObservationQuickSection(event.target.value, []);
});

app.addEventListener("input", (event) => {
  if (event.target.id !== "observation-student-search") return;
  const keyword = event.target.value.trim().toLocaleLowerCase("ko-KR");
  document.querySelectorAll("[data-student-search]").forEach((item) => { item.hidden = keyword && !item.dataset.studentSearch.includes(keyword); });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") document.querySelector(".modal")?.remove();
});

app.addEventListener("submit", (event) => {
  event.preventDefault(); const form = event.target; const formData = new FormData(form);
  if (form.id === "observation-form") {
    const studentId = formData.get("studentId"); const date = formData.get("date"); const category = formData.get("category"); const content = formData.get("content").trim(); const quickItems = selectedObservationQuickItems();
    if (!studentById(studentId) || !date || !OBSERVATION_CATEGORIES.includes(category) || !content) return;
    const now = new Date().toISOString(); const existing = data.observations.find((item) => item.id === form.dataset.id);
    if (existing) Object.assign(existing, { studentId, date, category, content, quickItems, updatedAt: now });
    else data.observations.push({ id: crypto.randomUUID(), studentId, date, category, content, quickItems, createdAt: now, updatedAt: now });
    saveData();
    if (!existing && event.submitter?.dataset.continue === "true") {
      form.querySelectorAll('[name="studentId"]').forEach((input) => { input.checked = false; });
      form.querySelector("#observation-student-search").value = "";
      form.querySelectorAll("[data-student-search]").forEach((item) => { item.hidden = false; });
      form.querySelector('[name="content"]').value = "";
      form.querySelector("#observation-student-search").focus();
      toast("저장했습니다. 다음 학생을 선택해 계속 기록하세요."); return;
    }
    observationFilters = { studentId, category: "", keyword: "" };
    render(); toast(existing ? "관찰 기록을 수정했습니다." : "관찰 기록을 저장했습니다.");
  }
  if (form.id === "observation-search-form") {
    observationFilters = { studentId: formData.get("studentId"), category: formData.get("category"), keyword: formData.get("keyword").trim() };
    render();
  }
  if (form.id === "point-form") {
    const student = studentById(form.dataset.id); const rawAmount = Number(formData.get("amount")); const amount = form.dataset.kind === "subtract" ? -rawAmount : rawAmount; const reason = formData.get("reason").trim();
    if (!Number.isFinite(rawAmount) || rawAmount <= 0 || !reason) return;
    const previousPoints = student.points;
    student.points = Math.max(0, student.points + amount); const actualAmount = student.points - previousPoints;
    student.pointHistory.push({ id: crypto.randomUUID(), amount: actualAmount, reason, date: new Date().toLocaleDateString("ko-KR") }); saveData(); render(); toast("포인트 내역을 저장했습니다.");
  }
  if (form.id === "template-save-form") {
    const name = formData.get("name").trim(); if (!name) return;
    data.roleTemplates.push({ id: crypto.randomUUID(), name: name.slice(0, 40), roles: structuredClone(data.currentRoles) }); saveData(); render(); toast("새 템플릿을 저장했습니다.");
  }
  if (form.id === "role-form") {
    const roles = rolesForScope(form.dataset.scope, form.dataset.template); if (!roles) return;
    const name = formData.get("name").trim(); const capacity = Number(formData.get("capacity")); const points = Number(formData.get("points")); const description = formData.get("description").trim();
    if (!name || !Number.isInteger(capacity) || capacity < 1 || !Number.isInteger(points) || points < 0) return;
    const existing = roles.find((role) => role.id === form.dataset.id);
    if (existing) Object.assign(existing, { name, capacity, points, description });
    else roles.push({ id: crypto.randomUUID(), name, capacity, points, description });
    saveData(); render(); toast(existing ? "역할을 수정했습니다." : "새 역할을 추가했습니다.");
  }
  if (form.id === "assignment-form") {
    const title = formData.get("title").trim(); const customSubject = formData.get("subjectCustom").trim();
    const subject = customSubject || formData.get("subjectPreset"); const description = formData.get("description").trim(); const dueDate = formData.get("dueDate");
    const points = Number(formData.get("points"));
    if (!title || !subject || !dueDate || !Number.isInteger(points) || points < 0) return;
    const existing = data.assignments.find((assignment) => assignment.id === form.dataset.id);
    if (existing) { Object.assign(existing, { title, subject, description, dueDate, important: formData.has("important"), points }); refreshAssignmentCompletion(existing); }
    else { const newAssignment = { id: crypto.randomUUID(), title, subject, description, createdAt: new Date().toISOString(), dueDate, important: formData.has("important"), points, pointAwards: {}, assignmentState: "active", completed: false, completedAt: null, statuses: data.students.map(() => "missing") }; refreshAssignmentCompletion(newAssignment); data.assignments.push(newAssignment); }
    saveData(); render(); toast(existing ? "과제를 수정했습니다." : "새 과제를 만들었습니다.");
  }
});

render();
