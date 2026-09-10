const {FieldValue} = require("firebase-admin/firestore");
const {approvalWindow, eligibleToday, dateKey} = require("./approval-date");
const {resolvePointUse} = require("./point-approval");
const {roleReward} = require("./role-reward");

// IDs must remain a single segment inside the current class.
const validId = value => typeof value === "string" && value.length > 0 && !value.includes("/");

async function approveRole(db, classRef, id, window, clock = () => new Date()) {
  return db.runTransaction(async transaction => {
    const now = typeof clock === "function" ? clock() : clock;
    const ref = classRef.collection("dailyRoleAssignments").doc(id);
    const [classDoc, applicationDoc] = await Promise.all([transaction.get(classRef), transaction.get(ref)]);
    const application = applicationDoc.data();
    if (!classDoc.exists || !classDoc.data().ownerUid || classDoc.data().autoApproveAt21 === false || !application ||
        application.status !== "waiting" || application.pointAward?.awarded || application.pointAward?.revokedAt ||
        application.completedAt || application.cancelledAt || application.cancelledBy ||
        !eligibleToday(application, "appliedAt", window) || dateKey(now) !== window.day ||
        !validId(application.studentId) || !validId(application.roleId)) return "skipped";
    const studentId = application.studentId;
    const pointRef = classRef.collection("studentPointStates").doc(studentId);
    const [student, points, assignments, inventory, config, settings, history] = await Promise.all([
      transaction.get(classRef.collection("students").doc(studentId)), transaction.get(pointRef),
      transaction.get(classRef.collection("dailyRoleAssignments").where("date", "==", window.day)),
      transaction.get(classRef.collection("studentCardInventories").doc(studentId)),
      transaction.get(classRef.collection("cardSettings").doc("config")),
      transaction.get(classRef.collection("roleSettings").doc("current")),
      transaction.get(classRef.collection("pointHistory").where("studentId", "==", studentId)),
    ]);
    if (!student.exists || student.data().active === false || !Number.isInteger(points.data()?.points)) return "skipped";
    // Read the configured limit and manual/automatic completions in the same transaction.
    // Completion does not create a claim or change roleDailyUsage.
    const dailyLimit = Number(settings.data()?.dailyRoleApplicationLimit);
    if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 5) return "skipped";
    const completedCount = assignments.docs.filter(doc => doc.id !== id && doc.data().studentId === studentId &&
      (doc.data().status === "completed" || doc.data().pointAward?.awarded)).length;
    if (completedCount >= dailyLimit) return "skipped";
    const snapshot = application.roleSnapshot;
    const role = snapshot && (snapshot.id || application.roleId) ?
      {...snapshot, id: snapshot.id || application.roleId} : settings.data()?.currentRoles?.find(item => item.id === application.roleId);
    if (!role || !Number.isInteger(Number(role.points)) || Number(role.points) < 0) return "skipped";
    const owned = inventory.data() || {};
    const cardId = owned.representativeCard?.cardId;
    const card = validId(cardId) ? await transaction.get(classRef.collection("cards").doc(cardId)) : null;
    const reward = roleReward({student: {...student.data(), ...owned, id: studentId,
      pointHistory: history.docs.map(doc => doc.data().entry).filter(Boolean)}, role,
    config: config.data() || {}, cards: card?.exists ? [{...card.data(), id: card.id}] : [], day: window.day, now});
    const balance = points.data().points + reward.pointAward.amount;
    if (!Number.isInteger(balance) || balance < 0) return "skipped";
    const timestamp = FieldValue.serverTimestamp();
    transaction.set(pointRef, {id: studentId, points: balance, updatedAt: timestamp}, {merge: true});
    for (const entry of reward.entries) {
      const historyRef = classRef.collection("pointHistory").doc(`${encodeURIComponent(studentId)}_${encodeURIComponent(entry.id)}`);
      transaction.create(historyRef, {id: entry.id, studentId, entry, createdAt: timestamp});
    }
    transaction.update(ref, {status: "completed", pointAward: reward.pointAward,
      completedAt: now.toISOString(), cancelledAt: null, cancelledBy: null, updatedAt: timestamp});
    return "completed";
  });
}

async function runNightlyApproval({db, scheduleTime, now = () => new Date(), logger = console}) {
  const window = approvalWindow(scheduleTime, now());
  const result = {roles: 0, points: 0, skipped: 0, errors: 0};
  if (!window) return result; // A retry after Korean midnight must not process yesterday.
  let cursor;
  do {
    let query = db.collection("classes").orderBy("__name__").limit(100);
    if (cursor) query = query.startAfter(cursor);
    const classes = await query.get();
    if (!classes.docs.length) break;
    for (const classDoc of classes.docs) {
      if (classDoc.data().autoApproveAt21 === false || !classDoc.data().ownerUid) continue;
      const classRef = classDoc.ref;
      for (const [collection, status, counter] of [["dailyRoleAssignments", "waiting", "roles"], ["pointUseRequests", "pending", "points"]]) {
        // A single-field date query uses the existing automatic index; no composite index needed.
        const candidates = await classRef.collection(collection).where("date", "==", window.day).get();
        for (const doc of candidates.docs) {
          if (dateKey(now()) !== window.day) return result;
          if (doc.data().status !== status) continue;
          try {
            const outcome = counter === "roles" ? await approveRole(db, classRef, doc.id, window, now) :
              (await resolvePointUse({db, classRef, uid: "system"}, doc.id, "approve", {...window, now})).status;
            result[outcome === "completed" ? counter : "skipped"]++;
          } catch (error) {
            // Existing business preconditions (balance/stock, or teacher already handled it) stay intact.
            if (error.code === "failed-precondition") result.skipped++;
            else { result.errors++; logger.error("Nightly approval failed", {classId: classRef.id, collection, id: doc.id, code: error.code}); }
          }
        }
      }
    }
    cursor = classes.docs.at(-1);
  } while (cursor);
  logger.info("Nightly approval finished", {day: window.day, ...result});
  if (result.errors) throw new Error(`Nightly approval: ${result.errors} transient/unexpected failures; safe to retry`);
  return result;
}
module.exports = {approveRole, runNightlyApproval};
