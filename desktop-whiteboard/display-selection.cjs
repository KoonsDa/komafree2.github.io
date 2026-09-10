// Electron bounds are DIP coordinates. Chromium supplies the canvas pixel ratio.
function createDisplaySelection(screen, overlay, publish) {
  let selectedId = screen.getPrimaryDisplay().id, revision = 0;
  function refresh(requestedId) {
    const displays = screen.getAllDisplays();
    if (!displays.length) return; // A transient topology update must not crash.
    if (requestedId !== undefined) {
      if (!Number.isSafeInteger(requestedId) || !displays.some(d => d.id === requestedId)) throw Error('연결된 모니터를 선택해 주세요.');
      selectedId = requestedId;
    }
    const selected = displays.find(d => d.id === selectedId) ||
      displays.find(d => d.id === screen.getPrimaryDisplay().id) || displays[0];
    selectedId = selected.id;
    overlay.setBounds(selected.bounds);
    publish({displayId: selectedId, displayRevision: ++revision, displays: displays.map(d => ({
      id: d.id, label: typeof d.label === 'string' ? d.label : '',
      bounds: {...d.bounds}, workArea: {...d.workArea}, scaleFactor: d.scaleFactor
    }))});
  }
  const changed = () => refresh();
  const events = ['display-added', 'display-removed', 'display-metrics-changed'];
  events.forEach(event => screen.on(event, changed));
  refresh();
  return {select: id => refresh(id), dispose: () => events.forEach(event => screen.removeListener(event, changed))};
}
module.exports = {createDisplaySelection};
