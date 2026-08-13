const CARD_RARITIES = ["일반", "희귀", "영웅", "전설", "고대"];
const CARD_RATE_KEYS = { 일반: "common", 희귀: "rare", 영웅: "epic", 전설: "legendary", 고대: "ancient" };
const DEFAULT_DRAW_RATES = { common: 55, rare: 25, epic: 12, legendary: 6, ancient: 2 };
const DEFAULT_DRAW_OPTIONS = [
  { id: "draw-basic", name: "일반 뽑기", price: 30, rates: { common: 60, rare: 25, epic: 10, legendary: 4, ancient: 1 }, active: true, deleted: false },
  { id: "draw-advanced", name: "고급 뽑기", price: 60, rates: { common: 35, rare: 35, epic: 18, legendary: 9, ancient: 3 }, active: true, deleted: false },
  { id: "draw-premium", name: "프리미엄 뽑기", price: 100, rates: { common: 15, rare: 30, epic: 30, legendary: 18, ancient: 7 }, active: true, deleted: false }
];
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
  { id: "academic", name: "학문의 힘", icon: "📚", description: "과제" , weight: 1 },
  { id: "responsibility", name: "책임의 힘", icon: "🛡", description: "1인1역", weight: 1 },
  { id: "balance", name: "균형의 힘", icon: "⭐", description: "과제·1인1역", weight: 1 }
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
      { id: crypto.randomUUID(), studentId: "s2", roleId: "board", status: "waiting" },
      { id: crypto.randomUUID(), studentId: "s3", roleId: "lunch", status: "completed" }
    ],
    dailyRoleApplicationLimit: 1,
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
      statuses: STUDENT_NAMES.map((_, studentIndex) => studentIndex < 3 - assignmentIndex ? "submitted" : "missing")
    })),
    cardSets: [{ id: DEFAULT_CARD_SET_ID, name: "한국사 기본 위인", description: "우리 역사에서 만나는 기본 위인 카드셋", createdAt: new Date().toISOString(), active: true, deleted: false }],
    activeCardSetIds: [DEFAULT_CARD_SET_ID],
    drawOptions: structuredClone(DEFAULT_DRAW_OPTIONS),
    cardUpgradeSettings: { ...DEFAULT_CARD_UPGRADE_SETTINGS },
    cardAbilitySettings: structuredClone(DEFAULT_CARD_ABILITY_SETTINGS),
    cards: FIGURES.map(({ rarity, ...figure }, index) => ({ ...figure, cardSetId: DEFAULT_CARD_SET_ID, order: index, active: true, deleted: false })),
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
    pointTransfers: []
  };
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
      id: card.id || crypto.randomUUID(), name: card.name || "이름 없는 인물", era: card.era || "시대 미상",
      achievement: card.achievement || card.description || "",
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
    saved.cardAbilitySettings = Object.fromEntries(CARD_RARITIES.map((rarity) => {
      const setting = saved.cardAbilitySettings?.[rarity] || DEFAULT_CARD_ABILITY_SETTINGS[rarity];
      const legacyPercent = Number(setting.bonusPercent); const dailyCap = Number(setting.dailyCap);
      const abilities = Object.fromEntries(CARD_ABILITIES.map((ability) => {
        const defaults = DEFAULT_CARD_ABILITY_SETTINGS[rarity].abilities[ability.id]; const source = setting.abilities?.[ability.id] || {};
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
          if (rarityValue && typeof rarityValue === "object" && !Array.isArray(rarityValue)) return [rarity, Object.fromEntries(CARD_ABILITIES.map((ability) => [ability.id, Math.max(0, Number(rarityValue[ability.id]) || 0)]))];
          const counts = Object.fromEntries(CARD_ABILITIES.map((ability) => [ability.id, 0]));
          for (let count = 0; count < Math.max(0, Number(rarityValue) || 0); count += 1) counts[CARD_ABILITIES[Math.floor(Math.random() * CARD_ABILITIES.length)].id] += 1;
          return [rarity, counts];
        }));
        return [cardId, inventory];
      }));
      const representative = student.representativeCard;
      const representedAbilities = cards[representative?.cardId]?.[representative?.rarity] || {}; const fallbackAbility = CARD_ABILITIES.find((ability) => Number(representedAbilities[ability.id]) > 0)?.id;
      const representativeAbilityId = representedAbilities[representative?.abilityId] > 0 ? representative.abilityId : fallbackAbility;
      const representativeCard = representative && CARD_RARITIES.includes(representative.rarity) && representativeAbilityId
        ? { cardId: representative.cardId, rarity: representative.rarity, abilityId: representativeAbilityId } : null;
      let loginId = String(student.loginId || `student${String(studentIndex + 1).padStart(2, "0")}`).trim();
      if (!loginId || usedLoginIds.has(loginId.toLocaleLowerCase("en-US"))) { let suffix = studentIndex + 1; do { loginId = `student${String(suffix).padStart(2, "0")}`; suffix += 1; } while (usedLoginIds.has(loginId.toLocaleLowerCase("en-US"))); }
      usedLoginIds.add(loginId.toLocaleLowerCase("en-US"));
      return { ...student, number: Number.isInteger(Number(student.number)) && Number(student.number) > 0 ? Number(student.number) : studentIndex + 1, loginId, active: student.active !== false, cards, representativeCard, cardUpgradeHistory: Array.isArray(student.cardUpgradeHistory) ? student.cardUpgradeHistory : [], cardAcquisitionHistory: Array.isArray(student.cardAcquisitionHistory) ? student.cardAcquisitionHistory : [], pointHistory: Array.isArray(student.pointHistory) ? student.pointHistory : [] };
    });
    saved.classSettings = { appName: String(saved.classSettings?.appName || "우리반 퀘스트").slice(0, 50), className: String(saved.classSettings?.className || "우리 반").slice(0, 50), teacherName: String(saved.classSettings?.teacherName || "선생님").slice(0, 30), features: Object.fromEntries(Object.keys(DEFAULT_CLASS_FEATURES).map((key) => [key, saved.classSettings?.features?.[key] !== false])), ...(saved.classSettings?.studentHomeMessageTitle != null ? { studentHomeMessageTitle: String(saved.classSettings.studentHomeMessageTitle).slice(0, 100) } : {}), ...(saved.classSettings?.studentHomeMessageSubtitle != null ? { studentHomeMessageSubtitle: String(saved.classSettings.studentHomeMessageSubtitle).slice(0, 200) } : {}) };
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
          ? dataLengthArray(assignment.statuses, "missing", saved.students.length)
          : dataLengthArray((assignment.submitted || []).map((submitted) => submitted ? "submitted" : "missing"), "missing", saved.students.length)
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
    saved.rankingVisibility = Object.fromEntries(RANKING_TYPES.map((ranking) => [ranking.id, saved.rankingVisibility?.[ranking.id] !== false]));
    saved.weeklyTimetable = Object.fromEntries(TIMETABLE_DAYS.map((day) => [day.key, Array.from({ length: Math.max(6, Array.isArray(saved.weeklyTimetable?.[day.key]) ? saved.weeklyTimetable[day.key].length : 0) }, (_, index) => String(saved.weeklyTimetable?.[day.key]?.[index] || "").slice(0, 40))]));
    saved.dateTimetableOverrides = saved.dateTimetableOverrides && typeof saved.dateTimetableOverrides === "object" && !Array.isArray(saved.dateTimetableOverrides) ? Object.fromEntries(Object.entries(saved.dateTimetableOverrides).filter(([date, periods]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Array.isArray(periods)).map(([date, periods]) => [date, periods.map((period) => String(period || "").slice(0, 40))])) : {};
    saved.dailyClassNotes = saved.dailyClassNotes && typeof saved.dailyClassNotes === "object" && !Array.isArray(saved.dailyClassNotes) ? Object.fromEntries(Object.entries(saved.dailyClassNotes).filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)).map(([date, note]) => [date, { text: String(typeof note === "string" ? note : note?.text || "").slice(0, 2000), updatedAt: typeof note === "object" ? note.updatedAt || "" : "" }])) : {};
    saved.classEvents = (Array.isArray(saved.classEvents) ? saved.classEvents : []).filter((event) => event && /^\d{4}-\d{2}-\d{2}$/.test(String(event.date || "")) && String(event.title || "").trim()).map((event) => ({ id: String(event.id || crypto.randomUUID()), date: String(event.date), title: String(event.title).trim().slice(0, 100), description: String(event.description || "").trim().slice(0, 500), category: ["학급행사", "학교행사", "준비물·안내", "기타"].includes(event.category) ? event.category : "기타", createdAt: String(event.createdAt || new Date().toISOString()), updatedAt: String(event.updatedAt || event.createdAt || new Date().toISOString()) }));
    saved.pointShopItems = (Array.isArray(saved.pointShopItems) ? saved.pointShopItems : []).filter((item) => item && String(item.name || "").trim()).map((item) => ({ id: String(item.id || crypto.randomUUID()), name: String(item.name).trim().slice(0, 80), description: String(item.description || "").trim().slice(0, 300), price: Math.max(0, Number.isInteger(Number(item.price)) ? Number(item.price) : 0), dailyStock: Math.max(1, Number.isInteger(Number(item.dailyStock)) ? Number(item.dailyStock) : 1), perStudentDailyLimit: Math.max(1, Number.isInteger(Number(item.perStudentDailyLimit)) ? Number(item.perStudentDailyLimit) : 1), approvalRequired: item.approvalRequired !== false, active: item.active !== false, deleted: Boolean(item.deleted), createdAt: String(item.createdAt || new Date().toISOString()), updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString()) }));
    saved.pointUseRequests = (Array.isArray(saved.pointUseRequests) ? saved.pointUseRequests : []).filter((request) => request && /^\d{4}-\d{2}-\d{2}$/.test(String(request.date || "")) && ["pending", "completed", "rejected"].includes(request.status)).map((request) => ({ id: String(request.id || crypto.randomUUID()), itemId: String(request.itemId || ""), studentId: String(request.studentId || ""), date: String(request.date), price: Math.max(0, Number(request.price) || 0), status: request.status, createdAt: String(request.createdAt || new Date().toISOString()), resolvedAt: request.resolvedAt ? String(request.resolvedAt) : null }));
    saved.pointShopSets = (Array.isArray(saved.pointShopSets) ? saved.pointShopSets : []).filter((set) => set && String(set.name || "").trim() && Array.isArray(set.items)).map((set) => ({ id: String(set.id || crypto.randomUUID()), name: String(set.name).trim().slice(0, 60), items: set.items.filter((item) => item && String(item.name || "").trim()).map((item) => ({ name: String(item.name).trim().slice(0, 80), description: String(item.description || "").trim().slice(0, 300), price: Math.max(0, Number.isInteger(Number(item.price)) ? Number(item.price) : 0), dailyStock: Math.max(1, Number.isInteger(Number(item.dailyStock)) ? Number(item.dailyStock) : 1), perStudentDailyLimit: Math.max(1, Number.isInteger(Number(item.perStudentDailyLimit)) ? Number(item.perStudentDailyLimit) : 1), approvalRequired: item.approvalRequired !== false, active: item.active !== false })), createdAt: String(set.createdAt || new Date().toISOString()), updatedAt: String(set.updatedAt || set.createdAt || new Date().toISOString()) }));
    const transferSettings = saved.pointTransferSettings && typeof saved.pointTransferSettings === "object" ? saved.pointTransferSettings : {};
    saved.pointTransferSettings = { enabled: transferSettings.enabled !== false, maxPerTransfer: Math.max(1, Number.isInteger(Number(transferSettings.maxPerTransfer)) ? Number(transferSettings.maxPerTransfer) : 10), dailyMaxAmount: Math.max(1, Number.isInteger(Number(transferSettings.dailyMaxAmount)) ? Number(transferSettings.dailyMaxAmount) : 20), dailyMaxCount: Math.max(1, Number.isInteger(Number(transferSettings.dailyMaxCount)) ? Number(transferSettings.dailyMaxCount) : 3) };
    saved.pointTransfers = (Array.isArray(saved.pointTransfers) ? saved.pointTransfers : []).filter((transfer) => transfer && /^\d{4}-\d{2}-\d{2}$/.test(String(transfer.date || "")) && String(transfer.fromStudentId || "") && String(transfer.toStudentId || "") && Number.isInteger(Number(transfer.amount)) && Number(transfer.amount) > 0).map((transfer) => ({ id: String(transfer.id || crypto.randomUUID()), fromStudentId: String(transfer.fromStudentId), toStudentId: String(transfer.toStudentId), amount: Number(transfer.amount), date: String(transfer.date), createdAt: String(transfer.createdAt || new Date().toISOString()) }));
    const savedRoleLimit = Number(saved.dailyRoleApplicationLimit); saved.dailyRoleApplicationLimit = Number.isInteger(savedRoleLimit) && savedRoleLimit >= 1 && savedRoleLimit <= 5 ? savedRoleLimit : 1;
    const savedGroups = Array.isArray(saved.groups) ? saved.groups : DEFAULT_GROUPS();
    saved.groups = savedGroups.map((group, index) => ({ id: String(group.id || crypto.randomUUID()), name: String(group.name || `${index + 1}모둠`).slice(0, 30), score: Math.max(0, Number.isInteger(Number(group.score)) ? Number(group.score) : 0), active: group.active !== false, order: Number.isInteger(Number(group.order)) ? Number(group.order) : index }));
    if (saved.groups.filter((group) => group.active).length < 2) DEFAULT_GROUPS().slice(0, 2).forEach((fallback) => { if (!saved.groups.some((group) => group.id === fallback.id)) saved.groups.push(fallback); else saved.groups.find((group) => group.id === fallback.id).active = true; });
    const activeGroupIds = new Set(saved.groups.filter((group) => group.active).map((group) => group.id)); const studentIds = new Set(saved.students.map((student) => student.id));
    saved.groupAssignments = saved.groupAssignments && typeof saved.groupAssignments === "object" && !Array.isArray(saved.groupAssignments) ? Object.fromEntries(Object.entries(saved.groupAssignments).filter(([studentId, groupId]) => studentIds.has(studentId) && activeGroupIds.has(groupId))) : {};
    saved.groupScoreTransactions = (Array.isArray(saved.groupScoreTransactions) ? saved.groupScoreTransactions : []).map((item) => ({ id: item.id || crypto.randomUUID(), groupId: String(item.groupId || ""), groupName: String(item.groupName || "모둠"), amount: Number(item.amount) || 0, scoreAfter: Math.max(0, Number(item.scoreAfter) || 0), createdAt: item.createdAt || new Date().toISOString(), type: item.type || "manual" }));
    saved.classMissions = (Array.isArray(saved.classMissions) ? saved.classMissions : DEFAULT_CLASS_MISSIONS).map((mission) => ({ id: mission.id || crypto.randomUUID(), target: Math.max(1, Number(mission.target) || 1), reward: String(mission.reward || "공동 활동").slice(0, 100), confirmed: Boolean(mission.confirmed), confirmedAt: mission.confirmedAt || null }));
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
const studentDetailAssignmentFilters = {};
let showAllGroupTransactions = false;
let selectedGroupId = "";
let selectedGroupAssignmentStudentIds = new Set();
let pendingGroupNames = {};
const assignmentSelections = {};
const selectedPointStudentIds = new Set();
let toastTimer;
const app = document.querySelector("#app");

function todayString() { return new Date().toLocaleDateString("sv-SE"); }
function dateWithOffset(offset) { const date = new Date(); date.setDate(date.getDate() + offset); return date.toLocaleDateString("sv-SE"); }
function dataLengthArray(values, fallback, length = STUDENT_NAMES.length) { return Array.from({ length }, (_, index) => ASSIGNMENT_STATUSES.includes(values[index]) ? values[index] : fallback); }

function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function studentById(id) { return data.students.find((student) => student.id === id); }
function activeStudents() { return data.students.filter((student) => student.active !== false).sort((first, second) => studentNumber(first) - studentNumber(second) || first.name.localeCompare(second.name, "ko")); }
function roleById(id) { return data.currentRoles.find((role) => role.id === id); }
function currentStudent() { return studentById(session.studentId); }
function cardInventory(student, cardId) { return student.cards[cardId] || {}; }
function abilityInventory(student, cardId, rarity) { return cardInventory(student, cardId)[rarity] || {}; }
function rarityInventoryCount(student, cardId, rarity) { return CARD_ABILITIES.reduce((sum, ability) => sum + (Number(abilityInventory(student, cardId, rarity)[ability.id]) || 0), 0); }
function cardInventoryCount(student, cardId) { return CARD_RARITIES.reduce((sum, rarity) => sum + rarityInventoryCount(student, cardId, rarity), 0); }
function cardCount(student) { return Object.keys(student.cards).reduce((sum, cardId) => sum + cardInventoryCount(student, cardId), 0); }
function cardSetById(id) { return data.cardSets.find((cardSet) => cardSet.id === id); }
function usableCardSets() { return data.cardSets.filter((cardSet) => cardSet.active && !cardSet.deleted); }
function normalizeActiveCardSets() { data.activeCardSetIds = [...new Set(data.activeCardSetIds || [])].filter((id) => usableCardSets().some((cardSet) => cardSet.id === id)); }
function drawRate(rarity, rates) { return Number(rates?.[CARD_RATE_KEYS[rarity]]) || 0; }
function upgradeStepFrom(rarity) { return CARD_UPGRADE_STEPS.find((step) => step.from === rarity); }
function upgradeRequired(rarity) { const step = upgradeStepFrom(rarity); return step ? data.cardUpgradeSettings[step.key] : null; }
function cardAbilitySetting(rarity) { return data.cardAbilitySettings?.[rarity] || DEFAULT_CARD_ABILITY_SETTINGS[rarity]; }
function cardAbilityById(id) { return CARD_ABILITIES.find((ability) => ability.id === id); }
function abilityPercent(rarity, abilityId, originalSource) { const setting = cardAbilitySetting(rarity).abilities?.[abilityId]; return Number(originalSource === "과제" ? setting?.assignmentPercent : setting?.rolePercent) || 0; }
function abilitySummary(rarity, abilityId) { const ability = cardAbilityById(abilityId); const setting = cardAbilitySetting(rarity).abilities?.[abilityId] || {}; const assignment = Number(setting.assignmentPercent) || 0; const role = Number(setting.rolePercent) || 0; return `${ability?.icon || "✨"} ${ability?.name || "특수능력"} · ${assignment && role ? `과제·1인1역 +${assignment}%` : assignment ? `과제 +${assignment}%` : `1인1역 +${role}%`}`; }
function randomAbilityId() { const total = CARD_ABILITIES.reduce((sum, ability) => sum + ability.weight, 0); let value = Math.random() * total; for (const ability of CARD_ABILITIES) { value -= ability.weight; if (value < 0) return ability.id; } return CARD_ABILITIES[0].id; }
function representativeCardInfo(student) {
  const equipped = student?.representativeCard; if (!equipped || !CARD_RARITIES.includes(equipped.rarity)) return null;
  const card = data.cards.find((item) => item.id === equipped.cardId); if (!card || Number(abilityInventory(student, card.id, equipped.rarity)[equipped.abilityId]) < 1) return null;
  return { card, rarity: equipped.rarity, abilityId: equipped.abilityId, ability: cardAbilityById(equipped.abilityId), setting: cardAbilitySetting(equipped.rarity) };
}
function historyDateKey(value) { const parts = String(value || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/); return parts ? `${parts[1]}-${parts[2].padStart(2, "0")}-${parts[3].padStart(2, "0")}` : ""; }
function todayCardBonus(student) { return (student.pointHistory || []).reduce((sum, item) => sum + (item.source === "카드 능력 보너스" && historyDateKey(item.date) === todayString() ? Number(item.amount) || 0 : 0), 0); }
function cardBonusAward(student, baseAmount, originalSource, relatedId) {
  const representative = representativeCardInfo(student); if (!representative || baseAmount <= 0) return { amount: 0 };
  const percent = abilityPercent(representative.rarity, representative.abilityId, originalSource); const cap = Number(representative.setting.dailyCap) || 0;
  const amount = Math.max(0, Math.min(Math.round(baseAmount * percent / 100), Math.max(0, cap - todayCardBonus(student))));
  const snapshot = { amount, cardId: representative.card.id, cardName: representative.card.name, rarity: representative.rarity, abilityId: representative.abilityId, abilityName: representative.ability?.name, bonusPercent: percent, dailyCap: cap, originalSource, baseAmount, relatedId };
  if (amount > 0) student.pointHistory.push({ id: crypto.randomUUID(), amount, reason: `${representative.card.name} ${representative.ability?.name} 카드 능력 보너스`, source: "카드 능력 보너스", studentId: student.id, representativeCardId: representative.card.id, representativeCardName: representative.card.name, representativeCardRarity: representative.rarity, representativeCardAbilityId: representative.abilityId, representativeCardAbilityName: representative.ability?.name, originalSource, baseAmount, bonusPercent: percent, bonusAmount: amount, relatedId, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() });
  return snapshot;
}
function reverseCardBonus(student, snapshot, reason) {
  const amount = Number(snapshot?.amount) || 0; if (amount <= 0) return;
  student.pointHistory.push({ id: crypto.randomUUID(), amount: -amount, reason, source: "카드 능력 보너스", studentId: student.id, representativeCardId: snapshot.cardId, representativeCardName: snapshot.cardName, representativeCardRarity: snapshot.rarity, representativeCardAbilityId: snapshot.abilityId, representativeCardAbilityName: snapshot.abilityName, originalSource: snapshot.originalSource, baseAmount: snapshot.baseAmount, bonusPercent: snapshot.bonusPercent, bonusAmount: -amount, relatedId: snapshot.relatedId, reversal: true, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() });
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function toast(message) { const element = document.querySelector("#toast"); element.textContent = message; element.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove("show"), 2200); }
saveData();

function renderWelcome(showStudents = false) {
  document.title = data.classSettings.appName;
  app.innerHTML = `<main class="welcome"><section class="welcome-card"><div class="brand-mark">⚔</div><h1>${escapeHtml(data.classSettings.appName)}</h1><p>함께 돕고, 성장하고, 역사의 주인공을 만나 보세요!</p><div class="role-choices"><button class="role-choice student" data-action="show-students">학생으로 체험하기</button><button class="role-choice teacher" data-action="enter-teacher">선생님으로 체험하기</button></div>${showStudents ? `<div class="student-picker" aria-label="체험할 학생 선택">${activeStudents().map((student) => `<button class="student-pick" data-action="enter-student" data-id="${student.id}">${student.name}</button>`).join("")}</div>` : ""}</section></main>`;
}

const STUDENT_NAV = [["home", "⌂", "홈"], ["roles", "✓", "오늘의 역할"], ["assignments", "▣", "과제"], ["points", "◆", "포인트"], ["draw", "★", "카드 뽑기"], ["collection", "▦", "위인 도감"], ["ranking", "♛", "랭킹"]];
const TEACHER_NAV = [["dashboard", "⌂", "대시보드"], ["students", "♙", "학생 관리"], ["groups", "◉", "모둠활동"], ["roles", "✓", "1인1역"], ["assignments", "▣", "과제"], ["observations", "✎", "관찰 기록"], ["points", "◆", "포인트"], ["cards", "★", "카드 관리"], ["ranking", "♛", "랭킹"], ["class-settings", "⚙", "학급 설정"]];

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
function todayRoleApplicationsForStudent(studentId) {
  const today = todayString();
  return data.roleApplications.filter((application) => { if (application.studentId !== studentId || application.status === "cancelled") return false; const dates = [localDateKey(application.appliedAt), localDateKey(application.completedAt)].filter(Boolean); return dates.length ? dates.includes(today) : true; });
}
function shell(content, teacher = false) {
  const student = currentStudent();
  document.title = data.classSettings.appName;
  const top = teacher ? `<span>${escapeHtml(data.classSettings.className)} · ${escapeHtml(data.classSettings.teacherName)}</span>` : `<span>${escapeHtml(data.classSettings.className)} · ${escapeHtml(student.name)}</span>`;
  const studentSummaryItems = teacher ? [] : [
    `<div class="summary-item class-summary-item">학급<strong>${escapeHtml(data.classSettings.className)}</strong></div>`,
    featureEnabled("points") ? `<div class="summary-item">현재 포인트<strong>${student.points}P</strong></div>` : "",
    featureEnabled("roles") ? `<div class="summary-item">오늘 역할<strong>${todayRoleApplicationsForStudent(student.id).length}개</strong></div>` : "",
    featureEnabled("cards") ? `<div class="summary-item">보유 카드<strong>${cardCount(student)}장</strong></div>` : ""
  ].filter(Boolean);
  const summary = teacher ? "" : `<section class="summary-strip" style="--summary-count:${studentSummaryItems.length}">${studentSummaryItems.join("")}</section>`;
  return `<div class="app-shell ${teacher ? "teacher-shell" : "student-shell"}"><header class="topbar"><div class="brand"><span class="brand-icon">⚔</span>${escapeHtml(data.classSettings.appName)}</div><div class="user-area">${top}<button class="ghost-button" data-action="logout">처음으로</button></div></header>${summary}<div class="layout"><nav class="side-nav">${navHtml(teacher ? teacherNavItems() : studentNavItems())}</nav><main class="content">${content}</main></div></div>`;
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
      ? `<div class="assignment-review-state"><strong>⏳ 확인 대기 중</strong><small>선생님이 확인하고 있어요.</small></div>`
      : `<span class="pill success assignment-finished-label">✓ 제출 완료</span>`;
  return `<article class="card student-assignment-card ${assignment.important ? "important" : ""}"><div class="assignment-card-top"><div class="assignment-labels"><span class="subject-badge">${escapeHtml(assignment.subject)}</span>${assignment.important ? `<span class="important-mark">★ 중요</span>` : ""}${assignment.points > 0 ? `<span class="pill assignment-points-badge">완료 시 +${assignment.points}P</span>` : ""}</div></div><h3>${escapeHtml(assignment.title)}</h3>${assignment.description ? `<p class="muted">${escapeHtml(assignment.description)}</p>` : ""}<div class="assignment-meta"><span>📅 ${formatDueDate(assignment.dueDate)}</span></div>${statusControl}</article>`;
}

function studentHomeLegacy() {
  const student = currentStudent(); const studentIndex = data.students.findIndex((item) => item.id === student.id);
  const recent = student.pointHistory.slice(-4).reverse();
  const activeAssignments = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment));
  const completedAssignments = data.assignments.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
  const shownCompletedAssignments = showAllStudentCompletedAssignments ? completedAssignments : completedAssignments.slice(0, 5);
  const representative = representativeCardInfo(student);
  const representativeHtml = representative ? `<section class="representative-card-summary"><div><small>나의 대표 카드</small><h2>${escapeHtml(representative.card.name)} <span class="pill rarity-${rarityClass(representative.rarity)}">${representative.rarity}</span></h2></div><div><strong>특수능력</strong><p>${abilitySummary(representative.rarity, representative.abilityId)}</p><small>오늘 카드 보너스 ${todayCardBonus(student)} / ${representative.setting.dailyCap}P</small></div></section>` : `<section class="representative-card-summary empty-representative"><div><small>나의 대표 카드</small><h2>아직 장착한 카드가 없어요.</h2><p>위인 도감에서 보유 카드를 대표 카드로 장착해 보세요.</p></div></section>`;
  return `<section class="hero"><h2>오늘도 우리 반을 위해<br>퀘스트를 완료해 보세요! ✨</h2><p>작은 도움이 모여 멋진 교실을 만들어요.</p></section>${representativeHtml}<h2 class="section-title">오늘의 과제</h2>${activeAssignments.length ? `<div class="grid">${activeAssignments.map((assignment) => studentAssignmentCard(assignment, studentIndex)).join("")}</div>` : `<div class="empty">진행 중인 과제가 없어요. 멋지게 완료했어요!</div>`}${completedAssignments.length ? `<details class="completed-assignments"><summary>지난 과제 ${completedAssignments.length}개 · ${showAllStudentCompletedAssignments ? "전체" : `최근 ${Math.min(5, completedAssignments.length)}개`} 보기</summary><div class="grid">${shownCompletedAssignments.map((assignment) => studentAssignmentCard(assignment, studentIndex, true)).join("")}</div>${completedAssignments.length > 5 ? `<button class="button secondary record-view-all" data-action="toggle-student-completed-assignments">${showAllStudentCompletedAssignments ? "최근 5개만 보기" : "전체 보기"}</button>` : ""}</details>` : ""}<h2 class="section-title">최근 포인트 내역</h2>${recent.length ? `<div class="list">${recent.map((item) => pointHistoryRow(item)).join("")}</div>` : `<div class="empty">아직 포인트 기록이 없어요.</div>`}`;
}

function studentAssignmentSort(studentIndex) {
  const order = { missing: 0, review: 1, submitted: 2 };
  return (first, second) => (order[first.statuses[studentIndex] || "missing"] - order[second.statuses[studentIndex] || "missing"]) || String(first.dueDate || "9999-12-31").localeCompare(String(second.dueDate || "9999-12-31")) || String(second.createdAt || "").localeCompare(String(first.createdAt || ""));
}
function studentHome() {
  const student = currentStudent(); const studentIndex = data.students.findIndex((item) => item.id === student.id);
  const assignments = featureEnabled("assignments") ? data.assignments.filter((assignment) => !isAssignmentCompleted(assignment)).sort(studentAssignmentSort(studentIndex)) : [];
  const roleApplications = featureEnabled("roles") ? todayRoleApplicationsForStudent(student.id) : [];
  const roleSummary = featureEnabled("roles") ? `<article class="card student-home-role"><div><span class="subject-badge">오늘의 역할</span><h3>${roleApplications.length ? `${roleApplications.length}개 참여 중` : "아직 신청한 역할이 없어요"}</h3><p class="muted">${roleApplications.length ? roleApplications.map((application) => escapeHtml(roleById(application.roleId)?.name || "역할")).join(" · ") : "역할을 골라 우리 반을 함께 도와주세요."}</p></div><button class="button secondary compact" data-action="navigate" data-view="roles">역할 보기</button></article>` : "";
  const assignmentSection = featureEnabled("assignments") ? `<div class="section-heading student-task-heading"><div><h2 class="section-title">진행 중 과제</h2><p class="muted">미제출 과제와 가까운 마감일을 먼저 보여 줍니다.</p></div><button class="button secondary compact" data-action="navigate" data-view="assignments">과제 전체 보기</button></div>${assignments.length ? `<div class="grid student-home-assignment-grid">${assignments.map((assignment) => studentAssignmentCard(assignment, studentIndex)).join("")}</div>` : `<div class="empty">진행 중인 과제가 없어요. 멋지게 완료했어요!</div>`}` : "";
  const recentPoints = featureEnabled("points") ? student.pointHistory.slice(-5).reverse() : [];
  const pointSection = featureEnabled("points") ? `<div class="section-heading student-state-heading"><div><h2 class="section-title">나의 현재 상태</h2><p class="muted">현재 ${student.points}P · 최근 포인트 내역</p></div><button class="button secondary compact" data-action="navigate" data-view="points">포인트 전체 보기</button></div>${recentPoints.length ? `<div class="list student-home-points">${recentPoints.map(pointHistoryRow).join("")}</div>` : `<div class="empty">아직 포인트 기록이 없어요.</div>`}` : "";
  const representative = featureEnabled("cards") ? representativeCardInfo(student) : null;
  const representativeHtml = !featureEnabled("cards") ? "" : representative ? `<section class="representative-card-summary student-home-representative"><div><small>나의 대표 카드</small><h2>${escapeHtml(representative.card.name)} <span class="pill rarity-${rarityClass(representative.rarity)}">${representative.rarity}</span></h2></div><div><strong>특수능력</strong><p>${abilitySummary(representative.rarity, representative.abilityId)}</p><small>오늘 카드 보너스 ${todayCardBonus(student)} / ${representative.setting.dailyCap}P</small></div></section>` : `<section class="representative-card-summary empty-representative student-home-representative"><div><small>나의 대표 카드</small><h2>아직 장착한 카드가 없어요.</h2><p>위인 도감에서 보유 카드를 대표 카드로 장착해 보세요.</p></div></section>`;
  return `<section class="hero student-home-hero"><h2>오늘도 우리 반을 함께 빛내요! ✨</h2><p>해야 할 일을 하나씩 확인해 보세요.</p></section><section class="student-today-tasks"><h1 class="student-home-section-title">오늘 해야 할 일</h1>${roleSummary}${assignmentSection}</section>${pointSection}${representativeHtml}`;
}

function studentAssignments() {
  const student = currentStudent(); const studentIndex = data.students.findIndex((item) => item.id === student.id); const sorter = studentAssignmentSort(studentIndex);
  const matching = data.assignments.filter((assignment) => { const status = assignment.statuses[studentIndex] || "missing"; if (studentAssignmentFilter === "todo") return status === "missing" && !isAssignmentCompleted(assignment); if (studentAssignmentFilter === "review") return status === "review" && !isAssignmentCompleted(assignment); return status === "submitted"; }).sort((first, second) => studentAssignmentFilter === "done" ? sortCompletedAssignments(first, second) : sorter(first, second));
  const shown = studentAssignmentFilter === "done" && !showAllStudentCompletedAssignments ? matching.slice(0, 5) : matching;
  const filters = [["todo", "해야 할 과제"], ["review", "확인 대기"], ["done", "완료"]].map(([value, label]) => `<button class="button compact ${studentAssignmentFilter === value ? "active" : "secondary"}" data-action="set-student-assignment-filter" data-filter="${value}">${label}</button>`).join("");
  const emptyLabel = { todo: "해야 할 과제가 없습니다.", review: "확인 대기 중인 과제가 없습니다.", done: "완료한 과제가 없습니다." }[studentAssignmentFilter];
  return `<div class="section-heading"><div><h1 class="page-heading">과제</h1><p class="page-description">나의 과제 상태만 확인할 수 있습니다.</p></div></div><div class="student-assignment-page-filters">${filters}</div>${shown.length ? `<div class="grid student-assignment-page-grid">${shown.map((assignment) => studentAssignmentCard(assignment, studentIndex, isAssignmentCompleted(assignment))).join("")}</div>` : `<div class="empty">${emptyLabel}</div>`}${studentAssignmentFilter === "done" && matching.length > 5 ? `<button class="button secondary record-view-all" data-action="toggle-student-completed-assignments">${showAllStudentCompletedAssignments ? "최근 5개만 보기" : `전체 ${matching.length}개 보기`}</button>` : ""}`;
}

function studentPoints() {
  const student = currentStudent(); const history = [...(student.pointHistory || [])].reverse(); const shown = showAllStudentPoints ? history : history.slice(0, 5);
  return `<div class="section-heading"><div><h1 class="page-heading">포인트</h1><p class="page-description">나의 포인트와 변동 내역만 확인할 수 있습니다.</p></div></div><section class="card student-point-balance"><span>현재 보유 포인트</span><strong>${student.points}P</strong></section><section class="student-point-history"><div class="section-heading"><h2>최근 포인트 내역</h2><span class="muted">${showAllStudentPoints ? `전체 ${history.length}건` : `최근 ${Math.min(5, history.length)}건`}</span></div>${shown.length ? `<div class="list">${shown.map(pointHistoryRow).join("")}</div>` : `<div class="empty">포인트 내역이 없습니다.</div>`}${history.length > 5 ? `<button class="button secondary record-view-all" data-action="toggle-student-point-history">${showAllStudentPoints ? "최근 5건만 보기" : "전체 보기"}</button>` : ""}</section>`;
}

function studentRoles() {
  const student = currentStudent();
  const ownActive = todayRoleApplicationsForStudent(student.id); const limit = data.dailyRoleApplicationLimit;
  return `<h1 class="page-heading">오늘의 1인1역</h1><p class="page-description">하루에 최대 ${limit}개까지 신청할 수 있어요. 함께 교실을 빛내 주세요!</p><section class="card role-application-limit-status"><span>오늘 신청</span><strong>${ownActive.length} / ${limit}개</strong>${ownActive.length >= limit ? `<small>오늘 신청 가능한 1인1역을 모두 신청했습니다.</small>` : `<small>${limit - ownActive.length}개 더 신청할 수 있어요.</small>`}</section><div class="grid">${data.currentRoles.map((role) => {
    const applications = data.roleApplications.filter((item) => item.roleId === role.id && item.status !== "cancelled");
    const mine = applications.find((item) => item.studentId === student.id);
    const full = applications.length >= role.capacity;
    const actionButton = mine?.status === "completed"
      ? `<button class="button secondary" type="button" disabled>완료</button>`
      : mine?.status === "waiting"
        ? `<button class="button danger" type="button" data-action="open-student-cancel" data-id="${mine.id}">신청 취소</button>`
        : `<button class="button" type="button" data-action="apply-role" data-id="${role.id}" ${full || ownActive.length >= limit ? "disabled" : ""}>${full ? "모집 완료" : ownActive.length >= limit ? "오늘 신청 완료" : "신청하기"}</button>`;
    return `<article class="card quest-card"><div class="quest-top"><h3>${escapeHtml(role.name)}</h3><span class="points">+${role.points}P</span></div>${role.description ? `<p class="role-description">${escapeHtml(role.description)}</p>` : ""}<div><span class="pill">모집 ${applications.length} / ${role.capacity}명</span></div><div class="progress"><span style="width:${Math.min(100, applications.length / role.capacity * 100)}%"></span></div><div class="applicants">현재 신청: ${applications.length ? applications.map((item) => studentById(item.studentId).name).join(", ") : "아직 없음"}</div>${actionButton}</article>`;
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
      const rarityCounts = CARD_RARITIES.map((rarity) => { const quantity = rarityInventoryCount(student, figure.id, rarity); const step = upgradeStepFrom(rarity); const needed = upgradeRequired(rarity); const abilities = CARD_ABILITIES.map((ability) => { const abilityCount = Number(abilityInventory(student, figure.id, rarity)[ability.id]) || 0; if (!abilityCount) return ""; const equipped = student.representativeCard?.cardId === figure.id && student.representativeCard?.rarity === rarity && student.representativeCard?.abilityId === ability.id; return `<div class="owned-ability"><span><strong>${ability.icon} ${ability.name}</strong> ×${abilityCount}</span><small>${abilitySummary(rarity, ability.id).split(" · ")[1]}</small><button class="representative-equip-button ${equipped ? "equipped" : ""}" data-action="equip-representative-card" data-card-id="${figure.id}" data-rarity="${rarity}" data-ability-id="${ability.id}" ${equipped ? "disabled" : ""}>${equipped ? "대표 카드 ✓" : "대표 카드로 설정"}</button></div>`; }).join(""); const upgradeControl = step ? quantity >= needed ? `<button class="upgrade-button" data-action="ask-upgrade-card" data-card-id="${figure.id}" data-rarity="${rarity}">⬆ ${step.to} 등급으로 업그레이드</button>` : `<small class="upgrade-progress">총 ${quantity} / ${needed}</small>` : `<small class="upgrade-progress">최고 등급</small>`; return `<div class="rarity-status ${quantity > 0 ? `owned rarity-${rarityClass(rarity)}` : "locked"}"><strong>${rarity}</strong><span>${quantity > 0 ? `총 ×${quantity}` : "-"}</span>${abilities}${upgradeControl}</div>`; }).join("");
      return count ? `<article class="figure-card"><h3>${escapeHtml(figure.name)}</h3><p class="muted">${escapeHtml(figure.era)}</p><small>${escapeHtml(figure.achievement)}</small><div class="rarity-inventory">${rarityCounts}</div><strong class="owned-count">보유 ×${count}</strong>${(!figure.active || !cardSet.active) ? `<span class="inactive-card-note">현재 뽑기 제외</span>` : ""}</article>` : `<article class="figure-card locked" aria-label="${escapeHtml(figure.name)} 미획득 카드"><span>?</span><small>${escapeHtml(figure.name)} · 5개 등급</small></article>`;
    }).join("")}</div></section>`;
  }).join("");
  const representative = representativeCardInfo(student); const bonusCap = representative?.setting.dailyCap || 0;
  return `<h1 class="page-heading">위인 도감</h1><p class="page-description">한 인물의 등급과 특수능력별 보유 수량을 확인하세요.</p><div class="collection-bonus-summary"><strong>현재 대표 카드</strong><span>${representative ? `${escapeHtml(representative.card.name)} · ${representative.rarity} · ${representative.ability?.name}` : "없음"}</span><span>오늘 카드 보너스 <b>${todayCardBonus(student)} / ${bonusCap}P</b></span></div><div class="collection-filters">${filterButtons}</div>${sections || `<div class="empty">표시할 카드가 없습니다.</div>`}`;
}

function collectionCardButton(card, rarity, student) {
  const quantity = rarityInventoryCount(student, card.id, rarity);
  return `<button class="collection-album-card rarity-${rarityClass(rarity)}" data-action="open-collection-card" data-card-id="${card.id}" data-rarity="${rarity}" aria-label="${escapeHtml(card.name)} ${rarity} 카드 상세 보기"><span class="collection-card-visual">★</span><strong>${escapeHtml(card.name)}</strong><span class="pill rarity-${rarityClass(rarity)}">${rarity}</span><small>보유 ${quantity}</small></button>`;
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
  return `<h1 class="page-heading">위인 도감</h1><p class="page-description">획득한 카드를 등급별로 모아 보고, 눌러서 앞면과 능력을 확인하세요.</p><div class="collection-bonus-summary"><strong>현재 대표 카드</strong><span>${representative ? `${escapeHtml(representative.card.name)} · ${representative.rarity} · ${representative.ability?.name}` : "없음"}</span><span>오늘 카드 보너스 <b>${todayCardBonus(student)} / ${bonusCap}P</b></span></div><div class="collection-filters">${filterButtons}</div>${raritySections}`;
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
function assignmentRankingValue(student) { const index = data.students.findIndex((item) => item.id === student.id); return data.assignments.filter((assignment) => assignment.statuses[index] === "submitted" && (rankingPeriod === "all" || dateInRankingPeriod(assignment.pointAwards?.[student.id]?.awardedAt))).length; }
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
function rolesForDate(dateKey) { return data.roleApplications.filter((application) => application.status !== "cancelled" && [localDateKey(application.appliedAt), localDateKey(application.completedAt)].includes(dateKey)); }
function observationsForDate(dateKey) { return data.observations.filter((observation) => localDateKey(observation.date || observation.createdAt) === dateKey).sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)); }
function pointTransactionsForDate(dateKey) { return data.students.flatMap((student) => (student.pointHistory || []).filter((item) => localDateKey(item.createdAt || item.date) === dateKey).map((item) => ({ ...item, studentName: student.name }))); }
function assignmentStatusCounts(assignment) { return { submitted: assignment.statuses.filter((status) => status === "submitted").length, review: assignment.statuses.filter((status) => status === "review").length, missing: assignment.statuses.filter((status) => status === "missing").length }; }
function pointCategory(item) { if (item.source === "1인1역") return "role"; if (item.source === "과제") return "assignment"; if (item.source === "카드 능력 보너스") return "bonus"; if (item.source === "교사 직접 지급") return "teacherGive"; if (item.source === "교사 직접 차감") return "teacherTake"; if (item.source === "카드 뽑기" || String(item.reason || "").includes("카드 뽑기")) return "draw"; return "other"; }
function calendarActivity(dateKey) { return { assignments: assignmentsForDate(dateKey).length, roles: rolesForDate(dateKey).length, observations: observationsForDate(dateKey).length, note: Boolean(data.dailyClassNotes?.[dateKey]?.text) }; }
function timetableDayForDate(dateKey) { const [year, month, day] = dateKey.split("-").map(Number); const weekday = new Date(year, month - 1, day).getDay(); return TIMETABLE_DAYS.find((item) => item.day === weekday); }
function timetableForDate(dateKey) { const override = data.dateTimetableOverrides?.[dateKey]; if (Array.isArray(override)) return { periods: override, override: true }; const weekday = timetableDayForDate(dateKey); return { periods: weekday ? data.weeklyTimetable[weekday.key] || [] : [], override: false }; }
function timetableRows(periods) { const filled = periods.map((subject, index) => ({ subject, index })).filter((item) => item.subject.trim()); if (!filled.length) return `<div class="empty">등록된 시간표가 없습니다.</div>`; return `<div class="timetable-list">${filled.map((item) => `<div><strong>${item.index + 1}교시</strong><span>${escapeHtml(item.subject)}</span></div>`).join("")}</div>`; }
function dashboardClassPlan() { const timetable = timetableForDate(dashboardSelectedDate); const note = data.dailyClassNotes?.[dashboardSelectedDate]?.text || ""; return `<div class="dashboard-class-plan"><section class="card dashboard-detail"><div class="section-heading"><div><h2>시간표</h2>${timetable.override ? `<span class="pill waiting">이 날짜만 수정됨</span>` : ""}</div><div class="list-actions"><button class="button secondary compact" data-action="edit-date-timetable">이 날짜 시간표 수정</button>${timetable.override ? `<button class="button danger compact" data-action="reset-date-timetable">기본 시간표로 되돌리기</button>` : ""}<button class="button secondary compact" data-action="edit-weekly-timetable">기본 시간표 설정</button></div></div>${timetableRows(timetable.periods)}</section><section class="card dashboard-detail"><div class="section-heading"><h2>주요 사항</h2><button class="button secondary compact" data-action="edit-daily-note">${note ? "수정" : "작성"}</button></div>${note ? `<div class="daily-note-text">${escapeHtml(note).replace(/\n/g, "<br>")}</div>` : `<div class="empty">등록된 주요 사항이 없습니다.</div>`}</section></div>`; }
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
function openBulkStudentsModal() {
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="bulk-students-form" class="modal-card form bulk-students-modal"><h2>학생 일괄 등록</h2><p class="muted">한 줄에 <strong>번호,이름</strong> 형식으로 입력하세요. 기존 학생은 바뀌지 않고 새 학생만 추가됩니다.</p><label>학생 목록<textarea name="students" rows="12" required placeholder="1,김민수\n2,이서연\n3,박지훈"></textarea></label><div class="button-row"><button class="button success" type="submit">내용 확인</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}
function addStudentRecord(number, name, loginId) {
  const student = { id: crypto.randomUUID(), number, name, loginId, active: true, points: 0, cards: {}, representativeCard: null, cardUpgradeHistory: [], cardAcquisitionHistory: [], pointHistory: [] };
  data.students.push(student); data.assignments.forEach((assignment) => assignment.statuses.push("missing")); return student;
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
  const rows = shown.map((application) => { const role = roleById(application.roleId); const student = studentById(application.studentId); return `<article><div><strong>${escapeHtml(role?.name || "삭제된 역할")}</strong><span>${escapeHtml(student?.name || "학생 정보 없음")}</span></div><span class="pill ${application.status === "completed" ? "success" : "waiting"}">${application.status === "completed" ? "완료" : "수행 대기"}</span><b>${application.status === "completed" ? (application.awardedPoints ?? role?.points ?? 0) : (role?.points ?? 0)}P</b></article>`; }).join("");
  return `<div class="dashboard-detail-list">${rows}</div>${completed.length > 5 ? `<button class="button secondary compact record-view-all" data-action="navigate" data-view="roles">전체 보기</button>` : ""}`;
}
function teacherDashboard() {
  const assignments = assignmentsForDate(dashboardSelectedDate); const roles = rolesForDate(dashboardSelectedDate); const points = pointTransactionsForDate(dashboardSelectedDate); const observations = observationsForDate(dashboardSelectedDate); const submitted = data.assignments.reduce((sum, assignment) => sum + Object.values(assignment.pointAwards || {}).filter((award) => award.awarded && localDateKey(award.awardedAt) === dashboardSelectedDate).length, 0); const completedRoles = roles.filter((role) => role.status === "completed").length; const waitingRoles = roles.filter((role) => role.status === "waiting").length; const issued = points.filter((item) => pointCategory(item) !== "draw").reduce((sum, item) => sum + (Number(item.amount) || 0), 0); const pointTotals = points.reduce((totals, item) => { const key = pointCategory(item); totals[key] = (totals[key] || 0) + (Number(item.amount) || 0); return totals; }, {});
  const pointLabels = [["role", "1인1역"], ["assignment", "과제"], ["bonus", "카드 능력 보너스"], ["teacherGive", "교사 직접 지급"], ["teacherTake", "교사 직접 차감"], ["draw", "카드 뽑기 사용"]];
  const observationList = observations.length ? `<div class="dashboard-detail-list">${observations.slice(0, 5).map((observation) => `<article><div><strong>${escapeHtml(studentById(observation.studentId)?.name || "학생 정보 없음")}</strong><span class="pill">${escapeHtml(observation.category)}</span></div>${observation.quickItems?.length ? `<small>${observation.quickItems.map((item) => `#${escapeHtml(item)}`).join(" ")}</small>` : ""}<p>${escapeHtml(observation.content)}</p></article>`).join("")}</div>${observations.length > 5 ? `<button class="button secondary compact" data-action="navigate" data-view="observations">전체 보기</button>` : ""}` : `<div class="empty">관찰 기록이 없습니다.</div>`;
  return `<div class="section-heading"><div><h1 class="page-heading">선생님 통합 대시보드</h1><p class="page-description">달력에서 날짜를 선택해 학급 활동을 확인하세요.</p></div></div>${dashboardCalendar()}<section class="dashboard-selected-date"><h2>${selectedDateTitle(dashboardSelectedDate)}</h2><div class="dashboard-summary-grid"><article><span>학생 수</span><strong>${data.students.length}명</strong></article><article><span>관련 과제</span><strong>${assignments.length}개</strong></article><article><span>과제 제출 완료</span><strong>${submitted}건</strong></article><article><span>1인1역 완료</span><strong>${completedRoles}건</strong></article><article><span>지급 포인트</span><strong>${issued}P</strong></article><article><span>관찰 기록</span><strong>${observations.length}건</strong></article></div><div class="dashboard-detail-grid"><section class="card dashboard-detail"><div class="section-heading"><h2>과제</h2></div>${dashboardAssignmentList(assignments)}</section><section class="card dashboard-detail"><div class="section-heading"><h2>1인1역</h2><span class="muted">완료 ${completedRoles}명 · 대기 ${waitingRoles}명</span></div>${dashboardRoleList(roles)}</section><section class="card dashboard-detail"><h2>포인트</h2><div class="point-source-summary">${pointLabels.map(([key, label]) => `<div><span>${label}</span><strong class="${(pointTotals[key] || 0) > 0 ? "points" : ""}">${(pointTotals[key] || 0) > 0 ? "+" : ""}${pointTotals[key] || 0}P</strong></div>`).join("")}</div>${points.length ? `<small class="muted">거래 ${points.length}건</small>` : `<div class="empty">포인트 거래가 없습니다.</div>`}</section><section class="card dashboard-detail"><div class="section-heading"><h2>관찰 기록</h2><span class="muted">최근 ${Math.min(5, observations.length)}건</span></div>${observationList}</section></div></section>`;
}

function studentNumber(student) { return Number.isInteger(Number(student?.number)) && Number(student.number) > 0 ? Number(student.number) : data.students.findIndex((item) => item.id === student?.id) + 1; }
function activeAssignmentSummary(student) { const index = data.students.findIndex((item) => item.id === student.id); const active = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment)); return { active, missing: active.filter((assignment) => assignment.statuses[index] === "missing").length, review: active.filter((assignment) => assignment.statuses[index] === "review").length, submitted: active.filter((assignment) => assignment.statuses[index] === "submitted").length }; }
function todayRoleSummary(student) { const items = data.roleApplications.filter((application) => application.studentId === student.id && application.status !== "cancelled" && [localDateKey(application.appliedAt), localDateKey(application.completedAt)].includes(todayString())); return { items, completed: items.filter((item) => item.status === "completed").length, waiting: items.filter((item) => item.status === "waiting").length }; }
function studentObservations(student) { return data.observations.filter((observation) => observation.studentId === student.id).sort((first, second) => String(second.date).localeCompare(String(first.date)) || new Date(second.createdAt) - new Date(first.createdAt)); }
function compactDate(value) { const key = localDateKey(value); if (!key) return "날짜 없음"; const [, month, day] = key.split("-"); return `${Number(month)}/${Number(day)}`; }
function studentRepresentativeLabel(student) { const representative = representativeCardInfo(student); return representative ? `${escapeHtml(representative.card.name)} · ${representative.rarity}<br><small>${representative.ability?.name || "특수능력 없음"}</small>` : "대표 카드 없음"; }
function studentManagementCard(student) { const number = studentNumber(student); const assignments = activeAssignmentSummary(student); const roles = todayRoleSummary(student); const observations = studentObservations(student); const assignmentLabel = assignments.missing || assignments.review ? `미제출 ${assignments.missing} · 확인 대기 ${assignments.review}` : "모두 완료"; const roleLabel = roles.completed || roles.waiting ? `완료 ${roles.completed} · 대기 ${roles.waiting}` : "신청 없음"; return `<button class="student-overview-card" data-action="open-student-detail" data-id="${student.id}"><div class="student-overview-heading"><strong>${number}번 ${escapeHtml(student.name)}</strong><span>${student.points}P</span></div><dl><div><dt>과제</dt><dd>${assignmentLabel}</dd></div><div><dt>오늘 1인1역</dt><dd>${roleLabel}</dd></div><div><dt>학생 관찰 기록</dt><dd>${observations.length ? `${observations.length}건 · 최근 ${compactDate(observations[0].date)}` : "기록 없음"}</dd></div><div><dt>대표 카드</dt><dd>${studentRepresentativeLabel(student)}</dd></div></dl></button>`; }
function isThisWeek(value) { if (!value) return false; let date = new Date(value); if (Number.isNaN(date.getTime())) { const key = localDateKey(value); date = key ? new Date(`${key}T00:00:00`) : date; } return !Number.isNaN(date.getTime()) && date >= weekStart() && date <= new Date(); }
function weeklyEarnedPoints(student) { return (student.pointHistory || []).reduce((sum, item) => sum + (["1인1역", "과제"].includes(item.source) && isThisWeek(item.createdAt || item.date) ? Number(item.amount) || 0 : 0), 0); }
function studentCollectedTypes(student) { const types = new Set(); Object.keys(student.cards || {}).forEach((cardId) => CARD_RARITIES.forEach((rarity) => { if (rarityInventoryCount(student, cardId, rarity) > 0) types.add(`${cardId}|${rarity}`); })); return types.size; }
function studentDetailAssignments(student) {
  const index = data.students.findIndex((item) => item.id === student.id); const filter = studentDetailAssignmentFilters[student.id] || "all";
  const row = (assignment) => `<article><div><span class="subject-badge">${escapeHtml(assignment.subject)}</span><strong>${escapeHtml(assignment.title)}</strong></div><small>마감 ${assignment.dueDate || "날짜 없음"}</small><span class="pill ${assignmentStatusClass(assignment.statuses[index])}">${ASSIGNMENT_STATUS_LABELS[assignment.statuses[index]]}</span></article>`;
  const active = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment)); const shown = active.filter((assignment) => filter === "all" || assignment.statuses[index] === filter); const past = data.assignments.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
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
  return `<div class="student-detail-list">${recent.map((application) => { const role = roleById(application.roleId); return `<article><div><strong>${escapeHtml(role?.name || "삭제된 역할")}</strong><span class="pill success">완료</span></div><small>${compactDate(application.completedAt)} · 기본 ${application.awardedBasePoints ?? role?.points ?? 0}P</small></article>`; }).join("")}</div>`;
}
function studentRoleTrend(student) {
  const stats = studentRoleFourWeekStats(student); const max = Math.max(1, ...stats.weeks.map((week) => week.count));
  const chart = stats.recentFourWeeks ? `<div class="role-week-chart">${stats.weeks.map((week, index) => `<div class="role-week-row ${index === 3 ? "current" : ""}"><strong>${week.label}</strong><div class="role-week-track"><span style="width:${week.count ? Math.max(8, Math.round((week.count / max) * 100)) : 0}%"></span></div><b>${week.count}회</b><small>${week.range}</small></div>`).join("")}</div>` : `<div class="empty">최근 4주 역할 수행 기록이 없습니다.</div>`;
  return `<div class="role-trend-summary"><div><span>이번 주</span><strong>${stats.thisWeek}회</strong></div><div><span>최근 4주</span><strong>${stats.recentFourWeeks}회</strong></div><div><span>전체 완료</span><strong>${stats.total}회</strong></div></div><h3 class="student-detail-subheading">최근 4주 역할 수행</h3>${chart}<div class="section-heading role-history-heading"><h3>최근 완료 기록</h3><span class="muted">최대 5개</span></div>${studentRoleHistory(student, stats.completed)}`;
}
function studentDetailObservations(student) { const observations = studentObservations(student); return observations.length ? `<div class="student-detail-list">${observations.slice(0, 5).map((observation) => `<article><div><strong>${observation.date}</strong><span class="pill">${escapeHtml(observation.category)}</span></div>${observation.quickItems?.length ? `<small>${observation.quickItems.map((item) => `#${escapeHtml(item)}`).join(" ")}</small>` : ""}<p>${escapeHtml(observation.content)}</p></article>`).join("")}</div>` : `<div class="empty">학생 관찰 기록이 없습니다.</div>`; }
function studentDetailPoints(student) { const history = (student.pointHistory || []).slice(-5).reverse(); return `<div class="student-current-points"><span>현재 포인트</span><strong>${student.points}P</strong></div>${history.length ? `<div class="student-detail-list">${history.map((item) => `<article class="student-point-row"><div><strong>${escapeHtml(item.source || item.reason)}</strong><small>${compactDate(item.createdAt || item.date)}</small></div><b class="${item.amount > 0 ? "points" : ""}">${item.amount > 0 ? "+" : ""}${item.amount}P</b></article>`).join("")}</div>` : `<div class="empty">포인트 거래 기록이 없습니다.</div>`}`; }
function studentRecordSection(title, summary, content, action = "") { return `<details class="card student-detail-section record-section" open><summary><span>${title}</span><small>${summary}</small></summary><div class="record-section-content">${content}${action}</div></details>`; }
function teacherStudentDetail(student) {
  const assignments = activeAssignmentSummary(student); const observations = studentObservations(student); const roleStats = studentRoleFourWeekStats(student); const representative = representativeCardInfo(student); const pointCount = (student.pointHistory || []).length; const assignmentFilter = studentDetailAssignmentFilters[student.id] || "all";
  const assignmentButtons = [["all", "전체", assignments.active.length], ["missing", "미제출", assignments.missing], ["review", "확인 대기", assignments.review], ["submitted", "제출 완료", assignments.submitted]].map(([value, label, count]) => `<button class="student-assignment-filter ${assignmentFilter === value ? "active" : ""}" data-action="filter-student-detail-assignments" data-id="${student.id}" data-status="${value}">${label} ${count}</button>`).join("");
  const cardsSummary = `<p><strong>대표 카드:</strong> ${studentRepresentativeLabel(student)}</p><p><strong>수집 카드 종류:</strong> ${studentCollectedTypes(student)}종 · 총 ${cardCount(student)}장</p>`;
  return `<div class="student-detail-page"><div class="section-heading"><div><button class="button secondary compact" data-action="close-student-detail">← 학생 목록</button><h1 class="page-heading">${studentNumber(student)}번 ${escapeHtml(student.name)}</h1><p class="page-description">학생 한 명을 중심으로 현재 상태와 최근 기록을 확인합니다.</p></div></div><section class="student-profile-summary card"><div><span>현재 포인트</span><strong>${student.points}P</strong></div><div><span>대표 카드</span><strong>${representative ? `${escapeHtml(representative.card.name)} · ${representative.rarity}` : "없음"}</strong><small>${representative?.ability?.name || ""}</small></div><div><span>수집 카드 종류</span><strong>${studentCollectedTypes(student)}종</strong></div></section><div class="student-recent-summary"><article class="student-assignment-summary"><span>진행 중 과제</span><div class="student-assignment-filters">${assignmentButtons}</div></article><article><span>이번 주 1인1역</span><strong>완료 ${roleStats.thisWeek}회</strong></article><article><span>이번 주 획득 포인트</span><strong>${weeklyEarnedPoints(student)}P</strong></article><article><span>학생 관찰 기록</span><strong>총 ${observations.length}건</strong></article></div><div class="student-detail-grid">${studentRecordSection("과제", `${assignments.active.length}개 중 ${assignmentFilter === "all" ? "전체" : ASSIGNMENT_STATUS_LABELS[assignmentFilter]} 보기`, studentDetailAssignments(student), `<button class="button secondary compact record-view-all" data-action="view-student-assignments" data-id="${student.id}">전체 보기</button>`)}${studentRecordSection("1인1역", `이번 주 완료 ${roleStats.thisWeek}회 · 최근 4주 ${roleStats.recentFourWeeks}회`, studentRoleTrend(student), roleStats.total > 5 ? `<button class="button secondary compact record-view-all" data-action="navigate" data-view="roles">전체 기록 보기</button>` : "")}${studentRecordSection("학생 관찰 기록", `총 ${observations.length}건 · 최근 최대 5건`, studentDetailObservations(student), `<button class="button secondary compact record-view-all" data-action="manage-student-observations" data-id="${student.id}">전체 보기</button>`)}${studentRecordSection("포인트", `현재 ${student.points}P · 최근 ${Math.min(5, pointCount)}건`, studentDetailPoints(student), `<button class="button secondary compact record-view-all" data-action="navigate" data-view="points">전체 보기</button>`)}${studentRecordSection("카드", `${studentCollectedTypes(student)}종 · 총 ${cardCount(student)}장`, cardsSummary, `<button class="button secondary compact record-view-all" data-action="navigate" data-view="cards">전체 보기</button>`)}</div></div>`;
}
function teacherStudents() { const selected = studentById(studentDetailId); if (selected && selected.active !== false) return teacherStudentDetail(selected); const keyword = studentManagementSearch.trim().toLocaleLowerCase("ko-KR"); const students = activeStudents().filter((student) => !keyword || student.name.toLocaleLowerCase("ko-KR").includes(keyword) || String(studentNumber(student)).includes(keyword)); return `<div class="section-heading"><div><h1 class="page-heading">학생 관리</h1><p class="page-description">전체 학생의 객관적인 현재 상태를 한눈에 확인하세요.</p></div></div><div class="student-management-search"><input id="student-management-search" value="${escapeHtml(studentManagementSearch)}" placeholder="학생 이름 또는 번호 검색" aria-label="학생 이름 또는 번호 검색"><button class="button secondary compact" data-action="reset-student-management-search">초기화</button><span id="student-management-count">${students.length}명</span></div><div class="student-overview-grid">${students.map(studentManagementCard).join("") || `<div class="empty">검색 결과가 없습니다.</div>`}</div>`; }

function teacherClassSettingsBase() {
  const keyword = classStudentSearch.trim().toLocaleLowerCase("ko-KR");
  const students = activeStudents().filter((student) => !keyword || String(studentNumber(student)).includes(keyword) || student.name.toLocaleLowerCase("ko-KR").includes(keyword) || student.loginId.toLocaleLowerCase("en-US").includes(keyword));
  const rows = students.map((student) => `<tr data-class-student-id="${student.id}"><td>${studentNumber(student)}</td><td><strong>${escapeHtml(student.name)}</strong></td><td><code>${escapeHtml(student.loginId)}</code></td><td><div class="button-row class-student-actions"><button class="button secondary compact" data-action="edit-class-student" data-id="${student.id}">수정</button><button class="button danger compact" data-action="ask-delete-class-student" data-id="${student.id}">삭제</button></div></td></tr>`).join("");
  return `<div class="section-heading"><div><h1 class="page-heading">학급 설정</h1><p class="page-description">우리 반 기본 정보와 모든 기능에서 함께 사용하는 학생 명단을 관리합니다.</p></div></div><section class="card class-settings-card"><h2>학급 정보</h2><form id="class-info-form" class="class-info-form"><label>프로그램 이름<input name="appName" maxlength="50" value="${escapeHtml(data.classSettings.appName)}" required placeholder="예: 우리반 퀘스트"></label><label>학급 이름<input name="className" maxlength="50" value="${escapeHtml(data.classSettings.className)}" required placeholder="예: 5학년 2반"></label><label>선생님 표시 이름<input name="teacherName" maxlength="30" value="${escapeHtml(data.classSettings.teacherName)}" required placeholder="예: 윤석훈"></label><button class="button success" type="submit">저장</button></form></section><section class="card class-roster-card"><div class="section-heading"><div><h2>학생 명단 <span class="muted">총 ${activeStudents().length}명</span></h2><p class="muted">번호와 이름은 바꿀 수 있지만 학생 ID와 연결된 기존 기록은 그대로 유지됩니다.</p></div><div class="button-row"><button class="button secondary" data-action="open-bulk-students">학생 일괄 등록</button><button class="button success" data-action="new-class-student">+ 학생 추가</button></div></div><div class="class-student-search"><input id="class-student-search" type="search" value="${escapeHtml(classStudentSearch)}" placeholder="번호, 이름 또는 로그인 ID 검색"><span>${students.length}명 표시</span></div><div class="class-roster-table-wrap"><table class="class-roster-table"><thead><tr><th>번호</th><th>이름</th><th>로그인 ID</th><th>관리</th></tr></thead><tbody>${rows || `<tr><td colspan="4"><div class="empty">검색 결과가 없습니다.</div></td></tr>`}</tbody></table></div><p class="class-login-note">학생 로그인과 비밀번호 관리는 Firebase 연결 후 사용할 수 있습니다. 현재는 비밀번호를 저장하지 않습니다.</p></section>`;
}

function classFeatureSettings() {
  const items = CLASS_FEATURES.map((feature) => `<label class="class-feature-row"><span><strong>${feature.label}</strong><small>${feature.description}</small></span><span class="feature-toggle"><input type="checkbox" name="${feature.key}" ${featureEnabled(feature.key) ? "checked" : ""}><b>${featureEnabled(feature.key) ? "사용" : "사용 안 함"}</b></span></label>`).join("");
  return `<section class="card class-feature-settings"><div class="section-heading"><div><h2>기능 사용 설정</h2><p class="muted">이 학급에서 사용할 기능만 선택하세요. 기능을 꺼도 기존 데이터는 삭제되지 않습니다.</p></div></div><form id="class-feature-form"><div class="class-feature-list">${items}</div><div class="button-row"><button class="button success" type="submit">기능 설정 저장</button></div></form><p class="class-core-features">대시보드 · 학생 관리 · 관찰 기록 · 학급 설정은 항상 사용할 수 있습니다.</p></section>`;
}
function teacherClassSettings() { return `${teacherClassSettingsBase()}${classFeatureSettings()}`; }

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
  return `<h1 class="page-heading">1인1역 관리</h1><p class="page-description">오늘의 신청을 승인하고, 역할 구성과 템플릿을 관리할 수 있습니다.</p><section class="card role-limit-settings"><div><h2>하루 최대 신청 개수</h2><p class="muted">학생 한 명이 하루에 신청할 수 있는 최대 역할 수입니다. 기존 신청은 자동으로 취소되지 않습니다.</p></div><form id="role-limit-form" class="inline-form"><input name="limit" type="number" min="1" max="5" step="1" required value="${data.dailyRoleApplicationLimit}" aria-label="하루 최대 신청 개수"><span>개</span><button class="button" type="submit">저장</button></form></section><section class="management-section"><div class="section-heading"><div><h2>오늘 신청 현황</h2><p class="muted">완료를 누르면 학생에게 포인트가 한 번만 지급됩니다.</p></div></div>${teacherRoleList()}</section><section class="card management-section"><div class="section-heading"><div><h2>오늘의 역할 수정</h2><p class="muted">여기에서 바꾼 내용은 오늘만 적용되고 저장된 템플릿은 바뀌지 않습니다.</p></div><button class="button success" data-action="add-role" data-scope="today">+ 오늘 역할 추가</button></div>${roleEditorList(data.currentRoles, "today")}</section><section class="card management-section"><h2>현재 역할을 새 템플릿으로 저장</h2><form id="template-save-form" class="inline-form"><input name="name" maxlength="40" required placeholder="예: 우리 반 기본 1인1역"><button class="button" type="submit">템플릿 저장</button></form></section><section class="management-section"><div class="section-heading"><div><h2>역할 템플릿 관리</h2><p class="muted">저장된 템플릿은 브라우저를 다시 열어도 유지됩니다.</p></div></div><div class="template-grid">${data.roleTemplates.map((template) => `<article class="card template-card"><div><h3>${escapeHtml(template.name)}</h3><p class="muted">역할 ${template.roles.length}개</p></div><div class="button-row"><button class="button success" data-action="load-template" data-id="${template.id}">오늘의 역할로 불러오기</button><button class="button secondary" data-action="edit-template" data-id="${template.id}">템플릿 수정</button><button class="button secondary" data-action="rename-template" data-id="${template.id}">이름 변경</button><button class="button secondary" data-action="duplicate-template" data-id="${template.id}">복제</button><button class="button danger" data-action="delete-template" data-id="${template.id}">삭제</button></div></article>`).join("")}</div></section>${templateEditor()}`;
}

function assignmentMatchesFilter(assignment) {
  if (isAssignmentCompleted(assignment)) return false;
  const reviewCount = assignment.statuses.filter((status) => status === "review").length;
  const weekStartKey = localDateKey(weekStart());
  const weekEndDate = new Date(weekStart()); weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEndKey = localDateKey(weekEndDate);
  if (assignmentFilter === "review" && reviewCount < 1) return false;
  if (assignmentFilter === "missing" && !assignment.statuses.some((status) => status === "missing")) return false;
  if (assignmentFilter === "today" && assignment.dueDate !== todayString()) return false;
  if (assignmentFilter === "week" && (!assignment.dueDate || assignment.dueDate < weekStartKey || assignment.dueDate > weekEndKey)) return false;
  if (assignmentFilter === "important" && !assignment.important) return false;
  if (assignmentSubjectFilter && assignment.subject !== assignmentSubjectFilter) return false;
  if (assignmentSearch && !assignment.title.toLocaleLowerCase("ko-KR").includes(assignmentSearch.toLocaleLowerCase("ko-KR"))) return false;
  return true;
}

function activeAssignmentPriority(first, second) {
  const firstReview = first.statuses.filter((status) => status === "review").length;
  const secondReview = second.statuses.filter((status) => status === "review").length;
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
  const submittedCount = assignment.statuses.filter((status) => status === "submitted").length;
  const reviewCount = assignment.statuses.filter((status) => status === "review").length;
  const missingCount = assignment.statuses.length - submittedCount - reviewCount;
  const stateAction = assignment.assignmentState === "completed"
    ? `<button class="button secondary compact" data-action="ask-reopen-assignment" data-id="${assignment.id}">다시 열기</button>`
    : `<button class="button gold compact" data-action="ask-complete-assignment" data-id="${assignment.id}">과제 완료</button>`;
  const completedLabel = assignment.assignmentState === "completed" ? `<span class="pill success">과제 완료일 ${formatCompletedAt(assignment.completedAt)}</span>` : "";
  const expanded = expandedAssignmentId === assignment.id;
  const statusFilter = assignmentStudentStatusFilters[assignment.id] || "all";
  const studentRows = data.students.map((student, studentIndex) => ({ student, studentIndex, status: assignment.statuses[studentIndex] })).filter((item) => statusFilter === "all" || item.status === statusFilter);
  const statusFilters = [["all", "전체", data.students.length], ["review", "확인 대기", reviewCount], ["missing", "미제출", missingCount], ["submitted", "제출 완료", submittedCount]];
  const studentDetails = `<div class="assignment-student-details"><div class="assignment-status-filters">${statusFilters.map(([value, label, count]) => `<button class="button compact ${statusFilter === value ? "active" : "secondary"}" data-action="filter-assignment-students" data-id="${assignment.id}" data-status="${value}">${label} ${count}</button>`).join("")}</div>${studentRows.length ? `<div class="assignment-student-list">${studentRows.map(({ student, studentIndex, status }) => { const reviewActions = status === "review" ? `<div class="review-actions"><button class="button success compact" data-action="review-assignment" data-assignment="${assignment.id}" data-student="${studentIndex}" data-status="submitted">제출 확인</button><button class="button danger compact" data-action="review-assignment" data-assignment="${assignment.id}" data-student="${studentIndex}" data-status="missing">반려</button></div>` : ""; return `<div class="assignment-student-row ${status === "review" ? "needs-review" : ""}"><label class="student-check"><input type="checkbox" data-action="select-assignment-student" data-assignment="${assignment.id}" data-student="${studentIndex}" ${selected.has(studentIndex) ? "checked" : ""}><span>${studentIndex + 1}. ${escapeHtml(student.name)}</span></label><div class="student-status-actions"><button class="status-button ${assignmentStatusClass(status)}" data-action="cycle-assignment-status" data-assignment="${assignment.id}" data-student="${studentIndex}">${ASSIGNMENT_STATUS_LABELS[status]}</button>${reviewActions}</div></div>`; }).join("")}</div>` : `<div class="empty">이 상태의 학생이 없습니다.</div>`}<div class="button-row assignment-bulk-actions"><button class="button success compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="submitted" data-scope="selected" ${selected.size ? "" : "disabled"}>선택 학생 제출 처리</button><button class="button secondary compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="submitted" data-scope="all">전체 제출</button><button class="button secondary compact" data-action="ask-bulk-assignment" data-id="${assignment.id}" data-status="missing" data-scope="all">전체 미제출</button></div></div>`;
  return `<article class="card assignment-manage-card ${assignment.important ? "important" : ""} ${reviewCount ? "has-review" : ""}"><div class="assignment-card-top"><div><div class="assignment-labels"><span class="subject-badge">${escapeHtml(assignment.subject)}</span>${assignment.important ? `<span class="important-mark">★ 중요</span>` : ""}${assignment.points > 0 ? `<span class="pill assignment-points-badge">완료 시 ${assignment.points}P</span>` : ""}<span class="pill ${assignment.dueDate === todayString() ? "waiting" : ""}">마감 ${formatDueDate(assignment.dueDate)}</span>${completedLabel}</div><h2>${escapeHtml(assignment.title)}</h2>${assignment.description ? `<p class="muted">${escapeHtml(assignment.description)}</p>` : ""}</div></div><div class="assignment-counts"><button class="count-submitted" data-action="open-assignment-status" data-id="${assignment.id}" data-status="submitted">제출 완료 <strong>${submittedCount}명</strong></button><button class="count-review ${reviewCount ? "attention" : ""}" data-action="open-assignment-status" data-id="${assignment.id}" data-status="review">확인 대기 <strong>${reviewCount}명</strong></button><button class="count-missing" data-action="open-assignment-status" data-id="${assignment.id}" data-status="missing">미제출 <strong>${missingCount}명</strong></button></div><div class="assignment-card-actions"><button class="button secondary compact" data-action="toggle-assignment-details" data-id="${assignment.id}">${expanded ? "학생 현황 닫기" : "전체 학생 보기"}</button><button class="button secondary compact" data-action="edit-assignment" data-id="${assignment.id}">수정</button><button class="button secondary compact" data-action="duplicate-assignment" data-id="${assignment.id}">복제</button>${stateAction}<button class="button danger compact" data-action="ask-delete-assignment" data-id="${assignment.id}">삭제</button></div>${expanded ? studentDetails : ""}</article>`;
}

function teacherStudentAssignmentView(studentId) {
  const studentIndex = data.students.findIndex((student) => student.id === studentId); const student = data.students[studentIndex];
  const submitted = data.assignments.filter((assignment) => assignment.statuses[studentIndex] === "submitted").length;
  const missing = data.assignments.filter((assignment) => assignment.statuses[studentIndex] === "missing").length;
  const review = data.assignments.length - submitted - missing;
  return `<section class="student-assignment-overview"><h2>${student.name} 과제 현황</h2><div class="grid four assignment-summary"><article class="card"><span class="muted">전체 과제</span><strong class="big-number">${data.assignments.length}개</strong></article><article class="card"><span class="muted">제출 완료</span><strong class="big-number">${submitted}개</strong></article><article class="card"><span class="muted">미제출</span><strong class="big-number">${missing}개</strong></article><article class="card"><span class="muted">확인 대기</span><strong class="big-number">${review}개</strong></article></div><div class="list">${data.assignments.map((assignment) => `<div class="list-row"><div class="list-main"><strong>${escapeHtml(assignment.title)}</strong><small class="muted">${escapeHtml(assignment.subject)} · ${formatDueDate(assignment.dueDate)}</small></div><span class="pill ${assignmentStatusClass(assignment.statuses[studentIndex])}">${ASSIGNMENT_STATUS_LABELS[assignment.statuses[studentIndex]]}</span></div>`).join("")}</div></section>`;
}

function teacherAssignments() {
  const allActive = data.assignments.filter((assignment) => !isAssignmentCompleted(assignment));
  const active = allActive.filter(assignmentMatchesFilter).sort(activeAssignmentPriority);
  const allCompleted = data.assignments.filter(isAssignmentCompleted).sort(sortCompletedAssignments);
  const completed = showAllCompletedAssignments ? allCompleted.filter(completedAssignmentMatches) : allCompleted;
  const shownCompleted = showAllCompletedAssignments ? completed : completed.slice(0, 5);
  const reviewAssignments = allActive.filter((assignment) => assignment.statuses.some((status) => status === "review")).length;
  const todayDue = allActive.filter((assignment) => assignment.dueDate === todayString()).length;
  const missingAssignments = allActive.filter((assignment) => assignment.statuses.some((status) => status === "missing")).length;
  const subjects = [...new Set(data.assignments.map((assignment) => assignment.subject).filter(Boolean))].sort((first, second) => first.localeCompare(second, "ko-KR"));
  const quickFilters = [["all", "전체"], ["review", "확인 필요"], ["today", "오늘 마감"], ["week", "이번 주"], ["important", "중요"]];
  const summary = `<section class="assignment-overview-grid"><button data-action="set-assignment-filter" data-filter="review"><span>확인 필요한 과제</span><strong>${reviewAssignments}개</strong></button><button data-action="set-assignment-filter" data-filter="today"><span>오늘 마감</span><strong>${todayDue}개</strong></button><button data-action="set-assignment-filter" data-filter="missing"><span>미제출 학생이 있는 과제</span><strong>${missingAssignments}개</strong></button><button data-action="set-assignment-filter" data-filter="all"><span>진행 중 과제</span><strong>${allActive.length}개</strong></button></section>`;
  const toolbar = `<section class="card assignment-toolbar"><div class="assignment-quick-filters" aria-label="빠른 과제 필터">${quickFilters.map(([value, label]) => `<button class="button compact ${assignmentFilter === value ? "active" : "secondary"}" data-action="set-assignment-filter" data-filter="${value}">${label}</button>`).join("")}</div><label>과목<select id="assignment-subject-filter"><option value="">전체 과목</option>${subjects.map((subject) => `<option value="${escapeHtml(subject)}" ${assignmentSubjectFilter === subject ? "selected" : ""}>${escapeHtml(subject)}</option>`).join("")}</select></label><label>과제 제목 검색<input id="assignment-search" value="${escapeHtml(assignmentSearch)}" placeholder="과제 제목을 입력하세요"></label><label>학생별 보기<select id="assignment-student-view"><option value="">학생을 선택하세요</option>${data.students.map((student) => `<option value="${student.id}" ${assignmentStudentView === student.id ? "selected" : ""}>${student.name}</option>`).join("")}</select></label><button class="button secondary compact assignment-filter-reset" data-action="reset-assignment-filters">조건 초기화</button></section>`;
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
  return `<h1 class="page-heading">포인트 관리</h1><p class="page-description">학생을 여러 명 선택하고 같은 포인트를 빠르게 지급하거나 차감하세요.</p><section class="card point-quick-panel"><div class="point-selection-heading"><strong>선택 학생 <span id="point-selected-count">${selectedPointStudentIds.size}</span>명</strong><div class="button-row"><button class="button secondary compact" data-action="select-all-point-students">전체 선택</button><button class="button secondary compact" data-action="clear-point-students">선택 해제</button></div></div><div class="point-quick-actions"><div><strong>빠른 지급</strong><div class="button-row">${quickAmounts.map((amount) => `<button class="button success compact" data-action="quick-teacher-points" data-amount="${amount}">+${amount}P</button>`).join("")}</div></div><div><strong>빠른 차감</strong><div class="button-row">${quickAmounts.map((amount) => `<button class="button danger compact" data-action="quick-teacher-points" data-amount="-${amount}">-${amount}P</button>`).join("")}</div></div><form id="point-bulk-form" class="point-direct-form"><label>직접 입력<input name="amount" type="number" min="1" step="1" value="1" required></label><div class="button-row"><button class="button success compact" type="submit" data-kind="add">지급</button><button class="button danger compact" type="submit" data-kind="subtract">차감</button></div></form></div></section><div class="point-student-grid">${data.students.map((student) => `<label class="point-student-card ${selectedPointStudentIds.has(student.id) ? "selected" : ""}"><input type="checkbox" data-action="toggle-point-student" data-id="${student.id}" ${selectedPointStudentIds.has(student.id) ? "checked" : ""}><span>${escapeHtml(student.name)}</span><strong>${student.points}P</strong></label>`).join("")}</div>`;
}

function applyTeacherPointChange(amount) {
  if (!Number.isInteger(amount) || amount === 0) return;
  const students = data.students.filter((student) => selectedPointStudentIds.has(student.id));
  if (!students.length) { toast("포인트를 처리할 학생을 먼저 선택해 주세요."); return; }
  if (amount < 0) {
    const insufficient = students.filter((student) => student.points < Math.abs(amount));
    if (insufficient.length) {
      app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>포인트를 차감할 수 없습니다</h2><p><strong>${escapeHtml(insufficient.map((student) => student.name).join(", "))}</strong>의 포인트가 부족합니다.</p><p class="muted">선택한 학생 모두에게서 포인트를 차감하지 않았습니다.</p><div class="button-row"><button class="button secondary" type="button" data-action="close-modal">확인</button></div></section></div>`); return;
    }
  }
  const source = amount > 0 ? "교사 직접 지급" : "교사 직접 차감";
  students.forEach((student) => {
    student.points += amount;
    student.pointHistory.push({ id: crypto.randomUUID(), amount, reason: source, source, date: new Date().toLocaleDateString("ko-KR") });
  });
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
  const drawOptions = data.drawOptions.filter((option) => !option.deleted).map((option) => `<article class="draw-option-manage-card"><div class="teacher-card-top"><span class="pill ${option.active ? "success" : "danger"}">${option.active ? "사용 중" : "사용 중지"}</span><strong>${option.price}P</strong></div><h3>${escapeHtml(option.name)}</h3><div class="draw-option-rate-summary">${CARD_RARITIES.map((rarity) => `<span>${rarity} <strong>${drawRate(rarity, option.rates)}%</strong></span>`).join("")}</div><div class="button-row"><button class="button secondary compact" data-action="edit-draw-option" data-id="${option.id}">수정</button><button class="button ${option.active ? "danger" : "success"} compact" data-action="toggle-draw-option" data-id="${option.id}">${option.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="ask-delete-draw-option" data-id="${option.id}">삭제</button></div></article>`).join("");
  const upgradeInputs = CARD_UPGRADE_STEPS.map((step) => `<label><span>${step.from} → ${step.to}</span><span class="upgrade-setting-input"><input name="${step.key}" type="number" min="2" step="1" value="${data.cardUpgradeSettings[step.key]}" required><b>장</b></span></label>`).join("");
  const abilityInputs = CARD_RARITIES.map((rarity) => { const setting = cardAbilitySetting(rarity); return `<fieldset class="ability-rarity-card"><legend>${rarity}</legend>${CARD_ABILITIES.map((ability) => { const abilitySetting = setting.abilities[ability.id]; return `<label><strong>${ability.icon} ${ability.name}</strong><span>${ability.description} + <input name="${CARD_RATE_KEYS[rarity]}-${ability.id}" type="number" min="0" max="100" step="1" value="${ability.id === "responsibility" ? abilitySetting.rolePercent : abilitySetting.assignmentPercent}" required> %</span></label>`; }).join("")}<label class="daily-cap-row"><strong>하루 최대 보너스</strong><span>+ <input name="${CARD_RATE_KEYS[rarity]}-dailyCap" type="number" min="0" step="1" value="${setting.dailyCap}" required> P</span></label></fieldset>`; }).join("");
  const setRows = cardSets.map((cardSet) => `<article class="card-set-item ${cardSet.id === teacherCardSetId ? "selected" : ""}"><button class="card-set-select" data-action="select-card-set" data-id="${cardSet.id}"><strong>${escapeHtml(cardSet.name)}</strong><small>${escapeHtml(cardSet.description || "설명 없음")}</small><span>${sortedCards(false, cardSet.id).length}명 · ${cardSet.active ? "사용 중" : "사용 중지"}</span></button><label class="card-set-draw-toggle"><input type="checkbox" data-action="toggle-card-set-selection" data-id="${cardSet.id}" ${data.activeCardSetIds.includes(cardSet.id) ? "checked" : ""} ${!cardSet.active ? "disabled" : ""}><span>카드 뽑기에 사용</span></label><div class="button-row"><button class="button secondary compact" data-action="edit-card-set" data-id="${cardSet.id}">이름 수정</button><button class="button secondary compact" data-action="duplicate-card-set" data-id="${cardSet.id}">복제</button><button class="button ${cardSet.active ? "danger" : "success"} compact" data-action="toggle-card-set" data-id="${cardSet.id}">${cardSet.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="ask-delete-card-set" data-id="${cardSet.id}">삭제</button></div></article>`).join("");
  const personCards = cards.map((card) => `<article class="teacher-card-item"><div class="teacher-card-top"><span class="pill">5개 등급·3개 능력</span><span class="pill ${card.active ? "success" : "danger"}">${card.active ? "사용 중" : "사용 중지"}</span></div><h3>${escapeHtml(card.name)}</h3><p class="muted">${escapeHtml(card.era)}</p><small>${escapeHtml(card.achievement)}</small><div class="button-row"><button class="button secondary compact" data-action="edit-card" data-id="${card.id}">수정</button><button class="button ${card.active ? "danger" : "success"} compact" data-action="toggle-card-active" data-id="${card.id}">${card.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="ask-delete-card" data-id="${card.id}">삭제</button></div></article>`).join("");
  return `<div class="section-heading card-page-heading"><div><h1 class="page-heading">카드 관리</h1><p class="page-description">전체 규칙을 정한 뒤 카드셋과 인물 카드를 관리하세요.</p></div></div><section class="management-section"><div class="section-heading"><div><h2>1. 뽑기 옵션·가격·등급 확률</h2></div><button class="button success" data-action="new-draw-option">+ 새 뽑기 옵션</button></div><div class="draw-option-manage-grid">${drawOptions}</div></section><section class="management-section"><h2>2. 카드 업그레이드 설정</h2><form id="upgrade-settings-form"><div class="upgrade-settings-grid">${upgradeInputs}</div><button class="button success" type="submit">업그레이드 설정 저장</button></form></section><section class="management-section"><h2>3. 특수능력 설정</h2><p class="muted">등급별 능력 보너스와 하루 최대 보너스를 설정하세요.</p><form id="card-ability-settings-form"><div class="special-ability-settings">${abilityInputs}</div><button class="button success" type="submit">특수능력 설정 저장</button></form></section><section class="management-section"><div class="section-heading"><div><h2>4. 카드셋 관리</h2><span class="pill success">뽑기 사용 ${data.activeCardSetIds.length}개</span></div><button class="button success" data-action="new-card-set">+ 새 카드셋 만들기</button></div><div class="card-set-grid">${setRows}</div></section>${selectedSet ? `<section class="management-section"><div class="section-heading"><div><h2>5. ${escapeHtml(selectedSet.name)} 인물 카드</h2><p class="muted">각 인물은 5개 등급과 3개 특수능력을 가질 수 있습니다.</p></div><button class="button success" data-action="new-card" data-set-id="${selectedSet.id}">+ 새 인물 카드 추가</button></div><div class="teacher-card-grid">${personCards || `<div class="empty">이 카드셋에는 인물 카드가 없습니다.</div>`}</div></section>` : ""}<section class="card" style="margin-top:24px"><h2>데모 설정</h2><button class="button danger" data-action="reset-demo">데모 데이터 초기화</button></section>`;
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
function groupAssignmentStudentChip(student) { const selected = selectedGroupAssignmentStudentIds.has(student.id); return `<button class="group-student-chip ${selected ? "selected" : ""}" data-action="toggle-group-assignment-student" data-id="${student.id}" aria-pressed="${selected}"><span>${studentNumber(student)}</span>${escapeHtml(student.name)}</button>`; }
function openGroupAssignmentsModal(resetSelection = true) {
  if (resetSelection) selectedGroupAssignmentStudentIds.clear();
  const groups = activeGroups(); const unassigned = activeStudents().filter((student) => !data.groupAssignments[student.id]); const disabled = selectedGroupAssignmentStudentIds.size ? "" : "disabled";
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card group-assignment-modal"><div class="section-heading"><div><h2>학생 배정</h2><p class="muted">학생을 여러 명 선택한 뒤 이동할 모둠을 눌러 주세요.</p></div></div><section class="group-assignment-toolbar"><strong id="group-assignment-selection-count">${selectedGroupAssignmentStudentIds.size}명 선택됨</strong><span>이동할 곳</span><div class="group-move-buttons">${groups.map((group) => `<button class="button secondary compact" data-action="move-selected-group-students" data-group-id="${group.id}" ${disabled}>${escapeHtml(group.name)}</button>`).join("")}<button class="button danger compact" data-action="move-selected-group-students" data-group-id="" ${disabled}>미배정</button></div><button class="button secondary compact" data-action="clear-group-assignment-selection" ${disabled}>선택 해제</button></section><section class="group-unassigned-panel"><h3>미배정 학생 <span>${unassigned.length}명</span></h3><div class="group-student-chip-list">${unassigned.map(groupAssignmentStudentChip).join("") || `<p class="compact-empty">미배정 학생이 없습니다.</p>`}</div></section><div class="group-assignment-board">${groups.map((group) => { const students = groupMembers(group.id); return `<section><h3>${escapeHtml(group.name)} <span>${students.length}명</span></h3><div class="group-student-chip-list">${students.map(groupAssignmentStudentChip).join("") || `<p class="compact-empty">학생 없음</p>`}</div></section>`; }).join("")}</div><div class="button-row"><button class="button secondary" data-action="close-modal">닫기</button></div></section></div>`);
}
function openGroupMissionsModal() { app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card group-missions-modal"><div class="section-heading"><div><h2>공동 미션 관리</h2><p class="muted">목표 점수가 낮은 순서로 자동 정렬됩니다.</p></div><button class="button success" data-action="new-class-mission">+ 미션 추가</button></div><div class="mission-manage-list">${sortedClassMissions().map(missionManagementCard).join("") || `<div class="empty">등록된 공동 미션이 없습니다.</div>`}</div><div class="button-row"><button class="button secondary" data-action="close-modal">닫기</button></div></section></div>`); }
function openClassMissionModal(missionId = "") { const mission = data.classMissions.find((item) => item.id === missionId); app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="class-mission-form" class="modal-card form" data-id="${missionId}"><h2>${mission ? "공동 미션 수정" : "새 공동 미션"}</h2><label>목표 점수<input name="target" type="number" min="1" step="1" required value="${mission?.target || 500}"></label><label>보상 또는 활동 내용<input name="reward" maxlength="100" required value="${escapeHtml(mission?.reward || "")}" placeholder="예: 우리 반 영화 보기"></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`); }
function openMissionReachedModal(missions) { if (!missions.length) return; app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>🎉 공동 미션 목표 달성!</h2>${missions.map((mission) => `<p><strong>${mission.target}점</strong> · ${escapeHtml(mission.reward)}</p>`).join("")}<p class="muted">모둠활동 화면에서 달성 확정을 할 수 있습니다.</p><button class="button success" data-action="close-modal">확인</button></section></div>`); }
function changeGroupScore(groupId, amount, type = "manual") { const group = groupById(groupId); if (!group?.active || !Number.isInteger(amount) || amount === 0) return; if (group.score + amount < 0) { toast(`${group.name}의 점수가 부족해 차감할 수 없습니다.`); return; } const beforeTotal = classGroupScore(); group.score += amount; data.groupScoreTransactions.push({ id: crypto.randomUUID(), groupId: group.id, groupName: group.name, amount, scoreAfter: group.score, createdAt: new Date().toISOString(), type }); const afterTotal = classGroupScore(); const reached = data.classMissions.filter((mission) => !mission.confirmed && beforeTotal < mission.target && afterTotal >= mission.target); saveData(); render(); toast(`${group.name}에 ${amount > 0 ? "+" : ""}${amount}점을 반영했습니다.`); openMissionReachedModal(reached); }

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
function renderTeacher() {
  const views = { dashboard: teacherDashboard, students: teacherStudents, groups: teacherGroups, roles: teacherRoles, assignments: teacherAssignments, observations: teacherObservations, points: teacherPoints, cards: teacherCardsV2, ranking: teacherRanking, "class-settings": teacherClassSettings };
  if (!teacherNavItems().some(([view]) => view === session.view)) session.view = "class-settings";
  app.innerHTML = shell((views[session.view] || teacherDashboard)(), true);
}
function render() { session.mode === "student" ? renderStudent() : session.mode === "teacher" ? renderTeacher() : renderWelcome(); }

function applyRole(roleId) {
  const active = todayRoleApplicationsForStudent(session.studentId); const limit = data.dailyRoleApplicationLimit;
  const roleApplicants = data.roleApplications.filter((item) => item.roleId === roleId && item.status !== "cancelled");
  const role = roleById(roleId);
  if (active.length >= limit) return toast(`오늘 신청 가능한 1인1역을 모두 신청했습니다. (최대 ${limit}개)`);
  if (roleApplicants.length >= role.capacity) return toast("아쉽지만 이 역할은 모집이 끝났어요.");
  if (roleApplicants.some((item) => item.studentId === session.studentId)) return;
  data.roleApplications.push({ id: crypto.randomUUID(), studentId: session.studentId, roleId, status: "waiting", appliedAt: new Date().toISOString() }); saveData(); render(); toast("역할 신청이 완료됐어요!");
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
  const baseAmount = role.points; const cardAbilityAward = cardBonusAward(student, baseAmount, "1인1역", role.id); const bonusAmount = cardAbilityAward.amount || 0;
  application.status = "completed"; application.completedAt = new Date().toISOString(); application.awardedBasePoints = baseAmount; application.awardedBonusPoints = bonusAmount; application.cardAbilityAward = cardAbilityAward; application.awardedPoints = baseAmount + bonusAmount;
  student.points += baseAmount + bonusAmount;
  student.pointHistory.push({ id: crypto.randomUUID(), amount: baseAmount, reason: `${role.name} 완료`, source: "1인1역", relatedId: role.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() });
  saveData(); render(); toast(`${student.name}에게 ${baseAmount + bonusAmount}P를 지급했습니다.${bonusAmount ? ` (카드 보너스 +${bonusAmount}P)` : ""}`);
}

function undoCompleteRole(id) {
  const application = data.roleApplications.find((item) => item.id === id);
  if (!application || application.status !== "completed") return;
  const student = studentById(application.studentId); const role = roleById(application.roleId);
  if (!student || !role) return;
  const baseToRecover = application.awardedBasePoints ?? application.awardedPoints ?? role.points; const bonusToRecover = application.awardedBonusPoints ?? 0; const pointsToRecover = baseToRecover + bonusToRecover;

  if (!confirm("이 역할의 완료 처리를 취소하시겠습니까?\n지급된 포인트도 함께 회수됩니다.")) return;
  if (application.status !== "completed") return;
  if (student.points < pointsToRecover) {
    alert(`${student.name}의 현재 포인트가 ${student.points}P라서 ${pointsToRecover}P를 회수할 수 없습니다.\n학생의 포인트를 먼저 확인해 주세요.`);
    return;
  }

  student.points -= pointsToRecover;
  application.status = "waiting"; application.completedAt = null;
  application.awardedPoints = 0; application.awardedBasePoints = 0; application.awardedBonusPoints = 0;
  student.pointHistory.push({ id: crypto.randomUUID(), amount: -baseToRecover, reason: `${role.name} 완료 취소`, source: "1인1역", relatedId: role.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() });
  reverseCardBonus(student, application.cardAbilityAward, `${role.name} 완료 카드 보너스 취소`); application.cardAbilityAward = null;
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
  student.points -= option.price; if (!student.cards[figure.id]) student.cards[figure.id] = {}; if (!student.cards[figure.id][rarity]) student.cards[figure.id][rarity] = Object.fromEntries(CARD_ABILITIES.map((item) => [item.id, 0])); student.cards[figure.id][rarity][abilityId] = (student.cards[figure.id][rarity][abilityId] || 0) + 1;
  student.cardAcquisitionHistory.push({ id: crypto.randomUUID(), cardId: figure.id, rarity, abilityId, source: "카드 뽑기", createdAt: new Date().toISOString() });
  student.pointHistory.push({ id: crypto.randomUUID(), amount: -option.price, reason: `${option.name} · ${figure.name} 카드 뽑기`, source: "카드 뽑기", drawOptionId: option.id, drawOptionName: option.name, drawPrice: option.price, date: new Date().toLocaleDateString("ko-KR") }); saveData();
  const card = document.querySelector("#draw-card"); const result = document.querySelector("#draw-result");
  result.className = `draw-face draw-front rarity-${rarityClass(rarity)}`;
  result.innerHTML = `<div><span class="pill">${rarity}</span><h3>${figure.name}</h3><p>${figure.era}</p><strong>${ability.icon} ${ability.name}</strong><small>${abilitySummary(rarity, abilityId).split(" · ")[1]}</small></div>`;
  requestAnimationFrame(() => card.classList.add("revealed"));
  document.querySelector("#draw-current-points").textContent = `${student.points}P`;
  const summaryPoints = document.querySelector(".summary-item strong"); if (summaryPoints) summaryPoints.textContent = `${student.points}P`;
  document.querySelectorAll('[data-action="draw-option"]').forEach((button) => { const item = data.drawOptions.find((candidate) => candidate.id === button.dataset.id); button.disabled = !item || student.points < item.price; button.textContent = button.disabled ? "포인트 부족" : `${item.price}P로 뽑기`; });
  toast(`${option.name}: ${figure.name} ${rarity} · ${ability.name} 카드를 획득했어요.`);
}

function openCardModal(cardId = "", preferredSetId = "") {
  const card = data.cards.find((item) => item.id === cardId);
  const selectedSetId = card?.cardSetId || preferredSetId || teacherCardSetId || data.activeCardSetIds[0];
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="card-form" class="modal-card form" data-id="${cardId}"><h2>${card ? "인물 카드 수정" : "새 인물 카드 추가"}</h2><label>카드셋<select name="cardSetId">${data.cardSets.filter((cardSet) => !cardSet.deleted).map((cardSet) => `<option value="${cardSet.id}" ${cardSet.id === selectedSetId ? "selected" : ""}>${escapeHtml(cardSet.name)}</option>`).join("")}</select></label><label>인물 이름<input name="name" maxlength="40" required value="${card ? escapeHtml(card.name) : ""}" placeholder="예: 장영실"></label><label>시대<input name="era" maxlength="40" required value="${card ? escapeHtml(card.era) : ""}" placeholder="예: 조선"></label><label>한 줄 설명<input name="achievement" maxlength="160" required value="${card ? escapeHtml(card.achievement) : ""}" placeholder="예: 과학 기술 발전에 기여한 발명가"></label><p class="form-help">인물 정보를 한 번만 등록하면 일반·희귀·영웅·전설·고대 등급을 모두 사용할 수 있습니다.</p><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function openCardSetModal(cardSetId = "") {
  const cardSet = cardSetById(cardSetId);
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="card-set-form" class="modal-card form" data-id="${cardSetId}"><h2>${cardSet ? "카드셋 수정" : "새 카드셋 만들기"}</h2><label>카드셋 이름<input name="name" maxlength="50" required value="${cardSet ? escapeHtml(cardSet.name) : ""}" placeholder="예: 조선 시대 인물"></label><label>설명 (선택)<textarea name="description" maxlength="200" placeholder="카드셋을 간단히 설명해 주세요.">${cardSet ? escapeHtml(cardSet.description) : ""}</textarea></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function openDrawOptionModal(optionId = "") {
  const option = data.drawOptions.find((item) => item.id === optionId); const rates = option?.rates || DEFAULT_DRAW_RATES;
  const rateInputs = CARD_RARITIES.map((rarity) => `<label><span>${rarity}</span><span class="rate-input-wrap"><input name="${CARD_RATE_KEYS[rarity]}" type="number" min="0" max="100" step="1" value="${drawRate(rarity, rates)}" required><b>%</b></span></label>`).join("");
  app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="draw-option-form" class="modal-card form" data-id="${optionId}"><h2>${option ? "뽑기 옵션 수정" : "새 뽑기 옵션"}</h2><label>옵션 이름<input name="name" maxlength="40" required value="${option ? escapeHtml(option.name) : ""}" placeholder="예: 고급 뽑기"></label><label>1회 가격<input name="price" type="number" min="0" step="1" required value="${option?.price ?? 50}"></label><fieldset class="draw-option-rate-fieldset"><legend>등급별 확률</legend><div class="draw-rate-grid">${rateInputs}</div></fieldset><div class="draw-rate-total-line"><strong>합계: <span id="draw-rate-total">100</span>%</strong></div><p id="draw-rate-error" class="form-error" hidden>등급별 확률의 합계가 100%가 되어야 합니다.</p><div class="button-row"><button id="draw-rate-save" class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
}

function openDeleteDrawOptionModal(optionId) {
  const option = data.drawOptions.find((item) => item.id === optionId && !item.deleted); if (!option) return;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>뽑기 옵션 삭제</h2><p><strong>${escapeHtml(option.name)}</strong> 옵션을 삭제하시겠습니까?</p><p class="muted">기존 포인트 거래 기록은 그대로 유지됩니다.</p><div class="button-row"><button class="button danger" type="button" data-action="confirm-delete-draw-option" data-id="${option.id}">삭제</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openCardUpgradeModal(cardId, rarity) {
  const student = currentStudent(); const card = data.cards.find((item) => item.id === cardId); const step = upgradeStepFrom(rarity); const required = upgradeRequired(rarity); if (!student || !card || !step || rarityInventoryCount(student, cardId, rarity) < required) return;
  const materialRows = CARD_ABILITIES.map((ability) => { const count = Number(abilityInventory(student, cardId, rarity)[ability.id]) || 0; return count ? `<label class="upgrade-material-row"><span>${ability.icon} ${ability.name} <b>×${count}</b></span><input name="material-${ability.id}" type="number" min="0" max="${count}" step="1" value="0"></label>` : ""; }).join("");
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>카드 업그레이드</h2><p><strong>${escapeHtml(card.name)} ${rarity}</strong> 카드 중 사용할 재료를 정확히 ${required}장 선택해 주세요.</p><div class="upgrade-material-list">${materialRows}</div><p class="muted">결과 카드의 특수능력은 새로 무작위 결정됩니다.</p><div class="button-row"><button class="button success" type="button" data-action="confirm-card-upgrade" data-card-id="${card.id}" data-rarity="${rarity}">${step.to} 카드로 업그레이드</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></section></div>`);
}

function openCollectionCardModal(cardId, rarity, abilityId = "", showBack = false) {
  const student = currentStudent(); const card = data.cards.find((item) => item.id === cardId); if (!student || !card || !CARD_RARITIES.includes(rarity)) return;
  const inventory = abilityInventory(student, card.id, rarity); const ownedAbilities = CARD_ABILITIES.filter((ability) => Number(inventory[ability.id]) > 0); const quantity = rarityInventoryCount(student, card.id, rarity); if (!quantity || !ownedAbilities.length) return;
  const selectedAbility = ownedAbilities.find((ability) => ability.id === abilityId) || ownedAbilities[0]; const selectedCount = Number(inventory[selectedAbility.id]) || 0;
  const representative = student.representativeCard; const equipped = representative?.cardId === card.id && representative?.rarity === rarity && representative?.abilityId === selectedAbility.id;
  const abilityButtons = ownedAbilities.map((ability) => `<button class="collection-ability-chip ${ability.id === selectedAbility.id ? "selected" : ""}" data-action="select-collection-ability" data-card-id="${card.id}" data-rarity="${rarity}" data-ability-id="${ability.id}">${ability.icon} ${ability.name} ×${Number(inventory[ability.id]) || 0}</button>`).join("");
  const step = upgradeStepFrom(rarity); const needed = upgradeRequired(rarity); const upgradeControl = step ? quantity >= needed ? `<button class="button secondary compact" data-action="ask-upgrade-card" data-card-id="${card.id}" data-rarity="${rarity}">⬆ ${step.to}로 업그레이드</button>` : `<span class="muted">업그레이드 ${quantity} / ${needed}장</span>` : `<span class="muted">최고 등급 카드</span>`;
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card collection-card-modal"><div class="section-heading"><div><h2>카드 상세</h2><p class="muted">카드 또는 뒤집기 버튼을 눌러 앞·뒷면을 확인하세요.</p></div><button class="icon-button" data-action="close-modal" aria-label="카드 상세 닫기">×</button></div><div class="collection-detail-stage ${showBack ? "show-back" : ""}" data-action="flip-collection-card" role="button" tabindex="0" aria-label="카드 앞뒷면 전환"><article class="collection-detail-face collection-detail-front rarity-${rarityClass(rarity)}"><span class="collection-detail-emblem">★</span><span class="pill rarity-${rarityClass(rarity)}">${rarity}</span><h2>${escapeHtml(card.name)}</h2><small>${escapeHtml(card.era)}</small><p>${escapeHtml(card.achievement)}</p><strong>보유 ${quantity}장</strong>${equipped ? `<span class="representative-card-mark">대표 카드</span>` : ""}</article><article class="collection-detail-face collection-detail-back rarity-${rarityClass(rarity)}"><span class="pill rarity-${rarityClass(rarity)}">${rarity}</span><div class="collection-detail-ability-icon">${selectedAbility.icon}</div><h2>${selectedAbility.name}</h2><p>${abilitySummary(rarity, selectedAbility.id).split(" · ")[1]}</p><strong>이 능력 보유 ${selectedCount}장</strong>${equipped ? `<span class="representative-card-mark">대표 카드</span>` : ""}</article></div><div class="collection-modal-controls"><button class="button" data-action="flip-collection-card">${showBack ? "앞면 보기" : "뒤집기"}</button><div class="collection-ability-picker"><strong>보유 능력 선택</strong><div>${abilityButtons}</div></div><div class="button-row"><button class="button ${equipped ? "secondary" : "success"} compact" data-action="equip-representative-card" data-card-id="${card.id}" data-rarity="${rarity}" data-ability-id="${selectedAbility.id}" ${equipped ? "disabled" : ""}>${equipped ? "대표 카드 ✓" : "대표 카드로 설정"}</button>${upgradeControl}</div></div></section></div>`);
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
    const baseAmount = award.baseAmount ?? award.amount; const bonusAmount = award.bonusAmount ?? 0;
    student.points -= award.amount;
    student.pointHistory.push({ id: crypto.randomUUID(), amount: -baseAmount, reason: `${assignment.title} 제출 완료 취소`, source: "과제", relatedId: assignment.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() });
    reverseCardBonus(student, award.cardAbilityAward, `${assignment.title} 제출 완료 카드 보너스 취소`);
    assignment.pointAwards[student.id] = { ...award, awarded: false, revokedAt: new Date().toISOString() };
  }
  assignment.statuses[studentIndex] = nextStatus;
  if (nextStatus === "submitted" && !assignmentAward(assignment, student.id).awarded) {
    const baseAmount = assignment.points; const cardAbilityAward = cardBonusAward(student, baseAmount, "과제", assignment.id); const bonusAmount = cardAbilityAward.amount || 0; const amount = baseAmount + bonusAmount;
    if (baseAmount > 0) {
      student.points += amount;
      student.pointHistory.push({ id: crypto.randomUUID(), amount: baseAmount, reason: `${assignment.title} 제출 완료`, source: "과제", relatedId: assignment.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() });
    }
    assignment.pointAwards[student.id] = { awarded: true, amount, baseAmount, bonusAmount, cardAbilityAward, awardedAt: new Date().toISOString(), revokedAt: null };
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
  if (action === "enter-student") { studentAssignmentFilter = "todo"; showAllStudentCompletedAssignments = false; showAllStudentPoints = false; session = { mode: "student", studentId: target.dataset.id, view: "home" }; return render(); }
  if (action === "enter-teacher") { session = { mode: "teacher", studentId: null, view: "dashboard" }; return render(); }
  if (action === "logout") { session = { mode: "welcome", studentId: null, view: "home" }; return render(); }
  if (action === "navigate") { session.view = target.dataset.view; return render(); }
  if (action === "new-class-student") return openClassStudentModal();
  if (action === "edit-class-student") return openClassStudentModal(target.dataset.id);
  if (action === "open-bulk-students") return openBulkStudentsModal();
  if (action === "ask-delete-class-student") {
    const student = studentById(target.dataset.id); if (!student || student.active === false) return;
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>학생 삭제 확인</h2><p><strong>${escapeHtml(student.name)}</strong> 학생을 삭제하시겠습니까?</p><p>이 학생에게 연결된 과제, 1인1역, 포인트, 카드 등의 기록이 있을 수 있습니다.</p><p class="muted">기록 보호를 위해 완전히 지우지 않고 명단에서만 비활성화합니다.</p><div class="button-row"><button class="button danger" data-action="confirm-delete-class-student" data-id="${student.id}">삭제</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return;
  }
  if (action === "confirm-delete-class-student") {
    const student = studentById(target.dataset.id); if (!student) return; student.active = false; delete data.groupAssignments[student.id]; selectedPointStudentIds.delete(student.id); target.closest(".modal")?.remove(); saveData(); render(); toast("학생을 명단에서 안전하게 비활성화했습니다."); return;
  }
  if (action === "open-group-settings") return openGroupSettingsModal();
  if (action === "open-group-assignments") return openGroupAssignmentsModal();
  if (action === "open-group-missions") return openGroupMissionsModal();
  if (action === "toggle-group-assignment-student") { const studentId = target.dataset.id; if (!data.students.some((student) => student.id === studentId)) return; if (selectedGroupAssignmentStudentIds.has(studentId)) selectedGroupAssignmentStudentIds.delete(studentId); else selectedGroupAssignmentStudentIds.add(studentId); target.classList.toggle("selected", selectedGroupAssignmentStudentIds.has(studentId)); target.setAttribute("aria-pressed", String(selectedGroupAssignmentStudentIds.has(studentId))); const count = document.querySelector("#group-assignment-selection-count"); if (count) count.textContent = `${selectedGroupAssignmentStudentIds.size}명 선택됨`; document.querySelectorAll('[data-action="move-selected-group-students"], [data-action="clear-group-assignment-selection"]').forEach((button) => { button.disabled = selectedGroupAssignmentStudentIds.size === 0; }); return; }
  if (action === "clear-group-assignment-selection") { selectedGroupAssignmentStudentIds.clear(); document.querySelectorAll('[data-action="toggle-group-assignment-student"]').forEach((button) => { button.classList.remove("selected"); button.setAttribute("aria-pressed", "false"); }); const count = document.querySelector("#group-assignment-selection-count"); if (count) count.textContent = "0명 선택됨"; document.querySelectorAll('[data-action="move-selected-group-students"], [data-action="clear-group-assignment-selection"]').forEach((button) => { button.disabled = true; }); return; }
  if (action === "move-selected-group-students") { const groupId = target.dataset.groupId || ""; if (!selectedGroupAssignmentStudentIds.size) return toast("이동할 학생을 먼저 선택해 주세요."); if (groupId && !activeGroups().some((group) => group.id === groupId)) return; selectedGroupAssignmentStudentIds.forEach((studentId) => { if (groupId) data.groupAssignments[studentId] = groupId; else delete data.groupAssignments[studentId]; }); const movedCount = selectedGroupAssignmentStudentIds.size; selectedGroupAssignmentStudentIds.clear(); saveData(); render(); openGroupAssignmentsModal(false); toast(`${movedCount}명의 학생을 ${groupId ? groupById(groupId).name : "미배정"}으로 이동했습니다.`); return; }
  if (action === "select-group") { selectedGroupId = target.dataset.id; return render(); }
  if (action === "change-selected-group-score") { if (!selectedGroupId) return toast("점수를 변경할 모둠을 선택하세요."); return changeGroupScore(selectedGroupId, Number(target.dataset.amount)); }
  if (action === "change-group-score") return changeGroupScore(target.dataset.id, Number(target.dataset.amount));
  if (action === "toggle-group-transactions") { showAllGroupTransactions = !showAllGroupTransactions; return render(); }
  if (action === "new-class-mission") return openClassMissionModal();
  if (action === "edit-class-mission") return openClassMissionModal(target.dataset.id);
  if (action === "ask-delete-class-mission") { const mission = data.classMissions.find((item) => item.id === target.dataset.id); if (!mission) return; app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>공동 미션 삭제</h2><p><strong>${mission.target}점 · ${escapeHtml(mission.reward)}</strong></p><p>이 공동 미션을 삭제하시겠습니까?</p><div class="button-row"><button class="button danger" data-action="confirm-delete-class-mission" data-id="${mission.id}">삭제</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return; }
  if (action === "confirm-delete-class-mission") { data.classMissions = data.classMissions.filter((mission) => mission.id !== target.dataset.id); saveData(); render(); toast("공동 미션을 삭제했습니다."); return; }
  if (action === "confirm-class-mission") { const mission = data.classMissions.find((item) => item.id === target.dataset.id); if (!mission || classGroupScore() < mission.target) return; mission.confirmed = true; mission.confirmedAt = new Date().toISOString(); saveData(); render(); toast(`${mission.target}점 공동 미션 달성을 확정했습니다!`); return; }
  if (action === "ask-reset-group-scores") { app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>모둠 점수 초기화</h2><p>모든 모둠의 현재 점수를 0점으로 초기화합니다.<br>기존 점수 기록은 유지됩니다.<br>계속하시겠습니까?</p><div class="button-row"><button class="button danger" data-action="confirm-reset-group-scores">초기화</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return; }
  if (action === "confirm-reset-group-scores") { activeGroups().forEach((group) => { if (!group.score) return; const amount = -group.score; group.score = 0; data.groupScoreTransactions.push({ id: crypto.randomUUID(), groupId: group.id, groupName: group.name, amount, scoreAfter: 0, createdAt: new Date().toISOString(), type: "reset" }); }); saveData(); render(); toast("모둠 점수를 0점으로 초기화했습니다. 기존 기록과 달성 미션은 유지됩니다."); return; }
  if (action === "open-student-detail") { studentDetailId = target.dataset.id; return render(); }
  if (action === "close-student-detail") { studentDetailId = ""; return render(); }
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
  if (action === "cancel-role") { const item = data.roleApplications.find((entry) => entry.id === target.dataset.id); if (item && item.status === "waiting") { item.status = "cancelled"; saveData(); render(); toast("역할 신청을 취소했습니다."); } return; }
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
  if (action === "toggle-point-student") {
    target.checked ? selectedPointStudentIds.add(target.dataset.id) : selectedPointStudentIds.delete(target.dataset.id);
    target.closest(".point-student-card")?.classList.toggle("selected", target.checked);
    const count = document.querySelector("#point-selected-count"); if (count) count.textContent = selectedPointStudentIds.size; return;
  }
  if (action === "select-all-point-students") { data.students.forEach((student) => selectedPointStudentIds.add(student.id)); render(); return; }
  if (action === "clear-point-students") { selectedPointStudentIds.clear(); render(); return; }
  if (action === "quick-teacher-points") return applyTeacherPointChange(Number(target.dataset.amount));
  if (action === "new-card") return openCardModal("", target.dataset.setId);
  if (action === "edit-card") return openCardModal(target.dataset.id);
  if (action === "new-draw-option") return openDrawOptionModal();
  if (action === "edit-draw-option") return openDrawOptionModal(target.dataset.id);
  if (action === "toggle-draw-option") { const option = data.drawOptions.find((item) => item.id === target.dataset.id && !item.deleted); if (!option) return; option.active = !option.active; saveData(); render(); toast(option.active ? "뽑기 옵션을 다시 사용합니다." : "뽑기 옵션을 사용 중지했습니다."); return; }
  if (action === "ask-delete-draw-option") return openDeleteDrawOptionModal(target.dataset.id);
  if (action === "confirm-delete-draw-option") { const option = data.drawOptions.find((item) => item.id === target.dataset.id); if (!option) return; option.active = false; option.deleted = true; saveData(); render(); toast("뽑기 옵션을 삭제했습니다."); return; }
  if (action === "open-collection-card") return openCollectionCardModal(target.dataset.cardId, target.dataset.rarity);
  if (action === "flip-collection-card") { const modal = target.closest(".collection-card-modal"); const stage = modal?.querySelector(".collection-detail-stage"); if (!stage) return; stage.classList.toggle("show-back"); const button = modal.querySelector('.collection-modal-controls > [data-action="flip-collection-card"]'); if (button) button.textContent = stage.classList.contains("show-back") ? "앞면 보기" : "뒤집기"; return; }
  if (action === "select-collection-ability") { target.closest(".modal")?.remove(); return openCollectionCardModal(target.dataset.cardId, target.dataset.rarity, target.dataset.abilityId, true); }
  if (action === "ask-upgrade-card") return openCardUpgradeModal(target.dataset.cardId, target.dataset.rarity);
  if (action === "equip-representative-card") {
    const student = currentStudent(); const card = data.cards.find((item) => item.id === target.dataset.cardId); const rarity = target.dataset.rarity; const abilityId = target.dataset.abilityId;
    if (!student || !card || !CARD_RARITIES.includes(rarity) || Number(abilityInventory(student, card.id, rarity)[abilityId]) < 1) { toast("보유한 카드만 대표 카드로 장착할 수 있습니다."); return; }
    student.representativeCard = { cardId: card.id, rarity, abilityId }; saveData(); render(); toast(`${card.name} ${rarity} · ${cardAbilityById(abilityId).name} 카드를 대표 카드로 장착했습니다.`); return;
  }
  if (action === "confirm-card-upgrade") {
    const student = currentStudent(); const card = data.cards.find((item) => item.id === target.dataset.cardId); const rarity = target.dataset.rarity; const step = upgradeStepFrom(rarity); const required = upgradeRequired(rarity); if (!student || !card || !step || !Number.isInteger(required)) return;
    const inventory = abilityInventory(student, card.id, rarity); const materials = Object.fromEntries(CARD_ABILITIES.map((ability) => [ability.id, Number(target.closest(".modal")?.querySelector(`[name="material-${ability.id}"]`)?.value) || 0])); const selectedCount = Object.values(materials).reduce((sum, count) => sum + count, 0);
    if (selectedCount !== required || CARD_ABILITIES.some((ability) => !Number.isInteger(materials[ability.id]) || materials[ability.id] < 0 || materials[ability.id] > (Number(inventory[ability.id]) || 0))) { toast(`업그레이드 재료를 정확히 ${required}장 선택해 주세요.`); return; }
    const equippedMaterial = student.representativeCard?.cardId === card.id && student.representativeCard?.rarity === rarity && materials[student.representativeCard?.abilityId] > 0;
    if (equippedMaterial && !confirm("현재 대표 카드로 사용 중인 카드입니다.\n업그레이드 재료로 사용하시겠습니까?")) return;
    CARD_ABILITIES.forEach((ability) => { inventory[ability.id] -= materials[ability.id]; }); const newAbilityId = randomAbilityId(); if (!cardInventory(student, card.id)[step.to]) cardInventory(student, card.id)[step.to] = Object.fromEntries(CARD_ABILITIES.map((ability) => [ability.id, 0])); cardInventory(student, card.id)[step.to][newAbilityId] += 1;
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
  if (action === "reset-demo") { if (confirm("모든 데모 데이터를 처음 상태로 되돌릴까요?")) { data = createDemoData(); teacherCardSetId = data.activeCardSetIds[0]; collectionCardSetFilter = "all"; saveData(); render(); toast("데모 데이터를 초기화했습니다."); } }
});

app.addEventListener("change", (event) => {
  if (event.target.closest("#class-feature-form") && event.target.type === "checkbox") { const label = event.target.closest(".feature-toggle")?.querySelector("b"); if (label) label.textContent = event.target.checked ? "사용" : "사용 안 함"; return; }
  if (event.target.dataset.action === "assign-student-group") { const studentId = event.target.dataset.student; const groupId = event.target.value; if (!data.students.some((student) => student.id === studentId) || (groupId && !activeGroups().some((group) => group.id === groupId))) return; if (groupId) data.groupAssignments[studentId] = groupId; else delete data.groupAssignments[studentId]; saveData(); render(); openGroupAssignmentsModal(); toast(groupId ? "학생을 모둠으로 이동했습니다." : "학생을 미배정으로 이동했습니다."); return; }
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
  if (event.key === "Escape") [...document.querySelectorAll(".modal")].at(-1)?.remove();
});

app.addEventListener("submit", (event) => {
  event.preventDefault(); const form = event.target; const formData = new FormData(form);
  if (form.id === "class-info-form") {
    const appName = String(formData.get("appName") || "").trim(); const className = String(formData.get("className") || "").trim(); const teacherName = String(formData.get("teacherName") || "").trim(); if (!appName || !className || !teacherName) return;
    data.classSettings = { ...data.classSettings, appName: appName.slice(0, 50), className: className.slice(0, 50), teacherName: teacherName.slice(0, 30) }; saveData(); render(); toast("학급 정보를 저장했습니다."); return;
  }
  if (form.id === "class-feature-form") {
    data.classSettings.features = Object.fromEntries(Object.keys(DEFAULT_CLASS_FEATURES).map((key) => [key, formData.has(key)]));
    session.view = "class-settings"; saveData(); render(); toast("기능 사용 설정을 저장했습니다."); return;
  }
  if (form.id === "class-student-form") {
    const number = Number(formData.get("number")); const name = String(formData.get("name") || "").trim(); const loginId = String(formData.get("loginId") || "").trim(); const existing = studentById(form.dataset.id);
    if (!Number.isInteger(number) || number < 1 || number > 99 || !name) return toast("번호와 이름을 확인해 주세요.");
    if (!/^[A-Za-z0-9._-]+$/.test(loginId)) return toast("로그인 ID는 영문, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다.");
    if (data.students.some((student) => student.active !== false && student.id !== existing?.id && studentNumber(student) === number)) return toast(`${number}번은 이미 사용 중입니다.`);
    if (data.students.some((student) => student.id !== existing?.id && student.loginId?.toLocaleLowerCase("en-US") === loginId.toLocaleLowerCase("en-US"))) return toast("이미 사용 중인 로그인 ID입니다.");
    if (existing) Object.assign(existing, { number, name: name.slice(0, 30), loginId }); else addStudentRecord(number, name.slice(0, 30), loginId);
    form.closest(".modal")?.remove(); saveData(); render(); toast(existing ? "학생 정보를 수정했습니다." : "학생을 추가했습니다."); return;
  }
  if (form.id === "bulk-students-form") {
    const rawLines = String(formData.get("students") || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean); const parsed = []; const errors = []; const usedNumbers = new Set(activeStudents().map(studentNumber));
    rawLines.forEach((line, index) => { const parts = line.split(",").map((part) => part.trim()); const number = Number(parts[0]); const name = parts.slice(1).join(",").trim(); if (parts.length < 2 || !Number.isInteger(number) || number < 1 || number > 99 || !name) errors.push(`${index + 1}번째 줄 형식 오류`); else if (usedNumbers.has(number)) errors.push(`${index + 1}번째 줄: ${number}번 중복`); else { usedNumbers.add(number); parsed.push({ number, name: name.slice(0, 30) }); } });
    if (errors.length) return alert(`등록할 수 없는 항목이 있습니다.\n\n${errors.slice(0, 8).join("\n")}${errors.length > 8 ? `\n외 ${errors.length - 8}건` : ""}`);
    if (!parsed.length) return toast("추가할 학생을 입력해 주세요.");
    if (!confirm(`${parsed.length}명의 학생을 새로 추가합니다.\n기존 학생 명단은 변경하지 않습니다.\n계속하시겠습니까?`)) return;
    parsed.forEach((item) => addStudentRecord(item.number, item.name, nextStudentLoginId(item.number))); form.closest(".modal")?.remove(); saveData(); render(); toast(`${parsed.length}명의 학생을 추가했습니다.`); return;
  }
  if (form.id === "group-settings-form") {
    const count = Number(formData.get("count")); if (!Number.isInteger(count) || count < 2 || count > 8) { toast("모둠 수는 2~8개로 설정해 주세요."); return; } const current = activeGroups();
    if (count < current.length) { const removed = current.slice(count); const affectedStudents = data.students.filter((student) => removed.some((group) => data.groupAssignments[student.id] === group.id)).length; if (!confirm(`모둠 수를 ${count}개로 줄이면 ${affectedStudents}명의 학생이 미배정으로 이동합니다.\n모둠 점수와 이름 데이터는 안전하게 보관됩니다.\n계속하시겠습니까?`)) return; removed.forEach((group) => { group.active = false; }); Object.entries(data.groupAssignments).forEach(([studentId, groupId]) => { if (removed.some((group) => group.id === groupId)) delete data.groupAssignments[studentId]; }); }
    if (count > current.length) { const archived = data.groups.filter((group) => !group.active).sort((first, second) => first.order - second.order); while (activeGroups().length < count && archived.length) archived.shift().active = true; while (activeGroups().length < count) { const order = data.groups.reduce((max, group) => Math.max(max, group.order), -1) + 1; data.groups.push({ id: crypto.randomUUID(), name: `${order + 1}모둠`, score: 0, active: true, order }); } }
    activeGroups().forEach((group, index) => { const name = String(formData.get(`groupName-${index}`) || "").trim().slice(0, 30); if (name) group.name = name; });
    if (selectedGroupId && !activeGroups().some((group) => group.id === selectedGroupId)) selectedGroupId = ""; saveData(); render(); toast("모둠 설정을 저장했습니다."); return;
  }
  if (form.id === "group-count-form") {
    const count = Number(formData.get("count")); if (!Number.isInteger(count) || count < 2 || count > 8) { toast("모둠 수는 2~8개로 설정해 주세요."); return; } const current = activeGroups();
    if (count < current.length) { const removed = current.slice(count); const affectedStudents = data.students.filter((student) => removed.some((group) => data.groupAssignments[student.id] === group.id)).length; const score = removed.reduce((sum, group) => sum + group.score, 0); if (!confirm(`모둠 수를 ${count}개로 줄이면 ${affectedStudents}명의 학생이 미배정으로 이동합니다.\n비활성 모둠의 ${score}점과 이름은 안전하게 보관됩니다.\n계속하시겠습니까?`)) return; removed.forEach((group) => { group.active = false; }); Object.entries(data.groupAssignments).forEach(([studentId, groupId]) => { if (removed.some((group) => group.id === groupId)) delete data.groupAssignments[studentId]; }); }
    if (count > current.length) { const archived = data.groups.filter((group) => !group.active).sort((first, second) => first.order - second.order); while (activeGroups().length < count && archived.length) archived.shift().active = true; while (activeGroups().length < count) { const order = data.groups.reduce((max, group) => Math.max(max, group.order), -1) + 1; data.groups.push({ id: crypto.randomUUID(), name: `${order + 1}모둠`, score: 0, active: true, order }); } }
    saveData(); render(); toast(`모둠 수를 ${count}개로 적용했습니다.`); return;
  }
  if (form.classList.contains("group-name-form")) { const group = groupById(form.dataset.id); const name = String(formData.get("name") || "").trim().slice(0, 30); if (!group || !name) return; group.name = name; saveData(); render(); toast("모둠 이름을 저장했습니다."); return; }
  if (form.id === "selected-group-score-form") { const amount = Number(formData.get("amount")); if (!selectedGroupId) return toast("점수를 변경할 모둠을 선택하세요."); if (!Number.isInteger(amount) || amount < 1) return; changeGroupScore(selectedGroupId, event.submitter?.dataset.kind === "subtract" ? -amount : amount); return; }
  if (form.classList.contains("group-direct-score-form")) { const amount = Number(formData.get("amount")); if (!Number.isInteger(amount) || amount < 1) return; changeGroupScore(form.dataset.id, event.submitter?.dataset.kind === "subtract" ? -amount : amount); return; }
  if (form.id === "class-mission-form") { const target = Number(formData.get("target")); const reward = String(formData.get("reward") || "").trim(); if (!Number.isInteger(target) || target < 1 || !reward) { toast("목표 점수와 보상 내용을 확인해 주세요."); return; } const duplicate = data.classMissions.some((mission) => mission.target === target && mission.id !== form.dataset.id); if (duplicate) { toast("같은 목표 점수의 공동 미션이 이미 있습니다."); return; } const existing = data.classMissions.find((mission) => mission.id === form.dataset.id); if (existing) Object.assign(existing, { target, reward: reward.slice(0, 100) }); else data.classMissions.push({ id: crypto.randomUUID(), target, reward: reward.slice(0, 100), confirmed: false, confirmedAt: null }); saveData(); render(); toast(existing ? "공동 미션을 수정했습니다." : "새 공동 미션을 추가했습니다."); return; }
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
  if (form.id === "point-bulk-form") {
    const rawAmount = Number(formData.get("amount")); if (!Number.isInteger(rawAmount) || rawAmount < 1) return;
    applyTeacherPointChange(event.submitter?.dataset.kind === "subtract" ? -rawAmount : rawAmount);
  }
  if (form.id === "draw-option-form") {
    const name = formData.get("name").trim(); const price = Number(formData.get("price")); const rates = Object.fromEntries(Object.keys(DEFAULT_DRAW_RATES).map((key) => [key, Number(formData.get(key))])); const values = Object.values(rates); const total = values.reduce((sum, value) => sum + value, 0);
    if (!name || !Number.isInteger(price) || price < 0) return;
    if (!values.every((value) => Number.isFinite(value) && value >= 0 && value <= 100) || Math.abs(total - 100) >= 0.001) { toast("등급별 확률의 합계가 100%가 되어야 합니다."); return; }
    const existing = data.drawOptions.find((option) => option.id === form.dataset.id);
    if (existing) Object.assign(existing, { name: name.slice(0, 40), price, rates });
    else data.drawOptions.push({ id: crypto.randomUUID(), name: name.slice(0, 40), price, rates, active: true, deleted: false });
    saveData(); render(); toast(existing ? "뽑기 옵션을 수정했습니다." : "새 뽑기 옵션을 추가했습니다.");
  }
  if (form.id === "upgrade-settings-form") {
    const settings = Object.fromEntries(CARD_UPGRADE_STEPS.map((step) => [step.key, Number(formData.get(step.key))]));
    if (!Object.values(settings).every((value) => Number.isInteger(value) && value >= 2)) { toast("업그레이드 필요 카드 수는 2장 이상이어야 합니다."); return; }
    data.cardUpgradeSettings = settings; saveData(); render(); toast("카드 업그레이드 설정을 저장했습니다.");
  }
  if (form.id === "card-ability-settings-form") {
    const settings = Object.fromEntries(CARD_RARITIES.map((rarity) => { const key = CARD_RATE_KEYS[rarity]; const dailyCap = Number(formData.get(`${key}-dailyCap`)); const abilities = Object.fromEntries(CARD_ABILITIES.map((ability) => { const percent = Number(formData.get(`${key}-${ability.id}`)); return [ability.id, { assignmentPercent: ability.id === "responsibility" ? 0 : percent, rolePercent: ability.id === "academic" ? 0 : percent }]; })); return [rarity, { dailyCap, abilities }]; }));
    const valid = Object.values(settings).every((setting) => Number.isInteger(setting.dailyCap) && setting.dailyCap >= 0 && Object.values(setting.abilities).every((ability) => [ability.assignmentPercent, ability.rolePercent].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)));
    if (!valid) { toast("보너스는 0~100%, 하루 최대 포인트는 0 이상의 정수로 입력해 주세요."); return; }
    data.cardAbilitySettings = settings; saveData(); render(); toast("특수능력 설정을 저장했습니다.");
  }
  if (form.id === "card-form") {
    const cardSetId = formData.get("cardSetId"); const name = formData.get("name").trim(); const era = formData.get("era").trim(); const achievement = formData.get("achievement").trim();
    if (!cardSetById(cardSetId) || !name || !era || !achievement) return;
    const existing = data.cards.find((card) => card.id === form.dataset.id);
    if (existing) Object.assign(existing, { cardSetId, name, era, achievement });
    else data.cards.push({ id: crypto.randomUUID(), cardSetId, name, era, achievement, order: sortedCards(true, cardSetId).reduce((max, card) => Math.max(max, card.order), -1) + 1, active: true, deleted: false });
    teacherCardSetId = cardSetId;
    saveData(); render(); toast(existing ? "카드를 수정했습니다." : "새 카드를 추가했습니다.");
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
    data.dailyRoleApplicationLimit = limit; saveData(); render(); toast(`하루 최대 신청 개수를 ${limit}개로 저장했습니다.`);
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
