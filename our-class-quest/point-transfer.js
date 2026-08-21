(() => {
  let processingTransfer = false;
  let showAllPointTransfers = false;
  let cloudGift = {classId: "", loading: false, loaded: false, data: null, promise: null};

  function activeCloudClassId() { return String(window.ourClassFirebase?.getActiveClassId?.() || ""); }
  function mapCloudSettings(settings) { return {enabled: settings?.enabled === true, maxPerTransfer: Number(settings?.maxPointsPerTransfer) || 10, dailyMaxAmount: Number(settings?.maxPointsPerDay) || 20, dailyMaxCount: Number(settings?.maxTransfersPerDay) || 3}; }
  async function loadCloudGift(force = false) {
    const classId = activeCloudClassId();
    if (!classId || !window.ourClassFirebase?.getPointGiftData) return null;
    if (cloudGift.classId !== classId) cloudGift = {classId, loading: false, loaded: false, data: null, promise: null};
    if (!force && cloudGift.loaded) return cloudGift.data;
    if (cloudGift.promise) return cloudGift.promise;
    cloudGift.loading = true;
    cloudGift.promise = (async () => {
      let value = await window.ourClassFirebase.getPointGiftData({classId, mode: "teacher"});
      if (value?.ok === true && value.settingsExists === false) {
        await window.ourClassFirebase.savePointGiftSettings({classId, action: "migrate", settings: {enabled: data.pointTransferSettings.enabled, maxPointsPerTransfer: data.pointTransferSettings.maxPerTransfer, maxPointsPerDay: data.pointTransferSettings.dailyMaxAmount, maxTransfersPerDay: data.pointTransferSettings.dailyMaxCount}});
        value = await window.ourClassFirebase.getPointGiftData({classId, mode: "teacher"});
      }
      cloudGift.data = value; cloudGift.loaded = true;
      if (value?.settings) data.pointTransferSettings = mapCloudSettings(value.settings);
      if (Array.isArray(value?.history)) data.pointTransfers = value.history;
      return value;
    })().catch((caught) => { console.error("Teacher point gift load failed", caught); return null; })
      .finally(() => { cloudGift.loading = false; cloudGift.promise = null; if (typeof render === "function") render(); });
    return cloudGift.promise;
  }

  function transfersSentToday(studentId) { return data.pointTransfers.filter((transfer) => transfer.fromStudentId === studentId && transfer.date === todayString()); }
  function transferUsage(studentId) { const transfers = transfersSentToday(studentId); return { count: transfers.length, amount: transfers.reduce((sum, transfer) => sum + transfer.amount, 0) }; }
  function studentLabel(student) { return student ? `${studentNumber(student)}번 ${student.name}` : "삭제된 학생"; }
  function transferBlockReason(fromStudent, toStudent, amount) {
    const settings = data.pointTransferSettings;
    if (!settings.enabled) return "선생님이 현재 친구 선물 기능을 사용하지 않도록 설정했습니다.";
    if (!toStudent) return "받을 친구를 선택해 주세요.";
    if (toStudent.id === fromStudent.id) return "자기 자신에게는 선물할 수 없습니다.";
    if (toStudent.active === false) return "현재 활동 중인 친구에게만 선물할 수 있습니다.";
    if (!Number.isInteger(amount) || amount <= 0) return "선물 포인트는 1 이상의 정수로 입력해 주세요.";
    if (amount > fromStudent.points) return "현재 보유 포인트가 부족합니다.";
    if (amount > settings.maxPerTransfer) return `한 번에 최대 ${settings.maxPerTransfer}P까지 선물할 수 있습니다.`;
    const usage = transferUsage(fromStudent.id);
    if (usage.amount + amount > settings.dailyMaxAmount) return `하루 최대 ${settings.dailyMaxAmount}P까지 선물할 수 있습니다.`;
    if (usage.count >= settings.dailyMaxCount) return `하루 최대 ${settings.dailyMaxCount}회까지 선물할 수 있습니다.`;
    return "";
  }

  function transferSection(student) {
    const settings = data.pointTransferSettings;
    if (!settings.enabled) return `<section class="student-point-transfer"><div class="section-heading"><h2>친구에게 선물</h2></div><div class="empty">선생님이 현재 친구 선물 기능을 사용하지 않도록 설정했습니다.</div></section>`;
    const friends = activeStudents().filter((friend) => friend.id !== student.id); const usage = transferUsage(student.id); const remaining = Math.max(0, settings.dailyMaxAmount - usage.amount);
    return `<section class="student-point-transfer"><div class="section-heading"><div><h2>친구에게 선물</h2><p class="muted">내 포인트를 친구에게 바로 선물합니다.</p></div></div><section class="card point-transfer-card"><div class="point-transfer-limits"><div><span>오늘 선물</span><strong>${usage.count}회 / ${settings.dailyMaxCount}회</strong></div><div><span>오늘 보낸 포인트</span><strong>${usage.amount}P / ${settings.dailyMaxAmount}P</strong></div><div><span>1회 최대</span><strong>${settings.maxPerTransfer}P</strong></div><div><span>현재 보유</span><strong>${student.points}P</strong></div></div><p class="muted">오늘 추가로 최대 ${Math.min(remaining, settings.maxPerTransfer, student.points)}P까지 선물할 수 있어요.</p><form id="point-transfer-form" class="point-transfer-form"><label>받을 친구<select name="toStudentId" required><option value="">친구 선택</option>${friends.map((friend) => `<option value="${friend.id}">${escapeHtml(studentLabel(friend))}</option>`).join("")}</select></label><label>선물할 포인트<input name="amount" type="number" min="1" step="1" max="${settings.maxPerTransfer}" required></label><button class="button success" type="submit" ${friends.length ? "" : "disabled"}>선물하기</button></form>${friends.length ? "" : `<small class="point-transfer-warning">선물할 수 있는 활성 친구가 없습니다.</small>`}</section></section>`;
  }

  const originalStudentPoints = studentPoints;
  studentPoints = function pointTransferStudentPoints() {
    const html = originalStudentPoints(); const marker = `<section class="student-point-history">`;
    return html.replace(marker, `${transferSection(currentStudent())}${marker}`);
  };

  function teacherSettingsSection() {
    const settings = data.pointTransferSettings;
    return `<section class="management-section"><div class="section-heading"><div><h2>친구 포인트 선물 설정</h2><p class="muted">학생 간 포인트 선물 한도를 설정합니다.</p></div></div><form id="point-transfer-settings-form" class="card point-transfer-settings"><label class="point-gift-toggle"><span>친구 선물 기능 사용</span><input name="enabled" type="checkbox" ${settings.enabled ? "checked" : ""}><i aria-hidden="true"></i><b>${settings.enabled ? "ON" : "OFF"}</b></label><label>1회 최대 포인트<input name="maxPerTransfer" type="number" min="1" step="1" required value="${settings.maxPerTransfer}"></label><label>하루 최대 총 포인트<input name="dailyMaxAmount" type="number" min="1" step="1" required value="${settings.dailyMaxAmount}"></label><label>하루 최대 전송 횟수<input name="dailyMaxCount" type="number" min="1" step="1" required value="${settings.dailyMaxCount}"></label><button class="button success" type="submit" ${cloudGift.loading ? "disabled" : ""}>설정 저장</button></form></section>`;
  }
  function teacherTransferHistory() {
    const sorted = [...data.pointTransfers].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))); const shown = showAllPointTransfers ? sorted : sorted.slice(0, 10);
    const rows = shown.map((transfer) => { const from = studentById(transfer.fromStudentId || transfer.senderStudentId); const to = studentById(transfer.toStudentId || transfer.receiverStudentId); const fromName = transfer.senderName || (from ? studentLabel(from) : "삭제된 학생"); const toName = transfer.receiverName || (to ? studentLabel(to) : "삭제된 학생"); return `<article class="point-transfer-history-row"><div><strong>${escapeHtml(fromName)} → ${escapeHtml(toName)}</strong><small>${transfer.createdAt ? new Date(transfer.createdAt).toLocaleString("ko-KR") : escapeHtml(transfer.date || "")}</small></div><b>${transfer.amount}P</b></article>`; }).join("");
    return `<section class="management-section"><div class="section-heading"><div><h2>친구 포인트 선물 기록</h2><p class="muted">최근 전송 기록부터 표시합니다.</p></div><span class="muted">${sorted.length}건</span></div>${rows ? `<div class="point-transfer-history">${rows}</div>` : `<div class="empty">친구에게 선물한 기록이 없습니다.</div>`}${sorted.length > 10 ? `<button class="button secondary record-view-all" data-action="toggle-point-transfer-history">${showAllPointTransfers ? "최근 10건만 보기" : "더 보기"}</button>` : ""}</section>`;
  }
  const originalTeacherPoints = teacherPoints;
  teacherPoints = function pointTransferTeacherPoints() { if (!cloudGift.loaded && !cloudGift.loading) setTimeout(() => loadCloudGift(), 0); return `${originalTeacherPoints()}${teacherSettingsSection()}${teacherTransferHistory()}`; };

  function openTransferConfirm(toStudent, amount) {
    const student = currentStudent();
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>친구에게 포인트 선물</h2><p><strong>${escapeHtml(toStudent.name)}</strong>에게 <strong>${amount}P</strong>를 선물할까요?</p><dl class="point-use-confirm"><div><dt>현재 포인트</dt><dd>${student.points}P</dd></div><div><dt>선물 포인트</dt><dd>${amount}P</dd></div><div><dt>전송 후 포인트</dt><dd>${student.points - amount}P</dd></div></dl><div class="button-row"><button class="button success" data-action="confirm-point-transfer" data-to="${toStudent.id}" data-amount="${amount}">선물하기</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`);
  }

  function completePointTransfer(toStudentId, amount) {
    if (processingTransfer) return;
    processingTransfer = true;
    try {
      const fromStudent = currentStudent(); const toStudent = activeStudents().find((student) => student.id === toStudentId); const reason = transferBlockReason(fromStudent, toStudent, amount); if (reason) { toast(reason); return; }
      const transferId = crypto.randomUUID(); const now = new Date().toISOString();
      const fromEntry = { id: crypto.randomUUID(), amount: -amount, reason: `친구에게 선물 (${toStudent.name})`, source: "친구 포인트 선물", relatedId: transferId, date: new Date().toLocaleDateString("ko-KR"), createdAt: now };
      const toEntry = { id: crypto.randomUUID(), amount, reason: `친구에게 선물 받음 (${fromStudent.name})`, source: "친구 포인트 선물", relatedId: transferId, date: new Date().toLocaleDateString("ko-KR"), createdAt: now };
      if (!applyStudentPointChanges([{ student: fromStudent, balanceDelta: -amount, historyEntries: fromEntry }, { student: toStudent, balanceDelta: amount, historyEntries: toEntry }])) { if (pointChangeFailureReason !== "cloud-unavailable") toast("현재 보유 포인트가 부족합니다."); return; }
      data.pointTransfers.push({ id: transferId, fromStudentId: fromStudent.id, toStudentId: toStudent.id, amount, date: todayString(), createdAt: now });
      saveData(); render(); toast(`${toStudent.name}에게 ${amount}P를 선물했습니다.`);
    } finally { processingTransfer = false; }
  }

  app.addEventListener("submit", async (event) => {
    const form = event.target; if (form.id !== "point-transfer-form" && form.id !== "point-transfer-settings-form") return; event.preventDefault(); const values = new FormData(form);
    if (form.id === "point-transfer-settings-form") { const maxPerTransfer = Number(values.get("maxPerTransfer")); const dailyMaxAmount = Number(values.get("dailyMaxAmount")); const dailyMaxCount = Number(values.get("dailyMaxCount")); if (![maxPerTransfer, dailyMaxAmount, dailyMaxCount].every((value) => Number.isInteger(value) && value > 0)) return toast("제한값은 모두 양의 정수로 입력해 주세요."); const next = { enabled: values.has("enabled"), maxPerTransfer, dailyMaxAmount, dailyMaxCount }; const button = form.querySelector("button[type=submit]"); if (button) button.disabled = true; try { if (activeCloudClassId() && window.ourClassFirebase?.savePointGiftSettings) { await window.ourClassFirebase.savePointGiftSettings({action: "save", settings: {enabled: next.enabled, maxPointsPerTransfer: maxPerTransfer, maxPointsPerDay: dailyMaxAmount, maxTransfersPerDay: dailyMaxCount}}); data.pointTransferSettings = next; await loadCloudGift(true); } else { data.pointTransferSettings = next; saveData(); render(); } toast("친구 포인트 선물 설정을 저장했습니다."); } catch (caught) { console.error("Point gift settings save failed", caught); toast("친구 선물 설정을 저장하지 못했습니다."); if (button) button.disabled = false; } return; }
    const student = currentStudent(); const toStudent = activeStudents().find((friend) => friend.id === values.get("toStudentId")); const amount = Number(values.get("amount")); const reason = transferBlockReason(student, toStudent, amount); if (reason) return toast(reason); openTransferConfirm(toStudent, amount);
  });
  app.addEventListener("click", (event) => { const target = event.target.closest("[data-action]"); if (!target) return; if (target.dataset.action === "confirm-point-transfer") { if (target.disabled || processingTransfer) return; target.disabled = true; return completePointTransfer(target.dataset.to, Number(target.dataset.amount)); } if (target.dataset.action === "toggle-point-transfer-history") { showAllPointTransfers = !showAllPointTransfers; render(); } });
  app.addEventListener("change", (event) => { if (event.target?.name !== "enabled" || event.target.form?.id !== "point-transfer-settings-form") return; const label = event.target.closest(".point-gift-toggle"); const state = label?.querySelector("b"); if (state) state.textContent = event.target.checked ? "ON" : "OFF"; });
})();
