const defaults = {width: 420, height: 920};
const minimum = {width: 380, height: 480};
const compact = {width: 280, height: 132};
function fitBounds(bounds, area) {
  const width = Math.min(bounds.width, Math.max(1, area.width - 16));
  const height = Math.min(bounds.height, Math.max(1, area.height - 16));
  return {width, height,
    x: Math.max(area.x + 8, Math.min(bounds.x, area.x + area.width - width - 8)),
    y: Math.max(area.y + 8, Math.min(bounds.y, area.y + area.height - height - 8))};
}
module.exports = {defaults, minimum, compact, fitBounds};
