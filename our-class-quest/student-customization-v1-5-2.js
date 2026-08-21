import { getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-functions.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const DEFAULT_POINT_NAME = "P";
const DEFAULT_CHARACTER_ID = "character-01";
const CHARACTER_REGISTRY = Object.freeze(Array.from({ length: 16 }, (_, index) => {
  const number = index + 1;
  const id = `character-${String(number).padStart(2, "0")}`;
  return Object.freeze({ id, displayName: `캐릭터 ${number}`, imagePath: `assets/home-ui/characters/${id}.png`, scale: 1, offsetX: 0, offsetY: 0 });
}));
const CHARACTER_BY_ID = new Map(CHARACTER_REGISTRY.map((character) => [character.id, character]));
let teacherPointNameLoadedFor = "";
let studentPointNameLoadedFor = "";
let studentPointNameLoading = false;
let renderRefreshTimer = null;

window.ourClassCharacterRegistry = CHARACTER_REGISTRY;
window.ourClassStudentCustomization = { pointName: DEFAULT_POINT_NAME, characterId: DEFAULT_CHARACTER_ID, ...(window.ourClassStudentCustomization || {}) };

function normalizePointName(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ").slice(0, 12);
  return text || DEFAULT_POINT_NAME;
}

function normalizeCharacterId(value) {
  return CHARACTER_BY_ID.has(value) ? value : DEFAULT_CHARACTER_ID;
}

function classIdFromContext() {
  const fromUrl = new URLSearchParams(location.search).get("class")?.trim() || "";
  return fromUrl || window.ourClassFirebase?.getActiveClassId?.() || "";
}

function defaultApp() { return getApps().find((app) => app.name === "[DEFAULT]") || null; }
function studentApp() { return getApps().find((app) => app.name === "student-auth") || null; }

function scheduleRender() {
  clearTimeout(renderRefreshTimer);
  renderRefreshTimer = setTimeout(() => {
    if (typeof render === "function") render();
  }, 20);
}

function pointStorageKey(classId) { return `ourClassQuestPointName:${classId}`; }

async function loadTeacherPointName(form) {
  const classId = window.ourClassFirebase?.getActiveClassId?.() || "";
  if (!classId) return;
  let pointName = normalizePointName(localStorage.getItem(pointStorageKey(classId)) || (typeof data !== "undefined" ? data?.classSettings?.pointName : "") || DEFAULT_POINT_NAME);
  if (teacherPointNameLoadedFor !== classId) {
    teacherPointNameLoadedFor = classId;
    try {
      const app = defaultApp();
      if (app && getAuth(app).currentUser) {
        const snapshot = await getDoc(doc(getFirestore(app), "classes", classId));
        if (snapshot.exists()) pointName = normalizePointName(snapshot.data()?.pointName || pointName);
      }
    } catch (error) {
      console.warn("Point name load failed", error);
    }
    localStorage.setItem(pointStorageKey(classId), pointName);
    if (typeof data !== "undefined" && data?.classSettings) data.classSettings.pointName = pointName;
  }
  const input = form.elements.namedItem("pointName");
  if (input && input.value !== pointName) input.value = pointName;
}

function enhanceTeacherClassSettings() {
  if (typeof session === "undefined" || session.mode !== "teacher" || session.view !== "class-settings") return;
  const form = document.querySelector("#class-info-form");
  if (!form) return;
  if (!form.querySelector('[name="pointName"]')) {
    const saveButton = form.querySelector('button[type="submit"]');
    if (!saveButton) return;
    const label = document.createElement("label");
    label.className = "class-point-name-field";
    label.innerHTML = `포인트 이름<input name="pointName" maxlength="12" placeholder="예: P, 갈비, 별, 코인" value="P"><small class="class-point-name-help">학생 화면의 110P, +30P 같은 표시가 110갈비, +30갈비처럼 바뀝니다.</small>`;
    form.insertBefore(label, saveButton);
  }
  loadTeacherPointName(form);
}

async function persistTeacherPointName(pointName) {
  const classId = window.ourClassFirebase?.getActiveClassId?.() || "";
  if (!classId) return;
  const normalized = normalizePointName(pointName);
  localStorage.setItem(pointStorageKey(classId), normalized);
  if (typeof data !== "undefined" && data?.classSettings) data.classSettings.pointName = normalized;
  try {
    const app = defaultApp();
    if (!app || !getAuth(app).currentUser) return;
    await setDoc(doc(getFirestore(app), "classes", classId), { pointName: normalized, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error("Point name save failed", error);
    if (typeof toast === "function") toast("포인트 이름을 클라우드에 저장하지 못했습니다.");
  }
}

function replacePointUnitInText(root, unit) {
  if (!root || unit === DEFAULT_POINT_NAME) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "OPTION"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return /(?:^|[^A-Za-z])[-+]?\d[\d,]*P\b/.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => { node.nodeValue = node.nodeValue.replace(/([-+]?\d[\d,]*)P\b/g, `$1${unit}`); });
}

function applyTeacherPointDisplay() {
  if (typeof session === "undefined" || session.mode !== "teacher") return;
  const classId = window.ourClassFirebase?.getActiveClassId?.() || "";
  const unit = normalizePointName(localStorage.getItem(pointStorageKey(classId)) || (typeof data !== "undefined" ? data?.classSettings?.pointName : "") || DEFAULT_POINT_NAME);
  replacePointUnitInText(document.querySelector("#app"), unit);
}

async function loadStudentPointName() {
  if (typeof session === "undefined" || session.mode !== "firebase-student" || typeof firebaseStudentHomeData === "undefined" || !firebaseStudentHomeData) return;
  const app = studentApp();
  if (!app) return;
  const user = getAuth(app).currentUser;
  const classId = classIdFromContext();
  if (!user || !classId || studentPointNameLoading) return;
  const key = `${classId}:${user.uid}`;
  if (studentPointNameLoadedFor === key) return;
  studentPointNameLoading = true;
  let pointName = normalizePointName(localStorage.getItem(pointStorageKey(classId)) || DEFAULT_POINT_NAME);
  try {
    const result = await httpsCallable(getFunctions(app, "asia-northeast3"), "getStudentCustomization")({});
    pointName = normalizePointName(result?.data?.pointName || pointName);
    window.ourClassStudentCustomization.characterId = normalizeCharacterId(result?.data?.characterId);
  } catch (error) {
    console.warn("Student point name load failed", error);
  } finally {
    localStorage.setItem(pointStorageKey(classId), pointName);
    window.ourClassStudentCustomization = { ...window.ourClassStudentCustomization, pointName, characterId: normalizeCharacterId(window.ourClassStudentCustomization.characterId) };
    studentPointNameLoadedFor = key;
    studentPointNameLoading = false;
    scheduleRender();
  }
}

async function setStudentCharacter(characterId) {
  const normalized = normalizeCharacterId(characterId);
  if (normalized !== characterId) throw new Error("선택할 수 없는 캐릭터입니다.");
  const app = studentApp();
  if (!app || !getAuth(app).currentUser) throw new Error("학생 로그인이 필요합니다.");
  const result = await httpsCallable(getFunctions(app, "asia-northeast3"), "setStudentCharacter")({ characterId: normalized });
  const savedId = normalizeCharacterId(result?.data?.characterId);
  window.ourClassStudentCustomization = { ...window.ourClassStudentCustomization, characterId: savedId };
  scheduleRender();
  return savedId;
}

window.ourClassStudentCustomizationApi = Object.freeze({ registry: CHARACTER_REGISTRY, defaultCharacterId: DEFAULT_CHARACTER_ID, normalizeCharacterId, setStudentCharacter });

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.id !== "class-info-form") return;
  const input = form.elements.namedItem("pointName");
  if (!input) return;
  const value = normalizePointName(input.value);
  input.value = value;
  if (typeof data !== "undefined" && data?.classSettings) data.classSettings.pointName = value;
  setTimeout(() => { persistTeacherPointName(value).then(() => scheduleRender()); }, 50);
}, true);

const observer = new MutationObserver(() => {
  enhanceTeacherClassSettings();
  applyTeacherPointDisplay();
  loadStudentPointName();
});
observer.observe(document.body, { childList: true, subtree: true });

enhanceTeacherClassSettings();
applyTeacherPointDisplay();
loadStudentPointName();
