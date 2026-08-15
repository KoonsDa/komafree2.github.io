import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, writeBatch, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEjJSL0PNZUfoQ_j06xvPMlDgbC8x_FwI",
  authDomain: "our-class-quest.firebaseapp.com",
  projectId: "our-class-quest",
  storageBucket: "our-class-quest.firebasestorage.app",
  messagingSenderId: "230522950190",
  appId: "1:230522950190:web:ae08e1aa6bd8ef617845bf"
};

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

function timestampIso(value) {
  if (!value) return "";
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

try {
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const provider = new GoogleAuthProvider();
  let activeClassId = "";
  window.ourClassFirebase = {
    ready: true,
    signInTeacher: async () => publicUser((await signInWithPopup(auth, provider)).user),
    signOutTeacher: () => signOut(auth),
    getCurrentUser: () => publicUser(auth.currentUser),
    getActiveClassId: () => activeClassId,
    loadTeacherClass: async () => {
      const user = auth.currentUser;
      if (!user) throw new Error("Firebase teacher is not signed in.");
      const userSnapshot = await getDoc(doc(db, "users", user.uid));
      activeClassId = String(userSnapshot.data()?.activeClassId || "");
      if (!activeClassId) return { connected: false, activeClassId: "", classSettings: null };
      const classSnapshot = await getDoc(doc(db, "classes", activeClassId));
      if (!classSnapshot.exists()) { activeClassId = ""; return { connected: false, activeClassId: "", classSettings: null }; }
      return { connected: true, activeClassId, classSettings: classSettings(classSnapshot.data()), assignmentsConnected: classSnapshot.data()?.assignmentsConnected === true, pointsConnected: classSnapshot.data()?.pointsConnected === true };
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
      const timestamp = serverTimestamp();
      const fields = isNew ? { ...studentFields(student, orderIndex), createdAt: timestamp } : { number: Number(student.number), name: String(student.name || ""), loginId: String(student.loginId || ""), active: student.active !== false };
      await setDoc(doc(db, "classes", activeClassId, "students", student.id), { ...fields, updatedAt: timestamp }, { merge: true });
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
      return { states: statesSnapshot.docs.map((stateDoc) => ({ id: stateDoc.id, points: Number(stateDoc.data()?.points) || 0 })), history: historySnapshot.docs.map((historyDoc) => ({ studentId: String(historyDoc.data()?.studentId || ""), entry: jsonSafeMap(historyDoc.data()?.entry), cloudCreatedAt: timestampIso(historyDoc.data()?.createdAt) })) };
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
        const prepared = mutations.map((mutation) => ({ ...mutation, stateRef: doc(db, "classes", activeClassId, "studentPointStates", mutation.studentId), historyEntries: (mutation.historyEntries || []).map(jsonSafeMap) }));
        const stateSnapshots = await Promise.all(prepared.map((mutation) => transaction.get(mutation.stateRef)));
        prepared.forEach((mutation, index) => {
          const snapshot = stateSnapshots[index]; const cloudPoints = snapshot.exists() ? Number(snapshot.data()?.points) : NaN;
          if (!Number.isInteger(cloudPoints) || cloudPoints !== mutation.expectedPoints) { const error = new Error("Cloud point state conflicts with local state."); error.code = "point/conflict"; error.details = { studentId: mutation.studentId, expectedPoints: mutation.expectedPoints, cloudPoints }; throw error; }
          const nextPoints = cloudPoints + mutation.balanceDelta; if (!Number.isInteger(nextPoints) || nextPoints < 0) { const error = new Error("Point balance cannot become negative."); error.code = "point/insufficient"; throw error; }
        });
        const timestamp = serverTimestamp();
        prepared.forEach((mutation, index) => {
          const nextPoints = Number(stateSnapshots[index].data().points) + mutation.balanceDelta;
          transaction.set(mutation.stateRef, { id: mutation.studentId, points: nextPoints, updatedAt: timestamp }, { merge: true });
          mutation.historyEntries.forEach((entry) => transaction.set(doc(db, "classes", activeClassId, "pointHistory", cloudHistoryId(mutation.studentId, entry.id)), { id: entry.id, studentId: mutation.studentId, entry, createdAt: timestamp }));
        });
      });
    }
  };
  window.dispatchEvent(new CustomEvent("our-class-firebase-ready"));
  onAuthStateChanged(auth, (user) => { if (!user) activeClassId = ""; window.dispatchEvent(new CustomEvent("our-class-firebase-auth", { detail: publicUser(user) })); });
}
catch (error) {
  console.error("Firebase initialization failed", error);
  window.ourClassFirebase = { ready: false, error, signInTeacher: async () => { throw error; }, signOutTeacher: async () => {}, getCurrentUser: () => null };
  window.dispatchEvent(new CustomEvent("our-class-firebase-error", { detail: { code: error?.code || "firebase/init-failed" } }));
}
