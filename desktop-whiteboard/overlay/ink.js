export class Ink {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.history = [];
    this.current = null;
    this.surfaces = new Map();
    this.surfaceId = null;
  }
  selectSurface(id) {
    if (id === this.surfaceId) return;
    this.finish();
    if (this.surfaceId !== null) this.surfaces.set(this.surfaceId, this.history);
    this.surfaceId = id;
    this.history = this.surfaces.get(id) || [];
    if (this.ratio) this.redraw();
  }
  resize(width, height, ratio) {
    this.ratio = ratio;
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.redraw();
  }
  begin(point, {tool, color, width}) {
    this.finish();
    this.current = {tool, color, width: tool === 'eraser' ? width * 5 : width, points: [point]};
    this.draw(this.current);
  }
  move(point) {
    if (!this.current) return;
    const previous = this.current.points.at(-1);
    this.current.points.push(point);
    this.draw({...this.current, points: [previous, point]});
  }
  finish() {
    if (this.current) this.history.push(this.current);
    this.current = null;
  }
  undo() { this.finish(); this.history.pop(); this.redraw(); }
  clear() { this.current = null; this.history = []; this.redraw(); }
  draw(stroke) {
    const ctx = this.context;
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const [first, ...rest] = stroke.points;
    if (!first) return;
    ctx.beginPath();
    if (!rest.length) { ctx.arc(first.x, first.y, stroke.width / 2, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.moveTo(first.x, first.y); rest.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke(); }
  }
  redraw() {
    this.context.clearRect(0, 0, this.canvas.width / this.ratio, this.canvas.height / this.ratio);
    this.history.forEach(stroke => this.draw(stroke));
    if (this.current) this.draw(this.current);
  }
}
