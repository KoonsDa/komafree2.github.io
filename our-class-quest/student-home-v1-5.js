(() => {
  const assignmentStatus = {
    missing: { label: "미제출", className: "missing" },
    review: { label: "확인 대기", className: "review" },
    submitted: { label: "제출 완료", className: "submitted" }
  };

  let studentCloudView = "home";
  let studentRankingPeriod = "week";
  let studentRankingCategory = "activity";
  let studentRankingExpanded = false;
  let studentCollectionCardSetFilter = "all";
  let studentRepresentativeMutating = false;
  let studentCharacterDraftId = "";
  let studentCharacterMutating = false;
  let studentDailyOpenTimer = null;

  function dailyOpenState(source = {}) {
    const openTime = String(source.applicationOpenTime || source.openTime || "");
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(openTime)) return {open: true, openTime: "", waitMillis: 0};
    const serverNow = Number(source.serverNowMillis) || Date.now();
    const receivedAt = Number(source.receivedAtMillis) || Date.now();
    const now = new Date(serverNow + Math.max(0, Date.now() - receivedAt) + 9 * 60 * 60 * 1000);
    const [hour, minute] = openTime.split(":").map(Number);
    const currentMinute = now.getUTCHours() * 60 + now.getUTCMinutes();
    const openMinute = hour * 60 + minute;
    return {open: currentMinute >= openMinute, openTime,
      waitMillis: Math.max(0, (openMinute - currentMinute) * 60000 - now.getUTCSeconds() * 1000 - now.getUTCMilliseconds())};
  }

  function dailyOpenLabel(openTime) {
    const [hour, minute] = openTime.split(":").map(Number);
    return `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}:${String(minute).padStart(2, "0")}`;
  }

  function scheduleDailyOpenRefresh(...states) {
    if (studentDailyOpenTimer !== null) clearTimeout(studentDailyOpenTimer);
    studentDailyOpenTimer = null;
    const waits = states.map(dailyOpenState).filter((state) => !state.open && state.waitMillis > 0).map((state) => state.waitMillis);
    if (!waits.length) return;
    studentDailyOpenTimer = setTimeout(() => {
      studentDailyOpenTimer = null;
      if (typeof session !== "undefined" && session.mode === "firebase-student" && document.visibilityState !== "hidden") render();
    }, Math.min(...waits) + 100);
  }

  const studentDrawRarityMeta = {
    "일반": { className: "student-v158-rarity-common", stars: "★★", frame: "assets/card-ui/초록빛_황금_장식_카드_프레임.png" },
    "희귀": { className: "student-v158-rarity-rare", stars: "★★★", frame: "assets/card-ui/푸른빛_판타지_카드_프레임_템플릿.png" },
    "영웅": { className: "student-v158-rarity-epic", stars: "★★★★", frame: "assets/card-ui/보라빛_황금_판타지_카드_프레임.png" },
    "전설": { className: "student-v158-rarity-legend", stars: "★★★★★", frame: "assets/card-ui/황금_판타지_카드_프레임_ui.png" },
    "고대": { className: "student-v158-rarity-ancient", stars: "★★★★★", frame: "assets/card-ui/불꽃_보석_왕관_카드_프레임.png" }
  };
  function studentCustomization() {
    return window.ourClassStudentCustomization && typeof window.ourClassStudentCustomization === "object"
      ? window.ourClassStudentCustomization
      : {};
  }

  function characterRegistry() {
    const registry = window.ourClassStudentCustomizationApi?.registry || window.ourClassCharacterRegistry;
    return Array.isArray(registry) && registry.length ? registry : [{ id: "character-01", displayName: "캐릭터 1", imagePath: "assets/home-ui/characters/character-01.png", scale: 1, offsetX: 0, offsetY: 0 }];
  }

  function selectedCharacter(characterId = studentCustomization().characterId) {
    const registry = characterRegistry();
    return registry.find((character) => character.id === characterId) || registry[0];
  }

  function characterImage(character, className = "") {
    const fallback = characterRegistry()[0];
    const scale = Number(character?.scale) || 1;
    const offsetX = Number(character?.offsetX) || 0;
    const offsetY = Number(character?.offsetY) || 0;
    return `<img${className ? ` class="${className}"` : ""} src="${escapeHtml(character?.imagePath || fallback.imagePath)}" alt="${escapeHtml(character?.displayName || fallback.displayName)}" style="--character-scale:${scale};--character-offset-x:${offsetX}px;--character-offset-y:${offsetY}px" onerror="this.onerror=null;this.src='${fallback.imagePath}'">`;
  }

  function pointUnit() {
    const value = String(studentCustomization().pointName || "P").trim();
    return value || "P";
  }

  function pointText(value, sign = false) {
    const amount = Number(value) || 0;
    return `${sign && amount > 0 ? "+" : ""}${amount}${escapeHtml(pointUnit())}`;
  }

  function assignmentIcon(subject = "") {
    const name = String(subject || "").trim();
    if (name.includes("수학")) return "📘";
    if (name.includes("국어") || name.includes("독서")) return "📚";
    if (name.includes("사회")) return "🗺️";
    if (name.includes("과학")) return "🔬";
    if (name.includes("영어")) return "🔤";
    if (name.includes("체육")) return "🏃";
    if (name.includes("음악")) return "🎵";
    if (name.includes("미술")) return "🎨";
    return "📋";
  }

  function roleIcon(name = "") {
    const value = String(name || "");
    if (value.includes("칠판")) return "🧽";
    if (value.includes("책") || value.includes("도서")) return "📚";
    if (value.includes("급식") || value.includes("배식")) return "🍱";
    if (value.includes("분리") || value.includes("재활용")) return "♻️";
    if (value.includes("창문")) return "🪟";
    if (value.includes("정리") || value.includes("청소") || value.includes("교실")) return "🧹";
    if (value.includes("화분") || value.includes("식물")) return "🪴";
    return "⭐";
  }

  function assignmentCard(assignment) {
    const state = assignmentStatus[assignment.status] || assignmentStatus.missing;
    const button = assignment.status === "missing"
      ? `<button class="student-v15-primary-button" type="button" data-action="open-cloud-assignment-review" data-id="${escapeHtml(assignment.id)}" ${firebaseStudentAssignmentMutating ? "disabled" : ""}>선생님께 확인 요청</button>`
      : assignment.status === "review"
        ? `<button class="student-v15-primary-button is-review" type="button" disabled>확인 대기 중</button>`
        : `<div class="student-v15-complete-message">✓ 제출 완료</div>`;

    return `<article class="student-v15-assignment-card ${assignment.important ? "is-important" : ""}">
      <div class="student-v15-card-topline">
        <div class="student-v15-assignment-tags">
          <span class="student-v15-subject">${escapeHtml(assignment.subject || "과제")}</span>
          ${assignment.important ? `<span class="student-v15-important">★ 중요</span>` : ""}
          ${assignment.points > 0 ? `<span class="student-v15-points-tag">완료 시 ${pointText(assignment.points, true)}</span>` : ""}
        </div>
        <span class="student-v15-status ${state.className}">${state.label}</span>
      </div>
      <div class="student-v15-assignment-body">
        <div class="student-v15-assignment-copy">
          <h3>${escapeHtml(assignment.title)}</h3>
          ${assignment.description ? `<p>${escapeHtml(assignment.description)}</p>` : ""}
          <span class="student-v15-due">▣ ${formatDueDate(assignment.dueDate)}</span>
        </div>
        <div class="student-v15-assignment-icon" aria-hidden="true">${assignmentIcon(assignment.subject)}</div>
      </div>
      ${button}
    </article>`;
  }

  function roleCard(role, activeApplications, dailyLimit, openState) {
    const mine = activeApplications.find((application) => application.roleId === role.id);
    const full = role.currentCount >= role.capacity;
    const limitReached = activeApplications.length >= dailyLimit;
    const completed = mine?.status === "completed";
    const waiting = mine?.status === "waiting";
    const unavailable = full || (limitReached && !mine) || (!openState.open && !mine);

    let button = "";
    if (completed) {
      button = `<button class="student-v15-role-button is-complete" type="button" disabled>완료</button>`;
    } else if (waiting) {
      button = `<button class="student-v15-role-button is-cancel" type="button" data-action="open-cloud-role-cancel" data-id="${escapeHtml(mine.id)}" ${firebaseStudentRoleMutating ? "disabled" : ""}>신청 취소</button>`;
    } else {
      const label = !openState.open ? `${dailyOpenLabel(openState.openTime)}부터` : full ? "신청 불가" : limitReached ? "오늘 신청 완료" : "신청하기";
      button = `<button class="student-v15-role-button ${unavailable ? "is-disabled" : ""}" type="button" data-action="apply-cloud-role" data-id="${escapeHtml(role.id)}" ${unavailable || firebaseStudentRoleMutating ? "disabled" : ""}>${label}</button>`;
    }

    const state = completed ? "완료" : waiting ? "신청 대기" : !openState.open ? "시작 전" : full ? "마감" : "신청 가능";
    const stateClass = completed ? "submitted" : waiting ? "review" : full ? "closed" : "open";
    const capacityText = full ? "정원 마감" : `${role.currentCount} / ${role.capacity}명`;

    return `<article class="student-v15-role-card ${waiting ? "is-mine" : ""} ${full && !mine ? "is-full" : ""}">
      <div class="student-v15-role-icon" aria-hidden="true">${roleIcon(role.name)}</div>
      <div class="student-v15-role-copy">
        <div class="student-v15-role-titleline">
          <h3>${escapeHtml(role.name)}</h3>
          <strong>${pointText(role.points, true)}</strong>
          <span class="student-v15-role-state ${stateClass}">${state}</span>
        </div>
        ${role.description ? `<p>${escapeHtml(role.description)}</p>` : ""}
        <span class="student-v15-capacity">♟ ${capacityText}</span>
      </div>
      ${button}
    </article>`;
  }

  function navItems(features) {
    return [
      { id: "home", icon: "⌂", label: "홈", enabled: true },
      { id: "assignments", icon: "📋", label: "과제", enabled: features.assignments !== false },
      { id: "roles", icon: "👥", label: "1인1역", enabled: features.roles !== false },
      { id: "points", icon: "⭐", label: pointUnit() === "P" ? "포인트" : pointUnit(), enabled: features.points !== false },
      { id: "draw", icon: "🎴", label: "카드뽑기", enabled: true, badge: "" },
      { id: "collection", icon: "📚", label: "위인도감", enabled: true, badge: "" },
      { id: "ranking", icon: "🏆", label: "랭킹", enabled: true }
    ].filter((item) => item.enabled);
  }

  function navMarkup(features) {
    return `<nav class="student-v155-nav" aria-label="학생 메뉴">
      ${navItems(features).map((item) => `<button type="button" class="student-v155-nav-item ${studentCloudView === item.id ? "active" : ""}" data-student-cloud-view="${item.id}" aria-current="${studentCloudView === item.id ? "page" : "false"}">
        <span class="student-v155-nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${escapeHtml(item.label)}</span>
        ${item.badge ? `<small>${escapeHtml(item.badge)}</small>` : ""}
      </button>`).join("")}
    </nav>`;
  }

  function assignmentSection(home, homeOnly = false) {
    const assignmentOrder = { missing: 0, review: 1, submitted: 2 };
    const assignments = [...home.assignments]
      .filter((assignment) => !homeOnly || assignment.status !== "submitted")
      .sort((first, second) =>
        (assignmentOrder[first.status] - assignmentOrder[second.status]) ||
        String(first.dueDate || "9999-12-31").localeCompare(String(second.dueDate || "9999-12-31"))
      );
    return `<section class="student-v15-section student-v15-assignment-section">
      <div class="student-v15-section-heading-row">
        <div class="student-v15-section-title"><span class="student-v15-title-icon">📋</span><h2>${homeOnly ? "진행 중 과제" : "내 과제"}</h2></div>
        ${homeOnly ? `<button type="button" class="student-v155-section-link" data-student-cloud-view="assignments">전체 보기 →</button>` : `<span class="student-v155-page-count">총 ${assignments.length}개</span>`}
      </div>
      ${assignments.length
        ? `<div class="student-v15-assignment-grid">${assignments.map(assignmentCard).join("")}</div>`
        : `<div class="student-v15-empty">${homeOnly ? "진행 중인 과제가 없습니다. 멋지게 완료했어요! 🎉" : "표시할 과제가 없습니다."}</div>`}
    </section>`;
  }

  function roleSection(home, homeOnly = false) {
    const activeApplications = home.myRoleApplications.filter((application) => application.status !== "cancelled");
    const dailyLimit = Number(home.roleSettings.dailyLimit) || 1;
    const openState = dailyOpenState(home.roleSettings);
    return `<section class="student-v15-section student-v15-role-section">
      <div class="student-v15-section-heading-row">
        <div class="student-v15-section-title"><span class="student-v15-title-icon shield">⭐</span><h2>오늘의 1인1역</h2></div>
        <div class="student-v155-heading-actions"><span class="student-v15-role-summary">나의 신청 ${activeApplications.length} / ${dailyLimit}</span>${homeOnly ? `<button type="button" class="student-v155-section-link" data-student-cloud-view="roles">전체 보기 →</button>` : ""}</div>
      </div>
      ${!openState.open ? `<p class="student-daily-open-notice">${dailyOpenLabel(openState.openTime)}부터 신청할 수 있어요.</p>` : ""}
      ${home.roleSettings.roles.length
        ? `<div class="student-v15-role-grid">${home.roleSettings.roles.map((role) => roleCard(role, activeApplications, dailyLimit, openState)).join("")}</div>`
        : `<div class="student-v15-empty">현재 신청 가능한 역할이 없습니다.</div>`}
    </section>`;
  }

  function heroSection(home) {
    const profile = home.profile;
    const classInfo = home.classInfo;
    const features = classInfo.features || {};
    const pointLabel = pointUnit() === "P" ? "포인트" : pointUnit();
    const pointValue = pointText(home.points);
    const pointLength = Math.max(4, String(Number(home.points) || 0).length + String(pointUnit()).length);
    const pointFit = Math.max(32, 80 - (pointLength * 5));
    const character = selectedCharacter();
    return `<section class="student-v15-hero-grid">
      <article class="student-v15-welcome student-v15-welcome-separated" aria-label="학생 환영 영역">
        <div class="student-home-hero-background student-v15-welcome-background" aria-hidden="true"></div>
        <div class="student-home-hero-character student-v15-welcome-character">${characterImage(character)}</div>
        <div class="student-v15-welcome-copy">
          <h1><span class="student-v15-greeting-name"><strong>${escapeHtml(profile.name)}</strong>님,</span><span class="student-v15-greeting-message">반가워요!</span></h1>
          <p>${escapeHtml(classInfo.className || "우리 반")}</p>
          <button class="student-character-change-button" type="button" data-student-character-open>캐릭터 변경</button>
        </div>
      </article>
      ${features.points === false ? "" : `<button class="student-v15-points-card student-v155-point-link" type="button" data-student-cloud-view="points" aria-label="${escapeHtml(pointLabel)} 화면 열기"><div class="student-v15-coin" aria-hidden="true"><span>★</span></div><div class="student-v15-points-copy"><span>현재 ${escapeHtml(pointLabel)}</span><strong class="student-v15-points-value" style="--point-fit:${pointFit}px">${pointValue}</strong><small>내역 보기 →</small></div><i class="student-v15-spark one">✦</i><i class="student-v15-spark two">✦</i></button>`}
    </section>`;
  }

  function characterModalMarkup() {
    const registry = characterRegistry();
    const draft = selectedCharacter(studentCharacterDraftId || studentCustomization().characterId);
    return `<div class="student-v157-modal student-character-modal" role="presentation"><section class="student-v157-modal-card student-character-modal-card" role="dialog" aria-modal="true" aria-labelledby="student-character-modal-title">
      <button class="student-v157-modal-close" type="button" data-student-character-close aria-label="캐릭터 선택 닫기">×</button><span class="student-v157-modal-label">나만의 홈 꾸미기</span><h2 id="student-character-modal-title">캐릭터를 선택해요</h2>
      <div class="student-character-preview">${characterImage(draft, "student-character-preview-image")}<div><small>선택한 캐릭터</small><strong>${escapeHtml(draft.displayName)}</strong></div></div>
      <div class="student-character-grid" role="listbox" aria-label="캐릭터 목록">${registry.map((character) => { const chosen = character.id === draft.id; return `<button class="student-character-option ${chosen ? "is-selected" : ""}" type="button" role="option" aria-selected="${chosen}" data-student-character-id="${character.id}">${characterImage(character)}<strong>${escapeHtml(character.displayName)}</strong><span>${chosen ? "✓ 선택됨" : "선택"}</span></button>`; }).join("")}</div>
      <div class="student-character-modal-actions"><button type="button" class="button secondary" data-student-character-close>취소</button><button type="button" class="button success" data-student-character-save ${studentCharacterMutating ? "disabled" : ""}>${studentCharacterMutating ? "저장 중…" : "이 캐릭터 사용하기"}</button></div>
    </section></div>`;
  }

  function openCharacterModal() {
    studentCharacterDraftId = selectedCharacter().id;
    document.querySelector(".student-character-modal")?.remove();
    app.insertAdjacentHTML("beforeend", characterModalMarkup());
  }

  function refreshCharacterModal() {
    const modal = document.querySelector(".student-character-modal");
    if (!modal) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = characterModalMarkup();
    modal.replaceWith(wrapper.firstElementChild);
  }

  function homeContent(home) {
    const features = home.classInfo.features || {};
    return `${heroSection(home)}${features.assignments === false ? "" : assignmentSection(home, true)}${features.roles === false ? "" : roleSection(home, true)}`;
  }

  function assignmentsContent(home) {
    return `<div class="student-v155-page-head"><div><span>📋 과제</span><h1>내 과제</h1><p>미제출, 확인 대기, 제출 완료 상태를 한곳에서 확인해요.</p></div></div>${assignmentSection(home, false)}`;
  }

  function rolesContent(home) {
    return `<div class="student-v155-page-head"><div><span>👥 1인1역</span><h1>오늘의 1인1역</h1><p>오늘 맡고 싶은 역할을 고르고 신청 상태를 확인해요.</p></div></div>${roleSection(home, false)}`;
  }

  function portalState() {
    return window.ourClassStudentPortal?.state?.() || { loading: false, loaded: false, error: null, data: null };
  }

  function portalLoadPanel(message = "학생 데이터를 불러오는 중이에요.") {
    return `<section class="student-v156-loading-panel"><div class="student-v156-spinner" aria-hidden="true"></div><strong>${escapeHtml(message)}</strong></section>`;
  }

  function portalErrorPanel() {
    return `<section class="student-v156-error-panel"><strong>데이터를 불러오지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p><button type="button" data-student-portal-refresh>다시 불러오기</button></section>`;
  }

  function pointHistoryRows(entries) {
    if (!entries.length) return `<div class="student-v15-empty">아직 적립·사용 내역이 없습니다.</div>`;
    return `<div class="student-v156-history-list">${entries.map((entry) => {
      const amount = Number(entry.amount) || 0;
      const positive = amount >= 0;
      const when = entry.date || (entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("ko-KR") : "");
      return `<article class="student-v156-history-row">
        <div class="student-v156-history-icon ${positive ? "gain" : "spend"}">${positive ? "+" : "−"}</div>
        <div class="student-v156-history-copy"><strong>${escapeHtml(entry.reason || "포인트 변동")}</strong><span>${escapeHtml(entry.source || "기타")}${when ? ` · ${escapeHtml(when)}` : ""}</span></div>
        <b class="student-v156-history-amount ${positive ? "gain" : "spend"}">${pointText(amount, positive)}</b>
      </article>`;
    }).join("")}</div>`;
  }

  function openAllPointHistory(entries) {
    app.insertAdjacentHTML("beforeend", `<div class="student-v157-modal student-v1510-history-modal" role="presentation"><section class="student-v157-modal-card student-v1510-history-card" role="dialog" aria-modal="true" aria-labelledby="student-v1510-history-title"><button class="student-v157-modal-close" type="button" data-student-draw-close aria-label="닫기">×</button><span class="student-v157-modal-label">전체 기록</span><h2 id="student-v1510-history-title">적립·사용 내역</h2><p>최신 기록부터 표시합니다.</p><div class="student-v1510-history-scroll">${pointHistoryRows(entries)}</div><button class="student-v157-modal-confirm" type="button" data-student-draw-close>닫기</button></section></div>`);
  }

  function pointUseCards(home, label) {
    const portal = portalState();
    const shopState = portal.shop || {};
    if (!shopState.loaded && !shopState.loading && !shopState.error) window.ourClassStudentPortal?.ensureShopLoaded?.();
    if (shopState.loading) return portalLoadPanel("포인트 상품을 불러오는 중이에요.");
    if (shopState.error) return `<div class="student-v159-point-use-empty"><strong>상품을 불러오지 못했어요.</strong><p>잠시 후 새로고침해 주세요.</p></div>`;
    const items = Array.isArray(shopState.data?.items) ? shopState.data.items : [];
    if (!items.length) return `<div class="student-v159-point-use-empty"><strong>현재 이용할 수 있는 상품이 없어요.</strong><p>선생님이 상품을 등록하면 여기에 표시됩니다.</p></div>`;
    const statusLabels = {pending: "승인 대기 중", "sold-out": "오늘 수량 소진", "limit-reached": "오늘 이용 완료", insufficient: "잔액 부족", inactive: "이용 불가"};
    const cancellingRequestId = String(portal.cancellingPointUseRequestId || "");
    const openState = dailyOpenState(shopState.data);
    return `${!openState.open ? `<p class="student-daily-open-notice">${dailyOpenLabel(openState.openTime)}부터 사용할 수 있어요.</p>` : ""}<div class="student-v159-point-use-grid">${items.map((item) => {
      const remaining = Math.max(0, Number(item.remainingStock) || 0);
      const limit = Math.max(1, Number(item.perStudentDailyLimit) || 1);
      const price = Math.max(0, Number(item.price) || 0);
      const available = item.status === "available" && openState.open;
      const pendingRequestId = item.status === "pending" && item.approvalRequired === true ? String(item.pendingRequestId || "") : "";
      const reason = !openState.open ? `${dailyOpenLabel(openState.openTime)}부터` : available ? (item.approvalRequired ? "사용 신청" : "바로 사용") : (statusLabels[item.status] || "이용 불가");
      return `<article class="student-v159-point-use-card ${available ? "" : "is-disabled"}">
        <span class="student-v159-point-use-icon" aria-hidden="true">${escapeHtml(item.icon || "🎁")}</span>
        <div class="student-v159-point-use-copy"><h3>${escapeHtml(item.name || "이름 없는 상품")}</h3>${String(item.description || "").trim() ? `<p>${escapeHtml(String(item.description).trim())}</p>` : ""}</div>
        <dl class="student-v159-point-use-meta"><div><dt>오늘 남은 수량</dt><dd>${remaining} / ${Math.max(1, Number(item.dailyStock) || 1)}</dd></div><div><dt>학생당 하루</dt><dd>${limit}회</dd></div><div><dt>처리 방식</dt><dd>${item.approvalRequired ? "교사 승인" : "즉시 사용"}</dd></div></dl>
        <div class="student-v159-point-use-action">
          <strong><span aria-hidden="true">★</span>${price}${escapeHtml(label)}</strong>
          ${pendingRequestId ? `<button type="button" data-student-cancel-point-request="${escapeHtml(pendingRequestId)}" ${cancellingRequestId === pendingRequestId ? "disabled" : ""}>${cancellingRequestId === pendingRequestId ? "취소 중…" : "신청 취소"}</button>` : `<button type="button" data-student-point-product="${escapeHtml(item.id)}" ${available ? "" : "disabled"}>${reason}</button>`}
        </div>
      </article>`;
    }).join("")}</div>`;
  }

  function pointGiftPanel(home, label) {
    const giftState = portalState().gift || {};
    if (!giftState.loaded && !giftState.loading && !giftState.error) window.ourClassStudentPortal?.ensureGiftLoaded?.();
    if (giftState.loading) return portalLoadPanel("친구 선물 설정을 불러오는 중이에요.");
    if (giftState.error) return `<div class="student-v159-point-use-empty"><strong>친구 선물 정보를 불러오지 못했어요.</strong><p>잠시 후 다시 시도해 주세요.</p></div>`;
    const settings = giftState.data?.settings || {};
    const enabled = settings.enabled === true;
    const friends = Array.isArray(giftState.data?.friends) ? giftState.data.friends : [];
    const usage = giftState.data?.usage || {};
    const maxTransfer = Math.max(1, Number(settings.maxPointsPerTransfer) || 1);
    const maxDay = Math.max(1, Number(settings.maxPointsPerDay) || 1);
    const maxCount = Math.max(1, Number(settings.maxTransfersPerDay) || 1);
    const remainingAmount = Math.max(0, maxDay - (Number(usage.amount) || 0));
    const remainingCount = Math.max(0, maxCount - (Number(usage.count) || 0));
    const canGift = enabled && friends.length > 0 && remainingAmount > 0 && remainingCount > 0 && Number(home.points) > 0;
    const disabled = enabled ? "" : "disabled";
    return `<section class="student-v1511-gift-panel ${enabled ? "" : "is-disabled"}"><div class="student-v1511-gift-heading"><div><span>🎁</span><strong>친구에게 선물</strong></div><small>오늘 ${Number(usage.count) || 0}/${maxCount}회 · ${Number(usage.amount) || 0}/${maxDay}${escapeHtml(label)}</small></div>
      <form id="student-point-gift-form" class="student-v1511-gift-form"><label>받을 친구<select name="receiverStudentId" required ${disabled}><option value="">친구 선택</option>${friends.map((friend) => `<option value="${escapeHtml(friend.studentId)}">${escapeHtml(friend.name || "학생")}</option>`).join("")}</select></label><label>선물할 ${escapeHtml(label)}<input name="amount" type="number" min="1" max="${Math.min(maxTransfer, remainingAmount, Math.max(0, Number(home.points) || 0))}" step="1" required ${disabled}></label><button type="submit" ${canGift ? "" : "disabled"}>선물하기</button></form>
      ${enabled ? `<p class="student-v1511-gift-limits">1회 최대 ${maxTransfer}${escapeHtml(label)} · 오늘 남은 한도 ${remainingAmount}${escapeHtml(label)} / ${remainingCount}회</p>${friends.length ? "" : `<p class="student-v1511-gift-warning">선물할 수 있는 친구가 없습니다.</p>`}` : `<p class="student-v1511-gift-off">친구 선물 기능이 꺼져 있어요.</p>`}</section>`;
  }

  function pointsContent(home) {
    const label = pointUnit() === "P" ? "포인트" : pointUnit();
    const state = portalState();
    if (!state.loaded && !state.loading && !state.error) window.ourClassStudentPortal?.ensureLoaded?.();
    const detail = state.loading ? portalLoadPanel("갈비 내역을 불러오는 중이에요.") : state.error ? portalErrorPanel() : state.data ? (() => {
      const entries = Array.isArray(state.data.pointHistory) ? state.data.pointHistory : [];
      const recentEntries = entries.slice(0, 6);
      const summaryParts = entries.reduce((totals, entry) => {
        const amount = Number(entry.amount) || 0;
        const reversal = amount > 0 && String(entry.source || "").includes("포인트 상품") && String(entry.reason || "").includes("사용 취소");
        if (amount < 0) totals.spent += -amount;
        else if (reversal) totals.reversed += amount;
        else totals.gained += amount;
        return totals;
      }, {gained: 0, spent: 0, reversed: 0});
      const summary = {gained: summaryParts.gained, spent: Math.max(0, summaryParts.spent - summaryParts.reversed)};
      return `<section class="student-v156-point-summary-grid">
          <article><span>총 적립</span><strong>${pointText(summary.gained || 0)}</strong></article>
          <article><span>총 사용</span><strong>${pointText(summary.spent || 0)}</strong></article>
        </section>
        <div class="student-v159-point-main-grid">
          <section class="student-v159-point-use-section"><div class="student-v15-section-heading-row"><div class="student-v15-section-title"><span class="student-v15-title-icon">🛍️</span><h2>${escapeHtml(label)} 사용하기</h2></div><span class="student-v159-point-use-note">교사 등록 상품</span></div>${pointUseCards(home, label)}${pointGiftPanel(home, label)}</section>
          <section class="student-v156-history-section"><div class="student-v15-section-heading-row"><div class="student-v15-section-title"><span class="student-v15-title-icon">🧾</span><h2>적립·사용 내역</h2></div><div class="student-v1510-history-heading-actions"><span class="student-v155-page-count">최근 ${recentEntries.length}건</span>${entries.length > recentEntries.length ? `<button type="button" data-student-point-history-all>전체 보기</button>` : ""}</div></div>${pointHistoryRows(recentEntries)}</section>
        </div>`;
    })() : "";

    return `<div class="student-v155-page-head"><div><span>⭐ ${escapeHtml(label)}</span><h1>나의 ${escapeHtml(label)}</h1><p>내가 모은 ${escapeHtml(label)}와 실제 적립·사용 내역을 확인해요.</p></div></div>
      <section class="student-v155-balance-panel student-v156-balance-panel">
        <div class="student-v15-coin" aria-hidden="true"><span>★</span></div>
        <div><small>현재 ${escapeHtml(label)}</small><strong>${pointText(home.points)}</strong></div>
      </section>${detail}`;
  }

  function rankingCharacter(row) {
    const isCurrentStudent = row?.studentId === firebaseStudentHomeData?.profile?.studentId;
    return selectedCharacter(isCurrentStudent ? studentCustomization().characterId : row?.characterId);
  }
  function rankingAvatar(row) {
    return `<span class="hall-avatar hall-character-avatar" aria-hidden="true">${characterImage(rankingCharacter(row), "hall-character-image")}</span>`;
  }
  function rankingValue(row, unit) { return `${Number(row?.value) || 0}${escapeHtml(unit)}`; }
  function rankingPodium(rows, unit) {
    if (!rows.length) return `<div class="student-v15-empty hall-empty">아직 랭킹 기록이 없습니다.</div>`;
    const slots = [[rows[1], 2], [rows[0], 1], [rows[2], 3]];
    return `<div class="hall-podium" aria-label="상위 3명">${slots.map(([row, place]) => row ? `<article class="hall-podium-card place-${place} ${row.studentId === firebaseStudentHomeData?.profile?.studentId ? "is-me" : ""}">${place === 1 ? `<span class="hall-ranking-crown" aria-hidden="true"><img src="assets/common-ui/badges/rank-crown-gold.png" alt="" onerror="this.parentElement.classList.add('asset-failed');this.remove()"></span>` : ""}<span class="hall-rank-badge" aria-label="${place}위"><img src="assets/common-ui/badges/rank-medal-${place === 1 ? "gold" : place === 2 ? "silver" : "bronze"}.png" alt="" onerror="this.parentElement.classList.add('asset-failed');this.remove()"><span class="hall-rank-fallback" aria-hidden="true">${place}</span></span>${rankingAvatar(row)}<strong>${escapeHtml(row.name)}</strong><b>${rankingValue(row, unit)}</b></article>` : `<div class="hall-podium-card place-${place} empty" aria-hidden="true"></div>`).join("")}</div>`;
  }
  function rankingLowerList(rows, unit) {
    const lower = rows.slice(3); if (!lower.length) return ""; const shown = studentRankingExpanded ? lower : lower.slice(0, 5);
    return `<section class="hall-lower-section"><div class="hall-ranking-list">${shown.map((row, index) => `<article class="hall-ranking-row ${row.studentId === firebaseStudentHomeData?.profile?.studentId ? "is-me" : ""}"><span class="hall-row-rank">${index + 4}</span>${rankingAvatar(row)}<strong>${escapeHtml(row.name)}</strong><b>${rankingValue(row, unit)}</b></article>`).join("")}</div>${lower.length > 5 ? `<button class="hall-more-button" type="button" data-student-ranking-more>${studentRankingExpanded ? "간단히 보기" : `더 많은 친구 보기 (${lower.length - 5}명)`}</button>` : ""}</section>`;
  }
  function rankingMine(rows, unit) {
    const studentId = firebaseStudentHomeData?.profile?.studentId; const mine = rows.find((row) => row.studentId === studentId);
    if (!mine) return `<section class="hall-my-rank"><span class="hall-my-icon">★</span><div><small>나의 순위</small><strong>아직 기록이 없어요</strong><p>첫 활동으로 명예의 전당에 도전해 보세요!</p></div></section>`;
    return `<section class="hall-my-rank"><span class="hall-my-label" aria-label="나의 순위"><img src="assets/common-ui/badges/rank-my-rank-badge.png" alt="" onerror="this.parentElement.classList.add('asset-failed');this.remove()"><span class="hall-my-label-fallback" aria-hidden="true">나의 순위</span></span><strong class="hall-my-position">${mine.rank}위</strong>${rankingAvatar(mine)}<div class="hall-my-copy"><strong>${escapeHtml(mine.name)} <span class="hall-me-badge">나</span></strong><p>오늘도 멋지게 해냈어요! 최고야!</p></div><b>${rankingValue(mine, unit)}</b></section>`;
  }

  function rankingContent() {
    const state = portalState();
    if (!state.loaded && !state.loading && !state.error) window.ourClassStudentPortal?.ensureLoaded?.();
    let body = "";
    if (state.loading) body = portalLoadPanel("우리 반 랭킹을 계산하는 중이에요.");
    else if (state.error) body = portalErrorPanel();
    else if (state.data) {
      const ranking = state.data.ranking || {};
      if (ranking.enabled === false) body = `<div class="student-v15-empty">선생님이 현재 랭킹 공개를 꺼두셨어요.</div>`;
      else {
        const period = studentRankingPeriod === "all" ? "all" : "week";
        const categories = [
          ["activity", "◆", "획득 포인트", ranking.activity?.[period] || [], pointUnit()],
          ["roles", "✓", "1인1역 활동", ranking.roles?.[period] || [], "회"],
          ["assignments", "▣", "과제 활동", ranking.assignments?.[period] || [], "개"],
          ["collection", "▦", "카드 수집", ranking.collection?.[period] || [], "장"]
        ];
        const selected = categories.find(([id]) => id === studentRankingCategory) || categories[0]; const [, icon, title, rows, unit] = selected;
        body = `<div class="hall-ranking-tabs" role="tablist" aria-label="랭킹 분야">${categories.map(([id, categoryIcon, label]) => `<button type="button" role="tab" aria-selected="${id === studentRankingCategory}" data-student-ranking-category="${id}" class="${id === studentRankingCategory ? "active" : ""}" ${id === "collection" && ranking.collection?.available !== true ? "disabled" : ""}><span>${categoryIcon}</span>${label}</button>`).join("")}</div><div class="student-v156-ranking-toolbar hall-toolbar"><div><span>${icon}</span><strong>${title}</strong></div><div class="student-v156-period-buttons"><button type="button" data-student-ranking-period="week" class="${period === "week" ? "active" : ""}">이번 주</button><button type="button" data-student-ranking-period="all" class="${period === "all" ? "active" : ""}">전체</button></div></div><section class="hall-ranking-board">${rankingPodium(rows, unit)}${rankingLowerList(rows, unit)}${rankingMine(rows, unit)}</section>`;
      }
    }
    return `<div data-student-ranking-screen><div class="student-v155-page-head hall-page-head"><div><span>🏆 명예의 전당</span><h1>우리반 명예의 전당</h1><p>다양한 활동에서 멋지게 활약한 친구들이에요!</p></div><button class="hall-help" type="button" title="랭킹은 Firebase 활동 기록을 기준으로 계산돼요." aria-label="랭킹 도움말">?</button></div>${body}</div>`;
  }

  window.refreshStudentRankingDom = () => {
    const screen = document.querySelector("[data-student-ranking-screen]");
    if (!screen || studentCloudView !== "ranking") return false;
    screen.outerHTML = rankingContent();
    return true;
  };

  function studentCardDrawState() { return portalState().cardDraw || {}; }

  function studentDrawOptions() {
    const options = Array.isArray(studentCardDrawState().data?.drawOptions) ? studentCardDrawState().data.drawOptions : [];
    const keys = {common: "일반", rare: "희귀", epic: "영웅", legendary: "전설", ancient: "고대"};
    return options.map((option, index) => ({...option, accent: index === 0 ? "basic" : "special",
      rates: Object.fromEntries(Object.entries(option.rates || {}).map(([key, rate]) => [keys[key] || key, rate]))}));
  }

  function drawPreviewOption(id) {
    const options = studentDrawOptions();
    return options.find((option) => option.id === id) || options[0] || null;
  }

  function drawRateRows(option) {
    return Object.entries(option.rates).map(([rarity, rate]) => {
      const meta = studentDrawRarityMeta[rarity] || studentDrawRarityMeta["일반"];
      return `<div class="student-v157-rate-row"><span class="student-v157-rarity-dot ${meta.className}">★</span><strong>${escapeHtml(rarity)}</strong><b>${Number(rate) || 0}%</b></div>`;
    }).join("");
  }

  function drawOptionCard(option) {
    const unit = pointUnit();
    const detail = option.accent === "special" ? "고등급 카드 확률 ↑" : "일반 카드 확률 ↑";
    const chestAsset = option.accent === "special"
      ? "assets/card-ui/빛나는_황금_판타지_보물_상자.png"
      : "assets/card-ui/보랏빛_황금_별_보물상자.png";
    return `<article class="student-v157-draw-option ${option.accent}">
      <div class="student-v157-chest ${option.accent}" aria-hidden="true">
        <span class="student-v157-chest-aura"></span>
        <img class="student-v157-chest-art" src="${chestAsset}" alt="">
        <i class="student-v157-chest-shine one">✦</i><i class="student-v157-chest-shine two">✦</i><i class="student-v157-chest-shine three">✦</i>
      </div>
      <h3>${escapeHtml(option.name)}</h3>
      <strong class="student-v157-option-price"><b class="student-v157-price-coin">★</b>${option.price}${escapeHtml(unit)}</strong>
      <small class="student-v157-option-detail">${detail}</small>
      <button type="button" class="student-v157-rate-button" data-student-draw-rates="${option.id}">확률 보기 <span aria-hidden="true">⌕</span></button>
      <button type="button" class="student-v157-draw-button ${option.accent}" data-student-draw-preview="${option.id}"><span>1회 뽑기</span><i aria-hidden="true">✦</i></button>
    </article>`;
  }

  function drawContent(home) {
    const unit = pointUnit();
    const drawState = studentCardDrawState();
    if (!drawState.loaded && !drawState.loading && !drawState.error) window.ourClassStudentPortal?.ensureCardDrawLoaded?.();
    if (drawState.loading) return portalLoadPanel("카드 뽑기 설정을 불러오는 중이에요.");
    if (drawState.error) return portalErrorPanel();
    const options = studentDrawOptions();
    const points = Number(drawState.data?.points ?? home.points) || 0;
    return `<section class="student-v157-draw-stage" data-student-draw-stage>
      <div class="student-v157-nebula" aria-hidden="true"></div>
      <div class="student-v157-night-sky" aria-hidden="true">${Array.from({length: 14}, () => "<i></i>").join("")}</div>
      <header class="student-v157-draw-head">
        <span class="student-v157-draw-kicker">✦ 카드 컬렉션 ✦</span>
        <h1>카드 뽑기</h1>
        <p>어떤 위인을 만나게 될까요?</p>
      </header>
      <div class="student-v157-balance-pill"><span>내가 가진 ${escapeHtml(unit === "P" ? "포인트" : unit)}</span><b class="student-v157-mini-coin">★</b><strong>${points}${escapeHtml(unit)}</strong></div>
      <div class="student-v157-card-orbit" aria-hidden="true">
        <span class="student-v157-card-ray ray1"></span><span class="student-v157-card-ray ray2"></span><span class="student-v157-card-ray ray3"></span>
        <span class="student-v157-orbit-card left"><b>?</b></span><span class="student-v157-orbit-card right"><b>?</b></span>
        <div class="student-v157-card-back">
          <img class="student-v157-card-back-art" src="assets/card-ui/황금빛_신비의_보상_카드.png" alt="">
        </div>
        <div class="student-v157-draw-flash" aria-hidden="true"></div>
      </div>
      <section class="student-v157-option-panel">
        <div class="student-v157-option-title"><span></span><h2>뽑기 종류 선택</h2><span></span></div>
        <div class="student-v157-option-grid">${options.map(drawOptionCard).join("") || `<div class="student-v15-empty">현재 이용할 수 있는 카드 뽑기가 없어요.</div>`}</div>
      </section>
    </section>`;
  }

  async function runDrawPreviewSequence(optionId) {
    const stage = document.querySelector("[data-student-draw-stage]");
    if (!stage || stage.classList.contains("is-drawing")) return;
    stage.classList.add("is-drawing");
    const buttons = [...stage.querySelectorAll("[data-student-draw-preview]")];
    buttons.forEach((button) => { button.disabled = true; });
    try {
      const [result] = await Promise.all([window.ourClassStudentPortal?.drawCard?.(optionId), new Promise((resolve) => window.setTimeout(resolve, 1250))]);
      stage.classList.remove("is-drawing");
      openDrawResultPreview(optionId, result?.card);
    } catch (caught) {
      console.error("Student card draw failed", caught);
      stage.classList.remove("is-drawing"); buttons.forEach((button) => { button.disabled = false; });
      const message = String(caught?.message || "");
      toast(message.includes("insufficient") ? `${pointUnit()}가 부족해요.` : message.includes("no-cards") ? "현재 뽑을 수 있는 카드가 없어요." : "카드 뽑기 설정을 확인해 주세요.");
    }
  }

  function openDrawRatePreview(optionId) {
    const option = drawPreviewOption(optionId);
    if (!option) return;
    app.insertAdjacentHTML("beforeend", `<div class="student-v157-modal" role="presentation"><section class="student-v157-modal-card" role="dialog" aria-modal="true" aria-labelledby="student-v157-rate-title"><button class="student-v157-modal-close" type="button" data-student-draw-close aria-label="닫기">×</button><span class="student-v157-modal-label">확률 안내</span><h2 id="student-v157-rate-title">${escapeHtml(option.name)} 확률</h2><p>선생님이 설정한 실제 등급별 등장 확률이에요.</p><div class="student-v157-rate-list">${drawRateRows(option)}</div><button class="student-v157-modal-confirm" type="button" data-student-draw-close>확인</button></section></div>`);
  }

  function openDrawResultPreview(optionId, card) {
    const option = drawPreviewOption(optionId);
    if (!option || !card) return;
    const rarity = card.rarity || "일반";
    const rarityMeta = studentDrawRarityMeta[rarity] || studentDrawRarityMeta["일반"];
    const portrait = card.imageData ? escapeHtml(card.imageData) : "assets/portrait-placeholder-v1572.svg";
    app.insertAdjacentHTML("beforeend", `<div class="student-v157-modal result-preview" role="presentation"><section class="student-v157-modal-card result" role="dialog" aria-modal="true" aria-labelledby="student-v157-result-title">
      <button class="student-v157-modal-close" type="button" data-student-draw-close aria-label="닫기">×</button>
      <div class="student-v157-result-burst" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <span class="student-v157-result-spark">✦ 카드 획득! ✦</span>
      <strong class="student-v158-result-grade ${rarityMeta.className}">${rarity}</strong>
      <div class="student-v157-result-card ${rarityMeta.className}">
        <div class="student-v158-result-portrait-slot"><img src="${portrait}" alt="${escapeHtml(card.name)}"></div>
        <img class="student-v158-result-frame-art" src="${rarityMeta.frame}" alt="${rarity} 카드 프레임">
      </div>
      <h2 id="student-v157-result-title">${escapeHtml(card.name)}</h2>
      <div class="student-v157-result-copy"><span class="card-era-badge">${escapeHtml(card.era || "분류 없음")}</span><p class="card-description">${escapeHtml(card.achievement || "새로운 카드를 획득했어요.")}</p><strong>현재 같은 카드 ${Number(card.count) || 1}장 · 이 카드 총 ${Number(card.totalOwned) || 1}장</strong></div>
      <div class="student-v157-result-ability"><span>${escapeHtml(card.ability?.icon || "✨")} ${escapeHtml(card.ability?.name || "카드 능력")}</span><strong>${escapeHtml(card.ability?.summary || "보너스 없음")}</strong></div>
      <div class="student-v157-result-actions"><button type="button" data-student-draw-again="${escapeHtml(option.id)}">한 번 더 뽑기</button><button type="button" data-student-cloud-view="collection" data-student-draw-close>도감에서 보기</button></div>
    </section></div>`);
  }

  const studentCollectionRarities = ["일반", "희귀", "영웅", "전설", "고대"];
  const studentCollectionRarityClasses = { "일반": "common", "희귀": "rare", "영웅": "hero", "전설": "legend", "고대": "ancient" };
  const studentCollectionUpgradeSteps = {
    "일반": { to: "희귀", key: "commonToRare" }, "희귀": { to: "영웅", key: "rareToEpic" },
    "영웅": { to: "전설", key: "epicToLegendary" }, "전설": { to: "고대", key: "legendaryToAncient" }
  };

  function collectionModel() {
    const data = portalState().cardCollection?.data || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const definitions = Array.isArray(data.cards) ? data.cards : [];
    const cardsById = new Map(definitions.map((card) => [card.id, { ...card }]));
    items.forEach((item) => {
      if (!cardsById.has(item.cardId)) cardsById.set(item.cardId, { id: item.cardId, name: item.cardName, cardSetId: item.cardSetId, imageData: item.imageData, era: item.era, achievement: item.achievement, active: false, deleted: true });
    });
    const ownedCardIds = new Set(items.filter((item) => Number(item.count) > 0).map((item) => item.cardId));
    const sets = (Array.isArray(data.cardSets) ? data.cardSets : []).filter((set) => !set.deleted || [...cardsById.values()].some((card) => card.cardSetId === set.id && ownedCardIds.has(card.id)));
    const activeSetIds = new Set(Array.isArray(data.activeCardSetIds) ? data.activeCardSetIds : []);
    sets.sort((a, b) => Number(activeSetIds.has(b.id)) - Number(activeSetIds.has(a.id)) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    if (studentCollectionCardSetFilter !== "all" && !sets.some((set) => set.id === studentCollectionCardSetFilter)) studentCollectionCardSetFilter = "all";
    const shownSetIds = new Set((studentCollectionCardSetFilter === "all" ? sets : sets.filter((set) => set.id === studentCollectionCardSetFilter)).map((set) => set.id));
    const cards = [...cardsById.values()].filter((card) => shownSetIds.has(card.cardSetId) && (!card.deleted || ownedCardIds.has(card.id)));
    return { data, items, cards, sets, activeSetIds };
  }

  function collectionOwnedItems(model, cardId, rarity) {
    return model.items.filter((item) => item.cardId === cardId && item.rarity === rarity && Number(item.count) > 0);
  }

  function collectionQuantity(model, cardId, rarity) {
    return collectionOwnedItems(model, cardId, rarity).reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  }

  function collectionFrameCard(card, rarity, variant = "compact") {
    const meta = studentDrawRarityMeta[rarity] || studentDrawRarityMeta["일반"]; const image = card.imageUrl || card.imageData || "assets/portrait-placeholder-v1572.svg";
    return `<span class="collection-frame-card ${variant} ${meta.className}"><img class="collection-frame-portrait" src="${escapeHtml(image)}" alt="${escapeHtml(card.name || card.cardName || "카드 이미지")}"><img class="collection-frame-art" src="${escapeHtml(meta.frame)}" alt="${rarity} 카드 프레임">${variant === "detail" ? `<span class="collection-frame-info"><b data-student-card-title>${escapeHtml(card.name)}</b><small class="card-era-badge">${escapeHtml(card.era || "분류 없음")}</small><em class="card-description">${escapeHtml(card.achievement || "")}</em></span>` : ""}</span>`;
  }

  function fitStudentCardTitle(modal) {
    const title = modal?.querySelector?.("[data-student-card-title]"); if (!title) return;
    const stageWidth = modal.querySelector?.(".collection-detail-stage")?.clientWidth || 330; const maximum = stageWidth < 310 ? 18 : 20; const minimum = 14; let size = maximum;
    title.style.fontSize = `${size}px`; title.classList.remove("is-two-line");
    while (size > minimum && title.scrollWidth > title.clientWidth) { size -= 1; title.style.fontSize = `${size}px`; }
    if (title.scrollWidth > title.clientWidth) { title.classList.add("is-two-line"); title.style.fontSize = `${minimum}px`; }
  }

  function collectionCardButton(model, card, rarity) {
    const quantity = collectionQuantity(model, card.id, rarity);
    return `<button class="collection-album-card rarity-${studentCollectionRarityClasses[rarity]}" type="button" data-student-collection-card="${escapeHtml(card.id)}" data-rarity="${rarity}" aria-label="${escapeHtml(card.name)} ${rarity} 카드 상세 보기">${collectionFrameCard(card, rarity)}<strong>${escapeHtml(card.name)}</strong><span class="pill rarity-${studentCollectionRarityClasses[rarity]}">${rarity}</span><small>보유 ${quantity}</small></button>`;
  }

  function collectionContent() {
    const collection = portalState().cardCollection || {};
    if (!collection.loaded && !collection.loading && !collection.error) window.ourClassStudentPortal?.ensureCardCollectionLoaded?.();
    if (collection.loading) return portalLoadPanel("카드를 불러오는 중이에요.");
    if (collection.error) return portalErrorPanel();
    const model = collectionModel();
    const filters = `<button class="collection-filter ${studentCollectionCardSetFilter === "all" ? "selected" : ""}" type="button" data-student-collection-filter="all">전체</button>${model.sets.map((set) => `<button class="collection-filter ${studentCollectionCardSetFilter === set.id ? "selected" : ""}" type="button" data-student-collection-filter="${escapeHtml(set.id)}">${escapeHtml(set.name)}</button>`).join("")}`;
    const sections = [...studentCollectionRarities].reverse().map((rarity) => {
      const owned = model.cards.filter((card) => collectionQuantity(model, card.id, rarity) > 0);
      const total = model.cards.filter((card) => !card.deleted).length;
      return `<section class="collection-rarity-section"><div class="section-heading"><div><h2><span class="pill rarity-${studentCollectionRarityClasses[rarity]}">${rarity}</span> 카드</h2><p class="muted">${owned.length} / ${total} 수집</p></div></div>${owned.length ? `<div class="collection-album-grid">${owned.map((card) => collectionCardButton(model, card, rarity)).join("")}</div>` : `<div class="empty collection-rarity-empty">아직 획득한 ${rarity} 카드가 없습니다.</div>`}</section>`;
    }).join("");
    const representative = model.data.representativeCard;
    const representativeItem = representative ? model.items.find((item) => item.cardId === representative.cardId && item.rarity === representative.rarity && item.abilityId === representative.abilityId) : null;
    const representativeText = representativeItem ? `${escapeHtml(representativeItem.cardName)} · ${escapeHtml(representativeItem.rarity)} · ${escapeHtml(representativeItem.ability?.name || "특수능력")}` : "없음";
    const representativeImage = representativeItem ? collectionFrameCard({...representativeItem, name: representativeItem.cardName}, representativeItem.rarity, "representative") : "";
    return `<div class="student-v155-page-head"><div><span>📚 위인도감</span><h1>나의 카드 컬렉션</h1><p>획득한 카드를 등급별로 모아 보고, 눌러서 앞면과 능력을 확인하세요.</p></div></div><div class="collection-bonus-summary">${representativeImage}<strong>현재 대표 카드</strong><span>${representativeText}</span></div><div class="collection-filters" aria-label="카드셋 필터">${filters}</div>${sections}`;
  }

  function openStudentCollectionCard(cardId, rarity, abilityId = "", showBack = false) {
    const model = collectionModel(); const card = model.cards.find((item) => item.id === cardId);
    const owned = collectionOwnedItems(model, cardId, rarity); if (!card || !owned.length) return;
    const selected = owned.find((item) => item.abilityId === abilityId) || owned[0];
    const quantity = owned.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    const representative = model.data.representativeCard;
    const equipped = representative?.cardId === cardId && representative?.rarity === rarity && representative?.abilityId === selected.abilityId;
    const chips = owned.map((item) => `<button class="collection-ability-chip ${item.abilityId === selected.abilityId ? "selected" : ""}" type="button" data-student-collection-ability="${escapeHtml(item.abilityId)}" data-card-id="${escapeHtml(cardId)}" data-rarity="${rarity}">${escapeHtml(item.ability?.icon || "✨")} ${escapeHtml(item.ability?.name || "특수능력")} ×${Number(item.count) || 0}</button>`).join("");
    const step = studentCollectionUpgradeSteps[rarity]; const needed = step ? Number(model.data.cardUpgradeSettings?.[step.key]) || 0 : 0;
    const upgrade = step ? quantity >= needed && needed > 0 ? `<button class="button secondary compact" type="button" disabled title="Firebase 저장 연결이 필요합니다">⬆ ${step.to}로 업그레이드 · 연결 필요</button>` : `<span class="muted">업그레이드 ${quantity} / ${needed || "-"}장</span>` : `<span class="muted">최고 등급 카드</span>`;
    app.insertAdjacentHTML("beforeend", `<div class="student-v157-modal" role="presentation"><section class="student-v157-modal-card collection-card-modal" role="dialog" aria-modal="true" aria-labelledby="student-collection-detail-title"><div class="section-heading"><div><h2 id="student-collection-detail-title">카드 상세</h2><p class="muted">카드 또는 뒤집기 버튼을 눌러 앞·뒷면을 확인하세요.</p></div><button class="icon-button" type="button" data-student-draw-close aria-label="카드 상세 닫기">×</button></div><div class="collection-detail-stage ${showBack ? "show-back" : ""}" data-student-collection-flip role="button" tabindex="0" aria-label="카드 앞뒷면 전환"><article class="collection-detail-face collection-detail-front rarity-${studentCollectionRarityClasses[rarity]}">${collectionFrameCard(card, rarity, "detail")}<span class="collection-detail-rarity pill rarity-${studentCollectionRarityClasses[rarity]}">${rarity}</span><strong class="collection-detail-owned">보유 ${quantity}장</strong>${equipped ? `<span class="representative-card-mark">대표</span>` : ""}</article><article class="collection-detail-face collection-detail-back rarity-${studentCollectionRarityClasses[rarity]}"><span class="pill rarity-${studentCollectionRarityClasses[rarity]}">${rarity}</span><div class="collection-detail-ability-icon">${escapeHtml(selected.ability?.icon || "✨")}</div><h2>${escapeHtml(selected.ability?.name || "특수능력")}</h2><p>${escapeHtml(selected.ability?.summary || "설정된 능력 효과가 없습니다.")}</p><strong>이 능력 보유 ${Number(selected.count) || 0}장</strong>${equipped ? `<span class="representative-card-mark">대표 카드</span>` : ""}</article></div><div class="collection-modal-controls"><button class="button" type="button" data-student-collection-flip>${showBack ? "앞면 보기" : "뒤집기"}</button><div class="collection-ability-picker"><strong>보유 능력 선택</strong><div>${chips}</div></div><div class="button-row collection-detail-action-row"><button class="button ${equipped ? "secondary" : "success"} compact" type="button" data-student-set-representative data-card-id="${escapeHtml(cardId)}" data-rarity="${rarity}" data-ability-id="${escapeHtml(selected.abilityId)}" ${equipped || studentRepresentativeMutating ? "disabled" : ""}>${equipped ? "현재 대표 카드" : studentRepresentativeMutating ? "설정 중…" : "대표 카드로 설정"}</button>${upgrade}</div></div></section></div>`);
    const detailModal = app.querySelector(".student-v157-modal:last-child"); window.requestAnimationFrame(() => fitStudentCardTitle(detailModal));
  }

  function pendingContent(view) {
    const map = {
      draw: ["🎴", "카드뽑기", "보유 포인트로 위인 카드를 뽑는 화면"],
      collection: ["📚", "위인도감", "획득한 위인 카드를 모아보는 화면"]
    };
    const [icon, title, description] = map[view] || ["✨", "준비 중", "학생용 화면"];
    return `<section class="student-v155-pending-page"><div class="student-v155-pending-icon">${icon}</div><h1>${title}</h1><p>${description}은 아직 교사용 카드 설정 데이터가 Firebase에 연결되지 않았어요.</p><strong>카드 설정을 클라우드로 옮긴 뒤 안전하게 연결할게요.</strong><button type="button" data-student-cloud-view="home">홈으로 돌아가기</button></section>`;
  }

  function viewContent(home) {
    const features = home.classInfo.features || {};
    if (studentCloudView === "assignments" && features.assignments !== false) return assignmentsContent(home);
    if (studentCloudView === "roles" && features.roles !== false) return rolesContent(home);
    if (studentCloudView === "points" && features.points !== false) return pointsContent(home);
    if (studentCloudView === "ranking") return rankingContent();
    if (studentCloudView === "draw") return drawContent(home);
    if (studentCloudView === "collection") return collectionContent();
    studentCloudView = "home";
    return homeContent(home);
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-student-cloud-view]");
    if (!target || typeof session === "undefined" || session.mode !== "firebase-student") return;
    event.preventDefault();
    event.stopPropagation();
    studentCloudView = String(target.dataset.studentCloudView || "home");
    if (["points", "ranking"].includes(studentCloudView)) window.ourClassStudentPortal?.ensureLoaded?.();
    if (studentCloudView === "draw") window.ourClassStudentPortal?.ensureCardDrawLoaded?.(true);
    if (studentCloudView === "collection") window.ourClassStudentPortal?.ensureCardCollectionLoaded?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof render === "function") render();
  }, true);

  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-student-point-history-all]");
    if (!target || typeof session === "undefined" || session.mode !== "firebase-student") return;
    event.preventDefault(); event.stopPropagation();
    const entries = window.ourClassStudentPortal?.state?.()?.data?.pointHistory;
    openAllPointHistory(Array.isArray(entries) ? entries : []);
  }, true);

  document.addEventListener("click", (event) => {
    const rateTarget = event.target.closest?.("[data-student-draw-rates]");
    const drawTarget = event.target.closest?.("[data-student-draw-preview]");
    const drawAgainTarget = event.target.closest?.("[data-student-draw-again]");
    const closeTarget = event.target.closest?.("[data-student-draw-close]");
    if (typeof session === "undefined" || session.mode !== "firebase-student") return;
    if (rateTarget) { event.preventDefault(); event.stopPropagation(); openDrawRatePreview(rateTarget.dataset.studentDrawRates); return; }
    if (drawTarget) { event.preventDefault(); event.stopPropagation(); runDrawPreviewSequence(drawTarget.dataset.studentDrawPreview); return; }
    if (drawAgainTarget) {
      event.preventDefault(); event.stopPropagation();
      const optionId = String(drawAgainTarget.dataset.studentDrawAgain || "basic");
      drawAgainTarget.closest(".student-v157-modal")?.remove();
      window.requestAnimationFrame(() => runDrawPreviewSequence(optionId));
      return;
    }
    if (closeTarget) {
      event.preventDefault();
      const modal = closeTarget.closest(".student-v157-modal");
      modal?.remove();
    }
  }, true);

  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-student-ranking-period]");
    if (!target || typeof session === "undefined" || session.mode !== "firebase-student") return;
    event.preventDefault();
    studentRankingPeriod = target.dataset.studentRankingPeriod === "all" ? "all" : "week";
    studentRankingExpanded = false;
    if (typeof render === "function") render();
  }, true);

  document.addEventListener("click", (event) => {
    const category = event.target.closest?.("[data-student-ranking-category]"); const more = event.target.closest?.("[data-student-ranking-more]");
    if ((!category && !more) || typeof session === "undefined" || session.mode !== "firebase-student") return;
    event.preventDefault(); event.stopPropagation();
    if (category && !category.disabled) { studentRankingCategory = category.dataset.studentRankingCategory || "activity"; studentRankingExpanded = false; }
    if (more) studentRankingExpanded = !studentRankingExpanded;
    if (typeof render === "function") render();
  }, true);

  document.addEventListener("click", (event) => {
    if (typeof session === "undefined" || session.mode !== "firebase-student") return;
    const filter = event.target.closest?.("[data-student-collection-filter]");
    const card = event.target.closest?.("[data-student-collection-card]");
    const ability = event.target.closest?.("[data-student-collection-ability]");
    const flip = event.target.closest?.("[data-student-collection-flip]");
    const representative = event.target.closest?.("[data-student-set-representative]");
    if (representative) {
      event.preventDefault(); event.stopPropagation(); if (studentRepresentativeMutating || representative.disabled) return;
      studentRepresentativeMutating = true; representative.disabled = true; representative.textContent = "설정 중…";
      window.ourClassStudentPortal?.setRepresentativeCard?.(representative.dataset.cardId, representative.dataset.rarity, representative.dataset.abilityId)
        .then(() => { representative.closest(".student-v157-modal")?.remove(); if (typeof render === "function") render(); toast("대표 카드를 설정했습니다."); })
        .catch((caught) => { console.error("Representative card save failed", caught); representative.disabled = false; representative.textContent = "대표 카드로 설정"; toast("대표 카드 설정에 실패했습니다."); })
        .finally(() => { studentRepresentativeMutating = false; });
      return;
    }
    if (filter) {
      event.preventDefault(); event.stopPropagation();
      studentCollectionCardSetFilter = String(filter.dataset.studentCollectionFilter || "all");
      if (typeof render === "function") render();
      return;
    }
    if (card) {
      event.preventDefault(); event.stopPropagation();
      openStudentCollectionCard(String(card.dataset.studentCollectionCard || ""), String(card.dataset.rarity || ""));
      return;
    }
    if (ability) {
      event.preventDefault(); event.stopPropagation();
      ability.closest(".student-v157-modal")?.remove();
      openStudentCollectionCard(String(ability.dataset.cardId || ""), String(ability.dataset.rarity || ""), String(ability.dataset.studentCollectionAbility || ""), true);
      return;
    }
    if (flip) {
      event.preventDefault(); event.stopPropagation();
      const modal = flip.closest(".student-v157-modal"); const stage = modal?.querySelector(".collection-detail-stage");
      if (!stage) return;
      stage.classList.toggle("show-back");
      const button = modal.querySelector(".collection-modal-controls > [data-student-collection-flip]");
      if (button) button.textContent = stage.classList.contains("show-back") ? "앞면 보기" : "뒤집기";
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    const stage = event.target.closest?.(".collection-detail-stage[data-student-collection-flip]");
    if (!stage || !["Enter", " "].includes(event.key) || typeof session === "undefined" || session.mode !== "firebase-student") return;
    event.preventDefault(); stage.click();
  }, true);

  document.addEventListener("click", async (event) => {
    if (typeof session === "undefined" || session.mode !== "firebase-student") return;
    const open = event.target.closest?.("[data-student-character-open]");
    const option = event.target.closest?.("[data-student-character-id]");
    const close = event.target.closest?.("[data-student-character-close]");
    const save = event.target.closest?.("[data-student-character-save]");
    if (open) { openCharacterModal(); return; }
    if (option) { studentCharacterDraftId = selectedCharacter(option.dataset.studentCharacterId).id; refreshCharacterModal(); return; }
    if (close && !studentCharacterMutating) { close.closest(".student-character-modal")?.remove(); return; }
    if (!save || studentCharacterMutating) return;
    const previousId = selectedCharacter().id;
    studentCharacterMutating = true;
    refreshCharacterModal();
    try {
      const saveCharacter = window.ourClassStudentCustomizationApi?.setStudentCharacter;
      if (typeof saveCharacter !== "function") throw new Error("캐릭터 저장 기능을 불러오지 못했습니다.");
      await saveCharacter(studentCharacterDraftId);
      document.querySelector(".student-character-modal")?.remove();
      if (typeof toast === "function") toast("캐릭터를 변경했습니다.");
    } catch (error) {
      window.ourClassStudentCustomization.characterId = previousId;
      studentCharacterMutating = false;
      refreshCharacterModal();
      console.error("Student character save failed", error);
      if (typeof toast === "function") toast("캐릭터를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    studentCharacterMutating = false;
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !studentCharacterMutating) document.querySelector(".student-character-modal")?.remove();
  }, true);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && typeof session !== "undefined" && session.mode === "firebase-student") render();
  });

  renderFirebaseStudentLanding = function renderFirebaseStudentLandingV155() {
    if (firebaseStudentHomeLoading) {
      document.title = "우리반 퀘스트";
      app.innerHTML = `<main class="welcome"><section class="welcome-card auth-loading"><div class="brand-mark">⚔</div><h1>우리반 퀘스트</h1><p>학생 정보를 불러오는 중...</p></section></main>`;
      return;
    }

    if (firebaseStudentHomeError || !firebaseStudentHomeData) {
      document.title = "우리반 퀘스트";
      app.innerHTML = `<main class="welcome"><section class="welcome-card student-auth-landing"><div class="brand-mark">⚔</div><h1>우리반 퀘스트</h1><p>학생 정보를 불러오지 못했습니다. 다시 시도해 주세요.</p><div class="button-row cloud-student-error-actions"><button class="button" data-action="retry-student-home">다시 시도</button><button class="button secondary" data-action="firebase-student-logout">로그아웃</button></div></section></main>`;
      return;
    }

    const home = firebaseStudentHomeData;
    const profile = home.profile;
    const classInfo = home.classInfo;
    const features = classInfo.features || {};
    scheduleDailyOpenRefresh(home.roleSettings || {}, window.ourClassStudentPortal?.state?.()?.shop?.data || {});

    document.title = classInfo.appName || "우리반 퀘스트";
    app.innerHTML = `
      <div class="app-shell student-shell cloud-student-shell student-home-v15 student-home-v155">
        <header class="topbar student-v15-topbar">
          <button class="brand student-v15-brand student-v155-brand-home" type="button" data-student-cloud-view="home" aria-label="학생 홈으로 이동">
            <span class="student-v15-brand-shield" aria-hidden="true">★</span>
            <span>${escapeHtml(classInfo.appName || "우리반 퀘스트")}</span>
          </button>
          <div class="user-area student-v15-user-area">
            <strong>${escapeHtml(profile.name)}</strong>
            <span class="student-v15-user-divider" aria-hidden="true"></span>
            <button class="student-v15-logout" data-action="firebase-student-logout" type="button"><span aria-hidden="true">⇥</span> 로그아웃</button>
          </div>
        </header>

        <div class="student-v155-body">
          <aside class="student-v155-sidebar">${navMarkup(features)}</aside>
          <main class="cloud-student-home student-home-v15-main student-v155-main">${viewContent(home)}</main>
        </div>
      </div>`;
  };
})();
