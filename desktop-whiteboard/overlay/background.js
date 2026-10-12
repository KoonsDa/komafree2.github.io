// All distances use CSS pixels; grid numbers are teaching units, not physical cm.
export function drawBackground(canvas, width, height, ratio, {background = 'desktop', spacing = 48, gridLabels = false}) {
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (background === 'desktop') return;
  ctx.fillStyle = background === 'black' ? '#17212b' : '#ffffff';
  ctx.fillRect(0, 0, width, height);
  if (['white', 'black'].includes(background)) return;
  const size = [24, 48, 72, 96].includes(spacing) ? spacing : 48;
  const line = (x1, y1, x2, y2, color = '#b8d0e6', dash = []) => {
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const margin = size;
  if (background === 'grid' || background === 'dots') {
    const cx = width / 2, cy = height / 2;
    const left = Math.ceil(-cx / size), right = Math.floor(cx / size);
    const bottom = Math.ceil(-cy / size), top = Math.floor(cy / size);
    if (background === 'grid') {
      for (let i = left; i <= right; i++) line(cx + i * size, 0, cx + i * size, height);
      for (let i = bottom; i <= top; i++) line(0, cy - i * size, width, cy - i * size);
    } else {
      ctx.fillStyle = '#88a9c6';
      for (let i = left; i <= right; i++) for (let j = bottom; j <= top; j++) {
        ctx.beginPath(); ctx.arc(cx + i * size, cy - j * size, 1.7, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (gridLabels) {
      line(0, cy, width, cy, '#627e99'); line(cx, 0, cx, height, '#627e99');
      ctx.fillStyle = '#4c6580'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      for (let i = left; i <= right; i++) if (i && cx + i * size > 12 && cx + i * size < width - 12) ctx.fillText(String(i), cx + i * size, cy + 20);
      ctx.textAlign = 'right';
      for (let i = bottom; i <= top; i++) if (i && cy - i * size > 16 && cy - i * size < height - 8) ctx.fillText(String(i), cx - 10, cy - i * size + 5);
      ctx.fillText('0', cx - 10, cy + 20);
    }
  } else if (background === 'music') {
    const gap = size / 4;
    for (let y = margin; y + gap * 4 <= height - margin; y += size * 2) {
      for (let i = 0; i < 5; i++) line(margin, y + gap * i, width - margin, y + gap * i, '#74869b');
    }
  } else if (background === 'english') {
    const gap = size / 3;
    for (let y = margin; y + size <= height - margin; y += size * 2) {
      for (let i = 0; i < 4; i++) line(margin, y + gap * i, width - margin, y + gap * i,
        i === 2 ? '#d7787d' : '#91b9dc', i === 1 ? [5, 5] : []);
    }
  } else if (background === 'korean') {
    for (let y = margin; y + size <= height - margin; y += size * 1.5) {
      const right = margin + Math.floor((width - margin * 2) / size) * size;
      line(margin, y, right, y); line(margin, y + size, right, y + size);
      for (let x = margin; x <= right; x += size) line(x, y, x, y + size);
      line(margin, y + size / 2, right, y + size / 2, '#e0eaf3', [4, 4]);
      for (let x = margin + size / 2; x < right; x += size) line(x, y, x, y + size, '#e0eaf3', [4, 4]);
    }
  }
}
