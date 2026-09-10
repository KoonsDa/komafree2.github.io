const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const {MemoryFirestore} = require("./memory-firestore");
const {approvalWindow, dateKey, eligibleToday} = require("../approval-date");
const {runNightlyApproval, approveRole} = require("../nightly-approval");
const {resolvePointUse} = require("../point-approval");
const {roleReward} = require("../role-reward");
const now = new Date("2026-09-10T12:00:00Z");
const day = "2026-09-10";
const window = approvalWindow(now, now);
const path = "classes/a";
const role = {id: "r", name: "정리", points: 20};
const application = (changes = {}) => ({id: "r1", date: day, studentId: "s", roleId: "r", roleSnapshot: role,
  status: "waiting", appliedAt: "2026-09-10T06:00:00Z", pointAward: {}, completedAt: null, cancelledAt: null, cancelledBy: null, ...changes});
const use = (changes = {}) => ({id: "p1", classId: "a", studentId: "s", itemId: "gift", date: day,
  approvalRequired: true, status: "pending", price: 5, createdAt: "2026-09-10T06:00:00Z", resolvedAt: null, ...changes});
function seed(extra = {}) {
  return new MemoryFirestore({[path]: {ownerUid: "teacher"}, [`${path}/students/s`]: {id: "s", active: true},
    [`${path}/roleSettings/current`]: {dailyRoleApplicationLimit: 1},
    [`${path}/studentPointStates/s`]: {id: "s", points: 100}, [`${path}/pointShopItems/gift`]: {id: "gift", name: "선물", price: 5, dailyStock: 10, perStudentDailyLimit: 10}, ...extra});
}
const logger = {info() {}, error() {}};
const run = db => runNightlyApproval({db, scheduleTime: now, now: () => now, logger});
const data = (db, relative) => db.rows.get(`${path}/${relative}`);
const histories = db => [...db.rows].filter(([key]) => key.includes("/pointHistory/")).map(([, value]) => value.entry);

test("A: today's waiting role completes with the existing award and history shape", async () => {
  const db = seed({[`${path}/dailyRoleAssignments/r1`]: application()});
  assert.equal((await run(db)).roles, 1);
  assert.equal(data(db, "studentPointStates/s").points, 120);
  const result = data(db, "dailyRoleAssignments/r1");
  assert.equal(result.status, "completed"); assert.equal(result.pointAward.autoApproved, true);
  assert.equal(result.completedAt, now.toISOString()); assert.equal(histories(db)[0].amount, 20);
});
for (const [name, changes] of Object.entries({
  B_completed: {status: "completed"}, C_cancelled: {status: "cancelled"}, rejected: {status: "rejected"},
  D_yesterday: {date: "2026-09-09", appliedAt: "2026-09-09T10:00:00Z"},
  undone: {pointAward: {awarded: false, revokedAt: "2026-09-10T09:00:00Z"}},
  alreadyAwarded: {pointAward: {awarded: true}}, after21: {appliedAt: "2026-09-10T12:00:01Z"},
  wrongTimestamp: {appliedAt: "2026-09-09T14:59:59Z"},
})) test(`${name}: role remains unchanged`, async () => {
  const value = application(changes); const db = seed({[`${path}/dailyRoleAssignments/r1`]: value});
  await run(db); assert.deepEqual(data(db, "dailyRoleAssignments/r1"), value);
  assert.equal(data(db, "studentPointStates/s").points, 100); assert.equal(histories(db).length, 0);
});
test("E/J: point auto approval matches the shared manual approval", async () => {
  const initial = {[`${path}/pointUseRequests/p1`]: use()}; const auto = seed(initial); const manual = seed(initial);
  await resolvePointUse({db: manual, classRef: manual.doc(path), uid: "teacher"}, "p1", "approve");
  await run(auto);
  assert.equal(data(auto, "studentPointStates/s").points, data(manual, "studentPointStates/s").points);
  assert.equal(data(auto, "pointUseRequests/p1").status, "completed");
  assert.equal(data(auto, "pointUseRequests/p1").autoApproved, true);
  for (const key of ["amount", "reason", "source", "relatedId"]) assert.equal(histories(auto)[0][key], histories(manual)[0][key]);
});
test("F/G: twice and concurrently invoked jobs award/deduct only once", async () => {
  const db = seed({[`${path}/dailyRoleAssignments/r1`]: application(), [`${path}/pointUseRequests/p1`]: use()});
  await Promise.all([run(db), run(db)]); await run(db);
  assert.equal(data(db, "studentPointStates/s").points, 115); assert.equal(histories(db).length, 2);
  assert.ok(db.retries > 0);
});
test("manual point approval competing with job changes balance once", async () => {
  const db = seed({[`${path}/pointUseRequests/p1`]: use()});
  await Promise.allSettled([run(db), resolvePointUse({db, classRef: db.doc(path), uid: "teacher"}, "p1", "approve")]);
  assert.equal(data(db, "studentPointStates/s").points, 95); assert.equal(histories(db).length, 1);
});
test("H: identical student IDs in other classes remain isolated, OFF stays untouched", async () => {
  const db = seed({[`${path}/dailyRoleAssignments/r1`]: application(),
    "classes/b": {ownerUid: "other", autoApproveAt21: false}, "classes/b/studentPointStates/s": {points: 300},
    "classes/b/dailyRoleAssignments/r1": application(), [`${path}/pointUseRequests/p1`]: use({classId: "b"})});
  await run(db); assert.equal(db.rows.get("classes/b/studentPointStates/s").points, 300);
  assert.equal(db.rows.get("classes/b/dailyRoleAssignments/r1").status, "waiting");
  assert.equal(data(db, "pointUseRequests/p1").status, "pending");
});
test("I: KST midnight boundary and next-day retry", async () => {
  assert.equal(dateKey("2026-09-09T15:00:00Z"), day);
  assert.equal(dateKey("2026-09-09T14:59:59Z"), "2026-09-09");
  assert.equal(eligibleToday(application({appliedAt: "2026-09-09T15:00:00Z"}), "appliedAt", window), true);
  assert.equal(approvalWindow(now, new Date("2026-09-10T15:00:00Z")), null);
  assert.equal(approvalWindow("2026-09-10T11:59:59Z", now), null);
  const db = seed({[`${path}/dailyRoleAssignments/r1`]: application()});
  await runNightlyApproval({db, scheduleTime: now, now: () => new Date("2026-09-10T15:00:00Z"), logger});
  assert.equal(histories(db).length, 0);
});
test("one role per student/day, even with multiple pending applications", async () => {
  const db = seed({[`${path}/dailyRoleAssignments/r1`]: application(),
    [`${path}/dailyRoleAssignments/r2`]: application({id: "r2", roleId: "other"})});
  await run(db); assert.equal(data(db, "studentPointStates/s").points, 120); assert.equal(histories(db).length, 1);
});
for (const [limit, manual, automatic, waiting, expected] of [
  [3, 1, 0, 2, 2], [3, 2, 0, 3, 1], [5, 0, 0, 5, 5],
  [3, 1, 1, 3, 1], [3, 3, 0, 2, 0], [2, 0, 0, 4, 2], [4, 0, 0, 4, 4],
]) test(`role limit ${limit}: manual ${manual} + auto ${automatic}, waiting ${waiting} completes ${expected}`, async () => {
  const extra = {[`${path}/roleSettings/current`]: {dailyRoleApplicationLimit: limit}};
  for (let i = 0; i < manual + automatic; i++) {
    extra[`${path}/dailyRoleAssignments/done${i}`] = application({id: `done${i}`, status: "completed",
      pointAward: {awarded: true, autoApproved: i >= manual}});
  }
  for (let i = 0; i < waiting; i++) extra[`${path}/dailyRoleAssignments/w${i}`] = application({id: `w${i}`});
  // Excluded statuses and other dates/students must not consume today's student's limit.
  extra[`${path}/dailyRoleAssignments/cancel`] = application({status: "cancelled"});
  extra[`${path}/dailyRoleAssignments/reject`] = application({status: "rejected"});
  extra[`${path}/dailyRoleAssignments/oldDone`] = application({status: "completed", date: "2026-09-09"});
  extra[`${path}/dailyRoleAssignments/otherDone`] = application({status: "completed", studentId: "other"});
  const db = seed(extra);
  await Promise.all([run(db), run(db)]); await run(db);
  assert.equal(data(db, "studentPointStates/s").points, 100 + expected * role.points);
  assert.equal(histories(db).length, expected);
  assert.equal(Array.from({length: waiting}, (_, i) => data(db, `dailyRoleAssignments/w${i}`))
    .filter(value => value.status === "waiting").length, waiting - expected);
});

test("missing or invalid role limit never authorizes additional automatic awards", async () => {
  for (const limit of [undefined, 0, 6, 1.5, "invalid"]) {
    const db = seed({[`${path}/roleSettings/current`]: {dailyRoleApplicationLimit: limit},
      [`${path}/dailyRoleAssignments/r1`]: application()});
    await run(db); assert.equal(histories(db).length, 0);
  }
});

test("multiple automatic roles share the existing daily card bonus cap", async () => {
  const db = seed({[`${path}/roleSettings/current`]: {dailyRoleApplicationLimit: 3},
    [`${path}/studentCardInventories/s`]: {representativeCard: {cardId: "card", rarity: "전설", abilityId: "responsibility"},
      cards: {card: {전설: {responsibility: 1}}}},
    [`${path}/cards/card`]: {id: "card", name: "세종"},
    [`${path}/cardSettings/config`]: {cardAbilities: [{id: "responsibility", name: "책임", active: true, targets: {roles: true}}],
      cardAbilitySettings: {전설: {dailyCap: 8, abilities: {responsibility: {rolePercent: 25}}}}},
    ...Object.fromEntries([1, 2, 3].map(i => [`${path}/dailyRoleAssignments/r${i}`, application({id: `r${i}`})]))});
  await Promise.all([run(db), run(db)]); await run(db);
  assert.equal(data(db, "studentPointStates/s").points, 100 + 60 + 8);
  assert.equal(histories(db).filter(entry => entry.source === "카드 능력 보너스").reduce((sum, entry) => sum + entry.amount, 0), 8);
});
test("manual rejection, insufficient balance, changed product, inactive student remain guarded", async () => {
  for (const mutation of [{price: 999}, {status: "rejected"}, {status: "completed"}, {status: "cancelled"},
    {date: "2026-09-09"}, {createdAt: "2026-09-10T12:00:01Z"}]) {
    const db = seed({[`${path}/pointUseRequests/p1`]: use(mutation)}); await run(db);
    assert.equal(histories(db).length, 0);
  }
  const db = seed({[`${path}/pointUseRequests/p1`]: use()});
  await resolvePointUse({db, classRef: db.doc(path), uid: "teacher"}, "p1", "reject");
  await run(db); assert.equal(data(db, "pointUseRequests/p1").status, "rejected"); assert.equal(histories(db).length, 0);
});
test("transaction rereads teacher changes, deletion and OFF after candidate discovery", async () => {
  for (const action of ["cancel", "delete", "off"]) {
    const db = seed({[`${path}/dailyRoleAssignments/r1`]: application()});
    if (action === "cancel") db.put(`${path}/dailyRoleAssignments/r1`, application({status: "cancelled"}));
    if (action === "delete") db.put(`${path}/dailyRoleAssignments/r1`, undefined);
    if (action === "off") db.put(path, {ownerUid: "teacher", autoApproveAt21: false});
    assert.equal(await approveRole(db, db.doc(path), "r1", window, now), "skipped");
    assert.equal(histories(db).length, 0);
  }
});

test("insufficient funds, inactive student, exhausted stock and personal limit block point approval", async () => {
  for (const extra of [
    {[`${path}/studentPointStates/s`]: {points: 0}},
    {[`${path}/students/s`]: {active: false}},
    {[`${path}/pointShopItems/gift`]: {id: "gift", price: 5, dailyStock: 1}, [`${path}/pointUseRequests/p2`]: use({id: "p2", status: "completed"})},
    {[`${path}/pointShopItems/gift`]: {id: "gift", price: 5, dailyStock: 10, perStudentDailyLimit: 1}, [`${path}/pointUseRequests/p2`]: use({id: "p2", status: "completed"})},
  ]) {
    const db = seed({[`${path}/pointUseRequests/p1`]: use(), ...extra});
    await run(db); assert.equal(data(db, "pointUseRequests/p1").status, "pending"); assert.equal(histories(db).length, 0);
  }
});

test("both enabled classes process independently", async () => {
  const db = seed({[`${path}/pointUseRequests/p1`]: use(),
    "classes/b": {ownerUid: "other"}, "classes/b/studentPointStates/s": {points: 300},
    "classes/b/students/s": {active: true}, "classes/b/roleSettings/current": {dailyRoleApplicationLimit: 1},
    "classes/b/dailyRoleAssignments/r1": application()});
  const result = await run(db); assert.equal(result.points, 1); assert.equal(result.roles, 1);
  assert.equal(data(db, "studentPointStates/s").points, 95);
  assert.equal(db.rows.get("classes/b/studentPointStates/s").points, 320);
});

test("actual web transaction races safely with automatic role completion and can undo it", async () => {
  const source = fs.readFileSync(require.resolve("../../our-class-quest/firebase-client.js"), "utf8");
  const helper = name => {
    const start = source.indexOf(`function ${name}(`);
    return source.slice(start, source.indexOf("\nfunction ", start + 1));
  };
  const db = seed({[`${path}/dailyRoleAssignments/r1`]: application()});
  const start = source.indexOf("applyPointMutations: async");
  const body = source.slice(start + "applyPointMutations: ".length, source.indexOf("\n  };", start));
  const context = vm.createContext({db, auth: {currentUser: {uid: "teacher"}}, activeClassId: "a",
    doc: (database, ...segments) => database.doc(segments.join("/")), serverTimestamp: () => now.toISOString(),
    runTransaction: (database, callback) => database.runTransaction(transaction => callback({...transaction,
      get: async ref => { const snapshot = await transaction.get(ref); return {...snapshot, exists: () => snapshot.exists}; }}))});
  vm.runInContext(["jsonSafeMap", "cloudHistoryId", "dailyRoleAssignmentFields", "canonicalJson"].map(helper).join("\n") +
    `\nthis.apply = (${body});`, context);
  const manual = {studentId: "s", expectedPoints: 100, balanceDelta: 20, historyEntries: [{id: "manual", amount: 20}],
    dailyRoleAssignment: {...application(), expectedStatus: "waiting", expectedPointAward: {}, status: "completed", pointAward: {awarded: true, amount: 20}}};
  const outcomes = await Promise.allSettled([run(db), context.apply([manual])]);
  assert.equal(data(db, "studentPointStates/s").points, 120);
  assert.equal(histories(db).length, 1);
  for (const outcome of outcomes) if (outcome.status === "rejected") assert.ok(["point/conflict", "role/status-conflict"].includes(outcome.reason.code));
  const current = data(db, "dailyRoleAssignments/r1");
  await context.apply([{studentId: "s", expectedPoints: 120, balanceDelta: -20,
    historyEntries: [{id: "undo", amount: -20}], dailyRoleAssignment: {...current,
      expectedStatus: "completed", expectedPointAward: current.pointAward, status: "waiting", completedAt: null,
      pointAward: {...current.pointAward, awarded: false, revokedAt: now.toISOString()}}}]);
  await run(db); assert.equal(data(db, "studentPointStates/s").points, 100);
});

test("cloud class setting preserves explicit OFF and defaults old classes to ON", () => {
  const source = fs.readFileSync(require.resolve("../../our-class-quest/firebase-client.js"), "utf8");
  const context = vm.createContext({});
  vm.runInContext(source.slice(source.indexOf("function classSettings("), source.indexOf("function studentFields(")), context);
  assert.equal(context.classSettings({}).autoApproveAt21, true);
  assert.equal(context.classSettings({autoApproveAt21: false}).autoApproveAt21, false);
});

test("teacher role and point request displays identify automatic approval", () => {
  const source = fs.readFileSync(require.resolve("../../our-class-quest/script.js"), "utf8");
  const context = vm.createContext({studentById: () => ({name: "학생"}), roleForApplication: () => role, escapeHtml: value => value});
  vm.runInContext(source.slice(source.indexOf("function teacherRoleList("), source.indexOf("function roleEditorList(")), context);
  const rendered = context.teacherRoleList([application({status: "completed", pointAward: {autoApproved: true}})]);
  assert.match(rendered, /자동 완료/); assert.match(rendered, /data-action="undo-complete"/);
  assert.match(context.teacherRoleList([application({status: "completed"})]), /수행 완료/);
  const shop = fs.readFileSync(require.resolve("../../our-class-quest/point-shop.js"), "utf8");
  let modal;
  const shopContext = vm.createContext({itemById: () => ({name: "선물"}), studentById: () => ({name: "학생"}),
    studentNumber: () => 1, escapeHtml: value => value, todayRequestsForItem: () => [use({status: "completed", autoApproved: true})],
    app: {insertAdjacentHTML: (where, html) => { modal = html; }}});
  vm.runInContext(shop.slice(shop.indexOf("  function openItemRequests("), shop.indexOf('  app.addEventListener("click"')) + '\nopenItemRequests("gift");', shopContext);
  assert.match(modal, /사용 완료 \(자동 승인\)/); assert.doesNotMatch(modal, /data-action="approve-point-use"/);
});

test("Firestore Timestamp and missing dates are classified without UTC leakage", () => {
  const {Timestamp} = require("firebase-admin/firestore");
  assert.equal(eligibleToday(use({createdAt: Timestamp.fromDate(new Date("2026-09-09T15:00:00Z"))}), "createdAt", window), true);
  assert.equal(eligibleToday(use({createdAt: null}), "createdAt", window), false);
  assert.equal(eligibleToday(use({createdAt: Timestamp.fromDate(new Date("2026-09-09T14:59:59Z"))}), "createdAt", window), false);
});

test("J: role award matches actual web completeRole/cardBonusAward, including daily cap and reversal", () => {
  const source = fs.readFileSync(require.resolve("../../our-class-quest/script.js"), "utf8");
  const fromTo = (from, to) => source.slice(source.indexOf(from), source.indexOf(to));
  for (const already of [0, 3, 8, -2]) {
    const config = {cardAbilities: [{id: "responsibility", name: "책임", active: true, targets: {roles: true}}],
      cardAbilitySettings: {전설: {dailyCap: 8, abilities: {responsibility: {rolePercent: 25}}}}};
    const student = {id: "s", points: 100, representativeCard: {cardId: "card", rarity: "전설", abilityId: "responsibility"},
      cards: {card: {전설: {responsibility: 1}}}, pointHistory: [{source: "카드 능력 보너스", date: "2026. 9. 10.", amount: already}]};
    const cards = [{id: "card", name: "세종"}]; let captured;
    const context = vm.createContext({data: {...config, cards, roleApplications: [application()]},
      CARD_RARITIES: ["전설"], DEFAULT_CARD_ABILITY_SETTINGS: {}, crypto: require("node:crypto"), structuredClone,
      todayString: () => day, roleCloudConnectionLocked: () => false, studentById: () => student,
      roleForApplication: () => role, storedRolePointAward: () => ({}), initialRoleApplicationSnapshot: value => value,
      saveData() {}, render() {}, toast() {},
      applyStudentPointChange(s, amount, entries, options) { captured = {amount, entries, award: options.dailyRoleAssignment.pointAward}; return true; },
      abilityInventory: (s, id, rarity) => s.cards[id][rarity], cardAbilities: () => config.cardAbilities});
    vm.runInContext(fromTo("function cardAbilitySetting(", "function abilitySummary(") +
      fromTo("function representativeCardInfo(", "function pointHistoryEntries(") +
      fromTo("function cardBonusAward(", "function reverseCardBonus(") +
      fromTo("function completeRole(", "function undoCompleteRole(") + '\ncompleteRole("r1");', context);
    const result = roleReward({student, role, config, cards, day, now});
    for (const key of ["amount", "baseAmount", "bonusAmount"]) assert.equal(result.pointAward[key], captured.award[key]);
    assert.deepEqual(JSON.parse(JSON.stringify(result.pointAward.cardAbilityAward)), JSON.parse(JSON.stringify(captured.award.cardAbilityAward)));
  }
});
