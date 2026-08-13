import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore, doc, collection, getDoc, setDoc, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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
      return { connected: true, activeClassId, classSettings: classSettings(classSnapshot.data()) };
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
