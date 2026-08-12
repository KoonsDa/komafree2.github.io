(() => {
  function studentTodoAssignmentCount(student) {
    if (!student || !featureEnabled("assignments")) return 0;
    const studentIndex = data.students.findIndex((item) => item.id === student.id);
    if (studentIndex < 0) return 0;
    return data.assignments.filter((assignment) => {
      const status = assignment.statuses?.[studentIndex] || "missing";
      return status === "missing" && !isAssignmentCompleted(assignment);
    }).length;
  }

  function refreshStudentSummaryNavigation() {
    if (session.mode !== "student") return;
    const strip = document.querySelector(".student-shell .summary-strip");
    const student = currentStudent();
    if (!strip || !student || strip.dataset.summaryNavReady === "true") return;

    const items = [
      { label: "학급정보", value: data.classSettings.className, view: "home", enabled: true, className: "class-summary-item" },
      { label: "포인트", value: `${student.points}P`, view: "points", enabled: featureEnabled("points") },
      { label: "과제", value: `${studentTodoAssignmentCount(student)}개`, view: "assignments", enabled: featureEnabled("assignments") },
      { label: "역할", value: `${todayRoleApplicationsForStudent(student.id).length}개`, view: "roles", enabled: featureEnabled("roles") },
      { label: "보유 카드", value: `${cardCount(student)}장`, view: "collection", enabled: featureEnabled("cards") }
    ].filter((item) => item.enabled);

    strip.dataset.summaryNavReady = "true";
    strip.classList.add("summary-nav-strip");
    strip.style.setProperty("--summary-count", items.length);
    strip.innerHTML = items.map((item) => `
      <button
        type="button"
        class="summary-item summary-nav-item ${item.className || ""} ${session.view === item.view ? "current" : ""}"
        data-action="navigate"
        data-view="${item.view}"
        data-summary-view="${item.view}"
        aria-label="${escapeHtml(item.label)} 메뉴로 이동"
      >
        ${escapeHtml(item.label)}
        <strong>${escapeHtml(item.value)}</strong>
      </button>
    `).join("");
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-summary-view='assignments']");
    if (target && typeof studentAssignmentFilter !== "undefined") {
      studentAssignmentFilter = "todo";
      showAllStudentCompletedAssignments = false;
    }
  }, true);

  const observer = new MutationObserver(() => refreshStudentSummaryNavigation());
  observer.observe(document.body, { childList: true, subtree: true });
  refreshStudentSummaryNavigation();
})();
