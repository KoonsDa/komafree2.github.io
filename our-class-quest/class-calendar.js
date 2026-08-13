(() => {
  const CATEGORIES = ["학급행사", "학교행사", "준비물·안내", "기타"];
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  let studentCalendarMonth = todayString().slice(0, 7);
  let studentCalendarDate = todayString();

  function publicEventsForDate(date) {
    return data.classEvents.filter((event) => event.date === date).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  }

  function calendarItems(fromDate = "0000-00-00") {
    const classItems = data.classEvents.map((event) => ({ ...event, type: "class" }));
    const assignmentItems = data.assignments.filter((assignment) => DATE_PATTERN.test(String(assignment.dueDate || ""))).map((assignment) => ({ id: `assignment-${assignment.id}`, date: assignment.dueDate, title: `과제 · ${assignment.title}`, description: assignment.description || "", category: "과제", type: "assignment" }));
    return [...classItems, ...assignmentItems].filter((item) => item.date >= fromDate).sort((a, b) => a.date.localeCompare(b.date) || (a.type === b.type ? a.title.localeCompare(b.title, "ko-KR") : a.type === "class" ? -1 : 1));
  }

  function eventRow(item, teacher = false) {
    return `<article class="class-event-row ${item.type === "assignment" ? "assignment-event" : ""}"><div class="class-event-main"><span class="class-event-category">${escapeHtml(item.category)}</span><div><strong>${escapeHtml(item.title)}</strong>${item.description ? `<p>${escapeHtml(item.description).replace(/\n/g, "<br>")}</p>` : ""}</div></div>${teacher && item.type === "class" ? `<div class="list-actions"><button class="button secondary compact" data-action="edit-class-event" data-id="${item.id}">수정</button><button class="button danger compact" data-action="ask-delete-class-event" data-id="${item.id}">삭제</button></div>` : ""}</article>`;
  }

  function teacherEventSection() {
    const events = publicEventsForDate(dashboardSelectedDate).map((event) => ({ ...event, type: "class" }));
    return `<section class="card dashboard-detail class-event-panel"><div class="section-heading"><div><h2>우리반 일정</h2><p class="muted">학생에게 공개되는 일정입니다.</p></div><button class="button success compact" data-action="new-class-event">+ 일정 추가</button></div>${events.length ? `<div class="class-event-list">${events.map((event) => eventRow(event, true)).join("")}</div>` : `<div class="empty">등록된 우리반 일정이 없습니다.</div>`}</section>`;
  }

  const originalDashboardClassPlan = dashboardClassPlan;
  dashboardClassPlan = function classCalendarDashboardPlan() {
    return `${originalDashboardClassPlan()}${teacherEventSection()}`;
  };

  dashboardCalendar = function classCalendarDashboard() {
    const [year, month] = dashboardMonth.split("-").map(Number); const firstDay = new Date(year, month - 1, 1).getDay(); const lastDate = new Date(year, month, 0).getDate(); const cells = Array.from({ length: firstDay }, () => `<div class="calendar-day blank"></div>`);
    for (let day = 1; day <= lastDate; day += 1) {
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`; const activity = calendarActivity(dateKey); const eventCount = publicEventsForDate(dateKey).length;
      const markers = [activity.assignments ? `<span>과제 ${activity.assignments}</span>` : "", eventCount ? `<span class="public-event-marker">일정 ${eventCount}</span>` : "", activity.roles ? `<span>역할 ${activity.roles}</span>` : "", activity.observations ? `<span>관찰 ${activity.observations}</span>` : "", activity.note ? `<span>주요 사항</span>` : ""].join("");
      cells.push(`<button class="calendar-day ${dateKey === dashboardSelectedDate ? "selected" : ""} ${dateKey === todayString() ? "today" : ""}" data-action="select-dashboard-date" data-date="${dateKey}"><strong>${day}</strong><small>${markers}</small></button>`);
    }
    return `<section class="dashboard-calendar card"><div class="calendar-heading"><button class="icon-button" data-action="move-dashboard-month" data-direction="prev" aria-label="이전 달">‹</button><h2>${year}년 ${month}월</h2><button class="icon-button" data-action="move-dashboard-month" data-direction="next" aria-label="다음 달">›</button><button class="button secondary compact" data-action="dashboard-today">오늘</button></div><div class="calendar-weekdays">${["일", "월", "화", "수", "목", "금", "토"].map((name) => `<span>${name}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div></section><h2 class="dashboard-date-heading">${selectedDateTitle(dashboardSelectedDate)}</h2>${dashboardClassPlan()}`;
  };

  function openEventModal(id = "") {
    const event = data.classEvents.find((item) => item.id === id);
    app.insertAdjacentHTML("beforeend", `<div class="modal"><form id="class-event-form" class="modal-card form" data-id="${id}"><h2>${event ? "우리반 일정 수정" : "우리반 일정 추가"}</h2><label>날짜<input name="date" type="date" required value="${event?.date || dashboardSelectedDate}"></label><label>종류<select name="category">${CATEGORIES.map((category) => `<option ${event?.category === category ? "selected" : ""}>${category}</option>`).join("")}</select></label><label>제목<input name="title" maxlength="100" required value="${escapeHtml(event?.title || "")}" placeholder="예: 현장체험학습"></label><label>간단한 내용 (선택)<textarea name="description" maxlength="500" rows="5" placeholder="예: 08:30까지 등교 / 운동화 / 물통">${escapeHtml(event?.description || "")}</textarea></label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></div>`);
  }

  const originalStudentHome = studentHome;
  studentHome = function classCalendarStudentHome() {
    const upcoming = calendarItems(todayString()).slice(0, 3);
    const rows = upcoming.map((item) => `<article class="student-event-preview"><time datetime="${item.date}">${item.date === todayString() ? "오늘" : compactDate(item.date)}</time><div><span>${escapeHtml(item.category)}</span><strong>${escapeHtml(item.title)}</strong></div></article>`).join("");
    const section = `<section class="card student-calendar-card"><div class="section-heading"><div><h2>우리반 일정</h2><p class="muted">오늘과 가까운 예정 일정</p></div></div>${rows || `<div class="empty">다가오는 일정이 없어요.</div>`}<button class="button secondary compact" data-action="open-student-calendar">전체 달력 보기</button></section>`;
    return originalStudentHome().replace("</section>", `</section>${section}`);
  };

  function studentCalendarHtml() {
    const [year, month] = studentCalendarMonth.split("-").map(Number); const firstDay = new Date(year, month - 1, 1).getDay(); const lastDate = new Date(year, month, 0).getDate(); const items = calendarItems(); const counts = items.reduce((map, item) => ({ ...map, [item.date]: (map[item.date] || 0) + 1 }), {}); const cells = Array.from({ length: firstDay }, () => `<div class="student-calendar-day blank"></div>`);
    for (let day = 1; day <= lastDate; day += 1) { const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`; cells.push(`<button class="student-calendar-day ${date === studentCalendarDate ? "selected" : ""} ${date === todayString() ? "today" : ""}" data-action="select-student-calendar-date" data-date="${date}"><strong>${day}</strong>${counts[date] ? `<span>${counts[date]}개</span>` : ""}</button>`); }
    const selected = items.filter((item) => item.date === studentCalendarDate);
    return `<div class="student-calendar-toolbar"><button class="icon-button" data-action="move-student-calendar-month" data-direction="prev" aria-label="이전 달">‹</button><h2>${year}년 ${month}월</h2><button class="icon-button" data-action="move-student-calendar-month" data-direction="next" aria-label="다음 달">›</button><button class="button secondary compact" data-action="student-calendar-today">오늘</button></div><div class="calendar-weekdays">${["일", "월", "화", "수", "목", "금", "토"].map((name) => `<span>${name}</span>`).join("")}</div><div class="student-calendar-grid">${cells.join("")}</div><section class="student-calendar-detail"><h3>${selectedDateTitle(studentCalendarDate)}</h3>${selected.length ? `<div class="class-event-list">${selected.map((item) => eventRow(item)).join("")}</div>` : `<div class="empty">이 날짜에는 일정이 없어요.</div>`}</section>`;
  }

  function openStudentCalendar() {
    studentCalendarMonth = todayString().slice(0, 7); studentCalendarDate = todayString();
    app.insertAdjacentHTML("beforeend", `<div class="modal student-calendar-modal"><section class="modal-card"><div class="section-heading"><div><h1>우리반 달력</h1><p class="muted">학급 일정과 과제 마감일을 확인하세요.</p></div><button class="button secondary" data-action="close-modal">닫기</button></div><div id="student-calendar-body">${studentCalendarHtml()}</div></section></div>`);
  }
  function refreshStudentCalendar() { const body = document.querySelector("#student-calendar-body"); if (body) body.innerHTML = studentCalendarHtml(); }

  app.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]"); if (!target) return;
    const action = target.dataset.action;
    if (action === "new-class-event") return openEventModal();
    if (action === "edit-class-event") return openEventModal(target.dataset.id);
    if (action === "ask-delete-class-event") { const item = data.classEvents.find((entry) => entry.id === target.dataset.id); if (!item) return; app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card"><h2>일정 삭제</h2><p><strong>${escapeHtml(item.title)}</strong> 일정을 삭제하시겠습니까?</p><div class="button-row"><button class="button danger" data-action="confirm-delete-class-event" data-id="${item.id}">삭제</button><button class="button secondary" data-action="close-modal">취소</button></div></section></div>`); return; }
    if (action === "confirm-delete-class-event") { data.classEvents = data.classEvents.filter((item) => item.id !== target.dataset.id); saveData(); render(); toast("우리반 일정을 삭제했습니다."); return; }
    if (action === "open-student-calendar") return openStudentCalendar();
    if (action === "select-student-calendar-date") { studentCalendarDate = target.dataset.date; return refreshStudentCalendar(); }
    if (action === "move-student-calendar-month") { const [year, month] = studentCalendarMonth.split("-").map(Number); const moved = new Date(year, month - 1 + (target.dataset.direction === "prev" ? -1 : 1), 1); studentCalendarMonth = `${moved.getFullYear()}-${String(moved.getMonth() + 1).padStart(2, "0")}`; studentCalendarDate = `${studentCalendarMonth}-01`; return refreshStudentCalendar(); }
    if (action === "student-calendar-today") { studentCalendarDate = todayString(); studentCalendarMonth = studentCalendarDate.slice(0, 7); return refreshStudentCalendar(); }
  });

  app.addEventListener("submit", (event) => {
    const form = event.target; if (form.id !== "class-event-form") return;
    event.preventDefault(); const formData = new FormData(form); const date = String(formData.get("date") || ""); const title = String(formData.get("title") || "").trim(); const category = String(formData.get("category") || ""); const description = String(formData.get("description") || "").trim();
    if (!DATE_PATTERN.test(date) || !title || !CATEGORIES.includes(category)) return toast("날짜와 제목을 확인해 주세요.");
    const now = new Date().toISOString(); const existing = data.classEvents.find((item) => item.id === form.dataset.id);
    if (existing) Object.assign(existing, { date, category, title: title.slice(0, 100), description: description.slice(0, 500), updatedAt: now });
    else data.classEvents.push({ id: crypto.randomUUID(), date, category, title: title.slice(0, 100), description: description.slice(0, 500), createdAt: now, updatedAt: now });
    saveData(); render(); toast(existing ? "우리반 일정을 수정했습니다." : "우리반 일정을 추가했습니다.");
  });
})();
