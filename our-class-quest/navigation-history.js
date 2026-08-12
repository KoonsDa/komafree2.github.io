(() => {
  const ROUTE_MARKER = "ourClassQuestRouteV1";
  let restoringHistory = false;

  function routeState(overrides = {}) {
    return {
      marker: ROUTE_MARKER,
      mode: session.mode,
      studentId: session.studentId || null,
      view: session.view || "home",
      studentDetailId: typeof studentDetailId !== "undefined" ? studentDetailId : "",
      assignmentStudentView: typeof assignmentStudentView !== "undefined" ? assignmentStudentView : "",
      observationStudentId: typeof observationFilters !== "undefined" ? (observationFilters.studentId || "") : "",
      welcomeStudents: false,
      ...overrides
    };
  }

  function sameRoute(first, second) {
    if (!first || !second || first.marker !== ROUTE_MARKER || second.marker !== ROUTE_MARKER) return false;
    return first.mode === second.mode
      && first.studentId === second.studentId
      && first.view === second.view
      && first.studentDetailId === second.studentDetailId
      && first.assignmentStudentView === second.assignmentStudentView
      && first.observationStudentId === second.observationStudentId
      && Boolean(first.welcomeStudents) === Boolean(second.welcomeStudents);
  }

  function saveRoute(push = true, overrides = {}) {
    if (restoringHistory) return;
    const nextState = routeState(overrides);
    if (sameRoute(history.state, nextState)) return;
    const method = push ? "pushState" : "replaceState";
    history[method](nextState, "", location.href);
  }

  function restoreRoute(state) {
    if (!state || state.marker !== ROUTE_MARKER) return;

    restoringHistory = true;
    session = {
      mode: state.mode || "welcome",
      studentId: state.studentId || null,
      view: state.view || "home"
    };

    if (typeof studentDetailId !== "undefined") studentDetailId = state.studentDetailId || "";
    if (typeof assignmentStudentView !== "undefined") assignmentStudentView = state.assignmentStudentView || "";
    if (typeof observationFilters !== "undefined") {
      observationFilters = { ...observationFilters, studentId: state.observationStudentId || "" };
    }

    if (session.mode === "welcome" && state.welcomeStudents) renderWelcome(true);
    else render();

    restoringHistory = false;
  }

  // 현재 화면을 이 문서의 첫 앱 내 기록으로 등록한다.
  history.replaceState(routeState(), "", location.href);

  const routeActions = new Set([
    "enter-student",
    "enter-teacher",
    "navigate",
    "open-student-detail",
    "close-student-detail",
    "manage-student-observations",
    "view-student-assignments",
    "logout"
  ]);

  // 기존 script.js의 클릭 처리가 끝난 뒤 변경된 session 상태를 브라우저 기록에 쌓는다.
  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-action]");
    if (!target) return;

    const action = target.dataset.action;

    if (action === "show-students") {
      queueMicrotask(() => saveRoute(true, { mode: "welcome", studentId: null, view: "home", welcomeStudents: true }));
      return;
    }

    if (!routeActions.has(action)) return;
    queueMicrotask(() => saveRoute(true));
  }, true);

  // Android 뒤로가기, iPhone/iPad Safari 뒤로가기 및 스와이프 뒤로가기를
  // 앱 내부의 이전 화면 이동으로 연결한다.
  window.addEventListener("popstate", (event) => {
    if (event.state?.marker !== ROUTE_MARKER) return;
    restoreRoute(event.state);
  });
})();
