(() => {
  let cloudLoading = false;
  let cloudLoadedClassId = "";
  let teacherPointPollTimer = null;
  let teacherPointPollClassId = "";
  let teacherPointRenderPending = false;
  const TEACHER_POINT_POLL_INTERVAL = 5000;
  function cloudClassId() { return window.ourClassFirebase?.getActiveClassId?.() || ""; }
  function cloudEnabled() { return Boolean(window.ourClassFirebase?.ready && window.ourClassFirebase?.getCurrentUser?.()?.uid && cloudClassId()); }
  function teacherPointPollingActive() { return document.visibilityState !== "hidden" && session.mode === "teacher" && session.view === "points" && cloudEnabled(); }
  function cloudShopSignature(items, requests) {
    const itemKeys = ["id", "name", "description", "icon", "price", "dailyStock", "perStudentDailyLimit", "approvalRequired", "active", "deleted"];
    const requestKeys = ["id", "status", "studentId", "itemId", "itemName", "date", "price", "approvalRequired", "createdAt", "resolvedAt", "cancelledAt", "cancelledBy"];
    const rows = (values, keys) => (Array.isArray(values) ? values : []).map((value) => Object.fromEntries(keys.map((key) => [key, value?.[key] ?? null]))).sort((a, b) => String(a.id).localeCompare(String(b.id)));
    return JSON.stringify({items: rows(items, itemKeys), requests: rows(requests, requestKeys)});
  }
  function stopTeacherPointPolling(resetClass = true) {
    if (teacherPointPollTimer !== null) clearTimeout(teacherPointPollTimer);
    teacherPointPollTimer = null;
    if (resetClass) { teacherPointPollClassId = ""; teacherPointRenderPending = false; }
  }
  function flushTeacherPointRender() {
    if (!teacherPointRenderPending || !teacherPointPollingActive() || document.querySelector(".modal")) return;
    teacherPointRenderPending = false;
    render();
  }
  function scheduleTeacherPointPolling() {
    if (!teacherPointPollingActive()) return stopTeacherPointPolling();
    if (teacherPointPollTimer !== null) return;
    teacherPointPollTimer = setTimeout(async () => {
      teacherPointPollTimer = null;
      if (!teacherPointPollingActive()) return stopTeacherPointPolling();
      await loadCloudShop(true, true);
      flushTeacherPointRender();
      scheduleTeacherPointPolling();
    }, TEACHER_POINT_POLL_INTERVAL);
  }
  function syncTeacherPointPolling() {
    if (!teacherPointPollingActive()) return stopTeacherPointPolling();
    const classId = cloudClassId();
    if (teacherPointPollClassId === classId) return scheduleTeacherPointPolling();
    stopTeacherPointPolling(false);
    teacherPointPollClassId = classId;
    loadCloudShop(true, true).finally(() => scheduleTeacherPointPolling());
  }
  async function loadCloudShop(force = false, quiet = false) {
    const classId = cloudClassId();
    if (!cloudEnabled() || cloudLoading || (!force && cloudLoadedClassId === classId)) return;
    cloudLoading = true;
    try {
      let result = await window.ourClassFirebase.getPointShopData({classId, mode: "teacher"});
      if (!result.items?.length && data.pointShopItems.some((item) => !item.deleted)) {
        await window.ourClassFirebase.savePointShopProduct({classId, action: "migrate", items: data.pointShopItems});
        result = await window.ourClassFirebase.getPointShopData({classId, mode: "teacher"});
      }
      const items = Array.isArray(result.items) ? result.items : [];
      const requests = Array.isArray(result.requests) ? result.requests : [];
      const changed = cloudShopSignature(data.pointShopItems, data.pointUseRequests) !== cloudShopSignature(items, requests);
      data.pointShopItems = items;
      data.pointUseRequests = requests;
      cloudLoadedClassId = classId;
      if (changed) saveData();
      if (changed && session.mode === "teacher" && session.view === "points") {
        if (document.querySelector(".modal")) teacherPointRenderPending = true;
        else render();
      }
      return changed;
    } catch (error) { console.error("Point shop cloud load failed", error); if (!quiet) toast("포인트 상품을 클라우드에서 불러오지 못했습니다."); }
    finally { cloudLoading = false; }
  }
  async function saveCloudItem(item) {
    if (!cloudEnabled()) return;
    await window.ourClassFirebase.savePointShopProduct({classId: cloudClassId(), item});
    await loadCloudShop(true);
  }
  function itemById(id) { return data.pointShopItems.find((item) => item.id === id); }
  function completedUses(itemId, date = todayString(), studentId = "") { return data.pointUseRequests.filter((request) => request.itemId === itemId && request.date === date && request.status === "completed" && (!studentId || request.studentId === studentId)).length; }
  function pendingRequest(itemId, studentId, date = todayString()) { return data.pointUseRequests.find((request) => request.itemId === itemId && request.studentId === studentId && request.date === date && request.status === "pending"); }
  function remainingStock(item, date = todayString()) { return Math.max(0, item.dailyStock - data.pointUseRequests.filter((request) => request.itemId === item.id && request.date === date && ["pending", "completed"].includes(request.status)).length); }
  function requestBlockReason(item, student, date = todayString(), requestId = "", price = item?.price ?? 0) {
    if (!item || item.deleted || !item.active) return "현재 신청할 수 없는 상품입니다.";
    if (!student) return "학생 정보를 찾을 수 없습니다.";
    if (student.points < price) return "포인트가 부족합니다.";
    if (remainingStock(item, date) < 1) return "오늘 사용 가능한 수량이 모두 소진되었습니다.";
    if (completedUses(item.id, date, student.id) >= item.perStudentDailyLimit) return `오늘 개인 사용 제한(${item.perStudentDailyLimit}회)에 도달했습니다.`;
    const pending = pendingRequest(item.id, student.id, date); if (pending && pending.id !== requestId) return "오늘 같은 상품의 승인 대기 신청이 이미 있습니다.";
    return "";
  }
  function addUseHistory(student, item, request) {
    return applyStudentPointChange(student, -request.price, { id: crypto.randomUUID(), amount: -request.price, reason: `${item.name} 사용`, source: "포인트 상품", relatedId: request.id, date: new Date().toLocaleDateString("ko-KR"), createdAt: new Date().toISOString() });
  }

  function studentShopSection(student) {
    const items = data.pointShopItems.filter((item) => item.active && !item.deleted);
    const cards = items.map((item) => { const remaining = remainingStock(item); const reason = requestBlockReason(item, student); return `<article class="card point-shop-card"><div class="point-shop-card-heading"><h3>${escapeHtml(item.name)}</h3><strong>${item.price}P</strong></div>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}<dl><div><dt>오늘 남은 수량</dt><dd>${remaining} / ${item.dailyStock}</dd></div><div><dt>학생당 하루</dt><dd>${item.perStudentDailyLimit}회</dd></div><div><dt>처리 방식</dt><dd>${item.approvalRequired ? "교사 승인" : "즉시 사용"}</dd></div></dl><button class="button success" data-action="ask-use-point-item" data-id="${item.id}" ${reason ? "disabled" : ""}>신청하기</button>${reason ? `<small class="point-shop-block-reason">${escapeHtml(reason)}</small>` : ""}</article>`; }).join("");
    return `<section class="student-point-shop"><div class="section-heading"><div><h2>포인트 사용</h2><p class="muted">포인트로 우리 반 상품을 신청할 수 있습니다.</p></div></div>${cards ? `<div class="point-shop-grid">${cards}</div>` : `<div class="empty">현재 이용할 수 있는 포인트 상품이 없습니다.</div>`}</section>`;
  }

  const originalStudentPoints = studentPoints;
  studentPoints = function pointShopStudentPoints() {
    const html = originalStudentPoints(); const marker = `<section class="student-point-history">`;
    return html.replace(marker, `${studentShopSection(currentStudent())}${marker}`);
  };

  function pendingSection() {
    const requests = data.pointUseRequests.filter((request) => request.status === "pending").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const rows = requests.map((request) => { const student = studentById(request.studentId); const item = itemById(request.itemId); const studentLabel = student ? `${studentNumber(student)}번 ${student.name}` : "삭제된 학생"; return `<article class="point-request-row"><div><strong>${escapeHtml(studentLabel)}</strong><span>${escapeHtml(item?.name || "삭제된 상품")} · ${request.price}P</span><small>${new Date(request.createdAt).toLocaleString("ko-KR")}</small></div><div class="button-row"><button class="button success compact" data-action="approve-point-use" data-id="${request.id}">승인</button><button class="button danger compact" data-action="reject-point-use" data-id="${request.id}">거절</button></div></article>`; }).join("");
    return `<section class="management-section point-request-section"><div class="section-heading"><div><h2>사용 승인 대기</h2><p class="muted">승인 시 재고, 개인 제한, 현재 포인트를 다시 확인합니다.</p></div><span class="pill waiting">${requests.length}건</span></div>${rows ? `<div class="point-request-list">${rows}</div>` : `<div class="empty">승인 대기 중인 신청이 없습니다.</div>`}</section>`;
  }
  function todayRequestsForItem(itemId) { return data.pointUseRequests.filter((request) => request.itemId === itemId && request.date === todayString()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)); }
  function pointShopSetItems() { return data.pointShopItems.filter((item) => !item.deleted).map(({ name, description, price, dailyStock, perStudentDailyLimit, approvalRequired, active }) => ({ name, description, price, dailyStock, perStudentDailyLimit, approvalRequired, active })); }
  function teacherShopSection() {
    const items = data.pointShopItems.filter((item) => !item.deleted);
    const rows = items.map((item) => { const applicantCount = new Set(todayRequestsForItem(item.id).filter((request) => ["pending", "completed"].includes(request.status)).map((request) => request.studentId)).size; return `<article class="card point-shop-manage-card"><div><div class="point-shop-card-heading"><h3>${escapeHtml(item.name)}</h3><strong>${item.price}P</strong></div>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}<small>오늘 남은 수량 ${remainingStock(item)} / ${item.dailyStock} · 학생당 하루 ${item.perStudentDailyLimit}회 · ${item.approvalRequired ? "승인 필요" : "즉시 사용"}</small></div><div class="button-row"><button class="button secondary compact" data-action="view-point-shop-requests" data-id="${item.id}">신청 현황 ${applicantCount}명</button><button class="button ${item.active ? "success" : "secondary"} compact" data-action="toggle-point-shop-item" data-id="${item.id}">${item.active ? "ON" : "OFF"}</button><button class="button secondary compact" data-action="edit-point-shop-item" data-id="${item.id}">수정</button><button class="button danger compact" data-action="ask-delete-point-shop-item" data-id="${item.id}">삭제</button></div></article>`; }).join("");
    return `${pendingSection()}<section class="management-section"><div class="section-heading"><div><h2>포인트 상품 관리</h2><p class="muted">상품 설정은 날짜가 바뀌어도 유지됩니다.</p></div><div class="button-row"><button class="button secondary" data-action="save-point-shop-set">현재 상품을 세트로 저장</button><button class="button secondary" data-action="manage-point-shop-sets">저장된 세트 불러오기/관리</button><button class="button success" data-action="new-point-shop-item">+ 상품 추가</button></div></div>${rows ? `<div class="point-shop-manage-list">${rows}</div>` : `<div class="empty">등록된 포인트 상품이 없습니다.</div>`}</section>`;
  }
  const originalTeacherPoints = teacherPoints;
  teacherPoints = function pointShopTeacherPoints() { setTimeout(() => syncTeacherPointPolling(), 0); return `${originalTeacherPoints()}${teacherShopSection()}`; };

  function openItemModal(id = "") {
    const item = itemById(id);
    app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="point-shop-item-form" class="modal-card form" data-id="${id}"><h2>${item ? "포인트 상품 수정" : "포인트 상품 추가"}</h2><label>상품명<input name="name" maxlength="80" required value="${escapeHtml(item?.name || "")}" placeholder="예: 급식 자유자리"></label><label>설명 (선택)<textarea name="description" maxlength="300" rows="4">${escapeHtml(item?.description || "")}</textarea></label><label>가격(P)<input name="price" type="number" min="0" step="1" required value="${item?.price ?? 30}"></label><label>하루 전체 사용 가능 수량<input name="dailyStock" type="number" min="1" step="1" required value="${item?.dailyStock ?? 5}"></label><label>학생 1인당 하루 사용 제한<input name="perStudentDailyLimit" type="number" min="1" step="1" required value="${item?.perStudentDailyLimit ?? 1}"></label><label class="check-label"><input name="approvalRequired" type="checkbox" ${item?.approvalRequired !== false ? "checked" : ""}><span>교사 승인 필요</span></label><label class="check-label"><input name="active" type="checkbox" ${item?.active !== false ? "checked" : ""}><span>활성화</span></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
  }
  function openUseConfirm(item, student) {
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>${item.approvalRequired ? "상품 사용 신청" : "포인트 사용 확인"}</h2><p><strong>${escapeHtml(item.name)}</strong> · ${item.price}P</p><dl class="point-use-confirm"><div><dt>현재 포인트</dt><dd>${student.points}P</dd></div><div><dt>${item.approvalRequired ? "승인 후 포인트" : "사용 후 포인트"}</dt><dd>${student.points - item.price}P</dd></div></dl><p class="muted">${item.approvalRequired ? "교사 승인 전에는 포인트가 차감되지 않습니다." : "확인하면 즉시 포인트가 차감됩니다."}</p><div class="button-row"><button class="button success" data-action="confirm-use-point-item" data-id="${item.id}">${item.approvalRequired ? "신청" : "사용"}</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`);
  }
  function openSaveSetModal() {
    app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="point-shop-set-form" class="modal-card form"><h2>현재 상품을 세트로 저장</h2><p class="muted">삭제되지 않은 상품 ${pointShopSetItems().length}개의 설정을 저장합니다.</p><label>세트 이름<input name="name" maxlength="60" required placeholder="예: 평소 세트"></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
  }
  function openSetManager() {
    const rows = data.pointShopSets.map((set) => `<article class="point-shop-set-row"><div><strong>${escapeHtml(set.name)}</strong><small>상품 ${set.items.length}개</small></div><div class="button-row"><button class="button success compact" data-action="load-point-shop-set" data-id="${set.id}">불러오기</button><button class="button secondary compact" data-action="overwrite-point-shop-set" data-id="${set.id}">현재 상품으로 덮어쓰기</button><button class="button secondary compact" data-action="rename-point-shop-set" data-id="${set.id}">이름 수정</button><button class="button danger compact" data-action="delete-point-shop-set" data-id="${set.id}">삭제</button></div></article>`).join("");
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card point-shop-set-modal"><div class="section-heading"><div><h2>저장된 상품 세트</h2><p class="muted">세트에는 상품 설정만 저장됩니다.</p></div></div>${rows ? `<div class="point-shop-set-list">${rows}</div>` : `<div class="empty">저장된 상품 세트가 없습니다.</div>`}<div class="button-row"><button class="button secondary" data-action="close-modal">닫기</button></div></section></div>`);
  }
  function openRenameSetModal(id) { const set = data.pointShopSets.find((item) => item.id === id); if (!set) return; app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="point-shop-set-rename-form" class="modal-card form" data-id="${id}"><h2>세트 이름 수정</h2><label>세트 이름<input name="name" maxlength="60" required value="${escapeHtml(set.name)}"></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`); }
  function openItemRequests(itemId) {
    const item = itemById(itemId); if (!item) return; const labels = { pending: "승인 대기", completed: "사용 완료", rejected: "거절", cancelled: "학생 취소", reversed: "사용 취소됨" }; const requests = todayRequestsForItem(itemId);
    const rows = requests.map((request) => { const student = studentById(request.studentId); const studentLabel = student ? `${studentNumber(student)}번 ${student.name}` : "삭제된 학생"; return `<article class="point-request-row"><div><strong>${escapeHtml(studentLabel)}</strong><span>${escapeHtml(item.name)} · ${request.price}P</span><small>${labels[request.status]} · ${new Date(request.createdAt).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" })}</small></div>${request.status === "pending" ? `<div class="button-row"><button class="button success compact" data-action="approve-point-use" data-id="${request.id}">승인</button><button class="button danger compact" data-action="reject-point-use" data-id="${request.id}">거절</button></div>` : ""}</article>`; }).join("");
    app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card point-shop-set-modal"><div class="section-heading"><div><h2>${escapeHtml(item.name)} 신청 현황</h2><p class="muted">오늘 신청한 학생</p></div></div>${rows ? `<div class="point-request-list">${rows}</div>` : `<div class="empty">오늘 신청한 학생이 없습니다.</div>`}<div class="button-row"><button class="button secondary" data-action="close-modal">닫기</button></div></section></div>`);
  }

  app.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action]"); if (!target) return; const action = target.dataset.action;
    if (action === "close-modal") { setTimeout(() => { flushTeacherPointRender(); syncTeacherPointPolling(); }, 0); return; }
    if (action === "new-point-shop-item") return openItemModal();
    if (action === "save-point-shop-set") return openSaveSetModal();
    if (action === "manage-point-shop-sets") return openSetManager();
    if (action === "view-point-shop-requests") return openItemRequests(target.dataset.id);
    if (action === "rename-point-shop-set") { target.closest(".modal")?.remove(); return openRenameSetModal(target.dataset.id); }
    if (action === "delete-point-shop-set") { const set = data.pointShopSets.find((item) => item.id === target.dataset.id); if (!set || !confirm(`‘${set.name}’ 세트를 삭제할까요?`)) return; data.pointShopSets = data.pointShopSets.filter((item) => item.id !== set.id); saveData(); render(); toast("상품 세트를 삭제했습니다."); return; }
    if (action === "overwrite-point-shop-set") { const set = data.pointShopSets.find((item) => item.id === target.dataset.id); if (!set || !confirm(`‘${set.name}’ 세트를 현재 상품 구성으로 덮어쓸까요?`)) return; set.items = pointShopSetItems(); set.updatedAt = new Date().toISOString(); saveData(); render(); toast("상품 세트를 수정했습니다."); return; }
    if (action === "load-point-shop-set") { const set = data.pointShopSets.find((item) => item.id === target.dataset.id); if (!set || !confirm(`‘${set.name}’ 세트를 현재 상품으로 불러올까요?`)) return; const now = new Date().toISOString(); data.pointShopItems.filter((item) => !item.deleted).forEach((item) => { item.active = false; item.deleted = true; item.updatedAt = now; }); data.pointShopItems.push(...set.items.map((item) => ({ id: crypto.randomUUID(), ...structuredClone(item), deleted: false, createdAt: now, updatedAt: now }))); saveData(); render(); try { if (cloudEnabled()) { await Promise.all(data.pointShopItems.map((item) => window.ourClassFirebase.savePointShopProduct({classId: cloudClassId(), item}))); await loadCloudShop(true); } toast("상품 세트를 불러왔습니다."); } catch (error) { console.error(error); await loadCloudShop(true); toast("상품 세트를 클라우드에 저장하지 못했습니다."); } return; }
    if (action === "edit-point-shop-item") return openItemModal(target.dataset.id);
    if (action === "toggle-point-shop-item") { const item = itemById(target.dataset.id); if (!item || item.deleted) return; item.active = !item.active; item.updatedAt = new Date().toISOString(); saveData(); render(); try { await saveCloudItem(item); toast(`상품을 ${item.active ? "활성화" : "비활성화"}했습니다.`); } catch (error) { console.error(error); await loadCloudShop(true); toast("상품 상태를 클라우드에 저장하지 못했습니다."); } return; }
    if (action === "ask-delete-point-shop-item") { const item = itemById(target.dataset.id); if (!item) return; app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>상품 삭제</h2><p><strong>${escapeHtml(item.name)}</strong> 상품을 삭제하시겠습니까?</p><p class="muted">과거 사용 기록은 유지됩니다.</p><div class="button-row"><button class="button danger" data-action="confirm-delete-point-shop-item" data-id="${item.id}">삭제</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return; }
    if (action === "confirm-delete-point-shop-item") { const item = itemById(target.dataset.id); if (!item) return; item.deleted = true; item.active = false; item.updatedAt = new Date().toISOString(); saveData(); render(); try { await saveCloudItem(item); toast("상품을 삭제했습니다."); } catch (error) { console.error(error); await loadCloudShop(true); toast("상품 삭제를 클라우드에 저장하지 못했습니다."); } return; }
    if (action === "ask-use-point-item") { const item = itemById(target.dataset.id); const student = currentStudent(); const reason = requestBlockReason(item, student); if (reason) return toast(reason); return openUseConfirm(item, student); }
    if (action === "confirm-use-point-item") {
      const item = itemById(target.dataset.id); const student = currentStudent(); const reason = requestBlockReason(item, student); if (reason) { target.closest(".modal")?.remove(); return toast(reason); }
      const now = new Date().toISOString(); const request = { id: crypto.randomUUID(), itemId: item.id, studentId: student.id, date: todayString(), price: item.price, status: item.approvalRequired ? "pending" : "completed", createdAt: now, resolvedAt: item.approvalRequired ? null : now };
      if (!item.approvalRequired && !addUseHistory(student, item, request)) { if (pointChangeFailureReason !== "cloud-unavailable") toast("포인트가 부족합니다."); return; } data.pointUseRequests.push(request); saveData(); render(); toast(item.approvalRequired ? "사용 승인을 신청했습니다." : `${item.name} 상품을 사용했습니다.`); return;
    }
    if (action === "approve-point-use" && cloudEnabled()) { try { await window.ourClassFirebase.resolvePointUseRequest({classId: cloudClassId(), requestId: target.dataset.id, decision: "approve"}); await loadCloudShop(true); toast("사용을 승인했습니다."); } catch (error) { console.error(error); await loadCloudShop(true); toast("승인하지 못했습니다. 잔액과 수량을 확인해 주세요."); } return; }
    if (action === "reject-point-use" && cloudEnabled()) { try { await window.ourClassFirebase.resolvePointUseRequest({classId: cloudClassId(), requestId: target.dataset.id, decision: "reject"}); await loadCloudShop(true); toast("사용 신청을 거절했습니다."); } catch (error) { console.error(error); await loadCloudShop(true); toast("신청을 처리하지 못했습니다."); } return; }
    if (action === "reverse-point-product-use" && cloudEnabled()) {
      if (!confirm("이 상품 사용을 되돌리고 차감된 포인트를 학생에게 다시 지급할까요?\n기존 사용 기록은 감사 이력으로 유지됩니다.")) return;
      target.disabled = true;
      try {
        const result = await window.ourClassFirebase.reversePointProductUse({classId: cloudClassId(), requestId: target.dataset.id});
        if (result?.ok !== true || result.status !== "reversed") throw new Error("Invalid reversal response.");
        await Promise.all([loadCloudShop(true), loadFirebasePoints(firebaseTeacherUser.uid, false)]);
        saveData(); render(); toast(`${result.refundedPoints}P를 학생에게 반환했습니다.`);
      } catch (error) {
        console.error("Point product reversal failed", error);
        await Promise.all([loadCloudShop(true), loadFirebasePoints(firebaseTeacherUser.uid, false)]);
        render(); toast(String(error?.message || "").includes("already-reversed") ? "이미 취소된 상품 사용입니다." : "상품 사용을 되돌리지 못했습니다.");
      }
      return;
    }
    if (action === "approve-point-use") {
      const request = data.pointUseRequests.find((item) => item.id === target.dataset.id); if (!request || request.status !== "pending") return toast("이미 처리된 신청입니다.");
      const item = itemById(request.itemId); const student = studentById(request.studentId); const reason = requestBlockReason(item, student, request.date, request.id, request.price); if (reason) return toast(reason);
      if (!addUseHistory(student, item, request)) { if (pointChangeFailureReason !== "cloud-unavailable") toast("포인트가 부족합니다."); return; } request.status = "completed"; request.resolvedAt = new Date().toISOString(); saveData(); render(); toast(`${student.name}의 사용을 승인했습니다.`); return;
    }
    if (action === "reject-point-use") { const request = data.pointUseRequests.find((item) => item.id === target.dataset.id); if (!request || request.status !== "pending") return toast("이미 처리된 신청입니다."); request.status = "rejected"; request.resolvedAt = new Date().toISOString(); saveData(); render(); toast("사용 신청을 거절했습니다."); return; }
  });

  app.addEventListener("submit", async (event) => {
    const form = event.target; if (form.id !== "point-shop-item-form") return; event.preventDefault(); const values = new FormData(form); const name = String(values.get("name") || "").trim(); const description = String(values.get("description") || "").trim(); const price = Number(values.get("price")); const dailyStock = Number(values.get("dailyStock")); const perStudentDailyLimit = Number(values.get("perStudentDailyLimit"));
    if (!name || !Number.isInteger(price) || price < 0 || !Number.isInteger(dailyStock) || dailyStock < 1 || !Number.isInteger(perStudentDailyLimit) || perStudentDailyLimit < 1) return toast("상품 설정값을 확인해 주세요.");
    const now = new Date().toISOString(); const existing = itemById(form.dataset.id); const update = { name: name.slice(0, 80), description: description.slice(0, 300), price, dailyStock, perStudentDailyLimit, approvalRequired: values.has("approvalRequired"), active: values.has("active"), updatedAt: now };
    const savedItem = existing || { id: crypto.randomUUID(), deleted: false, createdAt: now }; Object.assign(savedItem, update); if (!existing) data.pointShopItems.push(savedItem); saveData(); render();
    try { await saveCloudItem(savedItem); toast(existing ? "상품을 수정했습니다." : "상품을 추가했습니다."); } catch (error) { console.error(error); await loadCloudShop(true); toast("상품을 클라우드에 저장하지 못했습니다."); }
  });
  app.addEventListener("submit", (event) => {
    const form = event.target; if (form.id !== "point-shop-set-form" && form.id !== "point-shop-set-rename-form") return; event.preventDefault(); const name = String(new FormData(form).get("name") || "").trim().slice(0, 60); if (!name) return;
    const now = new Date().toISOString(); if (form.id === "point-shop-set-form") data.pointShopSets.push({ id: crypto.randomUUID(), name, items: pointShopSetItems(), createdAt: now, updatedAt: now }); else { const set = data.pointShopSets.find((item) => item.id === form.dataset.id); if (!set) return; set.name = name; set.updatedAt = now; }
    saveData(); render(); toast(form.id === "point-shop-set-form" ? "현재 상품을 세트로 저장했습니다." : "세트 이름을 수정했습니다.");
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-action]");
    if (!target) return;
    if (["firebase-logout", "go-home"].includes(target.dataset.action)) stopTeacherPointPolling();
    setTimeout(() => syncTeacherPointPolling(), 0);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopTeacherPointPolling();
    else syncTeacherPointPolling();
  });
})();
