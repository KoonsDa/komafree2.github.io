import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

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

try {
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  window.ourClassFirebase = {
    ready: true,
    signInTeacher: async () => publicUser((await signInWithPopup(auth, provider)).user),
    signOutTeacher: () => signOut(auth),
    getCurrentUser: () => publicUser(auth.currentUser)
  };
  window.dispatchEvent(new CustomEvent("our-class-firebase-ready"));
  onAuthStateChanged(auth, (user) => window.dispatchEvent(new CustomEvent("our-class-firebase-auth", { detail: publicUser(user) })));
}
catch (error) {
  console.error("Firebase initialization failed", error);
  window.ourClassFirebase = { ready: false, error, signInTeacher: async () => { throw error; }, signOutTeacher: async () => {}, getCurrentUser: () => null };
  window.dispatchEvent(new CustomEvent("our-class-firebase-error", { detail: { code: error?.code || "firebase/init-failed" } }));
}
