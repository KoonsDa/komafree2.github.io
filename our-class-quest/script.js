const CARD_RARITIES = ["일반", "희귀", "영웅", "전설", "고대"];
const CARD_RATE_KEYS = { 일반: "common", 희귀: "rare", 영웅: "epic", 전설: "legendary", 고대: "ancient" };
const DEFAULT_DRAW_RATES = { common: 55, rare: 25, epic: 12, legendary: 6, ancient: 2 };
const DEFAULT_DRAW_OPTIONS = [
  { id: "draw-basic", name: "일반 뽑기", price: 30, rates: { common: 60, rare: 25, epic: 10, legendary: 4, ancient: 1 }, active: true, deleted: false },
  { id: "draw-advanced", name: "고급 뽑기", price: 60, rates: { common: 35, rare: 35, epic: 18, legendary: 9, ancient: 3 }, active: true, deleted: false },
  { id: "draw-premium", name: "프리미엄 뽑기", price: 100, rates: { common: 15, rare: 30, epic: 30, legendary: 18, ancient: 7 }, active: true, deleted: false }
];
const FIXED_DRAW_OPTION_NAMES = { "draw-basic": "일반 뽑기", "draw-premium": "프리미엄 뽑기" };
const DEFAULT_CARD_SET_ID = "korean-history-basic";
const CARD_UPGRADE_STEPS = [
  { from: "일반", to: "희귀", key: "commonToRare", defaultCount: 3 },
  { from: "희귀", to: "영웅", key: "rareToEpic", defaultCount: 3 },
  { from: "영웅", to: "전설", key: "epicToLegendary", defaultCount: 4 },
  { from: "전설", to: "고대", key: "legendaryToAncient", defaultCount: 5 }
];
const DEFAULT_CARD_UPGRADE_SETTINGS = Object.fromEntries(CARD_UPGRADE_STEPS.map((step) => [step.key, step.defaultCount]));
const DEFAULT_CARD_ABILITY_SETTINGS = {
  일반: { dailyCap: 0, abilities: { academic: { assignmentPercent: 2, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 2 }, balance: { assignmentPercent: 1, rolePercent: 1 } } },
  희귀: { dailyCap: 3, abilities: { academic: { assignmentPercent: 5, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 5 }, balance: { assignmentPercent: 3, rolePercent: 3 } } },
  영웅: { dailyCap: 5, abilities: { academic: { assignmentPercent: 10, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 10 }, balance: { assignmentPercent: 5, rolePercent: 5 } } },
  전설: { dailyCap: 8, abilities: { academic: { assignmentPercent: 15, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 15 }, balance: { assignmentPercent: 8, rolePercent: 8 } } },
  고대: { dailyCap: 10, abilities: { academic: { assignmentPercent: 20, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 20 }, balance: { assignmentPercent: 10, rolePercent: 10 } } }
};
const CARD_ABILITIES = [
  { id: "academic", name: "학문의 힘", icon: "📚", description: "과제" , weight: 1, targets: { assignments: true, roles: false } },
  { id: "responsibility", name: "책임의 힘", icon: "🛡", description: "1인1역", weight: 1, targets: { assignments: false, roles: true } },
  { id: "balance", name: "균형의 힘", icon: "⭐", description: "과제·1인1역", weight: 1, targets: { assignments: true, roles: true } }
];
const STORAGE_KEY = "ourClassQuestDemoV1";
const DEFAULT_CLASS_FEATURES = { groups: true, roles: true, assignments: true, points: true, cards: true, rankings: true };
const CLASS_FEATURES = [
  { key: "groups", label: "모둠활동", description: "모둠 구성, 점수와 공동 미션" },
  { key: "roles", label: "1인1역", description: "역할 신청과 완료 보상" },
  { key: "assignments", label: "과제", description: "과제와 학생별 제출 현황" },
  { key: "points", label: "포인트", description: "학생 포인트 지급과 차감" },
  { key: "cards", label: "카드", description: "위인 카드 뽑기와 도감" },
  { key: "rankings", label: "랭킹", description: "활동별 학급 순위" }
];
const RANKING_TYPES = [
  { id: "activity", title: "획득 포인트", icon: "◆", unit: "P" },
  { id: "roles", title: "1인1역 활동", icon: "✓", unit: "회" },
  { id: "assignments", title: "과제 활동", icon: "▣", unit: "개" },
  { id: "collection", title: "카드 수집", icon: "★", unit: "종" }
];
const TIMETABLE_DAYS = [
  { key: "monday", label: "월요일", day: 1 }, { key: "tuesday", label: "화요일", day: 2 },
  { key: "wednesday", label: "수요일", day: 3 }, { key: "thursday", label: "목요일", day: 4 },
  { key: "friday", label: "금요일", day: 5 }
];
const EMPTY_TIMETABLE = () => Array.from({ length: 6 }, () => "");
const DEFAULT_CLASS_MISSIONS = [
  { target: 500, reward: "우리 반 영화 보기" }, { target: 1000, reward: "간식 파티" },
  { target: 1500, reward: "자유 놀이 시간" }, { target: 2000, reward: "특별 활동" }
];
const DEFAULT_GROUPS = () => Array.from({ length: 4 }, (_, index) => ({ id: `group-${index + 1}`, name: `${index + 1}모둠`, score: 0, active: true, order: index }));

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

function normalizeDrawRates(source = {}, fallback = DEFAULT_DRAW_RATES) {
  const rates = Object.fromEntries(Object.keys(DEFAULT_DRAW_RATES).map((key) => [key, Number.isFinite(Number(source[key])) ? Number(source[key]) : fallback[key]]));
  return Object.values(rates).every((rate) => rate >= 0 && rate <= 100) && Math.abs(Object.values(rates).reduce((sum, rate) => sum + rate, 0) - 100) < 0.001 ? rates : { ...fallback };
}

function createDemoData() {
  const students = STUDENT_NAMES.map((name, index) => ({
    id: `s${index + 1}`, number: index + 1, name, loginId: `student${String(index + 1).padStart(2, "0")}`, active: true, points: [75, 45, 95, 30, 60][index], cards: index === 0 ? { hongdo: { 일반: { academic: 1, responsibility: 1, balance: 0 } }, saimdang: { 희귀: { academic: 1, responsibility: 0, balance: 0 } } } : {}, representativeCard: null, cardUpgradeHistory: [], cardAcquisitionHistory: [],
    pointHistory: [{ id: crypto.randomUUID(), amount: [20, 10, 25, 5, 15][index], reason: "이번 주 역할 참여", date: new Date().toLocaleDateString("ko-KR") }]
  }));
  return {
    students,
    classSettings: { appName: "우리반 퀘스트", className: "우리 반", teacherName: "선생님", features: { ...DEFAULT_CLASS_FEATURES } },
    roleApplications: [
      { id: crypto.randomUUID(), studentId: "s2", roleId: "board", status: "waiting", appliedAt: new Date().toISOString() },
      { id: crypto.randomUUID(), studentId: "s3", roleId: "lunch", status: "completed", appliedAt: new Date().toISOString(), completedAt: new Date().toISOString() }
    ],
    dailyRoleApplicationLimit: 1,
    roleApplicationOpenTime: "",
    groups: DEFAULT_GROUPS(),
    groupAssignments: {},
    groupScoreTransactions: [],
    classMissions: DEFAULT_CLASS_MISSIONS.map((mission) => ({ id: crypto.randomUUID(), ...mission, confirmed: false, confirmedAt: null })),
    currentRoles: structuredClone(DEFAULT_ROLES),
    roleTemplates: [{ id: crypto.randomUUID(), name: "기본 1인1역", roles: structuredClone(DEFAULT_ROLES) }],
    assignments: ASSIGNMENTS.map((assignment, assignmentIndex) => ({
      id: `a${assignmentIndex + 1}`, title: assignment.title, subject: assignment.subject, description: assignment.description,
      createdAt: dateWithOffset(-assignmentIndex), dueDate: dateWithOffset(assignment.dueOffset), important: assignmentIndex === 0,
      points: 0, pointAwards: {},
      assignmentState: "active", completed: false, completedAt: null,
      studentStatuses: Object.fromEntries(students.map((student, studentIndex) => [student.id, studentIndex < 3 - assignmentIndex ? "submitted" : "missing"]))
    })),
    localOnlyAssignmentArchive: [],
    cardSets: [{ id: DEFAULT_CARD_SET_ID, name: "한국사 기본 위인", description: "우리 역사에서 만나는 기본 위인 카드셋", createdAt: new Date().toISOString(), active: true, deleted: false }],
    activeCardSetIds: [DEFAULT_CARD_SET_ID],
    drawOptions: structuredClone(DEFAULT_DRAW_OPTIONS),
    cardUpgradeSettings: { ...DEFAULT_CARD_UPGRADE_SETTINGS },
    cardAbilitySettings: structuredClone(DEFAULT_CARD_ABILITY_SETTINGS),
    cardAbilities: CARD_ABILITIES.map((ability) => ({ ...ability, active: true, deleted: false })),
    cards: FIGURES.map(({ rarity, ...figure }, index) => ({ ...figure, imageData: "", cardSetId: DEFAULT_CARD_SET_ID, order: index, active: true, deleted: false })),
    observations: [],
    observationQuickItems: structuredClone(DEFAULT_OBSERVATION_QUICK_ITEMS),
    rankingVisibility: Object.fromEntries(RANKING_TYPES.map((ranking) => [ranking.id, true])),
    weeklyTimetable: Object.fromEntries(TIMETABLE_DAYS.map((day) => [day.key, EMPTY_TIMETABLE()])),
    dateTimetableOverrides: {},
    dailyClassNotes: {},
    classEvents: [],
    pointShopItems: [],
    pointUseRequests: [],
    pointShopSets: [],
    pointTransferSettings: { enabled: true, maxPerTransfer: 10, dailyMaxAmount: 20, dailyMaxCount: 3 },
    pointTransfers: [],
    cloudConnection: { classId: "", pointsConnected: false }
  };
}

function isValidObservationDate(value) {
  const match = typeof value === "string" ? value.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function isValidObservationTimestamp(value) {
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(new Date(value).getTime());
}

function normalizeObservation(value) {
  const observation = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const createdAtDate = isValidObservationTimestamp(observation.createdAt) ? localDateKey(observation.createdAt) : "";
  const date = isValidObservationDate(observation.date) ? observation.date : (isValidObservationDate(createdAtDate) ? createdAtDate : todayString());
  const createdAt = isValidObservationTimestamp(observation.createdAt) ? observation.createdAt : `${date}T00:00:00.000Z`;
  return {
    id: observation.id || crypto.randomUUID(),
    studentId: observation.studentId || "",
    date,
    category: OBSERVATION_CATEGORIES.includes(observation.category) ? observation.category : "기타",
    content: typeof observation.content === "string" ? observation.content : "",
    quickItems: Array.isArray(observation.quickItems) ? observation.quickItems.filter((item) => typeof item === "string") : [],
    createdAt,
    updatedAt: isValidObservationTimestamp(observation.updatedAt) ? observation.updatedAt : createdAt
  };
}

function normalizeGroup(value, index) {
  const group = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const score = Number(group.score); const order = Number(group.order);
  return { id: group.id || crypto.randomUUID(), name: String(group.name || `${index + 1}모둠`).slice(0, 30), score: Number.isInteger(score) && score >= 0 ? score : 0, active: group.active !== false, order: Number.isInteger(order) ? order : index };
}

function normalizeGroupAssignments(value, students, groups) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const activeStudentIds = new Set((Array.isArray(students) ? students : []).filter((student) => student?.active !== false).map((student) => student.id));
  const activeGroupIds = new Set((Array.isArray(groups) ? groups : []).filter((group) => group?.active !== false).map((group) => group.id));
  return Object.fromEntries(Object.entries(value).filter(([studentId, groupId]) => activeStudentIds.has(studentId) && activeGroupIds.has(groupId)));
}

function normalizeGroupScoreTransaction(value) {
  const transaction = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawAmount = Number(transaction.amount); const amountValid = Number.isInteger(rawAmount); const amount = amountValid ? rawAmount : 0;
  const rawScoreAfter = Number(transaction.scoreAfter); const scoreAfterValid = Number.isInteger(rawScoreAfter) && rawScoreAfter >= 0; const scoreAfter = scoreAfterValid ? rawScoreAfter : 0;
  const rawScoreBefore = Number(transaction.scoreBefore);
  const recoveredScoreBefore = scoreAfter - amount;
  const scoreBefore = Number.isInteger(rawScoreBefore) && rawScoreBefore >= 0 ? rawScoreBefore : (amountValid && scoreAfterValid && recoveredScoreBefore >= 0 ? recoveredScoreBefore : scoreAfter);
  return { id: transaction.id || crypto.randomUUID(), groupId: String(transaction.groupId || ""), groupName: String(transaction.groupName || "모둠"), amount, scoreBefore, scoreAfter, createdAt: isValidObservationTimestamp(transaction.createdAt) ? transaction.createdAt : new Date().toISOString(), type: transaction.type || "manual" };
}

function normalizeClassMission(value) {
  const mission = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const target = Number(mission.target); const confirmed = mission.confirmed === true;
  return { id: mission.id || crypto.randomUUID(), target: Number.isInteger(target) && target > 0 ? target : 1, reward: String(mission.reward || "공동 활동").slice(0, 100), confirmed, confirmedAt: confirmed && isValidObservationTimestamp(mission.confirmedAt) ? mission.confirmedAt : null };
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return createDemoData();
    const savedCards = Array.isArray(saved.cards) ? saved.cards : FIGURES;
    const legacyRarityByCardId = Object.fromEntries(savedCards.map((card) => [card.id, CARD_RARITIES.includes(card.rarity) ? card.rarity : "일반"]));
    const savedCardSets = Array.isArray(saved.cardSets) ? saved.cardSets : [];
    if (!savedCardSets.length) savedCardSets.push({ id: DEFAULT_CARD_SET_ID, name: "한국사 기본 위인", description: "기존 카드를 안전하게 옮긴 기본 카드셋", createdAt: new Date().toISOString(), active: true, deleted: false });
    saved.cardSets = savedCardSets.map((cardSet) => ({
      id: cardSet.id || crypto.randomUUID(), name: cardSet.name || "이름 없는 카드셋", description: cardSet.description || "",
      createdAt: cardSet.createdAt || new Date().toISOString(), active: cardSet.active !== false, deleted: Boolean(cardSet.deleted)
    }));
    const fallbackCardSetId = saved.cardSets.find((cardSet) => !cardSet.deleted)?.id || DEFAULT_CARD_SET_ID;
    saved.cards = savedCards.map((card, index) => ({
      id: card.id || crypto.randomUUID(), name: card.name || "이름 없는 카드", era: card.era || "분류 없음",
      achievement: card.achievement || card.description || "", imageData: typeof card.imageData === "string" && card.imageData.startsWith("data:image/") ? card.imageData : "",
      imagePath: typeof card.imagePath === "string" ? card.imagePath : "", imageUrl: typeof card.imageUrl === "string" ? card.imageUrl : "", imageUpdatedAt: typeof card.imageUpdatedAt === "string" ? card.imageUpdatedAt : "",
      cardSetId: saved.cardSets.some((cardSet) => cardSet.id === card.cardSetId) ? card.cardSetId : fallbackCardSetId,
      order: Number.isFinite(Number(card.order)) ? Number(card.order) : index, active: card.active !== false, deleted: Boolean(card.deleted)
    }));
    const legacyActiveSetIds = Array.isArray(saved.activeCardSetIds) ? saved.activeCardSetIds : [saved.currentCardSetId || fallbackCardSetId];
    saved.activeCardSetIds = [...new Set(legacyActiveSetIds)].filter((id) => saved.cardSets.some((cardSet) => cardSet.id === id && cardSet.active && !cardSet.deleted));
    if (!saved.activeCardSetIds.length) { const firstUsableSet = saved.cardSets.find((cardSet) => cardSet.active && !cardSet.deleted); if (firstUsableSet) saved.activeCardSetIds = [firstUsableSet.id]; }
    delete saved.currentCardSetId;
    const legacyDrawRates = saved.drawRates && typeof saved.drawRates === "object" ? normalizeDrawRates(saved.drawRates) : null;
    const savedDrawOptions = Array.isArray(saved.drawOptions) ? saved.drawOptions : legacyDrawRates ? [{ id: "legacy-default-draw", name: "기본 뽑기", price: 50, rates: legacyDrawRates, active: true, deleted: false }] : structuredClone(DEFAULT_DRAW_OPTIONS);
    saved.drawOptions = savedDrawOptions.map((option, index) => ({
      id: option.id || crypto.randomUUID(), name: option.name || `뽑기 옵션 ${index + 1}`,
      price: Number.isInteger(Number(option.price)) && Number(option.price) >= 0 ? Number(option.price) : 50,
      rates: normalizeDrawRates(option.rates), active: option.active !== false, deleted: Boolean(option.deleted)
    }));
    delete saved.drawRates;
    saved.cardUpgradeSettings = Object.fromEntries(CARD_UPGRADE_STEPS.map((step) => {
      const value = Number(saved.cardUpgradeSettings?.[step.key]); return [step.key, Number.isInteger(value) && value >= 2 ? value : step.defaultCount];
    }));
    saved.cardAbilities = (Array.isArray(saved.cardAbilities) ? saved.cardAbilities : CARD_ABILITIES).filter((ability) => ability && String(ability.id || "") && String(ability.name || "").trim()).map((ability) => { const defaultTargets = ability.id === "academic" ? { assignments: true, roles: false } : ability.id === "responsibility" ? { assignments: false, roles: true } : { assignments: true, roles: true }; return { id: String(ability.id), name: String(ability.name).trim().slice(0, 40), icon: String(ability.icon || "✨").slice(0, 8), description: String(ability.description || "").trim().slice(0, 120), weight: Math.max(1, Number.isInteger(Number(ability.weight)) ? Number(ability.weight) : 1), active: ability.active !== false, deleted: Boolean(ability.deleted), targets: { assignments: typeof ability.targets?.assignments === "boolean" ? ability.targets.assignments : defaultTargets.assignments, roles: typeof ability.targets?.roles === "boolean" ? ability.targets.roles : defaultTargets.roles } }; });
    CARD_ABILITIES.forEach((ability) => { if (!saved.cardAbilities.some((item) => item.id === ability.id)) saved.cardAbilities.push({ ...ability, active: true, deleted: false }); });
    saved.cardAbilitySettings = Object.fromEntries(CARD_RARITIES.map((rarity) => {
      const setting = saved.cardAbilitySettings?.[rarity] || DEFAULT_CARD_ABILITY_SETTINGS[rarity];
      const legacyPercent = Number(setting.bonusPercent); const dailyCap = Number(setting.dailyCap);
      const abilities = Object.fromEntries(saved.cardAbilities.map((ability) => {
        const defaults = DEFAULT_CARD_ABILITY_SETTINGS[rarity].abilities[ability.id] || { assignmentPercent: 0, rolePercent: 0 }; const source = setting.abilities?.[ability.id] || {};
        const assignmentPercent = Number(source.assignmentPercent); const rolePercent = Number(source.rolePercent);
        return [ability.id, {
          assignmentPercent: Number.isFinite(assignmentPercent) && assignmentPercent >= 0 ? assignmentPercent : (Number.isFinite(legacyPercent) ? (ability.id === "responsibility" ? 0 : legacyPercent) : defaults.assignmentPercent),
          rolePercent: Number.isFinite(rolePercent) && rolePercent >= 0 ? rolePercent : (Number.isFinite(legacyPercent) ? (ability.id === "academic" ? 0 : legacyPercent) : defaults.rolePercent)
        }];
      }));
      return [rarity, {
        dailyCap: Number.isInteger(dailyCap) && dailyCap >= 0 ? dailyCap : DEFAULT_CARD_ABILITY_SETTINGS[rarity].dailyCap, abilities
      }];
    }));
    const usedLoginIds = new Set();
    saved.students = (Array.isArray(saved.students) ? saved.students : []).map((student, studentIndex) => {
      const legacyCards = Array.isArray(student.cards) ? student.cards.reduce((counts, card) => {
        const id = typeof card === "string" ? card : card?.id; if (!id) return counts;
        const rarity = typeof card === "object" && CARD_RARITIES.includes(card?.rarity) ? card.rarity : (legacyRarityByCardId[id] || "일반");
        if (!counts[id]) counts[id] = Object.fromEntries(CARD_RARITIES.map((item) => [item, 0])); counts[id][rarity] += 1; return counts;
      }, {}) : (student.cards && typeof student.cards === "object" ? student.cards : {});
      const cards = Object.fromEntries(Object.entries(legacyCards).map(([cardId, value]) => {
        const baseRarity = legacyRarityByCardId[cardId] || "일반";
        const inventory = Object.fromEntries(CARD_RARITIES.map((rarity) => {
          const rarityValue = value && typeof value === "object" && !Array.isArray(value) ? value[rarity] : (rarity === baseRarity ? value : 0);
          if (rarityValue && typeof rarityValue === "object" && !Array.isArray(rarityValue)) return [rarity, Object.fromEntries(saved.cardAbilities.map((ability) => [ability.id, Math.max(0, Number(rarityValue[ability.id]) || 0)]))];
          const counts = Object.fromEntries(saved.cardAbilities.map((ability) => [ability.id, 0]));
          for (let count = 0; count < Math.max(0, Number(rarityValue) || 0); count += 1) counts[saved.cardAbilities[Math.floor(Math.random() * saved.cardAbilities.length)].id] += 1;
          return [rarity, counts];
        }));
        return [cardId, inventory];
      }));
      const representative = student.representativeCard;
      const representedAbilities = cards[representative?.cardId]?.[representative?.rarity] || {}; const fallbackAbility = saved.cardAbilities.find((ability) => Number(representedAbilities[ability.id]) > 0)?.id;
      const representativeAbilityId = representedAbilities[representative?.abilityId] > 0 ? representative.abilityId : fallbackAbility;
      const representativeCard = representative && CARD_RARITIES.includes(representative.rarity) && representativeAbilityId
        ? { cardId: representative.cardId, rarity: representative.rarity, abilityId: representativeAbilityId } : null;
      let loginId = String(student.loginId || `student${String(studentIndex + 1).padStart(2, "0")}`).trim();
      if (!loginId || usedLoginIds.has(loginId.toLocaleLowerCase("en-US"))) { let suffix = studentIndex + 1; do { loginId = `student${String(suffix).padStart(2, "0")}`; suffix += 1; } while (usedLoginIds.has(loginId.toLocaleLowerCase("en-US"))); }
      usedLoginIds.add(loginId.toLocaleLowerCase("en-US"));
      return { ...student, number: Number.isInteger(Number(student.number)) && Number(student.number) > 0 ? Number(student.number) : studentIndex + 1, loginId, active: student.active !== false, cards, representativeCard, cardUpgradeHistory: Array.isArray(student.cardUpgradeHistory) ? student.cardUpgradeHistory : [], cardAcquisitionHistory: Array.isArray(student.cardAcquisitionHistory) ? student.cardAcquisitionHistory : [], pointHistory: Array.isArray(student.pointHistory) ? student.pointHistory : [] };
    });
    saved.classSettings = { appName: String(saved.classSettings?.appName || "우리반 퀘스트").slice(0, 50), className: String(saved.classSettings?.className || "우리 반").slice(0, 50), teacherName: String(saved.classSettings?.teacherName || "선생님").slice(0, 30), features: Object.fromEntries(Object.keys(DEFAULT_CLASS_FEATURES).map((key) => [key, saved.classSettings?.features?.[key] !== false])), ...(saved.classSettings?.studentHomeMessageTitle != null ? { studentHomeMessageTitle: String(saved.classSettings.studentHomeMessageTitle).slice(0, 100) } : {}), ...(saved.classSettings?.studentHomeMessageSubtitle != null ? { studentHomeMessageSubtitle: String(saved.classSettings.studentHomeMessageSubtitle).slice(0, 200) } : {}) };
    saved.cloudConnection = saved.cloudConnection && typeof saved.cloudConnection === "object" && !Array.isArray(saved.cloudConnection) ? { classId: String(saved.cloudConnection.classId || ""), pointsConnected: saved.cloudConnection.pointsConnected === true } : { classId: "", pointsConnected: false };
    if (!Array.isArray(saved.currentRoles)) saved.currentRoles = structuredClone(DEFAULT_ROLES);
    saved.currentRoles = saved.currentRoles.map((role) => ({ ...role, description: role.description || "", active: role.active !== false }));
    if (!Array.isArray(saved.roleTemplates)) {
      saved.roleTemplates = [{ id: crypto.randomUUID(), name: "기본 1인1역", roles: structuredClone(DEFAULT_ROLES) }];
    }
    saved.roleTemplates = saved.roleTemplates.map((template) => ({ ...template, roles: template.roles.map((role) => ({ ...role, description: role.description || "" })) }));
    saved.assignments = (Array.isArray(saved.assignments) ? saved.assignments : []).map((assignment, index) => {
      const assignmentState = ["active", "completed"].includes(assignment.assignmentState) ? assignment.assignmentState : assignment.completed ? "completed" : "active";
      const legacyStatuses = Array.isArray(assignment.statuses) ? assignment.statuses : (assignment.submitted || []).map((submitted) => submitted ? "submitted" : "missing");
      const existingStudentStatuses = assignment.studentStatuses && typeof assignment.studentStatuses === "object" && !Array.isArray(assignment.studentStatuses) ? assignment.studentStatuses : {};
      const studentStatuses = Object.fromEntries(saved.students.map((student, studentIndex) => { const status = existingStudentStatuses[student.id] ?? legacyStatuses[studentIndex]; return [student.id, ASSIGNMENT_STATUSES.includes(status) ? status : "missing"]; }));
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
        studentStatuses
      };
      delete migrated.statuses; delete migrated.submitted;
      refreshAssignmentCompletion(migrated);
      return migrated;
    });
    saved.localOnlyAssignmentArchive = (Array.isArray(saved.localOnlyAssignmentArchive) ? saved.localOnlyAssignmentArchive : []).filter((assignment) => assignment && typeof assignment === "object" && !Array.isArray(assignment) && String(assignment.id || ""));
    saved.observations = (Array.isArray(saved.observations) ? saved.observations : []).map(normalizeObservation);
    const savedQuickItems = saved.observationQuickItems && typeof saved.observationQuickItems === "object" ? saved.observationQuickItems : {};
    saved.observationQuickItems = Object.fromEntries(OBSERVATION_CATEGORIES.map((category) => [category,
      Array.isArray(savedQuickItems[category]) ? [...new Set(savedQuickItems[category].filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim().slice(0, 30)))] : [...DEFAULT_OBSERVATION_QUICK_ITEMS[category]]
    ]));
    saved.rankingVisibility = Object.fromEntries(RANKING_TYPES.map((ranking) => [ranking.id, saved.rankingVisibility?.[ranking.id] !== false]));
    saved.weeklyTimetable = Object.fromEntries(TIMETABLE_DAYS.map((day) => [day.key, Array.from({ length: Math.max(6, Array.isArray(saved.weeklyTimetable?.[day.key]) ? saved.weeklyTimetable[day.key].length : 0) }, (_, index) => String(saved.weeklyTimetable?.[day.key]?.[index] || "").slice(0, 40))]));
    saved.dateTimetableOverrides = saved.dateTimetableOverrides && typeof saved.dateTimetableOverrides === "object" && !Array.isArray(saved.dateTimetableOverrides) ? Object.fromEntries(Object.entries(saved.dateTimetableOverrides).filter(([date, periods]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Array.isArray(periods)).map(([date, periods]) => [date, periods.map((period) => String(period || "").slice(0, 40))])) : {};
    saved.dailyClassNotes = saved.dailyClassNotes && typeof saved.dailyClassNotes === "object" && !Array.isArray(saved.dailyClassNotes) ? Object.fromEntries(Object.entries(saved.dailyClassNotes).filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)).map(([date, note]) => [date, { text: String(typeof note === "string" ? note : note?.text || "").slice(0, 2000), updatedAt: typeof note === "object" ? note.updatedAt || "" : "" }])) : {};
    saved.classEvents = (Array.isArray(saved.classEvents) ? saved.classEvents : []).filter((event) => event && /^\d{4}-\d{2}-\d{2}$/.test(String(event.date || "")) && String(event.title || "").trim()).map((event) => ({ id: String(event.id || crypto.randomUUID()), date: String(event.date), title: String(event.title).trim().slice(0, 100), description: String(event.description || "").trim().slice(0, 500), category: ["학급행사", "학교행사", "준비물·안내", "기타"].includes(event.category) ? event.category : "기타", createdAt: String(event.createdAt || new Date().toISOString()), updatedAt: String(event.updatedAt || event.createdAt || new Date().toISOString()) }));
    saved.pointShopItems = (Array.isArray(saved.pointShopItems) ? saved.pointShopItems : []).filter((item) => item && String(item.name || "").trim()).map((item) => ({ id: String(item.id || crypto.randomUUID()), name: String(item.name).trim().slice(0, 80), description: String(item.description || "").trim().slice(0, 300), price: Math.max(0, Number.isInteger(Number(item.price)) ? Number(item.price) : 0), dailyStock: Math.max(1, Number.isInteger(Number(item.dailyStock)) ? Number(item.dailyStock) : 1), perStudentDailyLimit: Math.max(1, Number.isInteger(Number(item.perStudentDailyLimit)) ? Number(item.perStudentDailyLimit) : 1), approvalRequired: item.approvalRequired !== false, active: item.active !== false, deleted: Boolean(item.deleted), createdAt: String(item.createdAt || new Date().toISOString()), updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString()) }));
    saved.pointUseRequests = (Array.isArray(saved.pointUseRequests) ? saved.pointUseRequests : []).filter((request) => request && /^\d{4}-\d{2}-\d{2}$/.test(String(request.date || "")) && ["pending", "completed", "rejected", "reversed"].includes(request.status)).map((request) => ({ id: String(request.id || crypto.randomUUID()), itemId: String(request.itemId || ""), itemName: String(request.itemName || ""), studentId: String(request.studentId || ""), date: String(request.date), price: Math.max(0, Number(request.price) || 0), status: request.status, createdAt: String(request.createdAt || new Date().toISOString()), resolvedAt: request.resolvedAt ? String(request.resolvedAt) : null, reversedAt: request.reversedAt ? String(request.reversedAt) : null, reversedBy: String(request.reversedBy || ""), reversalHistoryId: String(request.reversalHistoryId || ""), originalHistoryId: String(request.originalHistoryId || "") }));
    saved.pointShopSets = (Array.isArray(saved.pointShopSets) ? saved.pointShopSets : []).filter((set) => set && String(set.name || "").trim() && Array.isArray(set.items)).map((set) => ({ id: String(set.id || crypto.randomUUID()), name: String(set.name).trim().slice(0, 60), items: set.items.filter((item) => item && String(item.name || "").trim()).map((item) => ({ name: String(item.name).trim().slice(0, 80), description: String(item.description || "").trim().slice(0, 300), price: Math.max(0, Number.isInteger(Number(item.price)) ? Number(item.price) : 0), dailyStock: Math.max(1, Number.isInteger(Number(item.dailyStock)) ? Number(item.dailyStock) : 1), perStudentDailyLimit: Math.max(1, Number.isInteger(Number(item.perStudentDailyLimit)) ? Number(item.perStudentDailyLimit) : 1), approvalRequired: item.approvalRequired !== false, active: item.active !== false })), createdAt: String(set.createdAt || new Date().toISOString()), updatedAt: String(set.updatedAt || set.createdAt || new Date().toISOString()) }));
    const transferSettings = saved.pointTransferSettings && typeof saved.pointTransferSettings === "object" ? saved.pointTransferSettings : {};
    saved.pointTransferSettings = { enabled: transferSettings.enabled !== false, maxPerTransfer: Math.max(1, Number.isInteger(Number(transferSettings.maxPerTransfer)) ? Number(transferSettings.maxPerTransfer) : 10), dailyMaxAmount: Math.max(1, Number.isInteger(Number(transferSettings.dailyMaxAmount)) ? Number(transferSettings.dailyMaxAmount) : 20), dailyMaxCount: Math.max(1, Number.isInteger(Number(transferSettings.dailyMaxCount)) ? Number(transferSettings.dailyMaxCount) : 3) };
    saved.pointTransfers = (Array.isArray(saved.pointTransfers) ? saved.pointTransfers : []).filter((transfer) => transfer && /^\d{4}-\d{2}-\d{2}$/.test(String(transfer.date || "")) && String(transfer.fromStudentId || "") && String(transfer.toStudentId || "") && Number.isInteger(Number(transfer.amount)) && Number(transfer.amount) > 0).map((transfer) => ({ id: String(transfer.id || crypto.randomUUID()), fromStudentId: String(transfer.fromStudentId), toStudentId: String(transfer.toStudentId), amount: Number(transfer.amount), date: String(transfer.date), createdAt: String(transfer.createdAt || new Date().toISOString()) }));
    saved.roleApplications = (Array.isArray(saved.roleApplications) ? saved.roleApplications : []).map((application) => ({ ...application, appliedAt: application.appliedAt || application.createdAt || application.completedAt || "" }));
    const savedRoleLimit = Number(saved.dailyRoleApplicationLimit); saved.dailyRoleApplicationLimit = Number.isInteger(savedRoleLimit) && savedRoleLimit >= 1 && savedRoleLimit <= 5 ? savedRoleLimit : 1;
    saved.roleApplicationOpenTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(saved.roleApplicationOpenTime || "")) ? String(saved.roleApplicationOpenTime) : "";
    const savedGroups = Array.isArray(saved.groups) ? saved.groups : DEFAULT_GROUPS();
    saved.groups = savedGroups.map(normalizeGroup);
    if (saved.groups.filter((group) => group.active).length < 2) DEFAULT_GROUPS().slice(0, 2).forEach((fallback) => { if (!saved.groups.some((group) => group.id === fallback.id)) saved.groups.push(fallback); else saved.groups.find((group) => group.id === fallback.id).active = true; });
    saved.groupAssignments = normalizeGroupAssignments(saved.groupAssignments, saved.students, saved.groups);
    saved.groupScoreTransactions = (Array.isArray(saved.groupScoreTransactions) ? saved.groupScoreTransactions : []).map(normalizeGroupScoreTransaction);
    saved.classMissions = (Array.isArray(saved.classMissions) ? saved.classMissions : DEFAULT_CLASS_MISSIONS).map(normalizeClassMission);
    return saved;
  }
  catch { return createDemoData(); }
}

let data = loadData();
let session = { mode: "welcome", studentId: null, view: "home" };
let teacherCardSetId = data.activeCardSetIds[0] || data.cardSets.find((cardSet) => !cardSet.deleted)?.id || "";
let collectionCardSetFilter = "all";
let editingTemplateId = null;
let assignmentFilter = "all";
let assignmentSubjectFilter = "";
let assignmentSearch = "";
let expandedAssignmentId = "";
const assignmentStudentStatusFilters = {};
let completedAssignmentFilters = { search: "", subject: "", from: "", to: "" };
let assignmentStudentView = "";
let showAllCompletedAssignments = false;
let showAllStudentCompletedAssignments = false;
let studentAssignmentFilter = "todo";
let showAllStudentPoints = false;
let observationFilters = { studentId: "", category: "", keyword: "" };
let classStudentSearch = "";
let rankingPeriod = "week";
let dashboardSelectedDate = todayString();
let dashboardMonth = dashboardSelectedDate.slice(0, 7);
let studentManagementSearch = "";
let studentDetailId = "";
let teacherStudentPointPollTimer = null;
let teacherStudentPointPollStudentId = "";
const teacherStudentPointRefreshes = new Map();
const teacherStudentCardData = new Map();
let teacherStudentRepresentativeCards = new Map();
let teacherStudentRepresentativeCardsClassKey = "";
let teacherStudentRepresentativeCardsLoaded = false;
let teacherStudentRepresentativeCardsLoading = null;
let teacherStudentRepresentativeCardsListActive = false;
let teacherStudentRepresentativeCardsPollTimer = null;
const TEACHER_STUDENT_POINT_POLL_INTERVAL = 5000;
const TEACHER_STUDENT_REPRESENTATIVE_CARDS_POLL_INTERVAL = 5000;
const studentDetailAssignmentFilters = {};
let showAllGroupTransactions = false;
let selectedGroupId = "";
let selectedGroupAssignmentStudentIds = new Set();
let pendingGroupNames = {};
const assignmentSelections = {};
const selectedPointStudentIds = new Set();
let toastTimer;
let pendingCardImageData = "";
let pendingCardImagePath = "";
let pendingCardImageDeleted = false;
let pendingBackupPayload = null;
let firebaseTeacherUser = null;
let firebaseTeacherSession = false;
let firebaseStudentAuthUser = null;
let firebaseVerifiedStudentSession = null;
let firebaseStudentAuthReady = false;
let firebaseStudentSigningIn = false;
let firebaseStudentHomeData = null;
let firebaseStudentHomeLoading = false;
let firebaseStudentHomeError = false;
let firebaseStudentAssignmentMutating = false;
let firebaseStudentRoleMutating = false;
let firebaseAuthPending = true;
let firebaseAuthFallbackTimer;
let firebaseClassChecked = false;
let firebaseActiveClassId = "";
let firebaseClassLoadFailed = false;
let firebaseStudentsChecked = false;
let firebaseStudentsConnected = false;
let firebaseStudentsLoadFailed = false;
let firebaseStudentAccountCreating = false;
let firebaseStudentAccountStatuses = {};
let firebaseStudentAccountStatusesLoaded = false;
let firebaseStudentAccountStatusesLoading = false;
let firebaseStudentAccountStatusesLoadFailed = false;
let firebaseStudentPasswordResetting = false;
let firebaseBulkStudentAccountsCreating = false;
let firebaseStudentActivityResetting = false;
let pendingStudentExcelRows = [];
let pendingStudentExcelFileName = "";
let firebaseLoadedCloudStudents = [];
let firebaseAssignmentsChecked = false;
let firebaseAssignmentsConnected = false;
let firebaseAssignmentsLoadFailed = false;
let firebaseAssignmentStudentStatesConnected = false;
let firebaseAssignmentStudentStatesConnecting = false;
let firebasePointsChecked = false;
let firebasePointsConnected = false;
let firebasePointsLoadFailed = false;
let firebaseRolesConnected = false;
let firebaseRolesConnecting = false;
let firebaseObservationsConnected = false;
let firebaseObservationsConnecting = false;
let firebaseGroupsConnected = false;
let firebaseGroupsConnecting = false;
let firebaseGroupsLoadReady = false;
let firebaseGroupAssignmentsSaving = false;
let firebaseGroupScoreMutating = false;
let firebaseGroupConfigurationSaving = false;
let firebaseClassMissionSaving = false;
let firebaseObservationMutating = false;
let firebaseObservationSettingsSaving = false;
let firebaseRoleConfigurationSaving = false;
let firebaseRoleDailyUsageReady = false;
let firebaseRoleDailyUsageInitializing = false;
let firebaseRoleDailyUsageDate = "";
let firebaseRoleApplicationMutating = false;
let pointMutationQueue = Promise.resolve();
const app = document.querySelector("#app");

function todayString() { return new Date().toLocaleDateString("sv-SE"); }
function dateWithOffset(offset) { const date = new Date(); date.setDate(date.getDate() + offset); return date.toLocaleDateString("sv-SE"); }

function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function saveLocalCloudConnection(classId, pointsConnected) { data.cloudConnection = { classId: String(classId || ""), pointsConnected: pointsConnected === true }; saveData(); }
function createBackupPayload() { return { type: "our-class-quest-backup", version: 1, exportedAt: new Date().toISOString(), appName: data.classSettings?.appName || "우리반 퀘스트", className: data.classSettings?.className || "우리 반", data: structuredClone(data) }; }
function safeBackupFilenamePart(value) { return String(value || "우리반").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "").slice(0, 40) || "우리반"; }
function downloadBackup() { const payload = createBackupPayload(); const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `우리반퀘스트_${safeBackupFilenamePart(payload.className)}_${todayString()}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast("백업 파일 다운로드를 시작했습니다."); }
function validateBackup(value) { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("올바른 백업 파일이 아닙니다."); if (value.type !== "our-class-quest-backup" || !value.data || typeof value.data !== "object" || Array.isArray(value.data)) throw new Error("우리반 퀘스트 백업 파일만 복원할 수 있습니다."); if (!Array.isArray(value.data.students) || !value.data.classSettings || typeof value.data.classSettings !== "object" || Array.isArray(value.data.classSettings)) throw new Error("백업 파일에 필수 학급 데이터가 없습니다."); return value; }
function restoreBackup(payload) {
  const previousRaw = localStorage.getItem(STORAGE_KEY); const previousData = data;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.data)); const restored = loadData(); if (!restored || !Array.isArray(restored.students) || !restored.classSettings) throw new Error("복원 데이터를 읽지 못했습니다."); data = restored; saveData(); teacherCardSetId = data.activeCardSetIds[0] || data.cardSets.find((item) => !item.deleted)?.id || ""; collectionCardSetFilter = "all"; selectedPointStudentIds.clear(); session = { mode: "teacher", studentId: null, view: "class-settings" }; pendingBackupPayload = null; render(); toast("백업 데이터를 복원했습니다."); }
  catch { try { if (previousRaw === null) localStorage.removeItem(STORAGE_KEY); else localStorage.setItem(STORAGE_KEY, previousRaw); } catch {} data = previousData; render(); toast("백업 복원에 실패했습니다. 기존 데이터는 유지되었습니다."); }
}
function studentById(id) { return data.students.find((student) => student.id === id); }
function activeStudents() { return data.students.filter((student) => student.active !== false).sort((first, second) => studentNumber(first) - studentNumber(second) || first.name.localeCompare(second.name, "ko")); }
function roleById(id) { return data.currentRoles.find((role) => role.id === id); }
function currentStudent() { return studentById(session.studentId); }
function cardInventory(student, cardId) { return student.cards[cardId] || {}; }
function abilityInventory(student, cardId, rarity) { return cardInventory(student, cardId)[rarity] || {}; }
function cardAbilities(includeDeleted = true) { const abilities = Array.isArray(data.cardAbilities) ? data.cardAbilities : CARD_ABILITIES; return includeDeleted ? abilities : abilities.filter((ability) => ability.active && !ability.deleted); }
function rarityInventoryCount(student, cardId, rarity) { return cardAbilities().reduce((sum, ability) => sum + (Number(abilityInventory(student, cardId, rarity)[ability.id]) || 0), 0); }
function cardInventoryCount(student, cardId) { return CARD_RARITIES.reduce((sum, rarity) => sum + rarityInventoryCount(student, cardId, rarity), 0); }
function cardCount(student) { return Object.keys(student.cards).reduce((sum, cardId) => sum + cardInventoryCount(student, cardId), 0); }
function cardSetById(id) { return data.cardSets.find((cardSet) => cardSet.id === id); }
function usableCardSets() { return data.cardSets.filter((cardSet) => cardSet.active && !cardSet.deleted); }
function normalizeActiveCardSets() { data.activeCardSetIds = [...new Set(data.activeCardSetIds || [])].filter((id) => usableCardSets().some((cardSet) => cardSet.id === id)); }
function drawRate(rarity, rates) { return Number(rates?.[CARD_RATE_KEYS[rarity]]) || 0; }
function upgradeStepFrom(rarity) { return CARD_UPGRADE_STEPS.find((step) => step.from === rarity); }
function upgradeRequired(rarity) { const step = upgradeStepFrom(rarity); return step ? data.cardUpgradeSettings[step.key] : null; }
function cardAbilitySetting(rarity) { return data.cardAbilitySettings?.[rarity] || DEFAULT_CARD_ABILITY_SETTINGS[rarity]; }
function cardAbilityById(id) { return cardAbilities().find((ability) => ability.id === id); }
function abilityPercent(rarity, abilityId, originalSource) { const ability = cardAbilityById(abilityId); const setting = cardAbilitySetting(rarity).abilities?.[abilityId]; if (originalSource === "과제") return ability?.targets?.assignments ? Number(setting?.assignmentPercent) || 0 : 0; return ability?.targets?.roles ? Number(setting?.rolePercent) || 0 : 0; }
function abilitySummary(rarity, abilityId) { const ability = cardAbilityById(abilityId); const setting = cardAbilitySetting(rarity).abilities?.[abilityId] || {}; const assignment = ability?.targets?.assignments ? Number(setting.assignmentPercent) || 0 : 0; const role = ability?.targets?.roles ? Number(setting.rolePercent) || 0 : 0; const effect = assignment && role ? `과제 +${assignment}% · 1인1역 +${role}%` : assignment ? `과제 +${assignment}%` : role ? `1인1역 +${role}%` : "보너스 없음"; return `${ability?.icon || "✨"} ${ability?.name || "특수능력"} · ${effect}`; }
function randomAbilityId() { const abilities = cardAbilities(false); if (!abilities.length) return null; const total = abilities.reduce((sum, ability) => sum + ability.weight, 0); let value = Math.random() * total; for (const ability of abilities) { value -= ability.weight; if (value < 0) return ability.id; } return abilities[0].id; }
function representativeCardInfo(student) {
  const equipped = student?.representativeCard; if (!equipped || !CARD_RARITIES.includes(equipped.rarity)) return null;
  const card = data.cards.find((item) => item.id === equipped.cardId); if (!card || Number(abilityInventory(student, card.id, equipped.rarity)[equipped.abilityId]) < 1) return null;
  return { card, rarity: equipped.rarity, abilityId: equipped.abilityId, ability: cardAbilityById(equipped.abilityId), setting: cardAbilitySetting(equipped.rarity) };
}
function historyDateKey(value) { const parts = String(value || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/); return parts ? `${parts[1]}-${parts[2].padStart(2, "0")}-${parts[3].padStart(2, "0")}` : ""; }
function todayCardBonus(student) { return (student.pointHistory || []).reduce((sum, item) => sum + (item.source === "카드 능력 보너스" && historyDateKey(item.date) === todayString() ? Number(item.amount) || 0 : 0), 0); }
function pointHistoryEntries(value) { return (Array.isArray(value) ? value : [value]).filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)).map((entry) => ({ ...entry, id: entry.id || crypto.randomUUID(), createdAt: entry.createdAt || new Date().toISOString() })); }
let pointChangeFailureReason = "";
function cloudPointMutationUnavailable() {
  const localConnection = data.cloudConnection;
  if (localConnection?.pointsConnected !== true) return false;
  const currentUser = window.ourClassFirebase?.getCurrentUser?.();
  return !window.ourClassFirebase?.ready || !firebaseActiveClassId || firebaseActiveClassId !== localConnection.classId || !firebasePointsConnected || !firebaseTeacherUser?.uid || currentUser?.uid !== firebaseTeacherUser.uid;
}
function enqueuePointMutations(mutations) {
  if (!firebasePointsConnected || !mutations.length) return;
  const queued = structuredClone(mutations); const userUid = firebaseTeacherUser?.uid;
  pointMutationQueue = pointMutationQueue.catch(() => {}).then(async () => {
    try { await window.ourClassFirebase.applyPointMutations(queued); }
    catch (error) {
      console.error("Firestore point mutation failed", { code: error?.code, message: error?.message, details: error?.details, mutations: queued }, error);
      const assignmentConflict = queued.some((mutation) => mutation.assignmentStudentState) && ["assignment/status-conflict", "assignment/award-conflict", "point/conflict"].includes(error?.code);
      const roleConflict = queued.some((mutation) => mutation.dailyRoleAssignment) && ["role/status-conflict", "role/award-conflict", "point/conflict"].includes(error?.code);
      if (roleConflict) {
        const [pointsLoaded, rolesLoaded] = await Promise.all([loadFirebasePoints(userUid, false), loadFirebaseRoleApplications(userUid, false)]);
        if (firebaseTeacherUser?.uid === userUid && pointsLoaded && rolesLoaded) { saveData(); render(); toast("다른 화면에서 역할 상태가 변경되어 최신 상태를 다시 불러왔습니다."); }
        else toast("최신 역할 상태를 다시 불러오지 못했습니다. 연결을 확인해 주세요.");
      }
      else if (assignmentConflict) {
        const [pointsLoaded, statesLoaded] = await Promise.all([loadFirebasePoints(userUid, false), loadFirebaseAssignmentStudentStates(userUid, false)]);
        if (firebaseTeacherUser?.uid === userUid && pointsLoaded && statesLoaded) { saveData(); render(); toast("다른 화면에서 과제 상태가 변경되어 최신 상태를 다시 불러왔습니다."); }
        else toast("최신 과제 상태를 다시 불러오지 못했습니다. 연결을 확인해 주세요.");
      }
      else if (error?.code === "point/conflict") { toast("다른 화면에서 포인트가 변경되어 최신 값을 다시 불러왔습니다."); await loadFirebasePoints(userUid); }
      else toast("클라우드 포인트 저장에 실패했습니다. 로컬 데이터는 유지됩니다.");
    }
  });
}
function applyStudentPointChanges(changes) {
  pointChangeFailureReason = "";
  if (!Array.isArray(changes) || !changes.length) return false;
  const prepared = changes.map((change) => { const student = change?.student; const balanceDelta = change?.balanceDelta; const currentPoints = Number(student?.points); const assignment = change?.assignment; const assignmentStudentState = change?.assignmentStudentState; const roleApplication = change?.roleApplication; const dailyRoleAssignment = change?.dailyRoleAssignment; return { student, balanceDelta, currentPoints, historyEntries: pointHistoryEntries(change?.historyEntries || []), assignment, assignmentStudentState, roleApplication, dailyRoleAssignment }; });
  if (prepared.some(({ student, balanceDelta, currentPoints }) => !student || typeof student !== "object" || !Number.isInteger(balanceDelta) || !Number.isInteger(currentPoints) || currentPoints + balanceDelta < 0)) return false;
  if (prepared.some(({ assignment, assignmentStudentState }) => assignmentStudentState && (!assignment || typeof assignment !== "object" || !ASSIGNMENT_STATUSES.includes(assignmentStudentState.expectedStatus) || !ASSIGNMENT_STATUSES.includes(assignmentStudentState.status)))) return false;
  if (prepared.some(({ roleApplication, dailyRoleAssignment }) => dailyRoleAssignment && (!roleApplication || typeof roleApplication !== "object" || roleApplication.id !== dailyRoleAssignment.id || !["waiting", "completed", "cancelled"].includes(dailyRoleAssignment.expectedStatus) || !["waiting", "completed", "cancelled"].includes(dailyRoleAssignment.status)))) return false;
  const cloudMutations = prepared.map(({ student, balanceDelta, currentPoints, historyEntries, assignmentStudentState, dailyRoleAssignment }) => ({ studentId: student.id, expectedPoints: currentPoints, balanceDelta, historyEntries, ...(firebaseAssignmentStudentStatesConnected && assignmentStudentState ? { assignmentStudentState } : {}), ...(firebaseRolesConnected && dailyRoleAssignment ? { dailyRoleAssignment } : {}) })).filter((mutation) => mutation.balanceDelta !== 0 || mutation.historyEntries.length || mutation.assignmentStudentState || mutation.dailyRoleAssignment);
  if (cloudMutations.length && cloudPointMutationUnavailable()) { pointChangeFailureReason = "cloud-unavailable"; toast("클라우드 연결을 확인한 후 다시 시도해주세요."); return false; }
  prepared.forEach(({ student, balanceDelta, currentPoints, historyEntries, assignment, assignmentStudentState, roleApplication, dailyRoleAssignment }) => {
    if (!Array.isArray(student.pointHistory)) student.pointHistory = [];
    student.points = currentPoints + balanceDelta;
    student.pointHistory.push(...historyEntries);
    if (assignmentStudentState) {
      if (!assignment.pointAwards || typeof assignment.pointAwards !== "object" || Array.isArray(assignment.pointAwards)) assignment.pointAwards = {};
      setAssignmentStatusForStudent(assignment, assignmentStudentState.studentId, assignmentStudentState.status);
      if (Object.keys(assignmentStudentState.pointAward).length) assignment.pointAwards[assignmentStudentState.studentId] = structuredClone(assignmentStudentState.pointAward); else delete assignment.pointAwards[assignmentStudentState.studentId];
      refreshAssignmentCompletion(assignment);
    }
    if (dailyRoleAssignment) Object.assign(roleApplication, { status: dailyRoleAssignment.status, pointAward: structuredClone(dailyRoleAssignment.pointAward), date: dailyRoleAssignment.date, studentId: dailyRoleAssignment.studentId, roleId: dailyRoleAssignment.roleId, roleSnapshot: structuredClone(dailyRoleAssignment.roleSnapshot), appliedAt: dailyRoleAssignment.appliedAt, completedAt: dailyRoleAssignment.completedAt, cancelledAt: dailyRoleAssignment.cancelledAt, cancelledBy: dailyRoleAssignment.cancelledBy });
  });
  enqueuePointMutations(cloudMutations);
  return true;
}
function applyStudentPointChange(student, balanceDelta, historyEntries = [], options = {}) { return applyStudentPointChanges([{ student, balanceDelta, historyEntries, assignment: options.assignment, assignmentStudentState: options.assignmentStudentState, roleApplication: options.roleApplication, dailyRoleAssignment: options.dailyRoleAssignment }]); }
function cardBonusAward(student, baseAmount, originalSource, relatedId) {
  const representative = representativeCardInfo(student); if (!representative || !representative.ability?.active || representative.ability?.deleted || baseAmount <= 0) return { amount: 0 };
  const percent = abilityPercent(representative.rarity, representative.abilityId, originalSource); const cap = Number(representative.setting.dailyCap) || 0;
  const amount = Math.max(0, Math.min(Math.round(baseAmount * percent / 100), Math.max(0, cap - todayCardBonus(student))));
  const snapshot = { amount, cardId: representative.card.id, cardName: representative.card.name, rarity: representative.rarity, abilityId: representative.abilityId, abilityName: representative.ability?.name, bonusPercent: percent, dailyCap: cap, originalSource, baseAmount, relatedId };
  return { ...snapshot, historyEntry: amount > 0 ? { id: crypto.randomUUID(), amount, reason: `${representative.card.name} ${representative.ability?.name} 카드 능력 보너스`, source: "카드 능력 보너스", studentId: student.id, representativeCardId: representative.card.id, representativeCardName: representative.card.name, representativeCardRarity: representative.rarity, representativeCardAbilityId: representative.abilityId, representativeCardAbilityName: representative.ability?.name, originalSource, baseAmount, bonusPercent: percent, bonusAmount: amount, relatedId, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() } : null };
}
function reverseCardBonus(student, snapshot, reason) {
  const amount = Number(snapshot?.amount) || 0; if (amount <= 0) return;
  return { id: crypto.randomUUID(), amount: -amount, reason, source: "카드 능력 보너스", studentId: student.id, representativeCardId: snapshot.cardId, representativeCardName: snapshot.cardName, representativeCardRarity: snapshot.rarity, representativeCardAbilityId: snapshot.abilityId, representativeCardAbilityName: snapshot.abilityName, originalSource: snapshot.originalSource, baseAmount: snapshot.baseAmount, bonusPercent: snapshot.bonusPercent, bonusAmount: -amount, relatedId: snapshot.relatedId, reversal: true, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() };
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function cardImageSource(card) { return String(card?.imageUrl || card?.imageData || ""); }
function cardImageMarkup(card, className = "card-person-image") { const source = cardImageSource(card); return source ? `<img class="${className}" src="${escapeHtml(source)}" alt="${escapeHtml(card.name)}" loading="lazy">` : `<span class="${className} card-image-placeholder" aria-hidden="true">★</span>`; }
function loadImageFile(file) { return new Promise((resolve, reject) => { const image = new Image(); const url = URL.createObjectURL(file); image.onload = () => { URL.revokeObjectURL(url); resolve(image); }; image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이미지를 읽을 수 없습니다.")); }; image.src = url; }); }
async function compressCardImage(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("JPG, PNG, WebP 이미지만 업로드할 수 있습니다.");
  if (file.size > 15 * 1024 * 1024) throw new Error("이미지 파일이 너무 큽니다. 15MB 이하 파일을 선택해 주세요.");
  const image = await loadImageFile(file); const longest = Math.max(image.naturalWidth, image.naturalHeight); if (!longest) throw new Error("이미지 크기를 확인할 수 없습니다.");
  const scale = Math.min(1, 800 / longest); const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d"); if (!context) throw new Error("이 브라우저에서는 이미지를 처리할 수 없습니다."); context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let result = canvas.toDataURL("image/webp", .78); if (!result.startsWith("data:image/webp")) result = canvas.toDataURL("image/jpeg", .78);
  if (result.length > 1.5 * 1024 * 1024) throw new Error("압축 후에도 이미지가 너무 큽니다. 더 작은 이미지를 선택해 주세요."); return result;
}
async function openCardImageCrop(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("JPG, PNG, WebP 이미지만 업로드할 수 있습니다.");
  if (file.size > 15 * 1024 * 1024) throw new Error("이미지 파일이 너무 큽니다. 15MB 이하 파일을 선택해 주세요.");
  const bitmap = typeof createImageBitmap === "function" ? await createImageBitmap(file, {imageOrientation: "from-image"}) : await loadImageFile(file);
  const width = bitmap.width || bitmap.naturalWidth; const height = bitmap.height || bitmap.naturalHeight; if (!width || !height) throw new Error("이미지 크기를 확인할 수 없습니다.");
  app.insertAdjacentHTML("beforeend", `<div class="modal card-crop-modal"><section class="modal-card"><div class="section-heading"><div><h2>카드 이미지 자르기</h2><p class="muted">학생 카드의 실제 4:5 이미지 영역에 맞춰 조정하세요.</p></div><button class="icon-button" type="button" data-action="cancel-card-image-crop" aria-label="자르기 취소">×</button></div><div class="card-crop-stage"><canvas id="card-crop-canvas" width="800" height="1000" aria-label="카드 이미지 자르기 미리보기"></canvas><img src="assets/card-ui/초록빛_황금_장식_카드_프레임.png" alt="카드 프레임 미리보기"></div><div class="card-crop-toolbar"><button class="button secondary compact" type="button" data-action="card-crop-zoom-out" aria-label="축소">−</button><input id="card-crop-scale" type="range" step="0.01" aria-label="이미지 확대 축소"><button class="button secondary compact" type="button" data-action="card-crop-zoom-in" aria-label="확대">＋</button><button class="button secondary compact" type="button" data-action="card-crop-fit">이미지 전체 맞춤</button><button class="button secondary compact" type="button" data-action="card-crop-reset">초기화</button></div><p class="muted">이미지를 마우스나 손가락으로 움직여 위치를 맞추세요. 빈 영역은 투명하게 저장됩니다.</p><div class="button-row"><button class="button success" type="button" data-action="apply-card-image-crop">적용</button><button class="button secondary" type="button" data-action="cancel-card-image-crop">취소</button></div></section></div>`);
  const modal = document.querySelector(".card-crop-modal:last-of-type"); const canvas = modal?.querySelector("#card-crop-canvas"); const slider = modal?.querySelector("#card-crop-scale"); const context = canvas?.getContext("2d"); if (!modal || !canvas || !slider || !context) throw new Error("이미지 편집 화면을 열 수 없습니다.");
  const state = {scale: 1, x: 0, y: 0, dragging: false, px: 0, py: 0}; const baseScale = Math.max(800 / width, 1000 / height); const fitScale = Math.min(800 / width, 1000 / height); const fitRatio = fitScale / baseScale; const minimumScale = Math.max(.02, fitRatio * .4); slider.min = String(minimumScale); slider.max = "3"; slider.value = "1";
  const clamp = () => { const drawnWidth = width * baseScale * state.scale; const drawnHeight = height * baseScale * state.scale; const limitX = Math.abs(800 - drawnWidth) / 2; const limitY = Math.abs(1000 - drawnHeight) / 2; state.x = Math.max(-limitX, Math.min(limitX, state.x)); state.y = Math.max(-limitY, Math.min(limitY, state.y)); };
  const draw = () => { clamp(); const drawnWidth = width * baseScale * state.scale; const drawnHeight = height * baseScale * state.scale; context.clearRect(0, 0, 800, 1000); context.drawImage(bitmap, (800 - drawnWidth) / 2 + state.x, (1000 - drawnHeight) / 2 + state.y, drawnWidth, drawnHeight); };
  slider.addEventListener("input", () => { state.scale = Number(slider.value) || 1; draw(); });
  canvas.addEventListener("pointerdown", (event) => { state.dragging = true; state.px = event.clientX; state.py = event.clientY; canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener("pointermove", (event) => { if (!state.dragging) return; const rect = canvas.getBoundingClientRect(); state.x += (event.clientX - state.px) * 800 / rect.width; state.y += (event.clientY - state.py) * 1000 / rect.height; state.px = event.clientX; state.py = event.clientY; draw(); });
  canvas.addEventListener("pointerup", () => { state.dragging = false; }); draw();
  return new Promise((resolve) => {
    modal.addEventListener("click", (event) => { const action = event.target.closest?.("[data-action]")?.dataset.action;
      if (action === "card-crop-zoom-out" || action === "card-crop-zoom-in") { state.scale = Math.max(minimumScale, Math.min(3, state.scale + (action.endsWith("in") ? .1 : -.1))); slider.value = String(state.scale); draw(); }
      if (action === "card-crop-fit") { state.scale = fitRatio; state.x = 0; state.y = 0; slider.value = String(state.scale); draw(); }
      if (action === "card-crop-reset") { state.scale = 1; state.x = 0; state.y = 0; slider.value = "1"; draw(); }
      if (action === "cancel-card-image-crop") { bitmap.close?.(); modal.remove(); resolve(""); }
      if (action === "apply-card-image-crop") { const result = canvas.toDataURL("image/webp", .85); bitmap.close?.(); modal.remove(); resolve(result); }
    });
  });
}
function toast(message) { const element = document.querySelector("#toast"); element.textContent = message; element.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove("show"), 2200); }
function firebaseAuthMessage(error) { const code = error?.code || ""; if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "Google 로그인 창이 닫혔습니다."; if (code === "auth/popup-blocked") return "팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요."; if (code === "auth/unauthorized-domain") return "현재 도메인은 Google 로그인 허용 목록에 없습니다."; if (code === "auth/network-request-failed") return "네트워크 연결을 확인한 뒤 다시 시도해 주세요."; return "Google 로그인 중 오류가 발생했습니다."; }
function logFirebaseAuthError(error) { console.error("Firebase Google sign-in error details", { code: error?.code, message: error?.message, name: error?.name, customData: error?.customData }); console.error("Firebase Google sign-in error object", error); }
async function enterFirebaseTeacher() { const client = window.ourClassFirebase; if (!client?.ready) { toast(client?.error ? "Firebase 초기화에 실패했습니다." : "Google 로그인을 준비 중입니다. 잠시 후 다시 시도해 주세요."); return; } try { const user = await client.signInTeacher(); if (!user) return; firebaseTeacherUser = user; firebaseTeacherSession = true; session = { mode: "teacher", studentId: null, view: "dashboard" }; render(); toast(`${user.displayName || user.email || "선생님"} 선생님, 로그인했습니다.`); } catch (error) { logFirebaseAuthError(error); const isLocalDevelopment = location.hostname === "localhost" || location.hostname === "127.0.0.1"; toast(isLocalDevelopment ? `Google 로그인 오류: ${error?.code || "unknown"}` : firebaseAuthMessage(error)); } }
function resetFirebaseStudentState() { firebaseStudentsChecked = false; firebaseStudentsConnected = false; firebaseStudentsLoadFailed = false; firebaseStudentAccountCreating = false; firebaseStudentAccountStatuses = {}; firebaseStudentAccountStatusesLoaded = false; firebaseStudentAccountStatusesLoading = false; firebaseStudentAccountStatusesLoadFailed = false; firebaseStudentPasswordResetting = false; firebaseBulkStudentAccountsCreating = false; clearPendingStudentExcelRows(); firebaseLoadedCloudStudents = []; resetTeacherStudentRepresentativeCards(); }
function resetFirebaseAssignmentState() { firebaseAssignmentsChecked = false; firebaseAssignmentsConnected = false; firebaseAssignmentsLoadFailed = false; firebaseAssignmentStudentStatesConnected = false; firebaseAssignmentStudentStatesConnecting = false; }
function resetFirebasePointState() { firebasePointsChecked = false; firebasePointsConnected = false; firebasePointsLoadFailed = false; pointMutationQueue = Promise.resolve(); }
function resetFirebaseRoleState() { firebaseRolesConnected = false; firebaseRolesConnecting = false; firebaseRoleConfigurationSaving = false; firebaseRoleDailyUsageReady = false; firebaseRoleDailyUsageInitializing = false; firebaseRoleDailyUsageDate = ""; firebaseRoleApplicationMutating = false; }
function resetFirebaseObservationState() { firebaseObservationsConnected = false; firebaseObservationsConnecting = false; firebaseObservationMutating = false; firebaseObservationSettingsSaving = false; }
function resetFirebaseGroupState() { firebaseGroupsConnected = false; firebaseGroupsConnecting = false; firebaseGroupsLoadReady = false; firebaseGroupAssignmentsSaving = false; firebaseGroupScoreMutating = false; firebaseGroupConfigurationSaving = false; firebaseClassMissionSaving = false; }
async function exitFirebaseTeacher() {
  const classId = firebaseActiveClassId;
  try {
    await window.ourClassFirebase.signOutTeacher();
    if (classId) syncFirebaseClassContextInUrl(classId);
    firebaseTeacherSession = false; firebaseTeacherUser = null; firebaseClassChecked = false; firebaseActiveClassId = ""; firebaseClassLoadFailed = false;
    resetFirebaseStudentState(); resetFirebaseAssignmentState(); resetFirebasePointState(); resetFirebaseRoleState(); resetFirebaseObservationState(); resetFirebaseGroupState();
    session = {mode: "welcome", studentId: null, view: "home"};
    history.replaceState({...history.state, mode: "welcome", studentId: null, view: "home", welcomeStudents: false}, "", location.href);
    render();
  } catch (error) { console.error("Firebase sign-out failed", error); toast("Firebase 로그아웃 중 오류가 발생했습니다."); }
}
function resetFirebaseStudentHomeState() { firebaseStudentHomeData = null; firebaseStudentHomeLoading = false; firebaseStudentHomeError = false; firebaseStudentAssignmentMutating = false; firebaseStudentRoleMutating = false; }
async function loadFirebaseStudentHomeData() {
  const userUid = firebaseStudentAuthUser?.uid; const verifiedStudentId = firebaseVerifiedStudentSession?.student?.studentId;
  if (!userUid || !verifiedStudentId || !window.ourClassFirebase?.getStudentHomeData) return false;
  if (firebaseStudentHomeLoading) { session = {mode: "firebase-student", studentId: null, view: "home"}; render(); return false; }
  firebaseStudentHomeLoading = true; firebaseStudentHomeError = false; firebaseStudentHomeData = null;
  session = {mode: "firebase-student", studentId: null, view: "home"}; render();
  try {
    const homeData = await window.ourClassFirebase.getStudentHomeData();
    if (firebaseStudentAuthUser?.uid !== userUid || firebaseVerifiedStudentSession?.student?.studentId !== verifiedStudentId) return false;
    if (!homeData?.ok || homeData.profile?.studentId !== verifiedStudentId) throw new Error("Student home data could not be verified.");
    firebaseStudentHomeData = homeData; firebaseStudentHomeError = false; return true;
  } catch (error) {
    if (firebaseStudentAuthUser?.uid !== userUid) return false;
    console.error("Firebase student home load failed", {code: error?.code, message: error?.message});
    firebaseStudentHomeData = null; firebaseStudentHomeError = true; return false;
  } finally {
    if (firebaseStudentAuthUser?.uid === userUid) { firebaseStudentHomeLoading = false; render(); }
  }
}
window.refreshFirebaseStudentHomeDataQuietly = async function refreshFirebaseStudentHomeDataQuietly() {
  const userUid = firebaseStudentAuthUser?.uid; const verifiedStudentId = firebaseVerifiedStudentSession?.student?.studentId;
  if (!userUid || !verifiedStudentId || !window.ourClassFirebase?.getStudentHomeData) return false;
  try {
    const homeData = await window.ourClassFirebase.getStudentHomeData();
    if (firebaseStudentAuthUser?.uid !== userUid || firebaseVerifiedStudentSession?.student?.studentId !== verifiedStudentId || !homeData?.ok || homeData.profile?.studentId !== verifiedStudentId) return false;
    const changed = JSON.stringify(firebaseStudentHomeData) !== JSON.stringify(homeData);
    firebaseStudentHomeData = homeData; firebaseStudentHomeError = false;
    return changed;
  } catch (error) {
    console.error("Firebase student home quiet refresh failed", {code: error?.code, message: error?.message});
    return false;
  }
};
function firebaseStudentMutationCode(error) { return String(error?.details?.code || error?.code || ""); }
function openCloudAssignmentReviewModal(assignmentId) {
  const assignment = firebaseStudentHomeData?.assignments?.find((item) => item.id === assignmentId && item.status === "missing");
  if (!assignment || firebaseStudentAssignmentMutating) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>과제 확인 요청</h2><p><strong>${escapeHtml(assignment.title)}</strong></p><p>선생님께 제출 확인을 요청하시겠습니까?</p><div class="button-row"><button class="button" type="button" data-action="confirm-cloud-assignment-review" data-id="${escapeHtml(assignment.id)}">확인 요청</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}
async function requestCloudAssignmentReview(assignmentId) {
  if (firebaseStudentAssignmentMutating || !firebaseStudentHomeData?.assignments?.some((item) => item.id === assignmentId && item.status === "missing")) return;
  firebaseStudentAssignmentMutating = true; render();
  try {
    const result = await window.ourClassFirebase.studentRequestAssignmentReview({assignmentId});
    if (!result?.ok || result.assignmentId !== assignmentId || result.status !== "review") throw new Error("Student assignment review response was invalid.");
    await loadFirebaseStudentHomeData(); toast("선생님께 제출 확인을 요청했습니다.");
  } catch (error) {
    const code = firebaseStudentMutationCode(error); await loadFirebaseStudentHomeData();
    if (code === "assignment/already-requested") toast("이미 확인 요청된 과제입니다. 최신 상태를 불러왔습니다.");
    else if (["assignment/not-available", "assignment/disabled"].includes(code)) toast("현재 확인 요청할 수 없는 과제입니다.");
    else { console.error("Firebase student assignment review failed", {code: error?.code, details: error?.details}); toast("확인 요청을 보내지 못했습니다. 다시 시도해 주세요."); }
  } finally { firebaseStudentAssignmentMutating = false; render(); }
}
function openCloudRoleCancelModal(applicationId) {
  const application = firebaseStudentHomeData?.myRoleApplications?.find((item) => item.id === applicationId && item.status === "waiting");
  const role = firebaseStudentHomeData?.roleSettings?.roles?.find((item) => item.id === application?.roleId);
  if (!application || !role || firebaseStudentRoleMutating) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>역할 신청 취소</h2><p><strong>${escapeHtml(role.name)}</strong></p><p>이 역할 신청을 취소하시겠습니까?</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-cloud-role-cancel" data-id="${escapeHtml(application.id)}">신청 취소</button><button class="button secondary" type="button" data-action="close-modal">돌아가기</button></div></section></div>`);
}
async function mutateCloudStudentRole(action, id) {
  if (firebaseStudentRoleMutating) return;
  firebaseStudentRoleMutating = true; render();
  try {
    const result = action === "apply" ? await window.ourClassFirebase.studentApplyRole({roleId: id}) : await window.ourClassFirebase.studentCancelRole({applicationId: id});
    const responseMatches = action === "apply" ? result?.roleId === id && result?.status === "waiting" : result?.applicationId === id && result?.status === "cancelled";
    if (!result?.ok || !responseMatches) throw new Error("Student role mutation response was invalid.");
    await loadFirebaseStudentHomeData(); toast(action === "apply" ? "역할을 신청했습니다." : "역할 신청을 취소했습니다.");
  } catch (error) {
    const code = firebaseStudentMutationCode(error); await loadFirebaseStudentHomeData();
    if (code === "role/limit-reached") toast("오늘 신청할 수 있는 역할 수를 모두 사용했습니다.");
    else if (code === "role/capacity-reached") toast("다른 학생이 먼저 신청해 역할 정원이 찼습니다.");
    else if (code === "role/already-applied") toast("이미 신청한 역할입니다.");
    else if (["role/status-conflict", "role/usage-conflict", "role/usage-missing"].includes(code)) toast("역할 상태가 변경되어 최신 정보를 불러왔습니다.");
    else if (code === "role/not-open-yet") toast("아직 1인1역 신청 시간이 아닙니다.");
    else if (["role/not-found", "role/disabled"].includes(code)) toast("현재 신청할 수 없는 역할입니다.");
    else { console.error("Firebase student role mutation failed", {code: error?.code, details: error?.details}); toast("역할 신청 상태를 변경하지 못했습니다. 다시 시도해 주세요."); }
  } finally { firebaseStudentRoleMutating = false; render(); }
}
function appendCloudStudent(student) { const added = { id: student.id, number: student.number, name: student.name, loginId: student.loginId, active: student.active !== false, points: 0, cards: {}, representativeCard: null, cardUpgradeHistory: [], cardAcquisitionHistory: [], pointHistory: [] }; data.students.push(added); data.assignments.forEach((assignment) => setAssignmentStatusForStudent(assignment, added.id, "missing")); return added; }
async function loadFirebaseStudents(userUid, commit = true) { try { const students = await window.ourClassFirebase.loadStudents(); if (firebaseTeacherUser?.uid !== userUid) return false; firebaseLoadedCloudStudents = students.map((student) => ({ ...student })); firebaseStudentsChecked = true; firebaseStudentsLoadFailed = false; firebaseStudentsConnected = students.length > 0; if (students.length) { const localById = new Map(data.students.map((student) => [student.id, student])); students.sort((first, second) => first.orderIndex - second.orderIndex).forEach((cloudStudent) => { const localStudent = localById.get(cloudStudent.id); if (localStudent) Object.assign(localStudent, { number: cloudStudent.number, name: cloudStudent.name, loginId: cloudStudent.loginId, active: cloudStudent.active !== false }); else appendCloudStudent(cloudStudent); }); } if (commit) { saveData(); render(); } return true; } catch (error) { console.error("Firestore students load failed", error); if (firebaseTeacherUser?.uid !== userUid) return false; firebaseLoadedCloudStudents = []; firebaseStudentsChecked = true; firebaseStudentsLoadFailed = true; firebaseStudentsConnected = false; if (commit && session.view === "class-settings") render(); return false; } }
async function loadFirebaseStudentAccountStatuses(userUid, classId) {
  if (firebaseStudentAccountStatusesLoading || !classId || !window.ourClassFirebase?.getStudentAccountStatuses) return false;
  firebaseStudentAccountStatusesLoading = true; firebaseStudentAccountStatusesLoadFailed = false;
  try {
    const result = await window.ourClassFirebase.getStudentAccountStatuses({ classId });
    if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) return false;
    if (!result.ok) throw new Error("Student account statuses could not be loaded.");
    firebaseStudentAccountStatuses = result.accounts || {}; firebaseStudentAccountStatusesLoaded = true; return true;
  } catch (error) {
    if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) return false;
    firebaseStudentAccountStatuses = {}; firebaseStudentAccountStatusesLoaded = false; firebaseStudentAccountStatusesLoadFailed = true; return false;
  } finally {
    if (firebaseTeacherUser?.uid === userUid && firebaseActiveClassId === classId) firebaseStudentAccountStatusesLoading = false;
  }
}
function mergeFirebaseAssignments(cloudAssignments) {
  const cloudById = new Map(cloudAssignments.map((assignment) => [assignment.id, assignment]));
  const localById = new Map(data.assignments.map((assignment) => [assignment.id, assignment]));
  const archiveById = new Map((Array.isArray(data.localOnlyAssignmentArchive) ? data.localOnlyAssignmentArchive : []).map((assignment) => [assignment.id, assignment]));
  const archivedAt = new Date().toISOString(); let archivedCount = 0;
  data.assignments.filter((assignment) => !cloudById.has(assignment.id)).forEach((assignment) => {
    const existingArchive = archiveById.get(assignment.id);
    archiveById.set(assignment.id, { ...existingArchive, ...assignment, archivedAt: existingArchive?.archivedAt || archivedAt, archiveReason: "missing-from-cloud" });
    archivedCount += 1;
  });
  data.localOnlyAssignmentArchive = [...archiveById.values()];
  data.assignments = cloudAssignments.filter((assignment) => !assignment.deleted).map((cloudAssignment) => {
    const fields = { title: cloudAssignment.title, subject: cloudAssignment.subject, description: cloudAssignment.description, createdAt: cloudAssignment.createdAt, dueDate: cloudAssignment.dueDate, important: cloudAssignment.important, points: cloudAssignment.points, assignmentState: cloudAssignment.assignmentState, completedAt: cloudAssignment.completedAt };
    const localAssignment = localById.get(cloudAssignment.id);
    if (localAssignment) return { ...localAssignment, ...fields, completed: fields.assignmentState === "completed" };
    return { id: cloudAssignment.id, ...fields, completed: fields.assignmentState === "completed", pointAwards: {}, studentStatuses: Object.fromEntries(data.students.map((student) => [student.id, "missing"])) };
  });
  return archivedCount;
}
async function loadFirebaseAssignments(userUid, commit = true) { try { const assignments = await window.ourClassFirebase.loadAssignments(); if (firebaseTeacherUser?.uid !== userUid) return false; const archivedCount = mergeFirebaseAssignments(assignments); firebaseAssignmentsChecked = true; firebaseAssignmentsLoadFailed = false; if (commit) { saveData(); render(); } if (archivedCount) toast(`이 브라우저에만 있던 과제 ${archivedCount}개를 안전하게 별도 보관했습니다.`); return true; } catch (error) { console.error("Firestore assignments load failed", error); if (firebaseTeacherUser?.uid !== userUid) return false; firebaseAssignmentsChecked = true; firebaseAssignmentsLoadFailed = true; if (commit && session.view === "class-settings") render(); return false; } }
function pointHistorySortValue(entry) { const value = entry?.createdAt || entry?.date || ""; const timestamp = Date.parse(value); return Number.isFinite(timestamp) ? timestamp : 0; }
async function loadFirebasePoints(userUid, commit = true) { try { const result = await window.ourClassFirebase.loadPoints(); if (firebaseTeacherUser?.uid !== userUid) return false; const historyByStudent = new Map(); result.history.forEach(({ studentId, entry, cloudCreatedAt }) => { if (!studentId || !entry?.id) return; const normalizedEntry = entry.createdAt || !cloudCreatedAt ? entry : { ...entry, createdAt: cloudCreatedAt }; if (!historyByStudent.has(studentId)) historyByStudent.set(studentId, new Map()); historyByStudent.get(studentId).set(normalizedEntry.id, normalizedEntry); }); const stateByStudent = new Map(result.states.map((state) => [state.id, state])); data.students.forEach((student) => { const state = stateByStudent.get(student.id); if (!state) return; student.points = state.points; student.pointHistory = [...(historyByStudent.get(student.id)?.values() || [])].sort((first, second) => pointHistorySortValue(first) - pointHistorySortValue(second) || String(first.id).localeCompare(String(second.id))); }); firebasePointsChecked = true; firebasePointsLoadFailed = false; if (commit) { saveData(); render(); } return true; } catch (error) { console.error("Firestore points load failed", error); if (firebaseTeacherUser?.uid !== userUid) return false; firebasePointsChecked = true; firebasePointsLoadFailed = true; if (commit && session.view === "class-settings") render(); return false; } }
function mergeFirebaseAssignmentStudentStates(cloudStates) {
  const validStudentIds = new Set(data.students.map((student) => student.id));
  const statesByAssignment = new Map();
  cloudStates.forEach((state) => {
    if (!validStudentIds.has(state.studentId)) return;
    if (!statesByAssignment.has(state.assignmentId)) statesByAssignment.set(state.assignmentId, new Map());
    statesByAssignment.get(state.assignmentId).set(state.studentId, state);
  });
  data.assignments.filter((assignment) => assignment.deleted !== true).forEach((assignment) => {
    if (!assignment.studentStatuses || typeof assignment.studentStatuses !== "object" || Array.isArray(assignment.studentStatuses)) assignment.studentStatuses = {};
    if (!assignment.pointAwards || typeof assignment.pointAwards !== "object" || Array.isArray(assignment.pointAwards)) assignment.pointAwards = {};
    const cloudByStudent = statesByAssignment.get(assignment.id);
    data.students.forEach((student) => {
      const cloudState = cloudByStudent?.get(student.id);
      if (cloudState) { assignment.studentStatuses[student.id] = cloudState.status; assignment.pointAwards[student.id] = structuredClone(cloudState.pointAward); }
      else { assignment.studentStatuses[student.id] = "missing"; delete assignment.pointAwards[student.id]; }
    });
    refreshAssignmentCompletion(assignment);
  });
}
async function loadFirebaseAssignmentStudentStates(userUid, commit = true) { if (!firebaseAssignmentStudentStatesConnected) return false; try { const states = await window.ourClassFirebase.loadAssignmentStudentStates(); if (firebaseTeacherUser?.uid !== userUid) return false; mergeFirebaseAssignmentStudentStates(states); if (commit) { saveData(); render(); } return true; } catch (error) { console.error("Firestore assignment student states load failed", error); if (firebaseTeacherUser?.uid !== userUid) return false; if (commit && session.view === "class-settings") render(); return false; } }
async function loadFirebaseRoles(userUid, commit = true) {
  if (!firebaseRolesConnected) return false;
  try {
    const [settings, templates, applications] = await Promise.all([window.ourClassFirebase.loadRoleSettings(), window.ourClassFirebase.loadRoleTemplates(), window.ourClassFirebase.loadDailyRoleAssignments()]);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    if (!settings) throw new Error("Connected role settings were not found.");
    data.dailyRoleApplicationLimit = settings.dailyRoleApplicationLimit;
    data.roleApplicationOpenTime = settings.roleApplicationOpenTime || "";
    data.currentRoles = settings.currentRoles;
    data.roleTemplates = templates;
    data.roleApplications = applications;
    if (!await ensureFirebaseRoleDailyUsage(userUid, false)) return false;
    if (commit) { saveData(); render(); }
    return true;
  } catch (error) {
    console.error("Firestore roles load failed", error);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    if (commit && session.view === "class-settings") render();
    return false;
  }
}
async function loadFirebaseObservations(userUid, commit = true) {
  if (!firebaseObservationsConnected) return false;
  try {
    const [observations, settings] = await Promise.all([window.ourClassFirebase.loadObservations(), window.ourClassFirebase.loadObservationSettings()]);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    if (!settings) throw new Error("Connected observation settings were not found.");
    data.observations = observations.map(normalizeObservation);
    data.observationQuickItems = structuredClone(settings.quickItems);
    if (commit) { saveData(); render(); }
    return true;
  } catch (error) {
    console.error("Firestore observations load failed", error);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    toast("관찰기록을 클라우드에서 불러오지 못했습니다. 연결을 확인해 주세요.");
    if (commit && session.view === "class-settings") render();
    return false;
  }
}
async function loadFirebaseGroups(userUid, commit = true) {
  if (!firebaseGroupsConnected) return false;
  firebaseGroupsLoadReady = false;
  try {
    const [definitions, scoreStates, transactions, assignments, missions] = await Promise.all([
      window.ourClassFirebase.loadGroupDefinitions(),
      window.ourClassFirebase.loadGroupScoreStates(),
      window.ourClassFirebase.loadGroupScoreTransactions(),
      window.ourClassFirebase.loadGroupAssignments(),
      window.ourClassFirebase.loadClassMissions()
    ]);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    if (!definitions.length) throw new Error("Connected group definitions were not found.");
    const definitionIds = new Set(definitions.map((group) => group.id));
    const scoreByGroupId = new Map();
    scoreStates.forEach((state) => {
      if (!definitionIds.has(state.groupId)) throw new Error(`Orphan group score state: ${state.groupId}`);
      if (scoreByGroupId.has(state.groupId)) throw new Error(`Duplicate group score state: ${state.groupId}`);
      scoreByGroupId.set(state.groupId, state.score);
    });
    const cloudGroups = definitions.map((group, index) => {
      if (!scoreByGroupId.has(group.id)) throw new Error(`Missing group score state: ${group.id}`);
      return normalizeGroup({ ...group, score: scoreByGroupId.get(group.id) }, index);
    });
    const cloudAssignments = normalizeGroupAssignments(assignments, firebaseLoadedCloudStudents, cloudGroups);
    const cloudTransactions = transactions.map(normalizeGroupScoreTransaction);
    const cloudMissions = missions.map(normalizeClassMission);
    data.groups = cloudGroups;
    data.groupScoreTransactions = cloudTransactions;
    data.groupAssignments = cloudAssignments;
    data.classMissions = cloudMissions;
    firebaseGroupsLoadReady = true;
    if (commit) { saveData(); render(); }
    return true;
  } catch (error) {
    console.error("Firestore groups load failed", error);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    firebaseGroupsLoadReady = false;
    toast("모둠활동을 클라우드에서 불러오지 못했습니다. 연결을 확인해 주세요.");
    if (commit && session.view === "class-settings") render();
    return false;
  }
}
async function reloadFirebaseGroupScores(userUid) {
  try {
    const [scoreStates, transactions] = await Promise.all([window.ourClassFirebase.loadGroupScoreStates(), window.ourClassFirebase.loadGroupScoreTransactions()]);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    const groupIds = new Set(data.groups.map((group) => group.id)); const scoreByGroupId = new Map();
    scoreStates.forEach((state) => {
      if (!groupIds.has(state.groupId)) throw new Error(`Orphan group score state: ${state.groupId}`);
      if (scoreByGroupId.has(state.groupId)) throw new Error(`Duplicate group score state: ${state.groupId}`);
      scoreByGroupId.set(state.groupId, state.score);
    });
    if (data.groups.some((group) => !scoreByGroupId.has(group.id))) throw new Error("A group score state is missing.");
    const nextScores = data.groups.map((group) => scoreByGroupId.get(group.id)); const nextTransactions = transactions.map(normalizeGroupScoreTransaction);
    data.groups.forEach((group, index) => { group.score = nextScores[index]; });
    data.groupScoreTransactions = nextTransactions;
    firebaseGroupsLoadReady = true;
    saveData(); render(); return true;
  } catch (error) {
    console.error("Firestore group scores reload failed", error);
    if (firebaseTeacherUser?.uid === userUid) firebaseGroupsLoadReady = false;
    return false;
  }
}
async function loadFirebaseRoleApplications(userUid, commit = true) {
  if (!firebaseRolesConnected) return false;
  try {
    const applications = await window.ourClassFirebase.loadDailyRoleAssignments();
    if (firebaseTeacherUser?.uid !== userUid) return false;
    data.roleApplications = applications;
    if (commit) { saveData(); render(); }
    return true;
  } catch (error) {
    console.error("Firestore role assignments load failed", error);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    return false;
  }
}
async function ensureFirebaseRoleDailyUsage(userUid, commit = true) {
  if (!firebaseRolesConnected || firebaseRoleDailyUsageInitializing) return firebaseRoleDailyUsageReady;
  firebaseRoleDailyUsageInitializing = true; firebaseRoleDailyUsageReady = false; if (commit) render();
  try {
    await window.ourClassFirebase.initializeRoleDailyUsage(todayString());
    if (firebaseTeacherUser?.uid !== userUid) return false;
    firebaseRoleDailyUsageReady = true; firebaseRoleDailyUsageDate = todayString(); return true;
  } catch (error) {
    console.error("Firestore role daily usage initialization failed", error);
    if (firebaseTeacherUser?.uid !== userUid) return false;
    firebaseRoleDailyUsageReady = false; firebaseRoleDailyUsageDate = "";
    if (error?.code === "role/usage-duplicate") toast("오늘의 역할 신청에 중복 기록이 있어 사용량을 초기화하지 못했습니다.");
    else toast("오늘의 역할 신청 사용량을 준비하지 못했습니다. 연결을 확인해 주세요.");
    return false;
  } finally {
    firebaseRoleDailyUsageInitializing = false; if (commit) render();
  }
}
async function reloadFirebaseRoleApplicationsAndUsage(userUid) {
  const applicationsLoaded = await loadFirebaseRoleApplications(userUid, false);
  let usage = await window.ourClassFirebase.loadRoleDailyUsage(todayString()).catch(() => null);
  if (firebaseTeacherUser?.uid !== userUid) return false;
  if (!usage && applicationsLoaded) { firebaseRoleDailyUsageReady = false; firebaseRoleDailyUsageDate = ""; if (await ensureFirebaseRoleDailyUsage(userUid, false)) usage = await window.ourClassFirebase.loadRoleDailyUsage(todayString()).catch(() => null); }
  firebaseRoleDailyUsageReady = Boolean(usage); firebaseRoleDailyUsageDate = usage ? todayString() : "";
  if (!applicationsLoaded || !usage) return false;
  saveData(); render(); return true;
}
async function loadFirebaseClassSettings(userUid) { try { const result = await window.ourClassFirebase.loadTeacherClass(); if (firebaseTeacherUser?.uid !== userUid) return; firebaseClassChecked = true; firebaseClassLoadFailed = false; firebaseActiveClassId = result.activeClassId || ""; firebaseAssignmentsConnected = result.assignmentsConnected === true; firebaseAssignmentStudentStatesConnected = result.assignmentStudentStatesConnected === true; firebasePointsConnected = result.pointsConnected === true; firebaseRolesConnected = result.rolesConnected === true; firebaseObservationsConnected = result.observationsConnected === true; firebaseGroupsConnected = result.groupsConnected === true; firebaseGroupsLoadReady = !firebaseGroupsConnected; if (firebaseActiveClassId) { syncFirebaseClassContextInUrl(firebaseActiveClassId); saveLocalCloudConnection(firebaseActiveClassId, firebasePointsConnected); } if (result.connected && result.classSettings) { data.classSettings = { ...data.classSettings, ...result.classSettings }; const studentsReady = await loadFirebaseStudents(userUid, false); if (studentsReady) { await loadFirebaseStudentAccountStatuses(userUid, firebaseActiveClassId); if (firebaseGroupsConnected) await loadFirebaseGroups(userUid, false); if (firebaseAssignmentsConnected) await loadFirebaseAssignments(userUid, false); if (firebasePointsConnected) await loadFirebasePoints(userUid, false); if (firebaseAssignmentStudentStatesConnected) await loadFirebaseAssignmentStudentStates(userUid, false); if (firebaseRolesConnected) await loadFirebaseRoles(userUid, false); if (firebaseObservationsConnected) await loadFirebaseObservations(userUid, false); } if (firebaseTeacherUser?.uid === userUid) { saveData(); render(); } } else { resetFirebaseStudentState(); resetFirebaseAssignmentState(); resetFirebasePointState(); resetFirebaseRoleState(); resetFirebaseObservationState(); resetFirebaseGroupState(); if (session.view === "class-settings") render(); } } catch (error) { console.error("Firestore class settings load failed", error); if (firebaseTeacherUser?.uid !== userUid) return; firebaseClassChecked = true; firebaseClassLoadFailed = true; firebaseActiveClassId = ""; resetFirebaseStudentState(); resetFirebaseAssignmentState(); resetFirebasePointState(); resetFirebaseRoleState(); resetFirebaseObservationState(); resetFirebaseGroupState(); if (session.view === "class-settings") render(); } }
async function connectCurrentClassToFirebase() { if (!firebaseTeacherSession || !firebaseTeacherUser || !window.ourClassFirebase?.ready) return; if (!confirm("현재 학급의 기본정보를 클라우드 학급으로 연결할까요?")) return; try { const result = await window.ourClassFirebase.connectCurrentClass({ className: data.classSettings.className, teacherName: data.classSettings.teacherName, appName: data.classSettings.appName }); firebaseClassChecked = true; firebaseClassLoadFailed = false; firebaseActiveClassId = result.activeClassId; syncFirebaseClassContextInUrl(firebaseActiveClassId); saveLocalCloudConnection(firebaseActiveClassId, false); firebaseStudentsChecked = true; firebaseStudentsConnected = false; firebaseStudentsLoadFailed = false; resetFirebaseAssignmentState(); resetFirebasePointState(); resetFirebaseRoleState(); resetFirebaseObservationState(); resetFirebaseGroupState(); render(); toast("현재 학급의 기본정보를 클라우드에 연결했습니다."); } catch (error) { console.error("Firestore class connection failed", error); toast("클라우드 학급 연결에 실패했습니다. 로컬 데이터는 유지됩니다."); } }
async function saveFirebaseClassSettings() { if (!firebaseTeacherSession || !firebaseActiveClassId || !window.ourClassFirebase?.ready) return; try { await window.ourClassFirebase.saveClassSettings({ className: data.classSettings.className, teacherName: data.classSettings.teacherName, appName: data.classSettings.appName }); } catch (error) { console.error("Firestore class settings save failed", error); toast("클라우드 저장에 실패했습니다. 로컬에는 저장되었습니다."); } }
async function connectStudentsToFirebase() { if (!firebaseTeacherSession || !firebaseActiveClassId || !firebaseStudentsChecked || firebaseStudentsConnected || firebaseStudentsLoadFailed) return; if (!confirm("현재 브라우저의 학생 명단을 클라우드 학급의 기준 명단으로 등록할까요?")) return; try { await window.ourClassFirebase.uploadInitialStudents(data.students); firebaseStudentsConnected = true; firebaseLoadedCloudStudents = data.students.map((student, orderIndex) => ({ id: student.id, number: student.number, name: student.name, loginId: student.loginId, active: student.active !== false, orderIndex })); render(); toast("학생 명단을 클라우드에 연결했습니다."); } catch (error) { console.error("Firestore initial students upload failed", error); toast("클라우드 저장에 실패했습니다. 로컬에는 저장되었습니다."); } }
async function connectAssignmentsToFirebase() { if (!firebaseTeacherSession || !firebaseActiveClassId || !firebaseStudentsConnected || firebaseAssignmentsConnected) return; if (!confirm("현재 브라우저의 과제 기본정보를\n클라우드 학급의 기준 과제로 등록할까요?")) return; try { await window.ourClassFirebase.connectInitialAssignments(data.assignments); firebaseAssignmentsConnected = true; firebaseAssignmentsChecked = true; firebaseAssignmentsLoadFailed = false; render(); toast("과제 기본정보를 클라우드에 연결했습니다."); } catch (error) { console.error("Firestore initial assignments upload failed", error); toast("클라우드 저장에 실패했습니다. 로컬에는 저장되었습니다."); } }
function ensurePointHistoryIds() { let changed = false; data.students.forEach((student) => { if (!Array.isArray(student.pointHistory)) student.pointHistory = []; student.pointHistory.forEach((entry) => { if (!entry.id) { entry.id = crypto.randomUUID(); changed = true; } }); }); if (changed) saveData(); }
async function connectPointsToFirebase() { if (!firebaseTeacherSession || !firebaseActiveClassId || !firebaseStudentsConnected || firebasePointsConnected) return; if (!confirm("현재 브라우저의 학생 포인트와 포인트 기록을\n클라우드 학급의 기준 데이터로 등록할까요?")) return; ensurePointHistoryIds(); try { await window.ourClassFirebase.connectInitialPoints(data.students); firebasePointsConnected = true; firebasePointsChecked = true; firebasePointsLoadFailed = false; saveLocalCloudConnection(firebaseActiveClassId, true); render(); toast("포인트와 포인트 기록을 클라우드에 연결했습니다."); } catch (error) { console.error("Firestore initial points upload failed", error); toast("클라우드 저장에 실패했습니다. 로컬에는 저장되었습니다."); } }
function initialAssignmentStudentStateSnapshots() {
  return data.assignments.filter((assignment) => assignment.deleted !== true).flatMap((assignment) => data.students.map((student) => ({ assignmentId: assignment.id, studentId: student.id, status: storedAssignmentStatus(assignment, student.id), pointAward: storedAssignmentAward(assignment, student.id) || {} })));
}
async function connectAssignmentStudentStatesToFirebase() {
  if (!firebaseTeacherSession || !firebaseTeacherUser || !firebaseActiveClassId || !window.ourClassFirebase?.ready || !firebaseStudentsConnected || !firebaseAssignmentsConnected || !firebasePointsConnected || firebaseAssignmentStudentStatesConnected || firebaseAssignmentStudentStatesConnecting) return;
  if (!confirm("현재 과제의 학생별 제출 상태와 포인트 지급 기록을\n클라우드 학급의 기준 데이터로 등록할까요?")) return;
  const userUid = firebaseTeacherUser.uid; const classId = firebaseActiveClassId;
  firebaseAssignmentStudentStatesConnecting = true; render();
  try {
    const states = initialAssignmentStudentStateSnapshots();
    await window.ourClassFirebase.connectInitialAssignmentStudentStates(states);
    if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during assignment state connection.");
    firebaseAssignmentStudentStatesConnected = true;
    const statesLoaded = await loadFirebaseAssignmentStudentStates(userUid, false);
    if (!statesLoaded) throw new Error("Connected assignment student states could not be loaded.");
    saveData();
    toast("과제 제출 상태를 클라우드에 연결했습니다.");
  } catch (error) {
    console.error("Firestore initial assignment student states upload failed", error);
    firebaseAssignmentStudentStatesConnected = false;
    toast("과제 제출 상태를 연결하지 못했습니다. 연결을 확인해 주세요.");
  } finally {
    firebaseAssignmentStudentStatesConnecting = false;
    render();
  }
}
function initialRoleApplicationSnapshot(application) {
  const storedSnapshot = application?.roleSnapshot && typeof application.roleSnapshot === "object" && !Array.isArray(application.roleSnapshot) ? structuredClone(application.roleSnapshot) : null;
  const fallbackRole = roleForApplication(application);
  const storedAward = storedRolePointAward(application);
  return {
    id: String(application?.id || ""),
    date: roleApplicationDate(application),
    studentId: String(application?.studentId || ""),
    roleId: String(application?.roleId || ""),
    status: ["waiting", "completed", "cancelled"].includes(application?.status) ? application.status : "waiting",
    roleSnapshot: storedSnapshot || roleSnapshot(fallbackRole) || {},
    pointAward: storedAward || (application?.status === "completed" ? legacyRolePointAward(application, fallbackRole) : {}),
    appliedAt: String(application?.appliedAt || ""),
    completedAt: application?.completedAt || null,
    cancelledAt: application?.cancelledAt || null,
    cancelledBy: ["student", "teacher"].includes(application?.cancelledBy) ? application.cancelledBy : null
  };
}
function initialRoleCloudSnapshot() {
  return {
    settings: { dailyRoleApplicationLimit: data.dailyRoleApplicationLimit, roleApplicationOpenTime: data.roleApplicationOpenTime, currentRoles: structuredClone(data.currentRoles) },
    templates: structuredClone(data.roleTemplates),
    assignments: data.roleApplications.map(initialRoleApplicationSnapshot)
  };
}
async function connectRolesToFirebase() {
  if (!firebaseTeacherSession || !firebaseTeacherUser || !firebaseActiveClassId || !window.ourClassFirebase?.ready || !firebaseStudentsConnected || !firebasePointsConnected || firebaseRolesConnected || firebaseRolesConnecting) return;
  if (!confirm("현재 1인1역 설정과 기존 신청 기록을\n클라우드 학급의 기준 데이터로 등록할까요?")) return;
  const userUid = firebaseTeacherUser.uid; const classId = firebaseActiveClassId;
  firebaseRolesConnecting = true; render();
  try {
    const snapshot = initialRoleCloudSnapshot();
    await window.ourClassFirebase.connectInitialRoles(snapshot);
    if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during roles connection.");
    firebaseRolesConnected = true;
    const rolesLoaded = await loadFirebaseRoles(userUid, false);
    if (!rolesLoaded) throw new Error("Connected roles could not be loaded.");
    saveData();
    toast("1인1역을 클라우드에 연결했습니다.");
  } catch (error) {
    console.error("Firestore initial roles upload failed", error);
    firebaseRolesConnected = false;
    toast("1인1역을 클라우드에 연결하지 못했습니다. 연결을 확인해 주세요.");
  } finally {
    firebaseRolesConnecting = false;
    render();
  }
}
async function connectObservationsToFirebase() {
  if (!firebaseTeacherSession || !firebaseTeacherUser || !firebaseActiveClassId || !window.ourClassFirebase?.ready || !firebaseStudentsConnected || firebaseObservationsConnected || firebaseObservationsConnecting) return;
  if (!confirm("현재 관찰기록과 빠른 선택 항목을\n클라우드 학급의 기준 데이터로 등록할까요?")) return;
  const userUid = firebaseTeacherUser.uid; const classId = firebaseActiveClassId;
  data.observations = data.observations.map(normalizeObservation);
  saveData();
  const snapshot = { observations: structuredClone(data.observations), settings: { quickItems: structuredClone(data.observationQuickItems) } };
  firebaseObservationsConnecting = true; render();
  try {
    await window.ourClassFirebase.connectInitialObservations(snapshot);
    if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during observations connection.");
    firebaseObservationsConnected = true;
    const observationsLoaded = await loadFirebaseObservations(userUid, false);
    if (!observationsLoaded) throw new Error("Connected observations could not be loaded.");
    saveData();
    toast("관찰기록을 클라우드에 연결했습니다.");
  } catch (error) {
    console.error("Firestore initial observations upload failed", error);
    firebaseObservationsConnected = false;
    toast("관찰기록을 클라우드에 연결하지 못했습니다. 연결을 확인해 주세요.");
  } finally {
    firebaseObservationsConnecting = false;
    render();
  }
}
function initialGroupCloudSnapshot() {
  data.groups = (Array.isArray(data.groups) ? data.groups : []).map(normalizeGroup);
  data.groupAssignments = normalizeGroupAssignments(data.groupAssignments, data.students, data.groups);
  data.groupScoreTransactions = (Array.isArray(data.groupScoreTransactions) ? data.groupScoreTransactions : []).map(normalizeGroupScoreTransaction);
  data.classMissions = (Array.isArray(data.classMissions) ? data.classMissions : []).map(normalizeClassMission);
  saveData();
  return {
    groups: data.groups.map(({ id, name, active, order }) => ({ id, name, active, order })),
    scoreStates: data.groups.map(({ id, score }) => ({ groupId: id, score })),
    transactions: structuredClone(data.groupScoreTransactions),
    assignments: Object.entries(data.groupAssignments).map(([studentId, groupId]) => ({ studentId, groupId })),
    missions: structuredClone(data.classMissions)
  };
}
async function connectGroupsToFirebase() {
  if (!firebaseTeacherSession || !firebaseTeacherUser || !firebaseActiveClassId || !window.ourClassFirebase?.ready || !firebaseStudentsConnected || firebaseGroupsConnected || firebaseGroupsConnecting) return;
  if (!confirm("현재 모둠 구성, 점수, 배정, 기록과 공동 미션을\n클라우드 학급의 기준 데이터로 등록할까요?")) return;
  const userUid = firebaseTeacherUser.uid; const classId = firebaseActiveClassId;
  const snapshot = initialGroupCloudSnapshot();
  firebaseGroupsConnecting = true; render();
  try {
    await window.ourClassFirebase.connectInitialGroups(snapshot);
    if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during groups connection.");
    firebaseGroupsConnected = true;
    firebaseGroupsLoadReady = false;
    const groupsLoaded = await loadFirebaseGroups(userUid, false);
    if (!groupsLoaded) throw new Error("Connected groups could not be loaded.");
    saveData();
    toast("모둠활동을 클라우드에 연결했습니다.");
  } catch (error) {
    console.error("Firestore initial groups upload failed", error);
    firebaseGroupsConnected = false;
    firebaseGroupsLoadReady = false;
    if (firebaseTeacherUser?.uid === userUid && firebaseActiveClassId === classId) await window.ourClassFirebase.setGroupsConnected(false).catch((flagError) => console.error("Firestore groups connection flag rollback failed", flagError));
    toast("모둠활동을 클라우드에 연결하지 못했습니다. 연결을 확인해 주세요.");
  } finally {
    firebaseGroupsConnecting = false;
    render();
  }
}
function roleSettingsSnapshot() { return { currentRoles: structuredClone(data.currentRoles), dailyRoleApplicationLimit: data.dailyRoleApplicationLimit, roleApplicationOpenTime: data.roleApplicationOpenTime }; }
async function persistRoleSettings(previousSettings, successMessage) {
  saveData();
  if (!firebaseRolesConnected) { render(); toast(successMessage); return true; }
  firebaseRoleConfigurationSaving = true; render();
  try {
    await window.ourClassFirebase.saveRoleSettings({ currentRoles: data.currentRoles, dailyRoleApplicationLimit: data.dailyRoleApplicationLimit, roleApplicationOpenTime: data.roleApplicationOpenTime });
    toast(successMessage); return true;
  } catch (error) {
    console.error("Firestore role settings save failed", error);
    data.currentRoles = previousSettings.currentRoles;
    data.dailyRoleApplicationLimit = previousSettings.dailyRoleApplicationLimit;
    data.roleApplicationOpenTime = previousSettings.roleApplicationOpenTime;
    saveData();
    toast("1인1역 설정을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요.");
    return false;
  } finally {
    firebaseRoleConfigurationSaving = false; render();
  }
}
async function persistRoleTemplateChange(previousTemplates, cloudOperation, successMessage) {
  saveData();
  if (!firebaseRolesConnected) { render(); toast(successMessage); return true; }
  firebaseRoleConfigurationSaving = true; render();
  try {
    await cloudOperation();
    toast(successMessage); return true;
  } catch (error) {
    console.error("Firestore role template save failed", error);
    data.roleTemplates = previousTemplates;
    saveData();
    toast("역할 템플릿을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요.");
    return false;
  } finally {
    firebaseRoleConfigurationSaving = false; render();
  }
}
async function saveFirebaseAssignment(assignment) { if (!firebaseAssignmentsConnected || !assignment) return; try { await window.ourClassFirebase.saveAssignment(assignment); } catch (error) { console.error("Firestore assignment save failed", error); toast("클라우드 저장에 실패했습니다. 로컬에는 저장되었습니다."); } }
async function saveFirebaseStudent(student, isNew = false) { if (!firebaseStudentsConnected || !student) return; try { await window.ourClassFirebase.saveStudent(student, data.students.findIndex((item) => item.id === student.id), isNew); if (isNew && firebasePointsConnected) await window.ourClassFirebase.createPointStates([student]); } catch (error) { console.error("Firestore student save failed", error); toast("클라우드 저장에 실패했습니다. 로컬에는 저장되었습니다."); } }
async function saveFirebaseStudentsBatch(students) {
  if (!firebaseStudentsConnected || !students.length) return false;
  try { await window.ourClassFirebase.saveStudentsBatch(students.map((student) => ({student, orderIndex: data.students.findIndex((item) => item.id === student.id)}))); }
  catch (error) { console.error("Firestore students batch save failed", error); toast("클라우드 저장에 실패했습니다. 로컬에는 저장되었습니다."); return false; }
  if (firebasePointsConnected) {
    try { await window.ourClassFirebase.createPointStates(students); }
    catch (error) { console.error("Firestore student point state batch creation failed", error); toast("학생 명단은 저장했지만 포인트 초기 상태를 만들지 못했습니다."); }
  }
  return true;
}
saveData();

function studentClassContext() {
  const urlClassId = new URLSearchParams(location.search).get("class")?.trim() || "";
  return urlClassId || firebaseActiveClassId || "";
}
function syncFirebaseClassContextInUrl(classId) {
  const value = String(classId || "").trim(); if (!value) return;
  const url = new URL(location.href); if (url.searchParams.get("class") === value) return;
  url.searchParams.set("class", value); history.replaceState(history.state, "", url);
}
function renderWelcome() {
  document.title = "우리반 퀘스트";
  const classId = studentClassContext();
  const studentFields = classId ? `<p class="login-card-description">선생님이 안내한 계정으로 오늘의 퀘스트를 시작하세요.</p><label>로그인 ID<input name="loginId" autocomplete="username" placeholder="로그인 ID를 입력하세요" required></label><label>비밀번호<input name="password" type="password" autocomplete="current-password" placeholder="비밀번호를 입력하세요" required></label><button class="student-login-button" type="submit" ${!firebaseStudentAuthReady || firebaseStudentSigningIn ? "disabled" : ""}>${firebaseStudentSigningIn ? "로그인 중..." : "학생으로 시작하기"}</button>` : `<p class="student-login-context-error">학생 로그인 링크를 확인해 주세요.<small>선생님이 보내 준 학급 링크로 다시 접속해 주세요.</small></p>`;
  app.innerHTML = `<main class="welcome"><section class="welcome-card"><header class="welcome-heading"><div class="brand-mark" aria-hidden="true"><span>★</span></div><div><h1>우리반 <strong>퀘스트</strong></h1><p class="welcome-intro">함께 돕고, 성장하고, 도전해요!</p></div></header><div class="login-stage"><div class="scene-art-layer" aria-hidden="true"><div class="student-scene-art"></div><div class="student-character-art"></div><div class="teacher-scene-art"></div></div><header class="stage-heading"><p class="stage-title"><span aria-hidden="true">✦</span> 환영해요! <span aria-hidden="true">✦</span></p><p>우리반 퀘스트에서 함께 성장하는 모험을 시작해요.</p></header><div class="login-card-grid"><form id="firebase-student-login-form" class="login-card student-login-card"><div class="login-card-icon" aria-hidden="true">★</div><h2>학생 로그인</h2>${studentFields}</form><section class="login-card teacher-login-card"><div class="login-card-icon" aria-hidden="true">▣</div><h2>선생님 로그인</h2><p class="login-card-description">학급을 관리하려면 Google 계정으로 로그인하세요.</p><button class="google-login-button" data-action="firebase-teacher-login"><span aria-hidden="true">G</span>Google로 로그인</button><p class="teacher-login-note">교사용 관리자 화면으로 이동합니다.</p></section></div><footer class="welcome-footer"><strong>♢ 안전하고 즐거운 우리반 퀘스트</strong><span>모두가 존중하고 함께 성장하는 공간이에요.</span></footer></div></section></main>`;
}
function renderAuthLoading() { document.title = data.classSettings.appName; app.innerHTML = `<main class="welcome"><section class="welcome-card auth-loading"><div class="brand-mark">⚔</div><h1>${escapeHtml(data.classSettings.appName)}</h1><p>로그인 상태 확인 중...</p></section></main>`; }

const STUDENT_NAV = [["home", "⌂", "홈"], ["roles", "✓", "오늘의 역할"], ["assignments", "▣", "과제"], ["points", "◆", "포인트"], ["draw", "★", "카드 뽑기"], ["collection", "▦", "위인 도감"], ["ranking", "♛", "랭킹"]];
const TEACHER_NAV = [["dashboard", "⌂", "대시보드"], ["board", "▤", "전자칠판"], ["students", "♙", "학생 관리"], ["groups", "◉", "모둠활동"], ["roles", "✓", "1인1역"], ["assignments", "▣", "과제"], ["observations", "✎", "관찰 기록"], ["points", "◆", "포인트"], ["cards", "★", "카드 관리"], ["ranking", "♛", "랭킹"], ["class-settings", "⚙", "학급 설정"]];

function navHtml(items) { return items.map(([id, icon, label]) => `<button class="nav-button ${session.view === id ? "active" : ""}" data-action="navigate" data-view="${id}"><span>${icon}</span>${label}</button>`).join(""); }
function featureEnabled(key) { return data.classSettings.features?.[key] !== false; }
function teacherNavItems() {
  const featureByView = { groups: "groups", roles: "roles", assignments: "assignments", points: "points", cards: "cards", ranking: "rankings" };
  return TEACHER_NAV.filter(([view]) => !featureByView[view] || featureEnabled(featureByView[view]));
}
function studentNavItems() {
  const featureByView = { roles: "roles", assignments: "assignments", points: "points", draw: "cards", collection: "cards", ranking: "rankings" };
  return STUDENT_NAV.filter(([view]) => !featureByView[view] || featureEnabled(featureByView[view]));
}
function roleApplicationDate(application) { const date = String(application?.date || ""); return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : localDateKey(application?.appliedAt); }
function roleSnapshot(role) { return role ? { id: String(role.id || ""), name: String(role.name || ""), points: Number(role.points) || 0, capacity: Number(role.capacity) || 1, description: String(role.description || "") } : null; }
function roleForApplication(application) { const snapshot = application?.roleSnapshot; return snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) && String(snapshot.id || application.roleId || "") ? { ...snapshot, id: String(snapshot.id || application.roleId), name: String(snapshot.name || ""), points: Number(snapshot.points) || 0, capacity: Number(snapshot.capacity) || 1, description: String(snapshot.description || "") } : roleById(application?.roleId); }
function storedRolePointAward(application) { const award = application?.pointAward; return application && Object.hasOwn(application, "pointAward") && award && typeof award === "object" && !Array.isArray(award) ? structuredClone(award) : null; }
function legacyRolePointAward(application, role) { const legacyTotal = Number(application?.awardedPoints); const legacyBonus = Number(application?.awardedBonusPoints); const bonusAmount = Number.isFinite(legacyBonus) ? legacyBonus : 0; const legacyBase = Number(application?.awardedBasePoints); const baseAmount = Number.isFinite(legacyBase) ? legacyBase : Number.isFinite(legacyTotal) ? legacyTotal - bonusAmount : Number(role?.points) || 0; const amount = Number.isFinite(legacyTotal) ? legacyTotal : baseAmount + bonusAmount; return { awarded: application?.status === "completed", amount, baseAmount, bonusAmount, cardAbilityAward: application?.cardAbilityAward && typeof application.cardAbilityAward === "object" ? structuredClone(application.cardAbilityAward) : { amount: 0 }, awardedAt: application?.completedAt || application?.appliedAt || "", revokedAt: null }; }
function rolePointAward(application, role) { return storedRolePointAward(application) || legacyRolePointAward(application, role); }
function preserveCurrentRoleApplicationSnapshots() { data.roleApplications.forEach((application) => { if (application.roleSnapshot && typeof application.roleSnapshot === "object" && !Array.isArray(application.roleSnapshot)) return; const role = roleById(application.roleId); if (role) application.roleSnapshot = roleSnapshot(role); }); }
function todayRoleApplications() { const today = todayString(); return data.roleApplications.filter((application) => application.status !== "cancelled" && roleApplicationDate(application) === today); }
function todayRoleApplicationsForStudent(studentId) { return todayRoleApplications().filter((application) => application.studentId === studentId); }
function shell(content, teacher = false) {
  const student = currentStudent();
  document.title = data.classSettings.appName;
  const top = teacher ? `<span>${escapeHtml(data.classSettings.className)} · ${escapeHtml(data.classSettings.teacherName)}</span>` : `<span>${escapeHtml(data.classSettings.className)} · ${escapeHtml(student.name)}</span>`;
  const firebaseTeacherTop = teacher && firebaseTeacherSession && firebaseTeacherUser ? `<span>${escapeHtml(firebaseTeacherUser.displayName || firebaseTeacherUser.email || "Google")} 선생님</span>` : top;
  const exitActions = teacher && firebaseTeacherSession
    ? `<button class="ghost-button" data-action="go-home">처음으로</button><button class="ghost-button" data-action="firebase-logout">로그아웃</button>`
    : `<button class="ghost-button" data-action="go-home">처음으로</button>`;
  const studentSummaryItems = teacher ? [] : [
    `<div class="summary-item class-summary-item">학급<strong>${escapeHtml(data.classSettings.className)}</strong></div>`,
    featureEnabled("points") ? `<div class="summary-item">현재 포인트<strong>${student.points}P</strong></div>` : "",
    featureEnabled("roles") ? `<div class="summary-item">오늘 역할<strong>${todayRoleApplicationsForStudent(student.id).length}개</strong></div>` : "",
    featureEnabled("cards") ? `<div class="summary-item">보유 카드<strong>${cardCount(student)}장</strong></div>` : ""
  ].filter(Boolean);
  const summary = teacher ? "" : `<section class="summary-strip" style="--summary-count:${studentSummaryItems.length}">${studentSummaryItems.join("")}</section>`;
  return `<div class="app-shell ${teacher ? "teacher-shell" : "student-shell"}"><header class="topbar"><div class="brand"><span class="brand-icon">⚔</span>${escapeHtml(data.classSettings.appName)}</div><div class="user-area">${firebaseTeacherTop}${exitActions}</div></header>${summary}<div class="layout"><nav class="side-nav">${navHtml(teacher ? teacherNavItems() : studentNavItems())}</nav><main class="content">${content}</main></div></div>`;
}

function teacherWhiteboard() {
  return `<section class="whiteboard-app" id="teacher-whiteboard"><div class="whiteboard-toolbar" role="toolbar" aria-label="전자칠판 도구"><div class="whiteboard-tool-group"><button class="whiteboard-tool active" type="button" data-board-tool="pen" aria-pressed="true">펜</button><button class="whiteboard-tool" type="button" data-board-tool="eraser" aria-pressed="false">지우개</button></div><div class="whiteboard-tool-group" aria-label="기본 도형"><button class="whiteboard-tool" type="button" data-board-tool="line" aria-pressed="false">직선</button><button class="whiteboard-tool" type="button" data-board-tool="rectangle" aria-pressed="false">사각형</button><button class="whiteboard-tool" type="button" data-board-tool="ellipse" aria-pressed="false">원/타원</button></div><div class="whiteboard-tool-group whiteboard-colors" aria-label="펜 색상"><button class="whiteboard-color active" type="button" data-board-color="#f7f3df" style="--board-color:#f7f3df" aria-label="흰색" aria-pressed="true"></button><button class="whiteboard-color" type="button" data-board-color="#ff8b82" style="--board-color:#ff8b82" aria-label="빨강" aria-pressed="false"></button><button class="whiteboard-color" type="button" data-board-color="#78c9ff" style="--board-color:#78c9ff" aria-label="파랑" aria-pressed="false"></button><button class="whiteboard-color" type="button" data-board-color="#ffe27a" style="--board-color:#ffe27a" aria-label="노랑" aria-pressed="false"></button></div><div class="whiteboard-tool-group" aria-label="펜 굵기"><button class="whiteboard-width" type="button" data-board-width="3" aria-label="가는 선" aria-pressed="false"><span></span></button><button class="whiteboard-width active" type="button" data-board-width="7" aria-label="보통 선" aria-pressed="true"><span></span></button><button class="whiteboard-width" type="button" data-board-width="14" aria-label="굵은 선" aria-pressed="false"><span></span></button></div><div class="whiteboard-toolbar-spacer"></div><span class="whiteboard-refresh-state" id="whiteboard-refresh-state" aria-live="polite">정보 준비 중</span><button class="whiteboard-tool" type="button" data-board-action="clear">전체 지우기</button><button class="whiteboard-tool" type="button" data-board-action="fullscreen">전체화면</button></div><div class="whiteboard-layout"><div class="whiteboard-canvas-wrap"><canvas id="whiteboard-canvas" aria-label="그림을 그리는 칠판"></canvas></div><aside class="whiteboard-info" id="whiteboard-info" aria-label="오늘의 학급 정보"><button class="whiteboard-info-toggle" type="button" data-board-action="toggle-info" aria-expanded="true" aria-controls="whiteboard-info-content"><span aria-hidden="true">›</span><b>정보 접기</b></button><div id="whiteboard-info-content"><details class="whiteboard-panel"><summary><h2>오늘의 1인1역</h2><span id="whiteboard-role-count"></span><i aria-hidden="true">▼</i></summary><div class="whiteboard-panel-list" id="whiteboard-role-list"></div></details><details class="whiteboard-panel"><summary><h2>포인트 사용</h2><span id="whiteboard-point-count"></span><i aria-hidden="true">▼</i></summary><div class="whiteboard-panel-list" id="whiteboard-point-list"></div></details><details class="whiteboard-panel"><summary><h2>모둠 점수</h2><span id="whiteboard-group-count"></span><i aria-hidden="true">▼</i></summary><div class="whiteboard-panel-list whiteboard-group-list" id="whiteboard-group-list"></div></details></div></aside></div><div class="whiteboard-confirm" id="whiteboard-clear-confirm" role="dialog" aria-modal="true" aria-labelledby="whiteboard-clear-title" hidden><div class="whiteboard-confirm-card"><h2 id="whiteboard-clear-title">칠판의 모든 내용을 지울까요?</h2><p>지운 내용은 다시 되돌릴 수 없습니다.</p><div><button class="whiteboard-confirm-clear" type="button" data-board-action="confirm-clear">전체 지우기</button><button class="whiteboard-confirm-cancel" type="button" data-board-action="cancel-clear">취소</button></div></div></div></section>`;
}

function assignmentStatusClass(status) { return { submitted: "success", review: "waiting", missing: "danger" }[status] || "danger"; }
function refreshAssignmentCompletion(assignment) {
  if (!["active", "completed"].includes(assignment.assignmentState)) assignment.assignmentState = assignment.completed ? "completed" : "active";
  assignment.completed = assignment.assignmentState === "completed";
  if (!assignment.completed) assignment.completedAt = null;
}
function ensureAssignmentStudentStatuses(assignment) { if (!assignment.studentStatuses || typeof assignment.studentStatuses !== "object" || Array.isArray(assignment.studentStatuses)) assignment.studentStatuses = {}; data.students.forEach((student) => { if (!ASSIGNMENT_STATUSES.includes(assignment.studentStatuses[student.id])) assignment.studentStatuses[student.id] = "missing"; }); return assignment.studentStatuses; }
function assignmentStatusForStudent(assignment, studentId) { const status = ensureAssignmentStudentStatuses(assignment)[studentId]; return ASSIGNMENT_STATUSES.includes(status) ? status : "missing"; }
function setAssignmentStatusForStudent(assignment, studentId, status) { ensureAssignmentStudentStatuses(assignment)[studentId] = ASSIGNMENT_STATUSES.includes(status) ? status : "missing"; }
function assignmentStatusesForStudents(assignment, students = data.students) { return students.map((student) => assignmentStatusForStudent(assignment, student.id)); }
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
function studentAssignmentCard(assignment, studentId, closed = false) {
  const status = assignmentStatusForStudent(assignment, studentId);
  const statusControl = closed
    ? `<div class="closed-assignment-status"><span class="pill">과제 종료</span><strong>내 상태: ${ASSIGNMENT_STATUS_LABELS[status]}</strong></div>`
    : status === "missing"
    ? `<button class="button assignment-request-button" data-action="open-assignment-request" data-id="${assignment.id}">🙋 제출했어요!</button>`
    : status === "review"
      ? `<div class="assignment-review-state"><strong>⏳ 확인 대기 중</strong><small>선생님이 확인하고 있어요.</small></div>`
      : `<span class="pill success assignment-finished-label">✓ 제출 완료</span>`;
  return `<article class="card student-assignment-card ${assignment.important ? "important" : ""}"><div class="assignment-card-top"><div class="assignment-labels"><span class="subject-badge">${escapeHtml(assignment.subject)}</span>${assignment.important ? `<span class="important-mark">★ 중요</span>` : ""}${assignment.points > 0 ? `<span class="pill assignment-points-badge">완료 시 +${assignment.points}P</span>` : ""}</div></div><h3>${escapeHtml(assignment.title)}</h3>${assignment.description ? `<p class="muted">${escapeHtml(assignment.description)}</p>` : ""}<div class="assignment-meta"><span>📅 ${formatDueDate(assignment.dueDate)}</span></div>${statusControl}</article>`;
}

function studentHomeLegacy() {
  const student = currentStudent();
  const recent = student.pointHistory.slice(-4).reverse();
  const activeAssignments = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment));
  const completedAssignments = data.assignments.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
  const shownCompletedAssignments = showAllStudentCompletedAssignments ? completedAssignments : completedAssignments.slice(0, 5);
  const representative = representativeCardInfo(student);
  const representativeHtml = representative ? `<section class="representative-card-summary"><div><small>나의 대표 카드</small><h2>${escapeHtml(representative.card.name)} <span class="pill rarity-${rarityClass(representative.rarity)}">${representative.rarity}</span></h2></div><div><strong>특수능력</strong><p>${abilitySummary(representative.rarity, representative.abilityId)}</p><small>오늘 카드 보너스 ${todayCardBonus(student)} / ${representative.setting.dailyCap}P</small></div></section>` : `<section class="representative-card-summary empty-representative"><div><small>나의 대표 카드</small><h2>아직 장착한 카드가 없어요.</h2><p>위인 도감에서 보유 카드를 대표 카드로 장착해 보세요.</p></div></section>`;
  return `<section class="hero"><h2>오늘도 우리 반을 위해<br>퀘스트를 완료해 보세요! ✨</h2><p>작은 도움이 모여 멋진 교실을 만들어요.</p></section>${representativeHtml}<h2 class="section-title">오늘의 과제</h2>${activeAssignments.length ? `<div class="grid">${activeAssignments.map((assignment) => studentAssignmentCard(assignment, student.id)).join("")}</div>` : `<div class="empty">진행 중인 과제가 없어요. 멋지게 완료했어요!</div>`}${completedAssignments.length ? `<details class="completed-assignments"><summary>지난 과제 ${completedAssignments.length}개 · ${showAllStudentCompletedAssignments ? "전체" : `최근 ${Math.min(5, completedAssignments.length)}개`} 보기</summary><div class="grid">${shownCompletedAssignments.map((assignment) => studentAssignmentCard(assignment, student.id, true)).join("")}</div>${completedAssignments.length > 5 ? `<button class="button secondary record-view-all" data-action="toggle-student-completed-assignments">${showAllStudentCompletedAssignments ? "최근 5개만 보기" : "전체 보기"}</button>` : ""}</details>` : ""}<h2 class="section-title">최근 포인트 내역</h2>${recent.length ? `<div class="list">${recent.map((item) => pointHistoryRow(item)).join("")}</div>` : `<div class="empty">아직 포인트 기록이 없어요.</div>`}`;
}

function studentAssignmentSort(studentId) {
  const order = { missing: 0, review: 1, submitted: 2 };
  return (first, second) => (order[assignmentStatusForStudent(first, studentId)] - order[assignmentStatusForStudent(second, studentId)]) || String(first.dueDate || "9999-12-31").localeCompare(String(second.dueDate || "9999-12-31")) || String(second.createdAt || "").localeCompare(String(first.createdAt || ""));
}
function studentHome() {
  const student = currentStudent();
  const assignments = featureEnabled("assignments") ? data.assignments.filter((assignment) => !isAssignmentCompleted(assignment)).sort(studentAssignmentSort(student.id)) : [];
  const roleApplications = featureEnabled("roles") ? todayRoleApplicationsForStudent(student.id) : [];
  const roleSummary = featureEnabled("roles") ? `<article class="card student-home-role"><div><span class="subject-badge">오늘의 역할</span><h3>${roleApplications.length ? `${roleApplications.length}개 참여 중` : "아직 신청한 역할이 없어요"}</h3><p class="muted">${roleApplications.length ? roleApplications.map((application) => escapeHtml(roleForApplication(application)?.name || "역할")).join(" · ") : "역할을 골라 우리 반을 함께 도와주세요."}</p></div><button class="button secondary compact" data-action="navigate" data-view="roles">역할 보기</button></article>` : "";
  const assignmentSection = featureEnabled("assignments") ? `<div class="section-heading student-task-heading"><div><h2 class="section-title">진행 중 과제</h2><p class="muted">미제출 과제와 가까운 마감일을 먼저 보여 줍니다.</p></div><button class="button secondary compact" data-action="navigate" data-view="assignments">과제 전체 보기</button></div>${assignments.length ? `<div class="grid student-home-assignment-grid">${assignments.map((assignment) => studentAssignmentCard(assignment, student.id)).join("")}</div>` : `<div class="empty">진행 중인 과제가 없어요. 멋지게 완료했어요!</div>`}` : "";
  const recentPoints = featureEnabled("points") ? student.pointHistory.slice(-5).reverse() : [];
  const pointSection = featureEnabled("points") ? `<div class="section-heading student-state-heading"><div><h2 class="section-title">나의 현재 상태</h2><p class="muted">현재 ${student.points}P · 최근 포인트 내역</p></div><button class="button secondary compact" data-action="navigate" data-view="points">포인트 전체 보기</button></div>${recentPoints.length ? `<div class="list student-home-points">${recentPoints.map(pointHistoryRow).join("")}</div>` : `<div class="empty">아직 포인트 기록이 없어요.</div>`}` : "";
  const representative = featureEnabled("cards") ? representativeCardInfo(student) : null;
  const representativeHtml = !featureEnabled("cards") ? "" : representative ? `<section class="representative-card-summary student-home-representative rarity-${rarityClass(representative.rarity)}">${cardImageMarkup(representative.card, "representative-card-image")}<div><small>나의 대표 카드</small><h2>${escapeHtml(representative.card.name)} <span class="pill rarity-${rarityClass(representative.rarity)}">${representative.rarity}</span></h2><small>${escapeHtml(representative.card.era)}</small></div><div><strong>특수능력</strong><p>${abilitySummary(representative.rarity, representative.abilityId)}</p><small>오늘 카드 보너스 ${todayCardBonus(student)} / ${representative.setting.dailyCap}P</small></div></section>` : `<section class="representative-card-summary empty-representative student-home-representative"><div><small>나의 대표 카드</small><h2>아직 장착한 카드가 없어요.</h2><p>위인 도감에서 보유 카드를 대표 카드로 장착해 보세요.</p></div></section>`;
  return `<section class="hero student-home-hero"><h2>오늘도 우리 반을 함께 빛내요! ✨</h2><p>해야 할 일을 하나씩 확인해 보세요.</p></section><section class="student-today-tasks"><h1 class="student-home-section-title">오늘 해야 할 일</h1>${roleSummary}${assignmentSection}</section>${pointSection}${representativeHtml}`;
}

function studentAssignments() {
  const student = currentStudent(); const sorter = studentAssignmentSort(student.id);
  const matching = data.assignments.filter((assignment) => { const status = assignmentStatusForStudent(assignment, student.id); if (studentAssignmentFilter === "todo") return status === "missing" && !isAssignmentCompleted(assignment); if (studentAssignmentFilter === "review") return status === "review" && !isAssignmentCompleted(assignment); return status === "submitted"; }).sort((first, second) => studentAssignmentFilter === "done" ? sortCompletedAssignments(first, second) : sorter(first, second));
  const shown = studentAssignmentFilter === "done" && !showAllStudentCompletedAssignments ? matching.slice(0, 5) : matching;
  const filters = [["todo", "해야 할 과제"], ["review", "확인 대기"], ["done", "완료"]].map(([value, label]) => `<button class="button compact ${studentAssignmentFilter === value ? "active" : "secondary"}" data-action="set-student-assignment-filter" data-filter="${value}">${label}</button>`).join("");
  const emptyLabel = { todo: "해야 할 과제가 없습니다.", review: "확인 대기 중인 과제가 없습니다.", done: "완료한 과제가 없습니다." }[studentAssignmentFilter];
  return `<div class="section-heading"><div><h1 class="page-heading">과제</h1><p class="page-description">나의 과제 상태만 확인할 수 있습니다.</p></div></div><div class="student-assignment-page-filters">${filters}</div>${shown.length ? `<div class="grid student-assignment-page-grid">${shown.map((assignment) => studentAssignmentCard(assignment, student.id, isAssignmentCompleted(assignment))).join("")}</div>` : `<div class="empty">${emptyLabel}</div>`}${studentAssignmentFilter === "done" && matching.length > 5 ? `<button class="button secondary record-view-all" data-action="toggle-student-completed-assignments">${showAllStudentCompletedAssignments ? "최근 5개만 보기" : `전체 ${matching.length}개 보기`}</button>` : ""}`;
}

function studentPoints() {
  const student = currentStudent(); const history = [...(student.pointHistory || [])].reverse(); const shown = showAllStudentPoints ? history : history.slice(0, 5);
  return `<div class="section-heading"><div><h1 class="page-heading">포인트</h1><p class="page-description">나의 포인트와 변동 내역만 확인할 수 있습니다.</p></div></div><section class="card student-point-balance"><span>현재 보유 포인트</span><strong>${student.points}P</strong></section><section class="student-point-history"><div class="section-heading"><h2>최근 포인트 내역</h2><span class="muted">${showAllStudentPoints ? `전체 ${history.length}건` : `최근 ${Math.min(5, history.length)}건`}</span></div>${shown.length ? `<div class="list">${shown.map(pointHistoryRow).join("")}</div>` : `<div class="empty">포인트 내역이 없습니다.</div>`}${history.length > 5 ? `<button class="button secondary record-view-all" data-action="toggle-student-point-history">${showAllStudentPoints ? "최근 5건만 보기" : "전체 보기"}</button>` : ""}</section>`;
}

function studentRoles() {
  const student = currentStudent();
  const ownActive = todayRoleApplicationsForStudent(student.id); const limit = data.dailyRoleApplicationLimit;
  return `<h1 class="page-heading">오늘의 1인1역</h1><p class="page-description">하루에 최대 ${limit}개까지 신청할 수 있어요. 함께 교실을 빛내 주세요!</p><section class="card role-application-limit-status"><span>오늘 신청</span><strong>${ownActive.length} / ${limit}개</strong>${ownActive.length >= limit ? `<small>오늘 신청 가능한 1인1역을 모두 신청했습니다.</small>` : `<small>${limit - ownActive.length}개 더 신청할 수 있어요.</small>`}</section><div class="grid">${data.currentRoles.filter((role) => role.active !== false).map((role) => {
    const applications = todayRoleApplications().filter((item) => item.roleId === role.id);
    const mine = applications.find((item) => item.studentId === student.id);
    const shownPoints = mine ? roleForApplication(mine)?.points ?? role.points : role.points;
    const full = applications.length >= role.capacity;
    const actionButton = mine?.status === "completed"
      ? `<button class="button secondary" type="button" disabled>완료</button>`
      : mine?.status === "waiting"
        ? `<button class="button danger" type="button" data-action="open-student-cancel" data-id="${mine.id}">신청 취소</button>`
        : `<button class="button" type="button" data-action="apply-role" data-id="${role.id}" ${full || ownActive.length >= limit ? "disabled" : ""}>${full ? "모집 완료" : ownActive.length >= limit ? "오늘 신청 완료" : "신청하기"}</button>`;
    return `<article class="card quest-card"><div class="quest-top"><h3>${escapeHtml(role.name)}</h3><span class="points">+${shownPoints}P</span></div>${role.description ? `<p class="role-description">${escapeHtml(role.description)}</p>` : ""}<div><span class="pill">모집 ${applications.length} / ${role.capacity}명</span></div><div class="progress"><span style="width:${Math.min(100, applications.length / role.capacity * 100)}%"></span></div><div class="applicants">현재 신청: ${applications.length ? applications.map((item) => studentById(item.studentId).name).join(", ") : "아직 없음"}</div>${actionButton}</article>`;
  }).join("")}</div>`;
}

function studentDraw() {
  const student = currentStudent();
  const activeSetTags = usableCardSets().filter((cardSet) => data.activeCardSetIds.includes(cardSet.id)).map((cardSet) => `<span class="pill">${escapeHtml(cardSet.name)}</span>`).join("");
  const options = data.drawOptions.filter((option) => option.active && !option.deleted);
  const optionCards = options.map((option) => { const rateTags = CARD_RARITIES.map((rarity) => `<span class="pill rarity-${rarityClass(rarity)}">${rarity} ${drawRate(rarity, option.rates)}%</span>`).join(""); const insufficient = student.points < option.price; return `<article class="draw-option-card"><h3>${escapeHtml(option.name)}</h3><strong class="draw-option-price">${option.price}P</strong><p class="muted">전설 ${drawRate("전설", option.rates)}% · 고대 ${drawRate("고대", option.rates)}%</p><details class="draw-rate-details"><summary>전체 확률 보기</summary><div>${rateTags}</div></details><button class="button gold" data-action="draw-option" data-id="${option.id}" ${insufficient || !activeSetTags ? "disabled" : ""}>${insufficient ? "포인트 부족" : `${option.price}P로 뽑기`}</button></article>`; }).join("");
  return `<h1 class="page-heading">역사 위인 카드 뽑기</h1><p class="page-description">원하는 가격과 확률의 뽑기 옵션을 선택하세요.</p><div class="active-card-set-tags"><strong>현재 카드팩</strong>${activeSetTags || `<span class="muted">선택된 카드셋 없음</span>`}</div><section class="card draw-zone"><p>내 포인트 <strong id="draw-current-points" class="points">${student.points}P</strong></p><div id="draw-card" class="draw-card"><div class="draw-card-inner"><div class="draw-face draw-back">?</div><div id="draw-result" class="draw-face draw-front"><span class="muted">아래에서 뽑기 옵션을 선택하세요!</span></div></div></div></section><div class="draw-option-grid">${optionCards || `<div class="empty">현재 사용할 수 있는 뽑기 옵션이 없습니다.</div>`}</div>`;
}

function rarityClass(rarity) { return { 일반: "common", 희귀: "rare", 영웅: "hero", 전설: "legend", 고대: "ancient" }[rarity]; }
function sortedCards(includeDeleted = false, cardSetId = "") { return data.cards.filter((card) => (includeDeleted || !card.deleted) && (!cardSetId || card.cardSetId === cardSetId)).sort((first, second) => first.order - second.order); }
function studentCollectionLegacy() {
  const student = currentStudent();
  const availableSets = [...data.cardSets].filter((cardSet) => !cardSet.deleted || sortedCards(true, cardSet.id).some((card) => cardInventoryCount(student, card.id) > 0));
  const orderedSets = availableSets.sort((first, second) => Number(data.activeCardSetIds.includes(second.id)) - Number(data.activeCardSetIds.includes(first.id)) || new Date(first.createdAt) - new Date(second.createdAt));
  if (collectionCardSetFilter !== "all" && !orderedSets.some((cardSet) => cardSet.id === collectionCardSetFilter)) collectionCardSetFilter = "all";
  const shownSets = collectionCardSetFilter === "all" ? orderedSets : orderedSets.filter((cardSet) => cardSet.id === collectionCardSetFilter);
  const filterButtons = `<button class="collection-filter ${collectionCardSetFilter === "all" ? "selected" : ""}" data-action="filter-card-collection" data-id="all">전체</button>${orderedSets.map((cardSet) => `<button class="collection-filter ${collectionCardSetFilter === cardSet.id ? "selected" : ""}" data-action="filter-card-collection" data-id="${cardSet.id}">${escapeHtml(cardSet.name)}</button>`).join("")}`;
  const sections = shownSets.map((cardSet) => {
    const setCards = sortedCards(true, cardSet.id); const activeCards = setCards.filter((card) => card.active && !card.deleted);
    const unique = activeCards.filter((card) => cardInventoryCount(student, card.id) > 0).length;
    const visibleCards = setCards.filter((card) => !card.deleted || cardInventoryCount(student, card.id) > 0);
    if (!visibleCards.length) return "";
    return `<section class="collection-set"><div class="section-heading"><div><h2>${escapeHtml(cardSet.name)} ${data.activeCardSetIds.includes(cardSet.id) ? `<span class="pill success">뽑기 사용 중</span>` : ""}</h2><p class="muted">${unique} / ${activeCards.length} 수집</p></div></div><div class="collection">${visibleCards.map((figure) => {
      const inventory = cardInventory(student, figure.id); const count = cardInventoryCount(student, figure.id);
      const rarityCounts = CARD_RARITIES.map((rarity) => { const quantity = rarityInventoryCount(student, figure.id, rarity); const step = upgradeStepFrom(rarity); const needed = upgradeRequired(rarity); const abilities = cardAbilities().map((ability) => { const abilityCount = Number(abilityInventory(student, figure.id, rarity)[ability.id]) || 0; if (!abilityCount) return ""; const equipped = student.representativeCard?.cardId === figure.id && student.representativeCard?.rarity === rarity && student.representativeCard?.abilityId === ability.id; const unavailable = !ability.active || ability.deleted; return `<div class="owned-ability"><span><strong>${ability.icon} ${ability.name}</strong> ×${abilityCount}</span><small>${unavailable ? "현재 사용 중지된 특수능력입니다." : abilitySummary(rarity, ability.id).split(" · ")[1]}</small><button class="representative-equip-button ${equipped ? "equipped" : ""}" data-action="equip-representative-card" data-card-id="${figure.id}" data-rarity="${rarity}" data-ability-id="${ability.id}" ${equipped || unavailable ? "disabled" : ""}>${equipped ? "대표 카드 ✓" : "대표 카드로 설정"}</button></div>`; }).join(""); const upgradeControl = step ? quantity >= needed ? `<button class="upgrade-button" data-action="ask-upgrade-card" data-card-id="${figure.id}" data-rarity="${rarity}">⬆ ${step.to} 등급으로 업그레이드</button>` : `<small class="upgrade-progress">총 ${quantity} / ${needed}</small>` : `<small class="upgrade-progress">최고 등급</small>`; return `<div class="rarity-status ${quantity > 0 ? `owned rarity-${rarityClass(rarity)}` : "locked"}"><strong>${rarity}</strong><span>${quantity > 0 ? `총 ×${quantity}` : "-"}</span>${abilities}${upgradeControl}</div>`; }).join("");
      return count ? `<article class="figure-card"><h3>${escapeHtml(figure.name)}</h3><p class="muted">${escapeHtml(figure.era)}</p><small>${escapeHtml(figure.achievement)}</small><div class="rarity-inventory">${rarityCounts}</div><strong class="owned-count">보유 ×${count}</strong>${(!figure.active || !cardSet.active) ? `<span class="inactive-card-note">현재 뽑기 제외</span>` : ""}</article>` : `<article class="figure-card locked" aria-label="${escapeHtml(figure.name)} 미획득 카드"><span>?</span><small>${escapeHtml(figure.name)} · 5개 등급</small></article>`;
    }).join("")}</div></section>`;
  }).join("");
  const representative = representativeCardInfo(student); const bonusCap = representative?.setting.dailyCap || 0;
  return `<h1 class="page-heading">위인 도감</h1><p class="page-description">한 인물의 등급과 특수능력별 보유 수량을 확인하세요.</p><div class="collection-bonus-summary"><strong>현재 대표 카드</strong><span>${representative ? `${escapeHtml(representative.card.name)} · ${representative.rarity} · ${representative.ability?.name}` : "없음"}</span><span>오늘 카드 보너스 <b>${todayCardBonus(student)} / ${bonusCap}P</b></span></div><div class="collection-filters">${filterButtons}</div>${sections || `<div class="empty">표시할 카드가 없습니다.</div>`}`;
}

function collectionCardButton(card, rarity, student) {
  const quantity = rarityInventoryCount(student, card.id, rarity);
  return `<button class="collection-album-card rarity-${rarityClass(rarity)}" data-action="open-collection-card" data-card-id="${card.id}" data-rarity="${rarity}" aria-label="${escapeHtml(card.name)} ${rarity} 카드 상세 보기">${cardImageMarkup(card, "collection-card-visual")}<strong>${escapeHtml(card.name)}</strong><small>${escapeHtml(card.era)}</small><span class="pill rarity-${rarityClass(rarity)}">${rarity}</span><small>보유 ${quantity}</small></button>`;
}
function studentCollection() {
  const student = currentStudent();
  const availableSets = [...data.cardSets].filter((cardSet) => !cardSet.deleted || sortedCards(true, cardSet.id).some((card) => cardInventoryCount(student, card.id) > 0));
  const orderedSets = availableSets.sort((first, second) => Number(data.activeCardSetIds.includes(second.id)) - Number(data.activeCardSetIds.includes(first.id)) || new Date(first.createdAt) - new Date(second.createdAt));
  if (collectionCardSetFilter !== "all" && !orderedSets.some((cardSet) => cardSet.id === collectionCardSetFilter)) collectionCardSetFilter = "all";
  const shownSetIds = new Set((collectionCardSetFilter === "all" ? orderedSets : orderedSets.filter((cardSet) => cardSet.id === collectionCardSetFilter)).map((cardSet) => cardSet.id));
  const cards = sortedCards(true).filter((card) => shownSetIds.has(card.cardSetId) && (!card.deleted || cardInventoryCount(student, card.id) > 0));
  const filterButtons = `<button class="collection-filter ${collectionCardSetFilter === "all" ? "selected" : ""}" data-action="filter-card-collection" data-id="all">전체</button>${orderedSets.map((cardSet) => `<button class="collection-filter ${collectionCardSetFilter === cardSet.id ? "selected" : ""}" data-action="filter-card-collection" data-id="${cardSet.id}">${escapeHtml(cardSet.name)}</button>`).join("")}`;
  const raritySections = [...CARD_RARITIES].reverse().map((rarity) => { const owned = cards.filter((card) => rarityInventoryCount(student, card.id, rarity) > 0); const total = cards.filter((card) => !card.deleted).length; return `<section class="collection-rarity-section"><div class="section-heading"><div><h2><span class="pill rarity-${rarityClass(rarity)}">${rarity}</span> 카드</h2><p class="muted">${owned.length} / ${total} 수집</p></div></div>${owned.length ? `<div class="collection-album-grid">${owned.map((card) => collectionCardButton(card, rarity, student)).join("")}</div>` : `<div class="empty collection-rarity-empty">아직 획득한 ${rarity} 카드가 없습니다.</div>`}</section>`; }).join("");
  const representative = representativeCardInfo(student); const bonusCap = representative?.setting.dailyCap || 0;
  return `<h1 class="page-heading">위인 도감</h1><p class="page-description">획득한 카드를 등급별로 모아 보고, 눌러서 앞면과 능력을 확인하세요.</p><div class="collection-bonus-summary ${representative ? `rarity-${rarityClass(representative.rarity)}` : ""}">${representative ? cardImageMarkup(representative.card, "collection-representative-image") : ""}<strong>현재 대표 카드</strong><span>${representative ? `${escapeHtml(representative.card.name)} · ${representative.rarity} · ${representative.ability?.name}` : "없음"}</span><span>오늘 카드 보너스 <b>${todayCardBonus(student)} / ${bonusCap}P</b></span></div><div class="collection-filters">${filterButtons}</div>${raritySections}`;
}

function studentRanking() {
  const visibleRankings = RANKING_TYPES.filter((ranking) => data.rankingVisibility[ranking.id]);
  return `<div class="section-heading"><div><h1 class="page-heading">우리 반 활동 랭킹</h1><p class="page-description">여러 활동에서 서로의 성장을 응원해 주세요!</p></div>${rankingPeriodButtons()}</div>${visibleRankings.length ? `<div class="ranking-grid">${visibleRankings.map((ranking) => studentRankingCard(ranking)).join("")}</div>` : `<div class="empty">선생님이 공개한 랭킹이 아직 없어요.</div>`}`;
}

function completedCount(studentId) { return data.roleApplications.filter((item) => item.studentId === studentId && item.status === "completed").length; }
function weekStart() { const date = new Date(); const day = date.getDay(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)); return date; }
function dateInRankingPeriod(value) { if (rankingPeriod === "all") return true; if (!value) return false; let date = new Date(value); if (Number.isNaN(date.getTime())) { const key = historyDateKey(value); date = key ? new Date(`${key}T00:00:00`) : date; } return !Number.isNaN(date.getTime()) && date >= weekStart() && date <= new Date(); }
function activityPointValue(student) { return (student.pointHistory || []).reduce((sum, item) => sum + (["1인1역", "과제"].includes(item.source) && dateInRankingPeriod(item.createdAt || item.date) ? Number(item.amount) || 0 : 0), 0); }
function roleRankingValue(student) { return data.roleApplications.filter((application) => application.studentId === student.id && application.status === "completed" && (rankingPeriod === "all" || dateInRankingPeriod(application.completedAt))).length; }
function assignmentRankingValue(student) { return data.assignments.filter((assignment) => assignmentStatusForStudent(assignment, student.id) === "submitted" && (rankingPeriod === "all" || dateInRankingPeriod(assignment.pointAwards?.[student.id]?.awardedAt))).length; }
function collectionRankingValue(student) { const owned = new Set(); Object.keys(student.cards || {}).forEach((cardId) => CARD_RARITIES.forEach((rarity) => { if (rarityInventoryCount(student, cardId, rarity) > 0) owned.add(`${cardId}|${rarity}`); })); if (rankingPeriod === "all") return owned.size; const weekly = new Set((student.cardAcquisitionHistory || []).filter((item) => dateInRankingPeriod(item.createdAt)).map((item) => `${item.cardId}|${item.rarity}`)); return [...owned].filter((key) => weekly.has(key)).length; }
function rankingValue(type, student) { return type === "activity" ? activityPointValue(student) : type === "roles" ? roleRankingValue(student) : type === "assignments" ? assignmentRankingValue(student) : collectionRankingValue(student); }
function rankedStudents(type) { const sorted = activeStudents().map((student) => ({ student, value: rankingValue(type, student) })).sort((first, second) => second.value - first.value || first.student.name.localeCompare(second.student.name, "ko")); let previousValue; let previousRank = 0; return sorted.map((item, index) => { const rank = item.value === previousValue ? previousRank : index + 1; previousValue = item.value; previousRank = rank; return { ...item, rank }; }); }
function rankingPeriodButtons() { return `<div class="ranking-period"><button class="button ${rankingPeriod === "week" ? "success" : "secondary"} compact" data-action="set-ranking-period" data-period="week">이번 주</button><button class="button ${rankingPeriod === "all" ? "success" : "secondary"} compact" data-action="set-ranking-period" data-period="all">전체</button></div>`; }
function rankingRow(item, unit, mine = false) { return `<div class="ranking-row ${mine ? "mine" : ""}"><strong>${item.rank}위</strong><span>${escapeHtml(item.student.name)}</span><b>${item.value}${unit}</b></div>`; }
function studentRankingCard(ranking) { const rows = rankedStudents(ranking.id); const top = rows.slice(0, 5); const mine = rows.find((item) => item.student.id === session.studentId); return `<article class="card ranking-card"><div class="ranking-card-title"><span>${ranking.icon}</span><h2>${ranking.title}</h2></div><div class="ranking-list">${top.map((item) => rankingRow(item, ranking.unit, item.student.id === session.studentId)).join("")}</div>${mine && !top.some((item) => item.student.id === mine.student.id) ? `<div class="my-ranking"><small>내 순위</small>${rankingRow(mine, ranking.unit, true)}</div>` : ""}</article>`; }
function pointHistoryRow(item) { return `<div class="list-row"><div class="list-main"><strong>${escapeHtml(item.reason)}</strong><small class="muted">${item.date}</small></div><strong class="${item.amount >= 0 ? "points" : ""}">${item.amount >= 0 ? "+" : ""}${item.amount}P</strong></div>`; }

function todayIssuedPoints() {
  const today = todayString();
  const dateKey = (value) => {
    const parts = String(value || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
    return parts ? `${parts[1]}-${parts[2].padStart(2, "0")}-${parts[3].padStart(2, "0")}` : "";
  };
  return data.students.reduce((total, student) => total + (Array.isArray(student.pointHistory) ? student.pointHistory : []).reduce((studentTotal, item) => {
    const isToday = dateKey(item.date) === today;
    const isStudentSpending = item.amount < 0 && (item.source === "카드 뽑기" || String(item.reason || "").includes("카드 뽑기"));
    return studentTotal + (isToday && !isStudentSpending ? Number(item.amount) || 0 : 0);
  }, 0), 0);
}

function localDateKey(value) { if (!value) return ""; const text = String(value); if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text; if (/^\d{4}-\d{2}-\d{2}T/.test(text)) { const isoDate = new Date(text); return Number.isNaN(isoDate.getTime()) ? "" : `${isoDate.getFullYear()}-${String(isoDate.getMonth() + 1).padStart(2, "0")}-${String(isoDate.getDate()).padStart(2, "0")}`; } const parsed = historyDateKey(text); if (parsed) return parsed; const date = new Date(text); return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function assignmentDateKeys(assignment) { return new Set([localDateKey(assignment.createdAt), localDateKey(assignment.dueDate), localDateKey(assignment.completedAt)].filter(Boolean)); }
function assignmentsForDate(dateKey) { return data.assignments.filter((assignment) => assignmentDateKeys(assignment).has(dateKey)); }
function rolesForDate(dateKey) { return data.roleApplications.filter((application) => application.status !== "cancelled" && [roleApplicationDate(application), localDateKey(application.completedAt)].includes(dateKey)); }
function observationsForDate(dateKey) { return data.observations.filter((observation) => localDateKey(observation.date || observation.createdAt) === dateKey).sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)); }
function pointTransactionsForDate(dateKey) { return data.students.flatMap((student) => (student.pointHistory || []).filter((item) => localDateKey(item.createdAt || item.date) === dateKey).map((item) => ({ ...item, studentName: student.name }))); }
function assignmentStatusCounts(assignment) { const statuses = assignmentStatusesForStudents(assignment); return { submitted: statuses.filter((status) => status === "submitted").length, review: statuses.filter((status) => status === "review").length, missing: statuses.filter((status) => status === "missing").length }; }
function pointCategory(item) { if (item.source === "1인1역") return "role"; if (item.source === "과제") return "assignment"; if (item.source === "카드 능력 보너스") return "bonus"; if (item.source === "교사 직접 지급") return "teacherGive"; if (item.source === "교사 직접 차감") return "teacherTake"; if (item.source === "카드 뽑기" || String(item.reason || "").includes("카드 뽑기")) return "draw"; return "other"; }
function calendarActivity(dateKey) { return { assignments: assignmentsForDate(dateKey).length, roles: rolesForDate(dateKey).length, observations: observationsForDate(dateKey).length, note: Boolean(data.dailyClassNotes?.[dateKey]?.text) }; }
function timetableDayForDate(dateKey) { const [year, month, day] = dateKey.split("-").map(Number); const weekday = new Date(year, month - 1, day).getDay(); return TIMETABLE_DAYS.find((item) => item.day === weekday); }
function timetableForDate(dateKey) { const override = data.dateTimetableOverrides?.[dateKey]; if (Array.isArray(override)) return { periods: override, override: true }; const weekday = timetableDayForDate(dateKey); return { periods: weekday ? data.weeklyTimetable[weekday.key] || [] : [], override: false }; }
function timetableRows(periods) { const filled = periods.map((subject, index) => ({ subject, index })).filter((item) => item.subject.trim()); if (!filled.length) return `<div class="empty">등록된 시간표가 없습니다.</div>`; return `<div class="timetable-list">${filled.map((item) => `<div><strong>${item.index + 1}교시</strong><span>${escapeHtml(item.subject)}</span></div>`).join("")}</div>`; }
function dashboardClassPlan() { const timetable = timetableForDate(dashboardSelectedDate); const note = data.dailyClassNotes?.[dashboardSelectedDate]?.text || ""; return `<div class="dashboard-class-plan"><section class="card dashboard-detail"><div class="section-heading"><div><h2>시간표</h2>${timetable.override ? `<span class="pill waiting">이 날짜만 수정됨</span>` : ""}</div><div class="list-actions"><button class="button secondary compact" data-action="edit-date-timetable">이 날짜 시간표 수정</button>${timetable.override ? `<button class="button danger compact" data-action="reset-date-timetable">기본 시간표로 되돌리기</button>` : ""}<button class="button secondary compact" data-action="edit-weekly-timetable">기본 시간표 설정</button></div></div>${timetableRows(timetable.periods)}</section><section class="card dashboard-detail"><div class="section-heading daily-note-heading"><div><h2>주요 사항</h2><input class="daily-note-date" type="date" value="${dashboardSelectedDate}" data-action="select-daily-note-date" aria-label="주요 사항 날짜"></div><button class="button secondary compact" data-action="edit-daily-note">${note ? "수정" : "작성"}</button></div>${note ? `<div class="daily-note-text">${escapeHtml(note).replace(/\n/g, "<br>")}</div>` : `<div class="empty">등록된 주요 사항이 없습니다.</div>`}</section></div>`; }
function periodInputs(periods, prefix = "period") { const length = Math.max(6, periods.length); return Array.from({ length }, (_, index) => `<label>${index + 1}교시<input name="${prefix}-${index}" maxlength="40" value="${escapeHtml(periods[index] || "")}" placeholder="과목 또는 활동"></label>`).join(""); }
function openWeeklyTimetableModal() { const periodCount = Math.max(6, ...TIMETABLE_DAYS.map((day) => data.weeklyTimetable[day.key]?.length || 0)); const header = TIMETABLE_DAYS.map((day) => `<th scope="col">${day.label}</th>`).join(""); const rows = Array.from({ length: periodCount }, (_, periodIndex) => `<tr><th scope="row">${periodIndex + 1}교시</th>${TIMETABLE_DAYS.map((day) => `<td><input name="${day.key}-${periodIndex}" maxlength="40" value="${escapeHtml(data.weeklyTimetable[day.key]?.[periodIndex] || "")}" placeholder="과목 또는 활동" aria-label="${day.label} ${periodIndex + 1}교시"></td>`).join("")}</tr>`).join(""); app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="weekly-timetable-form" class="modal-card form timetable-modal"><div class="section-heading"><div><h2>기본 주간 시간표 설정</h2><p class="muted">각 칸에 과목이나 활동을 입력하세요. 빈 교시는 그대로 두어도 됩니다.</p></div></div><div class="weekly-timetable-table-wrap"><table class="weekly-timetable-table"><thead><tr><th scope="col">교시</th>${header}</tr></thead><tbody>${rows}</tbody></table></div><div class="button-row timetable-modal-actions"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`); }
function openDateTimetableModal() { const periods = timetableForDate(dashboardSelectedDate).periods; app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="date-timetable-form" class="modal-card form" data-date="${dashboardSelectedDate}"><h2>${selectedDateTitle(dashboardSelectedDate)} 시간표 수정</h2><p class="muted">이 날짜에만 적용되며 기본 시간표는 바뀌지 않습니다.</p><div class="timetable-input-grid">${periodInputs(periods)}</div><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`); }
function openDailyNoteModal() { const note = data.dailyClassNotes?.[dashboardSelectedDate]?.text || ""; app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="daily-note-form" class="modal-card form" data-date="${dashboardSelectedDate}"><h2>${selectedDateTitle(dashboardSelectedDate)} 주요 사항</h2><label>여러 줄로 자유롭게 입력하세요<textarea name="text" maxlength="2000" rows="8" placeholder="예: 2교시 소방훈련\n수학 단원평가">${escapeHtml(note)}</textarea></label><div class="button-row"><button class="button success" type="submit">저장</button>${note ? `<button class="button danger" type="submit" data-kind="delete">내용 삭제</button>` : ""}<button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`); }

function nextStudentLoginId(number) {
  const base = `student${String(number).padStart(2, "0")}`; if (!data.students.some((student) => student.loginId?.toLocaleLowerCase("en-US") === base.toLocaleLowerCase("en-US"))) return base;
  let suffix = 2; while (data.students.some((student) => student.loginId?.toLocaleLowerCase("en-US") === `${base}-${suffix}`.toLocaleLowerCase("en-US"))) suffix += 1; return `${base}-${suffix}`;
}
function openClassStudentModal(studentId = "") {
  const student = studentById(studentId); const suggestedNumber = activeStudents().reduce((max, item) => Math.max(max, studentNumber(item)), 0) + 1;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="class-student-form" class="modal-card form" data-id="${studentId}"><h2>${student ? "학생 정보 수정" : "학생 추가"}</h2><label>번호<input name="number" type="number" min="1" max="99" step="1" value="${student ? studentNumber(student) : suggestedNumber}" required></label><label>이름<input name="name" maxlength="30" value="${escapeHtml(student?.name || "")}" required></label><label>로그인 ID<input name="loginId" maxlength="40" pattern="[A-Za-z0-9._-]+" value="${escapeHtml(student?.loginId || nextStudentLoginId(suggestedNumber))}" required><small>영문, 숫자, 점(.), 밑줄(_), 하이픈(-)을 사용할 수 있습니다.</small></label><p class="muted">학생 ID는 변경되지 않아 기존 과제·포인트·카드 기록이 계속 연결됩니다.</p><div class="button-row"><button class="button success" type="submit">${student ? "저장" : "추가"}</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}
function openStudentAccountModal(studentId) {
  const student = studentById(studentId);
  if (!student || student.active === false) return toast("활성 학생만 계정을 만들 수 있습니다.");
  if (!firebaseTeacherSession || !firebaseTeacherUser || !firebaseActiveClassId || !firebaseStudentsConnected || !window.ourClassFirebase?.ready) return toast("교사 로그인과 클라우드 학생 명단 연결을 확인해 주세요.");
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="student-account-form" class="modal-card form" data-id="${student.id}"><h2>학생 계정 만들기</h2><p><strong>${escapeHtml(student.name)}</strong> 학생의 Firebase 로그인 계정을 만듭니다.</p><dl class="backup-summary"><div><dt>학생</dt><dd>${studentNumber(student)}번 ${escapeHtml(student.name)}</dd></div><div><dt>로그인 ID</dt><dd><code>${escapeHtml(student.loginId)}</code></dd></div></dl><p class="muted">로그인 ID는 확인용입니다. 서버에서 현재 클라우드 학생 정보를 다시 확인합니다.</p><label>비밀번호<input name="password" type="password" minlength="6" autocomplete="new-password" required></label><label>비밀번호 확인<input name="passwordConfirm" type="password" minlength="6" autocomplete="new-password" required></label><div class="button-row"><button class="button success" type="submit">계정 만들기</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}
function openStudentPasswordResetModal(studentId) {
  const student = studentById(studentId); const account = firebaseStudentAccountStatuses[studentId];
  if (!student || student.active === false) return toast("활성 학생만 비밀번호를 초기화할 수 있습니다.");
  if (!account?.exists || account.active !== true) return toast("생성된 학생 계정을 확인할 수 없습니다.");
  if (!firebaseTeacherSession || !firebaseTeacherUser || !firebaseActiveClassId || !firebaseStudentsConnected || !window.ourClassFirebase?.ready) return toast("교사 로그인과 클라우드 학생 명단 연결을 확인해 주세요.");
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="student-password-reset-form" class="modal-card form" data-id="${student.id}"><h2>학생 비밀번호 초기화</h2><p><strong>${escapeHtml(student.name)}</strong> 학생의 새 비밀번호를 설정합니다.</p><dl class="backup-summary"><div><dt>학생</dt><dd>${studentNumber(student)}번 ${escapeHtml(student.name)}</dd></div><div><dt>로그인 ID</dt><dd><code>${escapeHtml(student.loginId)}</code></dd></div></dl><label>새 비밀번호<input name="password" type="password" minlength="6" autocomplete="new-password" required></label><label>새 비밀번호 확인<input name="passwordConfirm" type="password" minlength="6" autocomplete="new-password" required></label><div class="button-row"><button class="button success" type="submit">비밀번호 초기화</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}
function studentAccountErrorMessage(error) {
  const code = String(error?.code || "").replace(/^functions\//, "");
  return {
    unauthenticated: "학생 계정을 만들려면 교사 Google 로그인이 필요합니다.",
    "permission-denied": "이 학급의 학생 계정을 만들 권한이 없습니다.",
    "not-found": "학생 또는 학급 정보를 찾을 수 없습니다.",
    "failed-precondition": "활성 상태와 학생 로그인 정보를 확인해 주세요.",
    "already-exists": "같은 로그인 ID에 연결된 다른 학생 계정이 있습니다.",
    "invalid-argument": "비밀번호 또는 학생 로그인 정보를 확인해 주세요."
  }[code] || "학생 계정을 만들지 못했습니다.";
}
function studentPasswordResetErrorMessage(error) {
  const code = String(error?.code || "").replace(/^functions\//, "");
  return {
    unauthenticated: "학생 비밀번호를 초기화하려면 교사 Google 로그인이 필요합니다.",
    "permission-denied": "이 학급 학생의 비밀번호를 초기화할 권한이 없습니다.",
    "not-found": "학생 또는 생성된 학생 계정을 찾을 수 없습니다.",
    "failed-precondition": "활성 학생과 계정 연결 상태를 확인해 주세요.",
    "invalid-argument": "새 비밀번호 입력을 확인해 주세요."
  }[code] || "학생 비밀번호를 초기화하지 못했습니다.";
}
const STUDENT_EXCEL_HEADERS = ["번호", "이름", "아이디", "초기 비밀번호"];
function studentExcelLibraryReady() { return Boolean(window.XLSX?.utils?.aoa_to_sheet && window.XLSX?.read && window.XLSX?.writeFile); }
function buildStudentExcelTemplateWorkbook() {
  if (!studentExcelLibraryReady()) throw new Error("Excel 기능을 불러오지 못했습니다. 인터넷 연결 후 다시 시도해 주세요.");
  const rosterRows = [STUDENT_EXCEL_HEADERS, ...Array.from({length: 30}, () => ["", "", "", ""])];
  const rosterSheet = XLSX.utils.aoa_to_sheet(rosterRows);
  for (let row = 2; row <= 31; row += 1) {
    ["C", "D"].forEach((column) => { const address = `${column}${row}`; rosterSheet[address] = {t: "s", f: '=""', v: "", z: "@", s: {numFmt: "@"}}; });
  }
  rosterSheet["!ref"] = "A1:D31";
  rosterSheet["!cols"] = [{wch: 10}, {wch: 18}, {wch: 24}, {wch: 22}];
  rosterSheet["!autofilter"] = {ref: "A1:D31"};
  const guideRows = [
    ["우리반 퀘스트 학생 등록 양식 작성안내"],
    ["학생명단 Sheet의 첫 행 제목은 수정하지 않는 것을 권장합니다."],
    [],
    ["항목", "설명"],
    ["번호", "반에서 사용하는 학생 번호입니다. 1~99 정수를 입력하고 중복되지 않게 작성하세요."],
    ["이름", "학생 이름입니다. 빈칸 없이 30자 이내로 작성하세요."],
    ["아이디", "학생 로그인용 ID입니다. 영문, 숫자, 점(.), 밑줄(_), 하이픈(-)만 사용할 수 있습니다."],
    ["초기 비밀번호", "최초 로그인용 비밀번호입니다. 현재 계정 규칙과 같이 6자 이상 작성하세요."],
    [],
    ["주의사항"],
    ["번호와 아이디는 Excel 안에서도, 현재 학급의 기존 학생과도 중복될 수 없습니다."],
    ["아이디와 초기 비밀번호는 Excel에서 텍스트 형식으로 입력하는 것을 권장합니다."],
    ["업로드할 때는 학생명단 Sheet만 읽습니다. 업로드한 원본 파일은 서버에 저장하지 않습니다."],
    [],
    ["작성 예시(안내용이며 실제 학생으로 자동 등록되지 않습니다.)"],
    STUDENT_EXCEL_HEADERS,
    [1, "김민준", "minjun01", "class1234"],
    [2, "이서연", "seoyeon02", "class1234"]
  ];
  const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
  guideSheet["!cols"] = [{wch: 22}, {wch: 86}, {wch: 24}, {wch: 24}];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, rosterSheet, "학생명단");
  XLSX.utils.book_append_sheet(workbook, guideSheet, "작성안내");
  return workbook;
}
function downloadStudentExcelTemplate() {
  try { XLSX.writeFile(buildStudentExcelTemplateWorkbook(), "우리반퀘스트_학생등록양식.xlsx", {compression: true, cellStyles: true}); }
  catch (error) { toast(error.message || "Excel 양식을 만들지 못했습니다."); }
}
function clearPendingStudentExcelRows() {
  pendingStudentExcelRows.forEach((row) => { row.password = ""; }); pendingStudentExcelRows = []; pendingStudentExcelFileName = "";
}
function validateStudentExcelRows(sourceRows) {
  const numberCounts = new Map(); const loginCounts = new Map();
  sourceRows.forEach((row) => {
    const numberText = String(row.numberText || "").trim(); const parsedNumber = Number(numberText); const numberKey = numberText && Number.isFinite(parsedNumber) ? String(parsedNumber) : numberText; const loginKey = String(row.loginId || "").trim().toLocaleLowerCase("en-US");
    if (numberKey) numberCounts.set(numberKey, (numberCounts.get(numberKey) || 0) + 1);
    if (loginKey) loginCounts.set(loginKey, (loginCounts.get(loginKey) || 0) + 1);
  });
  return sourceRows.map((source) => {
    const numberText = String(source.numberText || "").trim(); const number = Number(numberText); const name = String(source.name || "").trim(); const loginId = String(source.loginId || "").trim(); const normalizedLoginId = loginId.toLocaleLowerCase("en-US"); const password = String(source.password || ""); const errors = [];
    if (!numberText) errors.push("번호 없음"); else if (!Number.isInteger(number) || number < 1 || number > 99) errors.push("번호는 1~99 정수");
    if (!name) errors.push("이름 없음"); else if (name.length > 30) errors.push("이름 30자 초과");
    if (!loginId) errors.push("아이디 없음"); else if (loginId.length > 40 || !/^[A-Za-z0-9._-]+$/.test(loginId)) errors.push("아이디 형식 오류");
    if (!password) errors.push("비밀번호 없음"); else if (password.length < 6) errors.push("비밀번호 6자 미만");
    const numberKey = numberText && Number.isFinite(number) ? String(number) : numberText;
    if (numberKey && numberCounts.get(numberKey) > 1) errors.push("Excel 내부 번호 중복");
    if (normalizedLoginId && loginCounts.get(normalizedLoginId) > 1) errors.push("Excel 내부 아이디 중복");
    const existingByNumber = Number.isInteger(number) ? data.students.find((student) => studentNumber(student) === number) : null;
    const existingByLoginId = normalizedLoginId ? data.students.find((student) => String(student.loginId || "").trim().toLocaleLowerCase("en-US") === normalizedLoginId) : null;
    const retryStudent = existingByNumber && existingByNumber === existingByLoginId && existingByNumber.active !== false && existingByNumber.name === name && firebaseStudentAccountStatusesLoaded && !firebaseStudentAccountStatuses[existingByNumber.id]?.exists ? existingByNumber : null;
    if (!retryStudent) {
      if (existingByNumber) errors.push("기존 학생 번호와 충돌");
      if (existingByLoginId) errors.push("기존 학생 아이디와 충돌");
    }
    return {rowNumber: source.rowNumber, number, name, loginId, password, errors: [...new Set(errors)], valid: errors.length === 0, retryStudentId: retryStudent?.id || ""};
  });
}
async function parseStudentExcelFile(file) {
  if (!studentExcelLibraryReady()) throw new Error("Excel 기능을 불러오지 못했습니다. 인터넷 연결 후 다시 시도해 주세요.");
  if (!/\.xlsx$/i.test(file?.name || "")) throw new Error(".xlsx 파일만 업로드할 수 있습니다.");
  const workbook = XLSX.read(await file.arrayBuffer(), {type: "array", cellDates: false});
  const sheetName = workbook.SheetNames.includes("학생명단") ? "학생명단" : workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel 파일에 Sheet가 없습니다.");
  const values = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1, raw: false, defval: ""}).map((columns) => [columns[0], columns[1], String(columns[2] ?? ""), String(columns[3] ?? "")]);
  const headers = (values[0] || []).slice(0, 4).map((value) => String(value || "").replace(/^\uFEFF/, "").trim());
  if (STUDENT_EXCEL_HEADERS.some((header, index) => headers[index] !== header)) throw new Error("학생명단 Sheet의 첫 행 제목을 번호 / 이름 / 아이디 / 초기 비밀번호로 유지해 주세요.");
  const rows = values.slice(1).map((columns, index) => ({rowNumber: index + 2, numberText: columns[0], name: columns[1], loginId: columns[2], password: columns[3]})).filter((row) => [row.numberText, row.name, row.loginId, row.password].some((value) => String(value || "").trim()));
  if (!rows.length) throw new Error("학생명단 Sheet에 등록할 학생이 없습니다.");
  if (rows.length > 50) throw new Error("한 번에 최대 50명까지 등록할 수 있습니다.");
  return validateStudentExcelRows(rows);
}
function openStudentExcelPreview(rows, fileName) {
  clearPendingStudentExcelRows(); pendingStudentExcelRows = rows; pendingStudentExcelFileName = fileName;
  const validCount = rows.filter((row) => row.valid).length; const errorCount = rows.length - validCount;
  const body = rows.map((row) => `<tr class="${row.valid ? "is-valid" : "has-error"}"><td>${row.rowNumber}</td><td>${Number.isInteger(row.number) ? row.number : escapeHtml(String(row.number || ""))}</td><td>${escapeHtml(row.name || "-")}</td><td><code>${escapeHtml(row.loginId || "-")}</code></td><td><span aria-label="비밀번호 숨김">••••••</span></td><td><span class="excel-row-status ${row.valid ? "success" : "error"}">${row.valid ? (row.retryStudentId ? "계정 생성 재시도" : "정상") : escapeHtml(row.errors.join(" · "))}</span></td></tr>`).join("");
  app.insertAdjacentHTML("beforeend", `<div class="modal student-excel-modal" data-student-excel-modal><section class="modal-card"><div class="section-heading"><div><h2>학생 등록 미리보기</h2><p class="muted">${escapeHtml(fileName)} · 비밀번호는 화면에 표시하거나 저장하지 않습니다.</p></div></div><div class="student-excel-summary"><div><span>전체</span><strong>${rows.length}명</strong></div><div class="success"><span>등록 가능</span><strong>${validCount}명</strong></div><div class="error"><span>확인 필요</span><strong>${errorCount}명</strong></div></div><div class="student-excel-table-wrap"><table class="student-excel-table"><thead><tr><th>행</th><th>번호</th><th>이름</th><th>아이디</th><th>초기 비밀번호</th><th>상태</th></tr></thead><tbody>${body}</tbody></table></div><p class="student-excel-server-note">전체 시스템의 아이디 충돌은 기존 계정 생성 서버가 최종 등록 시 한 번 더 검사합니다.</p><div class="button-row student-excel-actions"><button class="button secondary" type="button" data-action="close-modal">취소</button><button class="button success" type="button" data-action="confirm-student-excel-import" ${validCount ? "" : "disabled"}>등록 가능한 학생 ${validCount}명 등록</button></div></section></div>`);
}
function showBulkStudentAccountResult({studentCount, createdCount, existingCount, failures}) {
  const successCount = createdCount + existingCount;
  const summary = failures.length ? `학생 명단 ${studentCount}명 등록 완료<br>계정 생성 성공 ${successCount}명 / 실패 ${failures.length}명` : `학생 ${studentCount}명 등록 완료<br>계정 생성 ${successCount}명 성공`;
  const existing = existingCount ? `<p class="muted">이미 생성된 계정 ${existingCount}명 포함</p>` : "";
  const failureList = failures.length ? `<div class="bulk-account-failures"><h3>계정 생성 실패</h3><ul>${failures.map((failure) => `<li>${failure.number}번 ${escapeHtml(failure.name)} · ${escapeHtml(failure.reason)}</li>`).join("")}</ul><p class="muted">실패한 학생은 명단의 개별 계정 만들기 버튼으로 다시 생성할 수 있습니다.</p></div>` : "";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>일괄 등록 결과</h2><p><strong>${summary}</strong></p>${existing}${failureList}<div class="button-row"><button class="button" type="button" data-action="close-modal">확인</button></div></section></div>`);
}
function openStudentExcelProgress(total) {
  app.insertAdjacentHTML("beforeend", `<div class="modal student-excel-progress-modal"><section class="modal-card" role="status" aria-live="polite"><h2>학생 계정을 만들고 있어요</h2><p class="muted">완료될 때까지 창을 닫지 마세요.</p><div class="student-excel-progress"><span style="width:0%"></span></div><strong data-student-excel-progress>0 / ${total}명 완료</strong></section></div>`);
}
function updateStudentExcelProgress(completed, total) {
  const modal = document.querySelector(".student-excel-progress-modal"); const bar = modal?.querySelector(".student-excel-progress span"); const label = modal?.querySelector("[data-student-excel-progress]");
  if (bar) bar.style.width = `${total ? Math.round(completed / total * 100) : 0}%`; if (label) label.textContent = `${completed} / ${total}명 완료`;
}
async function registerPendingStudentExcelRows() {
  if (firebaseBulkStudentAccountsCreating || firebaseStudentAccountCreating) return toast("학생 계정 생성 작업이 진행 중입니다.");
  const validRows = pendingStudentExcelRows.filter((row) => row.valid); if (!validRows.length) return toast("등록 가능한 학생이 없습니다.");
  const actualUser = window.ourClassFirebase?.getCurrentUser?.();
  if (!firebaseTeacherSession || !firebaseTeacherUser?.uid || actualUser?.uid !== firebaseTeacherUser.uid || !firebaseActiveClassId || !firebaseStudentsConnected || !window.ourClassFirebase?.createStudentAccount) return toast("교사 로그인과 클라우드 학생 명단 연결을 확인해 주세요.");
  const userUid = firebaseTeacherUser.uid; const classId = firebaseActiveClassId; const previewModal = document.querySelector("[data-student-excel-modal]");
  const entries = validRows.map((row) => ({row, student: row.retryStudentId ? studentById(row.retryStudentId) : addStudentRecord(row.number, row.name, row.loginId)}));
  const addedStudents = entries.filter((entry) => !entry.row.retryStudentId).map((entry) => entry.student); const studentCount = entries.length;
  firebaseBulkStudentAccountsCreating = true; previewModal?.remove(); saveData(); render(); openStudentExcelProgress(studentCount);
  let rosterSaved = addedStudents.length === 0; let createdCount = 0; let existingCount = 0; const failures = [];
  try {
    if (addedStudents.length) rosterSaved = await saveFirebaseStudentsBatch(addedStudents);
    if (rosterSaved && firebaseTeacherUser?.uid === userUid && firebaseActiveClassId === classId) {
      for (let index = 0; index < entries.length; index += 1) {
        const {row, student} = entries[index];
        try {
          const result = await window.ourClassFirebase.createStudentAccount({classId, studentId: student.id, password: row.password});
          if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId || !result?.ok || result.studentId !== student.id) throw {code: "functions/failed-precondition"};
          if (result.created) createdCount += 1; else existingCount += 1;
          firebaseStudentAccountStatuses[student.id] = {exists: true, active: true, loginId: result.loginId || student.loginId};
        } catch (error) { failures.push({number: row.number, name: row.name, reason: studentAccountErrorMessage(error)}); }
        finally { row.password = ""; updateStudentExcelProgress(index + 1, studentCount); }
      }
    }
    firebaseStudentAccountStatusesLoaded = true; firebaseStudentAccountStatusesLoadFailed = false;
    if (rosterSaved && firebaseTeacherUser?.uid === userUid && firebaseActiveClassId === classId) {
      await loadFirebaseStudents(userUid, false); await loadFirebaseStudentAccountStatuses(userUid, classId);
    }
  } finally {
    if (!rosterSaved && addedStudents.length) { const addedIds = new Set(addedStudents.map((student) => student.id)); data.students = data.students.filter((student) => !addedIds.has(student.id)); data.assignments.forEach((assignment) => { addedIds.forEach((studentId) => { if (assignment.studentStatuses) delete assignment.studentStatuses[studentId]; if (assignment.pointAwards) delete assignment.pointAwards[studentId]; }); }); }
    clearPendingStudentExcelRows(); firebaseBulkStudentAccountsCreating = false; document.querySelector(".student-excel-progress-modal")?.remove(); saveData(); render();
  }
  if (!rosterSaved) return alert("학생 명단을 클라우드에 저장하지 못해 계정 생성을 시작하지 않았습니다.");
  showBulkStudentAccountResult({studentCount, createdCount, existingCount, failures});
}
function addStudentRecord(number, name, loginId) {
  const student = { id: crypto.randomUUID(), number, name, loginId, active: true, points: 0, cards: {}, representativeCard: null, cardUpgradeHistory: [], cardAcquisitionHistory: [], pointHistory: [] };
  data.students.push(student); data.assignments.forEach((assignment) => setAssignmentStatusForStudent(assignment, student.id, "missing")); return student;
}
function dashboardCalendar() {
  const [year, month] = dashboardMonth.split("-").map(Number); const firstDay = new Date(year, month - 1, 1).getDay(); const lastDate = new Date(year, month, 0).getDate(); const cells = Array.from({ length: firstDay }, () => `<div class="calendar-day blank"></div>`);
  for (let day = 1; day <= lastDate; day += 1) { const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`; const activity = calendarActivity(dateKey); const markers = [activity.assignments ? `<span>과제 ${activity.assignments}</span>` : "", activity.roles ? `<span>역할 ${activity.roles}</span>` : "", activity.observations ? `<span>관찰 ${activity.observations}</span>` : "", activity.note ? `<span>주요 사항</span>` : ""].join(""); cells.push(`<button class="calendar-day ${dateKey === dashboardSelectedDate ? "selected" : ""} ${dateKey === todayString() ? "today" : ""}" data-action="select-dashboard-date" data-date="${dateKey}"><strong>${day}</strong><small>${markers}</small></button>`); }
  return `<section class="dashboard-calendar card"><div class="calendar-heading"><button class="icon-button" data-action="move-dashboard-month" data-direction="prev" aria-label="이전 달">‹</button><h2>${year}년 ${month}월</h2><button class="icon-button" data-action="move-dashboard-month" data-direction="next" aria-label="다음 달">›</button><button class="button secondary compact" data-action="dashboard-today">오늘</button></div><div class="calendar-weekdays">${["일", "월", "화", "수", "목", "금", "토"].map((dayName) => `<span>${dayName}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div></section><h2 class="dashboard-date-heading">${selectedDateTitle(dashboardSelectedDate)}</h2>${dashboardClassPlan()}`;
}
function selectedDateTitle(dateKey) { const [year, month, day] = dateKey.split("-").map(Number); const date = new Date(year, month - 1, day); return `${year}년 ${month}월 ${day}일 ${["일", "월", "화", "수", "목", "금", "토"][date.getDay()]}요일`; }
function dashboardAssignmentList(assignments) {
  if (!assignments.length) return `<div class="empty">관련 과제가 없습니다.</div>`;
  const active = assignments.filter((assignment) => !isAssignmentCompleted(assignment));
  const completed = assignments.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
  const shown = [...active, ...completed.slice(0, 5)];
  const rows = shown.map((assignment) => { const counts = assignmentStatusCounts(assignment); return `<article><div><span class="subject-badge">${escapeHtml(assignment.subject)}</span><strong>${escapeHtml(assignment.title)}</strong></div><small>마감 ${assignment.dueDate || "날짜 없음"} · 제출 ${counts.submitted}명 · 확인 대기 ${counts.review}명 · 미제출 ${counts.missing}명</small><span class="pill ${isAssignmentCompleted(assignment) ? "success" : "waiting"}">${isAssignmentCompleted(assignment) ? "과제 완료" : "진행 중"}</span></article>`; }).join("");
  return `<div class="dashboard-detail-list">${rows}</div>${completed.length > 5 ? `<button class="button secondary compact record-view-all" data-action="navigate" data-view="assignments">전체 보기</button>` : ""}`;
}
function dashboardRoleList(roles) {
  if (!roles.length) return `<div class="empty">해당 날짜의 역할 기록이 없습니다.</div>`;
  const waiting = roles.filter((application) => application.status === "waiting");
  const completed = roles.filter((application) => application.status === "completed").sort((first, second) => new Date(second.completedAt || 0) - new Date(first.completedAt || 0));
  const shown = [...waiting, ...completed.slice(0, 5)];
  const rows = shown.map((application) => { const role = roleForApplication(application); const student = studentById(application.studentId); return `<article><div><strong>${escapeHtml(role?.name || "삭제된 역할")}</strong><span>${escapeHtml(student?.name || "학생 정보 없음")}</span></div><span class="pill ${application.status === "completed" ? "success" : "waiting"}">${application.status === "completed" ? "완료" : "수행 대기"}</span><b>${application.status === "completed" ? (application.awardedPoints ?? role?.points ?? 0) : (role?.points ?? 0)}P</b></article>`; }).join("");
  return `<div class="dashboard-detail-list">${rows}</div>${completed.length > 5 ? `<button class="button secondary compact record-view-all" data-action="navigate" data-view="roles">전체 보기</button>` : ""}`;
}
function teacherDashboard() {
  const assignments = assignmentsForDate(dashboardSelectedDate); const roles = rolesForDate(dashboardSelectedDate); const points = pointTransactionsForDate(dashboardSelectedDate); const observations = observationsForDate(dashboardSelectedDate); const submitted = data.assignments.reduce((sum, assignment) => sum + Object.values(assignment.pointAwards || {}).filter((award) => award.awarded && localDateKey(award.awardedAt) === dashboardSelectedDate).length, 0); const completedRoles = roles.filter((role) => role.status === "completed").length; const waitingRoles = roles.filter((role) => role.status === "waiting").length; const issued = points.filter((item) => pointCategory(item) !== "draw").reduce((sum, item) => sum + (Number(item.amount) || 0), 0); const pointTotals = points.reduce((totals, item) => { const key = pointCategory(item); totals[key] = (totals[key] || 0) + (Number(item.amount) || 0); return totals; }, {});
  const pointLabels = [["role", "1인1역"], ["assignment", "과제"], ["bonus", "카드 능력 보너스"], ["teacherGive", "교사 직접 지급"], ["teacherTake", "교사 직접 차감"], ["draw", "카드 뽑기 사용"]];
  const observationList = observations.length ? `<div class="dashboard-detail-list">${observations.slice(0, 5).map((observation) => `<article><div><strong>${escapeHtml(studentById(observation.studentId)?.name || "학생 정보 없음")}</strong><span class="pill">${escapeHtml(observation.category)}</span></div>${observation.quickItems?.length ? `<small>${observation.quickItems.map((item) => `#${escapeHtml(item)}`).join(" ")}</small>` : ""}<p>${escapeHtml(observation.content)}</p></article>`).join("")}</div>${observations.length > 5 ? `<button class="button secondary compact" data-action="navigate" data-view="observations">전체 보기</button>` : ""}` : `<div class="empty">관찰 기록이 없습니다.</div>`;
  return `<div class="section-heading"><div><h1 class="page-heading">선생님 통합 대시보드</h1><p class="page-description">달력에서 날짜를 선택해 학급 활동을 확인하세요.</p></div></div>${dashboardCalendar()}<section class="dashboard-selected-date"><h2>${selectedDateTitle(dashboardSelectedDate)}</h2><div class="dashboard-summary-grid"><article><span>학생 수</span><strong>${data.students.length}명</strong></article><article><span>관련 과제</span><strong>${assignments.length}개</strong></article><article><span>과제 제출 완료</span><strong>${submitted}건</strong></article><article><span>1인1역 완료</span><strong>${completedRoles}건</strong></article><article><span>지급 포인트</span><strong>${issued}P</strong></article><article><span>관찰 기록</span><strong>${observations.length}건</strong></article></div><div class="dashboard-detail-grid"><section class="card dashboard-detail"><div class="section-heading"><h2>과제</h2></div>${dashboardAssignmentList(assignments)}</section><section class="card dashboard-detail"><div class="section-heading"><h2>1인1역</h2><span class="muted">완료 ${completedRoles}명 · 대기 ${waitingRoles}명</span></div>${dashboardRoleList(roles)}</section><section class="card dashboard-detail"><h2>포인트</h2><div class="point-source-summary">${pointLabels.map(([key, label]) => `<div><span>${label}</span><strong class="${(pointTotals[key] || 0) > 0 ? "points" : ""}">${(pointTotals[key] || 0) > 0 ? "+" : ""}${pointTotals[key] || 0}P</strong></div>`).join("")}</div>${points.length ? `<small class="muted">거래 ${points.length}건</small>` : `<div class="empty">포인트 거래가 없습니다.</div>`}</section><section class="card dashboard-detail"><div class="section-heading"><h2>관찰 기록</h2><span class="muted">최근 ${Math.min(5, observations.length)}건</span></div>${observationList}</section></div></section>`;
}

function studentNumber(student) { return Number.isInteger(Number(student?.number)) && Number(student.number) > 0 ? Number(student.number) : data.students.findIndex((item) => item.id === student?.id) + 1; }
function activeAssignmentSummary(student) { const active = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment)); return { active, missing: active.filter((assignment) => assignmentStatusForStudent(assignment, student.id) === "missing").length, review: active.filter((assignment) => assignmentStatusForStudent(assignment, student.id) === "review").length, submitted: active.filter((assignment) => assignmentStatusForStudent(assignment, student.id) === "submitted").length }; }
function todayRoleSummary(student) { const items = data.roleApplications.filter((application) => application.studentId === student.id && application.status !== "cancelled" && [roleApplicationDate(application), localDateKey(application.completedAt)].includes(todayString())); return { items, completed: items.filter((item) => item.status === "completed").length, waiting: items.filter((item) => item.status === "waiting").length }; }
function studentObservations(student) { return data.observations.filter((observation) => observation.studentId === student.id).sort((first, second) => String(second.date).localeCompare(String(first.date)) || new Date(second.createdAt) - new Date(first.createdAt)); }
function compactDate(value) { const key = localDateKey(value); if (!key) return "날짜 없음"; const [, month, day] = key.split("-"); return `${Number(month)}/${Number(day)}`; }
function resetTeacherStudentRepresentativeCards() {
  stopTeacherStudentRepresentativeCardsPolling(); teacherStudentRepresentativeCards = new Map(); teacherStudentRepresentativeCardsClassKey = ""; teacherStudentRepresentativeCardsLoaded = false; teacherStudentRepresentativeCardsLoading = null; teacherStudentRepresentativeCardsListActive = false;
}
function teacherStudentRepresentativeCardsKey() { return firebaseTeacherUser?.uid && firebaseActiveClassId ? `${firebaseTeacherUser.uid}:${firebaseActiveClassId}` : ""; }
function studentRepresentativeLabel(student) {
  if (!teacherStudentRepresentativeCardsLoaded || teacherStudentRepresentativeCardsClassKey !== teacherStudentRepresentativeCardsKey()) return "확인 중...";
  const representative = teacherStudentRepresentativeCards.get(student.id);
  return representative ? `${escapeHtml(representative.cardName)} · ${escapeHtml(representative.representativeCard?.rarity || "")}<br><small>${escapeHtml(representative.abilityIcon || "✨")} ${escapeHtml(representative.abilityName || "삭제된 능력")}</small>` : "대표 카드 없음";
}
function teacherStudentRepresentativeCardsSnapshot(cards) { return JSON.stringify([...cards.entries()].sort(([firstId], [secondId]) => firstId.localeCompare(secondId))); }
function updateTeacherStudentRepresentativeCardsDom() {
  document.querySelectorAll("[data-student-representative-card]").forEach((element) => {
    const student = studentById(element.dataset.studentRepresentativeCard);
    if (student) element.innerHTML = studentRepresentativeLabel(student);
  });
}
async function loadTeacherStudentRepresentativeCards(force = false) {
  const classKey = teacherStudentRepresentativeCardsKey();
  if (!classKey || !window.ourClassFirebase?.getTeacherStudentRepresentativeCards) return false;
  if (teacherStudentRepresentativeCardsClassKey !== classKey) {
    teacherStudentRepresentativeCards = new Map(); teacherStudentRepresentativeCardsClassKey = classKey; teacherStudentRepresentativeCardsLoaded = false; teacherStudentRepresentativeCardsLoading = null;
  }
  if (teacherStudentRepresentativeCardsLoading) return teacherStudentRepresentativeCardsLoading;
  if (teacherStudentRepresentativeCardsLoaded && !force) return true;
  const userUid = firebaseTeacherUser.uid; const classId = firebaseActiveClassId;
  const promise = (async () => {
    try {
      const result = await window.ourClassFirebase.getTeacherStudentRepresentativeCards({classId});
      if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId || teacherStudentRepresentativeCardsClassKey !== classKey) return false;
      const representatives = result?.representatives && typeof result.representatives === "object" ? result.representatives : {};
      const nextCards = new Map(Object.entries(representatives)); const changed = !teacherStudentRepresentativeCardsLoaded || teacherStudentRepresentativeCardsSnapshot(teacherStudentRepresentativeCards) !== teacherStudentRepresentativeCardsSnapshot(nextCards);
      teacherStudentRepresentativeCards = nextCards; teacherStudentRepresentativeCardsLoaded = true;
      if (changed && session.mode === "teacher" && session.view === "students" && !studentDetailId) updateTeacherStudentRepresentativeCardsDom();
      return true;
    } catch (error) {
      console.error("Teacher student representative cards load failed", {code: error?.code, message: error?.message});
      return false;
    } finally { if (teacherStudentRepresentativeCardsLoading === promise) teacherStudentRepresentativeCardsLoading = null; }
  })();
  teacherStudentRepresentativeCardsLoading = promise;
  return promise;
}
function teacherStudentRepresentativeCardsPollingActive() { return document.visibilityState !== "hidden" && session.mode === "teacher" && session.view === "students" && !studentDetailId && Boolean(teacherStudentRepresentativeCardsKey()); }
function stopTeacherStudentRepresentativeCardsPolling() {
  if (teacherStudentRepresentativeCardsPollTimer !== null) clearTimeout(teacherStudentRepresentativeCardsPollTimer);
  teacherStudentRepresentativeCardsPollTimer = null;
}
function scheduleTeacherStudentRepresentativeCardsPolling() {
  stopTeacherStudentRepresentativeCardsPolling();
  if (!teacherStudentRepresentativeCardsPollingActive()) return;
  teacherStudentRepresentativeCardsPollTimer = setTimeout(async () => {
    teacherStudentRepresentativeCardsPollTimer = null;
    if (!teacherStudentRepresentativeCardsPollingActive()) return syncTeacherStudentRepresentativeCards();
    await loadTeacherStudentRepresentativeCards(true);
    scheduleTeacherStudentRepresentativeCardsPolling();
  }, TEACHER_STUDENT_REPRESENTATIVE_CARDS_POLL_INTERVAL);
}
function syncTeacherStudentRepresentativeCards() {
  const active = teacherStudentRepresentativeCardsPollingActive();
  if (!active) { stopTeacherStudentRepresentativeCardsPolling(); teacherStudentRepresentativeCardsListActive = false; return; }
  const entered = !teacherStudentRepresentativeCardsListActive; teacherStudentRepresentativeCardsListActive = true;
  const classKey = teacherStudentRepresentativeCardsKey();
  if (teacherStudentRepresentativeCardsClassKey !== classKey || entered || (!teacherStudentRepresentativeCardsLoaded && !teacherStudentRepresentativeCardsLoading)) {
    stopTeacherStudentRepresentativeCardsPolling(); loadTeacherStudentRepresentativeCards(entered).finally(scheduleTeacherStudentRepresentativeCardsPolling);
  } else if (teacherStudentRepresentativeCardsPollTimer === null && !teacherStudentRepresentativeCardsLoading) scheduleTeacherStudentRepresentativeCardsPolling();
}
function studentManagementCard(student) { const number = studentNumber(student); const assignments = activeAssignmentSummary(student); const roles = todayRoleSummary(student); const observations = studentObservations(student); const assignmentLabel = assignments.missing || assignments.review ? `미제출 ${assignments.missing} · 확인 대기 ${assignments.review}` : "모두 완료"; const roleLabel = roles.completed || roles.waiting ? `완료 ${roles.completed} · 대기 ${roles.waiting}` : "신청 없음"; return `<button class="student-overview-card" data-action="open-student-detail" data-id="${student.id}"><div class="student-overview-heading"><strong>${number}번 ${escapeHtml(student.name)}</strong><span>${student.points}P</span></div><dl><div><dt>과제</dt><dd>${assignmentLabel}</dd></div><div><dt>오늘 1인1역</dt><dd>${roleLabel}</dd></div><div><dt>학생 관찰 기록</dt><dd>${observations.length ? `${observations.length}건 · 최근 ${compactDate(observations[0].date)}` : "기록 없음"}</dd></div><div><dt>대표 카드</dt><dd data-student-representative-card="${escapeHtml(student.id)}">${studentRepresentativeLabel(student)}</dd></div></dl></button>`; }
function isThisWeek(value) { if (!value) return false; let date = new Date(value); if (Number.isNaN(date.getTime())) { const key = localDateKey(value); date = key ? new Date(`${key}T00:00:00`) : date; } return !Number.isNaN(date.getTime()) && date >= weekStart() && date <= new Date(); }
function weeklyEarnedPoints(student) { return (student.pointHistory || []).reduce((sum, item) => sum + (["1인1역", "과제"].includes(item.source) && isThisWeek(item.createdAt || item.date) ? Number(item.amount) || 0 : 0), 0); }
function studentCollectedTypes(student) { const types = new Set(); Object.keys(student.cards || {}).forEach((cardId) => CARD_RARITIES.forEach((rarity) => { if (rarityInventoryCount(student, cardId, rarity) > 0) types.add(`${cardId}|${rarity}`); })); return types.size; }
const TEACHER_CARD_FRAME_ASSETS = {
  "일반": "assets/card-ui/초록빛_황금_장식_카드_프레임.png", "희귀": "assets/card-ui/푸른빛_판타지_카드_프레임_템플릿.png",
  "영웅": "assets/card-ui/보라빛_황금_판타지_카드_프레임.png", "전설": "assets/card-ui/황금_판타지_카드_프레임_ui.png",
  "고대": "assets/card-ui/불꽃_보석_왕관_카드_프레임.png"
};
function teacherStudentCardSummary(studentId) {
  const value = teacherStudentCardData.get(studentId); const items = Array.isArray(value?.items) ? value.items.filter((item) => Number(item.count) > 0) : [];
  const types = new Set(items.map((item) => `${item.cardId}|${item.rarity}`)); const total = items.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const representative = value?.representativeCard; const representativeItem = representative ? items.find((item) => item.cardId === representative.cardId && item.rarity === representative.rarity && item.abilityId === representative.abilityId) : null;
  return {loaded: Boolean(value), value, items, types: types.size, total, representative, representativeItem};
}
function teacherStudentRepresentativeText(summary) {
  const item = summary.representativeItem; return item ? `${escapeHtml(item.cardName)} · ${escapeHtml(item.rarity)} · ${escapeHtml(item.ability?.name || "특수능력")}` : "대표 카드 없음";
}
function teacherStudentCardPanel(student) {
  const summary = teacherStudentCardSummary(student.id); const loading = !summary.loaded;
  const content = loading ? `<div class="empty">Firebase 카드 보유 정보를 불러오는 중입니다.</div>` : `<p><strong>대표 카드:</strong> <span data-teacher-card-representative>${teacherStudentRepresentativeText(summary)}</span></p><p><strong>수집 카드 종류:</strong> <span data-teacher-card-counts>${summary.types}종 · 총 ${summary.total}장</span></p>`;
  return studentRecordSection("카드", loading ? "Firebase 확인 중" : `${summary.types}종 · 총 ${summary.total}장`, content, `<button class="button secondary compact record-view-all" data-action="view-teacher-student-cards" data-id="${escapeHtml(student.id)}" ${loading || !summary.total ? "disabled" : ""}>전체 보기</button>`, "teacher-card-cards").replace('<details class="', `<details data-teacher-student-cards="${escapeHtml(student.id)}" class="`);
}
function teacherCardFrame(item) {
  const image = item.imageData || "assets/portrait-placeholder-v1572.svg"; const frame = TEACHER_CARD_FRAME_ASSETS[item.rarity] || TEACHER_CARD_FRAME_ASSETS["일반"];
  return `<span class="collection-frame-card compact student-v158-rarity-${rarityClass(item.rarity)}"><img class="collection-frame-portrait" src="${escapeHtml(image)}" alt="${escapeHtml(item.cardName)} 카드 이미지"><img class="collection-frame-art" src="${escapeHtml(frame)}" alt="${escapeHtml(item.rarity)} 카드 프레임"></span>`;
}
function openTeacherStudentCardsModal(studentId) {
  const student = studentById(studentId); const summary = teacherStudentCardSummary(studentId); if (!student || !summary.loaded) return;
  const setNames = new Map((Array.isArray(summary.value.cardSets) ? summary.value.cardSets : []).map((set) => [set.id, set.name]));
  const rows = summary.items.map((item) => { const representative = summary.representative?.cardId === item.cardId && summary.representative?.rarity === item.rarity && summary.representative?.abilityId === item.abilityId; return `<article class="teacher-owned-card rarity-${rarityClass(item.rarity)}">${teacherCardFrame(item)}<div><h3>${escapeHtml(item.cardName)}</h3><p>${escapeHtml(setNames.get(item.cardSetId) || "카드셋 정보 없음")}</p><span class="pill rarity-${rarityClass(item.rarity)}">${escapeHtml(item.rarity)}</span><strong>${escapeHtml(item.ability?.icon || "✨")} ${escapeHtml(item.ability?.name || "특수능력")}</strong><small>보유 ${Number(item.count) || 0}장</small>${representative ? `<span class="pill success">대표 카드</span>` : ""}</div></article>`; }).join("");
  app.insertAdjacentHTML("beforeend", `<div class="modal teacher-student-cards-modal"><section class="modal-card"><div class="section-heading"><div><h2>${studentNumber(student)}번 ${escapeHtml(student.name)} · 전체 보유 카드</h2><p class="muted">${summary.types}종 · 총 ${summary.total}장 · 비활성 카드셋의 기존 보유 카드 포함</p></div><button class="button secondary compact" data-action="close-modal">닫기</button></div><div class="teacher-owned-card-grid">${rows || `<div class="empty">보유 카드가 없습니다.</div>`}</div></section></div>`);
}
function studentDetailAssignments(student) {
  const filter = studentDetailAssignmentFilters[student.id] || "all";
  const row = (assignment) => { const status = assignmentStatusForStudent(assignment, student.id); return `<article><div><span class="subject-badge">${escapeHtml(assignment.subject)}</span><strong>${escapeHtml(assignment.title)}</strong></div><small>마감 ${assignment.dueDate || "날짜 없음"}</small><span class="pill ${assignmentStatusClass(status)}">${ASSIGNMENT_STATUS_LABELS[status]}</span></article>`; };
  const active = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment)); const shown = active.filter((assignment) => filter === "all" || assignmentStatusForStudent(assignment, student.id) === filter); const past = data.assignments.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
  const emptyLabels = { missing: "미제출 과제가 없습니다.", review: "확인 대기 중인 과제가 없습니다.", submitted: "제출 완료 과제가 없습니다.", all: "진행 중인 과제가 없습니다." };
  return `<div class="student-detail-list">${shown.length ? shown.map(row).join("") : `<div class="empty">${emptyLabels[filter]}</div>`}</div>${filter === "all" && past.length ? `<div class="student-past-details"><strong>최근 완료 과제 ${Math.min(5, past.length)}건</strong><div class="student-detail-list">${past.slice(0, 5).map(row).join("")}</div></div>` : ""}`;
}
function roleWeekStart(value = new Date()) { const date = new Date(value); date.setHours(0, 0, 0, 0); const day = date.getDay(); date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)); return date; }
function shortLocalDate(date) { return `${date.getMonth() + 1}/${date.getDate()}`; }
function studentRoleFourWeekStats(student) {
  const completed = data.roleApplications.filter((application) => application.studentId === student.id && application.status === "completed");
  const currentStart = roleWeekStart();
  const weeks = Array.from({ length: 4 }, (_, index) => { const start = new Date(currentStart); start.setDate(start.getDate() - (3 - index) * 7); const end = new Date(start); end.setDate(end.getDate() + 6); const count = completed.filter((application) => { const key = localDateKey(application.completedAt); if (!key) return false; const completedDate = new Date(`${key}T00:00:00`); return completedDate >= start && completedDate <= end; }).length; return { label: index === 3 ? "이번 주" : index === 2 ? "지난 주" : `${3 - index}주 전`, range: `${shortLocalDate(start)}~${shortLocalDate(end)}`, count }; });
  return { weeks, thisWeek: weeks[3].count, recentFourWeeks: weeks.reduce((sum, week) => sum + week.count, 0), total: completed.length, completed };
}
function studentRoleHistory(student, completed) {
  const recent = [...completed].sort((first, second) => new Date(second.completedAt || 0) - new Date(first.completedAt || 0)).slice(0, 5);
  if (!recent.length) return `<div class="empty">완료된 1인1역 기록이 없습니다.</div>`;
  return `<div class="student-detail-list">${recent.map((application) => { const role = roleForApplication(application); return `<article><div><strong>${escapeHtml(role?.name || "삭제된 역할")}</strong><span class="pill success">완료</span></div><small>${compactDate(application.completedAt)} · 기본 ${application.awardedBasePoints ?? role?.points ?? 0}P</small></article>`; }).join("")}</div>`;
}
function studentRoleTrend(student) {
  const stats = studentRoleFourWeekStats(student); const max = Math.max(1, ...stats.weeks.map((week) => week.count));
  const chart = stats.recentFourWeeks ? `<div class="role-week-chart">${stats.weeks.map((week, index) => `<div class="role-week-row ${index === 3 ? "current" : ""}"><strong>${week.label}</strong><div class="role-week-track"><span style="width:${week.count ? Math.max(8, Math.round((week.count / max) * 100)) : 0}%"></span></div><b>${week.count}회</b><small>${week.range}</small></div>`).join("")}</div>` : `<div class="empty">최근 4주 역할 수행 기록이 없습니다.</div>`;
  return `<div class="role-trend-summary"><div><span>이번 주</span><strong>${stats.thisWeek}회</strong></div><div><span>최근 4주</span><strong>${stats.recentFourWeeks}회</strong></div><div><span>전체 완료</span><strong>${stats.total}회</strong></div></div><h3 class="student-detail-subheading">최근 4주 역할 수행</h3>${chart}<div class="section-heading role-history-heading"><h3>최근 완료 기록</h3><span class="muted">최대 5개</span></div>${studentRoleHistory(student, stats.completed)}`;
}
function studentDetailObservations(student) { const observations = studentObservations(student); return observations.length ? `<div class="student-detail-list">${observations.slice(0, 5).map((observation) => `<article><div><strong>${observation.date}</strong><span class="pill">${escapeHtml(observation.category)}</span></div>${observation.quickItems?.length ? `<small>${observation.quickItems.map((item) => `#${escapeHtml(item)}`).join(" ")}</small>` : ""}<p>${escapeHtml(observation.content)}</p></article>`).join("")}</div>` : `<div class="empty">학생 관찰 기록이 없습니다.</div>`; }
function teacherPointHistoryRows(student, history) {
  const allHistory = [...(student.pointHistory || [])].sort((a, b) => pointHistorySortValue(b) - pointHistorySortValue(a));
  const reversedOriginalIds = new Set(allHistory.map((item) => item.reversalOf).filter(Boolean));
  return history.length ? `<div class="student-detail-list">${history.map((item) => {
    const amount = Number(item.amount) || 0; const productUse = amount < 0 && String(item.source || "").includes("포인트 상품") && item.relatedId;
    const reversed = productUse && (reversedOriginalIds.has(item.id) || data.pointUseRequests.some((request) => request.id === item.relatedId && request.status === "reversed"));
    const kind = String(item.source || "기타").includes("포인트 상품") ? "포인트 상품 사용 기록" : amount >= 0 ? "적립" : "사용";
    const action = productUse ? `<button class="button secondary compact" data-action="reverse-point-product-use" data-id="${escapeHtml(item.relatedId)}" ${reversed ? "disabled" : ""}>${reversed ? "사용 취소됨" : "되돌리기"}</button>` : "";
    return `<article class="student-point-row"><div><strong>${escapeHtml(item.reason || item.source || "포인트 변동")}</strong><small>${compactDate(item.createdAt || item.date)} · ${escapeHtml(item.source || "기타")} · ${kind}</small></div><b class="${amount > 0 ? "points" : ""}">${amount > 0 ? "+" : ""}${amount}P</b>${action}</article>`;
  }).join("")}</div>` : `<div class="empty">포인트 거래 기록이 없습니다.</div>`;
}
function studentDetailPoints(student) {
  const history = [...(student.pointHistory || [])].sort((a, b) => pointHistorySortValue(b) - pointHistorySortValue(a)).slice(0, 5);
  return `<div class="student-current-points"><span>현재 포인트</span><strong>${student.points}P</strong></div>${teacherPointHistoryRows(student, history)}`;
}
function studentPointRecordSection(student) {
  const count = (student.pointHistory || []).length;
  return `<section class="card student-detail-section teacher-point-record-section teacher-card-points" data-teacher-student-points="${escapeHtml(student.id)}"><header><span>포인트</span><small data-teacher-point-summary>현재 ${student.points}P · 최근 ${Math.min(5, count)}건</small><button class="button secondary compact" data-action="view-student-point-history" data-id="${escapeHtml(student.id)}" ${count ? "" : "hidden"}>전체 보기</button></header><div class="record-section-content">${studentDetailPoints(student)}</div></section>`;
}
function openTeacherPointHistoryModal(studentId) {
  const student = studentById(studentId); if (!student) return;
  const history = [...(student.pointHistory || [])].sort((a, b) => pointHistorySortValue(b) - pointHistorySortValue(a));
  app.insertAdjacentHTML("beforeend", `<div class="modal teacher-point-history-modal" data-teacher-point-modal="${escapeHtml(student.id)}"><section class="modal-card"><div class="section-heading"><div><h2>${studentNumber(student)}번 ${escapeHtml(student.name)} · 전체 포인트 내역</h2><p class="muted">현재 <span data-teacher-modal-points>${student.points}P</span> · 최신 기록부터 표시</p></div><button class="button secondary compact" data-action="close-modal">닫기</button></div><div class="teacher-point-history-scroll">${teacherPointHistoryRows(student, history)}</div></section></div>`);
}
function teacherStudentPointPollingActive() {
  return document.visibilityState !== "hidden" && session.mode === "teacher" && session.view === "students" && Boolean(studentDetailId && firebaseTeacherUser?.uid && (window.ourClassFirebase?.loadStudentPoints || window.ourClassFirebase?.getTeacherStudentCardData));
}
function stopTeacherStudentPointPolling() {
  if (teacherStudentPointPollTimer !== null) clearTimeout(teacherStudentPointPollTimer);
  teacherStudentPointPollTimer = null;
}
function updateTeacherStudentPointDom(student) {
  const page = document.querySelector("[data-teacher-student-detail]");
  if (!page || page.dataset.teacherStudentDetail !== student.id) return;
  const section = page.querySelector("[data-teacher-student-points]");
  const current = page.querySelector("[data-teacher-current-points]");
  if (current) current.textContent = `${student.points}P`;
  if (section) {
    const count = (student.pointHistory || []).length;
    const summary = section.querySelector("[data-teacher-point-summary]");
    const button = section.querySelector('[data-action="view-student-point-history"]');
    const content = section.querySelector(".record-section-content");
    if (summary) summary.textContent = `현재 ${student.points}P · 최근 ${Math.min(5, count)}건`;
    if (button) button.hidden = count === 0;
    if (content) content.innerHTML = studentDetailPoints(student);
  }
  const modal = document.querySelector("[data-teacher-point-modal]");
  if (modal?.dataset.teacherPointModal === student.id) {
    const modalPoints = modal.querySelector("[data-teacher-modal-points]");
    const modalHistory = modal.querySelector(".teacher-point-history-scroll");
    if (modalPoints) modalPoints.textContent = `${student.points}P`;
    if (modalHistory) modalHistory.innerHTML = teacherPointHistoryRows(student, [...student.pointHistory].sort((a, b) => pointHistorySortValue(b) - pointHistorySortValue(a)));
  }
}
function updateTeacherStudentCardDom(studentId) {
  const page = document.querySelector("[data-teacher-student-detail]"); if (!page || page.dataset.teacherStudentDetail !== studentId) return;
  const student = studentById(studentId); if (!student) return; const summary = teacherStudentCardSummary(studentId);
  const previous = page.querySelector("[data-teacher-student-cards]"); if (previous) previous.outerHTML = teacherStudentCardPanel(student);
  const representative = page.querySelector("[data-teacher-profile-card-representative]"); const types = page.querySelector("[data-teacher-profile-card-types]");
  if (representative) representative.innerHTML = summary.representativeItem ? `${escapeHtml(summary.representativeItem.cardName)} · ${escapeHtml(summary.representativeItem.rarity)}<small>${escapeHtml(summary.representativeItem.ability?.name || "")}</small>` : `없음<small></small>`;
  if (types) types.textContent = `${summary.types}종`;
  const modal = document.querySelector(".teacher-student-cards-modal"); if (modal) { modal.remove(); openTeacherStudentCardsModal(studentId); }
}
async function refreshTeacherStudentPoints(studentId) {
  if (!studentId) return false;
  if (teacherStudentPointRefreshes.has(studentId)) return teacherStudentPointRefreshes.get(studentId);
  const promise = (async () => {
    try {
      const [pointResult, cardResult] = await Promise.all([
        firebasePointsConnected && window.ourClassFirebase?.loadStudentPoints ? window.ourClassFirebase.loadStudentPoints(studentId).catch((error) => { console.error("Teacher student point polling failed", {studentId, code: error?.code, message: error?.message}); return null; }) : null,
        window.ourClassFirebase?.getTeacherStudentCardData ? window.ourClassFirebase.getTeacherStudentCardData({studentId}).catch((error) => { console.error("Teacher student card polling failed", {studentId, code: error?.code, message: error?.message}); return null; }) : null
      ]);
      const student = studentById(studentId); if (!student) return false; let changed = false;
      if (pointResult?.id === studentId) {
        const nextHistory = (Array.isArray(pointResult.history) ? pointResult.history : []).filter((entry) => entry?.id).sort((a, b) => pointHistorySortValue(a) - pointHistorySortValue(b));
        if (student.points !== pointResult.points || JSON.stringify(student.pointHistory || []) !== JSON.stringify(nextHistory)) { student.points = pointResult.points; student.pointHistory = nextHistory; updateTeacherStudentPointDom(student); changed = true; }
      }
      if (cardResult?.studentId === studentId) {
        const previous = teacherStudentCardData.get(studentId); const next = {items: Array.isArray(cardResult.items) ? cardResult.items : [], representativeCard: cardResult.representativeCard || null, cardSets: Array.isArray(cardResult.cardSets) ? cardResult.cardSets : []};
        if (JSON.stringify(previous || null) !== JSON.stringify(next)) { teacherStudentCardData.set(studentId, next); updateTeacherStudentCardDom(studentId); changed = true; }
      }
      return changed;
    } catch (error) {
      console.error("Teacher student detail polling failed", {studentId, code: error?.code, message: error?.message});
      return false;
    } finally { teacherStudentPointRefreshes.delete(studentId); }
  })();
  teacherStudentPointRefreshes.set(studentId, promise);
  return promise;
}
function scheduleTeacherStudentPointPolling() {
  stopTeacherStudentPointPolling();
  if (!teacherStudentPointPollingActive()) return;
  const studentId = studentDetailId;
  teacherStudentPointPollTimer = setTimeout(async () => {
    teacherStudentPointPollTimer = null;
    if (!teacherStudentPointPollingActive() || studentDetailId !== studentId) return syncTeacherStudentPointPolling();
    await refreshTeacherStudentPoints(studentId);
    scheduleTeacherStudentPointPolling();
  }, TEACHER_STUDENT_POINT_POLL_INTERVAL);
}
function syncTeacherStudentPointPolling(immediate = false) {
  if (!teacherStudentPointPollingActive()) { stopTeacherStudentPointPolling(); teacherStudentPointPollStudentId = ""; return; }
  const changedStudent = teacherStudentPointPollStudentId !== studentDetailId;
  if (changedStudent) { stopTeacherStudentPointPolling(); teacherStudentPointPollStudentId = studentDetailId; }
  if (changedStudent || immediate) refreshTeacherStudentPoints(studentDetailId).finally(scheduleTeacherStudentPointPolling);
  else if (teacherStudentPointPollTimer === null) scheduleTeacherStudentPointPolling();
}
function studentRecordSection(title, summary, content, action = "", className = "") { return `<details class="card student-detail-section record-section ${className}" open><summary><span>${title}</span><small>${summary}</small></summary><div class="record-section-content">${content}${action}</div></details>`; }
function teacherStudentDetail(student) {
  const assignments = activeAssignmentSummary(student); const observations = studentObservations(student); const roleStats = studentRoleFourWeekStats(student); const cardSummary = teacherStudentCardSummary(student.id); const assignmentFilter = studentDetailAssignmentFilters[student.id] || "all";
  const assignmentButtons = [["all", "전체", assignments.active.length], ["missing", "미제출", assignments.missing], ["review", "확인 대기", assignments.review], ["submitted", "제출 완료", assignments.submitted]].map(([value, label, count]) => `<button class="student-assignment-filter ${assignmentFilter === value ? "active" : ""}" data-action="filter-student-detail-assignments" data-id="${student.id}" data-status="${value}">${label} ${count}</button>`).join("");
  const assignmentCard = studentRecordSection("과제", `${assignments.active.length}개 중 ${assignmentFilter === "all" ? "전체" : ASSIGNMENT_STATUS_LABELS[assignmentFilter]} 보기`, studentDetailAssignments(student), `<button class="button secondary compact record-view-all" data-action="view-student-assignments" data-id="${student.id}">전체 보기</button>`, "teacher-card-assignments");
  const roleCard = studentRecordSection("1인1역", `이번 주 완료 ${roleStats.thisWeek}회 · 최근 4주 ${roleStats.recentFourWeeks}회`, studentRoleTrend(student), roleStats.total > 5 ? `<button class="button secondary compact record-view-all" data-action="navigate" data-view="roles">전체 기록 보기</button>` : "", "teacher-card-roles");
  const observationCard = studentRecordSection("학생 관찰 기록", `총 ${observations.length}건 · 최근 최대 5건`, studentDetailObservations(student), `<button class="button secondary compact record-view-all" data-action="manage-student-observations" data-id="${student.id}">전체 보기</button>`, "teacher-card-observations");
  const cardCard = teacherStudentCardPanel(student); const representativeProfile = cardSummary.loaded && cardSummary.representativeItem ? `${escapeHtml(cardSummary.representativeItem.cardName)} · ${escapeHtml(cardSummary.representativeItem.rarity)}<small>${escapeHtml(cardSummary.representativeItem.ability?.name || "")}</small>` : `${cardSummary.loaded ? "없음" : "확인 중"}<small></small>`;
  return `<div class="student-detail-page" data-teacher-student-detail="${escapeHtml(student.id)}"><div class="section-heading"><div><button class="button secondary compact" data-action="close-student-detail">← 학생 목록</button><h1 class="page-heading">${studentNumber(student)}번 ${escapeHtml(student.name)}</h1><p class="page-description">학생 한 명을 중심으로 현재 상태와 최근 기록을 확인합니다.</p></div><div class="button-row">${studentAccountButton(student)}</div></div><section class="student-profile-summary card"><div><span>현재 포인트</span><strong data-teacher-current-points>${student.points}P</strong></div><div><span>대표 카드</span><strong data-teacher-profile-card-representative>${representativeProfile}</strong></div><div><span>수집 카드 종류</span><strong data-teacher-profile-card-types>${cardSummary.loaded ? `${cardSummary.types}종` : "확인 중"}</strong></div></section><div class="student-recent-summary"><article class="student-assignment-summary"><span>진행 중 과제</span><div class="student-assignment-filters">${assignmentButtons}</div></article><article><span>이번 주 1인1역</span><strong>완료 ${roleStats.thisWeek}회</strong></article><article><span>이번 주 획득 포인트</span><strong>${weeklyEarnedPoints(student)}P</strong></article><article><span>학생 관찰 기록</span><strong>총 ${observations.length}건</strong></article></div><div class="student-detail-grid"><div class="student-detail-column teacher-student-column-left">${assignmentCard}${observationCard}${cardCard}</div><div class="student-detail-column teacher-student-column-right">${roleCard}${studentPointRecordSection(student)}</div></div></div>`;
}
function teacherStudents() { const selected = studentById(studentDetailId); if (selected && selected.active !== false) return teacherStudentDetail(selected); const keyword = studentManagementSearch.trim().toLocaleLowerCase("ko-KR"); const students = activeStudents().filter((student) => !keyword || student.name.toLocaleLowerCase("ko-KR").includes(keyword) || String(studentNumber(student)).includes(keyword)); return `<div class="section-heading"><div><h1 class="page-heading">학생 관리</h1><p class="page-description">전체 학생의 객관적인 현재 상태를 한눈에 확인하세요.</p></div></div><div class="student-management-search"><input id="student-management-search" value="${escapeHtml(studentManagementSearch)}" placeholder="학생 이름 또는 번호 검색" aria-label="학생 이름 또는 번호 검색"><button class="button secondary compact" data-action="reset-student-management-search">초기화</button><span id="student-management-count">${students.length}명</span></div><div class="student-overview-grid">${students.map(studentManagementCard).join("") || `<div class="empty">검색 결과가 없습니다.</div>`}</div>`; }

function studentAccountButton(student) {
  const ready = firebaseTeacherSession && firebaseTeacherUser && firebaseActiveClassId && firebaseStudentsConnected && window.ourClassFirebase?.ready;
  if (!ready) return `<button class="button success compact" disabled>계정 만들기</button>`;
  if (firebaseBulkStudentAccountsCreating) return `<button class="button secondary compact" disabled>일괄 생성 중</button>`;
  if (firebaseStudentAccountStatusesLoadFailed) return `<button class="button secondary compact" disabled>확인 실패</button>`;
  if (!firebaseStudentAccountStatusesLoaded || firebaseStudentAccountStatusesLoading) return `<button class="button secondary compact" disabled>확인 중...</button>`;
  const account = firebaseStudentAccountStatuses[student.id];
  if (account?.exists) return `<span class="student-account-status">✅ 계정 생성됨</span><button class="button secondary compact" data-action="reset-student-password" data-id="${student.id}">비밀번호 초기화</button>`;
  return `<button class="button success compact" data-action="open-student-account" data-id="${student.id}">계정 만들기</button>`;
}
function studentAccessUrl() {
  if (!firebaseActiveClassId) return "";
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("class", firebaseActiveClassId);
  return url.toString();
}
function studentAccessSection() {
  const url = studentAccessUrl();
  if (!url) return `<div class="student-access-card"><div class="student-access-copy"><strong>학생 접속</strong><p>학생들이 접속할 우리 반 전용 주소입니다.</p></div><div class="button-row student-access-actions"><button class="button" disabled>학생 접속 링크 복사</button><button class="button secondary" disabled>학생 화면 열기 ↗</button></div><p class="student-access-unavailable">먼저 사용할 학급을 선택해 주세요.</p></div>`;
  const safeUrl = escapeHtml(url);
  return `<div class="student-access-card"><div class="student-access-copy"><strong>학생 접속</strong><p>학생들이 접속할 우리 반 전용 주소입니다.</p></div><div class="button-row student-access-actions"><button class="button" data-action="copy-student-access-link">학생 접속 링크 복사</button><a class="button secondary" href="${safeUrl}" target="_blank" rel="noopener noreferrer">학생 화면 열기 ↗</a></div><div class="student-access-preview"><span>학생 접속 주소</span><a href="${safeUrl}" target="_blank" rel="noopener noreferrer" title="${safeUrl}">${safeUrl}</a></div></div>`;
}
async function copyStudentAccessLink() {
  const url = studentAccessUrl();
  if (!url) return toast("먼저 사용할 학급을 선택해 주세요.");
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API is unavailable.");
    await navigator.clipboard.writeText(url);
    toast("학생 접속 링크를 복사했습니다.");
  } catch (error) {
    console.warn("Student access link copy failed", error);
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card student-access-fallback"><h2>학생 접속 주소</h2><p>자동 복사하지 못했습니다. 아래 주소를 직접 복사해 주세요.</p><input type="text" value="${escapeHtml(url)}" readonly aria-label="학생 접속 주소"><div class="button-row"><button class="button secondary" data-action="close-modal">닫기</button></div></section></div>`);
    const input = document.querySelector(".student-access-fallback input");
    input?.focus(); input?.select();
  }
}
function teacherClassSettingsBase() {
  const keyword = classStudentSearch.trim().toLocaleLowerCase("ko-KR");
  const students = activeStudents().filter((student) => !keyword || String(studentNumber(student)).includes(keyword) || student.name.toLocaleLowerCase("ko-KR").includes(keyword) || student.loginId.toLocaleLowerCase("en-US").includes(keyword));
  const rows = students.map((student) => `<tr data-class-student-id="${student.id}"><td>${studentNumber(student)}</td><td><strong>${escapeHtml(student.name)}</strong></td><td><code>${escapeHtml(student.loginId)}</code></td><td><div class="button-row class-student-actions">${studentAccountButton(student)}<button class="button secondary compact" data-action="edit-class-student" data-id="${student.id}">수정</button><button class="button danger compact" data-action="ask-delete-class-student" data-id="${student.id}">비활성화</button></div></td></tr>`).join("");
  const inactiveStudents = data.students.filter((student) => student.active === false).sort((first, second) => studentNumber(first) - studentNumber(second) || first.name.localeCompare(second.name, "ko"));
  const inactiveRows = inactiveStudents.map((student) => `<tr><td>${studentNumber(student)}</td><td><strong>${escapeHtml(student.name)}</strong></td><td><code>${escapeHtml(student.loginId)}</code></td><td><div class="button-row class-student-actions"><button class="button secondary compact" data-action="edit-class-student" data-id="${student.id}">수정</button><button class="button success compact" data-action="restore-class-student" data-id="${student.id}">복구</button></div></td></tr>`).join("");
  const inactiveSection = inactiveStudents.length ? `<details class="inactive-student-section"><summary>비활성 학생 ${inactiveStudents.length}명 보기</summary><p class="muted">기존 활동 기록은 유지되며 언제든 복구할 수 있습니다.</p><div class="class-roster-table-wrap"><table class="class-roster-table"><thead><tr><th>번호</th><th>이름</th><th>로그인 ID</th><th>관리</th></tr></thead><tbody>${inactiveRows}</tbody></table></div></details>` : "";
  return `<div class="section-heading"><div><h1 class="page-heading">학급 설정</h1><p class="page-description">우리 반 기본 정보와 모든 기능에서 함께 사용하는 학생 명단을 관리합니다.</p></div></div><section class="card class-settings-card"><h2>학급 정보</h2><form id="class-info-form" class="class-info-form"><label>프로그램 이름<input name="appName" maxlength="50" value="${escapeHtml(data.classSettings.appName)}" required placeholder="예: 우리반 퀘스트"></label><label>학급 이름<input name="className" maxlength="50" value="${escapeHtml(data.classSettings.className)}" required placeholder="예: 5학년 2반"></label><label>선생님 표시 이름<input name="teacherName" maxlength="30" value="${escapeHtml(data.classSettings.teacherName)}" required placeholder="예: 윤석훈"></label><button class="button success" type="submit">저장</button></form></section><section class="card class-roster-card"><div class="section-heading"><div><h2>학생 명단 <span class="muted">총 ${activeStudents().length}명</span></h2><p class="muted">번호와 이름은 바꿀 수 있지만 학생 ID와 연결된 기존 기록은 그대로 유지됩니다.</p></div><div class="button-row class-roster-actions"><button class="button secondary" data-action="download-student-excel-template">엑셀 양식 다운로드</button><button class="button secondary" data-action="upload-student-excel">엑셀로 학생 등록</button><button class="button success" data-action="new-class-student">+ 학생 추가</button><input id="student-excel-upload" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></div></div>${studentAccessSection()}<div class="class-student-search"><input id="class-student-search" type="search" value="${escapeHtml(classStudentSearch)}" placeholder="번호, 이름 또는 로그인 ID 검색"><span>${students.length}명 표시</span></div><div class="class-roster-table-wrap"><table class="class-roster-table"><thead><tr><th>번호</th><th>이름</th><th>로그인 ID</th><th>관리</th></tr></thead><tbody>${rows || `<tr><td colspan="4"><div class="empty">검색 결과가 없습니다.</div></td></tr>`}</tbody></table></div><p class="class-login-note">학생 로그인과 비밀번호 관리는 Firebase 연결 후 사용할 수 있습니다. Excel 초기 비밀번호는 계정 생성 요청 후 메모리에서 지웁니다.</p>${inactiveSection}</section>`;
}

function classFeatureSettings() {
  const items = CLASS_FEATURES.map((feature) => `<label class="class-feature-row"><span><strong>${feature.label}</strong><small>${feature.description}</small></span><span class="feature-toggle"><input type="checkbox" name="${feature.key}" ${featureEnabled(feature.key) ? "checked" : ""}><b>${featureEnabled(feature.key) ? "사용" : "사용 안 함"}</b></span></label>`).join("");
  return `<section class="card class-feature-settings"><div class="section-heading"><div><h2>기능 사용 설정</h2><p class="muted">이 학급에서 사용할 기능만 선택하세요. 기능을 꺼도 기존 데이터는 삭제되지 않습니다.</p></div></div><form id="class-feature-form"><div class="class-feature-list">${items}</div><div class="button-row"><button class="button success" type="submit">기능 설정 저장</button></div></form><p class="class-core-features">대시보드 · 학생 관리 · 관찰 기록 · 학급 설정은 항상 사용할 수 있습니다.</p></section>`;
}
function cloudStudentSettings() { if (!firebaseActiveClassId) return ""; if (!firebaseStudentsChecked) return `<div><button class="button secondary" disabled>학생 명단 확인 중</button><p class="muted">클라우드 학생 명단을 확인하고 있습니다.</p></div>`; if (firebaseStudentsLoadFailed) return `<div><button class="button secondary" disabled>학생 명단 확인 실패</button><p class="muted">로컬 학생 데이터는 그대로 유지됩니다.</p></div>`; if (firebaseStudentsConnected) return `<div><button class="button secondary" disabled>학생 명단 연결됨</button><p class="muted">학생 기본정보가 클라우드 학급과 연결되어 있습니다.</p></div>`; return `<div><button class="button success" data-action="connect-cloud-students">현재 학생 명단을 클라우드에 연결</button><p class="muted">학생의 번호, 이름, 로그인 ID, 활성 상태만 저장합니다.</p></div>`; }
function cloudAssignmentSettings() { if (!firebaseStudentsConnected) return ""; if (firebaseAssignmentsConnected) return `<div><button class="button secondary" disabled>과제 기본정보 연결됨</button><p class="muted">과제 기본정보가 클라우드 학급과 연결되어 있습니다.</p></div>`; return `<div><button class="button success" data-action="connect-cloud-assignments">현재 과제를 클라우드에 연결</button><p class="muted">과제 제목, 내용, 마감일, 지급 포인트 설정 등 과제 기본정보만 클라우드에 저장합니다.</p></div>`; }
function cloudPointSettings() { if (!firebaseStudentsConnected) return ""; if (firebasePointsConnected) return `<div><button class="button secondary" disabled>포인트 및 포인트 기록 연결됨</button><p class="muted">학생 포인트와 포인트 기록이 클라우드 학급과 연결되어 있습니다.</p></div>`; return `<div><button class="button success" data-action="connect-cloud-points">현재 포인트를 클라우드에 연결</button><p class="muted">학생의 현재 포인트와 기존 포인트 기록을 클라우드에 저장합니다.</p></div>`; }
function cloudAssignmentStudentStateSettings() { if (!firebaseActiveClassId) return ""; if (firebaseAssignmentStudentStatesConnected) return `<div><button class="button secondary" disabled>과제 제출 상태 연결됨</button><p class="muted">과제의 학생별 제출 상태와 포인트 지급 snapshot이 클라우드와 연결되어 있습니다.</p></div>`; if (firebaseAssignmentStudentStatesConnecting) return `<div><button class="button secondary" disabled>과제 제출 상태 연결 중</button><p class="muted">현재 상태를 클라우드에 저장하고 있습니다.</p></div>`; const ready = firebaseStudentsConnected && firebaseAssignmentsConnected && firebasePointsConnected; return `<div><button class="button ${ready ? "success" : "secondary"}" data-action="connect-cloud-assignment-states" ${ready ? "" : "disabled"}>과제 제출 상태를 클라우드에 연결</button><p class="muted">과제 제출 상태 클라우드 미연결 · ${ready ? "학생별 제출 상태와 기존 포인트 지급 snapshot만 저장합니다." : "학생 명단, 과제 기본정보, 포인트를 먼저 연결해 주세요."}</p></div>`; }
function cloudRoleSettings() { if (!firebaseActiveClassId) return ""; if (firebaseRolesConnected) return `<div><button class="button secondary" disabled>1인1역 연결됨</button><p class="muted">1인1역 설정, 템플릿, 신청 및 완료 기록이 클라우드와 연결되어 있습니다.</p></div>`; if (firebaseRolesConnecting) return `<div><button class="button secondary" disabled>1인1역 연결 중</button><p class="muted">현재 1인1역 데이터를 클라우드에 저장하고 있습니다.</p></div>`; const ready = firebaseStudentsConnected && firebasePointsConnected; return `<div><button class="button ${ready ? "success" : "secondary"}" data-action="connect-cloud-roles" ${ready ? "" : "disabled"}>1인1역을 클라우드에 연결</button><p class="muted">1인1역 클라우드 미연결 · ${ready ? "현재 설정, 템플릿, 기존 신청 기록만 저장합니다." : "학생 명단과 포인트를 먼저 연결해 주세요."}</p></div>`; }
function cloudObservationSettings() { if (!firebaseActiveClassId) return ""; if (firebaseObservationsConnected) return `<div><button class="button secondary" disabled>관찰기록 연결됨</button><p class="muted">관찰기록과 빠른 선택 항목이 클라우드 학급과 연결되어 있습니다.</p></div>`; if (firebaseObservationsConnecting) return `<div><button class="button secondary" disabled>관찰기록 연결 중</button><p class="muted">현재 관찰기록 데이터를 클라우드에 저장하고 있습니다.</p></div>`; const ready = firebaseStudentsConnected; return `<div><button class="button ${ready ? "success" : "secondary"}" data-action="connect-cloud-observations" ${ready ? "" : "disabled"}>관찰기록을 클라우드에 연결</button><p class="muted">관찰기록 클라우드 미연결 · ${ready ? "현재 관찰기록과 빠른 선택 항목을 저장합니다." : "학생 명단을 먼저 연결해 주세요."}</p></div>`; }
function cloudGroupSettings() { if (!firebaseActiveClassId) return ""; if (firebaseGroupsConnected) return `<div><button class="button secondary" disabled>모둠활동 연결됨</button><p class="muted">모둠 구성, 점수, 배정, 기록과 공동 미션이 클라우드 학급과 연결되어 있습니다.</p></div>`; if (firebaseGroupsConnecting) return `<div><button class="button secondary" disabled>모둠활동 연결 중</button><p class="muted">현재 모둠활동 데이터를 클라우드에 저장하고 있습니다.</p></div>`; const ready = firebaseStudentsConnected; return `<div><button class="button ${ready ? "success" : "secondary"}" data-action="connect-cloud-groups" ${ready ? "" : "disabled"}>모둠활동을 클라우드에 연결</button><p class="muted">모둠활동 클라우드 미연결 · ${ready ? "현재 모둠 구성과 점수, 배정, 기록, 공동 미션을 저장합니다." : "학생 명단을 먼저 연결해 주세요."}</p></div>`; }
function cloudClassSettings() { if (!firebaseTeacherSession) return ""; if (!firebaseClassChecked) return `<div><button class="button secondary" disabled>클라우드 학급 확인 중</button><p class="muted">Google 계정에 연결된 학급을 확인하고 있습니다.</p></div>`; if (firebaseClassLoadFailed) return `<div><button class="button secondary" disabled>클라우드 연결 확인 실패</button><p class="muted">로컬 데이터는 그대로 유지됩니다. 네트워크를 확인한 뒤 새로고침해 주세요.</p></div>`; if (firebaseActiveClassId) return `<div><button class="button secondary" disabled>클라우드 학급 연결됨</button><p class="muted">학급 기본정보가 이 Google 계정과 연결되어 있습니다.</p></div>${cloudStudentSettings()}${cloudAssignmentSettings()}${cloudPointSettings()}${cloudAssignmentStudentStateSettings()}${cloudRoleSettings()}${cloudObservationSettings()}${cloudGroupSettings()}`; return `<div><button class="button success" data-action="connect-cloud-class">현재 학급을 클라우드에 연결</button><p class="muted">반 이름, 선생님 이름, 프로그램 이름만 클라우드에 저장합니다.</p></div>`; }
function dataManagementSettings() { return `<section class="card data-management-card"><h2>데이터 관리</h2><div class="data-management-actions">${cloudClassSettings()}<div><button class="button secondary" data-action="download-backup">백업 파일 다운로드</button><p class="muted">우리 반의 학생, 과제, 포인트, 카드 등 현재 데이터를 JSON 파일로 저장합니다.</p></div><div><button class="button secondary" data-action="choose-backup-file">백업 파일 복원</button><input id="backup-file-input" type="file" accept="application/json,.json" hidden><p class="muted">우리반 퀘스트 백업 JSON을 확인한 뒤 현재 데이터로 복원합니다.</p></div></div><div class="student-activity-reset"><h3>학생 활동 데이터 초기화</h3><p>학생 계정과 학급 설정은 유지하고 테스트 과정에서 생긴 학생 활동 기록만 초기화합니다.</p><button class="button danger" data-action="open-student-activity-reset" ${firebaseActiveClassId && !firebaseStudentActivityResetting ? "" : "disabled"}>학생 활동 데이터 초기화</button></div><div class="data-reset-danger"><h3>⚠ 데이터 초기화</h3><p>학생, 과제, 포인트, 관찰 기록, 카드 등 모든 데이터를 초기 상태로 되돌립니다.</p><button class="button danger" data-action="open-reset-data">모든 데이터 초기화</button></div></section>`; }
function teacherClassSettings() { return `${teacherClassSettingsBase()}${classFeatureSettings()}${dataManagementSettings()}`; }
function openRestoreBackupModal(payload) { const className = payload.data.classSettings?.className || payload.className || "이름 없음"; const exportedAt = payload.exportedAt ? new Date(payload.exportedAt).toLocaleString("ko-KR") : "날짜 정보 없음"; app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>백업 파일 복원</h2><p>현재 학급 데이터를 백업 파일의 내용으로 교체합니다.</p><dl class="backup-summary"><div><dt>학급 이름</dt><dd>${escapeHtml(className)}</dd></div><div><dt>학생 수</dt><dd>${payload.data.students.length}명</dd></div><div><dt>백업 날짜</dt><dd>${escapeHtml(exportedAt)}</dd></div></dl><div class="button-row"><button class="button danger" data-action="confirm-restore-backup">복원하기</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); }
function openResetDataModal() { app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card reset-data-modal"><h2>모든 데이터 초기화</h2><p>학생, 과제, 포인트, 관찰 기록, 카드 등 현재 학급의 모든 데이터가 초기 상태로 돌아갑니다.</p><p class="muted">초기화 전에 백업 파일을 다운로드하는 것을 권장합니다.</p><button class="button secondary" data-action="download-backup">먼저 백업 다운로드</button><label>확인을 위해 <strong>초기화</strong>를 입력하세요.<input id="reset-data-confirmation" autocomplete="off"></label><div class="button-row"><button id="confirm-reset-data" class="button danger" data-action="confirm-reset-data" disabled>정말 초기화</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); }
function openStudentActivityResetModal() {
  if (!firebaseActiveClassId || firebaseStudentActivityResetting) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card student-activity-reset-modal"><h2>학생 활동 데이터 초기화</h2><p>학생 계정과 학급 설정은 유지됩니다.<br>포인트, 과제 활동, 1인1역 활동, 카드 보유, 친구 선물, 상품 사용, 모둠 점수 등 학생 활동 기록만 초기화합니다.</p><p class="student-activity-reset-kept">학생 이름 · 로그인 계정 · 비밀번호 · 캐릭터 · 카드/역할 설정은 유지</p><label class="check-label"><input id="student-activity-reset-observations" type="checkbox"><span>관찰기록도 함께 삭제</span></label><label>계속하려면 아래에 <strong>초기화</strong>를 입력하세요.<input id="student-activity-reset-confirmation" autocomplete="off"></label><p class="student-activity-reset-progress" hidden>학생 활동 데이터를 초기화하는 중입니다...</p><div class="button-row"><button id="confirm-student-activity-reset" class="button danger" data-action="confirm-student-activity-reset" disabled>학생 활동 초기화</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`);
}

async function resetStudentActivityData(includeObservations) {
  const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
  if (!userUid || !classId || !window.ourClassFirebase?.resetStudentActivityData) throw new Error("Firebase class is not ready.");
  const result = await window.ourClassFirebase.resetStudentActivityData({classId, includeObservations});
  if (!result.ok || result.classId !== classId || firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Student activity reset response was invalid.");
  data.students.forEach((student) => { student.points = 0; student.pointHistory = []; student.cards = {}; student.representativeCard = null; student.cardUpgradeHistory = []; student.cardAcquisitionHistory = []; });
  data.assignments.forEach((assignment) => { assignment.studentStatuses = Object.fromEntries(data.students.map((student) => [student.id, "missing"])); assignment.pointAwards = {}; refreshAssignmentCompletion(assignment); });
  data.roleApplications = []; data.pointUseRequests = []; data.pointTransfers = []; data.groupScoreTransactions = [];
  data.groups.forEach((group) => { group.score = 0; }); data.classMissions.forEach((mission) => { mission.confirmed = false; mission.confirmedAt = null; });
  if (includeObservations) data.observations = [];
  teacherStudentCardData.clear(); resetFirebaseStudentHomeState(); saveData();
  const loads = [];
  if (firebasePointsConnected) loads.push(loadFirebasePoints(userUid, false));
  if (firebaseAssignmentStudentStatesConnected) loads.push(loadFirebaseAssignmentStudentStates(userUid, false));
  if (firebaseRolesConnected) loads.push(loadFirebaseRoles(userUid, false));
  if (firebaseGroupsConnected) loads.push(loadFirebaseGroups(userUid, false));
  if (includeObservations && firebaseObservationsConnected) loads.push(loadFirebaseObservations(userUid, false));
  const loaded = await Promise.all(loads); if (loaded.some((value) => value !== true)) throw new Error("Reset Firebase activity data could not be reloaded.");
  if (window.ourClassFirebase?.getPointShopData) { const shop = await window.ourClassFirebase.getPointShopData({classId, mode: "teacher"}); if (Array.isArray(shop?.items)) data.pointShopItems = shop.items; data.pointUseRequests = Array.isArray(shop?.requests) ? shop.requests : []; }
  if (window.ourClassFirebase?.getPointGiftData) { const gift = await window.ourClassFirebase.getPointGiftData({classId, mode: "teacher"}); if (gift?.settings) data.pointTransferSettings = {enabled: gift.settings.enabled === true, maxPerTransfer: Number(gift.settings.maxPointsPerTransfer) || 10, dailyMaxAmount: Number(gift.settings.maxPointsPerDay) || 20, dailyMaxCount: Number(gift.settings.maxTransfersPerDay) || 3}; data.pointTransfers = Array.isArray(gift?.history) ? gift.history : []; }
  saveData(); render(); return result;
}

function teacherRoleList(items = todayRoleApplications()) {
  if (!items.length) return `<div class="empty">역할 신청이 아직 없습니다.</div>`;
  return `<div class="list">${items.map((item) => { const student = studentById(item.studentId); const role = roleForApplication(item); if (!student || !role) return ""; const shownPoints = item.status === "completed" ? (item.awardedPoints ?? role.points) : role.points; const actions = item.status === "completed" ? `<button class="button danger" data-action="undo-complete" data-id="${item.id}">완료 취소</button>` : `<button class="button success" data-action="complete-role" data-id="${item.id}">완료</button><button class="button danger" data-action="cancel-role" data-id="${item.id}">취소</button>`; return `<div class="list-row"><div class="list-main"><strong>${student.name} / ${escapeHtml(role.name)}</strong><span class="pill ${item.status === "completed" ? "success" : "waiting"}">${item.status === "completed" ? "수행 완료" : "수행 대기"}</span> <span class="points">${shownPoints}P</span></div><div class="list-actions">${actions}</div></div>`; }).join("")}</div>`;
}

function roleEditorList(roles, scope, templateId = "") {
  if (!roles.length) return `<div class="empty">등록된 역할이 없습니다. 새 역할을 추가해 주세요.</div>`;
  return `<div class="role-editor-list">${roles.map((role, index) => `<article class="role-editor-item ${role.active === false ? "is-inactive" : ""}"><div class="role-order"><button class="icon-button" data-action="move-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}" data-direction="up" ${index === 0 ? "disabled" : ""} aria-label="${escapeHtml(role.name)} 위로 이동">↑</button><button class="icon-button" data-action="move-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}" data-direction="down" ${index === roles.length - 1 ? "disabled" : ""} aria-label="${escapeHtml(role.name)} 아래로 이동">↓</button></div><div class="role-editor-info"><strong>${escapeHtml(role.name)}</strong><span class="muted">${role.capacity}명 · ${role.points}P${role.description ? ` · ${escapeHtml(role.description)}` : ""}</span></div><div class="list-actions"><button class="button ${role.active === false ? "secondary" : "success"} compact" data-action="toggle-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}">${role.active === false ? "OFF" : "ON"}</button><button class="button secondary compact" data-action="edit-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}">수정</button><button class="button danger compact" data-action="delete-role" data-scope="${scope}" data-template="${templateId}" data-id="${role.id}">삭제</button></div></article>`).join("")}</div>`;
}

function templateEditor() {
  const template = data.roleTemplates.find((item) => item.id === editingTemplateId);
  if (!template) return "";
  return `<section class="card template-editor"><div class="section-heading"><div><span class="pill success">템플릿 수정 중</span><h2>${escapeHtml(template.name)}</h2></div><button class="button secondary" data-action="close-template-editor">닫기</button></div>${roleEditorList(template.roles, "template", template.id)}<button class="button success" data-action="add-role" data-scope="template" data-template="${template.id}">+ 템플릿 역할 추가</button><p class="muted small-note">여기에서 바꾼 내용은 이 템플릿에만 저장되며, 오늘의 역할은 자동으로 바뀌지 않습니다.</p></section>`;
}

function teacherRoles() {
  return `<h1 class="page-heading">1인1역 관리</h1><p class="page-description">역할을 미리 등록하고 오늘 사용할 항목만 ON으로 운영합니다.</p><section class="card role-limit-settings"><div><h2>학생 신청 설정</h2><p class="muted">시작 시간을 비워 두면 기존처럼 시간 제한 없이 신청할 수 있습니다.</p></div><form id="role-limit-form" class="inline-form time-setting-form"><label>하루 최대 <input name="limit" type="number" min="1" max="5" step="1" required value="${data.dailyRoleApplicationLimit}" aria-label="하루 최대 신청 개수">개</label><label>매일 신청 시작 <input id="role-open-time" name="openTime" type="time" value="${escapeHtml(data.roleApplicationOpenTime || "")}" aria-label="1인1역 신청 시작 시간"></label><button class="button secondary compact time-limit-clear${data.roleApplicationOpenTime ? "" : " is-clear"}" type="button" data-action="clear-time-input" data-target="role-open-time" aria-pressed="${data.roleApplicationOpenTime ? "false" : "true"}">시간 제한 없음</button><button class="button" type="submit">저장</button></form></section><section class="management-section"><div class="section-heading"><div><h2>오늘 신청 현황</h2><p class="muted">완료를 누르면 학생에게 포인트가 한 번만 지급됩니다.</p></div></div>${teacherRoleList()}</section><section class="card management-section"><div class="section-heading"><div><h2>역할 관리</h2><p class="muted">오늘 학생에게 보여줄 역할만 ON으로 설정하세요.</p></div><button class="button success" data-action="add-role" data-scope="today">+ 역할 추가</button></div>${roleEditorList(data.currentRoles, "today")}</section>`;
}

function assignmentMatchesFilter(assignment) {
  if (isAssignmentCompleted(assignment)) return false;
  const statuses = assignmentStatusesForStudents(assignment); const reviewCount = statuses.filter((status) => status === "review").length;
  const weekStartKey = localDateKey(weekStart());
  const weekEndDate = new Date(weekStart()); weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEndKey = localDateKey(weekEndDate);
  if (assignmentFilter === "review" && reviewCount < 1) return false;
  if (assignmentFilter === "missing" && !statuses.some((status) => status === "missing")) return false;
  if (assignmentFilter === "today" && assignment.dueDate !== todayString()) return false;
  if (assignmentFilter === "week" && (!assignment.dueDate || assignment.dueDate < weekStartKey || assignment.dueDate > weekEndKey)) return false;
  if (assignmentFilter === "important" && !assignment.important) return false;
  if (assignmentSubjectFilter && assignment.subject !== assignmentSubjectFilter) return false;
  if (assignmentSearch && !assignment.title.toLocaleLowerCase("ko-KR").includes(assignmentSearch.toLocaleLowerCase("ko-KR"))) return false;
  return true;
}

function activeAssignmentPriority(first, second) {
  const firstReview = assignmentStatusesForStudents(first).filter((status) => status === "review").length;
  const secondReview = assignmentStatusesForStudents(second).filter((status) => status === "review").length;
  if (firstReview !== secondReview) return secondReview - firstReview;
  const firstDue = first.dueDate || "9999-12-31"; const secondDue = second.dueDate || "9999-12-31";
  return firstDue.localeCompare(secondDue) || String(second.createdAt || "").localeCompare(String(first.createdAt || ""));
}

function completedAssignmentMatches(assignment) {
  if (!isAssignmentCompleted(assignment)) return false;
  const completedKey = localDateKey(assignment.completedAt);
  if (completedAssignmentFilters.search && !assignment.title.toLocaleLowerCase("ko-KR").includes(completedAssignmentFilters.search.toLocaleLowerCase("ko-KR"))) return false;
  if (completedAssignmentFilters.subject && assignment.subject !== completedAssignmentFilters.subject) return false;
  if (completedAssignmentFilters.from && (!completedKey || completedKey < completedAssignmentFilters.from)) return false;
  if (completedAssignmentFilters.to && (!completedKey || completedKey > completedAssignmentFilters.to)) return false;
  return true;
}

function selectedStudentsForAssignment(assignmentId) {
  if (!assignmentSelections[assignmentId]) assignmentSelections[assignmentId] = new Set();
  return assignmentSelections[assignmentId];
}

function teacherAssignmentCard(assignment) {
  const selected = selectedStudentsForAssignment(assignment.id);
  const activeStudentEntries = data.students.filter((student) => student.active !== false).map((student) => ({ student, status: assignmentStatusForStudent(assignment, student.id) }));
  const submittedCount = activeStudentEntries.filter(({ status }) => status === "submitted").length;
  const reviewCount = activeStudentEntries.filter(({ status }) => status === "review").length;
  const missingCount = activeStudentEntries.length - submittedCount - reviewCount;
  const stateAction = assignment.assignmentState === "completed"
    ? `<button class="button secondary compact" data-action="ask-reopen-assignment" data-id="${assignment.id}">다시 열기</button>`
    : `<button class="button gold compact" data-action="ask-complete-assignment" data-id="${assignment.id}">과제 완료</button>`;
  const completedLabel = assignment.assignmentState === "completed" ? `<span class="pill success">과제 완료일 ${formatCompletedAt(assignment.completedAt)}</span>` : "";
  const expanded = expandedAssignmentId === assignment.id;
  const statusFilter = assignmentStudentStatusFilters[assignment.id] || "all";
  const studentRows = activeStudentEntries.filter((item) => statusFilter === "all" || item.status === statusFilter);
  const statusFilters = [["all", "전체", activeStudentEntries.length], ["review", "확인 대기", reviewCount], ["missing", "미제출", missingCount], ["submitted", "제출 완료", submittedCount]];
  const studentDetails = `<div class="assignment-student-details"><div class="assignment-status-filters">${statusFilters.map(([value, label, count]) => `<button class="button compact ${statusFilter === value ? "active" : "secondary"}" data-action="filter-assignment-students" data-id="${assignment.id}" data-status="${value}">${label} ${count}</button>`).join("")}</div>${studentRows.length ? `<div class="assignment-student-list">${studentRows.map(({ student, status }) => { const reviewActions = status === "review" ? `<div class="review-actions"><button class="button success compact" data-action="review-assignment" data-assignment="${assignment.id}" data-student="${student.id}" data-status="submitted">제출 확인</button><button class="button danger compact" data-action="review-assignment" data-assignment="${assignment.id}" data-student="${student.id}" data-status="missing">반려</button></div>` : ""; return `<div class="assignment-student-row ${status === "review" ? "needs-review" : ""}"><label class="student-check"><input type="checkbox" data-action="select-assignment-student" data-assignment="${assignment.id}" data-student="${student.id}" ${selected.has(student.id) ? "checked" : ""}><span>${studentNumber(student)}. ${escapeHtml(student.name)}</span></label><div class="student-status-actions"><button class="status-button ${assignmentStatusClass(status)}" data-action="cycle-assignment-status" data-assignment="${assignment.id}" data-student="${student.id}">${ASSIGNMENT_STATUS_LABELS[status]}</button>${reviewActions}</div></div>`; }).join("")}</div>` : `<div class="empty">이 상태의 학생이 없습니다.</div>`}<div class="button-row assignment-bulk-actions"><button class="button success compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="submitted" data-scope="selected" ${selected.size ? "" : "disabled"}>선택 학생 제출 처리</button><button class="button secondary compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="submitted" data-scope="all">전체 제출</button><button class="button secondary compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="missing" data-scope="all">전체 미제출</button></div></div>`;
  return `<article class="card assignment-manage-card ${assignment.important ? "important" : ""} ${reviewCount ? "has-review" : ""}"><div class="assignment-card-top"><div><div class="assignment-labels"><span class="subject-badge">${escapeHtml(assignment.subject)}</span>${assignment.important ? `<span class="important-mark">★ 중요</span>` : ""}${assignment.points > 0 ? `<span class="pill assignment-points-badge">완료 시 ${assignment.points}P</span>` : ""}<span class="pill ${assignment.dueDate === todayString() ? "waiting" : ""}">마감 ${formatDueDate(assignment.dueDate)}</span>${completedLabel}</div><h2>${escapeHtml(assignment.title)}</h2>${assignment.description ? `<p class="muted">${escapeHtml(assignment.description)}</p>` : ""}</div></div><div class="assignment-counts"><button class="count-submitted" data-action="open-assignment-status" data-id="${assignment.id}" data-status="submitted">제출 완료 <strong>${submittedCount}명</strong></button><button class="count-review ${reviewCount ? "attention" : ""}" data-action="open-assignment-status" data-id="${assignment.id}" data-status="review">확인 대기 <strong>${reviewCount}명</strong></button><button class="count-missing" data-action="open-assignment-status" data-id="${assignment.id}" data-status="missing">미제출 <strong>${missingCount}명</strong></button></div><div class="assignment-card-actions"><button class="button secondary compact" data-action="toggle-assignment-details" data-id="${assignment.id}">${expanded ? "학생 현황 닫기" : "전체 학생 보기"}</button><button class="button secondary compact" data-action="edit-assignment" data-id="${assignment.id}">수정</button><button class="button secondary compact" data-action="duplicate-assignment" data-id="${assignment.id}">복제</button>${stateAction}<button class="button danger compact" data-action="ask-delete-assignment" data-id="${assignment.id}">삭제</button></div>${expanded ? studentDetails : ""}</article>`;
}

function teacherStudentAssignmentView(studentId) {
  const student = studentById(studentId);
  const submitted = data.assignments.filter((assignment) => assignmentStatusForStudent(assignment, studentId) === "submitted").length;
  const missing = data.assignments.filter((assignment) => assignmentStatusForStudent(assignment, studentId) === "missing").length;
  const review = data.assignments.length - submitted - missing;
  return `<section class="student-assignment-overview"><h2>${student.name} 과제 현황</h2><div class="grid four assignment-summary"><article class="card"><span class="muted">전체 과제</span><strong class="big-number">${data.assignments.length}개</strong></article><article class="card"><span class="muted">제출 완료</span><strong class="big-number">${submitted}개</strong></article><article class="card"><span class="muted">미제출</span><strong class="big-number">${missing}개</strong></article><article class="card"><span class="muted">확인 대기</span><strong class="big-number">${review}개</strong></article></div><div class="list">${data.assignments.map((assignment) => { const status = assignmentStatusForStudent(assignment, studentId); return `<div class="list-row"><div class="list-main"><strong>${escapeHtml(assignment.title)}</strong><small class="muted">${escapeHtml(assignment.subject)} · ${formatDueDate(assignment.dueDate)}</small></div><span class="pill ${assignmentStatusClass(status)}">${ASSIGNMENT_STATUS_LABELS[status]}</span></div>`; }).join("")}</div></section>`;
}

function teacherAssignments() {
  const allActive = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment));
  const active = allActive.filter(assignmentMatchesFilter).sort(activeAssignmentPriority);
  const allCompleted = data.assignments.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
  const completed = showAllCompletedAssignments ? allCompleted.filter(completedAssignmentMatches) : allCompleted;
  const shownCompleted = showAllCompletedAssignments ? completed : completed.slice(0, 5);
  const reviewAssignments = allActive.filter((assignment) => assignmentStatusesForStudents(assignment).some((status) => status === "review")).length;
  const todayDue = allActive.filter((assignment) => assignment.dueDate === todayString()).length;
  const missingAssignments = allActive.filter((assignment) => assignmentStatusesForStudents(assignment).some((status) => status === "missing")).length;
  const subjects = [...new Set(data.assignments.map((assignment) => assignment.subject).filter(Boolean))].sort((first, second) => first.localeCompare(second, "ko-KR"));
  const quickFilters = [["all", "전체"], ["review", "확인 필요"], ["today", "오늘 마감"], ["week", "이번 주"], ["important", "중요"]];
  const summary = `<section class="assignment-overview-grid"><button data-action="set-assignment-filter" data-filter="review"><span>확인 필요한 과제</span><strong>${reviewAssignments}개</strong></button><button data-action="set-assignment-filter" data-filter="today"><span>오늘 마감</span><strong>${todayDue}개</strong></button><button data-action="set-assignment-filter" data-filter="missing"><span>미제출 학생이 있는 과제</span><strong>${missingAssignments}개</strong></button><button data-action="set-assignment-filter" data-filter="all"><span>진행 중 과제</span><strong>${allActive.length}개</strong></button></section>`;
  const toolbar = `<section class="card assignment-toolbar"><div class="assignment-quick-filters" aria-label="빠른 과제 필터">${quickFilters.map(([value, label]) => `<button class="button compact ${assignmentFilter === value ? "active" : "secondary"}" data-action="set-assignment-filter" data-filter="${value}">${label}</button>`).join("")}</div><label>과목<select id="assignment-subject-filter"><option value="">전체 과목</option>${subjects.map((subject) => `<option value="${escapeHtml(subject)}" ${assignmentSubjectFilter === subject ? "selected" : ""}>${escapeHtml(subject)}</option>`).join("")}</select></label><label>과제 제목 검색<input id="assignment-search" value="${escapeHtml(assignmentSearch)}" placeholder="과제 제목을 입력하세요"></label><label>학생별 보기<select id="assignment-student-view"><option value="">학생을 선택하세요</option>${activeStudents().map((student) => `<option value="${student.id}" ${assignmentStudentView === student.id ? "selected" : ""}>${student.name}</option>`).join("")}</select></label><button class="button secondary compact assignment-filter-reset" data-action="reset-assignment-filters">조건 초기화</button></section>`;
  const completedFilters = showAllCompletedAssignments ? `<section class="card completed-assignment-toolbar"><label>제목 검색<input id="completed-assignment-search" value="${escapeHtml(completedAssignmentFilters.search)}" placeholder="완료 과제 제목"></label><label>과목<select id="completed-assignment-subject"><option value="">전체 과목</option>${subjects.map((subject) => `<option value="${escapeHtml(subject)}" ${completedAssignmentFilters.subject === subject ? "selected" : ""}>${escapeHtml(subject)}</option>`).join("")}</select></label><label>완료일 시작<input id="completed-assignment-from" type="date" value="${completedAssignmentFilters.from}"></label><label>완료일 끝<input id="completed-assignment-to" type="date" value="${completedAssignmentFilters.to}"></label><button class="button secondary compact" data-action="reset-completed-assignment-filters">조건 초기화</button></section>` : "";
  return `<div class="section-heading assignment-page-heading"><div><h1 class="page-heading">과제 관리</h1><p class="page-description">지금 확인하거나 처리해야 할 과제를 먼저 보여 줍니다.</p></div><button class="button success" data-action="new-assignment">+ 새 과제 만들기</button></div>${summary}${toolbar}${assignmentStudentView ? teacherStudentAssignmentView(assignmentStudentView) : `<section><div class="section-heading"><h2 class="section-title">진행 중인 과제</h2><span class="muted">${active.length}개 표시</span></div>${active.length ? `<div class="assignment-manage-list">${active.map(teacherAssignmentCard).join("")}</div>` : `<div class="empty">조건에 맞는 진행 중 과제가 없습니다.</div>`}</section><details class="completed-assignments" open><summary>완료된 과제 ${allCompleted.length}개 · ${showAllCompletedAssignments ? "전체 보기" : `최근 ${Math.min(5, allCompleted.length)}개`} 표시</summary>${completedFilters}${shownCompleted.length ? `<div class="assignment-manage-list">${shownCompleted.map(teacherAssignmentCard).join("")}</div>` : `<div class="empty">조건에 맞는 완료된 과제가 없습니다.</div>`}${allCompleted.length ? `<button class="button secondary record-view-all" data-action="toggle-all-completed-assignments">${showAllCompletedAssignments ? "최근 5개만 보기" : "완료 과제 전체 보기"}</button>` : ""}</details>`}`;
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
  const quickAmounts = [1, 5, 10, 20];
  const students = activeStudents(); [...selectedPointStudentIds].forEach((studentId) => { if (!students.some((student) => student.id === studentId)) selectedPointStudentIds.delete(studentId); });
  return `<h1 class="page-heading">포인트 관리</h1><p class="page-description">학생을 여러 명 선택하고 같은 포인트를 빠르게 지급하거나 차감하세요.</p><section class="card point-quick-panel"><div class="point-selection-heading"><strong>선택 학생 <span id="point-selected-count">${selectedPointStudentIds.size}</span>명</strong><div class="button-row"><button class="button secondary compact" data-action="select-all-point-students">전체 선택</button><button class="button secondary compact" data-action="clear-point-students">선택 해제</button></div></div><div class="point-quick-actions"><div><strong>빠른 지급</strong><div class="button-row">${quickAmounts.map((amount) => `<button class="button success compact" data-action="quick-teacher-points" data-amount="${amount}">+${amount}P</button>`).join("")}</div></div><div><strong>빠른 차감</strong><div class="button-row">${quickAmounts.map((amount) => `<button class="button danger compact" data-action="quick-teacher-points" data-amount="-${amount}">-${amount}P</button>`).join("")}</div></div><form id="point-bulk-form" class="point-direct-form"><label>직접 입력<input name="amount" type="number" min="1" step="1" value="1" required></label><div class="button-row"><button class="button success compact" type="submit" data-kind="add">지급</button><button class="button danger compact" type="submit" data-kind="subtract">차감</button></div></form></div></section><div class="point-student-grid">${students.map((student) => `<label class="point-student-card ${selectedPointStudentIds.has(student.id) ? "selected" : ""}"><input type="checkbox" data-action="toggle-point-student" data-id="${student.id}" ${selectedPointStudentIds.has(student.id) ? "checked" : ""}><span>${escapeHtml(student.name)}</span><strong>${student.points}P</strong></label>`).join("")}</div>`;
}

function applyTeacherPointChange(amount) {
  if (!Number.isInteger(amount) || amount === 0) return;
  const students = activeStudents().filter((student) => selectedPointStudentIds.has(student.id));
  if (!students.length) { toast("포인트를 처리할 학생을 먼저 선택해 주세요."); return; }
  if (amount < 0) {
    const insufficient = students.filter((student) => student.points < Math.abs(amount));
    if (insufficient.length) {
      app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>포인트를 차감할 수 없습니다</h2><p><strong>${escapeHtml(insufficient.map((student) => student.name).join(", "))}</strong>의 포인트가 부족합니다.</p><p class="muted">선택한 학생 모두에게서 포인트를 차감하지 않았습니다.</p><div class="button-row"><button class="button secondary" type="button" data-action="close-modal">확인</button></div></section></div>`); return;
    }
  }
  const source = amount > 0 ? "교사 직접 지급" : "교사 직접 차감";
  const changes = students.map((student) => ({ student, balanceDelta: amount, historyEntries: { id: crypto.randomUUID(), amount, reason: source, source, date: new Date().toLocaleDateString("ko-KR") } }));
  if (!applyStudentPointChanges(changes)) return;
  saveData(); render(); toast(`${students.length}명에게 ${amount > 0 ? "+" : ""}${amount}P를 반영했습니다.`);
}

function teacherCards() {
  const cardSets = data.cardSets.filter((cardSet) => !cardSet.deleted); if (!cardSets.some((cardSet) => cardSet.id === teacherCardSetId)) teacherCardSetId = data.activeCardSetIds[0] || cardSets[0]?.id || "";
  const selectedSet = cardSetById(teacherCardSetId) || cardSets[0]; const cards = selectedSet ? sortedCards(false, selectedSet.id) : [];
  const setRows = cardSets.map((cardSet) => `<article class="card-set-item ${cardSet.id === teacherCardSetId ? "selected" : ""}"><button class="card-set-select" data-action="select-card-set" data-id="${cardSet.id}"><strong>${escapeHtml(cardSet.name)}</strong><small>${escapeHtml(cardSet.description || "설명 없음")}</small><span>${sortedCards(false, cardSet.id).length}명 · ${cardSet.active ? "사용 중" : "사용 중지"}</span></button><label class="card-set-draw-toggle"><input type="checkbox" data-action="toggle-card-set-selection" data-id="${cardSet.id}" ${data.activeCardSetIds.includes(cardSet.id) ? "checked" : ""} ${!cardSet.active ? "disabled" : ""}><span>카드 뽑기에 사용</span></label><div class="button-row"><button class="button secondary compact" data-action="edit-card-set" data-id="${cardSet.id}">이름 수정</button><button class="button secondary compact" data-action="duplicate-card-set" data-id="${cardSet.id}">복제</button><button class="button ${cardSet.active ? "danger" : "success"} compact" data-action="toggle-card-set" data-id="${cardSet.id}">${cardSet.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="ask-delete-card-set" data-id="${cardSet.id}">삭제</button></div></article>`).join("");
  const drawOptionRows = data.drawOptions.filter((option) => !option.deleted).map((option) => `<article class="draw-option-manage-card"><div class="teacher-card-top"><span class="pill ${option.active ? "success" : "danger"}">${option.active ? "사용 중" : "사용 중지"}</span><strong>${option.price}P</strong></div><h3>${escapeHtml(option.name)}</h3><div class="draw-option-rate-summary">${CARD_RARITIES.map((rarity) => `<span>${rarity} <strong>${drawRate(rarity, option.rates)}%</strong></span>`).join("")}</div><div class="button-row"><button class="button secondary compact" data-action="edit-draw-option" data-id="${option.id}">수정</button><button class="button ${option.active ? "danger" : "success"} compact" data-action="toggle-draw-option" data-id="${option.id}">${option.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="ask-delete-draw-option" data-id="${option.id}">삭제</button></div></article>`).join("");
  let upgradeSettingInputs = CARD_UPGRADE_STEPS.map((step) => `<label><span>${step.from} → ${step.to}</span><span class="upgrade-setting-input"><input name="${step.key}" type="number" min="2" step="1" value="${data.cardUpgradeSettings[step.key]}" required><b>장</b></span></label>`).join("");
  const abilitySettingInputs = CARD_RARITIES.map((rarity) => { const setting = cardAbilitySetting(rarity); const key = CARD_RATE_KEYS[rarity]; return `<label class="ability-setting-row"><strong>${rarity}</strong><span>보너스 <input name="${key}Percent" type="number" min="0" max="100" step="1" value="${setting.bonusPercent}" required> %</span><span>하루 최대 <input name="${key}Cap" type="number" min="0" step="1" value="${setting.dailyCap}" required> P</span></label>`; }).join("");
  const abilitySettingsPanel = `<div class="ability-settings-panel"><div><h3>등급 능력 설정</h3><p class="muted">대표 카드의 역할·과제 포인트 보너스와 학생별 하루 한도입니다.</p></div><div class="ability-settings-grid">${abilitySettingInputs}</div></div>`;
  upgradeSettingInputs += abilitySettingsPanel;
  return `<div class="section-heading card-page-heading"><div><h1 class="page-heading">카드 관리</h1><p class="page-description">카드셋은 등장 인물을, 뽑기 옵션은 가격과 등급 확률을 결정합니다.</p></div><button class="button success" data-action="new-card-set">+ 새 카드셋 만들기</button></div><section class="management-section"><div class="section-heading"><h2>카드셋 관리</h2><span class="pill success">뽑기 사용 ${data.activeCardSetIds.length}개</span></div><div class="card-set-grid">${setRows}</div></section><section class="management-section"><div class="section-heading"><div><h2>뽑기 옵션 관리</h2><p class="muted">옵션마다 가격과 5개 등급 확률을 따로 설정하세요.</p></div><button class="button success" data-action="new-draw-option">+ 새 뽑기 옵션</button></div><div class="draw-option-manage-grid">${drawOptionRows || `<div class="empty">등록된 뽑기 옵션이 없습니다.</div>`}</div></section><section class="management-section"><div class="section-heading"><div><h2>업그레이드 설정</h2><p class="muted">각 단계에서 사용할 같은 등급 카드 수를 2장 이상으로 설정하세요.</p></div></div><form id="upgrade-settings-form"><div class="upgrade-settings-grid">${upgradeSettingInputs}</div><button class="button success" type="submit">업그레이드 설정 저장</button></form></section>${selectedSet ? `<section class="management-section"><div class="section-heading"><div><h2>${escapeHtml(selectedSet.name)} 인물 카드</h2><p class="muted">인물 정보 하나로 일반·희귀·영웅·전설·고대 5개 등급을 모두 사용합니다.</p></div><button class="button success" data-action="new-card" data-set-id="${selectedSet.id}">+ 새 인물 카드 추가</button></div><div class="teacher-card-grid">${cards.map((card) => `<article class="teacher-card-item"><div class="teacher-card-top"><span class="pill">5개 등급</span><span class="pill ${card.active ? "success" : "danger"}">${card.active ? "사용 중" : "사용 중지"}</span></div><h3>${escapeHtml(card.name)}</h3><p class="muted">${escapeHtml(card.era)}</p><small>${escapeHtml(card.achievement)}</small><div class="card-grade-list">${CARD_RARITIES.map((rarity) => `<span class="pill rarity-${rarityClass(rarity)}">${rarity}</span>`).join("")}</div><div class="button-row"><button class="button secondary compact" data-action="edit-card" data-id="${card.id}">수정</button><button class="button ${card.active ? "danger" : "success"} compact" data-action="toggle-card-active" data-id="${card.id}">${card.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="ask-delete-card" data-id="${card.id}">삭제</button></div></article>`).join("") || `<div class="empty">이 카드셋에는 인물 카드가 없습니다.</div>`}</div></section>` : ""}<section class="card" style="margin-top:24px"><h2>데모 설정</h2><p class="muted">모든 신청, 포인트, 카드, 관찰 기록을 처음 상태로 되돌립니다.</p><button class="button danger" data-action="reset-demo">데모 데이터 초기화</button></section>`;
}

function teacherCardsV2() {
  const cardSets = data.cardSets.filter((cardSet) => !cardSet.deleted); if (!cardSets.some((cardSet) => cardSet.id === teacherCardSetId)) teacherCardSetId = data.activeCardSetIds[0] || cardSets[0]?.id || "";
  const selectedSet = cardSetById(teacherCardSetId) || cardSets[0]; const cards = selectedSet ? sortedCards(false, selectedSet.id) : [];
  const drawOptions = data.drawOptions.filter((option) => !option.deleted && FIXED_DRAW_OPTION_NAMES[option.id]).map((option) => `<article class="draw-option-manage-card fixed-draw-option-card"><div class="fixed-option-badge-row"><span class="pill success">고정 옵션</span></div><div class="draw-option-title-price"><h3>${escapeHtml(FIXED_DRAW_OPTION_NAMES[option.id])}</h3><strong>${option.price}갈비</strong></div><div class="draw-option-rate-summary">${CARD_RARITIES.map((rarity) => `<span>${rarity} <strong>${drawRate(rarity, option.rates)}%</strong></span>`).join("")}</div><div class="button-row"><button class="button secondary compact" data-action="edit-draw-option" data-id="${option.id}">가격·확률 수정</button></div></article>`).join("");
  const upgradeInputs = CARD_UPGRADE_STEPS.map((step) => `<label><span>${step.from} → ${step.to}</span><span class="upgrade-setting-input"><input name="${step.key}" type="number" min="2" step="1" value="${data.cardUpgradeSettings[step.key]}" required><b>장</b></span></label>`).join("");
  const abilityInputs = CARD_RARITIES.map((rarity) => { const setting = cardAbilitySetting(rarity); return `<label class="daily-cap-setting-row"><strong>${rarity}</strong><span><input name="${CARD_RATE_KEYS[rarity]}-dailyCap" type="number" min="0" step="1" value="${setting.dailyCap}" required> P</span></label>`; }).join("");
  const setRows = cardSets.map((cardSet) => `<article class="card-set-item ${cardSet.id === teacherCardSetId ? "selected" : ""}"><button class="card-set-select" data-action="select-card-set" data-id="${cardSet.id}"><strong>${escapeHtml(cardSet.name)}</strong><small>${escapeHtml(cardSet.description || "설명 없음")}</small><span>${sortedCards(false, cardSet.id).length}명 · ${cardSet.active ? "사용 중" : "사용 중지"}</span></button><label class="card-set-draw-toggle"><input type="checkbox" data-action="toggle-card-set-selection" data-id="${cardSet.id}" ${data.activeCardSetIds.includes(cardSet.id) ? "checked" : ""} ${!cardSet.active ? "disabled" : ""}><span>카드 뽑기에 사용</span></label><div class="button-row"><button class="button secondary compact" data-action="edit-card-set" data-id="${cardSet.id}">이름 수정</button><button class="button secondary compact" data-action="duplicate-card-set" data-id="${cardSet.id}">복제</button><button class="button ${cardSet.active ? "danger" : "success"} compact" data-action="toggle-card-set" data-id="${cardSet.id}">${cardSet.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="ask-delete-card-set" data-id="${cardSet.id}">삭제</button></div></article>`).join("");
  const personCards = cards.map((card) => `<article class="teacher-card-item"><div class="teacher-card-top"><span class="pill">5개 등급·${cardAbilities(false).length}개 능력</span><span class="pill ${card.active ? "success" : "danger"}">${card.active ? "사용 중" : "사용 중지"}</span></div><div class="teacher-card-identity">${cardImageSource(card) ? cardImageMarkup(card, "teacher-card-thumbnail") : ""}<div><h3>${escapeHtml(card.name)}</h3><p class="muted">${escapeHtml(card.era)}</p></div></div><small>${escapeHtml(card.achievement)}</small><div class="button-row teacher-card-actions"><button class="button secondary compact" data-action="edit-card" data-id="${card.id}">수정</button><button class="button ${card.active ? "danger" : "success"} compact" data-action="toggle-card-active" data-id="${card.id}">${card.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="ask-delete-card" data-id="${card.id}">삭제</button></div></article>`).join("");
  return `<div class="section-heading card-page-heading"><div><h1 class="page-heading">카드 관리</h1><p class="page-description">전체 규칙을 정한 뒤 다양한 주제의 카드셋과 카드를 관리하세요.</p></div></div><section class="management-section"><div class="section-heading"><div><h2>1. 뽑기 옵션·가격·등급 확률</h2><p class="muted">일반 뽑기와 프리미엄 뽑기의 가격과 확률을 설정하세요.</p></div></div><div class="draw-option-manage-grid">${drawOptions}</div></section><section class="management-section"><h2>2. 카드 업그레이드 설정</h2><form id="upgrade-settings-form"><div class="upgrade-settings-grid">${upgradeInputs}</div><button class="button success" type="submit">업그레이드 설정 저장</button></form></section><section class="management-section"><h2>3. 특수능력 설정</h2><p class="muted">등급별 능력 보너스와 하루 최대 보너스를 설정하세요.</p><form id="card-ability-settings-form"><div class="special-ability-settings">${abilityInputs}</div><button class="button success" type="submit">특수능력 설정 저장</button></form></section><section class="management-section"><div class="section-heading"><div><h2>4. 카드셋 관리</h2><span class="pill success">뽑기 사용 ${data.activeCardSetIds.length}개</span></div><button class="button success" data-action="new-card-set">+ 새 카드셋 만들기</button></div><div class="card-set-grid">${setRows}</div></section>${selectedSet ? `<section class="management-section"><div class="section-heading"><div><h2>5. ${escapeHtml(selectedSet.name)} 카드 관리</h2><p class="muted">각 카드는 5개 등급과 현재 활성화된 특수능력을 가질 수 있습니다.</p></div><button class="button success" data-action="new-card" data-set-id="${selectedSet.id}">+ 새 카드 추가</button></div><div class="teacher-card-grid">${personCards || `<div class="empty">이 카드셋에는 카드가 없습니다.</div>`}</div></section>` : ""}<section class="card" style="margin-top:24px"><h2>데모 설정</h2><button class="button danger" data-action="reset-demo">데모 데이터 초기화</button></section>`;
}

function activeGroups() { return data.groups.filter((group) => group.active).sort((first, second) => first.order - second.order); }
function classGroupScore() { return activeGroups().reduce((sum, group) => sum + group.score, 0); }
function groupMembers(groupId) { return activeStudents().filter((student) => data.groupAssignments[student.id] === groupId); }
function sortedClassMissions() { return [...data.classMissions].sort((first, second) => first.target - second.target); }
function groupById(groupId) { return data.groups.find((group) => group.id === groupId); }
function groupStudentRow(student, currentGroupId = "") { return `<div class="group-student-row"><span>${studentNumber(student)}. ${escapeHtml(student.name)}</span><select data-action="assign-student-group" data-student="${student.id}" aria-label="${escapeHtml(student.name)} 모둠 이동"><option value="">미배정</option>${activeGroups().map((group) => `<option value="${group.id}" ${currentGroupId === group.id ? "selected" : ""}>${escapeHtml(group.name)}</option>`).join("")}</select></div>`; }
function groupMissionSummary() {
  const total = classGroupScore(); const missions = sortedClassMissions(); const current = missions.find((mission) => mission.target > total);
  if (!missions.length) return `<section class="card class-mission-hero"><div class="class-mission-score"><span>우리 반 전체 점수</span><strong>${total}점</strong></div><div class="class-mission-current"><span>다음 공동 미션</span><h2>아직 등록된 공동 미션이 없습니다.</h2><p>[공동 미션 관리]에서 목표를 등록해 주세요.</p></div></section>`;
  if (!current) return `<section class="card class-mission-hero completed"><div class="class-mission-score"><span>우리 반 전체 점수</span><strong>${total}점</strong></div><div class="class-mission-current"><span>공동 미션</span><h2>🎉 등록된 모든 목표를 달성했습니다!</h2></div></section>`;
  const previousTarget = [...missions].filter((mission) => mission.target <= total).at(-1)?.target || 0; const range = Math.max(1, current.target - previousTarget); const progress = Math.min(100, Math.max(0, ((total - previousTarget) / range) * 100)); const next = missions.find((mission) => mission.target > current.target);
  return `<section class="card class-mission-hero"><div class="class-mission-score"><span>우리 반 전체 점수</span><strong>${total}점</strong></div><div class="class-mission-current"><div class="class-mission-title"><span>다음 공동 미션</span><h2>${total} / ${current.target}점</h2></div><p><strong>${escapeHtml(current.reward)}</strong>까지 ${current.target - total}점!</p><div class="class-mission-progress"><span style="width:${progress}%"></span></div>${next ? `<small>다음 목표: ${next.target}점 · ${escapeHtml(next.reward)}</small>` : ""}</div></section>`;
}
function groupMainCard(group) { const members = groupMembers(group.id); const selected = selectedGroupId === group.id; return `<button class="group-main-card ${selected ? "selected" : ""}" data-action="select-group" data-id="${group.id}" aria-pressed="${selected}"><div><h3>${escapeHtml(group.name)}</h3>${selected ? `<span class="pill success">✓ 선택됨</span>` : ""}</div><strong>${group.score}</strong>${members.length ? `<span class="group-main-student-list">${members.map((student) => `<span class="group-main-student-chip"><b>${studentNumber(student)}</b>${escapeHtml(student.name)}</span>`).join("")}</span>` : `<p>배정된 학생이 없습니다.</p>`}</button>`; }
function groupScorePanel() { const group = groupById(selectedGroupId); if (!group?.active) return `<section class="card selected-group-panel empty"><strong>선택한 모둠 점수</strong><span>아래에서 점수를 변경할 모둠을 선택하세요.</span></section>`; const quickAdds = [1, 5, 10, 20]; const quickTakes = [1, 5, 10, 20]; return `<section class="card selected-group-panel"><div class="selected-group-heading"><span>선택한 모둠</span><strong>${escapeHtml(group.name)} · 현재 ${group.score}점</strong></div><div class="selected-score-controls"><div class="score-button-row">${quickAdds.map((amount) => `<button class="button success compact" data-action="change-selected-group-score" data-amount="${amount}">+${amount}</button>`).join("")}${quickTakes.map((amount) => `<button class="button danger compact" data-action="change-selected-group-score" data-amount="-${amount}">-${amount}</button>`).join("")}</div><form id="selected-group-score-form" class="group-direct-score-form"><input name="amount" type="number" min="1" step="1" placeholder="직접 입력" required><button class="button success compact" type="submit" data-kind="add">추가</button><button class="button danger compact" type="submit" data-kind="subtract">차감</button></form></div></section>`; }
function missionManagementCard(mission) { const reached = classGroupScore() >= mission.target; return `<article class="mission-manage-row ${mission.confirmed ? "confirmed" : ""}"><div><strong>${mission.confirmed ? "✅ " : ""}${mission.target}점</strong><span>${escapeHtml(mission.reward)}</span><small>${mission.confirmed ? `달성 확정 · ${compactDate(mission.confirmedAt)}` : reached ? "목표 점수 도달" : `${mission.target - classGroupScore()}점 남음`}</small></div><div class="list-actions">${reached && !mission.confirmed ? `<button class="button success compact" data-action="confirm-class-mission" data-id="${mission.id}">달성 확정</button>` : ""}<button class="button secondary compact" data-action="edit-class-mission" data-id="${mission.id}">수정</button><button class="button danger compact" data-action="ask-delete-class-mission" data-id="${mission.id}">삭제</button></div></article>`; }
function groupTransactionRows() { const rows = [...data.groupScoreTransactions].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)); const shown = showAllGroupTransactions ? rows : rows.slice(0, 5); return rows.length ? `<div class="group-transaction-list">${shown.map((item) => `<article class="group-transaction-row"><span>${compactDate(item.createdAt)}</span><strong>${escapeHtml(item.groupName)}</strong><b class="${item.amount > 0 ? "positive" : "negative"}">${item.amount > 0 ? "+" : ""}${item.amount}</b><small>변경 후 ${item.scoreAfter}점</small></article>`).join("")}</div>${rows.length > 5 ? `<button class="button secondary compact record-view-all" data-action="toggle-group-transactions">${showAllGroupTransactions ? "최근 5개만 보기" : "전체 기록 보기"}</button>` : ""}` : `<div class="empty">모둠 점수 기록이 없습니다.</div>`; }
function teacherGroups() {
  const groups = activeGroups(); if (selectedGroupId && !groups.some((group) => group.id === selectedGroupId)) selectedGroupId = "";
  return `<div class="section-heading group-page-heading"><div><h1 class="page-heading">모둠활동</h1><p class="page-description">각 모둠의 힘을 모아 우리 반 공동 목표를 달성해 보세요.</p></div><div class="button-row"><button class="button secondary compact" data-action="open-group-settings">모둠 설정</button><button class="button secondary compact" data-action="open-group-assignments">학생 배정</button><button class="button secondary compact" data-action="open-group-missions">공동 미션 관리</button></div></div>${groupMissionSummary()}${groupScorePanel()}<section class="management-section"><div class="section-heading"><div><h2>우리 반 모둠</h2><p class="muted">점수를 변경할 모둠 카드 하나를 선택하세요.</p></div></div><div class="group-main-grid">${groups.map(groupMainCard).join("")}</div></section>`;
}
function groupSettingNameFields(count) { return Array.from({ length: count }, (_, index) => `<label>${index + 1}모둠 이름<input name="groupName-${index}" data-group-name-index="${index}" maxlength="30" value="${escapeHtml(pendingGroupNames[index] || `${index + 1}모둠`)}" required></label>`).join(""); }
function openGroupSettingsModal() { const groups = activeGroups(); const ordered = [...data.groups].sort((a, b) => a.order - b.order); pendingGroupNames = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [index, ordered[index]?.name || `${index + 1}모둠`])); app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="group-settings-form" class="modal-card form group-settings-modal"><h2>모둠 설정</h2><label>모둠 수<input id="group-settings-count" name="count" type="number" min="2" max="8" step="1" value="${groups.length}" required></label><div id="group-name-settings" class="group-name-settings">${groupSettingNameFields(groups.length)}</div><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`); }
function proposedGroupConfiguration(count, names = null) {
  const proposedGroups = structuredClone(data.groups); const originalById = new Map(data.groups.map((group) => [group.id, group]));
  const proposedActiveGroups = () => proposedGroups.filter((group) => group.active !== false).sort((first, second) => first.order - second.order);
  const current = proposedActiveGroups(); const deactivatedGroupIds = new Set(); const newGroupIds = [];
  if (count < current.length) current.slice(count).forEach((group) => { group.active = false; deactivatedGroupIds.add(group.id); });
  if (count > current.length) {
    const archived = proposedGroups.filter((group) => group.active === false).sort((first, second) => first.order - second.order);
    while (proposedActiveGroups().length < count && archived.length) archived.shift().active = true;
    while (proposedActiveGroups().length < count) { const order = proposedGroups.reduce((max, group) => Math.max(max, group.order), -1) + 1; const group = { id: crypto.randomUUID(), name: `${order + 1}모둠`, score: 0, active: true, order }; proposedGroups.push(group); newGroupIds.push(group.id); }
  }
  if (Array.isArray(names)) proposedActiveGroups().forEach((group, index) => { const name = String(names[index] || "").trim().slice(0, 30); if (name) group.name = name; });
  const proposedAssignments = structuredClone(data.groupAssignments); const deletedAssignmentStudentIds = Object.entries(proposedAssignments).filter(([, groupId]) => deactivatedGroupIds.has(groupId)).map(([studentId]) => studentId);
  deletedAssignmentStudentIds.forEach((studentId) => { delete proposedAssignments[studentId]; });
  const changedDefinitions = proposedGroups.filter((group) => { const original = originalById.get(group.id); return !original || original.name !== group.name || original.active !== group.active || original.order !== group.order; }).map(({ id, name, active, order }) => ({ id, name, active, order }));
  return { groups: proposedGroups, assignments: proposedAssignments, changedDefinitions, newScoreStates: newGroupIds.map((groupId) => ({ groupId, score: 0 })), deletedAssignmentStudentIds, deactivatedGroupIds };
}
async function persistGroupConfiguration(proposed, successMessage) {
  if (groupConfigurationCloudStateLocked() || groupConfigurationSavingLocked() || groupScoreMutationLocked() || groupAssignmentSavingLocked()) return false;
  if (firebaseGroupsConnected && (proposed.changedDefinitions.length || proposed.newScoreStates.length || proposed.deletedAssignmentStudentIds.length)) {
    const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
    firebaseGroupConfigurationSaving = true;
    try { await window.ourClassFirebase.saveGroupConfiguration({ groups: proposed.changedDefinitions, newScoreStates: proposed.newScoreStates, deletedAssignmentStudentIds: proposed.deletedAssignmentStudentIds }); if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during group configuration save."); }
    catch (error) { console.error("Firestore group configuration save failed", error); render(); toast("모둠 설정을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요."); return false; }
    finally { firebaseGroupConfigurationSaving = false; }
  }
  data.groups = proposed.groups; data.groupAssignments = proposed.assignments;
  if (selectedGroupId && !activeGroups().some((group) => group.id === selectedGroupId)) selectedGroupId = "";
  saveData(); render(); toast(successMessage); return true;
}
async function persistGroupName(group, name) {
  if (groupConfigurationCloudStateLocked() || groupConfigurationSavingLocked() || groupScoreMutationLocked()) return false;
  const proposed = { id: group.id, name, active: group.active !== false, order: group.order };
  if (firebaseGroupsConnected) {
    const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
    firebaseGroupConfigurationSaving = true;
    try { await window.ourClassFirebase.saveGroupDefinition(proposed); if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during group name save."); }
    catch (error) { console.error("Firestore group name save failed", error); render(); toast("모둠 이름을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요."); return false; }
    finally { firebaseGroupConfigurationSaving = false; }
  }
  group.name = name; saveData(); render(); toast("모둠 이름을 저장했습니다."); return true;
}
function groupAssignmentStudentChip(student) { const selected = selectedGroupAssignmentStudentIds.has(student.id); return `<button class="group-student-chip ${selected ? "selected" : ""}" data-action="toggle-group-assignment-student" data-id="${student.id}" aria-pressed="${selected}"><span>${studentNumber(student)}</span>${escapeHtml(student.name)}</button>`; }
function openGroupAssignmentsModal(resetSelection = true) {
  if (resetSelection) selectedGroupAssignmentStudentIds.clear();
  const groups = activeGroups(); const unassigned = activeStudents().filter((student) => !data.groupAssignments[student.id]); const disabled = selectedGroupAssignmentStudentIds.size ? "" : "disabled";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card group-assignment-modal"><div class="section-heading"><div><h2>학생 배정</h2><p class="muted">학생을 여러 명 선택한 뒤 이동할 모둠을 눌러 주세요.</p></div></div><section class="group-assignment-toolbar"><strong id="group-assignment-selection-count">${selectedGroupAssignmentStudentIds.size}명 선택됨</strong><span>이동할 곳</span><div class="group-move-buttons">${groups.map((group) => `<button class="button secondary compact" data-action="move-selected-group-students" data-group-id="${group.id}" ${disabled}>${escapeHtml(group.name)}</button>`).join("")}<button class="button danger compact" data-action="move-selected-group-students" data-group-id="" ${disabled}>미배정</button></div><button class="button secondary compact" data-action="clear-group-assignment-selection" ${disabled}>선택 해제</button></section><section class="group-unassigned-panel"><h3>미배정 학생 <span>${unassigned.length}명</span></h3><div class="group-student-chip-list">${unassigned.map(groupAssignmentStudentChip).join("") || `<p class="compact-empty">미배정 학생이 없습니다.</p>`}</div></section><div class="group-assignment-board">${groups.map((group) => { const students = groupMembers(group.id); return `<section><h3>${escapeHtml(group.name)} <span>${students.length}명</span></h3><div class="group-student-chip-list">${students.map(groupAssignmentStudentChip).join("") || `<p class="compact-empty">학생 없음</p>`}</div></section>`; }).join("")}</div><div class="button-row"><button class="button secondary" data-action="close-modal">닫기</button></div></section></div>`);
}
function openGroupMissionsModal() { app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card group-missions-modal"><div class="section-heading"><div><h2>공동 미션 관리</h2><p class="muted">목표 점수가 낮은 순서로 자동 정렬됩니다.</p></div><button class="button success" data-action="new-class-mission">+ 미션 추가</button></div><div class="mission-manage-list">${sortedClassMissions().map(missionManagementCard).join("") || `<div class="empty">등록된 공동 미션이 없습니다.</div>`}</div><div class="button-row"><button class="button secondary" data-action="close-modal">닫기</button></div></section></div>`); }
function openClassMissionModal(missionId = "") { const mission = data.classMissions.find((item) => item.id === missionId); app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="class-mission-form" class="modal-card form" data-id="${missionId}"><h2>${mission ? "공동 미션 수정" : "새 공동 미션"}</h2><label>목표 점수<input name="target" type="number" min="1" step="1" required value="${mission?.target || 500}"></label><label>보상 또는 활동 내용<input name="reward" maxlength="100" required value="${escapeHtml(mission?.reward || "")}" placeholder="예: 우리 반 영화 보기"></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`); }
function openMissionReachedModal(missions) { if (!missions.length) return; app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>🎉 공동 미션 목표 달성!</h2>${missions.map((mission) => `<p><strong>${mission.target}점</strong> · ${escapeHtml(mission.reward)}</p>`).join("")}<p class="muted">모둠활동 화면에서 달성 확정을 할 수 있습니다.</p><button class="button success" data-action="close-modal">확인</button></section></div>`); }
async function changeGroupScore(groupId, amount, type = "manual") {
  if (groupCloudConnectionLocked() || groupScoreCloudStateLocked() || groupScoreMutationLocked() || groupConfigurationSavingLocked()) return;
  const group = groupById(groupId); if (!group?.active || !Number.isInteger(amount) || amount === 0) return;
  const expectedScore = group.score; const localScoreAfter = expectedScore + amount;
  if (localScoreAfter < 0) { toast(`${group.name}의 점수가 부족해 차감할 수 없습니다.`); return; }
  const beforeTotal = classGroupScore();
  let scoreTransaction = { id: crypto.randomUUID(), groupId: group.id, groupName: group.name, amount, scoreBefore: expectedScore, scoreAfter: localScoreAfter, createdAt: new Date().toISOString(), type };
  if (firebaseGroupsConnected) {
    const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
    firebaseGroupScoreMutating = true;
    try {
      scoreTransaction = await window.ourClassFirebase.applyGroupScoreChange({ groupId: group.id, amount, expectedScore, transaction: scoreTransaction });
      if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during group score mutation.");
    } catch (error) {
      console.error("Firestore group score mutation failed", error);
      if (error?.code === "group-score/conflict") {
        if (await reloadFirebaseGroupScores(userUid)) toast("다른 화면에서 점수가 변경되어 최신 점수를 다시 불러왔습니다.");
        else toast("최신 모둠 점수를 다시 불러오지 못했습니다. 연결을 확인해 주세요.");
      } else if (error?.code === "group-score/insufficient") toast(`${group.name}의 점수가 부족해 차감할 수 없습니다.`);
      else toast("모둠 점수를 클라우드에 저장하지 못했습니다. 다시 시도해 주세요.");
      return;
    } finally { firebaseGroupScoreMutating = false; }
  }
  group.score = scoreTransaction.scoreAfter;
  data.groupScoreTransactions.push(scoreTransaction);
  const afterTotal = classGroupScore(); const reached = data.classMissions.filter((mission) => !mission.confirmed && beforeTotal < mission.target && afterTotal >= mission.target);
  saveData(); render(); toast(`${group.name}에 ${amount > 0 ? "+" : ""}${amount}점을 반영했습니다.`); openMissionReachedModal(reached);
}
async function resetAllGroupScores() {
  if (groupCloudConnectionLocked() || groupScoreCloudStateLocked() || groupScoreMutationLocked() || groupConfigurationSavingLocked()) return;
  const groups = activeGroups();
  const targets = groups.map((group) => ({ groupId: group.id, groupName: group.name, expectedScore: group.score, transactionId: crypto.randomUUID(), createdAt: new Date().toISOString() }));
  let resetTransactions;
  if (firebaseGroupsConnected) {
    const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
    firebaseGroupScoreMutating = true;
    try {
      const result = await window.ourClassFirebase.resetGroupScores({ groups: targets });
      if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during group score reset.");
      groups.forEach((group) => { group.score = result.scores[group.id]; });
      resetTransactions = result.transactions;
    } catch (error) {
      console.error("Firestore group scores reset failed", error);
      if (error?.code === "group-score/conflict") {
        if (await reloadFirebaseGroupScores(userUid)) toast("다른 화면에서 점수가 변경되어 최신 점수를 다시 불러왔습니다.");
        else toast("최신 모둠 점수를 다시 불러오지 못했습니다. 연결을 확인해 주세요.");
      } else toast("모둠 점수를 클라우드에서 초기화하지 못했습니다. 다시 시도해 주세요.");
      return;
    } finally { firebaseGroupScoreMutating = false; }
  } else {
    resetTransactions = targets.flatMap((target) => target.expectedScore > 0 ? [{ id: target.transactionId, groupId: target.groupId, groupName: target.groupName, amount: -target.expectedScore, scoreBefore: target.expectedScore, scoreAfter: 0, createdAt: target.createdAt, type: "reset" }] : []);
    groups.forEach((group) => { group.score = 0; });
  }
  data.groupScoreTransactions.push(...resetTransactions);
  saveData(); render(); toast("모둠 점수를 0점으로 초기화했습니다. 기존 기록과 달성 미션은 유지됩니다.");
}

function teacherRanking() {
  const visibility = RANKING_TYPES.map((ranking) => `<label class="ranking-visibility-option"><input type="checkbox" data-action="toggle-ranking-visibility" data-ranking="${ranking.id}" ${data.rankingVisibility[ranking.id] ? "checked" : ""}><span>${ranking.icon} ${ranking.title}</span></label>`).join("");
  const cards = RANKING_TYPES.map((ranking) => `<article class="card ranking-card teacher-ranking-card"><div class="ranking-card-title"><span>${ranking.icon}</span><h2>${ranking.title}</h2></div><div class="ranking-list">${rankedStudents(ranking.id).map((item) => rankingRow(item, ranking.unit)).join("")}</div></article>`).join("");
  return `<div class="section-heading"><div><h1 class="page-heading">학급 활동 랭킹</h1><p class="page-description">기존 활동 기록을 기준으로 자동 계산합니다.</p></div>${rankingPeriodButtons()}</div><section class="management-section"><div class="section-heading"><div><h2>학생 화면 공개 설정</h2><p class="muted">체크한 랭킹만 학생에게 보입니다.</p></div></div><div class="ranking-visibility-grid">${visibility}</div></section><div class="ranking-grid teacher-ranking-grid">${cards}</div>`;
}

function renderStudent() {
  const views = { home: studentHome, roles: studentRoles, assignments: studentAssignments, points: studentPoints, draw: studentDraw, collection: studentCollection, ranking: studentRanking };
  if (!studentNavItems().some(([view]) => view === session.view)) session.view = "home";
  app.innerHTML = shell((views[session.view] || studentHome)());
}
function renderFirebaseStudentLanding() {
  if (firebaseStudentHomeLoading) { document.title = "우리반 퀘스트"; app.innerHTML = `<main class="welcome"><section class="welcome-card auth-loading"><div class="brand-mark">⚔</div><h1>우리반 퀘스트</h1><p>학생 정보를 불러오는 중...</p></section></main>`; return; }
  if (firebaseStudentHomeError || !firebaseStudentHomeData) { document.title = "우리반 퀘스트"; app.innerHTML = `<main class="welcome"><section class="welcome-card student-auth-landing"><div class="brand-mark">⚔</div><h1>우리반 퀘스트</h1><p>학생 정보를 불러오지 못했습니다. 다시 시도해 주세요.</p><div class="button-row cloud-student-error-actions"><button class="button" data-action="retry-student-home">다시 시도</button><button class="button secondary" data-action="firebase-student-logout">로그아웃</button></div></section></main>`; return; }
  const home = firebaseStudentHomeData; const profile = home.profile; const classInfo = home.classInfo; const features = classInfo.features || {};
  const assignmentOrder = {missing: 0, review: 1, submitted: 2};
  const assignments = [...home.assignments].sort((first, second) => (assignmentOrder[first.status] - assignmentOrder[second.status]) || String(first.dueDate || "9999-12-31").localeCompare(String(second.dueDate || "9999-12-31")));
  const assignmentSection = features.assignments === false ? "" : `<section class="cloud-student-section"><div class="section-heading"><div><h2>진행 중 과제</h2><p class="muted">나의 과제 상태만 표시됩니다.</p></div></div>${assignments.length ? `<div class="grid student-home-assignment-grid">${assignments.map((assignment) => `<article class="card student-assignment-card ${assignment.important ? "important" : ""}"><div class="assignment-labels"><span class="subject-badge">${escapeHtml(assignment.subject)}</span>${assignment.important ? `<span class="important-mark">★ 중요</span>` : ""}${assignment.points > 0 ? `<span class="pill assignment-points-badge">완료 시 +${assignment.points}P</span>` : ""}</div><h3>${escapeHtml(assignment.title)}</h3>${assignment.description ? `<p class="muted">${escapeHtml(assignment.description)}</p>` : ""}<div class="assignment-meta"><span>📅 ${formatDueDate(assignment.dueDate)}</span></div>${assignment.status === "missing" ? `<button class="button assignment-request-button" type="button" data-action="open-cloud-assignment-review" data-id="${escapeHtml(assignment.id)}" ${firebaseStudentAssignmentMutating ? "disabled" : ""}>선생님께 확인 요청</button>` : assignment.status === "review" ? `<div class="assignment-review-state"><strong>⏳ 확인 대기 중</strong><small>선생님이 확인하고 있어요.</small></div>` : `<span class="pill success assignment-finished-label">✓ 제출 완료</span>`}</article>`).join("")}</div>` : `<div class="empty">진행 중인 과제가 없습니다.</div>`}</section>`;
  const activeApplications = home.myRoleApplications.filter((application) => application.status !== "cancelled");
  const roleStatusLabels = {waiting: "신청 대기", completed: "완료", cancelled: "취소됨"};
  const roleNameById = new Map(home.roleSettings.roles.map((role) => [role.id, role.name]));
  const myRoles = activeApplications.length ? `<div class="cloud-my-roles"><strong>나의 오늘 신청 ${activeApplications.length} / ${home.roleSettings.dailyLimit}개</strong>${activeApplications.map((application) => `<span class="pill ${application.status === "completed" ? "success" : "waiting"}">${escapeHtml(roleNameById.get(application.roleId) || "역할")} · ${roleStatusLabels[application.status]}</span>`).join("")}</div>` : `<p class="muted">오늘 신청한 역할이 없습니다.</p>`;
  const roleSection = features.roles === false ? "" : `<section class="cloud-student-section"><div class="section-heading"><div><h2>오늘의 1인1역</h2><p class="muted">현재 역할 신청 현황입니다.</p></div></div>${myRoles}<div class="grid">${home.roleSettings.roles.map((role) => {
    const mine = activeApplications.find((application) => application.roleId === role.id); const full = role.currentCount >= role.capacity; const limitReached = activeApplications.length >= home.roleSettings.dailyLimit;
    const action = mine?.status === "completed" ? `<button class="button secondary" type="button" disabled>완료</button>` : mine?.status === "waiting" ? `<button class="button danger" type="button" data-action="open-cloud-role-cancel" data-id="${escapeHtml(mine.id)}" ${firebaseStudentRoleMutating ? "disabled" : ""}>신청 취소</button>` : `<button class="button" type="button" data-action="apply-cloud-role" data-id="${escapeHtml(role.id)}" ${full || limitReached || firebaseStudentRoleMutating ? "disabled" : ""}>${full ? "마감" : limitReached ? "오늘 신청 완료" : "신청하기"}</button>`;
    return `<article class="card quest-card"><div class="quest-top"><h3>${escapeHtml(role.name)}</h3><span class="points">+${role.points}P</span></div>${role.description ? `<p class="role-description">${escapeHtml(role.description)}</p>` : ""}<span class="pill">현재 ${role.currentCount} / ${role.capacity}명</span><div class="progress"><span style="width:${Math.min(100, role.currentCount / role.capacity * 100)}%"></span></div>${action}</article>`;
  }).join("") || `<div class="empty">현재 신청 가능한 역할이 없습니다.</div>`}</div></section>`;
  document.title = classInfo.appName || "우리반 퀘스트";
  app.innerHTML = `<div class="app-shell student-shell cloud-student-shell"><header class="topbar"><div class="brand"><span class="brand-icon">⚔</span>${escapeHtml(classInfo.appName || "우리반 퀘스트")}</div><div class="user-area"><span>${escapeHtml(profile.name)}</span><button class="ghost-button" data-action="firebase-student-logout">로그아웃</button></div></header><main class="cloud-student-home"><section class="hero student-home-hero"><h1>${escapeHtml(profile.name)}님, 반가워요!</h1><p>${escapeHtml(classInfo.className || "우리 반")}</p></section>${features.points === false ? "" : `<section class="card cloud-student-points"><span>현재 포인트</span><strong>${home.points}P</strong></section>`}${assignmentSection}${roleSection}</main></div>`;
}
function renderTeacher() {
  const views = { dashboard: teacherDashboard, board: teacherWhiteboard, students: teacherStudents, groups: teacherGroups, roles: teacherRoles, assignments: teacherAssignments, observations: teacherObservations, points: teacherPoints, cards: teacherCardsV2, ranking: teacherRanking, "class-settings": teacherClassSettings };
  if (!teacherNavItems().some(([view]) => view === session.view)) session.view = "class-settings";
  app.innerHTML = shell((views[session.view] || teacherDashboard)(), true);
}
function render() { if (session.mode === "welcome" && firebaseAuthPending) return renderAuthLoading(); session.mode === "student" ? renderStudent() : session.mode === "firebase-student" ? renderFirebaseStudentLanding() : session.mode === "teacher" ? renderTeacher() : renderWelcome(); setTimeout(() => { syncTeacherStudentPointPolling(); syncTeacherStudentRepresentativeCards(); window.ourClassWhiteboard?.sync(); }, 0); }

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") { stopTeacherStudentPointPolling(); stopTeacherStudentRepresentativeCardsPolling(); teacherStudentRepresentativeCardsListActive = false; }
  else { syncTeacherStudentPointPolling(true); syncTeacherStudentRepresentativeCards(); }
});
window.addEventListener("focus", () => { syncTeacherStudentPointPolling(true); syncTeacherStudentRepresentativeCards(); });

function roleCloudConnectionLocked() { if (!firebaseRolesConnecting) return false; toast("1인1역 데이터를 클라우드에 연결 중입니다. 잠시 후 다시 시도해 주세요."); return true; }
function groupCloudConnectionLocked() { if (!firebaseGroupsConnecting) return false; toast("모둠활동을 클라우드에 연결하는 중입니다."); return true; }
function groupAssignmentCloudStateLocked() { if (!firebaseTeacherUser || (firebaseClassChecked && !firebaseClassLoadFailed && (!firebaseGroupsConnected || firebaseGroupsLoadReady))) return false; toast("클라우드 연결 확인이 끝난 후 다시 시도해 주세요."); return true; }
function groupAssignmentSavingLocked() { if (!firebaseGroupAssignmentsSaving) return false; toast("모둠 배정을 저장하는 중입니다."); return true; }
function groupScoreCloudStateLocked() { if (!firebaseTeacherUser || (firebaseClassChecked && !firebaseClassLoadFailed && (!firebaseGroupsConnected || firebaseGroupsLoadReady))) return false; toast("모둠 점수를 불러오는 중입니다."); return true; }
function groupScoreMutationLocked() { if (!firebaseGroupScoreMutating) return false; toast("모둠 점수를 저장하는 중입니다."); return true; }
function groupConfigurationCloudStateLocked() { if (!firebaseTeacherUser || (firebaseClassChecked && !firebaseClassLoadFailed && (!firebaseGroupsConnected || firebaseGroupsLoadReady))) return false; toast("모둠 설정을 불러오는 중입니다."); return true; }
function groupConfigurationSavingLocked() { if (!firebaseGroupConfigurationSaving) return false; toast("모둠 설정을 저장하는 중입니다."); return true; }
function observationCloudConnectionLocked() { if (!firebaseObservationsConnecting) return false; toast("관찰기록을 클라우드에 연결하는 중입니다."); return true; }
function observationCloudMutationLocked() { if (!firebaseObservationMutating) return false; toast("관찰기록을 클라우드에 저장하는 중입니다."); return true; }
function observationSettingsCloudLocked() { if (!firebaseObservationSettingsSaving) return false; toast("빠른 선택 항목을 클라우드에 저장하는 중입니다."); return true; }
function classMissionCloudStateLocked() { if (!firebaseTeacherUser || (firebaseClassChecked && !firebaseClassLoadFailed && (!firebaseGroupsConnected || firebaseGroupsLoadReady))) return false; toast("공동 미션을 불러오는 중입니다."); return true; }
function classMissionSavingLocked() { if (!firebaseClassMissionSaving) return false; toast("공동 미션을 저장하는 중입니다."); return true; }
async function persistClassMission(proposedMission, successMessage) {
  if (classMissionCloudStateLocked() || classMissionSavingLocked()) return false;
  if (firebaseGroupsConnected) {
    const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
    firebaseClassMissionSaving = true;
    try {
      await window.ourClassFirebase.saveClassMission(proposedMission);
      if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during class mission save.");
    } catch (error) {
      console.error("Firestore class mission save failed", error);
      toast("공동 미션을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요.");
      return false;
    } finally {
      firebaseClassMissionSaving = false;
    }
  }
  const missionIndex = data.classMissions.findIndex((mission) => mission.id === proposedMission.id);
  if (missionIndex >= 0) data.classMissions[missionIndex] = proposedMission;
  else data.classMissions.push(proposedMission);
  saveData(); render(); toast(successMessage);
  return true;
}
async function removeClassMission(missionId) {
  if (classMissionCloudStateLocked() || classMissionSavingLocked()) return false;
  if (firebaseGroupsConnected) {
    const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
    firebaseClassMissionSaving = true;
    try {
      await window.ourClassFirebase.deleteClassMission(missionId);
      if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during class mission delete.");
    } catch (error) {
      console.error("Firestore class mission delete failed", error);
      toast("공동 미션을 클라우드에서 삭제하지 못했습니다. 다시 시도해 주세요.");
      return false;
    } finally {
      firebaseClassMissionSaving = false;
    }
  }
  data.classMissions = data.classMissions.filter((mission) => mission.id !== missionId);
  saveData(); render(); toast("공동 미션을 삭제했습니다.");
  return true;
}
async function persistObservationQuickItems(proposedQuickItems) {
  if (firebaseTeacherUser && (!firebaseClassChecked || firebaseClassLoadFailed)) {
    toast("클라우드 연결 확인이 끝난 후 다시 시도해 주세요.");
    return false;
  }
  if (firebaseObservationsConnected) {
    const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
    firebaseObservationSettingsSaving = true;
    try {
      await window.ourClassFirebase.saveObservationSettings({ quickItems: proposedQuickItems });
      if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during observation settings save.");
    } catch (error) {
      console.error("Firestore observation settings save failed", error);
      toast("빠른 선택 항목을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요.");
      return false;
    } finally {
      firebaseObservationSettingsSaving = false;
    }
  }
  data.observationQuickItems = proposedQuickItems;
  saveData();
  return true;
}
function roleConfigurationCloudLocked() { if (!firebaseRoleConfigurationSaving) return false; toast("1인1역 설정을 클라우드에 저장 중입니다. 잠시 후 다시 시도해 주세요."); return true; }
function roleApplicationCloudLocked() { if (!firebaseRoleApplicationMutating && !firebaseRoleDailyUsageInitializing) return false; toast("역할 신청 상태를 클라우드에 반영 중입니다. 잠시 후 다시 시도해 주세요."); return true; }
async function handleRoleApplicationCloudError(error, userUid) {
  console.error("Firestore atomic role application failed", error);
  if (error?.code === "role/limit-reached") { await reloadFirebaseRoleApplicationsAndUsage(userUid); return toast("오늘 신청할 수 있는 역할 수를 모두 사용했습니다."); }
  if (error?.code === "role/capacity-reached") { await reloadFirebaseRoleApplicationsAndUsage(userUid); return toast("다른 학생이 먼저 신청해 역할 정원이 찼습니다."); }
  if (error?.code === "role/already-applied") { await reloadFirebaseRoleApplicationsAndUsage(userUid); return toast("이미 신청된 역할입니다."); }
  if (error?.code === "role/not-found") return toast("현재 사용할 수 없는 역할입니다. 역할 목록을 다시 확인해 주세요.");
  if (["role/status-conflict", "role/usage-conflict", "role/usage-missing"].includes(error?.code)) {
    const loaded = await reloadFirebaseRoleApplicationsAndUsage(userUid);
    return toast(loaded ? "다른 화면에서 역할 상태가 변경되어 최신 상태를 불러왔습니다." : "최신 역할 상태를 불러오지 못했습니다. 연결을 확인해 주세요.");
  }
  toast("역할 신청을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요.");
}
async function applyRole(roleId) {
  if (roleCloudConnectionLocked() || roleApplicationCloudLocked()) return;
  const active = todayRoleApplicationsForStudent(session.studentId); const limit = data.dailyRoleApplicationLimit;
  const roleApplicants = todayRoleApplications().filter((item) => item.roleId === roleId);
  const role = roleById(roleId);
  if (!role || role.active === false) return;
  if (!firebaseRolesConnected && active.length >= limit) return toast(`오늘 신청 가능한 1인1역을 모두 신청했습니다. (최대 ${limit}개)`);
  if (!firebaseRolesConnected && roleApplicants.length >= role.capacity) return toast("아쉽지만 이 역할은 모집이 끝났어요.");
  if (!firebaseRolesConnected && roleApplicants.some((item) => item.studentId === session.studentId)) return;
  const appliedAt = new Date().toISOString(); const cancelled = data.roleApplications.find((item) => item.studentId === session.studentId && item.roleId === roleId && item.status === "cancelled" && roleApplicationDate(item) === todayString());
  if (firebaseRolesConnected) {
    const userUid = firebaseTeacherUser?.uid;
    if (!firebaseRoleDailyUsageReady || firebaseRoleDailyUsageDate !== todayString()) {
      if (!await ensureFirebaseRoleDailyUsage(userUid)) return;
    }
    const proposed = cancelled
      ? { ...initialRoleApplicationSnapshot(cancelled), expectedStatus: "cancelled", status: "waiting", date: todayString(), appliedAt, roleSnapshot: roleSnapshot(role), cancelledAt: null, cancelledBy: null }
      : { id: crypto.randomUUID(), expectedStatus: null, studentId: session.studentId, roleId, status: "waiting", date: todayString(), appliedAt, roleSnapshot: roleSnapshot(role), pointAward: {}, completedAt: null, cancelledAt: null, cancelledBy: null };
    firebaseRoleApplicationMutating = true;
    try {
      const savedApplication = await window.ourClassFirebase.applyDailyRoleApplicationTransaction(proposed);
      const index = data.roleApplications.findIndex((item) => item.id === savedApplication.id);
      if (index >= 0) data.roleApplications[index] = savedApplication; else data.roleApplications.push(savedApplication);
      saveData(); render(); toast("역할 신청이 완료됐어요!");
    } catch (error) { await handleRoleApplicationCloudError(error, userUid); }
    finally { firebaseRoleApplicationMutating = false; }
    return;
  }
  if (cancelled) {
    Object.assign(cancelled, { status: "waiting", date: todayString(), appliedAt, roleSnapshot: roleSnapshot(role), cancelledAt: null, cancelledBy: null });
    if (storedRolePointAward(cancelled)) cancelled.pointAward = { ...cancelled.pointAward, awarded: false };
  } else data.roleApplications.push({ id: crypto.randomUUID(), studentId: session.studentId, roleId, status: "waiting", date: todayString(), appliedAt, roleSnapshot: roleSnapshot(role), cancelledAt: null, cancelledBy: null });
  saveData(); render(); toast("역할 신청이 완료됐어요!");
}

function openStudentCancelModal(applicationId) {
  const application = data.roleApplications.find((item) => item.id === applicationId && item.studentId === session.studentId && item.status === "waiting");
  if (!application) return;
  const role = roleForApplication(application); if (!role) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>역할 신청 취소</h2><p><strong>${escapeHtml(role.name)}</strong></p><p>이 역할 신청을 취소하시겠습니까?</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-student-cancel" data-id="${application.id}">확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

async function cancelOwnRole(applicationId) {
  if (roleCloudConnectionLocked() || roleApplicationCloudLocked()) return;
  const application = data.roleApplications.find((item) => item.id === applicationId);
  if (!application || application.studentId !== session.studentId || application.status !== "waiting") return;
  if (firebaseRolesConnected) {
    const userUid = firebaseTeacherUser?.uid;
    if (!firebaseRoleDailyUsageReady || firebaseRoleDailyUsageDate !== todayString()) { if (!await ensureFirebaseRoleDailyUsage(userUid)) return; }
    firebaseRoleApplicationMutating = true;
    try {
      const savedApplication = await window.ourClassFirebase.cancelDailyRoleApplicationTransaction({ id: application.id, date: roleApplicationDate(application), cancelledAt: new Date().toISOString(), cancelledBy: "student" });
      data.roleApplications[data.roleApplications.findIndex((item) => item.id === application.id)] = savedApplication;
      saveData(); render(); toast("역할 신청을 취소했습니다. 다시 신청할 수도 있어요.");
    } catch (error) { await handleRoleApplicationCloudError(error, userUid); }
    finally { firebaseRoleApplicationMutating = false; }
    return;
  }
  application.status = "cancelled"; application.cancelledAt = new Date().toISOString(); application.cancelledBy = "student";
  saveData(); render(); toast("역할 신청을 취소했습니다. 다시 신청할 수도 있어요.");
}

async function cancelRoleAsTeacher(applicationId) {
  if (roleCloudConnectionLocked() || roleApplicationCloudLocked()) return;
  const application = data.roleApplications.find((item) => item.id === applicationId);
  if (!application || application.status !== "waiting") return;
  if (firebaseRolesConnected) {
    const userUid = firebaseTeacherUser?.uid;
    if (!firebaseRoleDailyUsageReady || firebaseRoleDailyUsageDate !== todayString()) { if (!await ensureFirebaseRoleDailyUsage(userUid)) return; }
    firebaseRoleApplicationMutating = true;
    try {
      const savedApplication = await window.ourClassFirebase.cancelDailyRoleApplicationTransaction({ id: application.id, date: roleApplicationDate(application), cancelledAt: new Date().toISOString(), cancelledBy: "teacher" });
      data.roleApplications[data.roleApplications.findIndex((item) => item.id === application.id)] = savedApplication;
      saveData(); render(); toast("역할 신청을 취소했습니다.");
    } catch (error) { await handleRoleApplicationCloudError(error, userUid); }
    finally { firebaseRoleApplicationMutating = false; }
    return;
  }
  application.status = "cancelled"; application.cancelledAt = new Date().toISOString(); application.cancelledBy = "teacher";
  saveData(); render(); toast("역할 신청을 취소했습니다.");
}

function completeRole(id) {
  if (roleCloudConnectionLocked()) return;
  const application = data.roleApplications.find((item) => item.id === id);
  if (!application || application.status !== "waiting") return;
  const student = studentById(application.studentId); const role = roleForApplication(application);
  if (!student || !role) return;
  const baseAmount = role.points; const cardAbilityResult = cardBonusAward(student, baseAmount, "1인1역", role.id); const { historyEntry: cardBonusHistoryEntry, ...cardAbilityAward } = cardAbilityResult; const bonusAmount = cardAbilityAward.amount || 0;
  const amount = baseAmount + bonusAmount; const awardedAt = new Date().toISOString();
  const historyEntries = baseAmount > 0 ? [{ id: crypto.randomUUID(), amount: baseAmount, reason: `${role.name} 완료`, source: "1인1역", relatedId: role.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: awardedAt }, cardBonusHistoryEntry] : [];
  const expectedPointAward = storedRolePointAward(application) || {};
  const pointAward = { awarded: true, amount, baseAmount, bonusAmount, cardAbilityAward: structuredClone(cardAbilityAward), awardedAt, revokedAt: null };
  const dailyRoleAssignment = { ...initialRoleApplicationSnapshot(application), expectedStatus: "waiting", expectedPointAward, status: "completed", pointAward, completedAt: awardedAt, cancelledAt: null, cancelledBy: null };
  if (!applyStudentPointChange(student, amount, historyEntries, { roleApplication: application, dailyRoleAssignment })) return;
  application.awardedBasePoints = baseAmount; application.awardedBonusPoints = bonusAmount; application.cardAbilityAward = cardAbilityAward; application.awardedPoints = amount;
  saveData(); render(); toast(`${student.name}에게 ${amount}P를 지급했습니다.${bonusAmount ? ` (카드 보너스 +${bonusAmount}P)` : ""}`);
}

function undoCompleteRole(id) {
  if (roleCloudConnectionLocked()) return;
  const application = data.roleApplications.find((item) => item.id === id);
  if (!application || application.status !== "completed") return;
  const student = studentById(application.studentId); const role = roleForApplication(application);
  if (!student || !role) return;
  const pointAward = rolePointAward(application, role); const baseToRecover = pointAward.awarded ? Number(pointAward.baseAmount) || 0 : 0; const pointsToRecover = pointAward.awarded ? Number(pointAward.amount) || 0 : 0;

  if (!confirm("이 역할의 완료 처리를 취소하시겠습니까?\n지급된 포인트도 함께 회수됩니다.")) return;
  if (application.status !== "completed") return;
  if (student.points < pointsToRecover) {
    alert(`${student.name}의 현재 포인트가 ${student.points}P라서 ${pointsToRecover}P를 회수할 수 없습니다.\n학생의 포인트를 먼저 확인해 주세요.`);
    return;
  }

  const revokedAt = new Date().toISOString(); const historyEntries = [baseToRecover > 0 ? { id: crypto.randomUUID(), amount: -baseToRecover, reason: `${role.name} 완료 취소`, source: "1인1역", relatedId: role.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: revokedAt } : null, reverseCardBonus(student, pointAward.cardAbilityAward, `${role.name} 완료 카드 보너스 취소`)];
  const expectedPointAward = storedRolePointAward(application) || pointAward;
  const revokedPointAward = { ...pointAward, awarded: false, revokedAt };
  const dailyRoleAssignment = { ...initialRoleApplicationSnapshot(application), expectedStatus: "completed", expectedPointAward, status: "waiting", pointAward: revokedPointAward, completedAt: null, cancelledAt: null, cancelledBy: null };
  if (!applyStudentPointChange(student, -pointsToRecover, historyEntries, { roleApplication: application, dailyRoleAssignment })) return;
  application.awardedPoints = 0; application.awardedBasePoints = 0; application.awardedBonusPoints = 0;
  application.cardAbilityAward = null;
  saveData(); render(); toast(`${student.name}의 역할 완료를 취소하고 ${pointsToRecover}P를 회수했습니다.`);
}

function pickRarity(rates) {
  const value = Math.random() * 100; let total = 0;
  for (const rarity of CARD_RARITIES) { total += drawRate(rarity, rates); if (value < total) return rarity; }
  return "일반";
}
function drawCard(optionId) {
  const student = currentStudent(); const option = data.drawOptions.find((item) => item.id === optionId && item.active && !item.deleted); if (!option || student.points < option.price) return;
  const activeCards = data.cards.filter((card) => data.activeCardSetIds.includes(card.cardSetId) && cardSetById(card.cardSetId)?.active && card.active && !card.deleted); if (!activeCards.length) { toast("선택한 카드셋에서 뽑을 수 있는 카드가 없습니다."); return; }
  const rarity = pickRarity(option.rates); const figure = activeCards[Math.floor(Math.random() * activeCards.length)]; const abilityId = randomAbilityId(); const ability = cardAbilityById(abilityId);
  if (!abilityId || !ability) { toast("사용 가능한 특수능력이 없습니다. 교사 설정을 확인해 주세요."); return; }
  const pointEntry = { id: crypto.randomUUID(), amount: -option.price, reason: `${option.name} · ${figure.name} 카드 뽑기`, source: "카드 뽑기", drawOptionId: option.id, drawOptionName: option.name, drawPrice: option.price, date: new Date().toLocaleDateString("ko-KR") };
  if (!applyStudentPointChange(student, -option.price, pointEntry)) return;
  if (!student.cards[figure.id]) student.cards[figure.id] = {}; if (!student.cards[figure.id][rarity]) student.cards[figure.id][rarity] = Object.fromEntries(cardAbilities().map((item) => [item.id, 0])); student.cards[figure.id][rarity][abilityId] = (student.cards[figure.id][rarity][abilityId] || 0) + 1;
  student.cardAcquisitionHistory.push({ id: crypto.randomUUID(), cardId: figure.id, rarity, abilityId, source: "카드 뽑기", createdAt: new Date().toISOString() });
  saveData();
  const card = document.querySelector("#draw-card"); const result = document.querySelector("#draw-result");
  result.className = `draw-face draw-front rarity-${rarityClass(rarity)}`;
  result.innerHTML = `<div class="card-front-content"><span class="pill rarity-${rarityClass(rarity)}">${rarity}</span>${cardImageMarkup(figure, "draw-card-image")}<h3>${escapeHtml(figure.name)}</h3><p>${escapeHtml(figure.era)}</p><strong>${ability.icon} ${escapeHtml(ability.name)}</strong></div>`;
  requestAnimationFrame(() => card.classList.add("revealed"));
  document.querySelector("#draw-current-points").textContent = `${student.points}P`;
  const summaryPoints = document.querySelector(".summary-item strong"); if (summaryPoints) summaryPoints.textContent = `${student.points}P`;
  document.querySelectorAll('[data-action="draw-option"]').forEach((button) => { const item = data.drawOptions.find((candidate) => candidate.id === button.dataset.id); button.disabled = !item || student.points < item.price; button.textContent = button.disabled ? "포인트 부족" : `${item.price}P로 뽑기`; });
  toast(`${option.name}: ${figure.name} ${rarity} · ${ability.name} 카드를 획득했어요.`);
}

function openCardModal(cardId = "", preferredSetId = "") {
  const card = data.cards.find((item) => item.id === cardId);
  const selectedSetId = card?.cardSetId || preferredSetId || teacherCardSetId || data.activeCardSetIds[0];
  pendingCardImageData = cardImageSource(card); pendingCardImagePath = card?.imagePath || ""; pendingCardImageDeleted = false;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="card-form" class="modal-card form card-form-modal" data-id="${cardId}"><h2>${card ? "카드 수정" : "새 카드 추가"}</h2><label>카드셋<select name="cardSetId">${data.cardSets.filter((cardSet) => !cardSet.deleted).map((cardSet) => `<option value="${cardSet.id}" ${cardSet.id === selectedSetId ? "selected" : ""}>${escapeHtml(cardSet.name)}</option>`).join("")}</select></label><label>카드 이름<input name="name" maxlength="40" required value="${card ? escapeHtml(card.name) : ""}" placeholder="예: 세종대왕, 대한민국, 광합성"></label><label>분류 / 부제<input name="era" maxlength="40" required value="${card ? escapeHtml(card.era) : ""}" placeholder="예: 조선, 아시아, 생명과학"></label><label>한 줄 설명<input name="achievement" maxlength="160" required value="${card ? escapeHtml(card.achievement) : ""}" placeholder="카드를 간단하게 설명해 주세요."></label><fieldset class="card-image-field"><legend>카드 이미지</legend><div id="card-image-preview" class="card-image-preview">${pendingCardImageData ? `<img src="${escapeHtml(pendingCardImageData)}" alt="현재 카드 이미지">` : `<span>이미지 없음</span>`}</div><label class="button secondary compact card-image-file-button"><span>${pendingCardImageData ? "이미지 변경" : "파일 선택"}</span><input id="card-image-input" type="file" accept="image/jpeg,image/png,image/webp"></label><button class="button danger compact" type="button" data-action="delete-card-image" ${pendingCardImageData ? "" : "disabled"}>이미지 삭제</button><small id="card-image-message" class="muted">4:5 비율로 자른 뒤 800×1000 WebP로 최적화합니다.</small></fieldset><p class="form-help">카드 정보를 한 번만 등록하면 일반·희귀·영웅·전설·고대 등급을 모두 사용할 수 있습니다.</p><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function openCardSetModal(cardSetId = "") {
  const cardSet = cardSetById(cardSetId);
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="card-set-form" class="modal-card form" data-id="${cardSetId}"><h2>${cardSet ? "카드셋 수정" : "새 카드셋 만들기"}</h2><label>카드셋 이름<input name="name" maxlength="50" required value="${cardSet ? escapeHtml(cardSet.name) : ""}" placeholder="예: 조선 시대 인물"></label><label>설명 (선택)<textarea name="description" maxlength="200" placeholder="카드셋을 간단히 설명해 주세요.">${cardSet ? escapeHtml(cardSet.description) : ""}</textarea></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function openDrawOptionModal(optionId = "") {
  const option = data.drawOptions.find((item) => item.id === optionId && FIXED_DRAW_OPTION_NAMES[item.id]); if (!option) return;
  const rates = option.rates || DEFAULT_DRAW_RATES;
  const rateInputs = CARD_RARITIES.map((rarity) => `<label><span>${rarity}</span><span class="rate-input-wrap"><input name="${CARD_RATE_KEYS[rarity]}" type="number" min="0" max="100" step="1" value="${drawRate(rarity, rates)}" required><b>%</b></span></label>`).join("");
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="draw-option-form" class="modal-card form" data-id="${optionId}"><h2>${escapeHtml(FIXED_DRAW_OPTION_NAMES[option.id])} 설정</h2><input name="name" type="hidden" value="${escapeHtml(FIXED_DRAW_OPTION_NAMES[option.id])}"><label>1회 가격<input name="price" type="number" min="0" step="1" required value="${option.price}"></label><fieldset class="draw-option-rate-fieldset"><legend>등급별 확률</legend><div class="draw-rate-grid">${rateInputs}</div></fieldset><div class="draw-rate-total-line"><strong>합계: <span id="draw-rate-total">100</span>%</strong></div><p id="draw-rate-error" class="form-error" hidden>등급별 확률의 합계가 100%가 되어야 합니다.</p><div class="button-row"><button id="draw-rate-save" class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function openCardUpgradeModal(cardId, rarity) {
  const student = currentStudent(); const card = data.cards.find((item) => item.id === cardId); const step = upgradeStepFrom(rarity); const required = upgradeRequired(rarity); if (!student || !card || !step || rarityInventoryCount(student, cardId, rarity) < required) return;
  const materialRows = cardAbilities().map((ability) => { const count = Number(abilityInventory(student, cardId, rarity)[ability.id]) || 0; return count ? `<label class="upgrade-material-row"><span>${ability.icon} ${ability.name} <b>×${count}</b></span><input name="material-${ability.id}" type="number" min="0" max="${count}" step="1" value="0"></label>` : ""; }).join("");
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>카드 업그레이드</h2><p><strong>${escapeHtml(card.name)} ${rarity}</strong> 카드 중 사용할 재료를 정확히 ${required}장 선택해 주세요.</p><div class="upgrade-material-list">${materialRows}</div><p class="muted">결과 카드의 특수능력은 새로 무작위 결정됩니다.</p><div class="button-row"><button class="button success" type="button" data-action="confirm-card-upgrade" data-card-id="${card.id}" data-rarity="${rarity}">${step.to} 카드로 업그레이드</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openCollectionCardModal(cardId, rarity, abilityId = "", showBack = false) {
  const student = currentStudent(); const card = data.cards.find((item) => item.id === cardId); if (!student || !card || !CARD_RARITIES.includes(rarity)) return;
  const inventory = abilityInventory(student, card.id, rarity); const ownedAbilities = cardAbilities().filter((ability) => Number(inventory[ability.id]) > 0); const quantity = rarityInventoryCount(student, card.id, rarity); if (!quantity || !ownedAbilities.length) return;
  const selectedAbility = ownedAbilities.find((ability) => ability.id === abilityId) || ownedAbilities[0]; const selectedCount = Number(inventory[selectedAbility.id]) || 0;
  const representative = student.representativeCard; const equipped = representative?.cardId === card.id && representative?.rarity === rarity && representative?.abilityId === selectedAbility.id;
  const abilityButtons = ownedAbilities.map((ability) => `<button class="collection-ability-chip ${ability.id === selectedAbility.id ? "selected" : ""}" data-action="select-collection-ability" data-card-id="${card.id}" data-rarity="${rarity}" data-ability-id="${ability.id}">${ability.icon} ${ability.name} ×${Number(inventory[ability.id]) || 0}</button>`).join("");
  const step = upgradeStepFrom(rarity); const needed = upgradeRequired(rarity); const upgradeControl = step ? quantity >= needed ? `<button class="button secondary compact" data-action="ask-upgrade-card" data-card-id="${card.id}" data-rarity="${rarity}">⬆ ${step.to}로 업그레이드</button>` : `<span class="muted">업그레이드 ${quantity} / ${needed}장</span>` : `<span class="muted">최고 등급 카드</span>`;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card collection-card-modal"><div class="section-heading"><div><h2>카드 상세</h2><p class="muted">카드 또는 뒤집기 버튼을 눌러 앞·뒷면을 확인하세요.</p></div><button class="icon-button" data-action="close-modal" aria-label="카드 상세 닫기">×</button></div><div class="collection-detail-stage ${showBack ? "show-back" : ""}" data-action="flip-collection-card" role="button" tabindex="0" aria-label="카드 앞뒷면 전환"><article class="collection-detail-face collection-detail-front rarity-${rarityClass(rarity)}"><span class="pill rarity-${rarityClass(rarity)}">${rarity}</span>${cardImageMarkup(card, "collection-detail-image")}<h2>${escapeHtml(card.name)}</h2><small>${escapeHtml(card.era)}</small><strong>보유 ${quantity}장</strong>${equipped ? `<span class="representative-card-mark">대표 카드</span>` : ""}</article><article class="collection-detail-face collection-detail-back rarity-${rarityClass(rarity)}"><span class="pill rarity-${rarityClass(rarity)}">${rarity}</span><div class="collection-detail-ability-icon">${selectedAbility.icon}</div><h2>${selectedAbility.name}</h2><p>${abilitySummary(rarity, selectedAbility.id).split(" · ")[1]}</p><strong>이 능력 보유 ${selectedCount}장</strong>${equipped ? `<span class="representative-card-mark">대표 카드</span>` : ""}</article></div><div class="collection-modal-controls"><button class="button" data-action="flip-collection-card">${showBack ? "앞면 보기" : "뒤집기"}</button><div class="collection-ability-picker"><strong>보유 능력 선택</strong><div>${abilityButtons}</div></div><div class="button-row"><button class="button ${equipped ? "secondary" : "success"} compact" data-action="equip-representative-card" data-card-id="${card.id}" data-rarity="${rarity}" data-ability-id="${selectedAbility.id}" ${equipped || !selectedAbility.active || selectedAbility.deleted ? "disabled" : ""}>${equipped ? "대표 카드 ✓" : !selectedAbility.active || selectedAbility.deleted ? "현재 사용 중지" : "대표 카드로 설정"}</button>${upgradeControl}</div></div></section></div>`);
}

function openDeleteCardSetModal(cardSetId) {
  const cardSet = cardSetById(cardSetId); if (!cardSet || cardSet.deleted) return;
  const setCards = sortedCards(true, cardSet.id); const ownerCount = data.students.filter((student) => setCards.some((card) => cardInventoryCount(student, card.id) > 0)).length;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>카드셋 삭제</h2><p><strong>${escapeHtml(cardSet.name)}</strong> 카드셋을 삭제하시겠습니까?</p>${setCards.length ? `<p>이 카드셋에는 카드 ${setCards.length}장이 있습니다.</p>` : ""}${ownerCount ? `<p><strong>현재 ${ownerCount}명의 학생이 이 카드셋의 카드를 보유하고 있습니다.</strong><br>삭제해도 학생 도감의 보유 기록은 유지됩니다.</p>` : ""}<p class="muted">안전을 위해 실제 보유 데이터는 지우지 않고 카드셋을 사용 중지·숨김 처리합니다.</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-delete-card-set" data-id="${cardSet.id}">삭제</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openDeleteCardModal(cardId) {
  const card = data.cards.find((item) => item.id === cardId && !item.deleted); if (!card) return;
  const ownerCount = data.students.filter((student) => cardInventoryCount(student, card.id) > 0).length;
  const ownerWarning = ownerCount ? `<p><strong>현재 ${ownerCount}명의 학생이 이 카드를 보유하고 있습니다.</strong><br>삭제해도 학생 도감의 보유 카드는 안전하게 유지됩니다.</p>` : "";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>카드 삭제</h2><p>이 카드를 삭제하시겠습니까?</p>${ownerWarning}<p class="muted">삭제된 카드는 새 카드 뽑기와 선생님 목록에서 제외됩니다.</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-delete-card" data-id="${card.id}">삭제</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
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
  const selectableStudents = activeStudents();
  const existingStudent = observation ? studentById(observation.studentId) : null;
  if (existingStudent && !selectableStudents.some((student) => student.id === existingStudent.id)) selectableStudents.push(existingStudent);
  const preferredStudentId = observation?.studentId || presets.studentId || observationFilters.studentId || "";
  const selectedStudentId = selectableStudents.some((student) => student.id === preferredStudentId) ? preferredStudentId : selectableStudents[0]?.id || "";
  const selectedDate = observation?.date || presets.date || todayString();
  const selectedCategory = observation?.category || presets.category || "수업";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="observation-form" class="modal-card form observation-modal-card" data-id="${observationId}"><h2>${observation ? "관찰 기록 수정" : "새 관찰 기록"}</h2><label>학생 검색<input id="observation-student-search" type="search" placeholder="이름 또는 번호 입력 (예: 학생12)" autocomplete="off"></label><fieldset class="observation-student-picker"><legend>학생 선택</legend>${selectableStudents.map((student) => `<label data-student-search="${escapeHtml(`${student.name} ${studentNumber(student)}`.toLocaleLowerCase("ko-KR"))}"><input type="radio" name="studentId" value="${student.id}" ${student.id === selectedStudentId ? "checked" : ""} required><span>${escapeHtml(student.name)}</span></label>`).join("")}</fieldset><label>날짜<input name="date" type="date" value="${selectedDate}" required></label><label>분류<select id="observation-category" name="category">${OBSERVATION_CATEGORIES.map((category) => `<option ${category === selectedCategory ? "selected" : ""}>${category}</option>`).join("")}</select></label><section id="observation-quick-section" class="observation-quick-section">${observationQuickSectionHtml(selectedCategory, observation?.quickItems || [])}</section><label>내용<textarea name="content" maxlength="1000" required placeholder="빠른 항목을 참고해 관찰 내용을 자유롭게 적어 주세요.">${observation ? escapeHtml(observation.content) : ""}</textarea></label><div class="button-row"><button class="button success" type="submit">저장</button>${observation ? "" : `<button class="button" type="submit" data-continue="true">저장 후 계속 기록</button>`}<button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
  document.querySelector("#observation-student-search")?.focus();
}

function openDeleteObservationModal(observationId) {
  const observation = data.observations.find((item) => item.id === observationId); if (!observation) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>관찰 기록 삭제</h2><p>이 관찰 기록을 삭제하시겠습니까?</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-delete-observation" data-id="${observation.id}">삭제</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openAssignmentModal(assignmentId = "", duplicate = false) {
  const assignment = data.assignments.find((item) => item.id === assignmentId);
  const presetSubject = assignment && SUBJECTS.includes(assignment.subject) ? assignment.subject : "기타";
  const customSubject = assignment && !SUBJECTS.includes(assignment.subject) ? assignment.subject : "";
  const title = duplicate && assignment ? `${assignment.title} 복사본` : assignment?.title || "";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="assignment-form" class="modal-card form" data-id="${duplicate ? "" : assignmentId}" data-duplicate-from="${duplicate ? assignmentId : ""}"><h2>${duplicate ? "과제 복제" : assignment ? "과제 수정" : "새 과제 만들기"}</h2>${duplicate ? `<p class="muted">학생 제출 상태와 포인트 지급 기록은 복사하지 않습니다. 새 마감일을 확인해 주세요.</p>` : ""}<label>과제 제목<input name="title" maxlength="80" required value="${escapeHtml(title)}" placeholder="예: 수학 익힘책 30쪽"></label><label>과목<select name="subjectPreset">${SUBJECTS.map((subject) => `<option ${presetSubject === subject ? "selected" : ""}>${subject}</option>`).join("")}</select></label><label>과목 직접 입력 (선택)<input name="subjectCustom" maxlength="30" value="${escapeHtml(customSubject)}" placeholder="예: 미술"></label><label>과제 설명 (선택)<textarea name="description" maxlength="300" placeholder="과제 내용을 간단히 적어 주세요.">${assignment ? escapeHtml(assignment.description) : ""}</textarea></label><label>제출 기한<input name="dueDate" type="date" required value="${assignment?.dueDate || todayString()}"></label><label class="check-label"><input name="important" type="checkbox" ${assignment?.important ? "checked" : ""}><span>중요 과제로 표시</span></label><label class="assignment-point-field">완료 시 지급 포인트<span class="point-input-row"><input name="points" type="number" min="0" step="1" required value="${assignment?.points ?? 0}"><span>P</span></span></label><div class="button-row"><button class="button success" type="submit">${duplicate ? "새 과제로 만들기" : "저장"}</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function assignmentAward(assignment, studentId) {
  return assignment.pointAwards?.[studentId] || { awarded: false, amount: 0 };
}

function storedAssignmentAward(assignment, studentId) {
  const awards = assignment.pointAwards;
  return awards && typeof awards === "object" && !Array.isArray(awards) && Object.hasOwn(awards, studentId) && awards[studentId] && typeof awards[studentId] === "object" && !Array.isArray(awards[studentId]) ? structuredClone(awards[studentId]) : null;
}

function storedAssignmentStatus(assignment, studentId) {
  const statuses = assignment.studentStatuses;
  const status = statuses && typeof statuses === "object" && !Array.isArray(statuses) ? statuses[studentId] : null;
  return ASSIGNMENT_STATUSES.includes(status) ? status : "missing";
}

function prepareAssignmentStudentStatusChange(assignment, studentId, nextStatus) {
  const student = studentById(studentId); if (!assignment || !student || !ASSIGNMENT_STATUSES.includes(nextStatus)) return { ok: false, reason: "invalid" };
  const previousStatus = storedAssignmentStatus(assignment, studentId); if (previousStatus === nextStatus) return { ok: true, noOp: true, student, expectedStatus: previousStatus, nextStatus };
  const storedAward = storedAssignmentAward(assignment, student.id); const expectedPointAward = storedAward || {}; const award = storedAward || { awarded: false, amount: 0 };
  let nextPointAward = structuredClone(expectedPointAward); let balanceDelta = 0; let historyEntries = [];
  if (previousStatus === "submitted" && nextStatus !== "submitted" && award.awarded) {
    const awardedAmount = Number(award.amount) || 0;
    if (awardedAmount > 0) {
      if (student.points < awardedAmount) return { ok: false, reason: "insufficient", student, requiredPoints: awardedAmount };
      const baseAmount = award.baseAmount ?? awardedAmount;
      historyEntries = [{ id: crypto.randomUUID(), amount: -baseAmount, reason: `${assignment.title} 제출 완료 취소`, source: "과제", relatedId: assignment.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() }, reverseCardBonus(student, award.cardAbilityAward, `${assignment.title} 제출 완료 카드 보너스 취소`)];
      balanceDelta = -awardedAmount;
    }
    nextPointAward = { ...award, awarded: false, revokedAt: new Date().toISOString() };
  }
  if (nextStatus === "submitted" && !nextPointAward.awarded) {
    const baseAmount = assignment.points; const cardAbilityResult = cardBonusAward(student, baseAmount, "과제", assignment.id); const { historyEntry: cardBonusHistoryEntry, ...cardAbilityAward } = cardAbilityResult; const bonusAmount = cardAbilityAward.amount || 0; const amount = baseAmount + bonusAmount;
    if (baseAmount > 0) {
      historyEntries = [{ id: crypto.randomUUID(), amount: baseAmount, reason: `${assignment.title} 제출 완료`, source: "과제", relatedId: assignment.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() }, cardBonusHistoryEntry];
      balanceDelta = amount;
    }
    nextPointAward = { awarded: true, amount, baseAmount, bonusAmount, cardAbilityAward, awardedAt: new Date().toISOString(), revokedAt: null };
  }
  const assignmentStudentState = { assignmentId: assignment.id, studentId, expectedStatus: previousStatus, expectedPointAward, status: nextStatus, pointAward: nextPointAward };
  return { ok: true, noOp: false, student, expectedStatus: previousStatus, expectedPointAward, nextStatus, nextPointAward, balanceDelta, historyEntries, assignmentStudentState, change: { student, balanceDelta, historyEntries, assignment, assignmentStudentState } };
}

function showAssignmentStatusPreparationError(plan) {
  if (plan?.reason !== "insufficient" || !plan.student) return;
  alert(`${plan.student.name}의 현재 포인트가 ${plan.student.points}P라서 ${plan.requiredPoints}P를 회수할 수 없습니다.\n학생의 포인트를 먼저 확인해 주세요.`);
}

function changeAssignmentStudentStatus(assignment, studentId, nextStatus) {
  if (firebaseAssignmentStudentStatesConnecting) { toast("과제 상태를 클라우드에 연결 중입니다. 잠시 후 다시 시도해 주세요."); return false; }
  const plan = prepareAssignmentStudentStatusChange(assignment, studentId, nextStatus);
  if (!plan.ok) { showAssignmentStatusPreparationError(plan); return false; }
  if (plan.noOp) return true;
  return applyStudentPointChanges([plan.change]);
}

function openCancelAssignmentSubmissionModal(assignmentId, studentId, nextStatus) {
  const assignment = data.assignments.find((item) => item.id === assignmentId); const student = studentById(studentId);
  if (!assignment || !student || assignmentStatusForStudent(assignment, studentId) !== "submitted") return;
  const award = assignmentAward(assignment, student.id); const recovery = award.awarded && award.amount > 0 ? `<br>이 과제로 지급된 ${award.amount}P도 함께 회수됩니다.` : "";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>제출 완료 취소</h2><p class="confirm-message"><strong>${escapeHtml(student.name)}</strong>의 제출 완료를 취소하시겠습니까?${recovery}</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-cancel-assignment-submission" data-id="${assignment.id}" data-student="${studentId}" data-status="${nextStatus}">확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openAssignmentRequestModal(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId);
  if (!assignment || assignment.assignmentState !== "active" || !studentById(session.studentId) || assignmentStatusForStudent(assignment, session.studentId) !== "missing") return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>과제 제출 확인 요청</h2><p><strong>${escapeHtml(assignment.title)}</strong></p><p class="confirm-message">이 과제를 제출했나요?<br>선생님께 확인 요청을 보냅니다.</p><div class="button-row"><button class="button success" type="button" data-action="confirm-assignment-request" data-id="${assignment.id}">확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function requestAssignmentReview(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId);
  if (!assignment || assignment.assignmentState !== "active" || !studentById(session.studentId) || assignmentStatusForStudent(assignment, session.studentId) !== "missing") return;
  if (changeAssignmentStudentStatus(assignment, session.studentId, "review")) { saveData(); render(); toast("선생님께 제출 확인을 요청했습니다."); }
}

function openAssignmentConfirm(message, action, assignmentId, attributes = "") {
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>확인해 주세요</h2><p class="confirm-message">${message}</p><div class="button-row"><button class="button danger" type="button" data-action="${action}" data-id="${assignmentId}" ${attributes}>확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openCompleteAssignmentModal(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId && item.assignmentState === "active"); if (!assignment) return;
  const counts = assignmentStatusCounts(assignment); const submitted = counts.submitted; const review = counts.review; const missing = counts.missing;
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
  saveFirebaseAssignment(assignment);
}

function reopenAssignment(assignmentId) {
  const assignment = data.assignments.find((item) => item.id === assignmentId);
  if (!assignment || assignment.assignmentState !== "completed") return;
  assignment.assignmentState = "active"; assignment.completed = false; assignment.completedAt = null;
  saveData(); render(); toast("과제를 다시 진행 중으로 열었습니다.");
  saveFirebaseAssignment(assignment);
}

function applyBulkAssignmentStatus(assignmentId, status, scope) {
  if (firebaseAssignmentStudentStatesConnecting) { toast("과제 상태를 클라우드에 연결 중입니다. 잠시 후 다시 시도해 주세요."); return; }
  const assignment = data.assignments.find((item) => item.id === assignmentId); if (!assignment || !ASSIGNMENT_STATUSES.includes(status)) return;
  const activeStudentIds = new Set(activeStudents().map((student) => student.id));
  const targetIds = scope === "selected" ? [...selectedStudentsForAssignment(assignmentId)] : [...activeStudentIds];
  const targets = [...new Set(targetIds)].filter((studentId) => activeStudentIds.has(studentId));
  const plans = targets.map((studentId) => prepareAssignmentStudentStatusChange(assignment, studentId, status));
  const invalidPlan = plans.find((plan) => !plan.ok); if (invalidPlan) { showAssignmentStatusPreparationError(invalidPlan); return; }
  const changes = plans.filter((plan) => !plan.noOp);
  if (!changes.length) return;
  const recoveries = changes.filter((plan) => plan.expectedStatus === "submitted" && plan.nextStatus !== "submitted" && plan.balanceDelta < 0);
  if (recoveries.length && !confirm(`${recoveries.length}명의 제출 완료를 취소하면 지급된 과제 포인트도 함께 회수됩니다.\n계속하시겠습니까?`)) return;
  if (!applyStudentPointChanges(changes.map((plan) => plan.change))) return;
  if (scope === "selected") selectedStudentsForAssignment(assignmentId).clear();
  saveData(); render(); toast(`${changes.length}명의 상태를 ${ASSIGNMENT_STATUS_LABELS[status]}로 변경했습니다.`);
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
  if (roleCloudConnectionLocked() || roleConfigurationCloudLocked()) return;
  const template = data.roleTemplates.find((item) => item.id === templateId); if (!template) return;
  if (todayRoleApplications().some((item) => item.status === "waiting")) return toast("오늘 수행 대기 중인 신청을 먼저 완료하거나 취소해 주세요.");
  const previousSettings = roleSettingsSnapshot();
  preserveCurrentRoleApplicationSnapshots();
  data.currentRoles = template.roles.map((role) => ({ ...role, id: crypto.randomUUID() }));
  persistRoleSettings(previousSettings, `‘${template.name}’을 오늘의 역할로 불러왔습니다.`);
}

app.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]"); if (!target) return; const action = target.dataset.action;
  if (action === "clear-time-input") { const input = document.getElementById(target.dataset.target); if (input?.type === "time") { input.value = ""; target.classList.add("is-clear"); target.setAttribute("aria-pressed", "true"); } return; }
  const roleChangeActions = new Set(["apply-role", "confirm-student-cancel", "complete-role", "undo-complete", "cancel-role", "add-role", "edit-role", "toggle-role", "move-role", "delete-role", "load-template", "rename-template", "duplicate-template", "delete-template"]);
  const groupChangeActions = new Set(["open-group-settings", "move-selected-group-students", "change-selected-group-score", "change-group-score", "new-class-mission", "edit-class-mission", "ask-delete-class-mission", "confirm-delete-class-mission", "confirm-class-mission", "ask-reset-group-scores", "confirm-reset-group-scores", "confirm-delete-class-student"]);
  const observationChangeActions = new Set(["new-observation", "edit-observation", "add-observation-quick", "save-observation-quick", "delete-observation-quick", "confirm-delete-observation-quick", "ask-delete-observation", "confirm-delete-observation"]);
  const observationSettingsActions = new Set(["add-observation-quick", "save-observation-quick", "delete-observation-quick", "confirm-delete-observation-quick"]);
  if (firebaseObservationsConnecting && observationChangeActions.has(action)) return observationCloudConnectionLocked();
  if (firebaseObservationMutating && ["new-observation", "edit-observation", "ask-delete-observation", "confirm-delete-observation"].includes(action)) return observationCloudMutationLocked();
  if (firebaseObservationSettingsSaving && observationSettingsActions.has(action)) return observationSettingsCloudLocked();
  if (firebaseRolesConnecting && roleChangeActions.has(action)) return roleCloudConnectionLocked();
  if (firebaseRoleConfigurationSaving && roleChangeActions.has(action)) return roleConfigurationCloudLocked();
  if (firebaseGroupsConnecting && groupChangeActions.has(action)) return groupCloudConnectionLocked();
  if (firebaseClassMissionSaving && ["new-class-mission", "edit-class-mission", "ask-delete-class-mission", "confirm-delete-class-mission", "confirm-class-mission"].includes(action)) return classMissionSavingLocked();
  if (firebaseGroupAssignmentsSaving && action === "move-selected-group-students") return groupAssignmentSavingLocked();
  if (action === "show-students") return renderWelcome(true);
  if (action === "enter-student") { studentAssignmentFilter = "todo"; showAllStudentCompletedAssignments = false; showAllStudentPoints = false; session = { mode: "student", studentId: target.dataset.id, view: "home" }; return render(); }
  if (action === "enter-teacher") { const actualUser = window.ourClassFirebase?.getCurrentUser?.(); firebaseTeacherSession = Boolean(firebaseTeacherUser?.uid && actualUser?.uid === firebaseTeacherUser.uid); session = { mode: "teacher", studentId: null, view: "dashboard" }; return render(); }
  if (action === "firebase-teacher-login") { enterFirebaseTeacher(); return; }
  if (action === "go-home") { firebaseTeacherSession = false; session = { mode: "welcome", studentId: null, view: "home" }; return render(); }
  if (action === "firebase-logout") { if (window.ourClassFirebase?.ready) await exitFirebaseTeacher(); return; }
  if (action === "retry-student-home") { loadFirebaseStudentHomeData(); return; }
  if (action === "firebase-student-logout") { if (window.ourClassFirebase?.ready) { await window.ourClassFirebase.signOutStudent(); firebaseStudentAuthUser = null; firebaseVerifiedStudentSession = null; resetFirebaseStudentHomeState(); session = {mode: "welcome", studentId: null, view: "home"}; render(); } return; }
  if (action === "open-cloud-assignment-review") { openCloudAssignmentReviewModal(target.dataset.id); return; }
  if (action === "confirm-cloud-assignment-review") { const id = target.dataset.id; target.closest(".modal")?.remove(); await requestCloudAssignmentReview(id); return; }
  if (action === "apply-cloud-role") { await mutateCloudStudentRole("apply", target.dataset.id); return; }
  if (action === "open-cloud-role-cancel") { openCloudRoleCancelModal(target.dataset.id); return; }
  if (action === "confirm-cloud-role-cancel") { const id = target.dataset.id; target.closest(".modal")?.remove(); await mutateCloudStudentRole("cancel", id); return; }
  if (action === "navigate") { session.view = target.dataset.view; return render(); }
  if (action === "view-student-point-history") { openTeacherPointHistoryModal(target.dataset.id); return; }
  if (action === "new-class-student") return openClassStudentModal();
  if (action === "edit-class-student") return openClassStudentModal(target.dataset.id);
  if (action === "copy-student-access-link") { await copyStudentAccessLink(); return; }
  if (action === "download-student-excel-template") { downloadStudentExcelTemplate(); return; }
  if (action === "upload-student-excel") { if (!studentExcelLibraryReady()) return toast("Excel 기능을 불러오지 못했습니다. 인터넷 연결 후 다시 시도해 주세요."); document.querySelector("#student-excel-upload")?.click(); return; }
  if (action === "confirm-student-excel-import") { await registerPendingStudentExcelRows(); return; }
  if (action === "open-student-account") { if (firebaseStudentAccountCreating || firebaseBulkStudentAccountsCreating) return toast("학생 계정을 만드는 중입니다."); return openStudentAccountModal(target.dataset.id); }
  if (action === "reset-student-password") { if (firebaseStudentPasswordResetting) return toast("학생 비밀번호를 초기화하는 중입니다."); return openStudentPasswordResetModal(target.dataset.id); }
  if (action === "ask-delete-class-student") {
    const student = studentById(target.dataset.id); if (!student || student.active === false) return;
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>학생 비활성화</h2><p><strong>${escapeHtml(student.name)}</strong> 학생을 비활성화할까요?</p><p>과제, 1인1역, 포인트, 카드 등의 기존 기록은 삭제되지 않고 그대로 보존됩니다.</p><p class="muted">비활성 학생 목록에서 나중에 복구할 수 있습니다.</p><div class="button-row"><button class="button danger" data-action="confirm-delete-class-student" data-id="${student.id}">비활성화</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return;
  }
  if (action === "confirm-delete-class-student") {
    const student = studentById(target.dataset.id); if (!student) return; student.active = false; selectedPointStudentIds.delete(student.id); target.closest(".modal")?.remove(); saveData(); render(); toast("학생을 비활성화했습니다."); saveFirebaseStudent(student); return;
  }
  if (action === "restore-class-student") {
    const student = studentById(target.dataset.id); if (!student || student.active !== false) return;
    if (activeStudents().some((item) => item.id !== student.id && studentNumber(item) === studentNumber(student))) return toast("현재 사용 중인 학생 번호와 중복됩니다. 학생 정보를 수정한 뒤 복구해 주세요.");
    if (activeStudents().some((item) => item.id !== student.id && item.loginId?.toLocaleLowerCase("en-US") === student.loginId?.toLocaleLowerCase("en-US"))) return toast("현재 사용 중인 로그인 ID와 중복됩니다. 학생 정보를 수정한 뒤 복구해 주세요.");
    student.active = true; saveData(); render(); toast("기존 기록을 유지한 채 학생을 복구했습니다."); saveFirebaseStudent(student); return;
  }
  if (action === "open-group-settings") return openGroupSettingsModal();
  if (action === "open-group-assignments") return openGroupAssignmentsModal();
  if (action === "open-group-missions") return openGroupMissionsModal();
  if (action === "toggle-group-assignment-student") { const studentId = target.dataset.id; if (!data.students.some((student) => student.id === studentId)) return; if (selectedGroupAssignmentStudentIds.has(studentId)) selectedGroupAssignmentStudentIds.delete(studentId); else selectedGroupAssignmentStudentIds.add(studentId); target.classList.toggle("selected", selectedGroupAssignmentStudentIds.has(studentId)); target.setAttribute("aria-pressed", String(selectedGroupAssignmentStudentIds.has(studentId))); const count = document.querySelector("#group-assignment-selection-count"); if (count) count.textContent = `${selectedGroupAssignmentStudentIds.size}명 선택됨`; document.querySelectorAll('[data-action="move-selected-group-students"], [data-action="clear-group-assignment-selection"]').forEach((button) => { button.disabled = selectedGroupAssignmentStudentIds.size === 0; }); return; }
  if (action === "clear-group-assignment-selection") { selectedGroupAssignmentStudentIds.clear(); document.querySelectorAll('[data-action="toggle-group-assignment-student"]').forEach((button) => { button.classList.remove("selected"); button.setAttribute("aria-pressed", "false"); }); const count = document.querySelector("#group-assignment-selection-count"); if (count) count.textContent = "0명 선택됨"; document.querySelectorAll('[data-action="move-selected-group-students"], [data-action="clear-group-assignment-selection"]').forEach((button) => { button.disabled = true; }); return; }
  if (action === "move-selected-group-students") {
    const groupId = target.dataset.groupId || ""; if (!selectedGroupAssignmentStudentIds.size) return toast("이동할 학생을 먼저 선택해 주세요."); if (groupId && !activeGroups().some((group) => group.id === groupId)) return;
    if (groupAssignmentCloudStateLocked() || groupAssignmentSavingLocked() || groupConfigurationSavingLocked()) return;
    const studentIds = [...selectedGroupAssignmentStudentIds]; const changes = studentIds.map((studentId) => ({ studentId, groupId }));
    if (firebaseGroupsConnected) {
      const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
      firebaseGroupAssignmentsSaving = true;
      try { await window.ourClassFirebase.saveGroupAssignmentsBatch(changes); if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during group assignment save."); }
      catch (error) { console.error("Firestore group assignments batch save failed", error); render(); openGroupAssignmentsModal(false); toast("모둠 배정을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요."); return; }
      finally { firebaseGroupAssignmentsSaving = false; }
    }
    changes.forEach((change) => { if (change.groupId) data.groupAssignments[change.studentId] = change.groupId; else delete data.groupAssignments[change.studentId]; });
    const movedCount = changes.length; selectedGroupAssignmentStudentIds.clear(); saveData(); render(); openGroupAssignmentsModal(false); toast(`${movedCount}명의 학생을 ${groupId ? groupById(groupId).name : "미배정"}으로 이동했습니다.`); return;
  }
  if (action === "select-group") { selectedGroupId = target.dataset.id; return render(); }
  if (action === "change-selected-group-score") { if (!selectedGroupId) return toast("점수를 변경할 모둠을 선택하세요."); return changeGroupScore(selectedGroupId, Number(target.dataset.amount)); }
  if (action === "change-group-score") return changeGroupScore(target.dataset.id, Number(target.dataset.amount));
  if (action === "toggle-group-transactions") { showAllGroupTransactions = !showAllGroupTransactions; return render(); }
  if (action === "new-class-mission") return openClassMissionModal();
  if (action === "edit-class-mission") return openClassMissionModal(target.dataset.id);
  if (action === "ask-delete-class-mission") { const mission = data.classMissions.find((item) => item.id === target.dataset.id); if (!mission) return; app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>공동 미션 삭제</h2><p><strong>${mission.target}점 · ${escapeHtml(mission.reward)}</strong></p><p>이 공동 미션을 삭제하시겠습니까?</p><div class="button-row"><button class="button danger" data-action="confirm-delete-class-mission" data-id="${mission.id}">삭제</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return; }
  if (action === "confirm-delete-class-mission") { await removeClassMission(target.dataset.id); return; }
  if (action === "confirm-class-mission") { const mission = data.classMissions.find((item) => item.id === target.dataset.id); if (!mission || classGroupScore() < mission.target) return; const proposedMission = { ...mission, confirmed: true, confirmedAt: new Date().toISOString() }; await persistClassMission(proposedMission, `${mission.target}점 공동 미션 달성을 확정했습니다!`); return; }
  if (action === "ask-reset-group-scores") { app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>모둠 점수 초기화</h2><p>모든 모둠의 현재 점수를 0점으로 초기화합니다.<br>기존 점수 기록은 유지됩니다.<br>계속하시겠습니까?</p><div class="button-row"><button class="button danger" data-action="confirm-reset-group-scores">초기화</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return; }
  if (action === "confirm-reset-group-scores") return resetAllGroupScores();
  if (action === "open-student-detail") { const nextStudentId = target.dataset.id; if (studentDetailId !== nextStudentId) teacherStudentCardData.delete(nextStudentId); studentDetailId = nextStudentId; return render(); }
  if (action === "close-student-detail") { studentDetailId = ""; return render(); }
  if (action === "view-teacher-student-cards") { openTeacherStudentCardsModal(target.dataset.id); return; }
  if (action === "filter-student-detail-assignments") { studentDetailAssignmentFilters[target.dataset.id] = target.dataset.status; return render(); }
  if (action === "reset-student-management-search") { studentManagementSearch = ""; return render(); }
  if (action === "manage-student-observations") { observationFilters.studentId = target.dataset.id; session.view = "observations"; return render(); }
  if (action === "view-student-assignments") { assignmentStudentView = target.dataset.id; session.view = "assignments"; return render(); }
  if (action === "set-student-assignment-filter") { studentAssignmentFilter = target.dataset.filter; showAllStudentCompletedAssignments = false; return render(); }
  if (action === "toggle-all-completed-assignments") { showAllCompletedAssignments = !showAllCompletedAssignments; expandedAssignmentId = ""; return render(); }
  if (action === "toggle-student-completed-assignments") { showAllStudentCompletedAssignments = !showAllStudentCompletedAssignments; return render(); }
  if (action === "toggle-student-point-history") { showAllStudentPoints = !showAllStudentPoints; return render(); }
  if (action === "select-dashboard-date") { dashboardSelectedDate = target.dataset.date; return render(); }
  if (action === "move-dashboard-month") { const [year, month] = dashboardMonth.split("-").map(Number); const moved = new Date(year, month - 1 + (target.dataset.direction === "prev" ? -1 : 1), 1); dashboardMonth = `${moved.getFullYear()}-${String(moved.getMonth() + 1).padStart(2, "0")}`; return render(); }
  if (action === "dashboard-today") { dashboardSelectedDate = todayString(); dashboardMonth = dashboardSelectedDate.slice(0, 7); return render(); }
  if (action === "edit-weekly-timetable") return openWeeklyTimetableModal();
  if (action === "edit-date-timetable") return openDateTimetableModal();
  if (action === "edit-daily-note") return openDailyNoteModal();
  if (action === "reset-date-timetable") { app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>기본 시간표로 되돌리기</h2><p>${selectedDateTitle(dashboardSelectedDate)}의 예외 시간표를 삭제하고 기본 시간표를 사용하시겠습니까?</p><div class="button-row"><button class="button danger" data-action="confirm-reset-date-timetable" data-date="${dashboardSelectedDate}">되돌리기</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return; }
  if (action === "confirm-reset-date-timetable") { delete data.dateTimetableOverrides[target.dataset.date]; saveData(); render(); toast("기본 시간표로 되돌렸습니다."); return; }
  if (action === "set-ranking-period") { rankingPeriod = target.dataset.period === "all" ? "all" : "week"; return render(); }
  if (action === "apply-role") return applyRole(target.dataset.id);
  if (action === "open-student-cancel") return openStudentCancelModal(target.dataset.id);
  if (action === "confirm-student-cancel") return cancelOwnRole(target.dataset.id);
  if (action === "complete-role") return completeRole(target.dataset.id);
  if (action === "undo-complete") return undoCompleteRole(target.dataset.id);
  if (action === "cancel-role") return cancelRoleAsTeacher(target.dataset.id);
  if (action === "draw-option") return drawCard(target.dataset.id);
  if (action === "open-assignment-request") return openAssignmentRequestModal(target.dataset.id);
  if (action === "confirm-assignment-request") return requestAssignmentReview(target.dataset.id);
  if (action === "new-assignment") return openAssignmentModal();
  if (action === "edit-assignment") return openAssignmentModal(target.dataset.id);
  if (action === "duplicate-assignment") return openAssignmentModal(target.dataset.id, true);
  if (action === "toggle-assignment-details") { const opening = expandedAssignmentId !== target.dataset.id; expandedAssignmentId = opening ? target.dataset.id : ""; if (opening) assignmentStudentStatusFilters[target.dataset.id] = "all"; return render(); }
  if (action === "open-assignment-status") { expandedAssignmentId = target.dataset.id; assignmentStudentStatusFilters[target.dataset.id] = target.dataset.status; return render(); }
  if (action === "filter-assignment-students") { expandedAssignmentId = target.dataset.id; assignmentStudentStatusFilters[target.dataset.id] = target.dataset.status; return render(); }
  if (action === "set-assignment-filter") { assignmentFilter = target.dataset.filter; assignmentStudentView = ""; expandedAssignmentId = ""; return render(); }
  if (action === "reset-assignment-filters") { assignmentFilter = "all"; assignmentSubjectFilter = ""; assignmentSearch = ""; assignmentStudentView = ""; expandedAssignmentId = ""; return render(); }
  if (action === "reset-completed-assignment-filters") { completedAssignmentFilters = { search: "", subject: "", from: "", to: "" }; return render(); }
  if (action === "ask-complete-assignment") return openCompleteAssignmentModal(target.dataset.id);
  if (action === "confirm-complete-assignment") return completeAssignment(target.dataset.id);
  if (action === "ask-reopen-assignment") return openReopenAssignmentModal(target.dataset.id);
  if (action === "confirm-reopen-assignment") return reopenAssignment(target.dataset.id);
  if (action === "cycle-assignment-status") {
    const assignment = data.assignments.find((item) => item.id === target.dataset.assignment); if (!assignment) return;
    const studentId = target.dataset.student; const currentStatusIndex = ASSIGNMENT_STATUSES.indexOf(assignmentStatusForStudent(assignment, studentId));
    const nextStatus = ASSIGNMENT_STATUSES[(currentStatusIndex + 1) % ASSIGNMENT_STATUSES.length];
    if (assignmentStatusForStudent(assignment, studentId) === "submitted") return openCancelAssignmentSubmissionModal(assignment.id, studentId, nextStatus);
    if (changeAssignmentStudentStatus(assignment, studentId, nextStatus)) { saveData(); render(); }
    return;
  }
  if (action === "review-assignment") {
    const assignment = data.assignments.find((item) => item.id === target.dataset.assignment); if (!assignment) return;
    const studentId = target.dataset.student; if (assignmentStatusForStudent(assignment, studentId) !== "review") return;
    if (changeAssignmentStudentStatus(assignment, studentId, target.dataset.status)) { saveData(); render(); toast(target.dataset.status === "submitted" ? "제출을 확인하고 과제 포인트를 지급했습니다." : "제출 요청을 반려했습니다."); }
    return;
  }
  if (action === "confirm-cancel-assignment-submission") {
    const assignment = data.assignments.find((item) => item.id === target.dataset.id); const studentId = target.dataset.student; if (!assignment) return;
    if (changeAssignmentStudentStatus(assignment, studentId, target.dataset.status)) { saveData(); render(); toast("제출 완료를 취소하고 지급 포인트를 회수했습니다."); }
    return;
  }
  if (action === "select-assignment-student") {
    const selected = selectedStudentsForAssignment(target.dataset.assignment); const studentId = target.dataset.student;
    target.checked ? selected.add(studentId) : selected.delete(studentId); render(); return;
  }
  if (action === "ask-bulk-assignment") {
    if (target.dataset.scope === "selected") return applyBulkAssignmentStatus(target.dataset.id, target.dataset.status, "selected");
    const label = ASSIGNMENT_STATUS_LABELS[target.dataset.status];
    return openAssignmentConfirm(`모든 학생의 상태를 <strong>${label}</strong>로 변경하시겠습니까?`, "confirm-bulk-assignment", target.dataset.id, `data-status="${target.dataset.status}" data-scope="all"`);
  }
  if (action === "confirm-bulk-assignment") return applyBulkAssignmentStatus(target.dataset.id, target.dataset.status, target.dataset.scope);
  if (action === "ask-delete-assignment") return openAssignmentConfirm("이 과제를 삭제하시겠습니까?<br>학생들의 제출 기록도 함께 삭제됩니다.", "confirm-delete-assignment", target.dataset.id);
  if (action === "confirm-delete-assignment") {
    if (firebaseAssignmentsConnected) { window.ourClassFirebase.markAssignmentDeleted(target.dataset.id).then(() => { data.assignments = data.assignments.filter((assignment) => assignment.id !== target.dataset.id); delete assignmentSelections[target.dataset.id]; saveData(); render(); toast("과제와 제출 기록을 삭제했습니다."); }).catch((error) => { console.error("Firestore assignment soft delete failed", error); target.closest(".modal")?.remove(); toast("클라우드 삭제에 실패해 과제를 삭제하지 않았습니다."); }); return; }
    data.assignments = data.assignments.filter((assignment) => assignment.id !== target.dataset.id); delete assignmentSelections[target.dataset.id];
    saveData(); render(); toast("과제와 제출 기록을 삭제했습니다."); return;
  }
  if (action === "toggle-point-student") {
    target.checked ? selectedPointStudentIds.add(target.dataset.id) : selectedPointStudentIds.delete(target.dataset.id);
    target.closest(".point-student-card")?.classList.toggle("selected", target.checked);
    const count = document.querySelector("#point-selected-count"); if (count) count.textContent = selectedPointStudentIds.size; return;
  }
  if (action === "select-all-point-students") { activeStudents().forEach((student) => selectedPointStudentIds.add(student.id)); render(); return; }
  if (action === "clear-point-students") { selectedPointStudentIds.clear(); render(); return; }
  if (action === "quick-teacher-points") return applyTeacherPointChange(Number(target.dataset.amount));
  if (action === "new-card") return openCardModal("", target.dataset.setId);
  if (action === "edit-card") return openCardModal(target.dataset.id);
  if (action === "edit-draw-option") return openDrawOptionModal(target.dataset.id);
  if (action === "open-collection-card") return openCollectionCardModal(target.dataset.cardId, target.dataset.rarity);
  if (action === "flip-collection-card") { const modal = target.closest(".collection-card-modal"); const stage = modal?.querySelector(".collection-detail-stage"); if (!stage) return; stage.classList.toggle("show-back"); const button = modal.querySelector('.collection-modal-controls > [data-action="flip-collection-card"]'); if (button) button.textContent = stage.classList.contains("show-back") ? "앞면 보기" : "뒤집기"; return; }
  if (action === "select-collection-ability") { target.closest(".modal")?.remove(); return openCollectionCardModal(target.dataset.cardId, target.dataset.rarity, target.dataset.abilityId, true); }
  if (action === "ask-upgrade-card") return openCardUpgradeModal(target.dataset.cardId, target.dataset.rarity);
  if (action === "equip-representative-card") {
    const student = currentStudent(); const card = data.cards.find((item) => item.id === target.dataset.cardId); const rarity = target.dataset.rarity; const abilityId = target.dataset.abilityId;
    const ability = cardAbilityById(abilityId); if (!student || !card || !CARD_RARITIES.includes(rarity) || !ability?.active || ability.deleted || Number(abilityInventory(student, card.id, rarity)[abilityId]) < 1) { toast("보유한 카드만 대표 카드로 장착할 수 있습니다."); return; }
    student.representativeCard = { cardId: card.id, rarity, abilityId }; saveData(); render(); toast(`${card.name} ${rarity} · ${cardAbilityById(abilityId).name} 카드를 대표 카드로 장착했습니다.`); return;
  }
  if (action === "confirm-card-upgrade") {
    const student = currentStudent(); const card = data.cards.find((item) => item.id === target.dataset.cardId); const rarity = target.dataset.rarity; const step = upgradeStepFrom(rarity); const required = upgradeRequired(rarity); if (!student || !card || !step || !Number.isInteger(required)) return;
    const inventory = abilityInventory(student, card.id, rarity); const materials = Object.fromEntries(cardAbilities().map((ability) => [ability.id, Number(target.closest(".modal")?.querySelector(`[name="material-${ability.id}"]`)?.value) || 0])); const selectedCount = Object.values(materials).reduce((sum, count) => sum + count, 0);
    if (selectedCount !== required || cardAbilities().some((ability) => !Number.isInteger(materials[ability.id]) || materials[ability.id] < 0 || materials[ability.id] > (Number(inventory[ability.id]) || 0))) { toast(`업그레이드 재료를 정확히 ${required}장 선택해 주세요.`); return; }
    const equippedMaterial = student.representativeCard?.cardId === card.id && student.representativeCard?.rarity === rarity && materials[student.representativeCard?.abilityId] > 0;
    if (equippedMaterial && !confirm("현재 대표 카드로 사용 중인 카드입니다.\n업그레이드 재료로 사용하시겠습니까?")) return;
    const newAbilityId = randomAbilityId(); if (!newAbilityId) { toast("사용 가능한 특수능력이 없습니다. 교사 설정을 확인해 주세요."); return; } cardAbilities().forEach((ability) => { inventory[ability.id] -= materials[ability.id]; }); if (!cardInventory(student, card.id)[step.to]) cardInventory(student, card.id)[step.to] = Object.fromEntries(cardAbilities().map((ability) => [ability.id, 0])); cardInventory(student, card.id)[step.to][newAbilityId] = (cardInventory(student, card.id)[step.to][newAbilityId] || 0) + 1;
    if (student.representativeCard?.cardId === card.id && student.representativeCard?.rarity === rarity && Number(inventory[student.representativeCard.abilityId]) < 1) student.representativeCard = null;
    student.cardUpgradeHistory.push({ id: crypto.randomUUID(), studentId: student.id, cardId: card.id, cardName: card.name, fromRarity: rarity, toRarity: step.to, usedCount: required, materials, resultAbilityId: newAbilityId, resultAbilityName: cardAbilityById(newAbilityId).name, createdAt: new Date().toISOString() });
    student.cardAcquisitionHistory.push({ id: crypto.randomUUID(), cardId: card.id, rarity: step.to, abilityId: newAbilityId, source: "카드 업그레이드", createdAt: new Date().toISOString() });
    saveData(); render(); toast(`${card.name} ${step.to} · ${cardAbilityById(newAbilityId).name} 카드를 획득했습니다.`); return;
  }
  if (action === "new-card-set") return openCardSetModal();
  if (action === "edit-card-set") return openCardSetModal(target.dataset.id);
  if (action === "select-card-set") { teacherCardSetId = target.dataset.id; render(); return; }
  if (action === "toggle-card-set-selection") {
    const cardSet = cardSetById(target.dataset.id); if (!cardSet?.active || cardSet.deleted) return;
    if (target.checked) data.activeCardSetIds.push(cardSet.id);
    else if (data.activeCardSetIds.length === 1 && data.activeCardSetIds.includes(cardSet.id)) { render(); toast("카드 뽑기에 사용할 카드셋이 없습니다."); return; }
    else data.activeCardSetIds = data.activeCardSetIds.filter((id) => id !== cardSet.id);
    normalizeActiveCardSets(); saveData(); render(); return;
  }
  if (action === "toggle-card-set") {
    const cardSet = cardSetById(target.dataset.id); if (!cardSet || cardSet.deleted) return;
    if (cardSet.active && data.activeCardSetIds.includes(cardSet.id) && data.activeCardSetIds.length === 1) { toast("카드 뽑기에 사용할 카드셋이 없습니다."); return; }
    cardSet.active = !cardSet.active; if (!cardSet.active) data.activeCardSetIds = data.activeCardSetIds.filter((id) => id !== cardSet.id); normalizeActiveCardSets(); saveData(); render(); toast(cardSet.active ? "카드셋을 다시 사용합니다." : "카드셋을 사용 중지했습니다."); return;
  }
  if (action === "duplicate-card-set") {
    const sourceSet = cardSetById(target.dataset.id); if (!sourceSet || sourceSet.deleted) return;
    const newSetId = crypto.randomUUID(); const copiedCards = sortedCards(false, sourceSet.id).map((card, index) => ({ ...structuredClone(card), id: crypto.randomUUID(), cardSetId: newSetId, order: index, active: true, deleted: false }));
    data.cardSets.push({ id: newSetId, name: `${sourceSet.name} 복사본`, description: sourceSet.description, createdAt: new Date().toISOString(), active: true, deleted: false });
    data.cards.push(...copiedCards); teacherCardSetId = newSetId; saveData(); render(); toast("카드셋과 소속 카드를 복제했습니다."); return;
  }
  if (action === "ask-delete-card-set") return openDeleteCardSetModal(target.dataset.id);
  if (action === "confirm-delete-card-set") {
    const cardSet = cardSetById(target.dataset.id); if (!cardSet) return;
    if (data.activeCardSetIds.includes(cardSet.id) && data.activeCardSetIds.length === 1) { target.closest(".modal")?.remove(); toast("카드 뽑기에 사용할 카드셋이 없습니다."); return; }
    cardSet.active = false; cardSet.deleted = true; data.cards.filter((card) => card.cardSetId === cardSet.id).forEach((card) => { card.active = false; });
    data.activeCardSetIds = data.activeCardSetIds.filter((id) => id !== cardSet.id); normalizeActiveCardSets(); teacherCardSetId = data.activeCardSetIds[0] || data.cardSets.find((item) => !item.deleted)?.id || ""; saveData(); render(); toast("카드셋을 안전하게 삭제 처리했습니다."); return;
  }
  if (action === "toggle-card-active") {
    const card = data.cards.find((item) => item.id === target.dataset.id && !item.deleted); if (!card) return;
    card.active = !card.active; saveData(); render(); toast(card.active ? "카드를 다시 사용합니다." : "카드를 뽑기에서 제외했습니다."); return;
  }
  if (action === "move-card") {
    const movedCard = data.cards.find((card) => card.id === target.dataset.id); if (!movedCard) return; const cards = sortedCards(false, movedCard.cardSetId); const index = cards.findIndex((card) => card.id === target.dataset.id); const nextIndex = index + (target.dataset.direction === "up" ? -1 : 1);
    if (index < 0 || nextIndex < 0 || nextIndex >= cards.length) return;
    [cards[index].order, cards[nextIndex].order] = [cards[nextIndex].order, cards[index].order]; saveData(); render(); return;
  }
  if (action === "ask-delete-card") return openDeleteCardModal(target.dataset.id);
  if (action === "confirm-delete-card") {
    const card = data.cards.find((item) => item.id === target.dataset.id); if (!card) return;
    card.active = false; card.deleted = true; saveData(); render(); toast("카드를 안전하게 삭제 처리했습니다."); return;
  }
  if (action === "filter-card-collection") { collectionCardSetFilter = target.dataset.id; render(); return; }
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
    const proposedQuickItems = structuredClone(data.observationQuickItems); proposedQuickItems[category].push(name);
    if (!await persistObservationQuickItems(proposedQuickItems)) return;
    refreshObservationQuickSection(category, selectedObservationQuickItems()); toast("빠른 선택 항목을 추가했습니다."); return;
  }
  if (action === "save-observation-quick") {
    const category = document.querySelector("#observation-category")?.value; const items = data.observationQuickItems[category] || []; const index = Number(target.dataset.index); const previous = items[index]; if (!previous) return;
    const name = document.querySelector(`[data-quick-edit-index="${index}"]`)?.value.trim().slice(0, 30); if (!name || (name !== previous && items.includes(name))) return;
    const selected = selectedObservationQuickItems().map((item) => item === previous ? name : item);
    const proposedQuickItems = structuredClone(data.observationQuickItems); proposedQuickItems[category][index] = name;
    if (!await persistObservationQuickItems(proposedQuickItems)) return;
    refreshObservationQuickSection(category, selected, true); toast("빠른 선택 항목을 수정했습니다."); return;
  }
  if (action === "delete-observation-quick") {
    const category = document.querySelector("#observation-category")?.value; const items = data.observationQuickItems[category] || []; const index = Number(target.dataset.index); const name = items[index]; if (!name) return;
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>빠른 선택 항목 삭제</h2><p><strong>‘${escapeHtml(name)}’</strong> 항목을 삭제할까요?</p><p class="muted">이미 저장된 관찰 기록의 태그는 유지됩니다.</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-delete-observation-quick" data-category="${escapeHtml(category)}" data-index="${index}">삭제</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`); return;
  }
  if (action === "confirm-delete-observation-quick") {
    const category = target.dataset.category; const items = data.observationQuickItems[category] || []; const index = Number(target.dataset.index); const name = items[index]; if (!name) return;
    const proposedQuickItems = structuredClone(data.observationQuickItems); proposedQuickItems[category].splice(index, 1);
    if (!await persistObservationQuickItems(proposedQuickItems)) return;
    target.closest(".modal")?.remove(); refreshObservationQuickSection(category, selectedObservationQuickItems().filter((item) => item !== name), true); toast("빠른 선택 항목을 삭제했습니다."); return;
  }
  if (action === "ask-delete-observation") return openDeleteObservationModal(target.dataset.id);
  if (action === "confirm-delete-observation") {
    if (firebaseObservationsConnected) {
      const observationId = target.dataset.id; const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
      firebaseObservationMutating = true;
      try {
        await window.ourClassFirebase.deleteObservation(observationId);
        if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during observation deletion.");
        data.observations = data.observations.filter((observation) => observation.id !== observationId);
        saveData(); render(); toast("관찰 기록을 삭제했습니다.");
      } catch (error) {
        console.error("Firestore observation delete failed", error);
        toast("관찰기록을 클라우드에서 삭제하지 못했습니다. 다시 시도해 주세요.");
      } finally {
        firebaseObservationMutating = false;
      }
      return;
    }
    data.observations = data.observations.filter((observation) => observation.id !== target.dataset.id);
    saveData(); render(); toast("관찰 기록을 삭제했습니다."); return;
  }
  if (action === "reset-observation-search") { observationFilters = { studentId: "", category: "", keyword: "" }; render(); return; }
  if (action === "add-role") return openRoleModal(target.dataset.scope, target.dataset.template || "");
  if (action === "edit-role") return openRoleModal(target.dataset.scope, target.dataset.template || "", target.dataset.id);
  if (action === "toggle-role") {
    const roles = rolesForScope(target.dataset.scope, target.dataset.template); const role = roles?.find((item) => item.id === target.dataset.id); if (!role) return;
    const previous = target.dataset.scope === "today" ? roleSettingsSnapshot() : structuredClone(data.roleTemplates);
    role.active = role.active === false;
    if (target.dataset.scope === "today") persistRoleSettings(previous, `${role.name} 역할을 ${role.active ? "ON" : "OFF"}로 변경했습니다.`);
    else { const template = structuredClone(data.roleTemplates.find((item) => item.id === target.dataset.template)); persistRoleTemplateChange(previous, () => window.ourClassFirebase.saveRoleTemplate(template), "템플릿 역할 상태를 변경했습니다."); }
    return;
  }
  if (action === "move-role") {
    const roles = rolesForScope(target.dataset.scope, target.dataset.template); if (!roles) return;
    const index = roles.findIndex((role) => role.id === target.dataset.id); const nextIndex = index + (target.dataset.direction === "up" ? -1 : 1);
    if (index < 0 || nextIndex < 0 || nextIndex >= roles.length) return;
    const previous = target.dataset.scope === "today" ? roleSettingsSnapshot() : structuredClone(data.roleTemplates);
    [roles[index], roles[nextIndex]] = [roles[nextIndex], roles[index]];
    if (target.dataset.scope === "today") persistRoleSettings(previous, "역할 순서를 변경했습니다.");
    else { const template = structuredClone(data.roleTemplates.find((item) => item.id === target.dataset.template)); persistRoleTemplateChange(previous, () => window.ourClassFirebase.saveRoleTemplate(template), "템플릿 역할 순서를 변경했습니다."); }
    return;
  }
  if (action === "delete-role") {
    const roles = rolesForScope(target.dataset.scope, target.dataset.template); if (!roles) return;
    const role = roles.find((item) => item.id === target.dataset.id); if (!role) return;
    if (target.dataset.scope === "today" && todayRoleApplications().some((item) => item.roleId === role.id && item.status === "waiting")) return toast("이 역할의 오늘 수행 대기 신청을 먼저 완료하거나 취소해 주세요.");
    if (!confirm(`‘${role.name}’ 역할을 삭제할까요?\n기존 신청과 완료 기록은 유지됩니다.`)) return;
    const previous = target.dataset.scope === "today" ? roleSettingsSnapshot() : structuredClone(data.roleTemplates);
    if (target.dataset.scope === "today") preserveCurrentRoleApplicationSnapshots();
    roles.splice(roles.indexOf(role), 1);
    if (target.dataset.scope === "today") persistRoleSettings(previous, "역할을 삭제했습니다.");
    else { const template = structuredClone(data.roleTemplates.find((item) => item.id === target.dataset.template)); persistRoleTemplateChange(previous, () => window.ourClassFirebase.saveRoleTemplate(template), "역할을 삭제했습니다."); }
    return;
  }
  if (action === "load-template") return loadTemplateForToday(target.dataset.id);
  if (action === "edit-template") { editingTemplateId = target.dataset.id; render(); document.querySelector(".template-editor")?.scrollIntoView({ behavior: "smooth" }); return; }
  if (action === "close-template-editor") { editingTemplateId = null; render(); return; }
  if (action === "delete-card-image") { pendingCardImageData = ""; pendingCardImageDeleted = true; const preview = target.closest(".card-image-field")?.querySelector("#card-image-preview"); if (preview) preview.innerHTML = "<span>이미지 없음</span>"; const label = target.closest(".card-image-field")?.querySelector(".card-image-file-button span"); if (label) label.textContent = "파일 선택"; target.disabled = true; return; }
  if (action === "rename-template") {
    const template = data.roleTemplates.find((item) => item.id === target.dataset.id); if (!template) return;
    const name = prompt("새 템플릿 이름을 입력해 주세요.", template.name)?.trim(); if (!name) return;
    const previousTemplates = structuredClone(data.roleTemplates);
    template.name = name.slice(0, 40); const savedTemplate = structuredClone(template);
    persistRoleTemplateChange(previousTemplates, () => window.ourClassFirebase.saveRoleTemplate(savedTemplate), "템플릿 이름을 변경했습니다."); return;
  }
  if (action === "duplicate-template") {
    const template = data.roleTemplates.find((item) => item.id === target.dataset.id); if (!template) return;
    const previousTemplates = structuredClone(data.roleTemplates); const copiedTemplate = { id: crypto.randomUUID(), name: `${template.name} 복사본`, roles: structuredClone(template.roles) };
    data.roleTemplates.push(copiedTemplate); persistRoleTemplateChange(previousTemplates, () => window.ourClassFirebase.saveRoleTemplate(copiedTemplate), "템플릿을 복제했습니다."); return;
  }
  if (action === "delete-template") {
    const template = data.roleTemplates.find((item) => item.id === target.dataset.id); if (!template || !confirm(`‘${template.name}’ 템플릿을 삭제할까요?`)) return;
    const previousTemplates = structuredClone(data.roleTemplates);
    data.roleTemplates = data.roleTemplates.filter((item) => item.id !== template.id);
    persistRoleTemplateChange(previousTemplates, () => window.ourClassFirebase.deleteRoleTemplate(template.id), "템플릿을 삭제했습니다.").then((saved) => { if (saved && editingTemplateId === template.id) editingTemplateId = null; }); return;
  }
  if (action === "download-backup") { downloadBackup(); return; }
  if (action === "connect-cloud-class") { connectCurrentClassToFirebase(); return; }
  if (action === "connect-cloud-students") { connectStudentsToFirebase(); return; }
  if (action === "connect-cloud-assignments") { connectAssignmentsToFirebase(); return; }
  if (action === "connect-cloud-points") { connectPointsToFirebase(); return; }
  if (action === "connect-cloud-assignment-states") { connectAssignmentStudentStatesToFirebase(); return; }
  if (action === "connect-cloud-roles") { connectRolesToFirebase(); return; }
  if (action === "connect-cloud-observations") { connectObservationsToFirebase(); return; }
  if (action === "connect-cloud-groups") { connectGroupsToFirebase(); return; }
  if (action === "choose-backup-file") { document.querySelector("#backup-file-input")?.click(); return; }
  if (action === "confirm-restore-backup") { if (!pendingBackupPayload) return; target.closest(".modal")?.remove(); restoreBackup(pendingBackupPayload); return; }
  if (action === "open-reset-data") { openResetDataModal(); return; }
  if (action === "open-student-activity-reset") { openStudentActivityResetModal(); return; }
  if (action === "confirm-student-activity-reset") {
    const modal = target.closest(".student-activity-reset-modal"); if (!modal || modal.querySelector("#student-activity-reset-confirmation")?.value !== "초기화" || firebaseStudentActivityResetting) return;
    const includeObservations = modal.querySelector("#student-activity-reset-observations")?.checked === true;
    firebaseStudentActivityResetting = true; modal.querySelectorAll("button, input").forEach((element) => { element.disabled = true; }); const progress = modal.querySelector(".student-activity-reset-progress"); if (progress) progress.hidden = false;
    try { await resetStudentActivityData(includeObservations); modal.closest(".modal")?.remove(); toast("학생 활동 데이터를 초기화했습니다."); }
    catch (error) { console.error("Student activity data reset failed", error); toast("학생 활동 데이터를 초기화하지 못했습니다. 데이터 상태를 다시 확인해 주세요."); }
    finally { firebaseStudentActivityResetting = false; if (modal.isConnected) { modal.querySelectorAll("input").forEach((element) => { element.disabled = false; }); const closeButton = modal.querySelector('[data-action="close-modal"]'); if (closeButton) closeButton.disabled = false; const confirmButton = modal.querySelector("#confirm-student-activity-reset"); if (confirmButton) confirmButton.disabled = modal.querySelector("#student-activity-reset-confirmation")?.value !== "초기화"; if (progress) progress.hidden = true; } render(); }
    return;
  }
  if (action === "confirm-reset-data") {
    const modal = target.closest(".reset-data-modal"); if (modal?.querySelector("#reset-data-confirmation")?.value !== "초기화") return;
    if (!confirm("현재 학급의 모든 데이터를 정말 초기화하시겠습니까?")) return;
    data = createDemoData(); teacherCardSetId = data.activeCardSetIds[0]; collectionCardSetFilter = "all"; selectedPointStudentIds.clear(); session = { mode: "teacher", studentId: null, view: "class-settings" }; saveData(); render(); toast("모든 데이터를 초기 상태로 되돌렸습니다."); return;
  }
  if (action === "close-modal") { if (firebaseStudentActivityResetting && target.closest(".student-activity-reset-modal")) return; if (target.closest("[data-student-excel-modal]")) clearPendingStudentExcelRows(); target.closest(".modal")?.remove(); return; }
});

window.addEventListener("our-class-firebase-auth", (event) => {
  firebaseAuthPending = false; clearTimeout(firebaseAuthFallbackTimer);
  firebaseTeacherUser = event.detail || null;
  if (!firebaseTeacherUser) { firebaseClassChecked = false; firebaseActiveClassId = ""; firebaseClassLoadFailed = false; resetFirebaseStudentState(); resetFirebaseAssignmentState(); resetFirebasePointState(); resetFirebaseRoleState(); resetFirebaseObservationState(); resetFirebaseGroupState(); if (firebaseTeacherSession) { firebaseTeacherSession = false; session = { mode: "welcome", studentId: null, view: "home" }; } if (session.mode === "welcome") render(); return; }
  firebaseClassChecked = false; firebaseActiveClassId = ""; firebaseClassLoadFailed = false; resetFirebaseStudentState(); resetFirebaseAssignmentState(); resetFirebasePointState(); resetFirebaseRoleState(); resetFirebaseObservationState(); resetFirebaseGroupState();
  if (session.mode === "welcome") { firebaseTeacherSession = true; session = { mode: "teacher", studentId: null, view: "dashboard" }; render(); }
  loadFirebaseClassSettings(firebaseTeacherUser.uid);
});
window.addEventListener("our-class-firebase-student-auth", async (event) => {
  firebaseStudentAuthReady = event.detail?.ready === true;
  firebaseStudentAuthUser = event.detail?.user || null;
  firebaseVerifiedStudentSession = event.detail?.session || null;
  if (firebaseStudentAuthUser && firebaseVerifiedStudentSession?.ok) { await loadFirebaseStudentHomeData(); return; }
  resetFirebaseStudentHomeState(); if (session.mode === "firebase-student") session = {mode: "welcome", studentId: null, view: "home"}; render();
});
window.addEventListener("our-class-firebase-error", () => { firebaseAuthPending = false; firebaseStudentAuthReady = true; clearTimeout(firebaseAuthFallbackTimer); if (session.mode === "welcome") { render(); toast("Firebase 초기화에 실패했습니다. 기존 체험 기능은 계속 사용할 수 있습니다."); } });

app.addEventListener("change", async (event) => {
  if (firebaseGroupsConnecting && event.target.dataset.action === "assign-student-group") return groupCloudConnectionLocked();
  if (event.target.id === "student-excel-upload") {
    const input = event.target; const file = input.files?.[0]; input.value = ""; if (!file) return;
    try { const rows = await parseStudentExcelFile(file); openStudentExcelPreview(rows, file.name); }
    catch (error) { clearPendingStudentExcelRows(); toast(error.message || "Excel 파일을 읽을 수 없습니다."); }
    return;
  }
  if (event.target.id === "backup-file-input") {
    const input = event.target; const file = input.files?.[0]; input.value = ""; if (!file) return;
    file.text().then((text) => { const payload = validateBackup(JSON.parse(text)); pendingBackupPayload = payload; openRestoreBackupModal(payload); }).catch((error) => { pendingBackupPayload = null; toast(error instanceof SyntaxError ? "JSON 파일을 읽을 수 없습니다." : error.message || "백업 파일을 확인할 수 없습니다."); }); return;
  }
  if (event.target.id === "card-image-input") {
    const input = event.target; const field = input.closest(".card-image-field"); const message = field?.querySelector("#card-image-message"); const file = input.files?.[0]; if (!file) return;
    input.disabled = true; if (message) message.textContent = "자르기 화면을 준비하는 중입니다…";
    openCardImageCrop(file).then((result) => { if (!result) return; pendingCardImageData = result; pendingCardImageDeleted = false; const preview = field?.querySelector("#card-image-preview"); if (preview) preview.innerHTML = `<img src="${result}" alt="선택한 카드 이미지 미리보기">`; const label = field?.querySelector(".card-image-file-button span"); if (label) label.textContent = "이미지 변경"; const remove = field?.querySelector('[data-action="delete-card-image"]'); if (remove) remove.disabled = false; if (message) message.textContent = "800×1000 WebP 이미지가 저장 준비되었습니다."; }).catch((error) => { if (message) message.textContent = error.message; toast(error.message); }).finally(() => { input.value = ""; input.disabled = false; }); return;
  }
  if (event.target.dataset.action === "select-daily-note-date") { const date = event.target.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return; dashboardSelectedDate = date; dashboardMonth = date.slice(0, 7); render(); return; }
  if (event.target.closest("#class-feature-form") && event.target.type === "checkbox") { const label = event.target.closest(".feature-toggle")?.querySelector("b"); if (label) label.textContent = event.target.checked ? "사용" : "사용 안 함"; return; }
  if (event.target.dataset.action === "assign-student-group") {
    const studentId = event.target.dataset.student; const groupId = event.target.value; const previousGroupId = data.groupAssignments[studentId] || "";
    if (!data.students.some((student) => student.id === studentId) || (groupId && !activeGroups().some((group) => group.id === groupId))) { event.target.value = previousGroupId; return; }
    if (groupAssignmentCloudStateLocked() || groupAssignmentSavingLocked() || groupConfigurationSavingLocked()) { event.target.value = previousGroupId; return; }
    if (firebaseGroupsConnected) {
      const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
      firebaseGroupAssignmentsSaving = true;
      try {
        if (groupId) await window.ourClassFirebase.saveGroupAssignment({ studentId, groupId });
        else await window.ourClassFirebase.deleteGroupAssignment(studentId);
        if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during group assignment save.");
      } catch (error) {
        console.error("Firestore group assignment save failed", error); event.target.value = previousGroupId; render(); openGroupAssignmentsModal(); toast("모둠 배정을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요."); return;
      } finally { firebaseGroupAssignmentsSaving = false; }
    }
    if (groupId) data.groupAssignments[studentId] = groupId; else delete data.groupAssignments[studentId];
    saveData(); render(); openGroupAssignmentsModal(); toast(groupId ? "학생을 모둠으로 이동했습니다." : "학생을 미배정으로 이동했습니다."); return;
  }
  if (event.target.dataset.action === "toggle-ranking-visibility") { data.rankingVisibility[event.target.dataset.ranking] = event.target.checked; saveData(); render(); return; }
  if (event.target.id === "assignment-subject-filter") { assignmentSubjectFilter = event.target.value; render(); }
  if (event.target.id === "assignment-search") { assignmentSearch = event.target.value; render(); }
  if (event.target.id === "assignment-student-view") { assignmentStudentView = event.target.value; render(); }
  if (event.target.id === "completed-assignment-subject") { completedAssignmentFilters.subject = event.target.value; render(); }
  if (event.target.id === "completed-assignment-search") { completedAssignmentFilters.search = event.target.value; render(); }
  if (event.target.id === "completed-assignment-from") { completedAssignmentFilters.from = event.target.value; render(); }
  if (event.target.id === "completed-assignment-to") { completedAssignmentFilters.to = event.target.value; render(); }
  if (event.target.id === "observation-category") refreshObservationQuickSection(event.target.value, []);
});

app.addEventListener("input", (event) => {
  if (event.target.matches('.time-setting-form input[type="time"]')) { const button = event.target.closest(".time-setting-form")?.querySelector(".time-limit-clear"); if (button) { const empty = !event.target.value; button.classList.toggle("is-clear", empty); button.setAttribute("aria-pressed", String(empty)); } return; }
  if (event.target.id === "reset-data-confirmation") { const button = event.target.closest(".reset-data-modal")?.querySelector("#confirm-reset-data"); if (button) button.disabled = event.target.value !== "초기화"; return; }
  if (event.target.id === "student-activity-reset-confirmation") { const button = event.target.closest(".student-activity-reset-modal")?.querySelector("#confirm-student-activity-reset"); if (button) button.disabled = event.target.value !== "초기화"; return; }
  if (event.target.id === "class-student-search") { classStudentSearch = event.target.value; const keyword = classStudentSearch.trim().toLocaleLowerCase("ko-KR"); let shown = 0; document.querySelectorAll("[data-class-student-id]").forEach((row) => { const student = studentById(row.dataset.classStudentId); row.hidden = !student || Boolean(keyword && !String(studentNumber(student)).includes(keyword) && !student.name.toLocaleLowerCase("ko-KR").includes(keyword) && !student.loginId.toLocaleLowerCase("en-US").includes(keyword)); if (!row.hidden) shown += 1; }); const count = document.querySelector(".class-student-search span"); if (count) count.textContent = `${shown}명 표시`; return; }
  if (event.target.id === "group-settings-count") { document.querySelectorAll("[data-group-name-index]").forEach((input) => { pendingGroupNames[input.dataset.groupNameIndex] = input.value; }); const count = Math.min(8, Math.max(2, Number(event.target.value) || 2)); const container = document.querySelector("#group-name-settings"); if (container) container.innerHTML = groupSettingNameFields(count); return; }
  if (event.target.id === "assignment-search") { assignmentSearch = event.target.value; return; }
  if (event.target.id === "completed-assignment-search") { completedAssignmentFilters.search = event.target.value; return; }
  if (event.target.id === "student-management-search") { studentManagementSearch = event.target.value; const keyword = studentManagementSearch.trim().toLocaleLowerCase("ko-KR"); let shown = 0; document.querySelectorAll(".student-overview-card").forEach((card) => { const student = studentById(card.dataset.id); card.hidden = !student || Boolean(keyword && !student.name.toLocaleLowerCase("ko-KR").includes(keyword) && !String(studentNumber(student)).includes(keyword)); if (!card.hidden) shown += 1; }); const count = document.querySelector("#student-management-count"); if (count) count.textContent = `${shown}명`; return; }
  if (event.target.closest("#draw-option-form") && event.target.name !== "price") {
    const form = event.target.closest("#draw-option-form"); const values = Object.keys(DEFAULT_DRAW_RATES).map((key) => Number(form.elements[key].value) || 0); const total = values.reduce((sum, value) => sum + value, 0); const valid = values.every((value) => value >= 0 && value <= 100) && Math.abs(total - 100) < 0.001;
    document.querySelector("#draw-rate-total").textContent = total; document.querySelector("#draw-rate-error").hidden = valid; document.querySelector("#draw-rate-save").disabled = !valid; return;
  }
  if (event.target.id !== "observation-student-search") return;
  const keyword = event.target.value.trim().toLocaleLowerCase("ko-KR");
  document.querySelectorAll("[data-student-search]").forEach((item) => { item.hidden = keyword && !item.dataset.studentSearch.includes(keyword); });
});

document.addEventListener("keydown", (event) => {
  if (["Enter", " "].includes(event.key) && event.target.classList?.contains("collection-detail-stage")) { event.preventDefault(); event.target.click(); return; }
  if (event.key === "Enter" && ["assignment-search", "completed-assignment-search"].includes(event.target.id)) { event.preventDefault(); render(); return; }
  const timetableInput = event.target.closest?.("#weekly-timetable-form .weekly-timetable-table input");
  if (event.key === "Enter" && timetableInput) {
    event.preventDefault();
    const separator = timetableInput.name.lastIndexOf("-"); const dayKey = timetableInput.name.slice(0, separator); const periodIndex = Number(timetableInput.name.slice(separator + 1)); const nextIndex = periodIndex + (event.shiftKey ? -1 : 1);
    const nextInput = timetableInput.form?.elements[`${dayKey}-${nextIndex}`]; if (nextInput instanceof HTMLElement) nextInput.focus();
    return;
  }
  if (event.key === "Escape") { const modal = [...document.querySelectorAll(".modal")].at(-1); if (firebaseStudentActivityResetting && modal?.querySelector(".student-activity-reset-modal")) return; if (modal?.matches("[data-student-excel-modal]")) clearPendingStudentExcelRows(); modal?.remove(); }
});

app.addEventListener("submit", async (event) => {
  event.preventDefault(); const form = event.target; const formData = new FormData(form);
  if (form.id === "firebase-student-login-form") {
    if (firebaseStudentSigningIn) return;
    const classId = studentClassContext(); const loginId = String(formData.get("loginId") || "").trim(); const passwordInput = form.elements.password; const password = String(formData.get("password") || "");
    if (!classId) return toast("학생 로그인 링크를 확인해 주세요.");
    if (!loginId || !password) return toast("로그인 ID와 비밀번호를 입력해 주세요.");
    firebaseStudentSigningIn = true; const submitButton = form.querySelector('[type="submit"]'); if (submitButton) submitButton.disabled = true;
    try {
      const verified = await window.ourClassFirebase.studentSignIn({classId, loginId, password});
      if (!verified?.ok) throw new Error("Student session could not be verified.");
      firebaseStudentAuthUser = window.ourClassFirebase.getStudentCurrentUser(); firebaseVerifiedStudentSession = verified;
      await loadFirebaseStudentHomeData();
    } catch (error) {
      console.error("Firebase student sign-in failed", {code: error?.code, message: error?.message});
      toast("아이디 또는 비밀번호를 확인해 주세요.");
    } finally {
      if (passwordInput) passwordInput.value = ""; firebaseStudentSigningIn = false; if (submitButton?.isConnected) submitButton.disabled = false;
    }
    return;
  }
  if (firebaseGroupsConnecting && (["group-settings-form", "group-count-form", "selected-group-score-form", "class-mission-form"].includes(form.id) || form.classList.contains("group-name-form") || form.classList.contains("group-direct-score-form"))) return groupCloudConnectionLocked();
  if (firebaseObservationsConnecting && form.id === "observation-form") return observationCloudConnectionLocked();
  if (firebaseObservationMutating && form.id === "observation-form") return observationCloudMutationLocked();
  if (firebaseRolesConnecting && ["role-limit-form", "template-save-form", "role-form"].includes(form.id)) return roleCloudConnectionLocked();
  if (firebaseRoleConfigurationSaving && ["role-limit-form", "template-save-form", "role-form"].includes(form.id)) return roleConfigurationCloudLocked();
  if (form.id === "class-info-form") {
    const appName = String(formData.get("appName") || "").trim(); const className = String(formData.get("className") || "").trim(); const teacherName = String(formData.get("teacherName") || "").trim(); if (!appName || !className || !teacherName) return;
    data.classSettings = { ...data.classSettings, appName: appName.slice(0, 50), className: className.slice(0, 50), teacherName: teacherName.slice(0, 30) }; saveData(); render(); toast("학급 정보를 저장했습니다."); saveFirebaseClassSettings(); return;
  }
  if (form.id === "class-feature-form") {
    data.classSettings.features = Object.fromEntries(Object.keys(DEFAULT_CLASS_FEATURES).map((key) => [key, formData.has(key)]));
    session.view = "class-settings"; saveData(); render(); toast("기능 사용 설정을 저장했습니다."); return;
  }
  if (form.id === "student-account-form") {
    if (firebaseStudentAccountCreating || firebaseBulkStudentAccountsCreating) return toast("학생 계정을 만드는 중입니다.");
    const student = studentById(form.dataset.id); const passwordInput = form.elements.password; const confirmationInput = form.elements.passwordConfirm;
    const password = String(formData.get("password") || ""); const passwordConfirm = String(formData.get("passwordConfirm") || "");
    if (!student || student.active === false) return toast("활성 학생만 계정을 만들 수 있습니다.");
    const actualUser = window.ourClassFirebase?.getCurrentUser?.();
    if (!firebaseTeacherSession || !firebaseTeacherUser?.uid || actualUser?.uid !== firebaseTeacherUser.uid) return toast("학생 계정을 만들려면 교사 Google 로그인이 필요합니다.");
    if (!firebaseActiveClassId || !firebaseStudentsConnected || !window.ourClassFirebase?.createStudentAccount) return toast("클라우드 학급과 학생 명단 연결을 확인해 주세요.");
    if (password.length < 6) return toast("비밀번호는 6자 이상 입력해 주세요.");
    if (password !== passwordConfirm) return toast("비밀번호 확인이 일치하지 않습니다.");
    const userUid = firebaseTeacherUser.uid; const classId = firebaseActiveClassId; const submitButton = form.querySelector('[type="submit"]');
    firebaseStudentAccountCreating = true; if (submitButton) submitButton.disabled = true;
    try {
      const result = await window.ourClassFirebase.createStudentAccount({ classId, studentId: student.id, password });
      if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw { code: "functions/failed-precondition" };
      if (!result.ok || result.studentId !== student.id) throw { code: "functions/failed-precondition" };
      firebaseStudentAccountStatuses[student.id] = { exists: true, active: true, loginId: result.loginId || student.loginId }; firebaseStudentAccountStatusesLoaded = true; firebaseStudentAccountStatusesLoadFailed = false;
      form.closest(".modal")?.remove(); render(); toast(result.created ? "학생 계정을 만들었습니다." : "이미 생성된 학생 계정입니다.");
    } catch (error) {
      toast(studentAccountErrorMessage(error));
    } finally {
      if (passwordInput) passwordInput.value = ""; if (confirmationInput) confirmationInput.value = "";
      firebaseStudentAccountCreating = false; if (submitButton?.isConnected) submitButton.disabled = false;
    }
    return;
  }
  if (form.id === "student-password-reset-form") {
    if (firebaseStudentPasswordResetting) return toast("학생 비밀번호를 초기화하는 중입니다.");
    const student = studentById(form.dataset.id); const passwordInput = form.elements.password; const confirmationInput = form.elements.passwordConfirm;
    const password = String(formData.get("password") || ""); const passwordConfirm = String(formData.get("passwordConfirm") || "");
    if (!student || student.active === false) return toast("활성 학생만 비밀번호를 초기화할 수 있습니다.");
    if (!firebaseStudentAccountStatuses[student.id]?.exists) return toast("생성된 학생 계정을 확인할 수 없습니다.");
    const actualUser = window.ourClassFirebase?.getCurrentUser?.();
    if (!firebaseTeacherSession || !firebaseTeacherUser?.uid || actualUser?.uid !== firebaseTeacherUser.uid) return toast("학생 비밀번호를 초기화하려면 교사 Google 로그인이 필요합니다.");
    if (!firebaseActiveClassId || !firebaseStudentsConnected || !window.ourClassFirebase?.resetStudentPassword) return toast("클라우드 학급과 학생 명단 연결을 확인해 주세요.");
    if (password.length < 6) return toast("비밀번호는 6자 이상 입력해 주세요.");
    if (password !== passwordConfirm) return toast("비밀번호 확인이 일치하지 않습니다.");
    const userUid = firebaseTeacherUser.uid; const classId = firebaseActiveClassId; const submitButton = form.querySelector('[type="submit"]');
    firebaseStudentPasswordResetting = true; if (submitButton) submitButton.disabled = true;
    try {
      const result = await window.ourClassFirebase.resetStudentPassword({ classId, studentId: student.id, password });
      if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw { code: "functions/failed-precondition" };
      if (!result.ok || result.studentId !== student.id) throw { code: "functions/failed-precondition" };
      form.closest(".modal")?.remove(); render(); toast("학생 비밀번호를 초기화했습니다.");
    } catch (error) {
      toast(studentPasswordResetErrorMessage(error));
    } finally {
      if (passwordInput) passwordInput.value = ""; if (confirmationInput) confirmationInput.value = "";
      firebaseStudentPasswordResetting = false; if (submitButton?.isConnected) submitButton.disabled = false;
    }
    return;
  }
  if (form.id === "class-student-form") {
    const number = Number(formData.get("number")); const name = String(formData.get("name") || "").trim(); const loginId = String(formData.get("loginId") || "").trim(); const existing = studentById(form.dataset.id);
    if (!Number.isInteger(number) || number < 1 || number > 99 || !name) return toast("번호와 이름을 확인해 주세요.");
    if (!/^[A-Za-z0-9._-]+$/.test(loginId)) return toast("로그인 ID는 영문, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다.");
    if (existing?.active !== false && data.students.some((student) => student.active !== false && student.id !== existing?.id && studentNumber(student) === number)) return toast(`${number}번은 이미 사용 중입니다.`);
    if (data.students.some((student) => student.id !== existing?.id && (existing?.active !== false || student.active !== false) && student.loginId?.toLocaleLowerCase("en-US") === loginId.toLocaleLowerCase("en-US"))) return toast("이미 사용 중인 로그인 ID입니다.");
    const account = existing ? firebaseStudentAccountStatuses[existing.id] : null;
    const loginIdChangedForAccount = Boolean(existing && account?.exists && account.loginId !== loginId);
    const savedStudent = existing || addStudentRecord(number, name.slice(0, 30), loginId); if (existing) Object.assign(existing, { number, name: name.slice(0, 30), loginId });
    form.closest(".modal")?.remove(); saveData(); render();
    if (loginIdChangedForAccount) {
      try {
        const result = await window.ourClassFirebase.updateStudentLoginId({classId: firebaseActiveClassId, studentId: savedStudent.id, loginId});
        if (!result.ok) throw new Error("Student login ID update response was invalid.");
        firebaseStudentAccountStatuses[savedStudent.id].loginId = result.loginId || loginId;
        await window.ourClassFirebase.saveStudent(savedStudent, data.students.findIndex((item) => item.id === savedStudent.id));
        toast("학생 정보를 수정했습니다.");
      } catch (error) {
        console.error("Firebase student login ID update failed", error);
        await loadFirebaseStudents(firebaseTeacherUser?.uid);
        await loadFirebaseStudentAccountStatuses(firebaseTeacherUser?.uid, firebaseActiveClassId);
        saveData(); render(); toast("로그인 ID를 변경하지 못했습니다.");
      }
      return;
    }
    toast(existing ? "학생 정보를 수정했습니다." : "학생을 추가했습니다."); saveFirebaseStudent(savedStudent, !existing); return;
  }
  if (form.id === "group-settings-form") {
    const count = Number(formData.get("count")); if (!Number.isInteger(count) || count < 2 || count > 8) { toast("모둠 수는 2~8개로 설정해 주세요."); return; }
    const names = Array.from({ length: count }, (_, index) => String(formData.get(`groupName-${index}`) || "")); const proposed = proposedGroupConfiguration(count, names);
    if (proposed.deactivatedGroupIds.size && !confirm(`모둠 수를 ${count}개로 줄이면 ${proposed.deletedAssignmentStudentIds.length}명의 학생이 미배정으로 이동합니다.\n모둠 점수와 이름 데이터는 안전하게 보관됩니다.\n계속하시겠습니까?`)) return;
    await persistGroupConfiguration(proposed, "모둠 설정을 저장했습니다."); return;
  }
  if (form.id === "group-count-form") {
    const count = Number(formData.get("count")); if (!Number.isInteger(count) || count < 2 || count > 8) { toast("모둠 수는 2~8개로 설정해 주세요."); return; }
    const proposed = proposedGroupConfiguration(count);
    if (proposed.deactivatedGroupIds.size) { const score = proposed.groups.filter((group) => proposed.deactivatedGroupIds.has(group.id)).reduce((sum, group) => sum + group.score, 0); if (!confirm(`모둠 수를 ${count}개로 줄이면 ${proposed.deletedAssignmentStudentIds.length}명의 학생이 미배정으로 이동합니다.\n비활성 모둠의 ${score}점과 이름은 안전하게 보관됩니다.\n계속하시겠습니까?`)) return; }
    await persistGroupConfiguration(proposed, `모둠 수를 ${count}개로 적용했습니다.`); return;
  }
  if (form.classList.contains("group-name-form")) { const group = groupById(form.dataset.id); const name = String(formData.get("name") || "").trim().slice(0, 30); if (!group || !name) return; await persistGroupName(group, name); return; }
  if (form.id === "selected-group-score-form") { const amount = Number(formData.get("amount")); if (!selectedGroupId) return toast("점수를 변경할 모둠을 선택하세요."); if (!Number.isInteger(amount) || amount < 1) return; changeGroupScore(selectedGroupId, event.submitter?.dataset.kind === "subtract" ? -amount : amount); return; }
  if (form.classList.contains("group-direct-score-form")) { const amount = Number(formData.get("amount")); if (!Number.isInteger(amount) || amount < 1) return; changeGroupScore(form.dataset.id, event.submitter?.dataset.kind === "subtract" ? -amount : amount); return; }
  if (form.id === "class-mission-form") { const target = Number(formData.get("target")); const reward = String(formData.get("reward") || "").trim(); if (!Number.isInteger(target) || target < 1 || !reward) { toast("목표 점수와 보상 내용을 확인해 주세요."); return; } const duplicate = data.classMissions.some((mission) => mission.target === target && mission.id !== form.dataset.id); if (duplicate) { toast("같은 목표 점수의 공동 미션이 이미 있습니다."); return; } const existing = data.classMissions.find((mission) => mission.id === form.dataset.id); const proposedMission = existing ? { ...existing, target, reward: reward.slice(0, 100) } : { id: crypto.randomUUID(), target, reward: reward.slice(0, 100), confirmed: false, confirmedAt: null }; await persistClassMission(proposedMission, existing ? "공동 미션을 수정했습니다." : "새 공동 미션을 추가했습니다."); return; }
  if (form.id === "weekly-timetable-form") {
    data.weeklyTimetable = Object.fromEntries(TIMETABLE_DAYS.map((day) => { const currentLength = Math.max(6, data.weeklyTimetable[day.key]?.length || 0); return [day.key, Array.from({ length: currentLength }, (_, index) => String(formData.get(`${day.key}-${index}`) || "").trim().slice(0, 40))]; }));
    saveData(); render(); toast("기본 주간 시간표를 저장했습니다."); return;
  }
  if (form.id === "date-timetable-form") {
    const length = Math.max(6, timetableForDate(form.dataset.date).periods.length); data.dateTimetableOverrides[form.dataset.date] = Array.from({ length }, (_, index) => String(formData.get(`period-${index}`) || "").trim().slice(0, 40));
    saveData(); render(); toast("이 날짜의 시간표를 저장했습니다."); return;
  }
  if (form.id === "daily-note-form") {
    if (event.submitter?.dataset.kind === "delete") delete data.dailyClassNotes[form.dataset.date];
    else { const text = String(formData.get("text") || "").trim().slice(0, 2000); if (text) data.dailyClassNotes[form.dataset.date] = { text, updatedAt: new Date().toISOString() }; else delete data.dailyClassNotes[form.dataset.date]; }
    saveData(); render(); toast(event.submitter?.dataset.kind === "delete" ? "주요 사항을 삭제했습니다." : "주요 사항을 저장했습니다."); return;
  }
  if (form.id === "observation-form") {
    const studentId = formData.get("studentId"); const date = formData.get("date"); const category = formData.get("category"); const content = formData.get("content").trim(); const quickItems = selectedObservationQuickItems();
    if (!studentById(studentId) || !date || !OBSERVATION_CATEGORIES.includes(category) || !content) return;
    const now = new Date().toISOString(); const existing = data.observations.find((item) => item.id === form.dataset.id);
    const observation = normalizeObservation(existing ? { ...existing, studentId, date, category, content, quickItems, updatedAt: now } : { id: crypto.randomUUID(), studentId, date, category, content, quickItems, createdAt: now, updatedAt: now });
    if (firebaseObservationsConnected) {
      const userUid = firebaseTeacherUser?.uid; const classId = firebaseActiveClassId;
      firebaseObservationMutating = true;
      try {
        await window.ourClassFirebase.saveObservation(observation);
        if (firebaseTeacherUser?.uid !== userUid || firebaseActiveClassId !== classId) throw new Error("Firebase class changed during observation save.");
      } catch (error) {
        console.error("Firestore observation save failed", error);
        toast("관찰기록을 클라우드에 저장하지 못했습니다. 다시 시도해 주세요.");
        return;
      } finally {
        firebaseObservationMutating = false;
      }
    }
    if (existing) Object.assign(existing, observation);
    else data.observations.push(observation);
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
  if (form.id === "point-bulk-form") {
    const rawAmount = Number(formData.get("amount")); if (!Number.isInteger(rawAmount) || rawAmount < 1) return;
    applyTeacherPointChange(event.submitter?.dataset.kind === "subtract" ? -rawAmount : rawAmount);
  }
  if (form.id === "draw-option-form") {
    const name = formData.get("name").trim(); const price = Number(formData.get("price")); const rates = Object.fromEntries(Object.keys(DEFAULT_DRAW_RATES).map((key) => [key, Number(formData.get(key))])); const values = Object.values(rates); const total = values.reduce((sum, value) => sum + value, 0);
    if (!name || !Number.isInteger(price) || price < 0) return;
    if (!values.every((value) => Number.isFinite(value) && value >= 0 && value <= 100) || Math.abs(total - 100) >= 0.001) { toast("등급별 확률의 합계가 100%가 되어야 합니다."); return; }
    const existing = data.drawOptions.find((option) => option.id === form.dataset.id && FIXED_DRAW_OPTION_NAMES[option.id]);
    if (!existing) return;
    Object.assign(existing, { name: FIXED_DRAW_OPTION_NAMES[existing.id], price, rates, active: true, deleted: false });
    saveData(); render(); toast("뽑기 옵션을 수정했습니다.");
  }
  if (form.id === "upgrade-settings-form") {
    const settings = Object.fromEntries(CARD_UPGRADE_STEPS.map((step) => [step.key, Number(formData.get(step.key))]));
    if (!Object.values(settings).every((value) => Number.isInteger(value) && value >= 2)) { toast("업그레이드 필요 카드 수는 2장 이상이어야 합니다."); return; }
    data.cardUpgradeSettings = settings; saveData(); render(); toast("카드 업그레이드 설정을 저장했습니다.");
  }
  if (form.id === "card-ability-settings-form") {
    const settings = Object.fromEntries(CARD_RARITIES.map((rarity) => { const key = CARD_RATE_KEYS[rarity]; const previous = cardAbilitySetting(rarity); const dailyCap = Number(formData.get(`${key}-dailyCap`)); const abilities = Object.fromEntries(cardAbilities().map((ability) => { const assignmentField = formData.get(`${key}-${ability.id}-assignment`); const roleField = formData.get(`${key}-${ability.id}-role`); return [ability.id, { assignmentPercent: assignmentField === null ? Number(previous.abilities?.[ability.id]?.assignmentPercent) || 0 : Number(assignmentField), rolePercent: roleField === null ? Number(previous.abilities?.[ability.id]?.rolePercent) || 0 : Number(roleField) }]; })); return [rarity, { dailyCap, abilities }]; }));
    const valid = Object.values(settings).every((setting) => Number.isInteger(setting.dailyCap) && setting.dailyCap >= 0 && Object.values(setting.abilities).every((ability) => [ability.assignmentPercent, ability.rolePercent].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)));
    if (!valid) { toast("보너스는 0~100%, 하루 최대 포인트는 0 이상의 정수로 입력해 주세요."); return; }
    data.cardAbilitySettings = settings; saveData(); render(); toast("특수능력 설정을 저장했습니다.");
  }
  if (form.id === "card-form") {
    const cardSetId = formData.get("cardSetId"); const name = formData.get("name").trim(); const era = formData.get("era").trim(); const achievement = formData.get("achievement").trim();
    if (!cardSetById(cardSetId) || !name || !era || !achievement) return;
    const existing = data.cards.find((card) => card.id === form.dataset.id); const cardId = existing?.id || crypto.randomUUID();
    const card = existing || { id: cardId, order: sortedCards(true, cardSetId).reduce((max, item) => Math.max(max, item.order), -1) + 1, active: true, deleted: false, imageData: "", imagePath: "", imageUrl: "", imageUpdatedAt: "" };
    Object.assign(card, {cardSetId, name, era, achievement}); if (!existing) data.cards.push(card);
    teacherCardSetId = cardSetId;
    const submitButton = form.querySelector('button[type="submit"]'); if (submitButton) { submitButton.disabled = true; submitButton.textContent = "저장 중…"; }
    try {
      saveData(); await window.ourClassCardCloud?.saveNow?.();
      if (pendingCardImageData.startsWith("data:image/webp")) {
        const image = await window.ourClassFirebase.saveCardPortrait({cardId, action: "save", imageData: pendingCardImageData});
        Object.assign(card, {imageData: "", imagePath: image.imagePath || "", imageUrl: image.imageUrl || "", imageUpdatedAt: image.imageUpdatedAt || ""}); saveData(); await window.ourClassCardCloud?.saveNow?.();
      } else if (pendingCardImageDeleted && (pendingCardImagePath || card.imageUrl || card.imageData)) {
        await window.ourClassFirebase.saveCardPortrait({cardId, action: "delete"}); Object.assign(card, {imageData: "", imagePath: "", imageUrl: "", imageUpdatedAt: new Date().toISOString()}); saveData(); await window.ourClassCardCloud?.saveNow?.();
      }
    } catch (error) { console.error("Card save failed", {code: error?.code, message: error?.message, details: error?.details, error}); const message = String(error?.message || ""); toast(message.includes("storage-bucket-not-found") ? "Firebase Storage가 아직 활성화되지 않았습니다." : message.includes("storage-upload-failed") ? "카드 이미지를 Storage에 업로드하지 못했습니다." : message.includes("firestore-update-failed") ? "이미지 업로드 후 카드 정보를 저장하지 못했습니다." : "카드 정보를 Firebase에 저장하지 못했습니다."); if (submitButton) { submitButton.disabled = false; submitButton.textContent = "저장"; } return; }
    pendingCardImageData = ""; pendingCardImagePath = ""; pendingCardImageDeleted = false; render(); toast(existing ? "카드를 수정했습니다." : "새 카드를 추가했습니다.");
  }
  if (form.id === "card-set-form") {
    const name = formData.get("name").trim(); const description = formData.get("description").trim(); if (!name) return;
    const existing = cardSetById(form.dataset.id);
    if (existing) Object.assign(existing, { name: name.slice(0, 50), description: description.slice(0, 200) });
    else { const id = crypto.randomUUID(); data.cardSets.push({ id, name: name.slice(0, 50), description: description.slice(0, 200), createdAt: new Date().toISOString(), active: true, deleted: false }); teacherCardSetId = id; }
    saveData(); render(); toast(existing ? "카드셋을 수정했습니다." : "새 카드셋을 만들었습니다.");
  }
  if (form.id === "role-limit-form") {
    const limit = Number(formData.get("limit")); if (!Number.isInteger(limit) || limit < 1 || limit > 5) { toast("하루 최대 신청 개수는 1~5 사이의 정수로 입력해 주세요."); return; }
    const openTime = String(formData.get("openTime") || ""); if (openTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(openTime)) { toast("신청 시작 시간을 확인해 주세요."); return; }
    const previousSettings = roleSettingsSnapshot();
    data.dailyRoleApplicationLimit = limit; data.roleApplicationOpenTime = openTime; persistRoleSettings(previousSettings, "학생 신청 설정을 저장했습니다.");
  }
  if (form.id === "template-save-form") {
    const name = formData.get("name").trim(); if (!name) return;
    const previousTemplates = structuredClone(data.roleTemplates); const template = { id: crypto.randomUUID(), name: name.slice(0, 40), roles: structuredClone(data.currentRoles) };
    data.roleTemplates.push(template); persistRoleTemplateChange(previousTemplates, () => window.ourClassFirebase.saveRoleTemplate(template), "새 템플릿을 저장했습니다.");
  }
  if (form.id === "role-form") {
    const roles = rolesForScope(form.dataset.scope, form.dataset.template); if (!roles) return;
    const name = formData.get("name").trim(); const capacity = Number(formData.get("capacity")); const points = Number(formData.get("points")); const description = formData.get("description").trim();
    if (!name || !Number.isInteger(capacity) || capacity < 1 || !Number.isInteger(points) || points < 0) return;
    const previous = form.dataset.scope === "today" ? roleSettingsSnapshot() : structuredClone(data.roleTemplates);
    const existing = roles.find((role) => role.id === form.dataset.id);
    if (existing) { if (form.dataset.scope === "today") preserveCurrentRoleApplicationSnapshots(); Object.assign(existing, { name, capacity, points, description }); }
    else roles.push({ id: crypto.randomUUID(), name, capacity, points, description, active: true });
    const successMessage = existing ? "역할을 수정했습니다." : "새 역할을 추가했습니다.";
    if (form.dataset.scope === "today") persistRoleSettings(previous, successMessage);
    else { const template = structuredClone(data.roleTemplates.find((item) => item.id === form.dataset.template)); persistRoleTemplateChange(previous, () => window.ourClassFirebase.saveRoleTemplate(template), successMessage); }
  }
  if (form.id === "assignment-form") {
    const title = formData.get("title").trim(); const customSubject = formData.get("subjectCustom").trim();
    const subject = customSubject || formData.get("subjectPreset"); const description = formData.get("description").trim(); const dueDate = formData.get("dueDate");
    const points = Number(formData.get("points"));
    if (!title || !subject || !dueDate || !Number.isInteger(points) || points < 0) return;
    const existing = data.assignments.find((assignment) => assignment.id === form.dataset.id);
    let savedAssignment;
    if (existing) { Object.assign(existing, { title, subject, description, dueDate, important: formData.has("important"), points }); refreshAssignmentCompletion(existing); savedAssignment = existing; }
    else { const newAssignment = { id: crypto.randomUUID(), title, subject, description, createdAt: new Date().toISOString(), dueDate, important: formData.has("important"), points, pointAwards: {}, assignmentState: "active", completed: false, completedAt: null, studentStatuses: Object.fromEntries(data.students.map((student) => [student.id, "missing"])) }; refreshAssignmentCompletion(newAssignment); data.assignments.push(newAssignment); savedAssignment = newAssignment; }
    saveData(); render(); toast(existing ? "과제를 수정했습니다." : "새 과제를 만들었습니다.");
    saveFirebaseAssignment(savedAssignment);
  }
});

render();
firebaseAuthFallbackTimer = setTimeout(() => { if (!firebaseAuthPending) return; firebaseAuthPending = false; if (session.mode === "welcome") { render(); toast("Google 로그인을 불러오지 못했습니다. 기존 체험 기능은 계속 사용할 수 있습니다."); } }, 5000);
