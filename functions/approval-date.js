const timeZone = "Asia/Seoul";
function dateKey(value) {
  return new Intl.DateTimeFormat("en-CA", {timeZone, year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date(value));
}
function millis(value) {
  return value?.toMillis ? value.toMillis() : Date.parse(value);
}
function approvalWindow(scheduleTime, now = new Date()) {
  const cutoff = new Date(scheduleTime);
  if (!Number.isFinite(cutoff.getTime()) || dateKey(cutoff) !== dateKey(now)) return null;
  const day = dateKey(cutoff);
  const ninePm = Date.parse(`${day}T21:00:00+09:00`);
  if (cutoff.getTime() < ninePm || now.getTime() < ninePm) return null;
  return {day, start: Date.parse(`${day}T00:00:00+09:00`), cutoff: ninePm};
}
function eligibleToday(value, timestampField, window) {
  const time = millis(value[timestampField]);
  return value.date === window.day && time >= window.start && time <= window.cutoff;
}
module.exports = {dateKey, approvalWindow, eligibleToday};
