import { getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-functions.js";

let key = "";
let loading = false;
let loaded = false;
let error = null;
let data = null;
let refreshPromise = null;
let shop = { loading: false, loaded: false, error: null, data: null, promise: null };
let gift = { loading: false, loaded: false, error: null, data: null, promise: null };
let cardDraw = { loading: false, loaded: false, error: null, data: null, promise: null };
let cardCollection = { loading: false, loaded: false, error: null, data: null, promise: null };
let pollTimer = null;
let backgroundRefreshPromise = null;
let rankingRefreshPromise = null;
let usingPointProduct = false;
let usingPointGift = false;
const POINT_POLL_INTERVAL = 5000;

function studentApp() {
  return getApps().find((app) => app.name === "student-auth") || null;
}

function currentKey() {
  const app = studentApp();
  const user = app ? getAuth(app).currentUser : null;
  return user ? user.uid : "";
}

function requestRender() {
  setTimeout(() => {
    if (typeof render === "function" && typeof session !== "undefined" && session.mode === "firebase-student") render();
  }, 10);
}

async function ensureLoaded(force = false, quiet = false) {
  const app = studentApp();
  if (!app) return null;
  const user = getAuth(app).currentUser;
  if (!user) return null;
  const nextKey = currentKey();

  if (key !== nextKey) {
    key = nextKey;
    loading = false;
    loaded = false;
    error = null;
    data = null;
    refreshPromise = null;
    shop = { loading: false, loaded: false, error: null, data: null, promise: null };
    gift = { loading: false, loaded: false, error: null, data: null, promise: null };
    cardDraw = { loading: false, loaded: false, error: null, data: null, promise: null };
    cardCollection = { loading: false, loaded: false, error: null, data: null, promise: null };
  }

  if (!force && loaded && data) return data;
  if (refreshPromise) return refreshPromise;

  if (!quiet) loading = true;
  error = null;
  if (!quiet) requestRender();

  refreshPromise = (async () => {
    try {
      const callable = httpsCallable(getFunctions(app, "asia-northeast3"), "getStudentPortalData");
      const result = await callable({});
      const value = result?.data && typeof result.data === "object" ? result.data : {};
      if (value.ok !== true) throw new Error("Student portal data response was invalid.");
      data = value;
      loaded = true;
      return data;
    } catch (caught) {
      console.error("Student portal data load failed", caught);
      if (!quiet) { error = caught; loaded = false; data = null; }
      return null;
    } finally {
      if (!quiet) loading = false;
      refreshPromise = null;
      if (!quiet) requestRender();
    }
  })();

  return refreshPromise;
}

function state() {
  return { loading, loaded, error, data, shop, gift, cardDraw, cardCollection };
}

async function loadCardState(target, method, force = false) {
  if (!force && target.loaded && target.data) return target.data;
  if (target.promise) return target.promise;
  target.loading = true; target.error = null; requestRender();
  target.promise = (async () => {
    try { const value = await window.ourClassFirebase?.[method]?.(); if (value?.ok !== true) throw new Error("Card response was invalid."); target.data = value; target.loaded = true; return value; }
    catch (caught) { console.error(`${method} failed`, caught); target.error = caught; target.loaded = false; target.data = null; return null; }
    finally { target.loading = false; target.promise = null; requestRender(); }
  })();
  return target.promise;
}

function ensureCardDrawLoaded(force = false) {
  const staleUnconfigured = cardDraw.data?.configured === false;
  return loadCardState(cardDraw, "getStudentCardDrawData", force || staleUnconfigured);
}
function ensureCardCollectionLoaded(force = false) { return loadCardState(cardCollection, "getStudentCardCollection", force); }
async function setRepresentativeCard(cardId, rarity, abilityId) {
  const result = await window.ourClassFirebase?.setStudentRepresentativeCard?.({cardId, rarity, abilityId});
  if (result?.ok !== true) throw new Error("Representative card response was invalid.");
  await ensureCardCollectionLoaded(true); return result;
}

async function ensureGiftLoaded(force = false, quiet = false) {
  if (!force && gift.loaded && gift.data) return gift.data;
  if (gift.promise) return gift.promise;
  if (!quiet) gift.loading = true;
  gift.error = null;
  if (!quiet) requestRender();
  gift.promise = (async () => {
    try {
      const value = await window.ourClassFirebase?.getPointGiftData?.({mode: "student"});
      if (value?.ok !== true) throw new Error("Point gift response was invalid.");
      gift.data = value; gift.loaded = true; return value;
    } catch (caught) {
      console.error("Student point gift load failed", caught);
      if (!quiet) { gift.error = caught; gift.loaded = false; gift.data = null; }
      return null;
    } finally { if (!quiet) gift.loading = false; gift.promise = null; if (!quiet) requestRender(); }
  })();
  return gift.promise;
}

async function ensureShopLoaded(force = false, quiet = false) {
  if (!force && shop.loaded && shop.data) return shop.data;
  if (shop.promise) return shop.promise;
  if (!quiet) shop.loading = true;
  shop.error = null;
  if (!quiet) requestRender();
  shop.promise = (async () => {
    try {
      const value = await window.ourClassFirebase?.getPointShopData?.({mode: "student"});
      if (value?.ok !== true) throw new Error("Point shop response was invalid.");
      shop.data = value; shop.loaded = true; return value;
    } catch (caught) {
      console.error("Student point shop load failed", caught);
      if (!quiet) { shop.error = caught; shop.loaded = false; shop.data = null; }
      return null;
    } finally { if (!quiet) shop.loading = false; shop.promise = null; if (!quiet) requestRender(); }
  })();
  return shop.promise;
}

async function usePointProduct(itemId) {
  const result = await window.ourClassFirebase?.studentUsePointProduct?.({itemId});
  const pendingRefreshes = [backgroundRefreshPromise, refreshPromise, shop.promise].filter(Boolean);
  if (pendingRefreshes.length) await Promise.allSettled(pendingRefreshes);
  await refreshPointScreen(true);
  return result;
}

async function giftPoints(receiverStudentId, amount) {
  const result = await window.ourClassFirebase?.studentGiftPoints?.({receiverStudentId, amount});
  const pendingRefreshes = [backgroundRefreshPromise, refreshPromise, shop.promise, gift.promise].filter(Boolean);
  if (pendingRefreshes.length) await Promise.allSettled(pendingRefreshes);
  await refreshPointScreen(true);
  return result;
}

async function drawCard(drawOptionId) {
  const result = await window.ourClassFirebase?.studentDrawCard?.({drawOptionId});
  await Promise.allSettled([ensureLoaded(true, true), ensureCardDrawLoaded(true), ensureCardCollectionLoaded(true),
    window.refreshFirebaseStudentHomeDataQuietly?.() || Promise.resolve(false)]);
  if (typeof render === "function" && typeof session !== "undefined" && session.mode === "firebase-student") render();
  return result;
}

function pointScreenActive() {
  return document.visibilityState !== "hidden" && typeof session !== "undefined" && session.mode === "firebase-student" && Boolean(document.querySelector(".student-v159-point-main-grid"));
}

function rankingScreenActive() {
  return typeof session !== "undefined" && session.mode === "firebase-student" && Boolean(document.querySelector("[data-student-ranking-screen]"));
}

async function refreshRankingScreen() {
  if (rankingRefreshPromise) return rankingRefreshPromise;
  const beforeRanking = JSON.stringify(data?.ranking || null);
  const promise = (async () => {
    await ensureLoaded(true, true);
    const changed = beforeRanking !== JSON.stringify(data?.ranking || null);
    if (changed && rankingScreenActive()) window.refreshStudentRankingDom?.();
    return changed;
  })().finally(() => { if (rankingRefreshPromise === promise) rankingRefreshPromise = null; });
  rankingRefreshPromise = promise;
  return promise;
}

function stopPolling() {
  if (pollTimer !== null) window.clearTimeout(pollTimer);
  pollTimer = null;
}

function schedulePolling(delay = POINT_POLL_INTERVAL) {
  stopPolling();
  if (!pointScreenActive()) return;
  pollTimer = window.setTimeout(async () => {
    pollTimer = null;
    if (!pointScreenActive() || usingPointProduct || usingPointGift) return schedulePolling();
    await refreshPointScreen(false);
    schedulePolling();
  }, delay);
}

async function refreshPointScreen(forceRender = false) {
  if (backgroundRefreshPromise) return backgroundRefreshPromise;
  const beforePortal = JSON.stringify(data);
  const beforeShop = JSON.stringify(shop.data);
  const beforeGift = JSON.stringify(gift.data);
  backgroundRefreshPromise = (async () => {
    const [, , , homeChanged] = await Promise.all([
      ensureLoaded(true, true),
      ensureShopLoaded(true, true),
      ensureGiftLoaded(true, true),
      window.refreshFirebaseStudentHomeDataQuietly?.() || Promise.resolve(false),
    ]);
    const changed = beforePortal !== JSON.stringify(data) || beforeShop !== JSON.stringify(shop.data) || beforeGift !== JSON.stringify(gift.data) || homeChanged === true;
    if ((changed || forceRender) && typeof render === "function" && typeof session !== "undefined" && session.mode === "firebase-student") render();
    return changed;
  })().finally(() => { backgroundRefreshPromise = null; });
  return backgroundRefreshPromise;
}

window.ourClassStudentPortal = { ensureLoaded, ensureShopLoaded, ensureGiftLoaded, ensureCardDrawLoaded, ensureCardCollectionLoaded,
  setRepresentativeCard, usePointProduct, giftPoints, drawCard, refreshPointScreen, refreshRankingScreen, state };

function pointGiftError(caught) {
  const message = String(caught?.message || "");
  if (message.includes("disabled")) return "현재 친구 선물 기능을 사용할 수 없습니다.";
  if (message.includes("insufficient")) return "보유 포인트가 부족합니다.";
  if (message.includes("daily-count-limit")) return "오늘 선물 가능 횟수를 모두 사용했습니다.";
  if (message.includes("daily-amount-limit")) return "오늘 선물 가능 포인트를 모두 사용했습니다.";
  if (message.includes("transfer-limit")) return "1회 선물 한도를 확인해 주세요.";
  if (message.includes("student-inactive") || message.includes("invalid-recipient")) return "선물할 친구를 다시 선택해 주세요.";
  return "포인트 선물에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

document.addEventListener("submit", async (event) => {
  const form = event.target.closest?.("#student-point-gift-form");
  if (!form || usingPointGift) return;
  event.preventDefault(); event.stopPropagation();
  const values = new FormData(form);
  const receiverStudentId = String(values.get("receiverStudentId") || "");
  const amount = Number(values.get("amount"));
  const button = form.querySelector("button[type=submit]");
  if (!receiverStudentId || !Number.isInteger(amount) || amount <= 0) return toast("친구와 선물할 포인트를 확인해 주세요.");
  usingPointGift = true; stopPolling(); if (button) button.disabled = true;
  try { await giftPoints(receiverStudentId, amount); toast("친구에게 포인트를 선물했습니다."); }
  catch (caught) { console.error("Student point gift failed", caught); toast(pointGiftError(caught)); if (button) button.disabled = false; }
  finally { usingPointGift = false; schedulePolling(); }
}, true);

document.addEventListener("click", (event) => {
  const refresh = event.target.closest?.("[data-student-portal-refresh]");
  if (!refresh || typeof session === "undefined" || session.mode !== "firebase-student") return;
  event.preventDefault();
  refreshPointScreen(true);
}, true);

document.addEventListener("click", async (event) => {
  const button = event.target.closest?.("[data-student-point-product]");
  if (!button || button.disabled) return;
  event.preventDefault(); event.stopPropagation(); button.disabled = true;
  usingPointProduct = true; stopPolling();
  try {
    const result = await usePointProduct(button.dataset.studentPointProduct);
    toast(result?.status === "pending" ? "사용 승인을 신청했습니다." : "상품을 사용했습니다.");
  } catch (caught) {
    console.error("Student point product request failed", caught);
    toast("상품 신청에 실패했습니다. 잔액과 수량을 확인해 주세요.");
    button.disabled = false;
  } finally { usingPointProduct = false; schedulePolling(); }
}, true);

document.addEventListener("click", (event) => {
  const target = event.target.closest?.("[data-student-cloud-view]");
  if (!target) return;
  window.setTimeout(() => {
    if (target.dataset.studentCloudView === "points" && pointScreenActive()) {
      refreshPointScreen(false).finally(() => schedulePolling());
    } else {
      stopPolling();
      if (target.dataset.studentCloudView === "ranking" && rankingScreenActive()) refreshRankingScreen();
    }
  }, 0);
}, true);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") return stopPolling();
  if (pointScreenActive()) refreshPointScreen(false).finally(() => schedulePolling());
});

window.addEventListener("focus", () => {
  if (pointScreenActive() && !usingPointProduct && !usingPointGift) refreshPointScreen(false).finally(() => schedulePolling());
  if (cardDrawScreenActive()) ensureCardDrawLoaded(true);
});

function cardDrawScreenActive() {
  return document.visibilityState !== "hidden" && typeof session !== "undefined" && session.mode === "firebase-student" && Boolean(document.querySelector("[data-student-draw-stage]"));
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && cardDrawScreenActive()) ensureCardDrawLoaded(true);
});

requestRender();
