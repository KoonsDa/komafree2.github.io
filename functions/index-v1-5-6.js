// 우리반 퀘스트 v1.5.9 student portal + Firebase point shop addon
// 기존 함수들을 그대로 export하고 학생 포털 및 포인트 상품 함수를 추가합니다.
Object.assign(exports, require("./index-v1-5-2.js"));

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const {randomUUID, randomInt} = require("node:crypto");

function stringValue(value) {
  return typeof value === "string" ? value : "";
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function timestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function seoulWeekStartMillis(now = Date.now()) {
  const SEOUL_OFFSET = 9 * 60 * 60 * 1000;
  const shifted = new Date(now + SEOUL_OFFSET);
  const day = shifted.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const localMidnightUtc = Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate() - daysSinceMonday,
      0, 0, 0, 0,
  );
  return localMidnightUtc - SEOUL_OFFSET;
}

function safePointEntry(historyDoc) {
  const value = historyDoc.data() || {};
  const source = value.entry && typeof value.entry === "object" &&
      !Array.isArray(value.entry) ? value.entry : {};
  const amount = numberValue(source.amount);
  const createdAtMillis = timestampMillis(source.createdAt) ||
      timestampMillis(value.createdAt);
  return {
    id: stringValue(source.id) || historyDoc.id,
    studentId: stringValue(value.studentId),
    amount,
    reason: stringValue(source.reason) || "포인트 변동",
    source: stringValue(source.source) || "기타",
    date: stringValue(source.date),
    createdAt: createdAtMillis ? new Date(createdAtMillis).toISOString() : "",
  };
}

function rankedRows(students, values) {
  const rows = students.map((student) => ({
    studentId: student.id,
    number: student.number,
    name: student.name,
    characterId: student.characterId,
    value: numberValue(values.get(student.id)),
  })).sort((first, second) =>
    second.value - first.value ||
    first.number - second.number ||
    first.name.localeCompare(second.name, "ko-KR"),
  );

  let previousValue = null;
  let previousRank = 0;
  return rows.map((row, index) => {
    const rank = previousValue === row.value ? previousRank : index + 1;
    previousValue = row.value;
    previousRank = rank;
    return {...row, rank};
  });
}

async function verifiedStudentContext(request) {
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "Student authentication is required.",
    );
  }

  const uid = request.auth.uid;
  const db = getFirestore();
  const accountSnapshot = await db.doc(`studentAccounts/${uid}`).get();
  const account = accountSnapshot.exists ? accountSnapshot.data() : null;
  const classId = stringValue(account?.classId);
  const studentId = stringValue(account?.studentId);

  if (!account || account.uid !== uid || account.active !== true ||
      !classId || !studentId) {
    throw new HttpsError(
        "permission-denied",
        "Student session is not active.",
    );
  }

  const [classSnapshot, studentSnapshot] = await Promise.all([
    db.doc(`classes/${classId}`).get(),
    db.doc(`classes/${classId}/students/${studentId}`).get(),
  ]);
  const student = studentSnapshot.exists ? studentSnapshot.data() : null;

  if (!classSnapshot.exists || !student || student.id !== studentId ||
      student.active === false) {
    throw new HttpsError(
        "permission-denied",
        "Student session is not active.",
    );
  }

  return {
    db,
    uid,
    classId,
    studentId,
    classData: classSnapshot.data() || {},
    student,
  };
}

exports.getStudentPortalData = onCall(
    {region: "asia-northeast3"},
    async (request) => {
      const context = await verifiedStudentContext(request);
      const {db, classId, studentId, classData} = context;
      const classRef = db.doc(`classes/${classId}`);
      const featureSource = classData.features &&
        typeof classData.features === "object" &&
        !Array.isArray(classData.features) ? classData.features : {};
      const rankingsEnabled = featureSource.rankings !== false;
      const pointsEnabled = featureSource.points !== false;
      const weekStart = seoulWeekStartMillis();

      const [studentsSnapshot, pointHistorySnapshot,
        assignmentStatesSnapshot, roleApplicationsSnapshot,
        cardInventoriesSnapshot, cardAcquisitionSnapshot] =
        await Promise.all([
          classRef.collection("students").get(),
          classRef.collection("pointHistory").get(),
          rankingsEnabled ? classRef.collection("assignmentStudentStates").get() :
            Promise.resolve(null),
          rankingsEnabled ? classRef.collection("dailyRoleAssignments").get() :
            Promise.resolve(null),
          rankingsEnabled ? classRef.collection("studentCardInventories").get() :
            Promise.resolve(null),
          rankingsEnabled ? classRef.collection("cardAcquisitionHistory").get() :
            Promise.resolve(null),
        ]);

      const students = studentsSnapshot.docs.map((snapshot) => {
        const value = snapshot.data() || {};
        return {
          id: snapshot.id,
          number: Math.max(0, Math.trunc(numberValue(value.number))),
          name: stringValue(value.name) || `학생 ${snapshot.id}`,
          characterId: stringValue(value.customization?.characterId),
          active: value.active !== false,
        };
      }).filter((student) => student.active)
        .sort((first, second) => first.number - second.number ||
          first.name.localeCompare(second.name, "ko-KR"));

      const pointEntries = pointHistorySnapshot.docs.map(safePointEntry);
      const myPointHistory = pointsEnabled ? pointEntries
          .filter((entry) => entry.studentId === studentId)
          .sort((first, second) =>
            timestampMillis(second.createdAt) - timestampMillis(first.createdAt))
          .slice(0, 100) : [];

      const gained = myPointHistory.reduce(
          (sum, entry) => sum + Math.max(0, entry.amount), 0);
      const spent = myPointHistory.reduce(
          (sum, entry) => sum + Math.max(0, -entry.amount), 0);

      const ranking = {
        enabled: rankingsEnabled,
        weekStart: new Date(weekStart).toISOString(),
        activity: {week: [], all: []},
        roles: {week: [], all: []},
        assignments: {week: [], all: []},
        collection: {available: false, week: [], all: []},
      };

      if (rankingsEnabled) {
        const activityAll = new Map();
        const activityWeek = new Map();
        pointEntries.forEach((entry) => {
          if (!["1인1역", "과제"].includes(entry.source)) return;
          activityAll.set(
              entry.studentId,
              numberValue(activityAll.get(entry.studentId)) + entry.amount,
          );
          if (timestampMillis(entry.createdAt) >= weekStart) {
            activityWeek.set(
                entry.studentId,
                numberValue(activityWeek.get(entry.studentId)) + entry.amount,
            );
          }
        });

        const rolesAll = new Map();
        const rolesWeek = new Map();
        (roleApplicationsSnapshot?.docs || []).forEach((snapshot) => {
          const value = snapshot.data() || {};
          if (value.status !== "completed") return;
          const id = stringValue(value.studentId);
          if (!id) return;
          rolesAll.set(id, numberValue(rolesAll.get(id)) + 1);
          if (timestampMillis(value.completedAt) >= weekStart) {
            rolesWeek.set(id, numberValue(rolesWeek.get(id)) + 1);
          }
        });

        const assignmentsAll = new Map();
        const assignmentsWeek = new Map();
        (assignmentStatesSnapshot?.docs || []).forEach((snapshot) => {
          const value = snapshot.data() || {};
          if (value.status !== "submitted") return;
          const id = stringValue(value.studentId);
          if (!id) return;
          assignmentsAll.set(id, numberValue(assignmentsAll.get(id)) + 1);
          if (timestampMillis(value.pointAward?.awardedAt) >= weekStart) {
            assignmentsWeek.set(id, numberValue(assignmentsWeek.get(id)) + 1);
          }
        });

        ranking.activity = {
          week: rankedRows(students, activityWeek),
          all: rankedRows(students, activityAll),
        };
        ranking.roles = {
          week: rankedRows(students, rolesWeek),
          all: rankedRows(students, rolesAll),
        };
        ranking.assignments = {
          week: rankedRows(students, assignmentsWeek),
          all: rankedRows(students, assignmentsAll),
        };
        const collectionAll = new Map();
        (cardInventoriesSnapshot?.docs || []).forEach((snapshot) => {
          const value = snapshot.data() || {}; const student = stringValue(value.studentId) || snapshot.id;
          const total = Object.values(plainObject(value.cards)).reduce((cardSum, byRarity) =>
            cardSum + Object.values(plainObject(byRarity)).reduce((raritySum, byAbility) =>
              raritySum + Object.values(plainObject(byAbility)).reduce((abilitySum, count) =>
                abilitySum + Math.max(0, Math.trunc(numberValue(count))), 0), 0), 0);
          collectionAll.set(student, total);
        });
        const collectionWeek = new Map();
        (cardAcquisitionSnapshot?.docs || []).forEach((snapshot) => {
          const value = snapshot.data() || {}; const student = stringValue(value.studentId);
          if (!student || timestampMillis(value.createdAt) < weekStart) return;
          collectionWeek.set(student, numberValue(collectionWeek.get(student)) + 1);
        });
        ranking.collection = {available: true, metric: "total-count",
          week: rankedRows(students, collectionWeek), all: rankedRows(students, collectionAll)};
      }

      return {
        ok: true,
        pointHistory: myPointHistory,
        pointSummary: {gained, spent},
        ranking,
        cards: {
          connected: false,
          reason: "teacher-card-settings-not-cloud-connected",
        },
      };
    },
);

function seoulDateKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

function normalizedShopItem(value, fallbackId = "") {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const id = stringValue(source.id) || fallbackId;
  const name = stringValue(source.name).trim().slice(0, 80);
  const description = stringValue(source.description).trim().slice(0, 300);
  const icon = stringValue(source.icon).trim().slice(0, 12) || "🎁";
  const price = Math.max(0, Math.trunc(numberValue(source.price)));
  const dailyStock = Math.max(1, Math.trunc(numberValue(source.dailyStock) || 1));
  const perStudentDailyLimit = Math.max(1, Math.trunc(numberValue(source.perStudentDailyLimit) || 1));
  return {id, name, description, icon, price, dailyStock, perStudentDailyLimit,
    approvalRequired: source.approvalRequired !== false,
    active: source.active !== false, deleted: source.deleted === true};
}

async function verifiedTeacherClass(request, classIdInput) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Teacher authentication is required.");
  const classId = stringValue(classIdInput).trim();
  if (!classId) throw new HttpsError("invalid-argument", "classId is required.");
  const db = getFirestore();
  const classRef = db.doc(`classes/${classId}`);
  const classSnapshot = await classRef.get();
  if (!classSnapshot.exists || classSnapshot.data()?.ownerUid !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Class owner permission is required.");
  }
  return {db, classId, classRef, uid: request.auth.uid};
}

function shopRequestCounts(docs, itemId, studentId = "", excludeId = "") {
  const matching = docs.map((doc) => ({id: doc.id, ...(doc.data() || {})}))
      .filter((entry) => entry.id !== excludeId && entry.itemId === itemId &&
        ["pending", "completed"].includes(entry.status));
  return {total: matching.length, student: studentId ? matching.filter((entry) => entry.studentId === studentId).length : 0,
    pending: studentId ? matching.some((entry) => entry.studentId === studentId && entry.status === "pending") : false};
}

function pointShopStatus(item, counts, points) {
  if (!item.active || item.deleted) return "inactive";
  if (counts.pending) return "pending";
  if (counts.total >= item.dailyStock) return "sold-out";
  if (counts.student >= item.perStudentDailyLimit) return "limit-reached";
  if (points < item.price) return "insufficient";
  return "available";
}

exports.getPointShopData = onCall({region: "asia-northeast3"}, async (request) => {
  const mode = stringValue(request.data?.mode);
  const date = seoulDateKey();
  if (mode === "teacher") {
    const context = await verifiedTeacherClass(request, request.data?.classId);
    const [itemsSnapshot, requestsSnapshot] = await Promise.all([
      context.classRef.collection("pointShopItems").get(),
      context.classRef.collection("pointUseRequests").where("date", "==", date).get(),
    ]);
    return {ok: true, date, items: itemsSnapshot.docs.map((doc) => ({...normalizedShopItem(doc.data(), doc.id),
      createdAt: timestampMillis(doc.data()?.createdAt) ? new Date(timestampMillis(doc.data().createdAt)).toISOString() : "",
      updatedAt: timestampMillis(doc.data()?.updatedAt) ? new Date(timestampMillis(doc.data().updatedAt)).toISOString() : ""})),
    requests: requestsSnapshot.docs.map((doc) => ({id: doc.id, ...(doc.data() || {}), createdAt: timestampMillis(doc.data()?.createdAt) ? new Date(timestampMillis(doc.data().createdAt)).toISOString() : "", resolvedAt: timestampMillis(doc.data()?.resolvedAt) ? new Date(timestampMillis(doc.data().resolvedAt)).toISOString() : null}))};
  }
  const context = await verifiedStudentContext(request);
  const classRef = context.db.doc(`classes/${context.classId}`);
  const [itemsSnapshot, requestsSnapshot, pointSnapshot] = await Promise.all([
    classRef.collection("pointShopItems").get(),
    classRef.collection("pointUseRequests").where("date", "==", date).get(),
    classRef.collection("studentPointStates").doc(context.studentId).get(),
  ]);
  const points = Math.max(0, Math.trunc(numberValue(pointSnapshot.data()?.points)));
  const items = itemsSnapshot.docs.map((doc) => normalizedShopItem(doc.data(), doc.id))
      .filter((item) => item.active && !item.deleted && item.name).map((item) => {
        const counts = shopRequestCounts(requestsSnapshot.docs, item.id, context.studentId);
        return {...item, remainingStock: Math.max(0, item.dailyStock - counts.total), studentUsed: counts.student,
          status: pointShopStatus(item, counts, points)};
      });
  return {ok: true, date, points, items};
});

exports.savePointShopProduct = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const action = stringValue(request.data?.action) || "save";
  if (action === "migrate") {
    const items = Array.isArray(request.data?.items) ? request.data.items.slice(0, 200) : [];
    const collectionRef = context.classRef.collection("pointShopItems");
    const result = await context.db.runTransaction(async (transaction) => {
      const existing = await transaction.get(collectionRef.limit(1));
      if (!existing.empty) return {migrated: false, reason: "cloud-not-empty"};
      const timestamp = FieldValue.serverTimestamp();
      let count = 0;
      items.forEach((source) => {
        const item = normalizedShopItem(source, stringValue(source?.id));
        if (!item.id || !item.name) return;
        transaction.set(collectionRef.doc(item.id), {...item, createdAt: timestamp, updatedAt: timestamp});
        count += 1;
      });
      return {migrated: true, count};
    });
    return {ok: true, ...result};
  }
  const item = normalizedShopItem(request.data?.item, stringValue(request.data?.item?.id));
  if (!item.id || !item.name) throw new HttpsError("invalid-argument", "Valid product data is required.");
  const ref = context.classRef.collection("pointShopItems").doc(item.id);
  const snapshot = await ref.get();
  await ref.set({...item, createdAt: snapshot.exists && snapshot.data()?.createdAt ? snapshot.data().createdAt : FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp()});
  return {ok: true, item};
});

exports.studentUsePointProduct = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedStudentContext(request);
  const itemId = stringValue(request.data?.itemId).trim();
  if (!itemId) throw new HttpsError("invalid-argument", "itemId is required.");
  const classRef = context.db.doc(`classes/${context.classId}`);
  const itemRef = classRef.collection("pointShopItems").doc(itemId);
  const pointRef = classRef.collection("studentPointStates").doc(context.studentId);
  const studentRef = classRef.collection("students").doc(context.studentId);
  const date = seoulDateKey();
  const requestRef = classRef.collection("pointUseRequests").doc(randomUUID());
  const historyRef = classRef.collection("pointHistory").doc(`${context.studentId}_${randomUUID()}`);
  return context.db.runTransaction(async (transaction) => {
    const dailyQuery = classRef.collection("pointUseRequests").where("date", "==", date);
    const [itemSnapshot, pointSnapshot, studentSnapshot, requestsSnapshot] = await Promise.all([
      transaction.get(itemRef), transaction.get(pointRef), transaction.get(studentRef), transaction.get(dailyQuery),
    ]);
    const item = itemSnapshot.exists ? normalizedShopItem(itemSnapshot.data(), itemSnapshot.id) : null;
    if (!item || !item.name || !item.active || item.deleted) throw new HttpsError("failed-precondition", "point-shop/inactive");
    if (!studentSnapshot.exists || studentSnapshot.data()?.active === false) throw new HttpsError("permission-denied", "Student is inactive.");
    const points = Math.max(0, Math.trunc(numberValue(pointSnapshot.data()?.points)));
    const counts = shopRequestCounts(requestsSnapshot.docs, item.id, context.studentId);
    const status = pointShopStatus(item, counts, points);
    if (status !== "available") throw new HttpsError("failed-precondition", `point-shop/${status}`);
    const timestamp = FieldValue.serverTimestamp();
    const baseRequest = {id: requestRef.id, classId: context.classId, itemId: item.id, itemName: item.name,
      studentId: context.studentId, date, price: item.price, approvalRequired: item.approvalRequired,
      status: item.approvalRequired ? "pending" : "completed", createdAt: timestamp,
      resolvedAt: item.approvalRequired ? null : timestamp, resolvedBy: item.approvalRequired ? null : "system"};
    transaction.create(requestRef, baseRequest);
    if (!item.approvalRequired) {
      const nextPoints = points - item.price;
      const entryId = historyRef.id;
      transaction.set(pointRef, {id: context.studentId, points: nextPoints, updatedAt: timestamp}, {merge: true});
      transaction.create(historyRef, {id: entryId, studentId: context.studentId,
        entry: {id: entryId, amount: -item.price, reason: item.name, source: "포인트 상품", relatedId: requestRef.id,
          date: new Date().toLocaleDateString("ko-KR", {timeZone: "Asia/Seoul"}), createdAt: timestamp}, createdAt: timestamp});
    }
    return {ok: true, requestId: requestRef.id, status: baseRequest.status, points: item.approvalRequired ? points : points - item.price};
  });
});

exports.resolvePointUseRequest = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const requestId = stringValue(request.data?.requestId).trim();
  const decision = stringValue(request.data?.decision);
  if (!requestId || !["approve", "reject"].includes(decision)) throw new HttpsError("invalid-argument", "Valid requestId and decision are required.");
  const useRef = context.classRef.collection("pointUseRequests").doc(requestId);
  return context.db.runTransaction(async (transaction) => {
    const useSnapshot = await transaction.get(useRef);
    if (!useSnapshot.exists || useSnapshot.data()?.status !== "pending") throw new HttpsError("failed-precondition", "point-shop/already-resolved");
    const use = useSnapshot.data();
    const timestamp = FieldValue.serverTimestamp();
    if (decision === "reject") {
      transaction.update(useRef, {status: "rejected", resolvedAt: timestamp, resolvedBy: context.uid});
      return {ok: true, status: "rejected"};
    }
    const itemRef = context.classRef.collection("pointShopItems").doc(stringValue(use.itemId));
    const pointRef = context.classRef.collection("studentPointStates").doc(stringValue(use.studentId));
    const studentRef = context.classRef.collection("students").doc(stringValue(use.studentId));
    const dailyQuery = context.classRef.collection("pointUseRequests").where("date", "==", stringValue(use.date));
    const [itemSnapshot, pointSnapshot, studentSnapshot, requestsSnapshot] = await Promise.all([
      transaction.get(itemRef), transaction.get(pointRef), transaction.get(studentRef), transaction.get(dailyQuery),
    ]);
    const item = itemSnapshot.exists ? normalizedShopItem(itemSnapshot.data(), itemSnapshot.id) : null;
    if (!item || !item.active || item.deleted || item.price !== numberValue(use.price)) throw new HttpsError("failed-precondition", "point-shop/product-changed");
    if (!studentSnapshot.exists || studentSnapshot.data()?.active === false) throw new HttpsError("failed-precondition", "point-shop/student-inactive");
    const points = Math.max(0, Math.trunc(numberValue(pointSnapshot.data()?.points)));
    if (points < item.price) throw new HttpsError("failed-precondition", "point-shop/insufficient");
    const counts = shopRequestCounts(requestsSnapshot.docs, item.id, stringValue(use.studentId), requestId);
    if (counts.total >= item.dailyStock) throw new HttpsError("failed-precondition", "point-shop/sold-out");
    if (counts.student >= item.perStudentDailyLimit) throw new HttpsError("failed-precondition", "point-shop/limit-reached");
    const historyRef = context.classRef.collection("pointHistory").doc(`${use.studentId}_${randomUUID()}`);
    transaction.set(pointRef, {id: use.studentId, points: points - item.price, updatedAt: timestamp}, {merge: true});
    transaction.update(useRef, {status: "completed", resolvedAt: timestamp, resolvedBy: context.uid});
    transaction.create(historyRef, {id: historyRef.id, studentId: use.studentId,
      entry: {id: historyRef.id, amount: -item.price, reason: item.name, source: "포인트 상품", relatedId: requestId,
        date: new Date().toLocaleDateString("ko-KR", {timeZone: "Asia/Seoul"}), createdAt: timestamp}, createdAt: timestamp});
    return {ok: true, status: "completed", points: points - item.price};
  });
});

exports.reversePointProductUse = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const requestId = stringValue(request.data?.requestId).trim();
  if (!requestId) throw new HttpsError("invalid-argument", "requestId is required.");
  const useRef = context.classRef.collection("pointUseRequests").doc(requestId);
  return context.db.runTransaction(async (transaction) => {
    const useSnapshot = await transaction.get(useRef);
    if (!useSnapshot.exists) throw new HttpsError("not-found", "point-shop/request-not-found");
    const use = useSnapshot.data() || {};
    if (use.status === "reversed" || use.reversedAt) throw new HttpsError("already-exists", "point-shop/already-reversed");
    if (use.status !== "completed") throw new HttpsError("failed-precondition", "point-shop/not-completed");
    const studentId = stringValue(use.studentId);
    const itemId = stringValue(use.itemId);
    const price = Math.max(0, Math.trunc(numberValue(use.price)));
    if (!studentId || !itemId) throw new HttpsError("failed-precondition", "point-shop/invalid-request");
    const pointRef = context.classRef.collection("studentPointStates").doc(studentId);
    const studentRef = context.classRef.collection("students").doc(studentId);
    const itemRef = context.classRef.collection("pointShopItems").doc(itemId);
    const historyQuery = context.classRef.collection("pointHistory").where("entry.relatedId", "==", requestId);
    const [pointSnapshot, studentSnapshot, itemSnapshot, historySnapshot] = await Promise.all([
      transaction.get(pointRef), transaction.get(studentRef), transaction.get(itemRef), transaction.get(historyQuery),
    ]);
    if (!pointSnapshot.exists || !studentSnapshot.exists) throw new HttpsError("failed-precondition", "point-shop/student-not-found");
    const originalHistory = historySnapshot.docs.find((doc) => {
      const entry = doc.data()?.entry || {};
      return stringValue(doc.data()?.studentId) === studentId && stringValue(entry.relatedId) === requestId &&
        numberValue(entry.amount) === -price && stringValue(entry.source).includes("포인트 상품");
    });
    if (!originalHistory) throw new HttpsError("failed-precondition", "point-shop/original-history-not-found");
    const reversalRef = context.classRef.collection("pointHistory").doc(`${studentId}_point-product-reversal_${requestId}`);
    if (historySnapshot.docs.some((doc) => doc.id === reversalRef.id || stringValue(doc.data()?.entry?.reversalOf) === originalHistory.id)) {
      throw new HttpsError("already-exists", "point-shop/already-reversed");
    }
    const itemName = stringValue(itemSnapshot.data()?.name) || stringValue(use.itemName) || stringValue(originalHistory.data()?.entry?.reason) || "포인트 상품";
    const points = Math.max(0, Math.trunc(numberValue(pointSnapshot.data()?.points)));
    const timestamp = FieldValue.serverTimestamp();
    transaction.set(pointRef, {id: studentId, points: points + price, updatedAt: timestamp}, {merge: true});
    transaction.create(reversalRef, {id: reversalRef.id, studentId,
      entry: {id: reversalRef.id, amount: price, reason: `${itemName} 사용 취소`, source: "포인트 상품",
        relatedId: requestId, reversalOf: originalHistory.id,
        date: new Date().toLocaleDateString("ko-KR", {timeZone: "Asia/Seoul"}), createdAt: timestamp}, createdAt: timestamp});
    transaction.update(useRef, {status: "reversed", reversedAt: timestamp, reversedBy: context.uid,
      reversalHistoryId: reversalRef.id, originalHistoryId: originalHistory.id});
    return {ok: true, status: "reversed", requestId, studentId, itemId, points: points + price, refundedPoints: price};
  });
});

function normalizedPointGiftSettings(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const positiveInteger = (input, fallback) => {
    const parsed = Math.trunc(numberValue(input));
    return parsed > 0 ? parsed : fallback;
  };
  return {
    enabled: source.enabled === true,
    maxPointsPerTransfer: positiveInteger(source.maxPointsPerTransfer ?? source.maxPerTransfer, 10),
    maxPointsPerDay: positiveInteger(source.maxPointsPerDay ?? source.dailyMaxAmount, 20),
    maxTransfersPerDay: positiveInteger(source.maxTransfersPerDay ?? source.dailyMaxCount, 3),
  };
}

function safePointGift(doc) {
  const value = doc.data() || {};
  return {
    id: doc.id,
    senderStudentId: stringValue(value.senderStudentId),
    senderName: stringValue(value.senderName),
    receiverStudentId: stringValue(value.receiverStudentId),
    receiverName: stringValue(value.receiverName),
    amount: Math.max(0, Math.trunc(numberValue(value.amount))),
    date: stringValue(value.date),
    createdAt: timestampMillis(value.createdAt) ? new Date(timestampMillis(value.createdAt)).toISOString() : "",
  };
}

exports.getPointGiftData = onCall({region: "asia-northeast3"}, async (request) => {
  const mode = stringValue(request.data?.mode);
  if (mode === "teacher") {
    const context = await verifiedTeacherClass(request, request.data?.classId);
    const [settingsSnapshot, historySnapshot] = await Promise.all([
      context.classRef.collection("pointGiftSettings").doc("config").get(),
      context.classRef.collection("pointGiftHistory").get(),
    ]);
    return {ok: true, settingsExists: settingsSnapshot.exists,
      settings: settingsSnapshot.exists ? normalizedPointGiftSettings(settingsSnapshot.data()) : null,
      history: historySnapshot.docs.map(safePointGift).sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt))};
  }

  const context = await verifiedStudentContext(request);
  const classRef = context.db.doc(`classes/${context.classId}`);
  const date = seoulDateKey();
  const [settingsSnapshot, studentsSnapshot, todaySnapshot] = await Promise.all([
    classRef.collection("pointGiftSettings").doc("config").get(),
    classRef.collection("students").get(),
    classRef.collection("pointGiftHistory").where("date", "==", date).get(),
  ]);
  const settings = settingsSnapshot.exists ? normalizedPointGiftSettings(settingsSnapshot.data()) : normalizedPointGiftSettings({});
  const today = todaySnapshot.docs.map(safePointGift).filter((gift) => gift.senderStudentId === context.studentId);
  const friends = studentsSnapshot.docs.map((doc) => ({
    studentId: doc.id,
    name: stringValue(doc.data()?.name) || "학생",
    active: doc.data()?.active !== false,
  })).filter((student) => student.active && student.studentId !== context.studentId)
      .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  return {ok: true, date, settings, friends,
    usage: {count: today.length, amount: today.reduce((sum, gift) => sum + gift.amount, 0)}};
});

exports.savePointGiftSettings = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const settings = normalizedPointGiftSettings(request.data?.settings);
  const action = stringValue(request.data?.action) || "save";
  const settingsRef = context.classRef.collection("pointGiftSettings").doc("config");
  return context.db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(settingsRef);
    if (action === "migrate" && snapshot.exists) {
      return {ok: true, migrated: false, settings: normalizedPointGiftSettings(snapshot.data())};
    }
    const timestamp = FieldValue.serverTimestamp();
    transaction.set(settingsRef, {...settings, updatedAt: timestamp, updatedBy: context.uid,
      ...(snapshot.exists ? {} : {createdAt: timestamp})}, {merge: true});
    return {ok: true, migrated: action === "migrate", settings};
  });
});

exports.studentGiftPoints = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedStudentContext(request);
  const receiverStudentId = stringValue(request.data?.receiverStudentId).trim();
  const rawAmount = Number(request.data?.amount);
  if (!receiverStudentId || receiverStudentId === context.studentId) {
    throw new HttpsError("invalid-argument", "point-gift/invalid-recipient");
  }
  if (!Number.isInteger(rawAmount) || rawAmount <= 0) {
    throw new HttpsError("invalid-argument", "point-gift/invalid-amount");
  }
  const amount = rawAmount;
  const classRef = context.db.doc(`classes/${context.classId}`);
  const date = seoulDateKey();
  const giftId = randomUUID();
  const settingsRef = classRef.collection("pointGiftSettings").doc("config");
  const senderRef = classRef.collection("students").doc(context.studentId);
  const receiverRef = classRef.collection("students").doc(receiverStudentId);
  const senderPointRef = classRef.collection("studentPointStates").doc(context.studentId);
  const receiverPointRef = classRef.collection("studentPointStates").doc(receiverStudentId);
  const usageRef = classRef.collection("pointGiftDailyUsage").doc(`${date}_${context.studentId}`);
  const giftRef = classRef.collection("pointGiftHistory").doc(giftId);
  const todayQuery = classRef.collection("pointGiftHistory").where("date", "==", date);

  return context.db.runTransaction(async (transaction) => {
    const [settingsSnapshot, senderSnapshot, receiverSnapshot, senderPointSnapshot,
      receiverPointSnapshot, usageSnapshot, todaySnapshot] = await Promise.all([
      transaction.get(settingsRef), transaction.get(senderRef), transaction.get(receiverRef),
      transaction.get(senderPointRef), transaction.get(receiverPointRef), transaction.get(usageRef), transaction.get(todayQuery),
    ]);
    if (!settingsSnapshot.exists) throw new HttpsError("failed-precondition", "point-gift/disabled");
    const settings = normalizedPointGiftSettings(settingsSnapshot.data());
    if (!settings.enabled) throw new HttpsError("failed-precondition", "point-gift/disabled");
    if (!senderSnapshot.exists || senderSnapshot.data()?.active === false ||
        !receiverSnapshot.exists || receiverSnapshot.data()?.active === false) {
      throw new HttpsError("failed-precondition", "point-gift/student-inactive");
    }
    if (amount > settings.maxPointsPerTransfer) throw new HttpsError("failed-precondition", "point-gift/transfer-limit");
    const senderPoints = Math.max(0, Math.trunc(numberValue(senderPointSnapshot.data()?.points)));
    const receiverPoints = Math.max(0, Math.trunc(numberValue(receiverPointSnapshot.data()?.points)));
    if (senderPoints < amount) throw new HttpsError("failed-precondition", "point-gift/insufficient");
    const usage = usageSnapshot.exists ? usageSnapshot.data() || {} : {};
    const existingToday = todaySnapshot.docs.map(safePointGift).filter((gift) => gift.senderStudentId === context.studentId);
    const historyCount = existingToday.length;
    const historyAmount = existingToday.reduce((sum, gift) => sum + gift.amount, 0);
    const usedCount = Math.max(historyCount, Math.max(0, Math.trunc(numberValue(usage.count))));
    const usedAmount = Math.max(historyAmount, Math.max(0, Math.trunc(numberValue(usage.amount))));
    if (usedCount + 1 > settings.maxTransfersPerDay) throw new HttpsError("failed-precondition", "point-gift/daily-count-limit");
    if (usedAmount + amount > settings.maxPointsPerDay) throw new HttpsError("failed-precondition", "point-gift/daily-amount-limit");

    const timestamp = FieldValue.serverTimestamp();
    const senderName = stringValue(senderSnapshot.data()?.name) || "학생";
    const receiverName = stringValue(receiverSnapshot.data()?.name) || "학생";
    const senderHistoryRef = classRef.collection("pointHistory").doc(`${context.studentId}_gift_${giftId}`);
    const receiverHistoryRef = classRef.collection("pointHistory").doc(`${receiverStudentId}_gift_${giftId}`);
    const localizedDate = new Date().toLocaleDateString("ko-KR", {timeZone: "Asia/Seoul"});
    transaction.set(senderPointRef, {id: context.studentId, points: senderPoints - amount, updatedAt: timestamp}, {merge: true});
    transaction.set(receiverPointRef, {id: receiverStudentId, points: receiverPoints + amount, updatedAt: timestamp}, {merge: true});
    transaction.set(usageRef, {date, studentId: context.studentId, count: usedCount + 1,
      amount: usedAmount + amount, updatedAt: timestamp}, {merge: true});
    transaction.create(giftRef, {id: giftId, senderStudentId: context.studentId, senderName,
      receiverStudentId, receiverName, amount, date, createdAt: timestamp});
    transaction.create(senderHistoryRef, {id: senderHistoryRef.id, studentId: context.studentId,
      entry: {id: senderHistoryRef.id, amount: -amount, reason: `${receiverName}에게 선물`, source: "친구 선물",
        relatedId: giftId, date: localizedDate, createdAt: timestamp}, createdAt: timestamp});
    transaction.create(receiverHistoryRef, {id: receiverHistoryRef.id, studentId: receiverStudentId,
      entry: {id: receiverHistoryRef.id, amount, reason: `${senderName}에게 받음`, source: "친구 선물",
        relatedId: giftId, date: localizedDate, createdAt: timestamp}, createdAt: timestamp});
    return {ok: true, giftId, points: senderPoints - amount};
  });
});

const CARD_RARITIES = ["일반", "희귀", "영웅", "전설", "고대"];
const CARD_RATE_KEYS = {"일반": "common", "희귀": "rare", "영웅": "epic", "전설": "legendary", "고대": "ancient"};
const FIXED_CARD_DRAW_OPTION_IDS = new Set(["draw-basic", "draw-premium"]);

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizedCardSet(value, fallbackId = "") {
  const source = plainObject(value);
  return {id: stringValue(source.id).trim() || fallbackId, name: stringValue(source.name).trim().slice(0, 50) || "이름 없는 카드셋",
    description: stringValue(source.description).trim().slice(0, 200), active: source.active !== false, deleted: source.deleted === true,
    createdAt: stringValue(source.createdAt)};
}

function normalizedCard(value, fallbackId = "") {
  const source = plainObject(value);
  const imageData = stringValue(source.imageData);
  return {id: stringValue(source.id).trim() || fallbackId, cardSetId: stringValue(source.cardSetId).trim(),
    name: stringValue(source.name).trim().slice(0, 40) || "이름 없는 인물", era: stringValue(source.era).trim().slice(0, 40),
    achievement: stringValue(source.achievement).trim().slice(0, 160),
    imageData: imageData.startsWith("data:image/") && imageData.length <= 900000 ? imageData : "",
    imagePath: stringValue(source.imagePath).trim().slice(0, 300), imageUrl: stringValue(source.imageUrl).trim().slice(0, 2000),
    imageUpdatedAt: stringValue(source.imageUpdatedAt).trim().slice(0, 60),
    order: Math.trunc(numberValue(source.order)), active: source.active !== false, deleted: source.deleted === true};
}

function normalizedDrawOption(value, fallbackId = "") {
  const source = plainObject(value); const rates = plainObject(source.rates);
  return {id: stringValue(source.id).trim() || fallbackId, name: stringValue(source.name).trim().slice(0, 40) || "카드 뽑기",
    price: Math.max(0, Math.trunc(numberValue(source.price))), active: source.active !== false, deleted: source.deleted === true,
    rates: Object.fromEntries(Object.values(CARD_RATE_KEYS).map((key) => [key, numberValue(rates[key])]))};
}

function normalizedCardAbility(value, fallbackId = "") {
  const source = plainObject(value); const targets = plainObject(source.targets);
  return {id: stringValue(source.id).trim() || fallbackId, name: stringValue(source.name).trim().slice(0, 40) || "특수능력",
    icon: stringValue(source.icon).trim().slice(0, 12), description: stringValue(source.description).trim().slice(0, 120),
    weight: Math.min(100000, Math.max(1, Math.trunc(numberValue(source.weight) || 1))), targets: {assignments: targets.assignments === true, roles: targets.roles === true},
    active: source.active !== false, deleted: source.deleted === true};
}

function normalizedCardConfig(value) {
  const source = plainObject(value);
  const activeCardSetIds = Array.isArray(source.activeCardSetIds) ? [...new Set(source.activeCardSetIds.map(stringValue).filter(Boolean))] : [];
  const drawOptions = Array.isArray(source.drawOptions) ? source.drawOptions.map((item, index) => normalizedDrawOption(item, `draw-${index + 1}`)) : [];
  const cardAbilities = Array.isArray(source.cardAbilities) ? source.cardAbilities.map((item, index) => normalizedCardAbility(item, `ability-${index + 1}`)) : [];
  const cardAbilitySettings = Object.fromEntries(CARD_RARITIES.map((rarity) => {
    const setting = plainObject(plainObject(source.cardAbilitySettings)[rarity]);
    const effects = plainObject(setting.abilities);
    return [rarity, {dailyCap: Math.max(0, Math.trunc(numberValue(setting.dailyCap))), abilities: Object.fromEntries(cardAbilities.map((ability) => {
      const effect = plainObject(effects[ability.id]);
      return [ability.id, {assignmentPercent: Math.max(0, Math.min(100, numberValue(effect.assignmentPercent))),
        rolePercent: Math.max(0, Math.min(100, numberValue(effect.rolePercent)))}];
    }))}];
  }));
  const upgrades = plainObject(source.cardUpgradeSettings);
  return {activeCardSetIds, drawOptions, cardAbilities, cardAbilitySettings,
    cardUpgradeSettings: {commonToRare: Math.max(2, Math.trunc(numberValue(upgrades.commonToRare) || 3)),
      rareToEpic: Math.max(2, Math.trunc(numberValue(upgrades.rareToEpic) || 3)),
      epicToLegendary: Math.max(2, Math.trunc(numberValue(upgrades.epicToLegendary) || 4)),
      legendaryToAncient: Math.max(2, Math.trunc(numberValue(upgrades.legendaryToAncient) || 5))}};
}

function cardTimestamp(value) {
  const millis = timestampMillis(value); return millis ? new Date(millis).toISOString() : stringValue(value);
}

async function readCardConfig(classRef) {
  const [configSnapshot, setsSnapshot, cardsSnapshot] = await Promise.all([
    classRef.collection("cardSettings").doc("config").get(), classRef.collection("cardSets").get(), classRef.collection("cards").get(),
  ]);
  const config = configSnapshot.exists ? normalizedCardConfig(configSnapshot.data()) : normalizedCardConfig({});
  return {exists: configSnapshot.exists || setsSnapshot.size > 0 || cardsSnapshot.size > 0, config,
    cardSets: setsSnapshot.docs.map((doc) => ({...normalizedCardSet(doc.data(), doc.id), createdAt: cardTimestamp(doc.data()?.createdAt)})),
    cards: cardsSnapshot.docs.map((doc) => normalizedCard(doc.data(), doc.id))};
}

exports.getCardConfig = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const value = await readCardConfig(context.classRef);
  return {ok: true, ...value};
});

exports.getTeacherStudentCardData = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const studentId = stringValue(request.data?.studentId).trim();
  if (!studentId) throw new HttpsError("invalid-argument", "teacher-card/student-required");
  const studentSnapshot = await context.classRef.collection("students").doc(studentId).get();
  if (!studentSnapshot.exists || studentSnapshot.data()?.active === false) {
    throw new HttpsError("not-found", "teacher-card/student-not-found");
  }
  const [inventorySnapshot, cardsSnapshot, cardSetsSnapshot, configSnapshot] = await Promise.all([
    context.classRef.collection("studentCardInventories").doc(studentId).get(),
    context.classRef.collection("cards").get(),
    context.classRef.collection("cardSets").get(),
    context.classRef.collection("cardSettings").doc("config").get(),
  ]);
  const inventory = inventorySnapshot.exists ? plainObject(inventorySnapshot.data()) : {};
  const inventoryCards = plainObject(inventory.cards); const config = normalizedCardConfig(configSnapshot.data());
  const cardsById = new Map(cardsSnapshot.docs.map((doc) => [doc.id, normalizedCard(doc.data(), doc.id)]));
  const items = [];
  Object.entries(inventoryCards).forEach(([cardId, byRarity]) => CARD_RARITIES.forEach((rarity) =>
    Object.entries(plainObject(plainObject(byRarity)[rarity])).forEach(([abilityId, countValue]) => {
      const count = Math.max(0, Math.trunc(numberValue(countValue))); const card = cardsById.get(cardId);
      if (!count || !card) return;
      const ability = config.cardAbilities.find((item) => item.id === abilityId);
      items.push({cardId, cardName: card.name, cardSetId: card.cardSetId, rarity, abilityId, count,
        ability: ability ? abilityEffect(config, rarity, ability) : {id: abilityId, name: "삭제된 능력", icon: "✨", summary: "현재 설정에 없는 능력"},
        imageData: card.imageUrl || card.imageData, era: card.era, achievement: card.achievement});
    })));
  return {ok: true, studentId, items, representativeCard: inventory.representativeCard || null,
    cardSets: cardSetsSnapshot.docs.map((doc) => ({...normalizedCardSet(doc.data(), doc.id), createdAt: cardTimestamp(doc.data()?.createdAt)}))};
});

exports.getTeacherStudentRepresentativeCards = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const [studentsSnapshot, inventoriesSnapshot, cardsSnapshot, configSnapshot] = await Promise.all([
    context.classRef.collection("students").get(),
    context.classRef.collection("studentCardInventories").get(),
    context.classRef.collection("cards").get(),
    context.classRef.collection("cardSettings").doc("config").get(),
  ]);
  const activeStudentIds = new Set(studentsSnapshot.docs
      .filter((doc) => doc.data()?.active !== false)
      .map((doc) => doc.id));
  const cardsById = new Map(cardsSnapshot.docs.map((doc) => [doc.id, normalizedCard(doc.data(), doc.id)]));
  const config = normalizedCardConfig(configSnapshot.data());
  const representatives = Object.fromEntries([...activeStudentIds].map((studentId) => [studentId, null]));
  inventoriesSnapshot.docs.forEach((snapshot) => {
    const studentId = snapshot.id;
    if (!activeStudentIds.has(studentId)) return;
    const inventory = plainObject(snapshot.data());
    const representativeCard = plainObject(inventory.representativeCard);
    const cardId = stringValue(representativeCard.cardId).trim();
    const rarity = stringValue(representativeCard.rarity).trim();
    const abilityId = stringValue(representativeCard.abilityId).trim();
    const count = Math.max(0, Math.trunc(numberValue(
        plainObject(plainObject(plainObject(inventory.cards)[cardId])[rarity])[abilityId],
    )));
    const card = cardsById.get(cardId);
    if (!cardId || !CARD_RARITIES.includes(rarity) || !abilityId || count < 1 || !card) return;
    const ability = config.cardAbilities.find((item) => item.id === abilityId);
    representatives[studentId] = {
      studentId,
      representativeCard: {cardId, rarity, abilityId},
      cardName: card.name,
      abilityName: ability?.name || "삭제된 능력",
      abilityIcon: ability?.icon || "✨",
    };
  });
  return {ok: true, representatives};
});

exports.setStudentRepresentativeCard = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedStudentContext(request);
  const cardId = stringValue(request.data?.cardId).trim(); const rarity = stringValue(request.data?.rarity).trim(); const abilityId = stringValue(request.data?.abilityId).trim();
  if (!cardId || !CARD_RARITIES.includes(rarity) || !abilityId) throw new HttpsError("invalid-argument", "representative-card/invalid-selection");
  const classRef = context.db.doc(`classes/${context.classId}`); const inventoryRef = classRef.collection("studentCardInventories").doc(context.studentId); const cardRef = classRef.collection("cards").doc(cardId); const configRef = classRef.collection("cardSettings").doc("config");
  await context.db.runTransaction(async (transaction) => {
    const [inventorySnapshot, cardSnapshot, configSnapshot] = await Promise.all([transaction.get(inventoryRef), transaction.get(cardRef), transaction.get(configRef)]);
    if (!cardSnapshot.exists) throw new HttpsError("not-found", "representative-card/card-not-found");
    if (normalizedCard(cardSnapshot.data(), cardSnapshot.id).deleted) throw new HttpsError("failed-precondition", "representative-card/card-unavailable");
    const ability = normalizedCardConfig(configSnapshot.data()).cardAbilities.find((item) => item.id === abilityId);
    if (!ability || ability.deleted) throw new HttpsError("failed-precondition", "representative-card/ability-unavailable");
    const inventory = inventorySnapshot.exists ? plainObject(inventorySnapshot.data()) : {};
    const count = Math.max(0, Math.trunc(numberValue(plainObject(plainObject(plainObject(inventory.cards)[cardId])[rarity])[abilityId])));
    if (count < 1) throw new HttpsError("failed-precondition", "representative-card/not-owned");
    transaction.set(inventoryRef, {id: context.studentId, studentId: context.studentId, representativeCard: {cardId, rarity, abilityId}, updatedAt: FieldValue.serverTimestamp()}, {merge: true});
  });
  return {ok: true, representativeCard: {cardId, rarity, abilityId}};
});

exports.saveCardPortrait = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const cardId = stringValue(request.data?.cardId).trim(); const action = stringValue(request.data?.action).trim() || "save";
  if (!cardId) throw new HttpsError("invalid-argument", "card-portrait/card-required");
  const cardRef = context.classRef.collection("cards").doc(cardId); const cardSnapshot = await cardRef.get();
  if (!cardSnapshot.exists) throw new HttpsError("not-found", "card-portrait/card-not-found");
  const previous = normalizedCard(cardSnapshot.data(), cardId); const bucket = getStorage().bucket(); const imageUpdatedAt = new Date().toISOString();
  if (action === "delete") {
    await cardRef.set({imageData: "", imagePath: "", imageUrl: "", imageUpdatedAt, updatedAt: FieldValue.serverTimestamp()}, {merge: true});
    if (previous.imagePath) await bucket.file(previous.imagePath).delete({ignoreNotFound: true});
    return {ok: true, imagePath: "", imageUrl: "", imageUpdatedAt};
  }
  const match = stringValue(request.data?.imageData).match(/^data:image\/webp;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new HttpsError("invalid-argument", "card-portrait/webp-required");
  const buffer = Buffer.from(match[1], "base64"); if (!buffer.length || buffer.length > 2 * 1024 * 1024) throw new HttpsError("invalid-argument", "card-portrait/file-too-large");
  const imagePath = `classes/${context.classId}/cards/${cardId}/portrait.webp`; const token = randomUUID(); const file = bucket.file(imagePath);
  try { await file.save(buffer, {resumable: false, contentType: "image/webp", metadata: {cacheControl: "public,max-age=3600", metadata: {firebaseStorageDownloadTokens: token}}}); }
  catch (caught) { console.error("card-portrait/storage-upload-failed", {code: caught?.code, message: caught?.message, bucket: bucket.name, imagePath});
    if (Number(caught?.code) === 404) throw new HttpsError("failed-precondition", "card-portrait/storage-bucket-not-found", {stage: "storage", bucket: bucket.name, imagePath});
    throw new HttpsError("internal", "card-portrait/storage-upload-failed", {stage: "storage", code: stringValue(caught?.code), imagePath}); }
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket.name)}/o/${encodeURIComponent(imagePath)}?alt=media&token=${token}`;
  try { await cardRef.set({imageData: "", imagePath, imageUrl, imageUpdatedAt, updatedAt: FieldValue.serverTimestamp()}, {merge: true}); }
  catch (caught) { console.error("card-portrait/firestore-update-failed", {code: caught?.code, message: caught?.message, cardId, imagePath}); throw new HttpsError("internal", "card-portrait/firestore-update-failed", {stage: "firestore", code: stringValue(caught?.code), imagePath}); }
  if (previous.imagePath && previous.imagePath !== imagePath) await bucket.file(previous.imagePath).delete({ignoreNotFound: true});
  return {ok: true, imagePath, imageUrl, imageUpdatedAt};
});

exports.saveCardConfig = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedTeacherClass(request, request.data?.classId);
  const action = stringValue(request.data?.action) || "save";
  const input = plainObject(request.data?.config);
  const config = normalizedCardConfig(input);
  const cardSets = (Array.isArray(input.cardSets) ? input.cardSets : []).map((item, index) => normalizedCardSet(item, `set-${index + 1}`)).filter((item) => item.id);
  const cards = (Array.isArray(input.cards) ? input.cards : []).map((item, index) => normalizedCard(item, `card-${index + 1}`)).filter((item) => item.id);
  const configRef = context.classRef.collection("cardSettings").doc("config");
  if (!cardSets.length || !cards.length) throw new HttpsError("invalid-argument", "card-config/empty");
  if (action === "migrate") {
    return context.db.runTransaction(async (transaction) => {
      const [configSnapshot, setsSnapshot, cardsSnapshot] = await Promise.all([
        transaction.get(configRef), transaction.get(context.classRef.collection("cardSets")), transaction.get(context.classRef.collection("cards")),
      ]);
      if (configSnapshot.exists || setsSnapshot.size || cardsSnapshot.size) return {ok: true, migrated: false};
      const timestamp = FieldValue.serverTimestamp();
      transaction.set(configRef, {...config, updatedAt: timestamp, updatedBy: context.uid});
      cardSets.forEach((cardSet) => transaction.set(context.classRef.collection("cardSets").doc(cardSet.id),
        {...cardSet, createdAt: cardSet.createdAt || timestamp, updatedAt: timestamp}));
      cards.forEach((card) => transaction.set(context.classRef.collection("cards").doc(card.id), {...card, updatedAt: timestamp}));
      return {ok: true, migrated: true, cardSetCount: cardSets.length, cardCount: cards.length};
    });
  }
  const batch = context.db.batch(); const timestamp = FieldValue.serverTimestamp();
  batch.set(configRef, {...config, updatedAt: timestamp, updatedBy: context.uid}, {merge: true});
  cardSets.forEach((cardSet) => batch.set(context.classRef.collection("cardSets").doc(cardSet.id),
    {...cardSet, createdAt: cardSet.createdAt || timestamp, updatedAt: timestamp}, {merge: true}));
  cards.forEach((card) => batch.set(context.classRef.collection("cards").doc(card.id), {...card, updatedAt: timestamp}, {merge: true}));
  await batch.commit();
  return {ok: true, migrated: action === "migrate", cardSetCount: cardSets.length, cardCount: cards.length};
});

function publicDrawData(configValue, points) {
  const activeSets = configValue.cardSets.filter((set) => set.active && !set.deleted && configValue.config.activeCardSetIds.includes(set.id));
  const activeSetIds = new Set(activeSets.map((set) => set.id));
  const cards = configValue.cards.filter((card) => card.active && !card.deleted && activeSetIds.has(card.cardSetId));
  const options = configValue.config.drawOptions.filter((option) => FIXED_CARD_DRAW_OPTION_IDS.has(option.id) && option.active && !option.deleted);
  return {points, drawOptions: options, cardSets: activeSets.map(({id, name}) => ({id, name})), availableCardCount: cards.length};
}

exports.getStudentCardDrawData = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedStudentContext(request);
  const classRef = context.db.doc(`classes/${context.classId}`);
  const [configValue, pointSnapshot] = await Promise.all([readCardConfig(classRef), classRef.collection("studentPointStates").doc(context.studentId).get()]);
  if (!configValue.exists) return {ok: true, configured: false, points: Math.max(0, Math.trunc(numberValue(pointSnapshot.data()?.points))), drawOptions: [], cardSets: [], availableCardCount: 0};
  return {ok: true, configured: true, ...publicDrawData(configValue, Math.max(0, Math.trunc(numberValue(pointSnapshot.data()?.points))))};
});

function secureWeightedPick(items, weightOf) {
  const weighted = items.map((item) => ({item, weight: Math.max(0, Math.trunc(weightOf(item) * 1000))}));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return null;
  let target = randomInt(total);
  for (const entry of weighted) { if (target < entry.weight) return entry.item; target -= entry.weight; }
  return weighted.at(-1)?.item || null;
}

function abilityEffect(config, rarity, ability) {
  const effect = plainObject(plainObject(config.cardAbilitySettings[rarity]).abilities)[ability.id] || {};
  const assignment = ability.targets.assignments ? numberValue(effect.assignmentPercent) : 0;
  const role = ability.targets.roles ? numberValue(effect.rolePercent) : 0;
  const summary = assignment && role ? `과제 +${assignment}% · 1인1역 +${role}%` : assignment ? `과제 +${assignment}%` : role ? `1인1역 +${role}%` : "보너스 없음";
  return {id: ability.id, name: ability.name, icon: ability.icon || "✨", assignmentPercent: assignment, rolePercent: role, summary};
}

exports.studentDrawCard = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedStudentContext(request);
  const drawOptionId = stringValue(request.data?.drawOptionId).trim();
  if (!FIXED_CARD_DRAW_OPTION_IDS.has(drawOptionId)) throw new HttpsError("invalid-argument", "card-draw/invalid-option");
  const classRef = context.db.doc(`classes/${context.classId}`);
  const pointRef = classRef.collection("studentPointStates").doc(context.studentId);
  const inventoryRef = classRef.collection("studentCardInventories").doc(context.studentId);
  const historyId = randomUUID(); const acquisitionRef = classRef.collection("cardAcquisitionHistory").doc(historyId);
  return context.db.runTransaction(async (transaction) => {
    const configRef = classRef.collection("cardSettings").doc("config");
    const setsQuery = classRef.collection("cardSets"); const cardsQuery = classRef.collection("cards");
    const [configSnapshot, setsSnapshot, cardsSnapshot, pointSnapshot, inventorySnapshot] = await Promise.all([
      transaction.get(configRef), transaction.get(setsQuery), transaction.get(cardsQuery), transaction.get(pointRef), transaction.get(inventoryRef),
    ]);
    if (!configSnapshot.exists) throw new HttpsError("failed-precondition", "card-draw/not-configured");
    const config = normalizedCardConfig(configSnapshot.data());
    const option = config.drawOptions.find((item) => item.id === drawOptionId && item.active && !item.deleted);
    if (!option) throw new HttpsError("failed-precondition", "card-draw/invalid-option");
    const rates = CARD_RARITIES.map((rarity) => ({rarity, rate: numberValue(option.rates[CARD_RATE_KEYS[rarity]])}));
    const totalRate = rates.reduce((sum, item) => sum + item.rate, 0);
    if (rates.some((item) => item.rate < 0 || item.rate > 100) || Math.abs(totalRate - 100) >= 0.001) {
      throw new HttpsError("failed-precondition", "card-draw/invalid-rates");
    }
    const rarity = secureWeightedPick(rates, (item) => item.rate)?.rarity;
    const sets = setsSnapshot.docs.map((doc) => normalizedCardSet(doc.data(), doc.id));
    const activeSetIds = new Set(sets.filter((set) => set.active && !set.deleted && config.activeCardSetIds.includes(set.id)).map((set) => set.id));
    const availableCards = cardsSnapshot.docs.map((doc) => normalizedCard(doc.data(), doc.id))
        .filter((card) => card.active && !card.deleted && activeSetIds.has(card.cardSetId));
    if (!rarity || !availableCards.length) throw new HttpsError("failed-precondition", "card-draw/no-cards");
    const card = availableCards[randomInt(availableCards.length)];
    const abilities = config.cardAbilities.filter((ability) => ability.active && !ability.deleted);
    const ability = secureWeightedPick(abilities, (item) => item.weight);
    if (!ability) throw new HttpsError("failed-precondition", "card-draw/no-abilities");
    const points = Math.max(0, Math.trunc(numberValue(pointSnapshot.data()?.points)));
    if (points < option.price) throw new HttpsError("failed-precondition", "card-draw/insufficient");
    const inventory = inventorySnapshot.exists ? plainObject(inventorySnapshot.data()) : {};
    const inventoryCards = structuredClone(plainObject(inventory.cards));
    const cardInventory = plainObject(inventoryCards[card.id]);
    const rarityInventory = plainObject(cardInventory[rarity]);
    const previousCount = Math.max(0, Math.trunc(numberValue(rarityInventory[ability.id])));
    rarityInventory[ability.id] = previousCount + 1; cardInventory[rarity] = rarityInventory; inventoryCards[card.id] = cardInventory;
    const totalOwned = Object.values(cardInventory).reduce((sum, byAbility) => sum + Object.values(plainObject(byAbility)).reduce((inner, count) => inner + Math.max(0, Math.trunc(numberValue(count))), 0), 0);
    const timestamp = FieldValue.serverTimestamp(); const pointHistoryRef = classRef.collection("pointHistory").doc(`${context.studentId}_card-draw_${historyId}`);
    const effect = abilityEffect(config, rarity, ability);
    transaction.set(pointRef, {id: context.studentId, points: points - option.price, updatedAt: timestamp}, {merge: true});
    transaction.set(inventoryRef, {id: context.studentId, studentId: context.studentId, cards: inventoryCards,
      representativeCard: inventory.representativeCard || null, cardUpgradeHistory: Array.isArray(inventory.cardUpgradeHistory) ? inventory.cardUpgradeHistory : [], updatedAt: timestamp}, {merge: true});
    transaction.create(acquisitionRef, {id: historyId, studentId: context.studentId, cardId: card.id, cardName: card.name,
      cardSetId: card.cardSetId, rarity, ability: effect, abilityId: ability.id, drawOptionId: option.id,
      drawOptionName: option.name, price: option.price, createdAt: timestamp});
    transaction.create(pointHistoryRef, {id: pointHistoryRef.id, studentId: context.studentId,
      entry: {id: pointHistoryRef.id, amount: -option.price, reason: option.name, source: "카드 뽑기", relatedId: historyId,
        date: new Date().toLocaleDateString("ko-KR", {timeZone: "Asia/Seoul"}), createdAt: timestamp}, createdAt: timestamp});
    return {ok: true, historyId, points: points - option.price, drawOptionId: option.id, drawOptionName: option.name,
      card: {id: card.id, name: card.name, era: card.era, achievement: card.achievement, imageData: card.imageUrl || card.imageData,
        cardSetId: card.cardSetId, rarity, ability: effect, abilityId: ability.id, count: previousCount + 1, totalOwned}};
  });
});

exports.getStudentCardCollection = onCall({region: "asia-northeast3"}, async (request) => {
  const context = await verifiedStudentContext(request);
  const classRef = context.db.doc(`classes/${context.classId}`);
  const [inventorySnapshot, cardsSnapshot, cardSetsSnapshot, configSnapshot, historySnapshot] = await Promise.all([
    classRef.collection("studentCardInventories").doc(context.studentId).get(), classRef.collection("cards").get(),
    classRef.collection("cardSets").get(),
    classRef.collection("cardSettings").doc("config").get(), classRef.collection("cardAcquisitionHistory").where("studentId", "==", context.studentId).get(),
  ]);
  const inventory = inventorySnapshot.exists ? plainObject(inventorySnapshot.data()) : {};
  const inventoryCards = plainObject(inventory.cards); const config = normalizedCardConfig(configSnapshot.data());
  const cardsById = new Map(cardsSnapshot.docs.map((doc) => [doc.id, normalizedCard(doc.data(), doc.id)]));
  const acquiredAt = new Map(); historySnapshot.docs.forEach((doc) => { const value = doc.data() || {}; const key = `${value.cardId}|${value.rarity}|${value.abilityId}`; const millis = timestampMillis(value.createdAt); if (millis > (acquiredAt.get(key) || 0)) acquiredAt.set(key, millis); });
  const items = [];
  Object.entries(inventoryCards).forEach(([cardId, byRarity]) => CARD_RARITIES.forEach((rarity) => Object.entries(plainObject(plainObject(byRarity)[rarity])).forEach(([abilityId, countValue]) => {
    const count = Math.max(0, Math.trunc(numberValue(countValue))); const card = cardsById.get(cardId); const ability = config.cardAbilities.find((item) => item.id === abilityId);
    if (!count || !card || !ability) return; const millis = acquiredAt.get(`${cardId}|${rarity}|${abilityId}`) || 0;
    items.push({cardId, cardName: card.name, cardSetId: card.cardSetId, rarity, ability: abilityEffect(config, rarity, ability), abilityId,
      count, imageData: card.imageUrl || card.imageData, era: card.era, achievement: card.achievement, acquiredAt: millis ? new Date(millis).toISOString() : ""});
  })));
  return {ok: true, items, representativeCard: inventory.representativeCard || null,
    cardSets: cardSetsSnapshot.docs.map((doc) => ({...normalizedCardSet(doc.data(), doc.id), createdAt: cardTimestamp(doc.data()?.createdAt)})),
    cards: cardsSnapshot.docs.map((doc) => normalizedCard(doc.data(), doc.id)),
    activeCardSetIds: config.activeCardSetIds,
    cardUpgradeSettings: config.cardUpgradeSettings};
});
