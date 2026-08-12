(() => {
  const DEFAULT_TITLE = "오늘도 우리 반을 함께 빛내요! ✨";
  const DEFAULT_SUBTITLE = "해야 할 일을 하나씩 확인해 보세요.";

  function settings() {
    return data?.classSettings || {};
  }

  function currentTitle() {
    return String(settings().studentHomeMessageTitle || DEFAULT_TITLE);
  }

  function currentSubtitle() {
    return settings().studentHomeMessageSubtitle === undefined
      ? DEFAULT_SUBTITLE
      : String(settings().studentHomeMessageSubtitle || "");
  }

  function enhanceClassInfoForm() {
    if (session.mode !== "teacher" || session.view !== "class-settings") return;
    const form = document.querySelector("#class-info-form");
    if (!form || form.dataset.studentHomeMessageReady === "true") return;

    form.dataset.studentHomeMessageReady = "true";
    const saveButton = form.querySelector('button[type="submit"]');
    if (!saveButton) return;

    const titleLabel = document.createElement("label");
    titleLabel.innerHTML = `학생 홈 메인 문구<input name="studentHomeMessageTitle" maxlength="80" required placeholder="예: 오늘도 우리 반을 함께 빛내요! ✨">`;
    titleLabel.querySelector("input").value = currentTitle();

    const subtitleLabel = document.createElement("label");
    subtitleLabel.innerHTML = `학생 홈 보조 문구<input name="studentHomeMessageSubtitle" maxlength="120" placeholder="예: 해야 할 일을 하나씩 확인해 보세요.">`;
    subtitleLabel.querySelector("input").value = currentSubtitle();

    form.insertBefore(titleLabel, saveButton);
    form.insertBefore(subtitleLabel, saveButton);
  }

  function applyStudentHomeMessage() {
    if (session.mode !== "student" || session.view !== "home") return;
    const hero = document.querySelector(".student-home-hero");
    if (!hero) return;

    const title = hero.querySelector("h2");
    const subtitle = hero.querySelector("p");
    if (title) title.textContent = currentTitle();
    if (subtitle) {
      const text = currentSubtitle();
      subtitle.textContent = text;
      subtitle.hidden = !text;
    }
  }

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "class-info-form") return;

    const titleInput = form.elements.namedItem("studentHomeMessageTitle");
    const subtitleInput = form.elements.namedItem("studentHomeMessageSubtitle");
    const title = String(titleInput?.value || "").trim();
    const subtitle = String(subtitleInput?.value || "").trim();

    data.classSettings = {
      ...data.classSettings,
      studentHomeMessageTitle: title || DEFAULT_TITLE,
      studentHomeMessageSubtitle: subtitle
    };
  }, true);

  const observer = new MutationObserver(() => {
    enhanceClassInfoForm();
    applyStudentHomeMessage();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  enhanceClassInfoForm();
  applyStudentHomeMessage();
})();
