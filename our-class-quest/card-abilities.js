const baseTeacherCardsWithAbilities = teacherCardsV2;

function cardAbilityManagerHtml() {
  const activeWeightTotal = cardAbilities(false).reduce((sum, ability) => sum + ability.weight, 0);
  const items = cardAbilities().filter((ability) => !ability.deleted).map((ability) => { const targetBadges = cardAbilityTargetSummary(ability).split(" · ").map((target) => `<span>${escapeHtml(target)}</span>`).join(""); const drawText = ability.active ? `가중치 ${ability.weight} · ${formatCardAbilityProbability(ability.weight, activeWeightTotal)}%` : `가중치 ${ability.weight} · 현재 뽑기 제외`; return `<div class="card-ability-list-row"><div class="card-ability-list-name"><strong>${ability.icon ? `${escapeHtml(ability.icon)} ` : ""}${escapeHtml(ability.name)}</strong></div><span class="card-ability-list-target" data-label="적용 대상">${targetBadges}</span><span class="card-ability-list-rate" data-label="등장 비율">${drawText}</span><span class="card-ability-list-status-wrap" data-label="상태"><span class="card-ability-list-status pill ${ability.active ? "success" : "danger"}">${ability.active ? "ON" : "OFF"}</span></span><div class="card-ability-list-actions"><button class="button secondary compact" data-action="edit-card-ability" data-id="${ability.id}">수정</button><button class="button secondary compact" data-action="toggle-card-ability" data-id="${ability.id}">${ability.active ? "사용 중지" : "사용 재개"}</button><button class="button danger compact" data-action="delete-card-ability" data-id="${ability.id}">삭제</button></div></div>`; }).join("");
  return `<div class="card-ability-manager"><div class="section-heading"><div><h3>특수능력 관리</h3><p class="muted">이름, 적용 대상, 등장 비율과 상태를 한눈에 확인하세요.</p></div><button class="button success compact" data-action="new-card-ability">+ 특수능력 추가</button></div><div class="card-ability-list"><div class="card-ability-list-head"><span>특수능력</span><span>적용 대상</span><span>등장 비율</span><span>상태</span><span>관리</span></div>${items || '<div class="empty">등록된 특수능력이 없습니다.</div>'}</div><h3 class="ability-effect-heading">하루 최대 보너스</h3></div>`;
}

function cardAbilityTargetSummary(ability) {
  const assignment = ability.targets?.assignments && CARD_RARITIES.some((rarity) => Number(cardAbilitySetting(rarity).abilities?.[ability.id]?.assignmentPercent) > 0);
  const role = ability.targets?.roles && CARD_RARITIES.some((rarity) => Number(cardAbilitySetting(rarity).abilities?.[ability.id]?.rolePercent) > 0);
  return assignment && role ? "과제 · 1인1역" : assignment ? "과제" : role ? "1인1역" : "효과 없음";
}

function formatCardAbilityProbability(weight, total) {
  const percent = total > 0 ? (weight / total) * 100 : 0;
  return Number.isInteger(percent) ? String(percent) : percent.toFixed(1);
}

teacherCardsV2 = function teacherCardsWithAbilityManager() {
  return baseTeacherCardsWithAbilities()
    .replace(/<section class="card" style="margin-top:24px"><h2>데모 설정<\/h2>.*?data-action="reset-demo".*?<\/section>/, "")
    .replace("등급별 능력 보너스와 하루 최대 보너스를 설정하세요.", "각 특수능력의 효과는 수정 팝업에서 설정하세요.")
    .replace('<form id="card-ability-settings-form">', `${cardAbilityManagerHtml()}<form id="card-ability-settings-form">`)
    .replace('<div class="special-ability-settings">', '<div class="special-ability-settings daily-cap-settings">')
    .replace("특수능력 설정 저장", "설정 저장");
};

function openCardAbilityModal(abilityId = "") {
  const ability = cardAbilityById(abilityId);
  const targets = ability?.targets || { assignments: true, roles: true };
  const rarityRows = CARD_RARITIES.map((rarity) => { const setting = cardAbilitySetting(rarity).abilities?.[ability?.id] || { assignmentPercent: 0, rolePercent: 0 }; return `<div class="card-ability-rarity-row"><strong>${rarity}</strong><label data-target-effect="assignments">과제 <input name="modal-${CARD_RATE_KEYS[rarity]}-assignment" type="number" min="0" max="100" step="1" value="${setting.assignmentPercent}" required> %</label><label data-target-effect="roles">1인1역 <input name="modal-${CARD_RATE_KEYS[rarity]}-role" type="number" min="0" max="100" step="1" value="${setting.rolePercent}" required> %</label></div>`; }).join("");
  const probability = formatCardAbilityProbability(ability?.weight || 1, cardAbilities(false).reduce((sum, item) => sum + item.weight, 0) || 1);
  app.insertAdjacentHTML("beforeend", `<div class="modal"><section class="modal-card card-ability-modal"><h2>${ability ? escapeHtml(ability.name) : "특수능력 추가"}</h2><form id="card-ability-form" class="card-ability-form" data-id="${ability?.id || ""}"><label>이름<input name="name" maxlength="40" value="${escapeHtml(ability?.name || "")}" placeholder="예: 🍀 행운의 힘" required></label><label>설명<textarea name="description" maxlength="120">${escapeHtml(ability?.description || "")}</textarea></label><fieldset class="card-ability-target-field"><legend>적용 대상</legend><label class="check-row"><input name="targetAssignments" type="checkbox" ${targets.assignments ? "checked" : ""}> 과제</label><label class="check-row"><input name="targetRoles" type="checkbox" ${targets.roles ? "checked" : ""}> 1인1역</label></fieldset><div class="card-ability-weight-line"><label class="card-ability-weight-field">등장 가중치<input name="weight" type="number" min="1" step="1" value="${ability?.weight || 1}" required></label><span>예상 등장 확률 <strong data-ability-probability>${probability}%</strong></span></div><small class="muted">가중치는 상대적인 등장 비율입니다. 숫자가 클수록 더 자주 등장합니다.</small><fieldset class="card-ability-effect-field"><legend>등급별 효과</legend>${rarityRows}</fieldset><label class="check-row card-ability-active-field"><input name="active" type="checkbox" ${ability?.active !== false ? "checked" : ""}> 활성화</label><div class="button-row"><button class="button success" type="submit">저장</button><button class="button secondary" type="button" data-action="close-modal">취소</button></div></form></section></div>`);
  updateCardAbilityModalTargets(app.querySelector("#card-ability-form"));
  updateCardAbilityModalProbability(app.querySelector("#card-ability-form"));
}

function updateCardAbilityModalTargets(form) {
  if (!form) return; const assignments = form.elements.targetAssignments.checked; const roles = form.elements.targetRoles.checked;
  form.querySelectorAll('[data-target-effect="assignments"]').forEach((row) => { row.hidden = !assignments; row.querySelector("input").disabled = !assignments; });
  form.querySelectorAll('[data-target-effect="roles"]').forEach((row) => { row.hidden = !roles; row.querySelector("input").disabled = !roles; });
}

function updateCardAbilityModalProbability(form) {
  if (!form) return; const existing = cardAbilityById(form.dataset.id); const weight = Math.max(1, Number(form.elements.weight.value) || 1); const active = form.elements.active.checked;
  const otherTotal = cardAbilities(false).reduce((sum, ability) => sum + (ability.id === existing?.id ? 0 : ability.weight), 0); const total = otherTotal + (active ? weight : 0);
  form.querySelector("[data-ability-probability]").textContent = active ? `${formatCardAbilityProbability(weight, total)}%` : "현재 뽑기 제외";
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]"); if (!target) return;
  const ability = cardAbilityById(target.dataset.id);
  if (target.dataset.action === "new-card-ability") return openCardAbilityModal();
  if (target.dataset.action === "edit-card-ability" && ability && !ability.deleted) return openCardAbilityModal(ability.id);
  if (target.dataset.action === "toggle-card-ability" && ability && !ability.deleted) { ability.active = !ability.active; ability.updatedAt = new Date().toISOString(); saveData(); render(); toast(ability.active ? "특수능력을 다시 사용합니다." : "특수능력 사용을 중지했습니다."); }
  if (target.dataset.action === "delete-card-ability" && ability && !ability.deleted && confirm(`'${ability.name}' 특수능력을 삭제할까요?\n학생이 보유한 기존 카드는 유지됩니다.`)) { ability.active = false; ability.deleted = true; ability.updatedAt = new Date().toISOString(); saveData(); render(); toast("특수능력을 삭제했습니다."); }
});

document.addEventListener("input", (event) => { if (event.target.closest("#card-ability-form") && ["weight", "active"].includes(event.target.name)) updateCardAbilityModalProbability(event.target.form); });
document.addEventListener("change", (event) => { if (event.target.closest("#card-ability-form") && ["targetAssignments", "targetRoles"].includes(event.target.name)) updateCardAbilityModalTargets(event.target.form); });

document.addEventListener("submit", (event) => {
  if (event.target.id !== "card-ability-form") return;
  event.preventDefault();
  const form = event.target; const formData = new FormData(form); const name = String(formData.get("name") || "").trim(); const description = String(formData.get("description") || "").trim(); const weight = Number(formData.get("weight")); const targets = { assignments: formData.get("targetAssignments") === "on", roles: formData.get("targetRoles") === "on" };
  if (!name || !Number.isInteger(weight) || weight < 1) { toast("이름과 1 이상의 정수 가중치를 입력해 주세요."); return; }
  if (!targets.assignments && !targets.roles) { toast("적용 대상을 하나 이상 선택해 주세요."); return; }
  const effectValues = [...form.querySelectorAll('.card-ability-effect-field input:not(:disabled)')].map((input) => Number(input.value));
  if (!effectValues.every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) { toast("등급별 효과는 0~100 사이의 숫자로 입력해 주세요."); return; }
  const existing = cardAbilityById(form.dataset.id); const now = new Date().toISOString(); let savedAbilityId = existing?.id || "";
  if (existing && !existing.deleted) Object.assign(existing, { name, description, weight, targets, active: formData.get("active") === "on", updatedAt: now });
  else { const id = crypto.randomUUID(); savedAbilityId = id; data.cardAbilities.push({ id, name, icon: "", description, weight, targets, active: formData.get("active") === "on", deleted: false, createdAt: now, updatedAt: now }); CARD_RARITIES.forEach((rarity) => { cardAbilitySetting(rarity).abilities[id] = { assignmentPercent: 0, rolePercent: 0 }; }); }
  CARD_RARITIES.forEach((rarity) => { const key = CARD_RATE_KEYS[rarity]; const setting = cardAbilitySetting(rarity).abilities[savedAbilityId]; const assignmentValue = formData.get(`modal-${key}-assignment`); const roleValue = formData.get(`modal-${key}-role`); if (assignmentValue !== null) setting.assignmentPercent = Number(assignmentValue); if (roleValue !== null) setting.rolePercent = Number(roleValue); });
  saveData(); render(); toast(existing ? "특수능력을 수정했습니다." : "특수능력을 추가했습니다.");
});

window.addEventListener("load", () => render(), { once: true });
