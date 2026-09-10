// Shared by the existing teacher callable and the nightly job.
const {FieldValue}=require("firebase-admin/firestore");
const {HttpsError}=require("firebase-functions/v2/https");
const {randomUUID}=require("node:crypto");
const {eligibleToday, dateKey}=require("./approval-date");
const stringValue=value=>typeof value==="string"?value:"";
const numberValue=value=>Number.isFinite(Number(value))?Number(value):0;

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

function shopRequestCounts(docs, itemId, studentId = "", excludeId = "") {
  const matching = docs.map((doc) => ({id: doc.id, ...(doc.data() || {})}))
      .filter((entry) => entry.id !== excludeId && entry.itemId === itemId &&
        ["pending", "completed"].includes(entry.status));
  return {total: matching.length, student: studentId ? matching.filter((entry) => entry.studentId === studentId).length : 0,
    pending: studentId ? matching.some((entry) => entry.studentId === studentId && entry.status === "pending") : false,
    pendingRequestId: studentId ? matching.find((entry) => entry.studentId === studentId && entry.status === "pending")?.id || "" : ""};
}

async function resolvePointUse(context, requestId, decision, automatic = null) {
  const useRef = context.classRef.collection("pointUseRequests").doc(requestId);
  return context.db.runTransaction(async (transaction) => {
    const useSnapshot = await transaction.get(useRef);
    if (!useSnapshot.exists || useSnapshot.data()?.status !== "pending") throw new HttpsError("failed-precondition", "point-shop/already-resolved");
    const use = useSnapshot.data();
    if (automatic) {
      const classSnapshot = await transaction.get(context.classRef);
      if (!classSnapshot.exists || !classSnapshot.data().ownerUid || classSnapshot.data().autoApproveAt21 === false ||
          dateKey(automatic.now ? automatic.now() : new Date()) !== automatic.day ||
          use.classId !== context.classRef.id || use.approvalRequired !== true ||
          !stringValue(use.studentId) || use.studentId.includes("/") || !stringValue(use.itemId) || use.itemId.includes("/") ||
          !eligibleToday(use, "createdAt", automatic) || use.resolvedAt || use.cancelledAt) return {status: "skipped"};
    }
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
    transaction.update(useRef, {status: "completed", resolvedAt: timestamp, resolvedBy: context.uid, ...(automatic ? {autoApproved: true} : {})});
    transaction.create(historyRef, {id: historyRef.id, studentId: use.studentId,
      entry: {id: historyRef.id, amount: -item.price, reason: item.name, source: "포인트 상품", relatedId: requestId,
        date: (automatic?.now ? automatic.now() : new Date()).toLocaleDateString("ko-KR", {timeZone: "Asia/Seoul"}),
        ...(automatic ? {autoApproved: true} : {}), createdAt: timestamp}, createdAt: timestamp});
    return {ok: true, status: "completed", points: points - item.price};
  });
}
module.exports={resolvePointUse,normalizedShopItem,shopRequestCounts};
