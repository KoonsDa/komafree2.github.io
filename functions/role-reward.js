// Mirrors the existing completeRole/cardBonusAward contract; parity-tested against script.js.
const crypto = require("node:crypto");
const CARD_RARITIES = ["일반", "희귀", "영웅", "전설", "고대"];
const DEFAULT_CARD_ABILITY_SETTINGS = {
  일반: { dailyCap: 0, abilities: { academic: { assignmentPercent: 2, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 2 }, balance: { assignmentPercent: 1, rolePercent: 1 } } },
  희귀: { dailyCap: 3, abilities: { academic: { assignmentPercent: 5, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 5 }, balance: { assignmentPercent: 3, rolePercent: 3 } } },
  영웅: { dailyCap: 5, abilities: { academic: { assignmentPercent: 10, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 10 }, balance: { assignmentPercent: 5, rolePercent: 5 } } },
  전설: { dailyCap: 8, abilities: { academic: { assignmentPercent: 15, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 15 }, balance: { assignmentPercent: 8, rolePercent: 8 } } },
  고대: { dailyCap: 10, abilities: { academic: { assignmentPercent: 20, rolePercent: 0 }, responsibility: { assignmentPercent: 0, rolePercent: 20 }, balance: { assignmentPercent: 10, rolePercent: 10 } } }
};
const CARD_ABILITIES = [
  { id: "academic", name: "학문의 힘", icon: "📚", description: "과제" , weight: 1, targets: { assignments: true, roles: false } },
  { id: "responsibility", name: "책임의 힘", icon: "🛡", description: "1인1역", weight: 1, targets: { assignments: false, roles: true } },
  { id: "balance", name: "균형의 힘", icon: "⭐", description: "과제·1인1역", weight: 1, targets: { assignments: true, roles: true } }
];

function roleReward({student, role, config, cards, day, now}) {
  const data = {cards, cardAbilities: config.cardAbilities || CARD_ABILITIES.map(a=>({...a,active:true})), cardAbilitySettings: config.cardAbilitySettings || DEFAULT_CARD_ABILITY_SETTINGS};
  const todayString = () => day;
  const abilityInventory = (student,cardId,rarity) => student.cards?.[cardId]?.[rarity] || {};
  const cardAbilityById = id => data.cardAbilities.find(a=>a.id===id);
  const cardAbilitySetting = rarity => data.cardAbilitySettings[rarity] || DEFAULT_CARD_ABILITY_SETTINGS[rarity];
  const abilityPercent = (rarity,id) => cardAbilityById(id)?.targets?.roles ? Number(cardAbilitySetting(rarity).abilities?.[id]?.rolePercent)||0 : 0;
function representativeCardInfo(student) {
  const equipped = student?.representativeCard; if (!equipped || !CARD_RARITIES.includes(equipped.rarity)) return null;
  const card = data.cards.find((item) => item.id === equipped.cardId); if (!card || Number(abilityInventory(student, card.id, equipped.rarity)[equipped.abilityId]) < 1) return null;
  return { card, rarity: equipped.rarity, abilityId: equipped.abilityId, ability: cardAbilityById(equipped.abilityId), setting: cardAbilitySetting(equipped.rarity) };
}
function historyDateKey(value) { const parts = String(value || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/); return parts ? `${parts[1]}-${parts[2].padStart(2, "0")}-${parts[3].padStart(2, "0")}` : ""; }
function todayCardBonus(student) { return (student.pointHistory || []).reduce((sum, item) => sum + (item.source === "카드 능력 보너스" && historyDateKey(item.date) === todayString() ? Number(item.amount) || 0 : 0), 0); }

function cardBonusAward(student, baseAmount, originalSource, relatedId) {
  const representative = representativeCardInfo(student); if (!representative || !representative.ability?.active || representative.ability?.deleted || baseAmount <= 0) return { amount: 0 };
  const percent = abilityPercent(representative.rarity, representative.abilityId, originalSource); const cap = Number(representative.setting.dailyCap) || 0;
  const amount = Math.max(0, Math.min(Math.round(baseAmount * percent / 100), Math.max(0, cap - todayCardBonus(student))));
  const snapshot = { amount, cardId: representative.card.id, cardName: representative.card.name, rarity: representative.rarity, abilityId: representative.abilityId, abilityName: representative.ability?.name, bonusPercent: percent, dailyCap: cap, originalSource, baseAmount, relatedId };
  return { ...snapshot, historyEntry: amount > 0 ? { id: crypto.randomUUID(), amount, reason: `${representative.card.name} ${representative.ability?.name} 카드 능력 보너스`, source: "카드 능력 보너스", studentId: student.id, representativeCardId: representative.card.id, representativeCardName: representative.card.name, representativeCardRarity: representative.rarity, representativeCardAbilityId: representative.abilityId, representativeCardAbilityName: representative.ability?.name, originalSource, baseAmount, bonusPercent: percent, bonusAmount: amount, relatedId, date: now.toLocaleDateString("ko-KR", {timeZone: "Asia/Seoul"}), createdAt: now.toISOString() } : null };
}

  const baseAmount = Number(role.points)||0;
  const {historyEntry, ...cardAbilityAward} = cardBonusAward(student,baseAmount,"1인1역",role.id);
  const bonusAmount = cardAbilityAward.amount || 0;
  const awardedAt = now.toISOString();
  const date = now.toLocaleDateString("ko-KR",{timeZone:"Asia/Seoul"});
  const entries = baseAmount > 0 ? [{id:crypto.randomUUID(),amount:baseAmount,reason:role.name+" 완료",source:"1인1역",relatedId:role.id,date,createdAt:awardedAt},historyEntry].filter(Boolean).map(e=>({...e,date,createdAt:awardedAt,autoApproved:true})) : [];
  return {pointAward:{awarded:true,amount:baseAmount+bonusAmount,baseAmount,bonusAmount,cardAbilityAward,awardedAt,revokedAt:null,autoApproved:true},entries};
}
module.exports={roleReward};
