(() => {
  const POLL_INTERVAL = 5000;
  let pollTimer = null;
  let polling = false;
  let canvas = null;
  let context = null;
  let resizeObserver = null;
  let drawing = false;
  let tool = "pen";
  let color = "#f7f3df";
  let width = 7;
  let lastPoint = null;
  let startPoint = null;
  let shapeSnapshot = null;

  function active() { return session.mode === "teacher" && session.view === "board" && Boolean(document.querySelector("#teacher-whiteboard")); }
  function pointItemName(request) { return data.pointShopItems.find((item) => item.id === request.itemId)?.name || request.itemName || "삭제된 상품"; }
  function empty(message) { return `<div class="whiteboard-empty">${escapeHtml(message)}</div>`; }

  function renderPanels() {
    if (!active()) return;
    const roles = todayRoleApplications().filter((application) => ["waiting", "completed"].includes(application.status));
    const roleRows = roles.map((application) => {
      const student = studentById(application.studentId); const role = roleForApplication(application);
      if (!student || !role) return "";
      return `<article class="whiteboard-info-row ${application.status === "completed" ? "completed" : "waiting"}"><strong>${escapeHtml(student.name)}</strong><span>${escapeHtml(role.name)}</span></article>`;
    }).join("");
    const requests = data.pointUseRequests.filter((request) => request.date === todayString() && ["pending", "completed"].includes(request.status));
    const pending = requests.filter((request) => request.status === "pending").sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    const completed = requests.filter((request) => request.status === "completed").sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const requestRows = (items, status) => items.map((request) => `<article class="whiteboard-info-row ${status}"><strong>${escapeHtml(studentById(request.studentId)?.name || "삭제된 학생")}</strong><span>${escapeHtml(pointItemName(request))}</span></article>`).join("");
    document.querySelector("#whiteboard-role-count").textContent = `${roles.length}명`;
    document.querySelector("#whiteboard-role-list").innerHTML = roleRows || empty("오늘 신청한 역할이 없습니다.");
    document.querySelector("#whiteboard-point-count").textContent = `${requests.length}건`;
    document.querySelector("#whiteboard-point-list").innerHTML = requests.length ? `${pending.length ? `<div class="whiteboard-point-group-title pending">● 확인 필요 ${pending.length}건</div>${requestRows(pending, "pending")}` : ""}${completed.length ? `<div class="whiteboard-point-group-title">오늘 사용</div>${requestRows(completed, "completed")}` : ""}` : empty("오늘 사용한 포인트 상품이 없습니다.");
    renderGroupScores();
  }

  function renderGroupScores() {
    if (!active()) return;
    const groups = activeGroups(); const count = document.querySelector("#whiteboard-group-count"); const list = document.querySelector("#whiteboard-group-list");
    if (count) count.textContent = `${groups.length}개`;
    if (list) list.innerHTML = groups.length ? groups.map((group) => `<article class="whiteboard-group-row"><strong>${escapeHtml(group.name)}</strong><span>${group.score}점</span><div><button type="button" data-board-action="group-score" data-group-id="${escapeHtml(group.id)}" data-amount="-1" aria-label="${escapeHtml(group.name)} 1점 차감">-1</button><button type="button" data-board-action="group-score" data-group-id="${escapeHtml(group.id)}" data-amount="1" aria-label="${escapeHtml(group.name)} 1점 추가">+1</button></div></article>`).join("") : empty("활성화된 모둠이 없습니다.");
  }

  async function changeBoardGroupScore(groupId, amount) {
    const originalRender = render;
    try { render = () => {}; await changeGroupScore(groupId, amount); }
    finally { render = originalRender; if (active()) renderGroupScores(); }
  }

  function updateRefreshState(text) { const state = document.querySelector("#whiteboard-refresh-state"); if (state) state.textContent = text; }
  async function refreshPanels() {
    if (!active() || polling) return;
    polling = true;
    try {
      const userUid = firebaseTeacherUser?.uid;
      const classId = window.ourClassFirebase?.getActiveClassId?.() || firebaseActiveClassId;
      const loads = [];
      if (userUid && firebaseRolesConnected && window.ourClassFirebase?.loadDailyRoleAssignments) loads.push(loadFirebaseRoleApplications(userUid, false));
      if (userUid && classId && window.ourClassFirebase?.getPointShopData) loads.push(window.ourClassFirebase.getPointShopData({ classId, mode: "teacher" }).then((result) => { if (Array.isArray(result?.items)) data.pointShopItems = result.items; data.pointUseRequests = Array.isArray(result?.requests) ? result.requests : []; return true; }));
      if (loads.length) await Promise.all(loads);
      if (!active()) return;
      saveData(); renderPanels(); updateRefreshState(`방금 갱신 · ${new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" })}`);
    } catch (error) {
      console.error("Whiteboard information refresh failed", error);
      if (active()) { renderPanels(); updateRefreshState("연결 확인 중 · 화이트보드는 계속 사용 가능"); }
    } finally { polling = false; }
  }
  function stopPolling() { if (pollTimer !== null) clearTimeout(pollTimer); pollTimer = null; }
  function schedulePolling() { stopPolling(); if (!active()) return; pollTimer = setTimeout(async () => { pollTimer = null; await refreshPanels(); schedulePolling(); }, POLL_INTERVAL); }

  function resizeCanvas() {
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect(); const dpr = Math.max(1, window.devicePixelRatio || 1);
    const nextWidth = Math.max(1, Math.round(rect.width * dpr)); const nextHeight = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width === nextWidth && canvas.height === nextHeight) return;
    const snapshot = document.createElement("canvas"); snapshot.width = canvas.width; snapshot.height = canvas.height; snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
    canvas.width = nextWidth; canvas.height = nextHeight; context = canvas.getContext("2d");
    if (snapshot.width && snapshot.height) context.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, nextWidth, nextHeight);
  }
  function canvasPoint(event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; }
  function isShapeTool() { return ["line", "rectangle", "ellipse"].includes(tool); }
  function copyCanvas() { const copy = document.createElement("canvas"); copy.width = canvas.width; copy.height = canvas.height; copy.getContext("2d").drawImage(canvas, 0, 0); return copy; }
  function startDrawing(event) { if (event.button !== undefined && event.button !== 0 && event.pointerType === "mouse") return; event.preventDefault(); drawing = true; lastPoint = canvasPoint(event); startPoint = lastPoint; shapeSnapshot = isShapeTool() ? copyCanvas() : null; canvas.setPointerCapture?.(event.pointerId); }
  function strokeShape(endPoint) {
    const scale = canvas.width / canvas.getBoundingClientRect().width; const left = Math.min(startPoint.x, endPoint.x); const top = Math.min(startPoint.y, endPoint.y); const shapeWidth = Math.abs(endPoint.x - startPoint.x); const shapeHeight = Math.abs(endPoint.y - startPoint.y);
    context.save(); context.globalCompositeOperation = "source-over"; context.strokeStyle = color; context.lineWidth = width * scale; context.lineCap = "round"; context.lineJoin = "round"; context.beginPath();
    if (tool === "line") { context.moveTo(startPoint.x, startPoint.y); context.lineTo(endPoint.x, endPoint.y); }
    else if (tool === "rectangle") context.rect(left, top, shapeWidth, shapeHeight);
    else context.ellipse(left + shapeWidth / 2, top + shapeHeight / 2, shapeWidth / 2, shapeHeight / 2, 0, 0, Math.PI * 2);
    context.stroke(); context.restore();
  }
  function draw(event) {
    if (!drawing || !lastPoint) return; event.preventDefault(); const next = canvasPoint(event); const scale = canvas.width / canvas.getBoundingClientRect().width;
    if (isShapeTool()) { context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(shapeSnapshot, 0, 0); strokeShape(next); lastPoint = next; return; }
    context.save(); context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over"; context.strokeStyle = color; context.lineWidth = (tool === "eraser" ? width * 3 : width) * scale; context.lineCap = "round"; context.lineJoin = "round"; context.beginPath(); context.moveTo(lastPoint.x, lastPoint.y); context.lineTo(next.x, next.y); context.stroke(); context.restore(); lastPoint = next;
  }
  function stopDrawing(event) { if (!drawing) return; if (isShapeTool() && startPoint && lastPoint) { context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(shapeSnapshot, 0, 0); strokeShape(lastPoint); } drawing = false; lastPoint = null; startPoint = null; shapeSnapshot = null; if (event?.pointerId !== undefined && canvas?.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId); }
  function selectButtons(selector, selected) { document.querySelectorAll(selector).forEach((button) => { const activeButton = button === selected; button.classList.toggle("active", activeButton); button.setAttribute("aria-pressed", String(activeButton)); }); }
  async function handleToolbar(event) {
    const button = event.target.closest("button"); if (!button) return;
    if (button.dataset.boardTool) { tool = button.dataset.boardTool; selectButtons("[data-board-tool]", button); return; }
    if (button.dataset.boardColor) { color = button.dataset.boardColor; selectButtons("[data-board-color]", button); return; }
    if (button.dataset.boardWidth) { width = Number(button.dataset.boardWidth); selectButtons("[data-board-width]", button); return; }
    if (button.dataset.boardAction === "group-score") { button.disabled = true; try { await changeBoardGroupScore(button.dataset.groupId, Number(button.dataset.amount)); } finally { if (button.isConnected) button.disabled = false; } return; }
    if (button.dataset.boardAction === "clear") { const modal = document.querySelector("#whiteboard-clear-confirm"); modal.hidden = false; modal.querySelector("[data-board-action='cancel-clear']")?.focus(); return; }
    if (button.dataset.boardAction === "cancel-clear") { document.querySelector("#whiteboard-clear-confirm").hidden = true; document.querySelector("[data-board-action='clear']")?.focus(); return; }
    if (button.dataset.boardAction === "confirm-clear") { context.clearRect(0, 0, canvas.width, canvas.height); document.querySelector("#whiteboard-clear-confirm").hidden = true; document.querySelector("[data-board-action='clear']")?.focus(); return; }
    if (button.dataset.boardAction === "fullscreen") { const root = document.querySelector("#teacher-whiteboard"); if (document.fullscreenElement) document.exitFullscreen?.(); else root?.requestFullscreen?.().catch((error) => console.error("Whiteboard fullscreen failed", error)); }
  }
  function teardownCanvas() { resizeObserver?.disconnect(); resizeObserver = null; canvas = null; context = null; drawing = false; startPoint = null; shapeSnapshot = null; }
  function initializeCanvas() {
    const nextCanvas = document.querySelector("#whiteboard-canvas"); if (!nextCanvas || nextCanvas === canvas) return;
    teardownCanvas(); canvas = nextCanvas; context = canvas.getContext("2d"); resizeCanvas();
    canvas.addEventListener("pointerdown", startDrawing); canvas.addEventListener("pointermove", draw); canvas.addEventListener("pointerup", stopDrawing); canvas.addEventListener("pointercancel", stopDrawing); canvas.addEventListener("lostpointercapture", stopDrawing);
    document.querySelector("#teacher-whiteboard")?.addEventListener("click", handleToolbar);
    resizeObserver = new ResizeObserver(resizeCanvas); resizeObserver.observe(canvas.parentElement);
  }
  function sync() {
    if (!active()) { stopPolling(); teardownCanvas(); return; }
    initializeCanvas(); renderPanels(); refreshPanels().finally(schedulePolling);
  }
  document.addEventListener("fullscreenchange", () => { if (active()) requestAnimationFrame(resizeCanvas); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") stopPolling(); else if (active()) refreshPanels().finally(schedulePolling); });
  window.ourClassWhiteboard = { sync };
  sync();
})();
