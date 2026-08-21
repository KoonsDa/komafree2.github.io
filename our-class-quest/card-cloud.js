(() => {
  let state = {classId: "", loaded: false, loading: false, error: null, applying: false, promise: null};
  let saveTimer = null;
  let lastSerialized = "";

  function classId() { return String(window.ourClassFirebase?.getActiveClassId?.() || ""); }
  function localConfig() {
    return {cardSets: structuredClone(data.cardSets || []), activeCardSetIds: [...(data.activeCardSetIds || [])],
      drawOptions: structuredClone(data.drawOptions || []), cardUpgradeSettings: structuredClone(data.cardUpgradeSettings || {}),
      cardAbilitySettings: structuredClone(data.cardAbilitySettings || {}), cardAbilities: structuredClone(data.cardAbilities || []),
      cards: structuredClone(data.cards || [])};
  }
  function serializedConfig() { return JSON.stringify(localConfig()); }
  function applyCloud(value) {
    state.applying = true;
    try {
      const config = value?.config || {};
      data.cardSets = Array.isArray(value?.cardSets) ? value.cardSets : [];
      data.cards = Array.isArray(value?.cards) ? value.cards : [];
      data.activeCardSetIds = Array.isArray(config.activeCardSetIds) ? config.activeCardSetIds : [];
      data.drawOptions = Array.isArray(config.drawOptions) ? config.drawOptions : [];
      data.cardUpgradeSettings = config.cardUpgradeSettings || data.cardUpgradeSettings;
      data.cardAbilitySettings = config.cardAbilitySettings || data.cardAbilitySettings;
      data.cardAbilities = Array.isArray(config.cardAbilities) ? config.cardAbilities : [];
      normalizeActiveCardSets();
      teacherCardSetId = data.activeCardSetIds[0] || data.cardSets.find((item) => !item.deleted)?.id || "";
      baseSaveData();
      lastSerialized = serializedConfig();
    } finally { state.applying = false; }
  }

  async function ensureCardConfig(force = false) {
    const nextClassId = classId();
    if (!nextClassId || !window.ourClassFirebase?.getCardConfig) return null;
    if (state.classId !== nextClassId) state = {classId: nextClassId, loaded: false, loading: false, error: null, applying: false, promise: null};
    if (!force && state.loaded) return true;
    if (state.promise) return state.promise;
    state.loading = true; state.error = null;
    state.promise = (async () => {
      let value = await window.ourClassFirebase.getCardConfig({classId: nextClassId});
      if (value?.ok !== true) throw new Error("Card config response was invalid.");
      if (!value.exists) {
        const migration = await window.ourClassFirebase.saveCardConfig({classId: nextClassId, action: "migrate", config: localConfig()});
        value = await window.ourClassFirebase.getCardConfig({classId: nextClassId});
        if (migration?.migrated) toast("기존 카드 설정을 Firebase로 안전하게 이전했습니다.");
      }
      if (value?.exists) applyCloud(value);
      state.loaded = true;
      return true;
    })().catch((caught) => { console.error("Firestore card config load failed", caught); state.error = caught; toast("카드 설정을 불러오지 못했습니다."); return false; })
      .finally(() => { state.loading = false; state.promise = null; if (typeof render === "function") render(); });
    return state.promise;
  }

  function queueCloudSave() {
    if (state.applying || !state.loaded || !classId() || !window.ourClassFirebase?.saveCardConfig) return;
    const next = serializedConfig();
    if (next === lastSerialized) return;
    if (saveTimer !== null) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(async () => {
      saveTimer = null;
      const snapshot = localConfig(); const serialized = JSON.stringify(snapshot); lastSerialized = serialized;
      try { await window.ourClassFirebase.saveCardConfig({action: "save", config: snapshot}); }
      catch (caught) { console.error("Firestore card config save failed", caught); lastSerialized = ""; toast("카드 설정을 클라우드에 저장하지 못했습니다."); }
    }, 200);
  }
  async function saveNow() {
    if (!state.loaded || !classId() || !window.ourClassFirebase?.saveCardConfig) return false;
    if (saveTimer !== null) { window.clearTimeout(saveTimer); saveTimer = null; }
    const snapshot = localConfig(); const serialized = JSON.stringify(snapshot);
    await window.ourClassFirebase.saveCardConfig({action: "save", config: snapshot}); lastSerialized = serialized; return true;
  }

  const baseSaveData = saveData;
  saveData = function saveDataWithCardCloud() { const result = baseSaveData(...arguments); queueCloudSave(); return result; };
  const baseTeacherCards = teacherCardsV2;
  teacherCardsV2 = function teacherCardsWithCloud() {
    if (!state.loaded && !state.loading && !state.error) window.setTimeout(() => ensureCardConfig(), 0);
    const notice = state.loading ? `<div class="card cloud-status"><strong>카드 설정을 Firebase에서 불러오는 중입니다.</strong></div>`
      : state.error ? `<div class="card cloud-status danger"><strong>Firebase 카드 설정을 불러오지 못했습니다.</strong><p class="muted">잠시 후 다시 시도해 주세요.</p><button class="button secondary compact" type="button" data-action="retry-card-config">다시 시도</button></div>` : "";
    return `${notice}${baseTeacherCards()}`;
  };
  document.addEventListener("click", (event) => {
    const target = event.target.closest?.('[data-action="retry-card-config"]');
    if (!target) return;
    state.error = null; ensureCardConfig(true);
  });
  window.ourClassCardCloud = {ensureCardConfig, saveNow, state: () => ({...state})};
})();
