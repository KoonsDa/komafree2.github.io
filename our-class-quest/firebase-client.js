import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-functions.js";
import { getFirestore, doc, collection, query, where, getDoc, getDocs, setDoc, deleteDoc, writeBatch, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEjJSL0PNZUfoQ_j06xvPMlDgbC8x_FwI",
  authDomain: "our-class-quest.firebaseapp.com",
  projectId: "our-class-quest",
  storageBucket: "our-class-quest.firebasestorage.app",
  messagingSenderId: "230522950190",
  appId: "1:230522950190:web:ae08e1aa6bd8ef617845bf"
};

const OBSERVATION_CATEGORIES = ["수업", "생활", "관계", "성장", "기타"];

function publicUser(user) {
  return user ? { uid: user.uid, displayName: user.displayName || "", email: user.email || "", photoURL: user.photoURL || "" } : null;
}

function classSettings(value) {
  return { className: String(value?.className || ""), teacherName: String(value?.teacherName || ""), appName: String(value?.appName || "") };
}

function studentFields(value, orderIndex) {
  return { id: String(value?.id || ""), number: Number(value?.number), name: String(value?.name || ""), loginId: String(value?.loginId || ""), active: value?.active !== false, orderIndex: Number.isInteger(orderIndex) ? orderIndex : Number(value?.orderIndex) || 0 };
}

function assignmentFields(value) {
  const assignmentState = value?.assignmentState === "completed" ? "completed" : "active";
  return { id: String(value?.id || ""), title: String(value?.title || ""), subject: String(value?.subject || ""), description: String(value?.description || ""), createdAt: value?.createdAt || null, dueDate: String(value?.dueDate || ""), important: value?.important === true, points: Number(value?.points) || 0, assignmentState, completedAt: assignmentState === "completed" ? value?.completedAt || null : null, deleted: value?.deleted === true };
}

function jsonSafeMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return JSON.parse(JSON.stringify(value));
}

function cloudHistoryId(studentId, historyId) {
  return `${encodeURIComponent(String(studentId))}_${encodeURIComponent(String(historyId))}`;
}

function assignmentStudentStateId(assignmentId, studentId) {
  return encodeURIComponent(JSON.stringify([String(assignmentId), String(studentId)]));
}

function assignmentStudentStateFields(value) {
  const status = ["missing", "review", "submitted"].includes(value?.status) ? value.status : "missing";
  return { assignmentId: String(value?.assignmentId || ""), studentId: String(value?.studentId || ""), status, pointAward: jsonSafeMap(value?.pointAward) };
}

function roleFields(value) {
  const points = Number(value?.points); const capacity = Number(value?.capacity);
  return { id: String(value?.id || ""), name: String(value?.name || ""), points: Number.isInteger(points) && points >= 0 ? points : 0, capacity: Number.isInteger(capacity) && capacity >= 1 ? capacity : 1, description: String(value?.description || ""), active: value?.active !== false };
}

function roleSettingsFields(value) {
  const limit = Number(value?.dailyRoleApplicationLimit);
  const openTime = String(value?.roleApplicationOpenTime || "");
  return { dailyRoleApplicationLimit: Number.isInteger(limit) && limit >= 1 && limit <= 5 ? limit : 1, roleApplicationOpenTime: /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(openTime) ? openTime : "", currentRoles: (Array.isArray(value?.currentRoles) ? value.currentRoles : []).map(roleFields) };
}

function roleTemplateFields(value) {
  return { id: String(value?.id || ""), name: String(value?.name || ""), roles: (Array.isArray(value?.roles) ? value.roles : []).map(roleFields) };
}

function dailyRoleAssignmentFields(value) {
  const status = ["waiting", "completed", "cancelled"].includes(value?.status) ? value.status : "waiting";
  const cancelledBy = ["student", "teacher"].includes(value?.cancelledBy) ? value.cancelledBy : null;
  return { id: String(value?.id || ""), date: String(value?.date || ""), studentId: String(value?.studentId || ""), roleId: String(value?.roleId || ""), status, roleSnapshot: jsonSafeMap(value?.roleSnapshot), pointAward: jsonSafeMap(value?.pointAward), appliedAt: String(value?.appliedAt || ""), completedAt: value?.completedAt == null ? null : String(value.completedAt), cancelledAt: value?.cancelledAt == null ? null : String(value.cancelledAt), cancelledBy };
}

function dailyRoleClaimKey(date, studentId, roleId) {
  return encodeURIComponent(JSON.stringify([String(date), String(studentId), String(roleId)]));
}

function countMap(value) {
  const source = jsonSafeMap(value);
  return Object.fromEntries(Object.entries(source).filter(([, count]) => Number.isInteger(count) && count >= 0));
}

function roleDailyUsageFields(value) {
  return { date: String(value?.date || ""), roleCounts: countMap(value?.roleCounts), studentCounts: countMap(value?.studentCounts), activeClaims: jsonSafeMap(value?.activeClaims) };
}

function observationFields(value) {
  const category = OBSERVATION_CATEGORIES.includes(value?.category) ? value.category : "기타";
  return { id: String(value?.id || ""), studentId: String(value?.studentId || ""), date: String(value?.date || ""), category, content: String(value?.content || ""), quickItems: (Array.isArray(value?.quickItems) ? value.quickItems : []).filter((item) => typeof item === "string"), createdAt: String(value?.createdAt || ""), updatedAt: String(value?.updatedAt || "") };
}

function observationSettingsFields(value) {
  const quickItems = value?.quickItems && typeof value.quickItems === "object" && !Array.isArray(value.quickItems) ? value.quickItems : {};
  return { quickItems: Object.fromEntries(OBSERVATION_CATEGORIES.map((category) => [category, (Array.isArray(quickItems[category]) ? quickItems[category] : []).filter((item) => typeof item === "string")])) };
}

function groupDefinitionFields(value) {
  const order = Number(value?.order);
  return { id: String(value?.id || ""), name: String(value?.name || ""), active: value?.active !== false, order: Number.isInteger(order) ? order : 0 };
}

function groupScoreStateFields(value) {
  const score = Number(value?.score);
  return { groupId: String(value?.groupId || ""), score: Number.isInteger(score) && score >= 0 ? score : 0 };
}

function groupScoreTransactionFields(value) {
  const amount = Number(value?.amount); const scoreBefore = Number(value?.scoreBefore); const scoreAfter = Number(value?.scoreAfter);
  return { id: String(value?.id || ""), groupId: String(value?.groupId || ""), groupName: String(value?.groupName || ""), amount: Number.isInteger(amount) ? amount : 0, scoreBefore: Number.isInteger(scoreBefore) && scoreBefore >= 0 ? scoreBefore : 0, scoreAfter: Number.isInteger(scoreAfter) && scoreAfter >= 0 ? scoreAfter : 0, type: String(value?.type || "manual"), createdAt: String(value?.createdAt || "") };
}

function groupAssignmentFields(value) {
  return { studentId: String(value?.studentId || ""), groupId: String(value?.groupId || "") };
}

function classMissionFields(value) {
  const target = Number(value?.target);
  return { id: String(value?.id || ""), target: Number.isInteger(target) && target > 0 ? target : 1, reward: String(value?.reward || ""), confirmed: value?.confirmed === true, confirmedAt: value?.confirmedAt == null ? null : String(value.confirmedAt) };
}

function groupScoreError(code, message, details = {}) {
  const error = new Error(message); error.code = code; error.details = details; return error;
}

function roleError(code, message, details = {}) {
  const error = new Error(message); error.code = code; error.details = details; return error;
}

function canonicalJson(value) {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (!item || typeof item !== "object") return item;
    return Object.fromEntries(Object.keys(item).sort().map((key) => [key, normalize(item[key])]));
  };
  return JSON.stringify(normalize(JSON.parse(JSON.stringify(value ?? {}))));
}

function timestampIso(value) {
  if (!value) return "";
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

try {
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const functions = getFunctions(firebaseApp, "asia-northeast3");
  const studentFirebaseApp = getApps().find((app) => app.name === "student-auth") || initializeApp(firebaseConfig, "student-auth");
  const studentAuth = getAuth(studentFirebaseApp);
  const studentFunctions = getFunctions(studentFirebaseApp, "asia-northeast3");
  const createStudentAccountCallable = httpsCallable(functions, "createStudentAccount");
  const getStudentAccountStatusesCallable = httpsCallable(functions, "getStudentAccountStatuses");
  const resetStudentPasswordCallable = httpsCallable(functions, "resetStudentPassword");
  const updateStudentLoginIdCallable = httpsCallable(functions, "updateStudentLoginId");
  const resetStudentActivityDataCallable = httpsCallable(functions, "resetStudentActivityData");
  const resolveStudentLoginCallable = httpsCallable(studentFunctions, "resolveStudentLogin");
  const getStudentSessionCallable = httpsCallable(studentFunctions, "getStudentSession");
  const getStudentHomeDataCallable = httpsCallable(studentFunctions, "getStudentHomeData");
  const studentRequestAssignmentReviewCallable = httpsCallable(studentFunctions, "studentRequestAssignmentReview");
  const studentApplyRoleCallable = httpsCallable(studentFunctions, "studentApplyRole");
  const studentCancelRoleCallable = httpsCallable(studentFunctions, "studentCancelRole");
  const saveRoleSettingsCallable = httpsCallable(functions, "saveRoleSettings");
  const getPointShopDataCallable = httpsCallable(functions, "getPointShopData");
  const getStudentPointShopDataCallable = httpsCallable(studentFunctions, "getPointShopData");
  const savePointShopProductCallable = httpsCallable(functions, "savePointShopProduct");
  const studentUsePointProductCallable = httpsCallable(studentFunctions, "studentUsePointProduct");
  const studentCancelPointUseRequestCallable = httpsCallable(studentFunctions, "studentCancelPointUseRequest");
  const resolvePointUseRequestCallable = httpsCallable(functions, "resolvePointUseRequest");
  const reversePointProductUseCallable = httpsCallable(functions, "reversePointProductUse");
  const getPointGiftDataCallable = httpsCallable(functions, "getPointGiftData");
  const getStudentPointGiftDataCallable = httpsCallable(studentFunctions, "getPointGiftData");
  const savePointGiftSettingsCallable = httpsCallable(functions, "savePointGiftSettings");
  const studentGiftPointsCallable = httpsCallable(studentFunctions, "studentGiftPoints");
  const getCardConfigCallable = httpsCallable(functions, "getCardConfig");
  const getTeacherStudentCardDataCallable = httpsCallable(functions, "getTeacherStudentCardData");
  const getTeacherStudentRepresentativeCardsCallable = httpsCallable(functions, "getTeacherStudentRepresentativeCards");
  const saveCardConfigCallable = httpsCallable(functions, "saveCardConfig");
  const getStudentCardDrawDataCallable = httpsCallable(studentFunctions, "getStudentCardDrawData");
  const studentDrawCardCallable = httpsCallable(studentFunctions, "studentDrawCard");
  const studentUpgradeCardCallable = httpsCallable(studentFunctions, "studentUpgradeCard");
  const getStudentCardCollectionCallable = httpsCallable(studentFunctions, "getStudentCardCollection");
  const setStudentRepresentativeCardCallable = httpsCallable(studentFunctions, "setStudentRepresentativeCard");
  const saveCardPortraitCallable = httpsCallable(functions, "saveCardPortrait");
  const provider = new GoogleAuthProvider();
  let activeClassId = "";
  window.ourClassFirebase = {
    ready: true,
    signInTeacher: async () => publicUser((await signInWithPopup(auth, provider)).user),
    signOutTeacher: () => signOut(auth),
    getCurrentUser: () => publicUser(auth.currentUser),
    getStudentCurrentUser: () => publicUser(studentAuth.currentUser),
    getActiveClassId: () => activeClassId,
    getPointShopData: async ({classId, mode = "teacher"} = {}) => {
      const callable = mode === "student" ? getStudentPointShopDataCallable : getPointShopDataCallable;
      const result = await callable(mode === "student" ? {mode: "student"} : {mode: "teacher", classId: String(classId || activeClassId || "")});
      return result?.data && typeof result.data === "object" ? {...result.data, receivedAtMillis: Date.now()} : {};
    },
    savePointShopProduct: async ({classId, action = "save", item, items, openTime} = {}) => {
      const result = await savePointShopProductCallable({classId: String(classId || activeClassId || ""), action, item, items, openTime: String(openTime || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    studentUsePointProduct: async ({itemId}) => {
      const result = await studentUsePointProductCallable({itemId: String(itemId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    studentCancelPointUseRequest: async ({requestId}) => {
      const result = await studentCancelPointUseRequestCallable({requestId: String(requestId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    resolvePointUseRequest: async ({classId, requestId, decision}) => {
      const result = await resolvePointUseRequestCallable({classId: String(classId || activeClassId || ""), requestId: String(requestId || ""), decision: String(decision || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    reversePointProductUse: async ({classId, requestId}) => {
      const result = await reversePointProductUseCallable({classId: String(classId || activeClassId || ""), requestId: String(requestId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    getPointGiftData: async ({classId, mode = "teacher"} = {}) => {
      const callable = mode === "student" ? getStudentPointGiftDataCallable : getPointGiftDataCallable;
      const result = await callable(mode === "student" ? {mode: "student"} : {mode: "teacher", classId: String(classId || activeClassId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    savePointGiftSettings: async ({classId, action = "save", settings} = {}) => {
      const result = await savePointGiftSettingsCallable({classId: String(classId || activeClassId || ""), action, settings});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    studentGiftPoints: async ({receiverStudentId, amount}) => {
      const result = await studentGiftPointsCallable({receiverStudentId: String(receiverStudentId || ""), amount: Number(amount)});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    getCardConfig: async ({classId} = {}) => {
      const result = await getCardConfigCallable({classId: String(classId || activeClassId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    getTeacherStudentCardData: async ({classId, studentId} = {}) => {
      const result = await getTeacherStudentCardDataCallable({classId: String(classId || activeClassId || ""), studentId: String(studentId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    getTeacherStudentRepresentativeCards: async ({classId} = {}) => {
      const result = await getTeacherStudentRepresentativeCardsCallable({classId: String(classId || activeClassId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    saveCardConfig: async ({classId, action = "save", config} = {}) => {
      const result = await saveCardConfigCallable({classId: String(classId || activeClassId || ""), action, config});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    getStudentCardDrawData: async () => {
      const result = await getStudentCardDrawDataCallable({});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    studentDrawCard: async ({drawOptionId}) => {
      const result = await studentDrawCardCallable({drawOptionId: String(drawOptionId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    studentUpgradeCard: async ({cardId, rarity}) => {
      const result = await studentUpgradeCardCallable({cardId: String(cardId || ""), rarity: String(rarity || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    getStudentCardCollection: async () => {
      const result = await getStudentCardCollectionCallable({});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    setStudentRepresentativeCard: async ({cardId, rarity, abilityId}) => {
      const result = await setStudentRepresentativeCardCallable({cardId: String(cardId || ""), rarity: String(rarity || ""), abilityId: String(abilityId || "")});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    saveCardPortrait: async ({classId, cardId, action = "save", imageData = ""} = {}) => {
      const result = await saveCardPortraitCallable({classId: String(classId || activeClassId || ""), cardId: String(cardId || ""), action, imageData});
      return result?.data && typeof result.data === "object" ? result.data : {};
    },
    resolveStudentLogin: async ({classId, loginId}) => {
      const result = await resolveStudentLoginCallable({classId: String(classId || ""), loginId: String(loginId || "")});
      const value = result?.data && typeof result.data === "object" ? result.data : {};
      return {ok: value.ok === true, internalEmail: String(value.internalEmail || "")};
    },
    getStudentSession: async () => {
      const result = await getStudentSessionCallable({});
      const value = result?.data && typeof result.data === "object" ? result.data : {};
      const student = value.student && typeof value.student === "object" ? value.student : {};
      return {ok: value.ok === true, student: {classId: String(student.classId || ""), studentId: String(student.studentId || ""), name: String(student.name || ""), number: Number(student.number) || 0, loginId: String(student.loginId || "")}, className: String(value.className || "")};
    },
    getStudentHomeData: async () => {
      const result = await getStudentHomeDataCallable({});
      const value = result?.data && typeof result.data === "object" ? result.data : {};
      const profile = value.profile && typeof value.profile === "object" ? value.profile : {};
      const classInfo = value.classInfo && typeof value.classInfo === "object" ? value.classInfo : {};
      const features = classInfo.features && typeof classInfo.features === "object" ? classInfo.features : {};
      const roleSettings = value.roleSettings && typeof value.roleSettings === "object" ? value.roleSettings : {};
      return {
        ok: value.ok === true,
        profile: {studentId: String(profile.studentId || ""), name: String(profile.name || ""), number: Number(profile.number) || 0, loginId: String(profile.loginId || "")},
        classInfo: {className: String(classInfo.className || ""), appName: String(classInfo.appName || ""), features: {assignments: features.assignments !== false, roles: features.roles !== false, points: features.points !== false}},
        points: Number(value.points) || 0,
        assignments: (Array.isArray(value.assignments) ? value.assignments : []).map((assignment) => ({id: String(assignment?.id || ""), title: String(assignment?.title || ""), subject: String(assignment?.subject || ""), description: String(assignment?.description || ""), dueDate: String(assignment?.dueDate || ""), points: Number(assignment?.points) || 0, important: assignment?.important === true, assignmentState: assignment?.assignmentState === "completed" ? "completed" : "active", status: ["missing", "review", "submitted"].includes(assignment?.status) ? assignment.status : "missing"})),
        roleSettings: {dailyLimit: Number(roleSettings.dailyLimit) || 1, applicationOpenTime: String(roleSettings.applicationOpenTime || ""), serverNowMillis: Number(roleSettings.serverNowMillis) || Date.now(), receivedAtMillis: Date.now(), roles: (Array.isArray(roleSettings.roles) ? roleSettings.roles : []).map((role) => ({id: String(role?.id || ""), name: String(role?.name || ""), points: Number(role?.points) || 0, capacity: Number(role?.capacity) || 1, description: String(role?.description || ""), currentCount: Number(role?.currentCount) || 0}))},
        myRoleApplications: (Array.isArray(value.myRoleApplications) ? value.myRoleApplications : []).map((application) => ({id: String(application?.id || ""), roleId: String(application?.roleId || ""), status: ["waiting", "completed", "cancelled"].includes(application?.status) ? application.status : "waiting", date: String(application?.date || "")})),
      };
    },
    studentRequestAssignmentReview: async ({assignmentId}) => {
      const result = await studentRequestAssignmentReviewCallable({assignmentId: String(assignmentId || "")});
      const value = result?.data && typeof result.data === "object" ? result.data : {};
      return {ok: value.ok === true, assignmentId: String(value.assignmentId || ""), status: String(value.status || "")};
    },
    studentApplyRole: async ({roleId}) => {
      const result = await studentApplyRoleCallable({roleId: String(roleId || "")});
      const value = result?.data && typeof result.data === "object" ? result.data : {};
      return {ok: value.ok === true, applicationId: String(value.applicationId || ""), roleId: String(value.roleId || ""), status: String(value.status || "")};
    },
    studentCancelRole: async ({applicationId}) => {
      const result = await studentCancelRoleCallable({applicationId: String(applicationId || "")});
      const value = result?.data && typeof result.data === "object" ? result.data : {};
      return {ok: value.ok === true, applicationId: String(value.applicationId || ""), status: String(value.status || "")};
    },
    studentSignIn: async ({classId, loginId, password}) => {
      const resolved = await window.ourClassFirebase.resolveStudentLogin({classId, loginId});
      if (!resolved.ok || !resolved.internalEmail) throw new Error("Student login could not be resolved.");
      await signInWithEmailAndPassword(studentAuth, resolved.internalEmail, password);
      try {
        const verified = await window.ourClassFirebase.getStudentSession();
        if (!verified.ok) throw new Error("Student session could not be verified.");
        return verified;
      } catch (error) {
        await signOut(studentAuth);
        throw error;
      }
    },
    signOutStudent: () => signOut(studentAuth),
    createStudentAccount: async ({classId, studentId, password}) => {
      const result = await createStudentAccountCallable({
        classId: String(classId || ""),
        studentId: String(studentId || ""),
        password,
      });
      const value = result?.data && typeof result.data === "object" ?
        result.data : {};
      return {
        ok: value.ok === true,
        created: value.created === true,
        uid: String(value.uid || ""),
        studentId: String(value.studentId || ""),
        loginId: String(value.loginId || ""),
      };
    },
    getStudentAccountStatuses: async ({classId}) => {
      const result = await getStudentAccountStatusesCallable({
        classId: String(classId || ""),
      });
      const value = result?.data && typeof result.data === "object" ?
        result.data : {};
      const source = value.accounts && typeof value.accounts === "object" &&
        !Array.isArray(value.accounts) ? value.accounts : {};
      const accounts = Object.fromEntries(Object.entries(source).map(([studentId, account]) => [String(studentId), {
        exists: account?.exists === true,
        active: account?.active === true,
        loginId: String(account?.loginId || ""),
      }]));
      return {ok: value.ok === true, accounts};
    },
    resetStudentPassword: async ({classId, studentId, password}) => {
      const result = await resetStudentPasswordCallable({
        classId: String(classId || ""),
        studentId: String(studentId || ""),
        password,
      });
      const value = result?.data && typeof result.data === "object" ?
        result.data : {};
      return {
        ok: value.ok === true,
        studentId: String(value.studentId || ""),
      };
    },
    updateStudentLoginId: async ({classId, studentId, loginId}) => {
      const result = await updateStudentLoginIdCallable({
        classId: String(classId || ""),
        studentId: String(studentId || ""),
        loginId: String(loginId || ""),
      });
      const value = result?.data && typeof result.data === "object" ?
        result.data : {};
      return {
        ok: value.ok === true,
        studentId: String(value.studentId || ""),
        loginId: String(value.loginId || ""),
      };
    },
    resetStudentActivityData: async ({classId, includeObservations = false}) => {
      const result = await resetStudentActivityDataCallable({
        classId: String(classId || ""),
        includeObservations: includeObservations === true,
      });
      const value = result?.data && typeof result.data === "object" ?
        result.data : {};
      return {
        ok: value.ok === true,
        classId: String(value.classId || ""),
        includeObservations: value.includeObservations === true,
        resetCounts: value.resetCounts && typeof value.resetCounts === "object" ?
          value.resetCounts : {},
      };
    },
    loadTeacherClass: async () => {
      const user = auth.currentUser;
      if (!user) throw new Error("Firebase teacher is not signed in.");
      const userSnapshot = await getDoc(doc(db, "users", user.uid));
      activeClassId = String(userSnapshot.data()?.activeClassId || "");
      if (!activeClassId) return { connected: false, activeClassId: "", classSettings: null };
      const classSnapshot = await getDoc(doc(db, "classes", activeClassId));
      if (!classSnapshot.exists()) { activeClassId = ""; return { connected: false, activeClassId: "", classSettings: null }; }
      return { connected: true, activeClassId, classSettings: classSettings(classSnapshot.data()), assignmentsConnected: classSnapshot.data()?.assignmentsConnected === true, assignmentStudentStatesConnected: classSnapshot.data()?.assignmentStudentStatesConnected === true, pointsConnected: classSnapshot.data()?.pointsConnected === true, rolesConnected: classSnapshot.data()?.rolesConnected === true, observationsConnected: classSnapshot.data()?.observationsConnected === true, groupsConnected: classSnapshot.data()?.groupsConnected === true };
    },
    connectCurrentClass: async (value) => {
      const user = auth.currentUser;
      if (!user) throw new Error("Firebase teacher is not signed in.");
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);
      const classRef = doc(collection(db, "classes"));
      const timestamp = serverTimestamp();
      const batch = writeBatch(db);
      batch.set(classRef, { ownerUid: user.uid, ...classSettings(value), createdAt: timestamp, updatedAt: timestamp });
      batch.set(userRef, { uid: user.uid, displayName: user.displayName || "", email: user.email || "", activeClassId: classRef.id, ...(!userSnapshot.exists() ? { createdAt: timestamp } : {}), updatedAt: timestamp }, { merge: true });
      await batch.commit();
      activeClassId = classRef.id;
      return { activeClassId };
    },
    saveClassSettings: async (value) => {
      const user = auth.currentUser;
      if (!user || !activeClassId) throw new Error("Connected Firebase class was not found.");
      await setDoc(doc(db, "classes", activeClassId), { ...classSettings(value), updatedAt: serverTimestamp() }, { merge: true });
    },
    saveRoleSettings: async (value) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const result = await saveRoleSettingsCallable({classId: activeClassId, ...roleSettingsFields(value)});
      return result?.data;
    },
    loadRoleSettings: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDoc(doc(db, "classes", activeClassId, "roleSettings", "current")); if (!snapshot.exists()) return null; const value = snapshot.data();
      return { ...roleSettingsFields(value), createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) };
    },
    saveObservation: async (observation) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const fields = observationFields(observation); if (!fields.id) throw new Error("Observation id is required.");
      await setDoc(doc(db, "classes", activeClassId, "observations", fields.id), fields);
    },
    loadObservations: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "observations"));
      return snapshot.docs.map((observationDoc) => { const value = observationDoc.data(); return observationFields({ ...value, id: observationDoc.id, createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) }); });
    },
    deleteObservation: async (observationId) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const id = String(observationId || ""); if (!id) throw new Error("Observation id is required.");
      await deleteDoc(doc(db, "classes", activeClassId, "observations", id));
    },
    saveObservationSettings: async (value) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const settingsRef = doc(db, "classes", activeClassId, "observationSettings", "current"); const snapshot = await getDoc(settingsRef); const timestamp = serverTimestamp();
      await setDoc(settingsRef, { ...observationSettingsFields(value), createdAt: snapshot.exists() && snapshot.data()?.createdAt ? snapshot.data().createdAt : timestamp, updatedAt: timestamp });
    },
    loadObservationSettings: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDoc(doc(db, "classes", activeClassId, "observationSettings", "current")); if (!snapshot.exists()) return null; const value = snapshot.data();
      return { ...observationSettingsFields(value), createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) };
    },
    saveGroupDefinition: async (group) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const fields = groupDefinitionFields(group); if (!fields.id) throw new Error("Group id is required.");
      const groupRef = doc(db, "classes", activeClassId, "groups", fields.id); const snapshot = await getDoc(groupRef); const timestamp = serverTimestamp();
      await setDoc(groupRef, { ...fields, createdAt: snapshot.exists() && snapshot.data()?.createdAt ? snapshot.data().createdAt : timestamp, updatedAt: timestamp });
    },
    loadGroupDefinitions: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "groups"));
      return snapshot.docs.map((groupDoc) => { const value = groupDoc.data(); return { ...groupDefinitionFields({ ...value, id: groupDoc.id }), createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) }; });
    },
    saveGroupScoreState: async (value) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const fields = groupScoreStateFields(value); if (!fields.groupId) throw new Error("Group id is required.");
      const stateRef = doc(db, "classes", activeClassId, "groupScoreStates", fields.groupId); const snapshot = await getDoc(stateRef); const timestamp = serverTimestamp();
      await setDoc(stateRef, { ...fields, createdAt: snapshot.exists() && snapshot.data()?.createdAt ? snapshot.data().createdAt : timestamp, updatedAt: timestamp });
    },
    loadGroupScoreStates: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "groupScoreStates"));
      return snapshot.docs.map((stateDoc) => { const value = stateDoc.data(); return { ...groupScoreStateFields({ ...value, groupId: stateDoc.id }), createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) }; });
    },
    saveGroupScoreTransaction: async (value) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const fields = groupScoreTransactionFields(value); if (!fields.id) throw new Error("Group score transaction id is required.");
      await setDoc(doc(db, "classes", activeClassId, "groupScoreTransactions", fields.id), fields);
    },
    loadGroupScoreTransactions: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "groupScoreTransactions"));
      return snapshot.docs.map((transactionDoc) => groupScoreTransactionFields({ ...transactionDoc.data(), id: transactionDoc.id }));
    },
    applyGroupScoreChange: async ({ groupId, amount, expectedScore, transaction: transactionValue }) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const id = String(groupId || ""); const delta = Number(amount); const expected = Number(expectedScore); const history = groupScoreTransactionFields(transactionValue);
      if (!id || !history.id || !Number.isInteger(delta) || delta === 0 || !Number.isInteger(expected) || expected < 0) throw groupScoreError("group-score/invalid", "Group score mutation is invalid.", { groupId: id });
      const stateRef = doc(db, "classes", activeClassId, "groupScoreStates", id);
      const historyRef = doc(db, "classes", activeClassId, "groupScoreTransactions", history.id);
      return runTransaction(db, async (firestoreTransaction) => {
        const stateSnapshot = await firestoreTransaction.get(stateRef);
        if (!stateSnapshot.exists()) throw groupScoreError("group-score/missing", "Group score state was not found.", { groupId: id });
        const cloudScore = Number(stateSnapshot.data()?.score);
        if (!Number.isInteger(cloudScore) || cloudScore < 0) throw groupScoreError("group-score/invalid-state", "Cloud group score is invalid.", { groupId: id, cloudScore });
        if (cloudScore !== expected) throw groupScoreError("group-score/conflict", "Cloud group score changed.", { groupId: id, expectedScore: expected, cloudScore });
        const scoreAfter = cloudScore + delta;
        if (scoreAfter < 0) throw groupScoreError("group-score/insufficient", "Group score cannot be negative.", { groupId: id, scoreBefore: cloudScore, amount: delta });
        const entry = groupScoreTransactionFields({ ...history, groupId: id, amount: delta, scoreBefore: cloudScore, scoreAfter });
        const timestamp = serverTimestamp();
        firestoreTransaction.set(historyRef, entry);
        firestoreTransaction.set(stateRef, { groupId: id, score: scoreAfter, createdAt: stateSnapshot.data()?.createdAt || timestamp, updatedAt: timestamp });
        return entry;
      });
    },
    resetGroupScores: async ({ groups }) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const targets = (Array.isArray(groups) ? groups : []).map((group) => ({ groupId: String(group?.groupId || ""), groupName: String(group?.groupName || ""), expectedScore: Number(group?.expectedScore), transactionId: String(group?.transactionId || ""), createdAt: String(group?.createdAt || "") }));
      if (!targets.length || targets.length > 8 || targets.some((target) => !target.groupId || !target.groupName || !target.transactionId || !target.createdAt || !Number.isInteger(target.expectedScore) || target.expectedScore < 0) || new Set(targets.map((target) => target.groupId)).size !== targets.length || new Set(targets.map((target) => target.transactionId)).size !== targets.length) throw groupScoreError("group-score/invalid", "Group score reset is invalid.");
      const stateRefs = targets.map((target) => doc(db, "classes", activeClassId, "groupScoreStates", target.groupId));
      return runTransaction(db, async (firestoreTransaction) => {
        const stateSnapshots = await Promise.all(stateRefs.map((stateRef) => firestoreTransaction.get(stateRef)));
        const cloudScores = stateSnapshots.map((snapshot, index) => {
          const target = targets[index];
          if (!snapshot.exists()) throw groupScoreError("group-score/missing", "Group score state was not found.", { groupId: target.groupId });
          const cloudScore = Number(snapshot.data()?.score);
          if (!Number.isInteger(cloudScore) || cloudScore < 0) throw groupScoreError("group-score/invalid-state", "Cloud group score is invalid.", { groupId: target.groupId, cloudScore });
          if (cloudScore !== target.expectedScore) throw groupScoreError("group-score/conflict", "Cloud group score changed.", { groupId: target.groupId, expectedScore: target.expectedScore, cloudScore });
          return cloudScore;
        });
        const entries = targets.flatMap((target, index) => cloudScores[index] > 0 ? [groupScoreTransactionFields({ id: target.transactionId, groupId: target.groupId, groupName: target.groupName, amount: -cloudScores[index], scoreBefore: cloudScores[index], scoreAfter: 0, type: "reset", createdAt: target.createdAt })] : []);
        const timestamp = serverTimestamp();
        targets.forEach((target, index) => {
          if (cloudScores[index] <= 0) return;
          const entry = entries.find((item) => item.groupId === target.groupId);
          firestoreTransaction.set(doc(db, "classes", activeClassId, "groupScoreTransactions", entry.id), entry);
          firestoreTransaction.set(stateRefs[index], { groupId: target.groupId, score: 0, createdAt: stateSnapshots[index].data()?.createdAt || timestamp, updatedAt: timestamp });
        });
        return { scores: Object.fromEntries(targets.map((target) => [target.groupId, 0])), transactions: entries };
      });
    },
    saveGroupAssignment: async (value) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const fields = groupAssignmentFields(value); if (!fields.studentId || !fields.groupId) throw new Error("Student id and group id are required.");
      const assignmentRef = doc(db, "classes", activeClassId, "groupAssignments", fields.studentId); const snapshot = await getDoc(assignmentRef); const timestamp = serverTimestamp();
      await setDoc(assignmentRef, { ...fields, createdAt: snapshot.exists() && snapshot.data()?.createdAt ? snapshot.data().createdAt : timestamp, updatedAt: timestamp });
    },
    loadGroupAssignments: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "groupAssignments"));
      return Object.fromEntries(snapshot.docs.map((assignmentDoc) => { const fields = groupAssignmentFields({ ...assignmentDoc.data(), studentId: assignmentDoc.id }); return [fields.studentId, fields.groupId]; }));
    },
    deleteGroupAssignment: async (studentId) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const id = String(studentId || ""); if (!id) throw new Error("Student id is required.");
      await deleteDoc(doc(db, "classes", activeClassId, "groupAssignments", id));
    },
    saveGroupAssignmentsBatch: async (changes) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const normalized = (Array.isArray(changes) ? changes : []).map((change) => ({ studentId: String(change?.studentId || ""), groupId: String(change?.groupId || "") }));
      if (!normalized.length || normalized.length > 450 || normalized.some((change) => !change.studentId) || new Set(normalized.map((change) => change.studentId)).size !== normalized.length) throw new Error("Group assignment batch is invalid.");
      const refs = normalized.map((change) => doc(db, "classes", activeClassId, "groupAssignments", change.studentId));
      const snapshots = await Promise.all(refs.map((ref) => getDoc(ref)));
      const batch = writeBatch(db); const timestamp = serverTimestamp();
      normalized.forEach((change, index) => {
        if (!change.groupId) batch.delete(refs[index]);
        else batch.set(refs[index], { studentId: change.studentId, groupId: change.groupId, createdAt: snapshots[index].exists() && snapshots[index].data()?.createdAt ? snapshots[index].data().createdAt : timestamp, updatedAt: timestamp });
      });
      await batch.commit();
    },
    saveGroupConfiguration: async ({ groups, newScoreStates, deletedAssignmentStudentIds }) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const definitions = (Array.isArray(groups) ? groups : []).map(groupDefinitionFields);
      const states = (Array.isArray(newScoreStates) ? newScoreStates : []).map(groupScoreStateFields);
      const deletedStudentIds = [...new Set((Array.isArray(deletedAssignmentStudentIds) ? deletedAssignmentStudentIds : []).map((studentId) => String(studentId || "")).filter(Boolean))];
      const operationCount = definitions.length + states.length + deletedStudentIds.length;
      if (!operationCount || operationCount > 450 || definitions.some((group) => !group.id) || states.some((state) => !state.groupId || state.score !== 0) || new Set(definitions.map((group) => group.id)).size !== definitions.length || new Set(states.map((state) => state.groupId)).size !== states.length) throw new Error("Group configuration batch is invalid.");
      const groupRefs = definitions.map((group) => doc(db, "classes", activeClassId, "groups", group.id));
      const stateRefs = states.map((state) => doc(db, "classes", activeClassId, "groupScoreStates", state.groupId));
      const [groupSnapshots, stateSnapshots] = await Promise.all([Promise.all(groupRefs.map((ref) => getDoc(ref))), Promise.all(stateRefs.map((ref) => getDoc(ref)))]);
      const batch = writeBatch(db); const timestamp = serverTimestamp();
      definitions.forEach((group, index) => batch.set(groupRefs[index], { ...group, createdAt: groupSnapshots[index].exists() && groupSnapshots[index].data()?.createdAt ? groupSnapshots[index].data().createdAt : timestamp, updatedAt: timestamp }));
      states.forEach((state, index) => { if (!stateSnapshots[index].exists()) batch.set(stateRefs[index], { ...state, createdAt: timestamp, updatedAt: timestamp }); });
      deletedStudentIds.forEach((studentId) => batch.delete(doc(db, "classes", activeClassId, "groupAssignments", studentId)));
      await batch.commit();
    },
    saveClassMission: async (mission) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const fields = classMissionFields(mission); if (!fields.id) throw new Error("Class mission id is required.");
      const missionRef = doc(db, "classes", activeClassId, "classMissions", fields.id); const snapshot = await getDoc(missionRef); const timestamp = serverTimestamp();
      await setDoc(missionRef, { ...fields, createdAt: snapshot.exists() && snapshot.data()?.createdAt ? snapshot.data().createdAt : timestamp, updatedAt: timestamp });
    },
    loadClassMissions: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "classMissions"));
      return snapshot.docs.map((missionDoc) => { const value = missionDoc.data(); return { ...classMissionFields({ ...value, id: missionDoc.id }), createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) }; });
    },
    deleteClassMission: async (missionId) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const id = String(missionId || ""); if (!id) throw new Error("Class mission id is required.");
      await deleteDoc(doc(db, "classes", activeClassId, "classMissions", id));
    },
    connectInitialGroups: async ({ groups, scoreStates, transactions, assignments, missions }) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const definitions = (Array.isArray(groups) ? groups : []).map(groupDefinitionFields);
      const states = (Array.isArray(scoreStates) ? scoreStates : []).map(groupScoreStateFields);
      const history = (Array.isArray(transactions) ? transactions : []).map(groupScoreTransactionFields);
      const assignmentValues = (Array.isArray(assignments) ? assignments : []).map(groupAssignmentFields);
      const missionValues = (Array.isArray(missions) ? missions : []).map(classMissionFields);
      if (!definitions.length || definitions.some((group) => !group.id)) throw new Error("Group definitions are required.");
      if (states.some((state) => !state.groupId) || history.some((entry) => !entry.id) || assignmentValues.some((assignment) => !assignment.studentId || !assignment.groupId) || missionValues.some((mission) => !mission.id)) throw new Error("Initial group snapshot contains an invalid id.");
      const definitionIds = new Set(definitions.map((group) => group.id)); const stateIds = new Set(states.map((state) => state.groupId));
      if (definitionIds.size !== definitions.length || stateIds.size !== states.length || definitionIds.size !== stateIds.size || [...definitionIds].some((groupId) => !stateIds.has(groupId))) throw new Error("Each group requires exactly one score state.");
      const saveTimestamped = async (values, collectionName, idForValue, fieldsForValue) => {
        for (let index = 0; index < values.length; index += 425) {
          const chunk = values.slice(index, index + 425);
          const refs = chunk.map((value) => doc(db, "classes", activeClassId, collectionName, idForValue(value)));
          const snapshots = await Promise.all(refs.map((ref) => getDoc(ref)));
          const batch = writeBatch(db); const timestamp = serverTimestamp();
          chunk.forEach((value, itemIndex) => batch.set(refs[itemIndex], { ...fieldsForValue(value), createdAt: snapshots[itemIndex].exists() && snapshots[itemIndex].data()?.createdAt ? snapshots[itemIndex].data().createdAt : timestamp, updatedAt: timestamp }));
          await batch.commit();
        }
      };
      await saveTimestamped(definitions, "groups", (group) => group.id, (group) => group);
      await saveTimestamped(states, "groupScoreStates", (state) => state.groupId, (state) => state);
      for (let index = 0; index < history.length; index += 425) {
        const batch = writeBatch(db);
        history.slice(index, index + 425).forEach((entry) => batch.set(doc(db, "classes", activeClassId, "groupScoreTransactions", entry.id), entry));
        await batch.commit();
      }
      await saveTimestamped(assignmentValues, "groupAssignments", (assignment) => assignment.studentId, (assignment) => assignment);
      await saveTimestamped(missionValues, "classMissions", (mission) => mission.id, (mission) => mission);
      await setDoc(doc(db, "classes", activeClassId), { groupsConnected: true, updatedAt: serverTimestamp() }, { merge: true });
    },
    setGroupsConnected: async (connected) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      await setDoc(doc(db, "classes", activeClassId), { groupsConnected: connected === true, updatedAt: serverTimestamp() }, { merge: true });
    },
    connectInitialObservations: async ({ observations, settings }) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const normalizedObservations = (Array.isArray(observations) ? observations : []).map(observationFields);
      if (normalizedObservations.some((observation) => !observation.id)) throw new Error("Observation id is required.");
      for (let index = 0; index < normalizedObservations.length; index += 425) {
        const batch = writeBatch(db);
        normalizedObservations.slice(index, index + 425).forEach((observation) => batch.set(doc(db, "classes", activeClassId, "observations", observation.id), observation));
        await batch.commit();
      }
      const settingsRef = doc(db, "classes", activeClassId, "observationSettings", "current"); const settingsSnapshot = await getDoc(settingsRef); const timestamp = serverTimestamp();
      await setDoc(settingsRef, { ...observationSettingsFields(settings), createdAt: settingsSnapshot.exists() && settingsSnapshot.data()?.createdAt ? settingsSnapshot.data().createdAt : timestamp, updatedAt: timestamp });
      await setDoc(doc(db, "classes", activeClassId), { observationsConnected: true, updatedAt: serverTimestamp() }, { merge: true });
    },
    saveRoleTemplate: async (template) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const fields = roleTemplateFields(template); if (!fields.id) throw new Error("Role template id is required.");
      const templateRef = doc(db, "classes", activeClassId, "roleTemplates", fields.id); const snapshot = await getDoc(templateRef); const timestamp = serverTimestamp();
      await setDoc(templateRef, { ...fields, ...(!snapshot.exists() ? { createdAt: timestamp } : {}), updatedAt: timestamp }, { merge: true });
    },
    loadRoleTemplates: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "roleTemplates"));
      return snapshot.docs.map((templateDoc) => { const value = templateDoc.data(); return { ...roleTemplateFields({ ...value, id: templateDoc.id }), createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) }; });
    },
    deleteRoleTemplate: async (templateId) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const id = String(templateId || ""); if (!id) throw new Error("Role template id is required.");
      await deleteDoc(doc(db, "classes", activeClassId, "roleTemplates", id));
    },
    saveDailyRoleAssignment: async (application) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const fields = dailyRoleAssignmentFields(application); if (!fields.id || !fields.studentId || !fields.roleId) throw new Error("Daily role assignment id, student id, and role id are required.");
      const applicationRef = doc(db, "classes", activeClassId, "dailyRoleAssignments", fields.id); const snapshot = await getDoc(applicationRef); const timestamp = serverTimestamp();
      await setDoc(applicationRef, { ...fields, ...(!snapshot.exists() ? { createdAt: timestamp } : {}), updatedAt: timestamp }, { merge: true });
    },
    loadDailyRoleAssignments: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "dailyRoleAssignments"));
      return snapshot.docs.map((applicationDoc) => { const value = applicationDoc.data(); return { ...dailyRoleAssignmentFields({ ...value, id: applicationDoc.id }), createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) }; });
    },
    initializeRoleDailyUsage: async (date) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const dateKey = String(date || ""); if (!dateKey) throw new Error("Role usage date is required.");
      const assignmentsSnapshot = await getDocs(collection(db, "classes", activeClassId, "dailyRoleAssignments"));
      const usage = { date: dateKey, roleCounts: {}, studentCounts: {}, activeClaims: {} };
      assignmentsSnapshot.docs.forEach((applicationDoc) => {
        const application = dailyRoleAssignmentFields({ ...applicationDoc.data(), id: applicationDoc.id });
        if (application.date !== dateKey || !["waiting", "completed"].includes(application.status)) return;
        const claimKey = dailyRoleClaimKey(dateKey, application.studentId, application.roleId);
        if (usage.activeClaims[claimKey]) throw roleError("role/usage-duplicate", "Duplicate active role claims were found.", { date: dateKey, studentId: application.studentId, roleId: application.roleId });
        usage.roleCounts[application.roleId] = (usage.roleCounts[application.roleId] || 0) + 1;
        usage.studentCounts[application.studentId] = (usage.studentCounts[application.studentId] || 0) + 1;
        usage.activeClaims[claimKey] = application.id;
      });
      const usageRef = doc(db, "classes", activeClassId, "roleDailyUsage", dateKey);
      return runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(usageRef);
        if (snapshot.exists()) { const existing = roleDailyUsageFields(snapshot.data()); if (existing.date !== dateKey) throw roleError("role/usage-conflict", "Role usage date does not match its document.", { date: dateKey, cloudDate: existing.date }); return { ...existing, created: false }; }
        const timestamp = serverTimestamp(); transaction.set(usageRef, { ...usage, createdAt: timestamp, updatedAt: timestamp });
        return { ...usage, created: true };
      });
    },
    loadRoleDailyUsage: async (date) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDoc(doc(db, "classes", activeClassId, "roleDailyUsage", String(date || "")));
      return snapshot.exists() ? roleDailyUsageFields(snapshot.data()) : null;
    },
    applyDailyRoleApplicationTransaction: async (value) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const proposed = dailyRoleAssignmentFields(value); const reuseCancelled = value?.expectedStatus === "cancelled";
      if (!proposed.id || !proposed.date || !proposed.studentId || !proposed.roleId) throw new Error("Daily role application fields are required.");
      const settingsRef = doc(db, "classes", activeClassId, "roleSettings", "current");
      const usageRef = doc(db, "classes", activeClassId, "roleDailyUsage", proposed.date);
      const applicationRef = doc(db, "classes", activeClassId, "dailyRoleAssignments", proposed.id);
      return runTransaction(db, async (transaction) => {
        const [settingsSnapshot, usageSnapshot, applicationSnapshot] = await Promise.all([transaction.get(settingsRef), transaction.get(usageRef), transaction.get(applicationRef)]);
        if (!settingsSnapshot.exists()) throw roleError("role/settings-missing", "Role settings were not found.");
        if (!usageSnapshot.exists()) throw roleError("role/usage-missing", "Role daily usage was not initialized.", { date: proposed.date });
        const settings = roleSettingsFields(settingsSnapshot.data()); const role = settings.currentRoles.find((item) => item.id === proposed.roleId);
        if (!role) throw roleError("role/not-found", "Current role was not found.", { roleId: proposed.roleId });
        const existingApplication = applicationSnapshot.exists() ? dailyRoleAssignmentFields({ ...applicationSnapshot.data(), id: proposed.id }) : null;
        if (reuseCancelled) {
          if (!existingApplication || existingApplication.status !== "cancelled" || existingApplication.date !== proposed.date || existingApplication.studentId !== proposed.studentId || existingApplication.roleId !== proposed.roleId) throw roleError("role/status-conflict", "Cancelled role application state changed.", { id: proposed.id });
        } else if (applicationSnapshot.exists()) throw roleError("role/status-conflict", "Role application already exists.", { id: proposed.id });
        const usage = roleDailyUsageFields(usageSnapshot.data()); const claimKey = dailyRoleClaimKey(proposed.date, proposed.studentId, proposed.roleId);
        if (usage.activeClaims[claimKey]) throw roleError("role/already-applied", "Role is already active for this student.", { claimKey, applicationId: usage.activeClaims[claimKey] });
        if ((usage.studentCounts[proposed.studentId] || 0) >= settings.dailyRoleApplicationLimit) throw roleError("role/limit-reached", "Daily role application limit was reached.", { studentId: proposed.studentId });
        if ((usage.roleCounts[proposed.roleId] || 0) >= role.capacity) throw roleError("role/capacity-reached", "Role capacity was reached.", { roleId: proposed.roleId });
        usage.studentCounts[proposed.studentId] = (usage.studentCounts[proposed.studentId] || 0) + 1;
        usage.roleCounts[proposed.roleId] = (usage.roleCounts[proposed.roleId] || 0) + 1;
        usage.activeClaims[claimKey] = proposed.id;
        const application = { ...proposed, status: "waiting", roleSnapshot: role, pointAward: existingApplication?.pointAward || proposed.pointAward, completedAt: null, cancelledAt: null, cancelledBy: null };
        const timestamp = serverTimestamp();
        transaction.set(applicationRef, { ...application, createdAt: applicationSnapshot.exists() && applicationSnapshot.data().createdAt ? applicationSnapshot.data().createdAt : timestamp, updatedAt: timestamp });
        transaction.set(usageRef, { ...usage, createdAt: usageSnapshot.data().createdAt || timestamp, updatedAt: timestamp });
        return application;
      });
    },
    cancelDailyRoleApplicationTransaction: async (value) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const id = String(value?.id || ""); const date = String(value?.date || ""); const cancelledBy = ["student", "teacher"].includes(value?.cancelledBy) ? value.cancelledBy : null; const cancelledAt = String(value?.cancelledAt || "");
      if (!id || !date || !cancelledBy || !cancelledAt) throw new Error("Role cancellation fields are required.");
      const usageRef = doc(db, "classes", activeClassId, "roleDailyUsage", date); const applicationRef = doc(db, "classes", activeClassId, "dailyRoleAssignments", id);
      return runTransaction(db, async (transaction) => {
        const [usageSnapshot, applicationSnapshot] = await Promise.all([transaction.get(usageRef), transaction.get(applicationRef)]);
        if (!usageSnapshot.exists() || !applicationSnapshot.exists()) throw roleError("role/usage-conflict", "Role usage or application was not found.", { id, date });
        const application = dailyRoleAssignmentFields({ ...applicationSnapshot.data(), id });
        if (application.status !== "waiting") throw roleError("role/status-conflict", "Role application is no longer waiting.", { id, cloudStatus: application.status });
        const usage = roleDailyUsageFields(usageSnapshot.data()); const claimKey = dailyRoleClaimKey(date, application.studentId, application.roleId);
        if (usage.activeClaims[claimKey] !== id || (usage.roleCounts[application.roleId] || 0) < 1 || (usage.studentCounts[application.studentId] || 0) < 1) throw roleError("role/usage-conflict", "Role usage does not match the application.", { id, claimKey });
        usage.roleCounts[application.roleId] -= 1; usage.studentCounts[application.studentId] -= 1; delete usage.activeClaims[claimKey];
        if (usage.roleCounts[application.roleId] === 0) delete usage.roleCounts[application.roleId];
        if (usage.studentCounts[application.studentId] === 0) delete usage.studentCounts[application.studentId];
        const cancelled = { ...application, status: "cancelled", cancelledAt, cancelledBy };
        const timestamp = serverTimestamp(); transaction.set(applicationRef, { ...cancelled, createdAt: applicationSnapshot.data().createdAt || timestamp, updatedAt: timestamp }); transaction.set(usageRef, { ...usage, createdAt: usageSnapshot.data().createdAt || timestamp, updatedAt: timestamp });
        return cancelled;
      });
    },
    connectInitialRoles: async ({ settings, templates, assignments }) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const normalizedSettings = roleSettingsFields(settings);
      const normalizedTemplates = (Array.isArray(templates) ? templates : []).map(roleTemplateFields);
      const normalizedAssignments = (Array.isArray(assignments) ? assignments : []).map(dailyRoleAssignmentFields);
      if (normalizedTemplates.some((template) => !template.id)) throw new Error("Role template id is required.");
      if (normalizedAssignments.some((application) => !application.id || !application.studentId || !application.roleId)) throw new Error("Daily role assignment id, student id, and role id are required.");

      const settingsTimestamp = serverTimestamp();
      await setDoc(doc(db, "classes", activeClassId, "roleSettings", "current"), { ...normalizedSettings, createdAt: settingsTimestamp, updatedAt: settingsTimestamp });
      const writes = [
        ...normalizedTemplates.map((template) => ({ ref: doc(db, "classes", activeClassId, "roleTemplates", template.id), data: template })),
        ...normalizedAssignments.map((application) => ({ ref: doc(db, "classes", activeClassId, "dailyRoleAssignments", application.id), data: application }))
      ];
      for (let index = 0; index < writes.length; index += 425) {
        const batch = writeBatch(db); const timestamp = serverTimestamp();
        writes.slice(index, index + 425).forEach((write) => batch.set(write.ref, { ...write.data, createdAt: timestamp, updatedAt: timestamp }));
        await batch.commit();
      }
      await setDoc(doc(db, "classes", activeClassId), { rolesConnected: true, updatedAt: serverTimestamp() }, { merge: true });
    },
    loadStudents: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "students"));
      return snapshot.docs.map((studentDoc) => studentFields({ ...studentDoc.data(), id: studentDoc.id }));
    },
    uploadInitialStudents: async (students) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const batch = writeBatch(db); const timestamp = serverTimestamp();
      students.forEach((student, orderIndex) => batch.set(doc(db, "classes", activeClassId, "students", student.id), { ...studentFields(student, orderIndex), createdAt: timestamp, updatedAt: timestamp }));
      await batch.commit();
    },
    saveStudent: async (student, orderIndex, isNew = false) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const studentRef = doc(db, "classes", activeClassId, "students", student.id); const timestamp = serverTimestamp();
      if (isNew) { await setDoc(studentRef, { ...studentFields(student, orderIndex), createdAt: timestamp, updatedAt: timestamp }, { merge: true }); return; }
      const snapshot = await getDoc(studentRef); const existing = snapshot.data() || {};
      await setDoc(studentRef, { ...studentFields(student, Number.isInteger(existing.orderIndex) ? existing.orderIndex : orderIndex), createdAt: existing.createdAt || timestamp, updatedAt: timestamp });
    },
    saveStudentsBatch: async (students) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const batch = writeBatch(db); const timestamp = serverTimestamp();
      students.forEach(({ student, orderIndex }) => batch.set(doc(db, "classes", activeClassId, "students", student.id), { ...studentFields(student, orderIndex), createdAt: timestamp, updatedAt: timestamp }, { merge: true }));
      await batch.commit();
    },
    loadAssignments: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "assignments"));
      return snapshot.docs.map((assignmentDoc) => assignmentFields({ ...assignmentDoc.data(), id: assignmentDoc.id }));
    },
    connectInitialAssignments: async (assignments) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      for (let index = 0; index < assignments.length; index += 450) {
        const batch = writeBatch(db); const timestamp = serverTimestamp();
        assignments.slice(index, index + 450).forEach((assignment) => batch.set(doc(db, "classes", activeClassId, "assignments", assignment.id), { ...assignmentFields(assignment), deleted: false, updatedAt: timestamp }));
        await batch.commit();
      }
      await setDoc(doc(db, "classes", activeClassId), { assignmentsConnected: true, updatedAt: serverTimestamp() }, { merge: true });
    },
    saveAssignment: async (assignment) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      await setDoc(doc(db, "classes", activeClassId, "assignments", assignment.id), { ...assignmentFields(assignment), deleted: false, updatedAt: serverTimestamp() });
    },
    markAssignmentDeleted: async (assignmentId) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      await setDoc(doc(db, "classes", activeClassId, "assignments", assignmentId), { deleted: true, updatedAt: serverTimestamp() }, { merge: true });
    },
    connectInitialAssignmentStudentStates: async (states) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      for (let index = 0; index < states.length; index += 425) {
        const batch = writeBatch(db); const timestamp = serverTimestamp();
        states.slice(index, index + 425).forEach((state) => {
          const fields = assignmentStudentStateFields(state); const stateId = assignmentStudentStateId(fields.assignmentId, fields.studentId);
          batch.set(doc(db, "classes", activeClassId, "assignmentStudentStates", stateId), { ...fields, createdAt: timestamp, updatedAt: timestamp });
        });
        await batch.commit();
      }
      await setDoc(doc(db, "classes", activeClassId), { assignmentStudentStatesConnected: true, updatedAt: serverTimestamp() }, { merge: true });
    },
    loadAssignmentStudentStates: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const snapshot = await getDocs(collection(db, "classes", activeClassId, "assignmentStudentStates"));
      return snapshot.docs.map((stateDoc) => { const value = stateDoc.data(); return { id: stateDoc.id, ...assignmentStudentStateFields(value), createdAt: timestampIso(value?.createdAt), updatedAt: timestampIso(value?.updatedAt) }; });
    },
    connectInitialPoints: async (students) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const writes = [];
      students.forEach((student) => {
        writes.push({ ref: doc(db, "classes", activeClassId, "studentPointStates", student.id), data: { id: student.id, points: Number(student.points) || 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } });
        (student.pointHistory || []).forEach((entry) => writes.push({ ref: doc(db, "classes", activeClassId, "pointHistory", cloudHistoryId(student.id, entry.id)), data: { id: entry.id, studentId: student.id, entry: jsonSafeMap(entry), createdAt: serverTimestamp() } }));
      });
      for (let index = 0; index < writes.length; index += 425) {
        const batch = writeBatch(db); writes.slice(index, index + 425).forEach((write) => batch.set(write.ref, write.data)); await batch.commit();
      }
      await setDoc(doc(db, "classes", activeClassId), { pointsConnected: true, updatedAt: serverTimestamp() }, { merge: true });
    },
    loadPoints: async () => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const [statesSnapshot, historySnapshot] = await Promise.all([getDocs(collection(db, "classes", activeClassId, "studentPointStates")), getDocs(collection(db, "classes", activeClassId, "pointHistory"))]);
      return { states: statesSnapshot.docs.map((stateDoc) => ({ id: stateDoc.id, points: Number(stateDoc.data()?.points) || 0 })), history: historySnapshot.docs.map((historyDoc) => { const value = historyDoc.data() || {}; const entry = jsonSafeMap(value.entry); const entryCreatedAt = timestampIso(value.entry?.createdAt); return { studentId: String(value.studentId || ""), entry: {...entry, createdAt: entryCreatedAt || String(entry.createdAt || "")}, cloudCreatedAt: timestampIso(value.createdAt) }; }) };
    },
    loadStudentPoints: async (studentId) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      const id = String(studentId || ""); if (!id) throw new Error("Student id is required.");
      const [stateSnapshot, historySnapshot] = await Promise.all([
        getDoc(doc(db, "classes", activeClassId, "studentPointStates", id)),
        getDocs(query(collection(db, "classes", activeClassId, "pointHistory"), where("studentId", "==", id))),
      ]);
      if (!stateSnapshot.exists()) throw new Error("Student point state was not found.");
      return {id, points: Number(stateSnapshot.data()?.points) || 0, history: historySnapshot.docs.map((historyDoc) => { const value = historyDoc.data() || {}; const entry = jsonSafeMap(value.entry); const entryCreatedAt = timestampIso(value.entry?.createdAt); return {...entry, createdAt: entryCreatedAt || String(entry.createdAt || timestampIso(value.createdAt) || "")}; })};
    },
    createPointStates: async (students) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      for (let index = 0; index < students.length; index += 425) {
        const batch = writeBatch(db); const timestamp = serverTimestamp();
        students.slice(index, index + 425).forEach((student) => batch.set(doc(db, "classes", activeClassId, "studentPointStates", student.id), { id: student.id, points: Number(student.points) || 0, createdAt: timestamp, updatedAt: timestamp }));
        await batch.commit();
      }
    },
    applyPointMutations: async (mutations) => {
      if (!auth.currentUser || !activeClassId) throw new Error("Connected Firebase class was not found.");
      await runTransaction(db, async (transaction) => {
        const prepared = mutations.map((mutation) => {
          const assignmentState = mutation.assignmentStudentState ? {
            ...assignmentStudentStateFields(mutation.assignmentStudentState),
            expectedStatus: ["missing", "review", "submitted"].includes(mutation.assignmentStudentState.expectedStatus) ? mutation.assignmentStudentState.expectedStatus : "missing",
            expectedPointAward: jsonSafeMap(mutation.assignmentStudentState.expectedPointAward),
            ref: doc(db, "classes", activeClassId, "assignmentStudentStates", assignmentStudentStateId(mutation.assignmentStudentState.assignmentId, mutation.assignmentStudentState.studentId))
          } : null;
          const roleAssignment = mutation.dailyRoleAssignment ? {
            ...dailyRoleAssignmentFields(mutation.dailyRoleAssignment),
            expectedStatus: ["waiting", "completed", "cancelled"].includes(mutation.dailyRoleAssignment.expectedStatus) ? mutation.dailyRoleAssignment.expectedStatus : "waiting",
            expectedPointAward: jsonSafeMap(mutation.dailyRoleAssignment.expectedPointAward),
            ref: doc(db, "classes", activeClassId, "dailyRoleAssignments", String(mutation.dailyRoleAssignment.id || ""))
          } : null;
          return { ...mutation, stateRef: doc(db, "classes", activeClassId, "studentPointStates", mutation.studentId), historyEntries: (mutation.historyEntries || []).map(jsonSafeMap), assignmentStudentState: assignmentState, dailyRoleAssignment: roleAssignment };
        });
        const [stateSnapshots, assignmentStateSnapshots, roleAssignmentSnapshots] = await Promise.all([
          Promise.all(prepared.map((mutation) => transaction.get(mutation.stateRef))),
          Promise.all(prepared.map((mutation) => mutation.assignmentStudentState ? transaction.get(mutation.assignmentStudentState.ref) : Promise.resolve(null))),
          Promise.all(prepared.map((mutation) => mutation.dailyRoleAssignment ? transaction.get(mutation.dailyRoleAssignment.ref) : Promise.resolve(null)))
        ]);
        prepared.forEach((mutation, index) => {
          const snapshot = stateSnapshots[index]; const cloudPoints = snapshot.exists() ? Number(snapshot.data()?.points) : NaN;
          if (!Number.isInteger(cloudPoints) || cloudPoints !== mutation.expectedPoints) { const error = new Error("Cloud point state conflicts with local state."); error.code = "point/conflict"; error.details = { studentId: mutation.studentId, expectedPoints: mutation.expectedPoints, cloudPoints }; throw error; }
          const nextPoints = cloudPoints + mutation.balanceDelta; if (!Number.isInteger(nextPoints) || nextPoints < 0) { const error = new Error("Point balance cannot become negative."); error.code = "point/insufficient"; throw error; }
          if (mutation.assignmentStudentState) {
            const assignmentSnapshot = assignmentStateSnapshots[index]; const cloudStatus = assignmentSnapshot?.exists() ? assignmentStudentStateFields(assignmentSnapshot.data()).status : "missing"; const cloudPointAward = assignmentSnapshot?.exists() ? jsonSafeMap(assignmentSnapshot.data()?.pointAward) : {};
            if (cloudStatus !== mutation.assignmentStudentState.expectedStatus) { const error = new Error("Cloud assignment status conflicts with local state."); error.code = "assignment/status-conflict"; error.details = { assignmentId: mutation.assignmentStudentState.assignmentId, studentId: mutation.assignmentStudentState.studentId, expectedStatus: mutation.assignmentStudentState.expectedStatus, cloudStatus }; throw error; }
            if (canonicalJson(cloudPointAward) !== canonicalJson(mutation.assignmentStudentState.expectedPointAward)) { const error = new Error("Cloud assignment point award conflicts with local state."); error.code = "assignment/award-conflict"; error.details = { assignmentId: mutation.assignmentStudentState.assignmentId, studentId: mutation.assignmentStudentState.studentId, expectedStatus: mutation.assignmentStudentState.expectedStatus, cloudStatus }; throw error; }
          }
          if (mutation.dailyRoleAssignment) {
            const roleSnapshot = roleAssignmentSnapshots[index]; const cloudStatus = roleSnapshot?.exists() ? dailyRoleAssignmentFields(roleSnapshot.data()).status : null; const cloudPointAward = roleSnapshot?.exists() ? jsonSafeMap(roleSnapshot.data()?.pointAward) : null;
            if (cloudStatus !== mutation.dailyRoleAssignment.expectedStatus) { const error = new Error("Cloud role status conflicts with local state."); error.code = "role/status-conflict"; error.details = { id: mutation.dailyRoleAssignment.id, studentId: mutation.dailyRoleAssignment.studentId, expectedStatus: mutation.dailyRoleAssignment.expectedStatus, cloudStatus }; throw error; }
            if (cloudPointAward === null || canonicalJson(cloudPointAward) !== canonicalJson(mutation.dailyRoleAssignment.expectedPointAward)) { const error = new Error("Cloud role point award conflicts with local state."); error.code = "role/award-conflict"; error.details = { id: mutation.dailyRoleAssignment.id, studentId: mutation.dailyRoleAssignment.studentId, expectedStatus: mutation.dailyRoleAssignment.expectedStatus, cloudStatus }; throw error; }
          }
        });
        const timestamp = serverTimestamp();
        prepared.forEach((mutation, index) => {
          const nextPoints = Number(stateSnapshots[index].data().points) + mutation.balanceDelta;
          if (mutation.balanceDelta !== 0 || (!mutation.assignmentStudentState && !mutation.dailyRoleAssignment)) transaction.set(mutation.stateRef, { id: mutation.studentId, points: nextPoints, updatedAt: timestamp }, { merge: true });
          mutation.historyEntries.forEach((entry) => transaction.set(doc(db, "classes", activeClassId, "pointHistory", cloudHistoryId(mutation.studentId, entry.id)), { id: entry.id, studentId: mutation.studentId, entry, createdAt: timestamp }));
          if (mutation.assignmentStudentState) {
            const assignmentSnapshot = assignmentStateSnapshots[index]; const state = mutation.assignmentStudentState;
            transaction.set(state.ref, { assignmentId: state.assignmentId, studentId: state.studentId, status: state.status, pointAward: state.pointAward, createdAt: assignmentSnapshot?.exists() && assignmentSnapshot.data().createdAt ? assignmentSnapshot.data().createdAt : timestamp, updatedAt: timestamp });
          }
          if (mutation.dailyRoleAssignment) {
            const roleSnapshot = roleAssignmentSnapshots[index]; const application = mutation.dailyRoleAssignment;
            transaction.set(application.ref, { ...dailyRoleAssignmentFields(application), createdAt: roleSnapshot.data().createdAt || timestamp, updatedAt: timestamp });
          }
        });
      });
    }
  };
  window.dispatchEvent(new CustomEvent("our-class-firebase-ready"));
  onAuthStateChanged(auth, (user) => { if (!user) activeClassId = ""; window.dispatchEvent(new CustomEvent("our-class-firebase-auth", { detail: publicUser(user) })); });
  onAuthStateChanged(studentAuth, async (user) => {
    if (!user) { window.dispatchEvent(new CustomEvent("our-class-firebase-student-auth", {detail: {user: null, session: null, ready: true}})); return; }
    try {
      const verifiedSession = await window.ourClassFirebase.getStudentSession();
      if (!verifiedSession.ok) throw new Error("Student session could not be verified.");
      window.dispatchEvent(new CustomEvent("our-class-firebase-student-auth", {detail: {user: publicUser(user), session: verifiedSession, ready: true}}));
    } catch (error) {
      console.error("Firebase student session verification failed", {code: error?.code, message: error?.message});
      await signOut(studentAuth);
    }
  });
}
catch (error) {
  console.error("Firebase initialization failed", error);
  window.ourClassFirebase = { ready: false, error, signInTeacher: async () => { throw error; }, signOutTeacher: async () => {}, getCurrentUser: () => null };
  window.dispatchEvent(new CustomEvent("our-class-firebase-error", { detail: { code: error?.code || "firebase/init-failed" } }));
}
